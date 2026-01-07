import { Badge, BadgeProps } from "./badge";
import { cn } from "@/lib/utils";

export type RequestStatus =
  | "new"
  | "in_progress"
  | "pending"
  | "resolved"
  | "closed"
  | "cancelled"
  | "draft";

export type UserStatus = "active" | "inactive" | "suspended";

export type PriorityStatus = "low" | "medium" | "high" | "urgent";

export type MCPStatus = "draft" | "scheduled" | "published" | "archived";

export type StatusType = RequestStatus | UserStatus | PriorityStatus | MCPStatus | string;

interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: StatusType;
  showIcon?: boolean;
  customLabel?: string;
}

const statusConfig: Record<
  string,
  {
    variant: BadgeProps["variant"];
    label: string;
    className?: string;
  }
> = {
  // Request Statuses
  new: {
    variant: "outline",
    label: "New",
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  },
  in_progress: {
    variant: "in-progress",
    label: "In Progress",
  },
  pending: {
    variant: "waiting",
    label: "Pending",
  },
  resolved: {
    variant: "completed",
    label: "Resolved",
  },
  closed: {
    variant: "completed",
    label: "Closed",
  },
  cancelled: {
    variant: "destructive",
    label: "Cancelled",
  },
  draft: {
    variant: "draft",
    label: "Draft",
  },
  // User Statuses
  active: {
    variant: "completed",
    label: "Active",
  },
  inactive: {
    variant: "outline",
    label: "Inactive",
    className: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700",
  },
  suspended: {
    variant: "destructive",
    label: "Suspended",
  },
  // Priority Statuses
  low: {
    variant: "outline",
    label: "Low",
    className: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700",
  },
  medium: {
    variant: "waiting",
    label: "Medium",
  },
  high: {
    variant: "in-progress",
    label: "High",
  },
  urgent: {
    variant: "overdue",
    label: "Urgent",
  },
  // MCP Statuses
  scheduled: {
    variant: "scheduled",
    label: "Scheduled",
  },
  published: {
    variant: "completed",
    label: "Published",
  },
  archived: {
    variant: "outline",
    label: "Archived",
    className: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700",
  },
};

export function StatusBadge({ status, showIcon = false, customLabel, className, ...props }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || {
    variant: "outline" as BadgeProps["variant"],
    label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " "),
  };

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
      {...props}
    >
      {customLabel || config.label}
    </Badge>
  );
}

// Helper function to get status color
export function getStatusColor(status: StatusType): string {
  const config = statusConfig[status.toLowerCase()];
  if (!config) return "bg-gray-100 text-gray-600";
  
  if (config.className) {
    // Extract color from className if available
    const match = config.className.match(/bg-([a-z]+)-\d+/);
    return match ? match[0] : "bg-gray-100";
  }
  
  return "bg-gray-100 text-gray-600";
}
