import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserPreferences } from "@shared/schema";

const MODELS = [
  { id: "gpt5", name: "GPT-5", description: "OpenAI's latest model" },
  { id: "claude", name: "Claude", description: "Anthropic's advanced AI" },
  { id: "gemini", name: "Gemini", description: "Google's multimodal model" },
  { id: "perplexity", name: "Perplexity", description: "Real-time web search" },
];

export default function Preferences() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [modelWeights, setModelWeights] = useState<Record<string, number>>({
    gpt5: 1,
    claude: 1,
    gemini: 1,
    perplexity: 1,
  });
  
  const [enabledModels, setEnabledModels] = useState<string[]>([
    "gpt5",
    "claude",
    "gemini",
    "perplexity",
  ]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: preferences, isLoading, error } = useQuery<UserPreferences>({
    queryKey: ["/api/preferences"],
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (preferences) {
      if (preferences.modelWeights) {
        setModelWeights(preferences.modelWeights as Record<string, number>);
      }
      if (preferences.enabledModels) {
        setEnabledModels(preferences.enabledModels as string[]);
      }
    }
  }, [preferences]);

  const mutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/preferences", {
        modelWeights,
        enabledModels,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preferences"] });
      toast({
        title: "Preferences saved",
        description: "Your model preferences have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleModel = (modelId: string) => {
    setEnabledModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  const updateWeight = (modelId: string, value: number[]) => {
    setModelWeights((prev) => ({
      ...prev,
      [modelId]: value[0],
    }));
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Skeleton className="h-10 w-48 mb-4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !isUnauthorizedError(error as Error)) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load preferences</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Model Preferences</h1>
        <p className="text-muted-foreground">
          Customize which AI models to use and their relative importance in consensus
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model Configuration</CardTitle>
          <CardDescription>
            Adjust weights (0-1) to control how much each model influences the final answer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {MODELS.map((model) => {
            const weight = modelWeights[model.id] || 1;
            const isEnabled = enabledModels.includes(model.id);
            
            return (
              <div key={model.id} className="space-y-4" data-testid={`model-config-${model.id}`}>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={`${model.id}-enabled`} className="text-base font-semibold">
                      {model.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">{model.description}</p>
                  </div>
                  <Switch
                    id={`${model.id}-enabled`}
                    checked={isEnabled}
                    onCheckedChange={() => toggleModel(model.id)}
                    data-testid={`switch-${model.id}`}
                  />
                </div>
                
                {isEnabled && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${model.id}-weight`} className="text-sm">
                        Weight
                      </Label>
                      <span className="text-sm font-medium" data-testid={`text-weight-${model.id}`}>
                        {weight.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      id={`${model.id}-weight`}
                      min={0}
                      max={1}
                      step={0.1}
                      value={[weight]}
                      onValueChange={(value) => updateWeight(model.id, value)}
                      data-testid={`slider-${model.id}`}
                    />
                  </div>
                )}
              </div>
            );
          })}
          
          <div className="pt-4 border-t">
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              data-testid="button-save-preferences"
            >
              {mutation.isPending ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
