import axios from 'axios';

const PROD_BACKEND = 'https://bigdata-movie-backend.vercel.app';

const buildApiUrl = (inputUrl) => {
  if (!inputUrl) return null;

  let url = inputUrl.trim();
  if (!url) return null;

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  url = url.replace(/\/$/, '');
  url = url.replace(/\/movies$/, '');
  url = url.replace(/\/api$/, '');

  return `${url}/api`;
};

const resolveBaseUrl = () => {
  const fromEnv = buildApiUrl(process.env.REACT_APP_API_URL);
  if (fromEnv) {
    return { url: fromEnv, source: 'env' };
  }

  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return { url: buildApiUrl(window.location.origin), source: 'same-origin' };
  }

  const fallbackTarget = process.env.NODE_ENV === 'production' ? PROD_BACKEND : 'http://localhost:5000';
  return { url: buildApiUrl(fallbackTarget), source: 'fallback' };
};

const { url: API_URL, source: API_SOURCE } = resolveBaseUrl();
console.log('🔌 API Configuration:', {
  raw: process.env.REACT_APP_API_URL,
  computed: API_URL,
  source: API_SOURCE
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
