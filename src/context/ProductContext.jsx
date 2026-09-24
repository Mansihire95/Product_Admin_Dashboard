import { createContext, useContext, useState, useEffect } from 'react';

/**
 * ProductContext manages frontend-only CRUD overrides.
 *
 * DummyJSON does not permanently save changes, so we track:
 *  - addedProducts  : new products created this session
 *  - editedProducts : map of id → updated product data
 *  - deletedIds     : IDs of deleted products
 *
 * Everything is persisted to localStorage so changes survive page refresh.
 */
const ProductContext = createContext(null);

const STORAGE_KEY = 'product_overrides';

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { addedProducts: [], editedProducts: {}, deletedIds: [] };
    return JSON.parse(raw);
  } catch {
    return { addedProducts: [], editedProducts: {}, deletedIds: [] };
  }
};

export const ProductProvider = ({ children }) => {
  const [overrides, setOverrides] = useState(loadFromStorage);

  // Persist to localStorage whenever overrides change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }, [overrides]);

  const addProduct = (product) => {
    setOverrides((prev) => ({
      ...prev,
      addedProducts: [product, ...prev.addedProducts],
    }));
  };

  const editProduct = (updatedProduct) => {
    setOverrides((prev) => ({
      ...prev,
      editedProducts: {
        ...prev.editedProducts,
        [updatedProduct.id]: updatedProduct,
      },
    }));
  };

  const removeProduct = (id) => {
    setOverrides((prev) => ({
      ...prev,
      addedProducts: prev.addedProducts.filter((p) => p.id !== id),
      deletedIds: prev.deletedIds.includes(id) ? prev.deletedIds : [...prev.deletedIds, id],
    }));
  };

  // Returns true if this product was created locally (not from the real API)
  const isLocalProduct = (id) => {
    return overrides.addedProducts.some((p) => String(p.id) === String(id));
  };

  /**
   * Apply overrides on top of products fetched from the API:
   * 1. Filter out deleted IDs
   * 2. Replace with edited version where applicable
   * 3. Prepend locally added products (only on page 1 with no filters active)
   */
  const applyOverrides = (apiProducts, { prependAdded = false } = {}) => {
    let result = apiProducts
      .filter((p) => !overrides.deletedIds.includes(p.id))
      .map((p) => overrides.editedProducts[p.id] || p);

    if (prependAdded) {
      const liveAdded = overrides.addedProducts.filter(
        (p) => !overrides.deletedIds.includes(p.id)
      );
      const apiIds = new Set(result.map((p) => p.id));
      const uniqueAdded = liveAdded.filter((p) => !apiIds.has(p.id));
      result = [...uniqueAdded, ...result];
    }

    return result;
  };

  return (
    <ProductContext.Provider
      value={{ overrides, addProduct, editProduct, removeProduct, applyOverrides, isLocalProduct }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used inside <ProductProvider>');
  return ctx;
};
