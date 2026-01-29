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
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token added to request:', config.url);
      } else {
        console.log('ℹ️ No token found for request:', config.url);
      }
    } catch (error) {
      console.error('❌ Error accessing localStorage in interceptor:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    // Handle 401 errors globally
    if (error.response?.status === 401) {
      console.log('🔓 Unauthorized - clearing auth data');
      try {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminAuth');
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Public API
export const publicAPI = {
  getServices: () => apiClient.get('/services'),
  getSaasProducts: () => apiClient.get('/saas-products'),
  getAboutContent: () => apiClient.get('/about'),
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
  updateContact: (id, data) => apiClient.put(`/admin/contacts/${id}`, data),
  deleteContact: (id) => apiClient.delete(`/admin/contacts/${id}`),
  
  // Services
  createService: (data) => apiClient.post('/admin/services', data),
  updateService: (id, data) => apiClient.put(`/admin/services/${id}`, data),
  deleteService: (id) => apiClient.delete(`/admin/services/${id}`),
  
  // SaaS Products
  createSaasProduct: (data) => apiClient.post('/admin/saas-products', data),
  updateSaasProduct: (id, data) => apiClient.put(`/admin/saas-products/${id}`, data),
  deleteSaasProduct: (id) => apiClient.delete(`/admin/saas-products/${id}`),
  
  // About Content
  updateAboutContent: (data) => apiClient.put('/admin/about', data),
  
  // Social Media Integrations
  getSocialIntegrations: () => apiClient.get('/admin/social-integrations'),
  updateSocialIntegrations: (data) => apiClient.put('/admin/social-integrations', data),
  
  // Chat Sessions (Admin)
  getChatSessions: () => apiClient.get('/admin/chat-sessions'),
  getChatSession: (id) => apiClient.get(`/admin/chat-sessions/${id}`),
  deleteChatSession: (id) => apiClient.delete(`/admin/chat-sessions/${id}`)
};

// Chatbot API (Public)
export const chatAPI = {
  sendMessage: (data) => apiClient.post('/chat/message', data)
};

export default apiClient;