import app from './app.js';

const PORT = process.env.PORT || 5000;

// For local development
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
  });
}

// For Vercel serverless
export default app;
