import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ProjectItem from "./project-item";
import type { Project } from "@shared/schema";

interface ProjectsListProps {
  projects: Project[];
  isLoading: boolean;
  onRefresh: () => void;
  onConfigureProject: (project: Project) => void;
}

export default function ProjectsList({ 
  projects, 
  isLoading, 
  onRefresh, 
  onConfigureProject 
}: ProjectsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const syncAllMutation = useMutation({
    mutationFn: async () => {
      const promises = projects
        .filter(p => p.syncStatus !== "syncing")
        .map(project => 
          apiRequest("POST", `/api/projects/${project.id}/sync`, {})
        );
      await Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Sync Started",
        description: "All projects are being synced to GitHub",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Replit Projects</CardTitle>
            <CardDescription>Manage sync status for your projects</CardDescription>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="text-primary hover:text-blue-700"
            >
              <RefreshCw className="mr-1" size={16} />
              Refresh
            </Button>
            <Button
              onClick={() => syncAllMutation.mutate()}
              disabled={syncAllMutation.isPending || projects.length === 0}
              className="bg-primary text-white hover:bg-blue-700"
              size="sm"
            >
              <CloudUpload className="mr-2" size={16} />
              {syncAllMutation.isPending ? "Syncing..." : "Sync All"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No projects found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {projects.map((project) => (
              <ProjectItem
                key={project.id}
                project={project}
                onConfigureProject={onConfigureProject}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
