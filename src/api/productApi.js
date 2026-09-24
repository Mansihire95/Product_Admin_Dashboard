import axiosInstance from './axios';

export const getProducts = async ({ limit = 10, skip = 0, sortBy, order } = {}) => {
  const params = { limit, skip };
  if (sortBy) params.sortBy = sortBy;
  if (order) params.order = order;
  const response = await axiosInstance.get('/products', { params });
  return response.data; // { products, total, skip, limit }
};

// signal is an AbortController signal used to cancel stale requests
export const searchProducts = async ({ q, limit = 10, skip = 0, sortBy, order, signal } = {}) => {
  const params = { q, limit, skip };
  if (sortBy) params.sortBy = sortBy;
  if (order) params.order = order;
  const response = await axiosInstance.get('/products/search', { params, signal });
  return response.data;
};

export const getCategories = async () => {
  const response = await axiosInstance.get('/products/categories');
  return response.data; // array of category objects: { slug, name, url }
};

export const getProductsByCategory = async (category, { limit = 10, skip = 0, sortBy, order } = {}) => {
  const params = { limit, skip };
  if (sortBy) params.sortBy = sortBy;
  if (order) params.order = order;
  const response = await axiosInstance.get(`/products/category/${category}`, { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await axiosInstance.get(`/products/${id}`);
  return response.data;
};

export const addProduct = async (productData) => {
  const response = await axiosInstance.post('/products/add', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axiosInstance.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data;
};
