const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const { Octokit } = require('@octokit/rest');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage for Netlify functions
class NetlifyStorage {
  constructor() {
    this.users = new Map();
    this.githubConfigs = new Map();
    this.projects = new Map();
  }

  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser) {
    const id = 'demo-user';
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getGithubConfig(userId) {
    return Array.from(this.githubConfigs.values()).find(config => config.userId === userId);
  }

  async createGithubConfig(insertConfig) {
    const id = Date.now().toString();
    const config = { ...insertConfig, id, createdAt: new Date() };
    this.githubConfigs.set(id, config);
    return config;
  }

  async updateGithubConfig(userId, updateConfig) {
    const existing = await this.getGithubConfig(userId);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateConfig };
    this.githubConfigs.set(existing.id, updated);
    return updated;
  }

  async deleteGithubConfig(userId) {
    const config = await this.getGithubConfig(userId);
    if (config) {
      this.githubConfigs.delete(config.id);
    }
  }

  async getProjects(userId) {
    return Array.from(this.projects.values()).filter(project => project.userId === userId);
  }

  async getProject(id) {
    return this.projects.get(id);
  }

  async createProject(insertProject) {
    const id = Date.now().toString() + Math.random();
    const project = { 
      ...insertProject, 
      id, 
      lastModified: new Date(),
      lastSynced: null
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id, updateProject) {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    
    const updated = { 
      ...existing, 
      ...updateProject, 
      lastModified: new Date() 
    };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id) {
    this.projects.delete(id);
  }
}
const storage = new MemStorage();

// Initialize demo data
async function initializeDemoData() {
  const userId = "demo-user";
  
  try {
    await storage.createUser({ username: "demo", password: "demo" });
  } catch {
    // User might already exist
  }

  const demoProjects = [
    {
      userId,
      name: "Personal Portfolio",
      language: "React",
      description: "A modern portfolio website built with React",
      repositoryName: "personal-portfolio",
      syncStatus: "synced",
      githubUrl: "https://github.com/demo/personal-portfolio",
      lastSynced: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      userId,
      name: "Todo App",
      language: "JavaScript", 
      description: "A simple todo application with local storage",
      repositoryName: "todo-app",
      syncStatus: "pending",
    },
    {
      userId,
      name: "Discord Bot",
      language: "Python",
      description: "A Discord bot with various utility commands", 
      repositoryName: "discord-bot",
      syncStatus: "pending",
    }
  ];

  for (const project of demoProjects) {
    try {
      await storage.createProject(project);
    } catch {
      // Projects might already exist
    }
  }
}

// Initialize demo data
initializeDemoData();

// API Routes
app.get('/api/github/config', async (req, res) => {
  try {
    const userId = "demo-user";
    const config = await storage.getGithubConfig(userId);
    
    if (!config) {
      return res.json({ connected: false });
    }

    res.json({ 
      connected: true, 
      username: config.githubUsername 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/github/connect', async (req, res) => {
  try {
    const { githubToken } = req.body;
    const userId = "demo-user";

    // Validate token
    const octokit = new Octokit({ auth: githubToken });
    const githubUser = await octokit.rest.users.getAuthenticated();

    const existingConfig = await storage.getGithubConfig(userId);
    
    let config;
    if (existingConfig) {
      config = await storage.updateGithubConfig(userId, {
        githubToken,
        githubUsername: githubUser.data.login,
      });
    } else {
      config = await storage.createGithubConfig({
        userId,
        githubToken,
        githubUsername: githubUser.data.login,
      });
    }

    res.json({ 
      connected: true, 
      username: githubUser.data.login 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/github/disconnect', async (req, res) => {
  try {
    const userId = "demo-user";
    await storage.deleteGithubConfig(userId);
    res.json({ connected: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const userId = "demo-user";
    const projects = await storage.getProjects(userId);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const userId = "demo-user";
    const projectData = { ...req.body, userId };
    const project = await storage.createProject(projectData);
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await storage.updateProject(id, req.body);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/projects/:id/sync', async (req, res) => {
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

    // Update project status
    await storage.updateProject(id, { 
      syncStatus: "syncing", 
      syncProgress: "0",
      errorMessage: null 
    });

    // Simulate sync process (in real implementation, this would do actual GitHub operations)
    setTimeout(async () => {
      try {
        await storage.updateProject(id, {
          syncStatus: "synced",
          syncProgress: "100", 
          githubUrl: `https://github.com/${githubConfig.githubUsername}/${project.repositoryName || project.name}`,
          lastSynced: new Date(),
        });
      } catch (error) {
        await storage.updateProject(id, {
          syncStatus: "error",
          syncProgress: "0",
          errorMessage: "Sync simulation completed",
        });
      }
    }, 2000);

    res.json({ message: "Sync started" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports.handler = serverless(app);