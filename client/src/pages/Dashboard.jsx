import React, { useEffect, useRef, useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import MovieIcon from '@mui/icons-material/Movie';
import StarIcon from '@mui/icons-material/Star';
import FilterListIcon from '@mui/icons-material/FilterList';
import TimelineIcon from '@mui/icons-material/Timeline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StatCard from '../components/StatCard';
import AnimatedBarChart from '../charts/AnimatedBarChart';
import AnimatedPieChart from '../charts/AnimatedPieChart';
import AnimatedAreaChart from '../charts/AnimatedAreaChart';
import AnimatedRadarChart from '../charts/AnimatedRadarChart';
import { movieAPI } from '../services/api';

const MotionTableRow = motion(TableRow);

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [topMovies, setTopMovies] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ languages: [], countries: [], years: [] });
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const abortControllerRef = useRef(null);
  
  // Filters
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const ratingMarks = [0, 2, 4, 6, 7, 8, 9, 10].map((value) => ({
    value,
    label: `${value}★`,
  }));

  const handleChartSelection = (type, value) => {
    if (value === undefined || value === null) return;

    switch (type) {
      case 'language': {
        setSelectedLanguage((prev) => (prev === value ? 'All' : value));
        break;
      }
      case 'country': {
        setSelectedCountry((prev) => (prev === value ? 'All' : value));
        break;
      }
      case 'genre': {
        setSelectedGenre((prev) => (prev === value ? 'All' : value));
        break;
      }
      case 'year': {
        const normalizedYear = value.toString();
        setSelectedYear((prev) => (prev === normalizedYear ? 'All' : normalizedYear));
        break;
      }
      case 'rating': {
        const normalizedRating = Number(value);
        setMinRating((prev) => (prev === normalizedRating ? 0 : normalizedRating));
        break;
      }
      default:
        break;
    }
  };

  const handleRatingSliderChange = (_, value) => {
    if (typeof value === 'number') {
      setMinRating(value);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchFilteredData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage, selectedCountry, selectedYear, minRating, selectedGenre]);

  const fetchFilterOptions = async () => {
    try {
      const response = await movieAPI.getFilterOptions();
      setFilterOptions(response.data.data);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchFilteredData = async () => {
    const isInitialLoad = !analytics;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (isInitialLoad) {
      setLoading(true);
    } else {
      setIsRefetching(true);
    }

    try {
      const params = {};
      if (selectedLanguage !== 'All') params.movieLanguage = selectedLanguage;
      if (selectedCountry !== 'All') params.movieCountry = selectedCountry;
      if (selectedYear !== 'All') params.year = selectedYear;
      if (minRating > 0) params.minRating = minRating;
      if (selectedGenre !== 'All') params.genre = selectedGenre;

      const analyticsResponse = await movieAPI.getAnalytics(params, { signal: controller.signal });
      const analyticsPayload = analyticsResponse.data.data;

      setAnalytics(analyticsPayload);
      setTopMovies(analyticsPayload.topRatedMovies || []);
    } catch (error) {
      if (error.code === 'ERR_CANCELED') return;
      console.error('Error fetching data:', error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const resetFilters = () => {
    setSelectedLanguage('All');
    setSelectedCountry('All');
    setSelectedYear('All');
    setMinRating(0);
    setSelectedGenre('All');
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress
          sx={{
            color: '#00d4ff',
          }}
          size={60}
        />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary">
          No analytics data available
        </Typography>
      </Box>
    );
  }

  const yearChartData = analytics.moviesPerYear.map((item) => ({
    name: item._id.toString(),
    count: item.count,
  }));

  const genreChartData = analytics.moviesPerGenre.map((item) => ({
    name: item._id,
    count: item.count,
  }));
  
  const languageChartData = analytics.moviesPerLanguage?.map((item) => ({
    name: item._id,
    value: item.count,
  })) || [];
  
  const countryChartData = analytics.moviesPerCountry?.map((item) => ({
    name: item._id,
    value: item.count,
  })) || [];
  
  const ratingBucketLabels = {
    0: '0-2★',
    2: '2-4★',
    4: '4-6★',
    6: '6-7★',
    7: '7-8★',
    8: '8-9★',
    9: '9-10★',
  };
  const ratingChartData = (analytics.ratingDistribution || []).map((item) => {
    const bucketStart = typeof item._id === 'number' ? item._id : null;
    const label = bucketStart !== null
      ? ratingBucketLabels[bucketStart] || `${bucketStart}+★`
      : item._id || 'Other';
    return {
      name: label,
      value: item.count,
      bucketStart,
    };
  });
  const activeYear = selectedYear !== 'All' ? selectedYear.toString() : null;
  const activeGenre = selectedGenre !== 'All' ? selectedGenre : null;
  const activeLanguage = selectedLanguage !== 'All' ? selectedLanguage : null;
  const activeCountry = selectedCountry !== 'All' ? selectedCountry : null;
  const activeRatingLabel = minRating > 0 ? (ratingBucketLabels[minRating] || `${minRating}+★`) : null;
  const filtersApplied = [selectedLanguage, selectedCountry, selectedYear, selectedGenre].some((value) => value !== 'All') || minRating > 0;
  const busiestYearEntry = analytics.moviesPerYear?.length
    ? analytics.moviesPerYear.reduce((top, item) => (item.count > top.count ? item : top))
    : null;
  const heroMovie = topMovies[0];

  const showInlineLoader = isRefetching && !loading;

  return (
    <Box sx={{ position: 'relative' }}>
      {showInlineLoader && (
        <LinearProgress
          sx={{
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 5,
            backgroundColor: 'rgba(255,255,255,0.05)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #00d4ff, #6c63ff)',
            },
          }}
        />
      )}
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
          Movie Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Comprehensive insights into your movie collection with real-time filters
        </Typography>
      </motion.div>

      {/* Interactive Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: 'rgba(26, 32, 44, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <FilterListIcon sx={{ color: '#00d4ff' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Interactive Filters
            </Typography>
            <Chip 
              label="Reset All" 
              onClick={resetFilters}
              sx={{ 
                ml: 'auto',
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                '&:hover': {
                  background: 'rgba(0, 212, 255, 0.2)',
                }
              }}
            />
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={selectedLanguage}
                  label="Language"
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  <MenuItem value="All">All Languages</MenuItem>
                  {filterOptions.languages.map((lang) => (
                    <MenuItem key={lang} value={lang}>{lang}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  value={selectedCountry}
                  label="Country"
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <MenuItem value="All">All Countries</MenuItem>
                  {filterOptions.countries.map((country) => (
                    <MenuItem key={country} value={country}>{country}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Year</InputLabel>
                <Select
                  value={selectedYear}
                  label="Year"
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <MenuItem value="All">All Years</MenuItem>
                  {filterOptions.years.map((year) => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Genre</InputLabel>
                <Select
                  value={selectedGenre}
                  label="Genre"
                  onChange={(e) => setSelectedGenre(e.target.value)}
                >
                  <MenuItem value="All">All Genres</MenuItem>
                  {['Action', 'Drama', 'Comedy', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Crime', 'Adventure', 'Animation', 'Biography', 'Documentary', 'Fantasy', 'Family', 'War', 'Western', 'Musical', 'Mystery'].map((genre) => (
                    <MenuItem key={genre} value={genre}>{genre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Box sx={{ px: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Min Rating: {minRating.toFixed(1)}
                </Typography>
                <Slider
                  value={minRating}
                  onChange={handleRatingSliderChange}
                  min={0}
                  max={10}
                  step={null}
                  marks={ratingMarks}
                  sx={{
                    color: '#00d4ff',
                    '& .MuiSlider-thumb': {
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: '0 0 0 8px rgba(0, 212, 255, 0.16)',
                      },
                    },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {selectedLanguage !== 'All' && (
              <Chip 
                label={`Language: ${selectedLanguage}`} 
                onDelete={() => setSelectedLanguage('All')}
                sx={{ background: 'rgba(0, 212, 255, 0.1)' }}
              />
            )}
            {selectedCountry !== 'All' && (
              <Chip 
                label={`Country: ${selectedCountry}`} 
                onDelete={() => setSelectedCountry('All')}
                sx={{ background: 'rgba(0, 212, 255, 0.1)' }}
              />
            )}
            {selectedYear !== 'All' && (
              <Chip 
                label={`Year: ${selectedYear}`} 
                onDelete={() => setSelectedYear('All')}
                sx={{ background: 'rgba(0, 212, 255, 0.1)' }}
              />
            )}
            {selectedGenre !== 'All' && (
              <Chip 
                label={`Genre: ${selectedGenre}`} 
                onDelete={() => setSelectedGenre('All')}
                sx={{ background: 'rgba(0, 212, 255, 0.1)' }}
              />
            )}
            {minRating > 0 && (
              <Chip 
                label={`Min Rating: ${minRating.toFixed(1)}`} 
                onDelete={() => setMinRating(0)}
                sx={{ background: 'rgba(0, 212, 255, 0.1)' }}
              />
            )}
          </Box>
        </Paper>
      </motion.div>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Filtered Movies"
            value={analytics.totalMovies}
            icon={<MovieIcon sx={{ fontSize: 32 }} />}
            subtitle={filtersApplied ? 'Matching current filters' : 'Entire catalog'}
            color="#00d4ff"
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Rating"
            value={analytics.avgRating}
            icon={<StarIcon sx={{ fontSize: 32 }} />}
            subtitle="Out of 10"
            color="#ffaa00"
            delay={0.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Peak Release Year"
            value={busiestYearEntry?._id || 'N/A'}
            icon={<TimelineIcon sx={{ fontSize: 32 }} />}
            subtitle={busiestYearEntry ? `${busiestYearEntry.count} releases` : 'No data'}
            color="#00ff88"
            delay={0.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Top Rated Title"
            value={heroMovie?.title || 'N/A'}
            icon={<EmojiEventsIcon sx={{ fontSize: 32 }} />}
            subtitle={heroMovie ? `${heroMovie.rating.toFixed(1)} ★ • ${heroMovie.year}` : 'No winners yet'}
            color="#a78bfa"
            delay={0.3}
          />
        </Grid>
      </Grid>

      {/* Main Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={6}>
          <AnimatedAreaChart
            data={yearChartData}
            title="Movies Timeline"
            dataKey="count"
            xAxisKey="name"
            onPointClick={(_, label) => handleChartSelection('year', label)}
            activeItem={activeYear}
          />
        </Grid>
        <Grid item xs={12} lg={6}>
          <AnimatedBarChart
            data={genreChartData.slice(0, 10)}
            title="Top 10 Genres"
            dataKey="count"
            xAxisKey="name"
            onItemClick={(_, label) => handleChartSelection('genre', label)}
            activeItem={activeGenre}
          />
        </Grid>
      </Grid>

      {/* Secondary Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={4}>
          <AnimatedPieChart
            data={languageChartData.slice(0, 8)}
            title="Top Languages Distribution"
            dataKey="value"
            nameKey="name"
            onItemClick={(_, label) => handleChartSelection('language', label)}
            activeItem={activeLanguage}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <AnimatedPieChart
            data={countryChartData.slice(0, 8)}
            title="Top Countries Distribution"
            dataKey="value"
            nameKey="name"
            onItemClick={(_, label) => handleChartSelection('country', label)}
            activeItem={activeCountry}
          />
        </Grid>
        <Grid item xs={12} md={12} lg={4}>
          <AnimatedRadarChart
            data={genreChartData.slice(0, 8)}
            title="Genre Radar Analysis"
            dataKey="count"
            nameKey="name"
            onItemClick={(_, label) => handleChartSelection('genre', label)}
            activeItem={activeGenre}
          />
        </Grid>
      </Grid>

      {/* Rating Distribution Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <AnimatedBarChart
            data={ratingChartData}
            title="Rating Distribution"
            dataKey="value"
            xAxisKey="name"
            onItemClick={(entry) => entry && handleChartSelection('rating', entry.bucketStart ?? 0)}
            activeItem={activeRatingLabel}
          />
        </Grid>
      </Grid>

      {/* Top Rated Movies Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card
          sx={{
            background: 'rgba(26, 32, 44, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            '&:hover': {
              boxShadow: '0 12px 48px 0 rgba(0, 212, 255, 0.2)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.7) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Top 10 Rated Movies {filtersApplied && '(Filtered)'}
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Year</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Language</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Country</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Genre</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">
                      Rating
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topMovies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No movies match the selected filters
                      </TableCell>
                    </TableRow>
                  ) : topMovies.map((movie, index) => (
                    <MotionTableRow
                      key={movie._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      sx={{
                        '&:hover': {
                          background: 'rgba(0, 212, 255, 0.05)',
                        },
                      }}
                    >
                      <TableCell>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            background:
                              index === 0
                                ? 'linear-gradient(135deg, #ffaa00 0%, #ff8800 100%)'
                                : index === 1
                                ? 'linear-gradient(135deg, #c0c0c0 0%, #909090 100%)'
                                : index === 2
                                ? 'linear-gradient(135deg, #cd7f32 0%, #8b5a2b 100%)'
                                : 'rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          {index + 1}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {movie.title}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {movie.year}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={movie.movieLanguage || 'N/A'} 
                          size="small"
                          sx={{ 
                            background: 'rgba(167, 139, 250, 0.2)',
                            border: '1px solid rgba(167, 139, 250, 0.3)',
                            color: '#a78bfa'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={movie.movieCountry || 'N/A'} 
                          size="small"
                          sx={{ 
                            background: 'rgba(0, 255, 136, 0.2)',
                            border: '1px solid rgba(0, 255, 136, 0.3)',
                            color: '#00ff88'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {(movie.genre || []).slice(0, 2).map((g, i) => (
                            <Chip key={i} label={g} size="small" />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '8px',
                            background: 'rgba(255, 170, 0, 0.1)',
                            border: '1px solid rgba(255, 170, 0, 0.3)',
                          }}
                        >
                          <StarIcon sx={{ fontSize: 16, color: '#ffaa00' }} />
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: '#ffaa00' }}
                          >
                            {movie.rating.toFixed(1)}
                          </Typography>
                        </Box>
                      </TableCell>
                    </MotionTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Dashboard;
