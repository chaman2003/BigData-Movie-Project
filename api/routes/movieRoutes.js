import express from 'express';
import {
  getMovies,
  getMovie,
  getAnalytics,
  getRecommendations,
  createMovie,
  updateMovie,
  deleteMovie,
  getFilterOptions
} from '../controllers/movieController.js';

const router = express.Router();

router.get('/analytics/stats', getAnalytics);
router.get('/recommendations', getRecommendations);
router.get('/filters/options', getFilterOptions);
router.route('/').get(getMovies).post(createMovie);
router.route('/:id').get(getMovie).put(updateMovie).delete(deleteMovie);

export default router;
