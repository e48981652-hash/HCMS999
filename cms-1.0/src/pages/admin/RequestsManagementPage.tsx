import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText, Filter, Download, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";

export function RequestsManagementPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [businessFilter, setBusinessFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadRequests();
  }, [statusFilter, businessFilter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      const response = await apiClient.getRequests(params);
      if (response.success) {
        const data = response.data?.data || response.data || [];
        setRequests(Array.isArray(data) ? data : []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    let filtered = requests;

    if (searchQuery) {
      filtered = filtered.filter(
        (req) =>
          req.id.toString().includes(searchQuery) ||
          req.request_type?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.business?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (businessFilter !== "all") {
      filtered = filtered.filter((req) => req.business_id?.toString() === businessFilter);
    }

    return filtered;
  }, [requests, searchQuery, businessFilter]);

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;

    try {
      await apiClient.bulkDeleteRequests(selectedRows);
      toast({
        title: "Success",
        description: `${selectedRows.length} requests deleted successfully`,
      });
      setSelectedRows([]);
      loadRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete requests",
        variant: "destructive",
      });
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedRows.length === 0) return;

    try {
      await apiClient.bulkUpdateRequests(selectedRows, { status });
      toast({
        title: "Success",
        description: `${selectedRows.length} requests updated successfully`,
      });
      setSelectedRows([]);
      loadRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update requests",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    try {
      const blob = await apiClient.exportRequests({
        format: "csv",
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `requests_${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Success",
        description: "Requests exported successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export requests",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => `#${row.getValue("id")}`,
    },
    {
      accessorKey: "request_type.name",
      header: "Type",
      cell: ({ row }) => row.original.request_type?.name || "N/A",
    },
    {
      accessorKey: "business.name",
      header: "Business",
      cell: ({ row }) => row.original.business?.name || "N/A",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) =>
        format(new Date(row.getValue("created_at")), "MMM dd, yyyy"),
    },
    {
      accessorKey: "due_at",
      header: "Due Date",
      cell: ({ row }) =>
        row.original.due_at
          ? format(new Date(row.original.due_at), "MMM dd, yyyy")
          : "-",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/app/admin/requests/${row.original.id}`)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1">Requests Management</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
          <CardDescription>Manage and monitor all system requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedRows.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedRows.length} selected
              </span>
              <div className="flex gap-2 ml-auto">
                <Select onValueChange={handleBulkStatusUpdate}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Change status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {filteredRequests.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-12 w-12" />}
              title="No Requests"
              description="No requests found matching your filters"
            />
          ) : (
            <DataTable
              columns={columns}
              data={filteredRequests}
              onRowSelectionChange={(rows) =>
                setSelectedRows(rows.map((r) => r.id))
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
