import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, deleteProduct } from '../api/productApi';
import { useProducts } from '../context/ProductContext';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmModal from '../components/ConfirmModal';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();// useparams give sthe id from url
  const navigate = useNavigate();
  const { overrides, removeProduct } = useProducts();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const fetchProduct = async () => {
    setLoading(true);
    setError('');
    setNotFound(false);
    try {
      // Check local overrides first (for locally added products)
      const localAdded = overrides.addedProducts.find((p) => String(p.id) === String(id));
      if (localAdded) {
        setProduct(localAdded);
        setLoading(false);
        return;
      }

       //alls API and gets product using the ID.
      const data = await getProductById(id);

      // Check if this product was deleted locally
      if (overrides.deletedIds.includes(data.id)) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Apply any local edits
      const edited = overrides.editedProducts[data.id];
      //If edited product exists → use it.
     //  Otherwise → use API product.
      setProduct(edited || data);
      } catch (err) {
      if (err.message.includes('404') || err.message.toLowerCase().includes('not found')) {
        setNotFound(true);
      } else {
        setError(err.message || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  //When the page loads, call fetchProduct().
  useEffect(() => {
    fetchProduct();
  }, [id]);
  //Run this effect when the component first loads AND whenever id changes.

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const isLocal = overrides.addedProducts.some((p) => String(p.id) === String(id));
      if (!isLocal) {
        // Only call the API for real products; local products don't exist on DummyJSON
        await deleteProduct(id);
      }
      removeProduct(isLocal ? product.id : Number(id));
      navigate('/products', { replace: true });
    } catch (err) {
      alert(err.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }

  };

  if (loading) return <><Navbar /><Loader text="Loading product..." /></>;

  if (notFound) {
    return (
      <>
        <Navbar />
        <div className="not-found-product">
          <div className="nf-icon">📦</div>
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist or has been deleted.</p>
          <Link to="/products" className="btn btn-primary">← Back to Products</Link>
        </div>
      </>
    );
  }

  if (error) {
    return <><Navbar /><ErrorMessage message={error} onRetry={fetchProduct} /></>;
  }

  const images = product.images?.length ? product.images : product.thumbnail ? [product.thumbnail] : [];

  return (
    <div className="product-details-page">
      <Navbar />
      <main className="details-main">
        <div className="details-breadcrumb">
          <Link to="/products">Products</Link> / {product.title}
        </div>

        <div className="details-grid">
          {/* Images */}
          <div className="details-images">
            <div className="main-image-wrap">
              {images.length > 0 ? (
                <img
                  src={images[activeImage] || images[0]}
                  alt={product.title}
                  className="main-image"
                  onError={(e) => (e.target.src = images[0])}
                />
              ) : (
                <div className="image-placeholder-lg">No Image</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="thumbnail-strip">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`view ${i + 1}`}
                    className={`thumb ${i === activeImage ? 'active-thumb' : ''}`}
                    onClick={() => setActiveImage(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="details-info">
            <span className="details-category">{product.category}</span>
            <h1 className="details-title">{product.title}</h1>
            <p className="details-description">{product.description}</p>

            <div className="details-meta">
              <div className="meta-item">
                <span className="meta-label">Price</span>
                <span className="meta-value price">${Number(product.price).toFixed(2)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Rating</span>
                <span className="meta-value">⭐ {Number(product.rating).toFixed(1)} / 5</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Stock</span>
                <span className={`meta-value ${product.stock < 10 ? 'low-stock' : ''}`}>
                  {product.stock} units
                </span>
              </div>
              {product.brand && (
                <div className="meta-item">
                  <span className="meta-label">Brand</span>
                  <span className="meta-value">{product.brand}</span>
                </div>
              )}
            </div>

            <div className="details-actions">
              <Link to={`/products/${product.id}/edit`} className="btn btn-primary">
                ✏️ Edit Product
              </Link>
              <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
                🗑️ Delete
              </button>
              <Link to="/products" className="btn btn-secondary">
                ← Back
              </Link>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {product.reviews?.length > 0 && (
          <section className="reviews-section">
            <h2 className="reviews-title">Customer Reviews</h2>
            <div className="reviews-list">
              {product.reviews.map((review, i) => (
                <div key={i} className="review-card">
                  <div className="review-header">
                    <strong>{review.reviewerName}</strong>
                    <span className="review-rating">⭐ {review.rating}</span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  <span className="review-date">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {showDeleteModal && (
        <ConfirmModal
          message={`Are you sure you want to delete "${product.title}"?`}
          onConfirm={handleDelete}
          onCancel={() => !isDeleting && setShowDeleteModal(false)}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default ProductDetails;
