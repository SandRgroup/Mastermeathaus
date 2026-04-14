import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true
});

// Products
export const getProducts = () => api.get('/products');
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Memberships
export const getMemberships = () => api.get('/memberships');
export const createMembership = (data) => api.post('/memberships', data);
export const updateMembership = (id, data) => api.put(`/memberships/${id}`, data);
export const deleteMembership = (id) => api.delete(`/memberships/${id}`);

export default api;
