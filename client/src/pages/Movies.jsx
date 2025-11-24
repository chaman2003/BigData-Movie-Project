import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Skeleton,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import { movieAPI } from '../services/api';
import useDebounce from '../hooks/useDebounce';

const genres = ['All', 'Action', 'Drama', 'Comedy', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Crime', 'Adventure', 'Animation'];

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadMoreRef = useRef(null);
  const abortControllerRef = useRef(null);
  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const fetchMovies = useCallback(async ({ reset = false } = {}) => {
    if (isFetchingRef.current) return;
    if (!hasMoreRef.current && !reset) return;

    if (reset) {
      setLoading(true);
      pageRef.current = 1;
      setError(null);
    }

    isFetchingRef.current = true;
    setIsFetching(true);
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const currentPage = pageRef.current;
    const params = {
      page: currentPage,
      limit: 24,
      sortBy: '-rating',
    };

    if (selectedGenre !== 'All') {
      params.genre = selectedGenre;
    }

    const trimmedSearch = debouncedSearch.trim();
    if (trimmedSearch) {
      params.search = trimmedSearch;
    }

    try {
      const response = await movieAPI.getAllMovies(params, { signal: controller.signal });
      const { data: fetchedMovies, meta } = response.data;

      setMovies((prev) => (reset ? fetchedMovies : [...prev, ...fetchedMovies]));

      if (meta?.total !== undefined) {
        setTotalCount(meta.total);
        setHasMore(meta.hasMore);
        hasMoreRef.current = meta.hasMore;
        pageRef.current = meta.page + 1;
      } else {
        setTotalCount((prevCount) => (reset ? fetchedMovies.length : prevCount + fetchedMovies.length));
        const nextHasMore = fetchedMovies.length > 0;
        setHasMore(nextHasMore);
        hasMoreRef.current = nextHasMore;
        pageRef.current = currentPage + 1;
      }
    } catch (fetchError) {
      if (fetchError.code === 'ERR_CANCELED') return;
      
      const status = fetchError.response?.status;
      const url = fetchError.config?.url;
      let msg = 'Failed to load movies. Please try again.';
      
      if (status === 404) {
        msg = `API Endpoint not found (404). Checked: ${url}`;
      } else if (fetchError.message) {
        msg = fetchError.message;
      }
      
      setError(msg);
      console.error('Error fetching movies:', fetchError);
    } finally {
      setLoading(false);
      setIsFetching(false);
      isFetchingRef.current = false;
    }
  }, [debouncedSearch, selectedGenre]);

  useEffect(() => {
    setMovies([]);
    setTotalCount(0);
    setHasMore(true);
    hasMoreRef.current = true;
    pageRef.current = 1;
    fetchMovies({ reset: true });
  }, [fetchMovies]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !isFetching && hasMore) {
          fetchMovies();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [fetchMovies, hasMore, isFetching, loading]);

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedMovie(null), 300);
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 1,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Movie Collection
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Explore {totalCount || movies.length} amazing movies
        </Typography>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <TextField
          fullWidth
          placeholder="Search movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          type="search"
          autoComplete="off"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#00d4ff' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {isFetching && !loading && (
                  <CircularProgress size={20} sx={{ color: '#00d4ff' }} />
                )}
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
      </motion.div>

      {/* Genre Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Box sx={{ mb: 4, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {genres.map((genre, index) => (
            <motion.div
              key={genre}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Chip
                label={genre}
                onClick={() => setSelectedGenre(genre)}
                sx={{
                  background:
                    selectedGenre === genre
                      ? 'linear-gradient(135deg, #00d4ff 0%, #0080ff 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                  border:
                    selectedGenre === genre
                      ? '1px solid rgba(0, 212, 255, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                  color: selectedGenre === genre ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                  fontWeight: selectedGenre === genre ? 600 : 500,
                  px: 2,
                  py: 2.5,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  '&:hover': {
                    background:
                      selectedGenre === genre
                        ? 'linear-gradient(135deg, #00e4ff 0%, #0090ff 100%)'
                        : 'rgba(0, 212, 255, 0.1)',
                  },
                }}
              />
            </motion.div>
          ))}
        </Box>
      </motion.div>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {movies.length} / {totalCount || movies.length} titles
        </Typography>
        {debouncedSearch && (
          <Typography variant="body2" color="text.secondary">
            Search: "{debouncedSearch}"
          </Typography>
        )}
      </Box>

      {error && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: '16px',
            border: '1px solid rgba(255, 99, 132, 0.3)',
            background: 'rgba(255, 99, 132, 0.08)'
          }}
        >
          <Typography variant="body2" color="#ff6384">
            {error}
          </Typography>
        </Box>
      )}

      {/* Movies Grid */}
      <Grid container spacing={3}>
        {loading ? (
          Array.from({ length: 12 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${index}`}>
              <Skeleton
                variant="rounded"
                height={360}
                sx={{
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.05)'
                }}
              />
            </Grid>
          ))
        ) : (
          <AnimatePresence>
            {movies.map((movie, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={movie._id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  style={{ height: '100%' }}
                >
                  <Card
                    onClick={() => handleMovieClick(movie)}
                    sx={{
                      height: '100%',
                      background: 'rgba(26, 32, 44, 0.6)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 12px 48px 0 rgba(0, 212, 255, 0.3)',
                        border: '1px solid rgba(0, 212, 255, 0.5)',
                        '& .movie-poster': {
                          transform: 'scale(1.1)',
                        },
                      },
                    }}
                  >
                    <Box sx={{ position: 'relative', paddingTop: '150%', overflow: 'hidden' }}>
                      <CardMedia
                        component="img"
                        image={movie.posterUrl}
                        alt={movie.title}
                        className="movie-poster"
                        loading="lazy"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '8px',
                          background: 'rgba(0, 0, 0, 0.7)',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <StarIcon sx={{ fontSize: 16, color: '#ffaa00' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#ffaa00' }}>
                          {movie.rating.toFixed(1)}
                        </Typography>
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: '3.6em',
                        }}
                      >
                        {movie.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {movie.year}
                        </Typography>
                        {movie.movieLanguage && (
                          <>
                            <Typography variant="body2" color="text.secondary">•</Typography>
                            <Typography variant="body2" color="#00d4ff" sx={{ fontSize: '0.85rem' }}>
                              {movie.movieLanguage}
                            </Typography>
                          </>
                        )}
                        {movie.movieCountry && (
                          <>
                            <Typography variant="body2" color="text.secondary">•</Typography>
                            <Typography variant="body2" color="rgba(255, 255, 255, 0.5)" sx={{ fontSize: '0.85rem' }}>
                              {movie.movieCountry}
                            </Typography>
                          </>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {movie.genre.slice(0, 2).map((g, i) => (
                          <Chip key={i} label={g} size="small" />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        )}
      </Grid>

      {!loading && movies.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary">
            No movies found
          </Typography>
        </Box>
      )}

      {isFetching && !loading && movies.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={32} sx={{ color: '#00d4ff' }} />
        </Box>
      )}

      {!hasMore && !loading && movies.length > 0 && (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body2" color="text.secondary">
            You&apos;re all caught up
          </Typography>
        </Box>
      )}

      <Box ref={loadMoreRef} sx={{ height: 1 }} />

      {/* Movie Detail Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(26, 32, 44, 0.95)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '24px',
            boxShadow: '0 24px 64px rgba(0, 212, 255, 0.2)',
          },
        }}
      >
        <AnimatePresence>
          {selectedMovie && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {selectedMovie.title}
                  </Typography>
                  <IconButton onClick={handleCloseModal} sx={{ color: '#00d4ff' }}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <motion.img
                      src={selectedMovie.posterUrl}
                      alt={selectedMovie.title}
                      style={{
                        width: '100%',
                        borderRadius: '16px',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                      }}
                      whileHover={{ scale: 1.02 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon sx={{ color: '#ffaa00', fontSize: 28 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffaa00' }}>
                          {selectedMovie.rating.toFixed(1)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          / 10
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarTodayIcon sx={{ fontSize: 20, color: '#00d4ff' }} />
                          <Typography variant="body1">{selectedMovie.year}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 20, color: '#00d4ff' }} />
                          <Typography variant="body1">{selectedMovie.runtime} min</Typography>
                        </Box>
                        {selectedMovie.movieLanguage && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ color: '#00d4ff' }}>🌐</Typography>
                            <Typography variant="body1">{selectedMovie.movieLanguage}</Typography>
                          </Box>
                        )}
                        {selectedMovie.movieCountry && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ color: '#00d4ff' }}>📍</Typography>
                            <Typography variant="body1">{selectedMovie.movieCountry}</Typography>
                          </Box>
                        )}
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          Genres
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {selectedMovie.genre.map((g, i) => (
                            <Chip key={i} label={g} />
                          ))}
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          Director
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon sx={{ fontSize: 20, color: '#00d4ff' }} />
                          <Typography variant="body1">{selectedMovie.director}</Typography>
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          Cast
                        </Typography>
                        <Typography variant="body2">
                          {selectedMovie.cast.length > 0
                            ? selectedMovie.cast.join(', ')
                            : 'Not available'}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          Description
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                          {selectedMovie.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </DialogContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Dialog>
    </Box>
  );
};

export default Movies;
