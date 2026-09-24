import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
//useSearchParams is a built-in hook provided by React Router that allows 
// us to read and update query parameters in the URL.
import axios from 'axios';
import {
  getProducts,
  searchProducts,
  getCategories,
  getProductsByCategory,
  deleteProduct,
} from '../api/productApi';
import { parsePageParams, parseSortParam, clampPage } from '../utils/urlParams';
import { useProducts } from '../context/ProductContext';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import ProductTable from '../components/ProductTable';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmModal from '../components/ConfirmModal';
import './Products.css';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { applyOverrides, removeProduct, overrides } = useProducts();
  //useProducts() is a custom hook that gives you access to shared product data/functions from ProductContext.

  // Parse and validate all URL params safely
  const { page, pageSize, search, category, sort } = parsePageParams(searchParams);

  // Local search input — separate from URL so we can debounce before updating URL
  const [searchInput, setSearchInput] = useState(search);

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // AbortController ref — each new fetch cancels the previous one
  const abortControllerRef = useRef(null);
  // Debounce timer ref
  const debounceRef = useRef(null);

  // Helper: update URL params, merging with existing ones
  const updateURL = useCallback((changes) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(changes).forEach(([k, v]) => {
        //if value is null , empty string or undefined, we delete the key from the URL params. 
        // Otherwise, we set the key to the string value.
        if (v === '' || v === null || v === undefined) {
          next.delete(k);
        } else {
          next.set(k, String(v));
        }
      });
      return next;
    });
  }, [setSearchParams]);

  // Fetch categories once on mount
  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  // Keep local search input in sync if URL changes externally (e.g. browser back/forward)
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    // Cancel any in-flight request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError('');

    const { sortBy, order } = parseSortParam(sort);
    const skip = (page - 1) * pageSize;

    try {
      let apiProducts = [];
      let apiTotal = 0;

      if (search && category) {
        // Fetch all search results (DummyJSON max is 100 per request), filter client-side
        //signal:controller.signal :This request is controlled by this AbortController. If the controller aborts, cancel this request."
        const data = await searchProducts({ q: search, limit: 100, skip: 0, sortBy, order, signal: controller.signal });
        const filtered = data.products.filter((p) => p.category === category);
        apiTotal = filtered.length;
        apiProducts = filtered.slice(skip, skip + pageSize);

      } else if (search) {
        // Search only
        // //signal:controller.signal :This request is controlled by this AbortController. If the controller aborts, cancel this request."
        const data = await searchProducts({ q: search, limit: pageSize, skip, sortBy, order, signal: controller.signal });
        apiProducts = data.products;
        apiTotal = data.total;

      } else if (category) {
        // Category only
        const data = await getProductsByCategory(category, { limit: pageSize, skip, sortBy, order });
        apiProducts = data.products;
        apiTotal = data.total;

      } else {
        // No filters — show all products
        const data = await getProducts({ limit: pageSize, skip, sortBy, order });
        apiProducts = data.products;
        apiTotal = data.total;
      }

      // Apply local CRUD overrides (prepend added products only on page 1, no filters)
      const isFirstPageNoFilter = page === 1 && !search && !category;
      const overridden = applyOverrides(apiProducts, { prependAdded: isFirstPageNoFilter });

      // Adjust total to include locally added products on the first page
      const addedCount = isFirstPageNoFilter
        ? overrides.addedProducts.filter((p) => !overrides.deletedIds.includes(p.id)).length
        : 0;

      const finalTotal = apiTotal + addedCount;

      setProducts(overridden);
      setTotal(finalTotal);

      // If page is beyond last valid page, correct the URL
      if (apiTotal > 0) {
        const corrected = clampPage(page, apiTotal, pageSize);
        if (corrected !== page) {
          updateURL({ page: corrected });
        }
      }
    } catch (err) {
      // Aborted/cancelled requests are not errors — ignore silently
      if (axios.isCancel(err) || err.name === 'CanceledError') return;
      setError(err.message || 'Something went wrong while loading products.');
    } finally {
      // Only clear loading if this controller is still the active one
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [page, pageSize, search, category, sort, applyOverrides, overrides, updateURL]);

  // Fetch whenever URL params change
  useEffect(() => {
    fetchProducts();
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchProducts]);

  // Handle search input with 400ms debounce
  const handleSearchChange = (value) => {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateURL({ search: value, page: 1 });
    }, 400);
  };

  const handleCategoryChange = (e) => updateURL({ category: e.target.value, page: 1 });
  const handleSortChange = (e) => updateURL({ sort: e.target.value, page: 1 });
  const handlePageChange = (newPage) => updateURL({ page: newPage });
  const handlePageSizeChange = (newSize) => updateURL({ pageSize: newSize, page: 1 });

  // --- Delete flow ---
  const handleDeleteClick = (product) => setDeleteTarget(product);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      const isLocal = overrides.addedProducts.some((p) => p.id === deleteTarget.id);
      if (!isLocal) {
        // Only call the API for real products
        await deleteProduct(deleteTarget.id);
      }
      removeProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setTotal((prev) => Math.max(0, prev - 1));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) setDeleteTarget(null);
  };

  return (
    <div className="products-page">
      <Navbar />

      <main className="products-main">
        {/* ── Toolbar ── */}
        <div className="products-toolbar">
          <div className="toolbar-left">
            <SearchBar value={searchInput} onChange={handleSearchChange} />
          </div>
          <div className="toolbar-right">
            <select
              className="filter-select"
              value={category}
              onChange={handleCategoryChange}
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.slug || cat} value={cat.slug || cat}>
                  {cat.name || cat}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={sort}
              onChange={handleSortChange}
              aria-label="Sort products"
            >
              <option value="">Default Sort</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating-asc">Rating: Low → High</option>
              <option value="rating-desc">Rating: High → Low</option>
              <option value="title-asc">Title: A → Z</option>
              <option value="title-desc">Title: Z → A</option>
            </select>

            <Link to="/products/new" className="btn btn-primary">
              + Add Product
            </Link>
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <Loader text="Loading products..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchProducts} />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>🔍 No products found.</p>
            {(search || category) && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearchInput('');
                  updateURL({ search: '', category: '', page: 1 });
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop: table */}
            <div className="desktop-view">
              <ProductTable products={products} onDelete={handleDeleteClick} />
            </div>

            {/* Mobile: cards grid */}
            <div className="mobile-view">
              <div className="cards-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} onDelete={handleDeleteClick} />
                ))}
              </div>
            </div>

            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </main>

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <ConfirmModal
          message={`Are you sure you want to delete "${deleteTarget.title}"?`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default Products;
