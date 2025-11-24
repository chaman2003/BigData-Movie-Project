import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Skeleton,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button,
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
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [filterOptions, setFilterOptions] = useState({ languages: [], countries: [], years: [] });
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [filtersError, setFiltersError] = useState(null);
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

  useEffect(() => {
    const loadFilterOptions = async () => {
      setFiltersLoading(true);
      setFiltersError(null);
      try {
        const response = await movieAPI.getFilterOptions();
        setFilterOptions(response.data.data || { languages: [], countries: [], years: [] });
      } catch (optionsError) {
        console.error('Error fetching filter options:', optionsError);
        setFiltersError('Failed to load filter options. Filters may be limited.');
      } finally {
        setFiltersLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

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

    if (selectedLanguage !== 'All') {
      params.movieLanguage = selectedLanguage;
    }

    if (selectedCountry !== 'All') {
      params.movieCountry = selectedCountry;
    }

    if (selectedYear !== 'All') {
      params.year = Number(selectedYear);
    }

    if (minRating > 0) {
      params.minRating = minRating;
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
  }, [debouncedSearch, selectedGenre, selectedLanguage, selectedCountry, selectedYear, minRating]);

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

  const handleResetFilters = () => {
    setSelectedGenre('All');
    setSelectedLanguage('All');
    setSelectedCountry('All');
    setSelectedYear('All');
    setMinRating(0);
  };

  const handleRatingChange = (_, value) => {
    const nextValue = Array.isArray(value) ? value[0] : value;
    setMinRating(nextValue);
  };

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

      {/* Advanced Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Card
          sx={{
            mb: 4,
            background: 'rgba(26, 32, 44, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '18px',
            backdropFilter: 'blur(24px)'
          }}
        >
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Refine Results
              </Typography>
              <Button
                variant="text"
                onClick={handleResetFilters}
                disabled={
                  selectedGenre === 'All' &&
                  selectedLanguage === 'All' &&
                  selectedCountry === 'All' &&
                  selectedYear === 'All' &&
                  minRating === 0
                }
                sx={{ color: '#00d4ff' }}
              >
                Reset Filters
              </Button>
            </Box>

            {filtersError && (
              <Typography variant="body2" color="#ff6384">
                {filtersError}
              </Typography>
            )}

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: 2,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={selectedLanguage}
                  label="Language"
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  disabled={filtersLoading}
                >
                  <MenuItem value="All">All languages</MenuItem>
                  {filterOptions.languages.map((lang) => (
                    <MenuItem key={lang} value={lang}>
                      {lang}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  value={selectedCountry}
                  label="Country"
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  disabled={filtersLoading}
                >
                  <MenuItem value="All">All countries</MenuItem>
                  {filterOptions.countries.map((country) => (
                    <MenuItem key={country} value={country}>
                      {country}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Release Year</InputLabel>
                <Select
                  value={selectedYear}
                  label="Release Year"
                  onChange={(e) => setSelectedYear(e.target.value)}
                  disabled={filtersLoading}
                >
                  <MenuItem value="All">All years</MenuItem>
                  {filterOptions.years.map((yearOption) => (
                    <MenuItem key={yearOption} value={String(yearOption)}>
                      {yearOption}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Minimum Rating: {minRating.toFixed(1)}
                </Typography>
                <Slider
                  value={minRating}
                  onChange={handleRatingChange}
                  min={0}
                  max={10}
                  step={0.5}
                  marks
                  valueLabelDisplay="auto"
                  sx={{
                    color: '#00d4ff',
                    '& .MuiSlider-thumb': {
                      boxShadow: '0 2px 10px rgba(0, 212, 255, 0.4)',
                    }
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
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

      {/* Movies List */}
      {loading ? (
        <Box>
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={120} sx={{ mb: 2, borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)' }} />
          ))}
        </Box>
      ) : (
        <Box>
          {movies.map((movie, index) => (
            <motion.div
              key={movie._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.01 }}
            >
              <Card
                onClick={() => handleMovieClick(movie)}
                sx={{
                  background: 'rgba(26, 32, 44, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  mb: 2,
                  '&:hover': {
                    boxShadow: '0 8px 32px 0 rgba(0, 212, 255, 0.2)',
                    border: '1px solid rgba(0, 212, 255, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: '#fff',
                            mb: 0,
                          }}
                        >
                          {movie.title}
                        </Typography>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 1.2,
                            py: 0.4,
                            borderRadius: '6px',
                            background: 'rgba(255, 170, 0, 0.1)',
                            border: '1px solid rgba(255, 170, 0, 0.3)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <StarIcon sx={{ fontSize: 14, color: '#ffaa00' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#ffaa00' }}>
                            {movie.rating.toFixed(1)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {movie.year}
                        </Typography>
                        {movie.runtime && (
                          <Typography variant="body2" color="text.secondary">
                            {movie.runtime} min
                          </Typography>
                        )}
                        {movie.movieLanguage && (
                          <Chip
                            label={movie.movieLanguage}
                            size="small"
                            sx={{
                              background: 'rgba(0, 212, 255, 0.1)',
                              border: '1px solid rgba(0, 212, 255, 0.3)',
                              color: '#00d4ff',
                              height: 24,
                            }}
                          />
                        )}
                        {movie.movieCountry && (
                          <Chip
                            label={movie.movieCountry}
                            size="small"
                            sx={{
                              background: 'rgba(0, 255, 136, 0.1)',
                              border: '1px solid rgba(0, 255, 136, 0.3)',
                              color: '#00ff88',
                              height: 24,
                            }}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                        {movie.genre && movie.genre.map((g, i) => (
                          <Chip key={i} label={g} size="small" variant="outlined" />
                        ))}
                      </Box>
                      {movie.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, mt: 1 }}>
                          {movie.description.substring(0, 200)}...
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
      )}

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
              </DialogContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Dialog>
    </Box>
  );
};

export default Movies;
