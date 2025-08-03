import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Code, 
  Laptop, 
  Bot, 
  Leaf, 
  CheckCircle, 
  Clock, 
  TriangleAlert,
  Settings,
  RefreshCw,
  RotateCcw,
  Github,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Project } from "@shared/schema";

interface ProjectItemProps {
  project: Project;
  onConfigureProject: (project: Project) => void;
}

const getProjectIcon = (language: string | null) => {
  switch (language?.toLowerCase()) {
    case "react":
      return <Code className="text-primary" />;
    case "javascript":
      return <Laptop className="text-warning" />;
    case "python":
      return <Bot className="text-purple-600" />;
    case "node.js":
      return <Leaf className="text-green-600" />;
    default:
      return <Code className="text-gray-600" />;
  }
};

const getIconBackground = (language: string | null) => {
  switch (language?.toLowerCase()) {
    case "react":
      return "bg-blue-100";
    case "javascript":
      return "bg-yellow-100";
    case "python":
      return "bg-purple-100";
    case "node.js":
      return "bg-green-100";
    default:
      return "bg-gray-100";
  }
};

const formatTimeAgo = (date: Date | string | null) => {
  if (!date) return "Never";
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `Updated ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `Updated ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    return "Updated recently";
  }
};

export default function ProjectItem({ project, onConfigureProject }: ProjectItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${project.id}/sync`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sync Started",
        description: `${project.name} is being synced to GitHub`,
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

  const handleSync = () => {
    syncMutation.mutate();
  };

  const renderStatusBadge = () => {
    switch (project.syncStatus) {
      case "synced":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="mr-1" size={12} />
            Synced
          </Badge>
        );
      case "syncing":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-800 mr-1"></div>
            Syncing...
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <TriangleAlert className="mr-1" size={12} />
            Sync failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <Clock className="mr-1" size={12} />
            Not synced
          </Badge>
        );
    }
  };

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-10 h-10 ${getIconBackground(project.language)} rounded-lg flex items-center justify-center`}>
            {getProjectIcon(project.language)}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{project.name}</h3>
            <div className="flex items-center space-x-4 mt-1">
              {project.language && (
                <span className="text-sm text-gray-500">{project.language}</span>
              )}
              <span className="text-sm text-gray-500">
                {formatTimeAgo(project.lastModified)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {renderStatusBadge()}
            
            {project.syncStatus === "syncing" && project.syncProgress && (
              <div className="w-24">
                <Progress value={parseInt(project.syncProgress)} className="h-1.5" />
              </div>
            )}
            
            {project.syncStatus === "synced" && project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-primary flex items-center"
              >
                <Github className="mr-1" size={12} />
                View on GitHub
              </a>
            )}
            
            {project.syncStatus === "error" && project.errorMessage && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 p-1"
                onClick={() => toast({
                  title: "Sync Error",
                  description: project.errorMessage || "Unknown error occurred",
                  variant: "destructive",
                })}
              >
                <Info size={16} />
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onConfigureProject(project)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Settings size={16} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSync}
              disabled={project.syncStatus === "syncing" || syncMutation.isPending}
              className="p-2 text-primary hover:text-blue-700"
            >
              {project.syncStatus === "syncing" ? (
                <RefreshCw className="animate-spin" size={16} />
              ) : project.syncStatus === "error" ? (
                <RotateCcw size={16} />
              ) : (
                <RefreshCw size={16} />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
