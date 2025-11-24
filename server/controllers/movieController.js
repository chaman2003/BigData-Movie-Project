import Movie from '../models/Movie.js';

// @desc    Get all movies with optional filters
// @route   GET /api/movies
export const getMovies = async (req, res) => {
  try {
    const {
      genre,
      search,
      sortBy = '-rating',
      limit = 36,
      page = 1,
      movieLanguage,
      movieCountry,
      year,
      minRating
    } = req.query;

    const numericLimit = Math.max(1, Math.min(parseInt(limit, 10) || 36, 100));
    const numericPage = Math.max(1, parseInt(page, 10) || 1);
    const skip = (numericPage - 1) * numericLimit;

    const query = {};

    if (genre && genre !== 'All') {
      query.genre = genre;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (movieLanguage && movieLanguage !== 'All') {
      query.movieLanguage = movieLanguage;
    }

    if (movieCountry && movieCountry !== 'All') {
      query.movieCountry = movieCountry;
    }

    if (year) {
      query.year = parseInt(year, 10);
    }

    if (minRating !== undefined) {
      const ratingFloor = parseFloat(minRating);
      if (!Number.isNaN(ratingFloor)) {
        query.rating = { $gte: ratingFloor };
      }
    }

    const [movies, total] = await Promise.all([
      Movie.find(query)
        .sort(sortBy)
        .skip(skip)
        .limit(numericLimit)
        .lean(),
      Movie.countDocuments(query)
    ]);

    const totalPages = Math.max(1, Math.ceil(total / numericLimit));
    const hasMore = numericPage < totalPages;

    res.json({
      success: true,
      count: movies.length,
      data: movies,
      meta: {
        total,
        totalPages,
        page: numericPage,
        limit: numericLimit,
        hasMore
      }
    });
  } catch (error) {
    console.error('❌ Error in getMovies:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get single movie
// @route   GET /api/movies/:id
export const getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }
    
    res.json({
      success: true,
      data: movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get movie analytics
// @route   GET /api/movies/analytics/stats
export const getAnalytics = async (req, res) => {
  try {
    const { genre, movieLanguage, movieCountry, year, minRating } = req.query;
    
    // Build filter query
    let filterQuery = {};
    if (genre && genre !== 'All') filterQuery.genre = genre;
    if (movieLanguage && movieLanguage !== 'All') filterQuery.movieLanguage = movieLanguage;
    if (movieCountry && movieCountry !== 'All') filterQuery.movieCountry = movieCountry;
    if (year) filterQuery.year = parseInt(year);
    if (minRating) filterQuery.rating = { $gte: parseFloat(minRating) };
    
    // Total movies
    const totalMovies = await Movie.countDocuments(filterQuery);
    
    // Average rating
    const avgRatingResult = await Movie.aggregate([
      { $match: filterQuery },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' }
        }
      }
    ]);
    const avgRating = avgRatingResult[0]?.avgRating || 0;
    
    // Top genre
    const genreStats = await Movie.aggregate([
      { $match: filterQuery },
      { $unwind: '$genre' },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const topGenre = genreStats[0] || { _id: 'N/A', count: 0 };
    
    // Movies per year
    const moviesPerYear = await Movie.aggregate([
      { $match: filterQuery },
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Movies per genre
    const moviesPerGenre = await Movie.aggregate([
      { $match: filterQuery },
      { $unwind: '$genre' },
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Movies per language
    const moviesPerLanguage = await Movie.aggregate([
      { $match: filterQuery },
      {
        $group: {
          _id: '$movieLanguage',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Movies per country
    const moviesPerCountry = await Movie.aggregate([
      { $match: filterQuery },
      {
        $group: {
          _id: '$movieCountry',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Rating distribution
    const ratingDistribution = await Movie.aggregate([
      { $match: filterQuery },
      {
        $bucket: {
          groupBy: '$rating',
          boundaries: [0, 2, 4, 6, 7, 8, 9, 10],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);
    
    // Top rated movies
    const topRatedMovies = await Movie.find(filterQuery)
      .sort('-rating')
      .limit(10)
      .select('title rating year genre posterUrl movieLanguage movieCountry')
      .lean();
    
    res.json({
      success: true,
      data: {
        totalMovies,
        avgRating: parseFloat(avgRating.toFixed(2)),
        topGenre: {
          name: topGenre._id,
          count: topGenre.count
        },
        moviesPerYear,
        moviesPerGenre,
        moviesPerLanguage,
        moviesPerCountry,
        ratingDistribution,
        topRatedMovies
      }
    });
  } catch (error) {
    console.error('❌ Error in getAnalytics:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get recommendations
// @route   GET /api/movies/recommendations
export const getRecommendations = async (req, res) => {
  try {
    const { genre, minRating = 7 } = req.query;
    
    let query = { rating: { $gte: parseFloat(minRating) } };
    
    if (genre && genre !== 'All') {
      query.genre = genre;
    }
    
    const recommendations = await Movie.find(query)
      .sort('-rating')
      .limit(20)
      .lean();
    
    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    console.error('❌ Error in getRecommendations:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Create new movie
// @route   POST /api/movies
export const createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    
    res.status(201).json({
      success: true,
      data: movie
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
export const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }
    
    res.json({
      success: true,
      data: movie
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get filter options (languages, countries, years)
// @route   GET /api/movies/filters/options
export const getFilterOptions = async (req, res) => {
  try {
    const [languages, countries, years] = await Promise.all([
      Movie.distinct('movieLanguage'),
      Movie.distinct('movieCountry'),
      Movie.distinct('year')
    ]);
    
    res.json({
      success: true,
      data: {
        languages: languages.filter(Boolean).sort(),
        countries: countries.filter(Boolean).sort(),
        years: years.filter(Boolean).sort((a, b) => b - a)
      }
    });
  } catch (error) {
    console.error('❌ Error in getFilterOptions:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
