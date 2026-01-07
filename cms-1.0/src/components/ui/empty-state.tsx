import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "./button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps["variant"];
    size?: ButtonProps["size"];
  };
  className?: string;
  illustration?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  illustration,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      {illustration && <div className="mb-6">{illustration}</div>}
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && (
        <Button variant={action.variant || "default"} size={action.size || "default"} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
