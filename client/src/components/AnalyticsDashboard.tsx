import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Target, BarChart3 } from "lucide-react";
import { AnalyticsStats } from "@shared/analytics";

export default function AnalyticsDashboard() {
  const { data: analytics, isLoading, error } = useQuery<AnalyticsStats>({
    queryKey: ["/api/analytics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} data-testid={`skeleton-card-${i}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
        <Card data-testid="error-card">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Unable to load analytics data. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) return null;

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatPercent = (value: number) => `${Math.round(value)}%`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight" data-testid="dashboard-title">
          Analytics Dashboard
        </h2>
        <Badge variant="outline" data-testid="live-indicator">
          Live Data
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="total-requests-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="total-requests-value">
              {analytics.totalRequests}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.successfulRequests} successful
            </p>
          </CardContent>
        </Card>

        <Card data-testid="success-rate-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="success-rate-value">
              {formatPercent(analytics.successRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.failedRequests} failed requests
            </p>
          </CardContent>
        </Card>

        <Card data-testid="avg-time-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Generation Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="avg-time-value">
              {analytics.averageGenerationTime > 0 
                ? formatDuration(analytics.averageGenerationTime)
                : "N/A"
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Per successful request
            </p>
          </CardContent>
        </Card>

        <Card data-testid="most-popular-style-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular Style</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="most-popular-style-value">
              {(() => {
                const { professional, casual, creative } = analytics.styleBreakdown;
                const max = Math.max(professional, casual, creative);
                if (max === 0) return "N/A";
                if (professional === max) return "Professional";
                if (casual === max) return "Casual";
                return "Creative";
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              Style preference
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Style Breakdown */}
      <Card data-testid="style-breakdown-card">
        <CardHeader>
          <CardTitle>Style Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.styleBreakdown).map(([style, count]) => {
              const percentage = analytics.totalRequests > 0 
                ? (count / analytics.totalRequests) * 100 
                : 0;
              
              return (
                <div key={style} className="space-y-2" data-testid={`style-${style}-breakdown`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium">{style}</span>
                    <span className="text-muted-foreground">
                      {count} ({formatPercent(percentage)})
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                      data-testid={`style-${style}-bar`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {analytics.recentEvents.length > 0 && (
        <Card data-testid="recent-activity-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentEvents.slice(0, 5).map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                  data-testid={`recent-event-${event.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={event.success ? "default" : "destructive"}
                      data-testid={`event-status-${event.id}`}
                    >
                      {event.success ? "Success" : "Failed"}
                    </Badge>
                    <span className="text-sm capitalize" data-testid={`event-style-${event.id}`}>
                      {event.style || "Unknown"} style
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground" data-testid={`event-time-${event.id}`}>
                      {event.generationTime ? formatDuration(event.generationTime) : "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`event-timestamp-${event.id}`}>
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}