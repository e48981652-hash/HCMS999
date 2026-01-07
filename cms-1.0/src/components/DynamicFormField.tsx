import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export interface FieldDefinition {
  field_key: string;
  label: string;
  type: "text" | "textarea" | "select" | "multiselect" | "date" | "file" | "image";
  required: boolean;
  options?: {
    multiple?: boolean;
    max_files?: number;
    max_size?: number;
    allowed_types?: string[];
    public?: boolean;
    options?: string[]; // For select/multiselect
  };
  validation?: Record<string, any>;
  order?: number;
}

interface DynamicFormFieldProps {
  field: FieldDefinition;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function DynamicFormField({ field, value, onChange, error }: DynamicFormFieldProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onChange(files);
    }
  };

  const renderField = () => {
    switch (field.type) {
      case "text":
        return (
          <Input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            error={!!error}
            placeholder={field.label}
            required={field.required}
          />
        );

      case "textarea":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.label}
            required={field.required}
            className={error ? "border-destructive" : ""}
            rows={4}
          />
        );

      case "select":
        return (
          <Select value={value || ""} onValueChange={onChange} required={field.required}>
            <SelectTrigger className={error ? "border-destructive" : ""}>
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "multiselect":
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {field.options?.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.field_key}-${option}`}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...selectedValues, option]);
                    } else {
                      onChange(selectedValues.filter((v: string) => v !== option));
                    }
                  }}
                />
                <Label
                  htmlFor={`${field.field_key}-${option}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case "date":
        return (
          <Input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            error={!!error}
            required={field.required}
          />
        );

      case "file":
        return (
          <Input
            type="file"
            onChange={handleFileChange}
            error={!!error}
            required={field.required}
            multiple={field.options?.multiple || false}
            accept={field.options?.allowed_types?.map(ext => `.${ext}`).join(",")}
          />
        );

      case "image":
        const maxFiles = field.options?.max_files || 1;
        const maxSize = field.options?.max_size || 5; // MB
        const allowedTypes = field.options?.allowed_types?.join(",") || "image/*";
        
        return (
          <div className="space-y-2">
            <Input
              type="file"
              accept={allowedTypes}
              multiple={maxFiles > 1}
              onChange={handleFileChange}
              error={!!error}
              required={field.required}
            />
            {maxFiles > 1 && (
              <p className="text-xs text-muted-foreground">
                Maximum {maxFiles} files, {maxSize}MB each
              </p>
            )}
            {maxFiles === 1 && (
              <p className="text-xs text-muted-foreground">
                Maximum {maxSize}MB
              </p>
            )}
            {value && value instanceof FileList && (
              <div className="space-y-1">
                {Array.from(value).map((file, index) => (
                  <p key={index} className="text-xs text-muted-foreground">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.field_key}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {renderField()}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {field.type === "image" && field.options?.max_files && field.options.max_files > 1 && (
        <p className="text-xs text-muted-foreground">
          You can upload up to {field.options.max_files} images
        </p>
      )}
    </div>
  );
}

