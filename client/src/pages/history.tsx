import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, RefreshCw, Share2 } from "lucide-react";
import { format } from "date-fns";
import type { Query } from "@shared/schema";

export default function History() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [page, setPage] = useState(0);
  const limit = 20;

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

  const { data: queries, isLoading, error } = useQuery<Query[]>({
    queryKey: ["/api/queries", page, limit],
    enabled: isAuthenticated,
    retry: false,
  });

  const handleExport = (query: Query, format: "json" | "markdown") => {
    const response = query.responseData as any;
    let content: string;
    let filename: string;

    if (format === "json") {
      content = JSON.stringify(response, null, 2);
      filename = `council-query-${query.id}.json`;
    } else {
      content = `# Council Query\n\n**Question:** ${query.question}\n\n**Answer:** ${response.synthesis?.summary || "N/A"}\n\n**Confidence:** ${((response.synthesis?.confidence || 0) * 100).toFixed(0)}%\n\n## Citations\n${(response.synthesis?.citations || []).map((c: string, i: number) => `${i + 1}. ${c}`).join("\n")}\n\n## Decision Log\n${(response.synthesis?.decision_log || []).join("\n")}`;
      filename = `council-query-${query.id}.md`;
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = (query: Query) => {
    const url = `${window.location.origin}/query/${query.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Query link has been copied to clipboard.",
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    if (isUnauthorizedError(error as Error)) {
      return null;
    }
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load query history</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Query History</h1>
        <p className="text-muted-foreground">
          Review all your past consensus queries and their results
        </p>
      </div>

      <div className="space-y-4">
        {queries && queries.length > 0 ? (
          queries.map((query) => {
            const response = query.responseData as any;
            const confidence = response.synthesis?.confidence || 0;
            
            return (
              <Card key={query.id} data-testid={`card-query-${query.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-2" data-testid={`text-question-${query.id}`}>
                        {query.question}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {format(new Date(query.createdAt), "PPpp")}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={confidence > 0.8 ? "default" : confidence > 0.5 ? "secondary" : "destructive"}
                      data-testid={`badge-confidence-${query.id}`}
                    >
                      {(confidence * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4" data-testid={`text-summary-${query.id}`}>
                    {response.synthesis?.summary || "No summary available"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.location.href = `/?q=${encodeURIComponent(query.question)}`;
                      }}
                      data-testid={`button-reask-${query.id}`}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Re-Ask
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport(query, "json")}
                      data-testid={`button-export-json-${query.id}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      JSON
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport(query, "markdown")}
                      data-testid={`button-export-md-${query.id}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Markdown
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(query)}
                      data-testid={`button-share-${query.id}`}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No queries yet</CardTitle>
              <CardDescription>
                Start asking questions to build your query history
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      {queries && queries.length >= limit && (
        <div className="flex justify-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            data-testid="button-prev-page"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            data-testid="button-next-page"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
