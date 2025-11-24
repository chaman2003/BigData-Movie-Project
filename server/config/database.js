import mongoose from 'mongoose';

let cachedConnection = null;

const connectDB = async () => {
  // Return cached connection if already connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('📊 Using cached database connection');
    return cachedConnection;
  }

  // Return pending connection if currently connecting
  if (cachedConnection && mongoose.connection.readyState === 2) {
    console.log('⏳ Database connection in progress, waiting...');
    return cachedConnection;
  }

  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    const conn = await mongoose.connect(mongoUri, {
      dbName: 'movieDB',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedConnection = conn;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    cachedConnection = null;
    throw error;
  }
};

export default connectDB;
