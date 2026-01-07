import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, LineChart, BarChart, PieChart } from "@/components/ui/charts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react";

export function AnalyticsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [requestsData, setRequestsData] = useState<any>(null);
  const [teamsData, setTeamsData] = useState<any>(null);

  useEffect(() => {
    loadDashboardAnalytics();
  }, [period]);

  const loadDashboardAnalytics = async () => {
    try {
      setLoading(true);
      const [dashboard, requests, teams] = await Promise.all([
        apiClient.getAnalyticsDashboard({ period }),
        apiClient.getAnalyticsRequests({}),
        apiClient.getAnalyticsTeams({}),
      ]);

      if (dashboard?.success) setDashboardData(dashboard.data);
      if (requests?.success) setRequestsData(requests.data);
      if (teams?.success) setTeamsData(teams.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  const requestsOverTime = dashboardData?.requests_over_time?.map((item: any) => ({
    name: item.date,
    requests: item.count,
  })) || [];

  const statusDistribution = Object.entries(dashboardData?.requests_by_status || {}).map(([name, value]) => ({
    name,
    value: value as number,
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1">Analytics</h1>
        <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Requests Over Time
                </CardTitle>
                <CardDescription>Request creation trend</CardDescription>
              </CardHeader>
              <CardContent>
                {requestsOverTime.length > 0 ? (
                  <ChartContainer height={300}>
                    <LineChart
                      data={requestsOverTime}
                      lines={[{ key: "requests", stroke: "hsl(var(--primary))" }]}
                      xAxisKey="name"
                    />
                  </ChartContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-12">No data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Status Distribution
                </CardTitle>
                <CardDescription>Requests by status</CardDescription>
              </CardHeader>
              <CardContent>
                {statusDistribution.length > 0 ? (
                  <ChartContainer height={300}>
                    <PieChart data={statusDistribution} dataKey="value" nameKey="name" />
                  </ChartContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-12">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          {requestsData && (
            <Card>
              <CardHeader>
                <CardTitle>Request Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Completion Time</p>
                    <p className="text-2xl font-bold">{requestsData.completion_time?.avg_hours || 0}h</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Min Time</p>
                    <p className="text-2xl font-bold">{requestsData.completion_time?.min_hours || 0}h</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Max Time</p>
                    <p className="text-2xl font-bold">{requestsData.completion_time?.max_hours || 0}h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          {teamsData?.teams && (
            <div className="grid gap-4">
              {teamsData.teams.map((team: any) => (
                <Card key={team.team_id}>
                  <CardHeader>
                    <CardTitle>{team.team_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Completion Rate</p>
                        <p className="text-2xl font-bold">{team.completion_rate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Requests</p>
                        <p className="text-2xl font-bold">{team.total_requests}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Time</p>
                        <p className="text-2xl font-bold">{team.avg_completion_time_hours}h</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">SLA Compliance</p>
                        <p className="text-2xl font-bold">{team.sla_compliance_rate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
