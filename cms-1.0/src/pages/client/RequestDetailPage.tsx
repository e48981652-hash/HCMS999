import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DynamicFormView, DynamicForm, FieldDefinition } from "@/components/DynamicForm";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { StatusBadge } from "@/components/ui/status-badge";
import { ImageGallery, ImageGalleryItem } from "@/components/ui/image-gallery";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare, Paperclip, Download, Trash2, Send, ArrowLeft, Edit, Save, X, History, Users, Link as LinkIcon, Eye } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [request, setRequest] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [relatedRequests, setRelatedRequests] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [assignedTeamId, setAssignedTeamId] = useState<string>("");
  const [assignedUserId, setAssignedUserId] = useState<string>("");

  useEffect(() => {
    if (id) {
      loadRequestData();
    }
  }, [id]);

  const loadRequestData = async () => {
    try {
      setLoading(true);
      const [requestResponse, commentsResponse, attachmentsResponse] = await Promise.all([
        apiClient.getRequest(id!),
        apiClient.getRequestComments(id!),
        apiClient.getRequestAttachments(id!),
      ]);

      if (requestResponse.success && requestResponse.data) {
        const requestData = requestResponse.data;
        setRequest(requestData);
        setStatus(requestData.status);
        setAssignedTeamId(requestData.assigned_team_id?.toString() || "");
        setAssignedUserId(requestData.assigned_user_id?.toString() || "");
        
        // Build activity log from comments and status changes
        const activities: any[] = [];
        
        // Add creation activity
        activities.push({
          id: `created-${requestData.id}`,
          type: "created",
          title: "Request Created",
          description: `Request was created`,
          timestamp: requestData.created_at,
          user: requestData.creator,
        });
        
        // Add status change activities
        if (requestData.status_history) {
          requestData.status_history.forEach((history: any) => {
            activities.push({
              id: `status-${history.id}`,
              type: "status_change",
              title: "Status Changed",
              description: `Status changed to ${history.status}`,
              timestamp: history.created_at,
              user: history.user,
              metadata: { status: history.status },
            });
          });
        }
        
        // Add comment activities
        if (commentsResponse.success) {
          const commentsData = commentsResponse.data?.data || commentsResponse.data || [];
          commentsData.forEach((comment: any) => {
            activities.push({
              id: `comment-${comment.id}`,
              type: "comment",
              title: "Comment Added",
              description: comment.content,
              timestamp: comment.created_at,
              user: comment.user,
            });
          });
          setComments(commentsData);
        }
        
        // Add assignment activities
        if (requestData.assigned_team) {
          activities.push({
            id: `assign-team-${requestData.id}`,
            type: "assignment",
            title: "Assigned to Team",
            description: `Assigned to ${requestData.assigned_team.name}`,
            timestamp: requestData.updated_at,
            metadata: { team: requestData.assigned_team.name },
          });
        }
        
        // Sort activities by timestamp
        activities.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setActivityLog(activities);
      }

      if (attachmentsResponse.success) {
        setAttachments(attachmentsResponse.data?.data || attachmentsResponse.data || []);
      }
      
      // Load teams and staff users for assignment
      if (user?.role === "admin" || user?.role === "staff") {
        try {
          const teamsResponse = await apiClient.getTeams();
          if (teamsResponse.success) {
            setTeams(teamsResponse.data?.data || teamsResponse.data || []);
          }
        } catch (error) {
          console.error("Failed to load teams:", error);
        }
        
        // For staff users, we'll get them from teams or make a separate API call if needed
        // For now, we'll skip staff users loading as it requires a specific endpoint
      }
      
      // Load related requests (same business or request type)
      if (requestResponse.success && requestResponse.data) {
        const relatedParams: any = {
          business_id: requestResponse.data.business_id,
        };
        try {
          const relatedResponse = await apiClient.getRequests(relatedParams);
          if (relatedResponse.success) {
            const allRequests = relatedResponse.data?.data || relatedResponse.data || [];
            const related = allRequests
              .filter((r: any) => r.id !== parseInt(id!))
              .slice(0, 5);
            setRelatedRequests(related);
          }
        } catch (error) {
          // Ignore errors for related requests
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load request details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) return;

    try {
      setSubmittingComment(true);
      const response = await apiClient.createComment(id!, commentContent);
      
      if (response.success) {
        setCommentContent("");
        loadRequestData();
        toast({
          title: "Success",
          description: "Comment added successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const response = await apiClient.uploadAttachment(id!, file);
      
      if (response.success) {
        loadRequestData();
        toast({
          title: "Success",
          description: "File uploaded successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      const response = await apiClient.deleteAttachment(attachmentId);
      if (response.success) {
        loadRequestData();
        toast({
          title: "Success",
          description: "File deleted successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const handleDownloadAttachment = async (attachmentId: string, fileName: string) => {
    try {
      const blob = await apiClient.downloadAttachment(attachmentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await apiClient.updateRequest(id!, { status });
      if (response.success) {
        toast({
          title: "Success",
          description: "Status updated successfully",
        });
        loadRequestData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in-progress":
        return "secondary";
      case "waiting":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Skeleton variant="card" className="h-64" />
            <Skeleton variant="card" className="h-64" />
          </div>
          <div className="space-y-6">
            <Skeleton variant="card" className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Request not found</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fields: FieldDefinition[] = request.request_type?.fields?.map((field: any) => ({
    field_key: field.field_key,
    label: field.label,
    type: field.type,
    required: field.required || false,
    options: field.options || {},
    validation: field.validation,
    order: field.order || 0,
  })) || [];

  const fieldValues: Record<string, any> = {};
  if (request.field_values) {
    request.field_values.forEach((fv: any) => {
      fieldValues[fv.field_key] = fv.value_json || fv.value_text;
    });
  }

  const canUpdateStatus = user?.role === "admin" || user?.role === "staff";
  const canEdit = user?.role === "admin" || user?.role === "staff" || request?.creator_id === user?.id;
  const canAssign = user?.role === "admin" || user?.role === "staff";

  // Prepare timeline items from activity log
  const timelineItems: TimelineItem[] = useMemo(() => {
    return activityLog.map((activity) => {
      let variant: "default" | "success" | "warning" | "error" | "info" = "default";
      if (activity.type === "created") variant = "success";
      else if (activity.type === "status_change" && activity.metadata?.status === "completed") variant = "success";
      else if (activity.type === "comment") variant = "info";
      else if (activity.type === "assignment") variant = "info";
      
      return {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        timestamp: activity.timestamp,
        variant,
        metadata: activity.metadata,
      };
    });
  }, [activityLog]);

  // Prepare image gallery items from attachments
  const imageGalleryItems: ImageGalleryItem[] = useMemo(() => {
    return attachments
      .filter((att) => att.mime_type?.startsWith("image/"))
      .map((att) => ({
        src: att.url || `/api/v1/attachments/${att.id}/download`,
        alt: att.file_name,
        title: att.file_name,
      }));
  }, [attachments]);

  const handleSaveEdit = async (formData: Record<string, any>) => {
    try {
      const response = await apiClient.updateRequest(id!, { fields: formData });
      if (response.success) {
        setIsEditMode(false);
        loadRequestData();
        toast({
          title: "Success",
          description: "Request updated successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update request",
        variant: "destructive",
      });
    }
  };

  const handleAssignTeam = async () => {
    try {
      const response = await apiClient.updateRequest(id!, {
        assigned_team_id: assignedTeamId ? parseInt(assignedTeamId) : null,
      });
      if (response.success) {
        loadRequestData();
        toast({
          title: "Success",
          description: "Team assignment updated",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign team",
        variant: "destructive",
      });
    }
  };

  const handleAssignUser = async () => {
    try {
      const response = await apiClient.updateRequest(id!, {
        assigned_user_id: assignedUserId ? parseInt(assignedUserId) : null,
      });
      if (response.success) {
        loadRequestData();
        toast({
          title: "Success",
          description: "User assignment updated",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign user",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-h1">{request.request_type?.name || "Request"}</h1>
            <p className="text-muted-foreground">Request #{request.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
            >
              {isEditMode ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel Edit
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          )}
          <StatusBadge status={request.status} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Request Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditMode && canEdit ? (
                    <DynamicForm
                      fields={fields}
                      defaultValues={fieldValues}
                      onSubmit={handleSaveEdit}
                      submitLabel="Save Changes"
                    />
                  ) : (
                    <DynamicFormView fields={fields} values={fieldValues} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Request Timeline</CardTitle>
                  <CardDescription>Complete history of this request</CardDescription>
                </CardHeader>
                <CardContent>
                  {timelineItems.length === 0 ? (
                    <EmptyState
                      icon={<History className="h-8 w-8" />}
                      title="No Timeline Data"
                      description="Timeline events will appear here"
                    />
                  ) : (
                    <Timeline items={timelineItems} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>Detailed activity history</CardDescription>
                </CardHeader>
                <CardContent>
                  {activityLog.length === 0 ? (
                    <EmptyState
                      icon={<History className="h-8 w-8" />}
                      title="No Activity"
                      description="Activity log will appear here"
                    />
                  ) : (
                    <div className="space-y-4">
                      {activityLog.map((activity) => (
                        <div key={activity.id} className="p-4 border rounded-lg space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{activity.title}</h4>
                              <p className="text-sm text-muted-foreground">{activity.description}</p>
                            </div>
                            <time className="text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(activity.timestamp), "PPp")}
                            </time>
                          </div>
                          {activity.user && (
                            <p className="text-xs text-muted-foreground">
                              by {activity.user.first_name} {activity.user.last_name}
                            </p>
                          )}
                          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {Object.entries(activity.metadata).map(([key, value]) => (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {key}: {String(value)}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          {comment.user?.first_name} {comment.user?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(comment.created_at), "PPp")}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    <Separator />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={submittingComment || !commentContent.trim()}
                  size="sm"
                >
                  {submittingComment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="file"
                  onChange={handleUploadFile}
                  disabled={uploadingFile}
                />
                {uploadingFile && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </p>
                )}
              </div>

              {/* Image Gallery for image attachments */}
              {imageGalleryItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Images</h4>
                  <ImageGallery images={imageGalleryItems} />
                </div>
              )}

              {/* File list for non-image attachments */}
              <div className="space-y-2">
                {attachments
                  .filter((att) => !att.mime_type?.startsWith("image/"))
                  .map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{attachment.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(attachment.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDownloadAttachment(attachment.id, attachment.file_name)
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {(attachment.uploaded_by?.id === user?.id ||
                          user?.role === "admin") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAttachment(attachment.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              {attachments.length === 0 && (
                <EmptyState
                  icon={<Paperclip className="h-8 w-8" />}
                  title="No Attachments"
                  description="Upload files to attach them to this request"
                />
              )}
            </CardContent>
          </Card>
          
          {/* Related Requests */}
          {relatedRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Related Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {relatedRequests.map((relatedRequest) => (
                    <div
                      key={relatedRequest.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/app/client/requests/${relatedRequest.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {relatedRequest.request_type?.name || "Request"} #{relatedRequest.id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(relatedRequest.created_at), "PPp")}
                          </p>
                        </div>
                        <StatusBadge status={relatedRequest.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                {canUpdateStatus ? (
                  <div className="space-y-2 mt-2">
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="waiting">Waiting</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleUpdateStatus} size="sm" className="w-full">
                      Update Status
                    </Button>
                  </div>
                ) : (
                  <p className="mt-1">{request.status}</p>
                )}
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground">Business</p>
                <p className="mt-1">{request.business?.name}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="mt-1">
                  {format(new Date(request.created_at), "PPp")}
                </p>
              </div>

              {request.due_at && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                    <p className="mt-1">
                      {format(new Date(request.due_at), "PPp")}
                    </p>
                  </div>
                </>
              )}

              {/* Assignment UI for staff/admin */}
              {canAssign && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Assigned Team
                      </p>
                      <div className="flex gap-2">
                        <Select value={assignedTeamId} onValueChange={setAssignedTeamId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {teams.map((team) => (
                              <SelectItem key={team.id} value={team.id.toString()}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" onClick={handleAssignTeam}>
                          <Users className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Assigned User
                      </p>
                      <div className="flex gap-2">
                        <Select value={assignedUserId} onValueChange={setAssignedUserId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {staffUsers.length > 0 ? (
                              staffUsers.map((staff) => (
                                <SelectItem key={staff.id} value={staff.id.toString()}>
                                  {staff.first_name} {staff.last_name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>No users available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <Button size="sm" onClick={handleAssignUser}>
                          <Users className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {request.assigned_team && !canAssign && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Assigned Team
                    </p>
                    <p className="mt-1">{request.assigned_team?.name}</p>
                  </div>
                </>
              )}

              {request.assigned_user && !canAssign && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Assigned User
                    </p>
                    <p className="mt-1">
                      {request.assigned_user?.first_name}{" "}
                      {request.assigned_user?.last_name}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

