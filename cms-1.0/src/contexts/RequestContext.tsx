import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { apiClient } from "@/lib/api";

export interface Request {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  request_type_id: number;
  business_id: number;
  assigned_to?: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  fields?: Record<string, any>;
  request_type?: {
    id: number;
    name: string;
    fields?: any[];
  };
  business?: {
    id: number;
    name: string;
  };
  assigned_user?: {
    id: number;
    name: string;
  };
}

interface RequestContextType {
  requests: Request[];
  currentRequest: Request | null;
  setCurrentRequest: (request: Request | null) => void;
  loading: boolean;
  error: string | null;
  fetchRequests: (filters?: Record<string, any>) => Promise<void>;
  fetchRequest: (id: number) => Promise<Request | null>;
  createRequest: (data: Partial<Request>) => Promise<Request | null>;
  updateRequest: (id: number, data: Partial<Request>) => Promise<Request | null>;
  deleteRequest: (id: number) => Promise<boolean>;
  refreshRequests: () => Promise<void>;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export function RequestProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [currentRequest, setCurrentRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});

  const fetchRequests = useCallback(async (filters?: Record<string, any>) => {
    try {
      setLoading(true);
      setError(null);
      const appliedFilters = filters || currentFilters;
      setCurrentFilters(appliedFilters);
      
      const response = await apiClient.getRequests(appliedFilters);
      if (response.success && response.data) {
        setRequests(Array.isArray(response.data) ? response.data : response.data.data || []);
      }
    } catch (err: any) {
      console.error("Error fetching requests:", err);
      setError(err.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  const fetchRequest = useCallback(async (id: number): Promise<Request | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getRequest(id);
      if (response.success && response.data) {
        const request = response.data;
        setCurrentRequest(request);
        // Update in requests list if exists
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? request : r))
        );
        return request;
      }
      return null;
    } catch (err: any) {
      console.error("Error fetching request:", err);
      setError(err.message || "Failed to fetch request");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createRequest = useCallback(async (data: Partial<Request>): Promise<Request | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createRequest(data);
      if (response.success && response.data) {
        const newRequest = response.data;
        setRequests((prev) => [newRequest, ...prev]);
        setCurrentRequest(newRequest);
        return newRequest;
      }
      return null;
    } catch (err: any) {
      console.error("Error creating request:", err);
      setError(err.message || "Failed to create request");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRequest = useCallback(async (id: number, data: Partial<Request>): Promise<Request | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.updateRequest(id, data);
      if (response.success && response.data) {
        const updatedRequest = response.data;
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? updatedRequest : r))
        );
        if (currentRequest?.id === id) {
          setCurrentRequest(updatedRequest);
        }
        return updatedRequest;
      }
      return null;
    } catch (err: any) {
      console.error("Error updating request:", err);
      setError(err.message || "Failed to update request");
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentRequest]);

  const deleteRequest = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.deleteRequest(id);
      if (response.success) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
        if (currentRequest?.id === id) {
          setCurrentRequest(null);
        }
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Error deleting request:", err);
      setError(err.message || "Failed to delete request");
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentRequest]);

  const refreshRequests = useCallback(async () => {
    await fetchRequests();
  }, [fetchRequests]);

  return (
    <RequestContext.Provider
      value={{
        requests,
        currentRequest,
        setCurrentRequest,
        loading,
        error,
        fetchRequests,
        fetchRequest,
        createRequest,
        updateRequest,
        deleteRequest,
        refreshRequests,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
}

export function useRequest() {
  const context = useContext(RequestContext);
  if (context === undefined) {
    throw new Error("useRequest must be used within a RequestProvider");
  }
  return context;
}
