import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button, ButtonProps } from "./button";
import { AlertTriangle, HelpCircle, Trash2, AlertCircle } from "lucide-react";

export interface ConfirmDialogOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "warning";
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ButtonProps["variant"];
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmDialogProps extends ConfirmDialogOptions {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  variant = "default",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = useCallback(async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Confirm action failed:", error);
    } finally {
      setIsConfirming(false);
    }
  }, [onConfirm, onOpenChange]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  }, [onCancel, onOpenChange]);

  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return <Trash2 className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <HelpCircle className="h-5 w-5 text-primary" />;
    }
  };

  const getConfirmVariant = (): ButtonProps["variant"] => {
    if (confirmVariant) return confirmVariant;
    if (variant === "destructive") return "destructive";
    if (variant === "warning") return "outline";
    return "default";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                variant === "destructive"
                  ? "bg-destructive/10"
                  : variant === "warning"
                  ? "bg-yellow-500/10"
                  : "bg-primary/10"
              }`}
            >
              {getIcon()}
            </div>
            <div className="flex-1">
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription className="mt-2">{description}</DialogDescription>}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isConfirming || isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={getConfirmVariant()}
            onClick={handleConfirm}
            disabled={isConfirming || isLoading}
          >
            {isConfirming || isLoading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook for using confirm dialog
export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    options: ConfirmDialogOptions | null;
  }>({
    open: false,
    options: null,
  });

  const confirm = useCallback((options: ConfirmDialogOptions) => {
    setDialogState({
      open: true,
      options,
    });
  }, []);

  const close = useCallback(() => {
    setDialogState((prev) => ({ ...prev, open: false }));
  }, []);

  const ConfirmDialogComponent = dialogState.options ? (
    <ConfirmDialog
      open={dialogState.open}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
      {...dialogState.options}
    />
  ) : null;

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
  };
}
