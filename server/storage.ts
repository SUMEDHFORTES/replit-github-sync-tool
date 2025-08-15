import { type User, type InsertUser, type GithubConfig, type InsertGithubConfig, type Project, type InsertProject, type UpdateProject } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getGithubConfig(userId: string): Promise<GithubConfig | undefined>;
  createGithubConfig(config: InsertGithubConfig): Promise<GithubConfig>;
  updateGithubConfig(userId: string, config: Partial<InsertGithubConfig>): Promise<GithubConfig | undefined>;
  deleteGithubConfig(userId: string): Promise<void>;
  
  getProjects(userId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: UpdateProject): Promise<Project | undefined>;
  deleteProject(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private githubConfigs: Map<string, GithubConfig>;
  private projects: Map<string, Project>;

  constructor() {
    this.users = new Map();
    this.githubConfigs = new Map();
    this.projects = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getGithubConfig(userId: string): Promise<GithubConfig | undefined> {
    return Array.from(this.githubConfigs.values()).find(
      (config) => config.userId === userId,
    );
  }

  async createGithubConfig(insertConfig: InsertGithubConfig): Promise<GithubConfig> {
    const id = randomUUID();
    const config: GithubConfig = { 
      ...insertConfig, 
      id, 
      createdAt: new Date() 
    };
    this.githubConfigs.set(id, config);
    return config;
  }

  async updateGithubConfig(userId: string, updateConfig: Partial<InsertGithubConfig>): Promise<GithubConfig | undefined> {
    const existing = await this.getGithubConfig(userId);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateConfig };
    this.githubConfigs.set(existing.id, updated);
    return updated;
  }

  async deleteGithubConfig(userId: string): Promise<void> {
    const config = await this.getGithubConfig(userId);
    if (config) {
      this.githubConfigs.delete(config.id);
    }
  }

  async getProjects(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId,
    );
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = { 
      ...insertProject, 
      id, 
      lastModified: new Date(),
      lastSynced: null
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updateProject: UpdateProject): Promise<Project | undefined> {
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

  async deleteProject(id: string): Promise<void> {
    this.projects.delete(id);
  }
}

export const storage = new MemStorage();
