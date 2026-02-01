# Deployment Guide

This guide explains how to deploy Financial Tracker to Vercel using the GitHub integration.

## Prerequisites

- GitHub account with the repository pushed
- Vercel account (free tier works)
- Supabase project (for database)

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - Name: `financial-tracker`
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project to be created
5. Go to **Settings > API** and copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key

## Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Authorize Vercel to access your GitHub

## Step 3: Import Repository

1. In Vercel dashboard, click **"Add New..."** > **"Project"**
2. Click **"Import Git Repository"**
3. Select your `financial-tracker` repository
4. If you don't see it, click **"Adjust GitHub App Permissions"** to grant access

## Step 4: Configure Project

1. **Framework Preset**: Select `Other`
2. **Root Directory**: Leave as `./`
3. **Build Command**: `npm run build`
4. **Output Directory**: `frontend/dist`
5. **Install Command**: `npm install`

## Step 5: Add Environment Variables

Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon key |

## Step 6: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 1-2 minutes)
3. Once done, you'll get a URL like `https://financial-tracker-xxxxx.vercel.app`

## Automatic Deployments

After initial setup, every push to your main branch will automatically trigger a new deployment:

1. Push changes to GitHub
2. Vercel detects the push
3. Builds and deploys automatically
4. Preview URL for branches, production URL for main

## Verify Deployment

After deployment, verify everything works:

1. Open your Vercel URL
2. Check the homepage loads with gradient background
3. API Status should show "API is running" (green indicator)

## Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click **"Settings"** > **"Domains"**
3. Add your custom domain
4. Update DNS records as instructed

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript has no errors locally with `npm run build`

### API Not Working

- Verify environment variables are set correctly
- Check Function logs in Vercel dashboard
- Ensure `/api/health` route exists

### Frontend Shows Blank Page

- Check browser console for errors
- Verify `frontend/dist` is being built correctly
- Check Vite build output

## Environment Variables Reference

### Required for Production

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend port (local only) | `3001` |

## Project Structure for Vercel

```
financial-tracker/
├── frontend/
│   ├── dist/           # Built frontend (served as static)
│   └── ...
├── backend/
│   └── src/
│       └── index.ts    # Serverless function entry
├── vercel.json         # Vercel configuration
└── package.json        # Root package with workspaces
```

## vercel.json Explained

```json
{
  "builds": [
    { "src": "frontend/package.json", "use": "@vercel/static-build" },
    { "src": "backend/src/index.ts", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "backend/src/index.ts" },
    { "src": "/(.*)", "dest": "frontend/$1" }
  ]
}
```

- **Frontend**: Built as static files, served from `frontend/dist`
- **Backend**: Compiled as serverless function
- **Routes**: `/api/*` goes to backend, everything else to frontend
