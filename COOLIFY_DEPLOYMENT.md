# Coolify Deployment Guide

## Quick Deployment Steps

1. **Add your repository to Coolify**
   - Go to your Coolify dashboard
   - Add a new application
   - Connect your GitHub/GitLab repository

2. **Set Environment Variables**
   ```
   NODE_ENV=production
   JWT_SECRET=your-secure-jwt-secret-here
   PORT=5000
   ```

3. **Configure Build Settings**
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Port**: `5000`

## Troubleshooting

### "Invalid Credentials" Error

1. **Check the health endpoint** first:
   ```bash
   curl https://your-app.coolify.domain/api/health
   ```
   This should return:
   ```json
   {
     "status": "ok",
     "timestamp": "2024-01-...",
     "env": "production", 
     "hasJwtSecret": true
   }
   ```

2. **Verify environment variables are set**:
   - Make sure `JWT_SECRET` is configured in Coolify
   - Check that `NODE_ENV=production`

3. **Check application logs** in Coolify for any errors during startup

4. **Test the login endpoint directly**:
   ```bash
   curl -X POST https://your-app.coolify.domain/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"hcanning","password":"technics1"}'
   ```

### Common Issues

- **Build failures**: Make sure all dependencies are in package.json
- **Port conflicts**: Coolify should use PORT=5000 
- **Missing JWT_SECRET**: App will use a default but set a secure one for production
- **Network issues**: Check if the app is accessible on the configured domain

### Manual Deployment Steps

If automatic deployment isn't working:

1. **Clone your repository**
2. **Install dependencies**: `npm install`
3. **Build the app**: `npm run build` 
4. **Set environment variables**
5. **Start the app**: `npm start`

The app will run on port 5000 and serve both the frontend and API routes.

## Login Credentials

- **Username**: `hcanning`
- **Password**: `technics1`

These are hardcoded in the demo. For production, you'd want to use a proper user management system.