# Quick Setup Guide

Follow these steps to run the Replit to GitHub Sync Tool on your local machine:

## 1. Install Dependencies

```bash
npm install
```

## 2. Get GitHub Token

1. Go to https://github.com/settings/tokens/new
2. Click "Generate new token (classic)"
3. Give it a name: "Replit Sync Tool"
4. Select these permissions:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `user:email` (Access user email addresses)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)

## 3. Start the Application

```bash
npm run dev
```

The app will open at: http://localhost:5000

## 4. Connect Your GitHub

1. Paste your GitHub token in the setup form
2. Click "Connect GitHub"
3. You'll see your projects dashboard

## 5. Sync Your Projects

- Click the sync button (⟳) next to any project
- Or use "Sync All" to sync multiple projects at once
- Configure each project using the settings button (⚙️)

## Troubleshooting

**Port already in use?**
- The app uses port 5000
- Make sure no other apps are using this port
- Or change the port in `server/index.ts`

**GitHub connection fails?**
- Double-check your token has the right permissions
- Make sure the token hasn't expired
- Try generating a new token

**Projects not syncing?**
- Check your internet connection
- Verify GitHub token permissions
- Look at error messages in the interface

## What's Included

- Full React frontend with modern UI
- Express.js backend with GitHub API integration
- TypeScript throughout for type safety
- Tailwind CSS for styling
- Demo projects to test with

Ready to sync your Replit projects to GitHub!