import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

export class GitService {
  private workingDir: string;

  constructor(workingDir: string = "/tmp") {
    this.workingDir = workingDir;
  }

  async initializeRepository(projectName: string, projectPath: string) {
    const repoPath = path.join(this.workingDir, projectName);
    
    try {
      // Create directory if it doesn't exist
      await fs.mkdir(repoPath, { recursive: true });
      
      // Initialize git repository
      await execAsync("git init", { cwd: repoPath });
      
      // Configure git user (use environment variables or defaults)
      const gitUser = process.env.GIT_USER_NAME || "Replit User";
      const gitEmail = process.env.GIT_USER_EMAIL || "user@replit.com";
      
      await execAsync(`git config user.name "${gitUser}"`, { cwd: repoPath });
      await execAsync(`git config user.email "${gitEmail}"`, { cwd: repoPath });
      
      return repoPath;
    } catch (error) {
      throw new Error(`Failed to initialize git repository: ${error}`);
    }
  }

  async copyProjectFiles(sourcePath: string, destinationPath: string) {
    try {
      // Copy files from source to destination
      await execAsync(`cp -r "${sourcePath}"/* "${destinationPath}"/`, { 
        cwd: this.workingDir 
      });
    } catch (error) {
      throw new Error(`Failed to copy project files: ${error}`);
    }
  }

  async commitAndPush(repoPath: string, githubUrl: string, commitMessage: string = "Initial commit from Replit") {
    try {
      // Add all files
      await execAsync("git add .", { cwd: repoPath });
      
      // Commit changes
      await execAsync(`git commit -m "${commitMessage}"`, { cwd: repoPath });
      
      // Add remote origin
      await execAsync(`git remote add origin ${githubUrl}`, { cwd: repoPath });
      
      // Push to main branch
      await execAsync("git push -u origin main", { cwd: repoPath });
      
    } catch (error) {
      throw new Error(`Failed to commit and push: ${error}`);
    }
  }

  async syncChanges(repoPath: string, commitMessage: string = "Sync from Replit") {
    try {
      // Add all changes
      await execAsync("git add .", { cwd: repoPath });
      
      // Check if there are changes to commit
      try {
        await execAsync("git diff --cached --exit-code", { cwd: repoPath });
        // No changes to commit
        return false;
      } catch {
        // There are changes to commit
      }
      
      // Commit changes
      await execAsync(`git commit -m "${commitMessage}"`, { cwd: repoPath });
      
      // Push changes
      await execAsync("git push", { cwd: repoPath });
      
      return true;
    } catch (error) {
      throw new Error(`Failed to sync changes: ${error}`);
    }
  }

  async cleanup(repoPath: string) {
    try {
      await execAsync(`rm -rf "${repoPath}"`, { cwd: this.workingDir });
    } catch (error) {
      console.error(`Failed to cleanup repository: ${error}`);
    }
  }
}
