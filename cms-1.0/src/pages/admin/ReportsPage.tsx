import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Calendar, Users } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

export function ReportsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [reportType, setReportType] = useState<"requests" | "clients" | "teams">("requests");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [status, setStatus] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const generateReport = async () => {
    try {
      setLoading(true);
      let response;

      const params: any = {};
      if (startDate) params.start_date = format(startDate, "yyyy-MM-dd");
      if (endDate) params.end_date = format(endDate, "yyyy-MM-dd");
      if (status !== "all") params.status = status;

      switch (reportType) {
        case "requests":
          response = await apiClient.getRequestsReport(params);
          break;
        case "clients":
          response = await apiClient.getClientsReport(params);
          break;
        case "teams":
          response = await apiClient.getTeamsReport();
          break;
      }

      if (response?.success) {
        setReportData(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params: any = {
        format: "csv",
      };
      if (startDate) params.start_date = format(startDate, "yyyy-MM-dd");
      if (endDate) params.end_date = format(endDate, "yyyy-MM-dd");
      if (status !== "all") params.status = status;

      let blob;
      if (reportType === "requests") {
        blob = await apiClient.exportRequests(params);
      } else if (reportType === "clients") {
        blob = await apiClient.exportClients(params);
      } else {
        toast({
          title: "Info",
          description: "Team export not available yet",
        });
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}_report_${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Success",
        description: "Report exported successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1">Reports</h1>
        <Button onClick={handleExport} disabled={!reportData}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>Select report type and filters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={(v) => setReportType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="requests">Requests Report</SelectItem>
                  <SelectItem value="clients">Clients Report</SelectItem>
                  <SelectItem value="teams">Teams Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === "requests" && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Start Date</Label>
              <DatePicker date={startDate} onDateChange={setStartDate} />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <DatePicker date={endDate} onDateChange={setEndDate} />
            </div>
          </div>

          <Button onClick={generateReport} disabled={loading}>
            {loading ? "Generating..." : "Generate Report"}
          </Button>
        </CardContent>
      </Card>

      {reportData && (
        <Tabs defaultValue="data" className="space-y-4">
          <TabsList>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Report Data</CardTitle>
              </CardHeader>
              <CardContent>
                {reportType === "requests" && reportData.requests && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Business</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.requests.data?.map((req: any) => (
                        <TableRow key={req.id}>
                          <TableCell>#{req.id}</TableCell>
                          <TableCell>{req.request_type?.name}</TableCell>
                          <TableCell>{req.business?.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{req.status}</Badge>
                          </TableCell>
                          <TableCell>{format(new Date(req.created_at), "PP")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {reportType === "clients" && reportData.clients && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Businesses</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.clients.data?.map((client: any) => (
                        <TableRow key={client.id}>
                          <TableCell>
                            {client.first_name} {client.last_name}
                          </TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>
                            <Badge variant={client.status === "active" ? "default" : "secondary"}>
                              {client.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{client.businesses?.length || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {reportType === "teams" && reportData.teams && (
                  <div className="space-y-4">
                    {reportData.teams.map((team: any) => (
                      <Card key={team.id}>
                        <CardHeader>
                          <CardTitle>{team.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Members</p>
                              <p className="text-2xl font-bold">{team.members_count}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Total Requests</p>
                              <p className="text-2xl font-bold">{team.total_requests}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Completed</p>
                              <p className="text-2xl font-bold text-green-600">{team.completed_requests}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Overdue</p>
                              <p className="text-2xl font-bold text-red-600">{team.overdue_requests}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {reportType === "requests" && reportData.summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{reportData.summary.total}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">By Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {Object.entries(reportData.summary.by_status || {}).map(([status, count]) => (
                            <div key={status} className="flex justify-between text-sm">
                              <span>{status}</span>
                              <Badge>{count as number}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Avg Completion</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{reportData.summary.avg_completion_time || 0}h</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">SLA Compliance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {reportData.summary.sla_compliance?.compliance_rate || 0}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {reportType === "clients" && reportData.summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Clients</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{reportData.summary.total}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Active</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-green-600">{reportData.summary.active}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Suspended</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-red-600">{reportData.summary.suspended}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">New This Month</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{reportData.summary.new_this_month}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
