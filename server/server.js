import app from './app.js';

const PORT = process.env.PORT || 5000;

// For Vercel serverless
if (process.env.VERCEL) {
  export default app;
} else {
  // For local development
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
  });
}
