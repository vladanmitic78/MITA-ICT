import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${API_URL}/api`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Public API
export const publicAPI = {
  getServices: () => apiClient.get('/services'),
  getSaasProducts: () => apiClient.get('/saas-products'),
  submitContact: (data) => apiClient.post('/contact', data)
};

// Admin Auth API
export const authAPI = {
  login: (credentials) => apiClient.post('/admin/login', credentials),
  googleLogin: () => apiClient.post('/admin/google-login'),
  logout: () => apiClient.post('/admin/logout')
};

// Admin API
export const adminAPI = {
  // Admin API
  changePassword: (data) => apiClient.post('/admin/change-password', data),
  
  // Contacts
  getContacts: () => apiClient.get('/admin/contacts'),
  
  // Services
  createService: (data) => apiClient.post('/admin/services', data),
  updateService: (id, data) => apiClient.put(`/admin/services/${id}`, data),
  deleteService: (id) => apiClient.delete(`/admin/services/${id}`),
  
  // SaaS Products
  createSaasProduct: (data) => apiClient.post('/admin/saas-products', data),
  updateSaasProduct: (id, data) => apiClient.put(`/admin/saas-products/${id}`, data),
  deleteSaasProduct: (id) => apiClient.delete(`/admin/saas-products/${id}`)
};

export default apiClient;