import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { Query } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

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

  const { data: queries, isLoading } = useQuery<Query[]>({
    queryKey: ["/api/queries", 0, 100],
    enabled: isAuthenticated,
    retry: false,
  });

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const analytics = {
    totalQueries: queries?.length || 0,
    avgConfidence: queries && queries.length > 0
      ? queries.reduce((sum, q) => sum + ((q.responseData as any).synthesis?.confidence || 0), 0) / queries.length
      : 0,
    confidenceDistribution: [
      { name: "High (80-100%)", value: queries?.filter(q => ((q.responseData as any).synthesis?.confidence || 0) >= 0.8).length || 0, color: "#10b981" },
      { name: "Medium (50-79%)", value: queries?.filter(q => {
        const conf = (q.responseData as any).synthesis?.confidence || 0;
        return conf >= 0.5 && conf < 0.8;
      }).length || 0, color: "#f59e0b" },
      { name: "Low (<50%)", value: queries?.filter(q => ((q.responseData as any).synthesis?.confidence || 0) < 0.5).length || 0, color: "#ef4444" },
    ],
    queriesByDay: queries?.reduce((acc, q) => {
      const date = new Date(q.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {},
  };

  const queriesByDayData = Object.entries(analytics.queriesByDay).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    queries: count,
  })).slice(-7);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Track your consensus query patterns and model agreement metrics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card data-testid="card-total-queries">
          <CardHeader className="pb-2">
            <CardDescription>Total Queries</CardDescription>
            <CardTitle className="text-3xl" data-testid="text-total-queries">
              {analytics.totalQueries}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card data-testid="card-avg-confidence">
          <CardHeader className="pb-2">
            <CardDescription>Avg Confidence</CardDescription>
            <CardTitle className="text-3xl" data-testid="text-avg-confidence">
              {(analytics.avgConfidence * 100).toFixed(0)}%
            </CardTitle>
          </CardHeader>
        </Card>

        <Card data-testid="card-quota-used">
          <CardHeader className="pb-2">
            <CardDescription>Queries Used</CardDescription>
            <CardTitle className="text-3xl" data-testid="text-queries-used">
              {user?.queriesUsed || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card data-testid="card-quota-remaining">
          <CardHeader className="pb-2">
            <CardDescription>Quota Remaining</CardDescription>
            <CardTitle className="text-3xl" data-testid="text-quota-remaining">
              {user?.quotaRemaining || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Queries Over Time</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {queriesByDayData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={queriesByDayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="queries" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No query data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confidence Distribution</CardTitle>
            <CardDescription>Query confidence levels</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.totalQueries > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.confidenceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.confidenceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No confidence data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
