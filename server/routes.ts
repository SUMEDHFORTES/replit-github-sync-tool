import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGithubConfigSchema, insertProjectSchema, updateProjectSchema } from "@shared/schema";
import { GitHubService } from "./services/github";
import { GitService } from "./services/git";

export async function registerRoutes(app: Express): Promise<Server> {
  const gitService = new GitService();

  // GitHub configuration routes
  app.get("/api/github/config", async (req, res) => {
    try {
      // For demo purposes, using a hardcoded user ID
      const userId = "demo-user";
      const config = await storage.getGithubConfig(userId);
      
      if (!config) {
        return res.json({ connected: false });
      }

      res.json({ 
        connected: true, 
        username: config.githubUsername 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/github/connect", async (req, res) => {
    try {
      const { githubToken } = insertGithubConfigSchema.parse(req.body);
      const userId = "demo-user";

      // Validate token by making a GitHub API call
      const githubService = new GitHubService(githubToken);
      const githubUser = await githubService.getUser();

      // Store or update GitHub config
      const existingConfig = await storage.getGithubConfig(userId);
      
      let config;
      if (existingConfig) {
        config = await storage.updateGithubConfig(userId, {
          githubToken,
          githubUsername: githubUser.login,
        });
      } else {
        config = await storage.createGithubConfig({
          userId,
          githubToken,
          githubUsername: githubUser.login,
        });
      }

      res.json({ 
        connected: true, 
        username: githubUser.login 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/github/disconnect", async (req, res) => {
    try {
      const userId = "demo-user";
      await storage.deleteGithubConfig(userId);
      res.json({ connected: false });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Projects routes
  app.get("/api/projects", async (req, res) => {
    try {
      const userId = "demo-user";
      const projects = await storage.getProjects(userId);
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const userId = "demo-user";
      const projectData = insertProjectSchema.parse({ ...req.body, userId });
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = updateProjectSchema.parse(req.body);
      const project = await storage.updateProject(id, updateData);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/projects/:id/sync", async (req, res) => {
    try {
      const { id } = req.params;
      const userId = "demo-user";
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const githubConfig = await storage.getGithubConfig(userId);
      if (!githubConfig) {
        return res.status(400).json({ message: "GitHub not connected" });
      }

      // Update project status to syncing
      await storage.updateProject(id, { 
        syncStatus: "syncing", 
        syncProgress: "0",
        errorMessage: null 
      });

      // Start sync process in background
      syncProjectToGitHub(project, githubConfig, gitService)
        .then(async (result) => {
          await storage.updateProject(id, {
            syncStatus: "synced",
            syncProgress: "100",
            githubUrl: result.githubUrl,
            lastSynced: new Date(),
          });
        })
        .catch(async (error) => {
          await storage.updateProject(id, {
            syncStatus: "error",
            syncProgress: "0",
            errorMessage: error.message,
          });
        });

      res.json({ message: "Sync started" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Initialize with some demo projects
  initializeDemoData();

  const httpServer = createServer(app);
  return httpServer;
}

async function syncProjectToGitHub(project: any, githubConfig: any, gitService: GitService) {
  const githubService = new GitHubService(githubConfig.githubToken);
  
  // Simulate project file path (in real implementation, this would come from Replit API)
  const projectPath = `/tmp/replit-projects/${project.name}`;
  
  try {
    // Create GitHub repository
    const repo = await githubService.createRepository(
      project.repositoryName || project.name,
      project.description,
      project.isPrivate
    );

    // Initialize local git repository
    const repoPath = await gitService.initializeRepository(project.name, projectPath);
    
    // In a real implementation, you would copy files from Replit project
    // For now, we'll create a simple README
    const fs = require('fs').promises;
    await fs.writeFile(`${repoPath}/README.md`, `# ${project.name}\n\n${project.description || 'A project synced from Replit'}`);

    // Commit and push to GitHub
    await gitService.commitAndPush(repoPath, repo.clone_url, "Initial commit from Replit");
    
    // Cleanup local repository
    await gitService.cleanup(repoPath);

    return {
      githubUrl: repo.html_url,
      success: true,
    };
  } catch (error) {
    throw error;
  }
}

async function initializeDemoData() {
  const userId = "demo-user";
  
  // Create demo user
  try {
    await storage.createUser({ username: "demo", password: "demo" });
  } catch {
    // User might already exist
  }

  // Create some demo projects
  const demoProjects = [
    {
      userId,
      name: "Personal Portfolio",
      language: "React",
      description: "A modern portfolio website built with React",
      repositoryName: "personal-portfolio",
      syncStatus: "synced" as const,
      githubUrl: "https://github.com/demo/personal-portfolio",
      lastSynced: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      userId,
      name: "Todo App",
      language: "JavaScript",
      description: "A simple todo application with local storage",
      repositoryName: "todo-app",
      syncStatus: "pending" as const,
    },
    {
      userId,
      name: "Discord Bot",
      language: "Python",
      description: "A Discord bot with various utility commands",
      repositoryName: "discord-bot",
      syncStatus: "pending" as const,
    },
    {
      userId,
      name: "Node.js API",
      language: "Node.js",
      description: "RESTful API built with Express.js",
      repositoryName: "nodejs-api",
      syncStatus: "error" as const,
      errorMessage: "Repository name already exists",
    },
  ];

  for (const project of demoProjects) {
    try {
      await storage.createProject(project);
    } catch {
      // Projects might already exist
    }
  }
}
