# Cloudflare Pages Deployment Guide

Your room booking app has been converted to work with Cloudflare Pages! Here's how to deploy it:

## What Was Changed

✅ **Converted from session-based to JWT authentication** - Compatible with serverless environments  
✅ **Created Cloudflare Functions** - Replaced Express.js API routes with serverless functions  
✅ **Updated frontend** - Now stores JWT tokens in localStorage instead of cookies  
✅ **Added CORS headers** - Enables proper API communication  

## Deployment Steps

### Option 1: Deploy via Cloudflare Dashboard (Recommended)

1. **Connect Your Repository**
   - Go to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Click "Create a project" > "Connect to Git"
   - Select your repository

2. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty)

3. **Add Environment Variables**
   - In your Pages project settings, go to "Environment variables"
   - Add: `JWT_SECRET` = `your-secure-jwt-secret-here`

4. **Deploy**
   - Click "Save and Deploy"
   - Your app will be available at `https://your-project.pages.dev`

### Option 2: Deploy via Wrangler CLI

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Deploy**
   ```bash
   npm run build
   wrangler pages deploy dist
   ```

## File Structure

The app now includes:

```
functions/
├── api/
│   ├── auth/
│   │   ├── login.ts     # POST /api/auth/login
│   │   ├── logout.ts    # POST /api/auth/logout
│   │   └── user.ts      # GET /api/auth/user
│   ├── rooms.ts         # GET /api/rooms
│   ├── rooms/
│   │   └── [id].ts      # GET /api/rooms/:id
│   ├── bookings.ts      # GET/POST /api/bookings
│   └── bookings/
│       └── [id].ts      # PATCH/DELETE /api/bookings/:id
└── shared/
    ├── storage.ts       # In-memory storage for Functions
    └── jwt.ts           # JWT utilities
```

## Important Notes

- **Data Persistence**: Currently uses in-memory storage. For production, consider upgrading to Cloudflare D1 or KV storage.
- **Authentication**: Login with username `hcanning` and password `technics1`
- **Environment Variables**: Make sure to set `JWT_SECRET` in your Cloudflare Pages environment variables

## Testing the Deployment

1. Visit your deployed app URL
2. Try logging in with the admin credentials
3. Test room browsing and booking functionality
4. Check that all API endpoints work correctly

If you encounter any issues, check the Cloudflare Pages "Functions" logs in your dashboard for debugging information.