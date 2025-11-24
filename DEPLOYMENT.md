# Separate Deployment Guide

## Backend Deployment (Vercel)

1. **Deploy server folder to Vercel:**
   - Go to Vercel Dashboard → Add New Project
   - Import your GitHub repository
   - Set **Root Directory** to `server`
   - Framework Preset: Other

2. **Set Environment Variables in Vercel:**
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/?appName=movie-bd`

3. **Deploy and get your backend URL:**
   - Example: `https://your-backend.vercel.app`

## Frontend Deployment (Vercel)

1. **Deploy client folder to Vercel:**
   - Go to Vercel Dashboard → Add New Project
   - Import your GitHub repository (same repo, new project)
   - Set **Root Directory** to `client`
   - Framework Preset: Create React App

2. **Set Environment Variables in Vercel:**
   - `REACT_APP_API_URL` = your backend URL + `/api`
   - Example: `https://your-backend.vercel.app/api`

3. **Deploy**

## Local Development

Backend:
```bash
cd server
npm install
# Create .env with MONGODB_URI from .env.example
npm run dev
# Runs on http://localhost:5000
```

Frontend:
```bash
cd client
npm install
# Create .env.local with REACT_APP_API_URL=http://localhost:5000/api
npm start
# Runs on http://localhost:3000
```

## Quick Deploy Commands

Backend:
```bash
cd server
vercel
```

Frontend:
```bash
cd client
vercel
```

