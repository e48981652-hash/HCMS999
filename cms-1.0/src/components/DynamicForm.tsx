import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DynamicFormField, FieldDefinition } from "./DynamicFormField";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface DynamicFormProps {
  fields: FieldDefinition[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  defaultValues?: Record<string, any>;
  submitLabel?: string;
  loading?: boolean;
}

export function DynamicForm({
  fields,
  onSubmit,
  defaultValues = {},
  submitLabel = "Submit",
  loading = false,
}: DynamicFormProps) {
  const { toast } = useToast();

  // Build Zod schema dynamically
  const schemaFields: Record<string, any> = {};
  fields.forEach((field) => {
    let fieldSchema: any;

    switch (field.type) {
      case "text":
      case "textarea":
        fieldSchema = z.string();
        break;
      case "select":
        fieldSchema = z.string();
        break;
      case "multiselect":
        fieldSchema = z.array(z.string());
        break;
      case "date":
        fieldSchema = z.string();
        break;
      case "file":
      case "image":
        fieldSchema = z.any().optional();
        break;
      default:
        fieldSchema = z.any();
    }

    if (field.required && field.type !== "file" && field.type !== "image") {
      fieldSchema = fieldSchema.min(1, `${field.label} is required`);
    }

    schemaFields[field.field_key] = field.required
      ? fieldSchema
      : fieldSchema.optional();
  });

  const schema = z.object(schemaFields);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  });

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await onSubmit(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit form",
        variant: "destructive",
      });
    }
  };

  // Sort fields by order
  const sortedFields = [...fields].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    return orderA - orderB;
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {sortedFields.map((field) => {
          const fieldError = form.formState.errors[field.field_key] as
            | { message?: string }
            | undefined;

          return (
            <FormField
              key={field.field_key}
              control={form.control}
              name={field.field_key}
              render={({ field: formField }) => (
                <FormItem>
                  <FormControl>
                    <DynamicFormField
                      field={field}
                      value={formField.value}
                      onChange={(value) => formField.onChange(value)}
                      error={fieldError?.message}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          );
        })}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface DynamicFormViewProps {
  fields: FieldDefinition[];
  values: Record<string, any>;
}

export function DynamicFormView({ fields, values }: DynamicFormViewProps) {
  const renderValue = (field: FieldDefinition, value: any) => {
    if (!value && value !== 0) {
      return <span className="text-muted-foreground">Not provided</span>;
    }

    switch (field.type) {
      case "text":
      case "textarea":
      case "date":
        return <span>{value}</span>;

      case "select":
        return <span>{value}</span>;

      case "multiselect":
        return Array.isArray(value) ? (
          <div className="flex flex-wrap gap-1">
            {value.map((v: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium"
              >
                {v}
              </span>
            ))}
          </div>
        ) : (
          <span>{value}</span>
        );

      case "image":
        // Handle image URLs
        if (typeof value === "object" && value.urls) {
          return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {value.urls.map((url: string, index: number) => (
                <img
                  key={index}
                  src={url}
                  alt={`${field.label} ${index + 1}`}
                  className="rounded-md object-cover h-32 w-full"
                />
              ))}
            </div>
          );
        } else if (typeof value === "object" && value.url) {
          return (
            <img
              src={value.url}
              alt={field.label}
              className="rounded-md object-cover h-48 w-auto"
            />
          );
        } else if (typeof value === "string") {
          return (
            <img
              src={value}
              alt={field.label}
              className="rounded-md object-cover h-48 w-auto"
            />
          );
        }
        return <span className="text-muted-foreground">No image</span>;

      case "file":
        return <span className="text-muted-foreground">File attached</span>;

      default:
        return <span>{JSON.stringify(value)}</span>;
    }
  };

  // Sort fields by order
  const sortedFields = [...fields].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    return orderA - orderB;
  });

  return (
    <div className="space-y-4">
      {sortedFields.map((field) => (
        <div key={field.field_key} className="space-y-2">
          <label className="text-sm font-medium">{field.label}</label>
          <div>{renderValue(field, values[field.field_key])}</div>
        </div>
      ))}
    </div>
  );
}

