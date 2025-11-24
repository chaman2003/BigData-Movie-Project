import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
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
import { getPosterWithFallback } from '../utils/media';

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

          <Grid container spacing={3}>
            {recommendations.map((movie, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={movie._id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  style={{ height: '100%' }}
                >
                  <Card
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
                        image={getPosterWithFallback(movie.posterUrl)}
                        alt={movie.title}
                        className="movie-poster"
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
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #00d4ff 0%, #0080ff 100%)',
                          boxShadow: '0 4px 12px rgba(0, 212, 255, 0.4)',
                        }}
                      >
                        <ThumbUpIcon sx={{ fontSize: 16, color: '#fff' }} />
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
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {movie.year}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {movie.genre.slice(0, 2).map((g, i) => (
                          <Chip key={i} label={g} size="small" />
                        ))}
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {movie.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

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
