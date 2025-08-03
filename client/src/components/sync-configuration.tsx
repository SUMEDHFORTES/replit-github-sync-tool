import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Project } from "@shared/schema";

interface SyncConfigurationProps {
  project: Project;
  onClose: () => void;
  onSave: () => void;
}

export default function SyncConfiguration({ project, onClose, onSave }: SyncConfigurationProps) {
  const [repositoryName, setRepositoryName] = useState(project.repositoryName || project.name);
  const [description, setDescription] = useState(project.description || "");
  const [isPrivate, setIsPrivate] = useState(project.isPrivate || false);
  const [autoSync, setAutoSync] = useState(project.autoSync || false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/projects/${project.id}`, {
        repositoryName,
        description,
        isPrivate,
        autoSync,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuration Saved",
        description: "Project configuration has been updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      onSave();
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate();
  };

  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Sync Configuration</CardTitle>
          <CardDescription>Configure how this project syncs to GitHub</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="repositoryName">Repository Name</Label>
            <Input
              id="repositoryName"
              value={repositoryName}
              onChange={(e) => setRepositoryName(e.target.value)}
              placeholder="my-awesome-project"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of this project..."
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="private"
              checked={isPrivate}
              onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
            />
            <Label htmlFor="private" className="text-sm">
              Make repository private
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoSync"
              checked={autoSync}
              onCheckedChange={(checked) => setAutoSync(checked as boolean)}
            />
            <Label htmlFor="autoSync" className="text-sm">
              Enable automatic sync on changes
            </Label>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="bg-primary text-white hover:bg-blue-700"
            >
              {updateMutation.isPending ? "Saving..." : "Save Configuration"}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
