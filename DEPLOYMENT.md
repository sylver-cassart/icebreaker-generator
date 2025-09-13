# Vercel Deployment Guide

## Overview

This guide will help you deploy your Icebreaker Generator app to Vercel for free hosting.

## Prerequisites

1. **GitHub Account** - You'll need to push your code to GitHub first
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free)
3. **OpenAI API Key** - Your OpenAI API key with sufficient credits

## Step 1: Prepare Your Code

### Update Environment Variables
Your app uses these environment variables that need to be set in Vercel:

- `OPENAI_API_KEY` - Your OpenAI API key
- `SESSION_SECRET` - A random string for session security (generate a strong one)

### Local Testing (Optional)
Test your build locally before deploying:

```bash
npm run build
npm start
```

## Step 2: Push to GitHub

1. **Create a new repository** on GitHub
2. **Connect your Replit to GitHub** (if not already done):
   - Go to your Replit project
   - Click the version control tab (git icon)
   - Connect to GitHub and create/push to a repository

3. **Alternatively, download and push manually**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/icebreaker-generator.git
   git push -u origin main
   ```

## Step 3: Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. **Visit [vercel.com](https://vercel.com)** and sign in with your GitHub account
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure the project**:
   - **Framework Preset**: Other (or leave default)
   - **Build Command**: Leave empty (auto-detected from vercel.json)
   - **Output Directory**: Leave empty (auto-detected from vercel.json)
   - **Install Command**: `npm install`
   
   Note: The project includes a `vercel.json` configuration that automatically handles the build settings.

5. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add `OPENAI_API_KEY` with your OpenAI API key
   - Add `SESSION_SECRET` with a strong random string (e.g., `openssl rand -base64 32`)

6. **Deploy**: Click "Deploy" and wait for deployment to complete

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
# Follow the prompts
```

## Step 4: Configure Domain (Optional)

- Vercel provides a free `.vercel.app` subdomain
- You can add a custom domain later in the Vercel dashboard

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-...` |
| `SESSION_SECRET` | Random string for session security | `abc123xyz...` |

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check that all dependencies are in `package.json`
   - Verify the build command works locally

2. **API Errors**
   - Ensure environment variables are set correctly
   - Check OpenAI API key has sufficient credits

3. **Static Files Not Loading**
   - Verify the output directory is set to `client/dist`
   - Check that the build process creates files in the correct location

### Getting Help:

- Check the Vercel deployment logs in the dashboard
- Verify environment variables are set correctly
- Test the build locally before deploying

## Production Considerations

1. **Monitor Usage**: Keep track of OpenAI API usage and costs
2. **Rate Limiting**: The app includes rate limiting (10 requests/minute per IP)
   - Note: On serverless, rate limiting is per-instance and may not be consistent across multiple instances
   - For high-traffic production use, consider external rate limiting (e.g., Redis)
3. **Analytics**: View usage analytics at `/analytics` on your deployed app
   - Analytics data is stored in memory and will reset on serverless cold starts
   - For production, consider persistent storage
4. **Session Management**: Sessions use in-memory storage and won't persist across serverless instances
5. **Updates**: Push to GitHub to trigger automatic redeployments

### Serverless Limitations

This app is optimized for serverless deployment but has some limitations:
- Rate limiting and analytics data don't persist across serverless instances
- Session state is not maintained between requests in different instances
- For high-traffic production use, consider migrating to persistent storage solutions

## Success!

Your Icebreaker Generator should now be live at:
`https://your-project-name.vercel.app`

Features available:
- ✅ LinkedIn icebreaker generation with style options
- ✅ Usage analytics dashboard
- ✅ Theme toggle (light/dark mode)
- ✅ Copy-to-clipboard functionality
- ✅ Professional, responsive design