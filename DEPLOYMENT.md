# Deployment Guide for Skill-Swap Platform

## Option 1: Deploy to Vercel (Recommended)

### Prerequisites
1. **Database Setup**: You need a PostgreSQL database. We recommend using [Neon](https://neon.tech) (free tier available).

### Step 1: Set up Database
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://user:password@host/database`)
4. Save this for the next step

### Step 2: Deploy to Vercel
1. **Install Vercel CLI** (optional but recommended):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via GitHub** (Recommended):
   - Push your code to GitHub
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - `DATABASE_URL`: Your Neon database connection string
     - `JWT_SECRET`: A random secret string for JWT tokens
   - Click "Deploy"

3. **Deploy via CLI**:
   ```bash
   vercel
   ```
   Follow the prompts and add your environment variables.

### Step 3: Set Environment Variables
In your Vercel dashboard, go to your project → Settings → Environment Variables and add:
- `DATABASE_URL`: Your Neon database connection string
- `JWT_SECRET`: A random secret string (e.g., `your-super-secret-jwt-key-here`)

### Step 4: Run Database Migrations
After deployment, you'll need to run your database migrations:
```bash
npm run db:push
```

## Option 2: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Connect your GitHub account
3. Create a new project from your repository
4. Add a PostgreSQL database from the Railway dashboard
5. Set environment variables:
   - `DATABASE_URL`: Railway will provide this automatically
   - `JWT_SECRET`: Your secret key
6. Deploy

## Option 3: Deploy to Render

1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure:
   - Build Command: `npm run build`
   - Start Command: `npm start`
5. Add environment variables
6. Deploy

## Environment Variables Required

```env
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
```

## Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Environment variables are set correctly
- [ ] Application is accessible via the provided URL
- [ ] User registration/login works
- [ ] Database connections are working
- [ ] Static files are being served correctly

## Troubleshooting

### Common Issues:
1. **Database Connection Errors**: Check your `DATABASE_URL` format
2. **Build Failures**: Ensure all dependencies are in `package.json`
3. **CORS Errors**: The API routes should handle CORS automatically
4. **404 Errors**: Check that your routes are properly configured

### Getting Help:
- Check Vercel deployment logs
- Verify environment variables are set correctly
- Test database connection locally first 