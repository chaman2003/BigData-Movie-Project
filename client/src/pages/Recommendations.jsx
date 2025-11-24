import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import StarIcon from '@mui/icons-material/Star';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { movieAPI } from '../services/api';

const genres = ['All', 'Action', 'Drama', 'Comedy', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Crime', 'Adventure'];

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [minRating, setMinRating] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenre, minRating]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const params = {
        minRating,
      };
      if (selectedGenre !== 'All') {
        params.genre = selectedGenre;
      }
      const response = await movieAPI.getRecommendations(params);
      setRecommendations(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setLoading(false);
    }
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <ThumbUpIcon sx={{ fontSize: 40, color: '#00d4ff' }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Movie Recommendations
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Discover highly-rated movies tailored to your preferences
        </Typography>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card
          sx={{
            mb: 4,
            background: 'rgba(26, 32, 44, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Filter Recommendations
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Genre</InputLabel>
                  <Select
                    value={selectedGenre}
                    label="Genre"
                    onChange={(e) => setSelectedGenre(e.target.value)}
                  >
                    {genres.map((genre) => (
                      <MenuItem key={genre} value={genre}>
                        {genre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Minimum Rating: {minRating}
                </Typography>
                <Slider
                  value={minRating}
                  onChange={(e, value) => setMinRating(value)}
                  min={1}
                  max={10}
                  step={0.5}
                  marks
                  valueLabelDisplay="auto"
                  sx={{
                    color: '#00d4ff',
                    '& .MuiSlider-thumb': {
                      background: 'linear-gradient(135deg, #00d4ff 0%, #0080ff 100%)',
                      boxShadow: '0 4px 12px rgba(0, 212, 255, 0.4)',
                    },
                    '& .MuiSlider-track': {
                      background: 'linear-gradient(90deg, #00d4ff 0%, #0080ff 100%)',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <CircularProgress sx={{ color: '#00d4ff' }} size={60} />
        </Box>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              {recommendations.length} Recommended Movies
            </Typography>
          </motion.div>

          <Box>
            {recommendations.map((movie, index) => (
              <motion.div
                key={movie._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.01 }}
              >
                <Card
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                      <ThumbUpIcon sx={{ fontSize: 20, color: '#00d4ff' }} />
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
                          ml: 'auto',
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
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                        {movie.description.substring(0, 200)}...
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>

          {recommendations.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" color="text.secondary">
                No recommendations found with the current filters
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Try adjusting your filters to see more results
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Recommendations;
