import { Octokit } from "@octokit/rest";

export class GitHubService {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token,
    });
  }

  async getUser() {
    try {
      const response = await this.octokit.rest.users.getAuthenticated();
      return response.data;
    } catch (error) {
      throw new Error("Failed to authenticate with GitHub");
    }
  }

  async createRepository(name: string, description?: string, isPrivate: boolean = false) {
    try {
      const response = await this.octokit.rest.repos.createForAuthenticatedUser({
        name,
        description,
        private: isPrivate,
        auto_init: true,
      });
      return response.data;
    } catch (error: any) {
      if (error.status === 422) {
        throw new Error("Repository name already exists");
      }
      throw new Error("Failed to create repository");
    }
  }

  async getRepository(owner: string, repo: string) {
    try {
      const response = await this.octokit.rest.repos.get({
        owner,
        repo,
      });
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async updateRepository(owner: string, repo: string, name?: string, description?: string, isPrivate?: boolean) {
    try {
      const response = await this.octokit.rest.repos.update({
        owner,
        repo,
        name,
        description,
        private: isPrivate,
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to update repository");
    }
  }
}
