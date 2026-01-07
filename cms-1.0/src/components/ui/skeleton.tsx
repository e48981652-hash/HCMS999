import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const skeletonVariants = cva("animate-pulse rounded-md bg-muted", {
  variants: {
    variant: {
      default: "bg-muted",
      card: "bg-muted rounded-lg",
      table: "bg-muted rounded",
      list: "bg-muted rounded",
      avatar: "rounded-full bg-muted",
      text: "bg-muted rounded",
      button: "bg-muted rounded-md",
      image: "bg-muted rounded-lg aspect-video",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return <div className={cn(skeletonVariants({ variant }), className)} {...props} />;
}

// Card Skeleton Variants
export function CardSkeleton({ className, lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={cn("rounded-lg border p-6 space-y-4", className)}>
      <Skeleton variant="card" className="h-6 w-3/4" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} variant="text" className={cn("h-4", i === lines - 1 && "w-5/6")} />
        ))}
      </div>
    </div>
  );
}

// Table Skeleton Variants
export function TableSkeleton({ 
  className, 
  rows = 5, 
  columns = 4 
}: { 
  className?: string; 
  rows?: number; 
  columns?: number;
}) {
  return (
    <div className={cn("w-full", className)}>
      <div className="rounded-md border">
        <div className="border-b p-4">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} variant="table" className="h-4 flex-1" />
            ))}
          </div>
        </div>
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="p-4 flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} variant="table" className="h-4 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// List Skeleton Variants
export function ListSkeleton({ 
  className, 
  items = 5,
  showAvatar = false,
  lines = 2
}: { 
  className?: string; 
  items?: number;
  showAvatar?: boolean;
  lines?: number;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex gap-4 items-start">
          {showAvatar && <Skeleton variant="avatar" className="h-10 w-10 shrink-0" />}
          <div className="flex-1 space-y-2">
            <Skeleton variant="list" className="h-5 w-3/4" />
            <div className="space-y-1">
              {Array.from({ length: lines }).map((_, lineIndex) => (
                <Skeleton 
                  key={lineIndex} 
                  variant="text" 
                  className={cn("h-4", lineIndex === lines - 1 && "w-5/6")} 
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export { Skeleton };
