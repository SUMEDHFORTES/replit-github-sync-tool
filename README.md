# Replit to GitHub Sync Tool

A web application that automates the process of syncing your Replit projects to GitHub repositories.

## Features

- **GitHub Integration**: Connect your GitHub account using a personal access token
- **Project Management**: View and manage all your Replit projects from a dashboard
- **Automated Sync**: One-click sync of projects to GitHub repositories
- **Configuration Options**: Set repository names, descriptions, privacy settings, and auto-sync
- **Real-time Status**: Track sync progress and view error details
- **Batch Operations**: Sync multiple projects at once

## Tech Stack

- **Frontend**: React with TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js with Express.js and TypeScript
- **Database**: PostgreSQL with Drizzle ORM (in-memory storage for demo)
- **External APIs**: GitHub API via Octokit

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn package manager
- GitHub personal access token

### Installation

1. Extract all files to your desired directory
2. Install dependencies:
   ```bash
   npm install
   ```

### Setup

1. **GitHub Token**: You'll need a GitHub personal access token with repository permissions:
   - Go to https://github.com/settings/tokens/new
   - Select "Generate new token (classic)"
   - Give it a name like "Replit Sync Tool"
   - Select scopes: `repo`, `user:email`
   - Copy the generated token

2. **Environment Variables** (optional):
   Create a `.env` file in the root directory:
   ```
   GIT_USER_NAME=Your Name
   GIT_USER_EMAIL=your.email@example.com
   ```

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Usage

1. **Connect GitHub**: Enter your GitHub personal access token on the setup page
2. **View Projects**: Browse your Replit projects in the dashboard
3. **Configure Sync**: Click the settings icon to configure repository settings
4. **Sync Projects**: Use individual sync buttons or "Sync All" for batch operations
5. **Monitor Progress**: Track sync status and view GitHub links for completed syncs

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── pages/          # Application pages
├── server/                 # Express.js backend
│   ├── services/           # Business logic services
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data storage layer
├── shared/                 # Shared TypeScript types
└── package.json           # Dependencies and scripts
```

## API Endpoints

- `GET /api/github/config` - Check GitHub connection status
- `POST /api/github/connect` - Connect GitHub account
- `DELETE /api/github/disconnect` - Disconnect GitHub account
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `PATCH /api/projects/:id` - Update project configuration
- `POST /api/projects/:id/sync` - Sync project to GitHub

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Database Schema

The application uses the following main entities:
- **Users**: Basic user authentication
- **GitHub Configs**: Store GitHub tokens and usernames
- **Projects**: Replit projects with sync configuration

## Security Notes

- GitHub tokens are stored securely and never logged
- All API calls use proper authentication
- Repository creation respects privacy settings
- Tokens are validated before storage

## Limitations

- Currently uses in-memory storage (data resets on restart)
- Demo mode with hardcoded user ID
- Simulated file copying (real implementation would use Replit API)

## Contributing

This is a demo application. For production use, consider:
- Implementing proper user authentication
- Adding PostgreSQL database persistence
- Integrating with actual Replit API
- Adding comprehensive error handling
- Implementing rate limiting and security measures

## License

MIT License - Feel free to modify and use as needed.