import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Github } from "lucide-react";
import GitHubSetup from "@/components/github-setup";
import ProjectsList from "@/components/projects-list";
import SyncConfiguration from "@/components/sync-configuration";
import type { Project } from "@shared/schema";

export default function Home() {
  const [configProject, setConfigProject] = useState<Project | null>(null);

  const { data: githubStatus, isLoading: isLoadingGithub } = useQuery({
    queryKey: ["/api/github/config"],
  });

  const { data: projects = [], isLoading: isLoadingProjects, refetch: refetchProjects } = useQuery({
    queryKey: ["/api/projects"],
    enabled: githubStatus?.connected,
  });

  const handleConfigureProject = (project: Project) => {
    setConfigProject(project);
  };

  const handleCloseConfig = () => {
    setConfigProject(null);
  };

  if (isLoadingGithub) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Github className="text-2xl text-gray-800" size={32} />
            <h1 className="text-2xl font-semibold text-gray-900">Replit → GitHub Sync</h1>
          </div>
          {githubStatus?.connected && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-sm text-gray-600">Connected as {githubStatus.username}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {!githubStatus?.connected ? (
          <GitHubSetup />
        ) : (
          <>
            <ProjectsList 
              projects={projects}
              isLoading={isLoadingProjects}
              onRefresh={refetchProjects}
              onConfigureProject={handleConfigureProject}
            />
            
            {configProject && (
              <SyncConfiguration
                project={configProject}
                onClose={handleCloseConfig}
                onSave={() => {
                  handleCloseConfig();
                  refetchProjects();
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
