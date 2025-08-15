# Deploy to Netlify

This guide shows you how to deploy your Replit to GitHub sync tool to Netlify.

## Prerequisites

1. Your GitHub repository: `https://github.com/SUMEDHFORTES/replit-github-sync-tool`
2. A Netlify account (free at netlify.com)

## Deployment Steps

### 1. Connect GitHub Repository

1. Go to [Netlify](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose "GitHub" as your Git provider
4. Select your repository: `replit-github-sync-tool`

### 2. Configure Build Settings

Set these build settings in Netlify:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node.js version**: `20` (in Environment Variables)

### 3. Environment Variables

In your Netlify site settings, add these environment variables:

- `NODE_VERSION`: `20`

### 4. Deploy

Click "Deploy site" and Netlify will:
- Install dependencies with `npm install`
- Build your React frontend 
- Deploy serverless functions for the API
- Provide you with a live URL

## How It Works

Your app is configured for Netlify with:

- **Frontend**: React app built with Vite → served from `/dist`
- **Backend**: Express.js API → deployed as Netlify Functions
- **API Routes**: `/api/*` → redirected to serverless functions
- **Routing**: SPA routing handled with catch-all redirect

## Features Available

✅ GitHub authentication with personal access tokens
✅ Project dashboard with sync status
✅ Individual and batch project sync
✅ Repository configuration options
✅ Real-time status updates
✅ Demo projects for testing

## Live URL

After deployment, your app will be available at:
`https://[your-site-name].netlify.app`

You can customize the domain name in your Netlify site settings.

## Usage

1. Visit your deployed app
2. Enter your GitHub personal access token
3. View and manage your Replit projects
4. Sync projects to GitHub with one click

Your Replit to GitHub sync tool is now live and ready to use!