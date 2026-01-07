import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  metadata?: Record<string, any>;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
  orientation?: "vertical" | "horizontal";
}

export function Timeline({ items, className, orientation = "vertical" }: TimelineProps) {
  if (orientation === "horizontal") {
    return (
      <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>
        {items.map((item, index) => (
          <TimelineItemHorizontal key={item.id} item={item} isFirst={index === 0} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-4 top-0 h-full w-0.5 bg-border" />
      <div className="space-y-6">
        {items.map((item) => (
          <TimelineItemVertical key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function TimelineItemVertical({ item }: { item: TimelineItem }) {
  const timestamp =
    typeof item.timestamp === "string" ? new Date(item.timestamp) : item.timestamp;

  const getVariantStyles = () => {
    switch (item.variant) {
      case "success":
        return "bg-green-500 border-green-500";
      case "warning":
        return "bg-yellow-500 border-yellow-500";
      case "error":
        return "bg-destructive border-destructive";
      case "info":
        return "bg-blue-500 border-blue-500";
      default:
        return "bg-primary border-primary";
    }
  };

  return (
    <div className="relative flex gap-4">
      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-background">
        {item.icon ? (
          <div className="flex h-full w-full items-center justify-center">{item.icon}</div>
        ) : (
          <div className={cn("h-2 w-2 rounded-full", getVariantStyles())} />
        )}
      </div>
      <div className="flex-1 pb-6">
        <div className="mb-1 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
          <time className="text-xs text-muted-foreground">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </time>
        </div>
        {item.description && (
          <p className="text-sm text-muted-foreground">{item.description}</p>
        )}
        {item.metadata && Object.keys(item.metadata).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(item.metadata).map(([key, value]) => (
              <span
                key={key}
                className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
              >
                <span className="font-medium">{key}:</span> {String(value)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineItemHorizontal({ item, isFirst }: { item: TimelineItem; isFirst: boolean }) {
  const timestamp =
    typeof item.timestamp === "string" ? new Date(item.timestamp) : item.timestamp;

  return (
    <div className="relative flex min-w-[200px] flex-col">
      {!isFirst && (
        <div className="absolute left-0 top-4 h-0.5 w-full -translate-x-1/2 bg-border" />
      )}
      <div className="relative z-10 mb-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-background">
        {item.icon ? (
          <div className="flex h-full w-full items-center justify-center">{item.icon}</div>
        ) : (
          <div className="h-2 w-2 rounded-full bg-primary" />
        )}
      </div>
      <h4 className="mb-1 text-sm font-semibold">{item.title}</h4>
      {item.description && <p className="mb-2 text-xs text-muted-foreground">{item.description}</p>}
      <time className="text-xs text-muted-foreground">
        {formatDistanceToNow(timestamp, { addSuffix: true })}
      </time>
    </div>
  );
}
