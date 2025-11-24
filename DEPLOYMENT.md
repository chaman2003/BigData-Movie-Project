# Separate Deployment Guide

## Backend Deployment (Vercel)

1. **Deploy API folder to Vercel:**
   - Go to Vercel Dashboard
   - Import the `api` folder from your repository
   - Or use Vercel CLI: `cd api && vercel`

2. **Set Environment Variables in Vercel:**
   - `MONGODB_URI` = your MongoDB Atlas connection string

3. **Get your backend URL:**
   - Example: `https://your-backend.vercel.app`

## Frontend Deployment (Vercel)

1. **Deploy client folder to Vercel:**
   - Go to Vercel Dashboard
   - Import the `client` folder from your repository
   - Or use Vercel CLI: `cd client && vercel`

2. **Set Environment Variables in Vercel:**
   - `REACT_APP_API_URL` = your backend URL + `/api`
   - Example: `https://your-backend.vercel.app/api`

3. **Deploy**

## Alternative: Deploy Both from Root

If you want to deploy from root with separate domains:

1. Deploy backend:
   - Import repository
   - Set Root Directory: `api`
   - Add env: `MONGODB_URI`

2. Deploy frontend:
   - Import repository again (as new project)
   - Set Root Directory: `client`
   - Add env: `REACT_APP_API_URL` = backend-url/api

## Local Development

Backend:
```bash
cd api
npm install
# Create .env with MONGODB_URI
node index.js  # Or create server.js wrapper
```

Frontend:
```bash
cd client
npm install
# Create .env.local with REACT_APP_API_URL=http://localhost:5000/api
npm start
```
