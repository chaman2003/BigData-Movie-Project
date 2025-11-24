import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  genre: {
    type: [String],
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  year: {
    type: Number,
    required: true
  },
  movieLanguage: {
    type: String,
    default: 'English'
  },
  movieCountry: {
    type: String,
    default: 'USA'
  },
  description: {
    type: String,
    required: true
  },
  posterUrl: {
    type: String,
    default: 'https://via.placeholder.com/300x450/1a1a2e/00d4ff?text=Movie+Poster'
  },
  director: {
    type: String,
    default: 'Unknown'
  },
  cast: {
    type: [String],
    default: []
  },
  runtime: {
    type: Number,
    default: 120
  }
}, {
  timestamps: true
});

movieSchema.index({ title: 'text', description: 'text' });
movieSchema.index({ genre: 1 });
movieSchema.index({ rating: -1 });
movieSchema.index({ year: -1 });
movieSchema.index({ movieLanguage: 1 });
movieSchema.index({ movieCountry: 1 });

export default mongoose.model('Movie', movieSchema);
