import axios from 'axios';

// Helper to construct the base URL intelligently
const getBaseUrl = () => {
  // Default to the production backend if env var is missing
  let url = process.env.REACT_APP_API_URL || 'https://bigdata-movie-backend.vercel.app';
  
  // Remove trailing slash
  url = url.replace(/\/$/, '');
  
  // Remove /movies suffix if user accidentally included it
  url = url.replace(/\/movies$/, '');
  
  // Remove /api suffix if present (we'll add it back to be consistent)
  url = url.replace(/\/api$/, '');
  
  return `${url}/api`;
};

const API_URL = getBaseUrl();
console.log('🔌 API Configuration:', {
  raw: process.env.REACT_APP_API_URL,
  computed: API_URL
});

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Call Failed:', {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullUrl: `${error.config?.baseURL}${error.config?.url}`,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Movies API
export const movieAPI = {
  getAllMovies: (params = {}, config = {}) => api.get('/movies', { params, ...config }),
  getMovie: (id, config = {}) => api.get(`/movies/${id}`, config),
  getAnalytics: (params = {}, config = {}) => api.get('/movies/analytics/stats', { params, ...config }),
  getRecommendations: (params = {}, config = {}) => api.get('/movies/recommendations', { params, ...config }),
  getFilterOptions: (config = {}) => api.get('/movies/filters/options', config),
  createMovie: (data, config = {}) => api.post('/movies', data, config),
  updateMovie: (id, data, config = {}) => api.put(`/movies/${id}`, data, config),
  deleteMovie: (id, config = {}) => api.delete(`/movies/${id}`, config),
};

export default api;
