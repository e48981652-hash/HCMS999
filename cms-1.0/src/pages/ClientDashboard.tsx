import { useEffect, useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { Loader2, Plus, Calendar, FileText, Bell } from "lucide-react";
import { ChartContainer, LineChart, BarChart, PieChart } from "@/components/ui/charts";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export function ClientDashboard() {
  const { t } = useI18n();
  const { activeBusiness } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [activeBusiness]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (activeBusiness?.id) {
        params.business_id = activeBusiness.id;
      }
      const response = await apiClient.getClientDashboard();
      if (response.success && response.data) {
        setDashboard(response.data);
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = dashboard?.stats || {};
  const recentActivity = dashboard?.recent_activity || [];
  const requestsOverTime = dashboard?.requests_over_time || [];
  const statusDistribution = dashboard?.status_distribution || [];

  // Prepare chart data
  const requestsChartData = requestsOverTime.map((item: any) => ({
    name: item.date || item.period,
    requests: item.count || 0,
  }));

  const statusChartData = statusDistribution.map((item: any) => ({
    name: item.status,
    value: item.count || 0,
  }));

  // Timeline items
  const timelineItems: TimelineItem[] = recentActivity.slice(0, 5).map((activity: any, index: number) => {
    let variant: "default" | "success" | "warning" | "error" | "info" = "default";
    if (activity.type === "request_created") variant = "success";
    else if (activity.type === "request_completed") variant = "success";
    else if (activity.type === "request_updated") variant = "info";
    
    return {
      id: `activity-${index}`,
      title: activity.title || activity.type || "Activity",
      description: activity.description || activity.message,
      timestamp: new Date(activity.created_at || activity.timestamp),
      variant,
    };
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1">{t("client.dashboard.title")}</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/app/client/requests")} variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            View All Requests
          </Button>
          <Button onClick={() => navigate("/app/client/requests")} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Request
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Button
          variant="outline"
          className="h-auto flex-col items-start p-4"
          onClick={() => navigate("/app/client/requests")}
        >
          <Plus className="mb-2 h-6 w-6" />
          <span className="font-semibold">Create Request</span>
          <span className="text-xs text-muted-foreground">Submit a new request</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col items-start p-4"
          onClick={() => navigate("/app/client/my-requests")}
        >
          <FileText className="mb-2 h-6 w-6" />
          <span className="font-semibold">My Requests</span>
          <span className="text-xs text-muted-foreground">View your requests</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col items-start p-4"
          onClick={() => navigate("/app/client/mcp")}
        >
          <Calendar className="mb-2 h-6 w-6" />
          <span className="font-semibold">MCP Calendar</span>
          <span className="text-xs text-muted-foreground">View content plan</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col items-start p-4"
          onClick={() => navigate("/app/client/support")}
        >
          <Bell className="mb-2 h-6 w-6" />
          <span className="font-semibold">Support</span>
          <span className="text-xs text-muted-foreground">Get help</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("client.dashboard.activeRequests")}</CardTitle>
            <CardDescription>Track your active requests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.active_requests || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("client.dashboard.mcpProgress")}</CardTitle>
            <CardDescription>Monthly content plan progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.mcp_progress || 0}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("client.dashboard.adminRequests")}</CardTitle>
            <CardDescription>New requests from admin</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.admin_requests || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {requestsChartData.length > 0 && (
          <ChartContainer
            title="Requests Over Time"
            description="Your requests activity for the past period"
          >
            <LineChart
              data={requestsChartData}
              lines={[{ dataKey: "requests", name: "Requests", color: "hsl(var(--primary))" }]}
              height={300}
            />
          </ChartContainer>
        )}

        {statusChartData.length > 0 && (
          <ChartContainer
            title="Requests by Status"
            description="Distribution of your requests by status"
          >
            <PieChart data={statusChartData} height={300} />
          </ChartContainer>
        )}
      </div>

      {/* Recent Activity Timeline */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("client.dashboard.recentActivity") || "Recent Activity"}</CardTitle>
            <CardDescription>Latest updates on your requests</CardDescription>
          </CardHeader>
          <CardContent>
            {timelineItems.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-8 w-8" />}
                title="No Recent Activity"
                description="Your recent activity will appear here"
              />
            ) : (
              <Timeline items={timelineItems} />
            )}
          </CardContent>
        </Card>

        {/* Notifications Widget */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Recent notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<Bell className="h-8 w-8" />}
              title="No New Notifications"
              description="You're all caught up!"
              action={{
                label: "View All",
                onClick: () => {},
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
