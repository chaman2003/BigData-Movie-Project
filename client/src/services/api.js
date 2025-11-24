import axios from 'axios';

const rawBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = rawBaseUrl.endsWith('/api')
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
