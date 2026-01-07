import { useCallback, useState, useRef } from "react";
import { Upload, X, File, Image as ImageIcon, FileText, Video, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Progress } from "./progress";

export interface FileUploaderProps {
  onUpload: (files: File[]) => Promise<void> | void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  progress?: number; // 0-100
}

const getFileIcon = (file: File) => {
  const type = file.type;
  if (type.startsWith("image/")) return ImageIcon;
  if (type.startsWith("video/")) return Video;
  if (type.startsWith("audio/")) return Music;
  if (type.includes("pdf") || type.includes("text")) return FileText;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

export function FileUploader({
  onUpload,
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 1,
  className,
  disabled = false,
  showPreview = true,
  progress,
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (fileList: FileList | null): File[] => {
      if (!fileList) return [];

      const fileArray = Array.from(fileList);
      const validFiles: File[] = [];

      fileArray.forEach((file) => {
        // Check file size
        if (file.size > maxSize) {
          alert(`File ${file.name} exceeds maximum size of ${formatFileSize(maxSize)}`);
          return;
        }

        // Check file count
        if (validFiles.length + files.length >= maxFiles) {
          alert(`Maximum ${maxFiles} file(s) allowed`);
          return;
        }

        // Check accept types if specified
        if (accept) {
          const acceptTypes = accept.split(",").map((t) => t.trim());
          const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
          const fileType = file.type;

          const isAccepted =
            acceptTypes.some(
              (type) =>
                fileType.match(type.replace(/\*/g, ".*")) ||
                type === fileExtension ||
                (type.endsWith("/*") && fileType.startsWith(type.replace("/*", "")))
            );

          if (!isAccepted) {
            alert(`File ${file.name} is not an accepted file type`);
            return;
          }
        }

        validFiles.push(file);
      });

      return validFiles;
    },
    [accept, maxSize, maxFiles, files.length]
  );

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      const validFiles = validateFiles(fileList);
      if (validFiles.length === 0) return;

      const newFiles = multiple ? [...files, ...validFiles] : validFiles;
      setFiles(newFiles);

      if (onUpload) {
        setUploading(true);
        setUploadProgress(0);

        try {
          // Simulate progress if not provided
          if (progress === undefined) {
            const interval = setInterval(() => {
              setUploadProgress((prev) => {
                if (prev >= 90) {
                  clearInterval(interval);
                  return 90;
                }
                return prev + 10;
              });
            }, 100);
          } else {
            setUploadProgress(progress);
          }

          await onUpload(validFiles);

          if (progress === undefined) {
            setUploadProgress(100);
            setTimeout(() => {
              setUploading(false);
              setUploadProgress(0);
              if (!multiple) {
                setFiles([]);
              }
            }, 500);
          }
        } catch (error) {
          console.error("Upload error:", error);
          setUploading(false);
          setUploadProgress(0);
        }
      }
    },
    [files, multiple, onUpload, validateFiles, progress]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      setFiles((prev) => prev.filter((_, i) => i !== index));
    },
    []
  );

  const FileIcon = files.length > 0 ? getFileIcon(files[0]) : Upload;

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
          dragActive && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          !dragActive && !disabled && "border-border hover:border-primary/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled || uploading}
          className="hidden"
        />

        <FileIcon className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="mb-2 text-sm font-medium text-foreground">
          {dragActive ? "Drop files here" : "Drag and drop files here"}
        </p>
        <p className="mb-4 text-xs text-muted-foreground">
          or{" "}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="text-primary hover:underline"
          >
            browse files
          </button>
        </p>
        <div className="text-xs text-muted-foreground">
          Max size: {formatFileSize(maxSize)}
          {multiple && ` • Max files: ${maxFiles}`}
        </div>

        {uploading && (uploadProgress > 0 || progress !== undefined) && (
          <div className="mt-4 w-full max-w-xs">
            <Progress value={progress ?? uploadProgress} className="h-2" />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Uploading... {Math.round(progress ?? uploadProgress)}%
            </p>
          </div>
        )}
      </div>

      {showPreview && files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => {
            const Icon = getFileIcon(file);
            const isImage = file.type.startsWith("image/");
            const previewUrl = isImage ? URL.createObjectURL(file) : null;

            return (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="h-12 w-12 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  className="h-8 w-8 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
