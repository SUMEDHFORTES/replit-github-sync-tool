import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Github, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function GitHubSetup() {
  const [token, setToken] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const connectMutation = useMutation({
    mutationFn: async (githubToken: string) => {
      const response = await apiRequest("POST", "/api/github/connect", { githubToken });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "GitHub Connected",
        description: "Successfully connected to GitHub",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/github/config"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast({
        title: "Invalid Token",
        description: "Please enter a valid GitHub personal access token",
        variant: "destructive",
      });
      return;
    }
    connectMutation.mutate(token);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Github className="mr-2" size={20} />
          Connect to GitHub
        </CardTitle>
        <CardDescription>
          Enter your GitHub personal access token to sync your Replit projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Personal Access Token
            </Label>
            <Input
              id="token"
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <Info className="mr-1" size={12} />
              Need a token?{" "}
              <a
                href="https://github.com/settings/tokens/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-1"
              >
                Generate one on GitHub
              </a>
            </p>
          </div>
          <Button 
            type="submit" 
            disabled={connectMutation.isPending}
            className="bg-primary text-white hover:bg-blue-700"
          >
            <Github className="mr-2" size={16} />
            {connectMutation.isPending ? "Connecting..." : "Connect GitHub"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
