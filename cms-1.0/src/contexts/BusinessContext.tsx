import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Business {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  settings?: Record<string, any>;
}

interface BusinessContextType {
  businesses: Business[];
  currentBusiness: Business | null;
  setCurrentBusiness: (business: Business | null) => void;
  loading: boolean;
  error: string | null;
  refreshBusinesses: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getBusinesses();
      if (response.success && response.data) {
        setBusinesses(response.data);
        // Auto-select first business if none selected
        if (!currentBusiness && response.data.length > 0) {
          setCurrentBusiness(response.data[0]);
        }
      }
    } catch (err: any) {
      console.error("Error fetching businesses:", err);
      setError(err.message || "Failed to fetch businesses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [user]);

  // Load current business from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("currentBusinessId");
    if (stored && businesses.length > 0) {
      const business = businesses.find((b) => b.id === parseInt(stored));
      if (business) {
        setCurrentBusiness(business);
      }
    }
  }, [businesses]);

  // Save current business to localStorage when it changes
  useEffect(() => {
    if (currentBusiness) {
      localStorage.setItem("currentBusinessId", currentBusiness.id.toString());
    }
  }, [currentBusiness]);

  const handleSetCurrentBusiness = (business: Business | null) => {
    setCurrentBusiness(business);
    if (business) {
      localStorage.setItem("currentBusinessId", business.id.toString());
    } else {
      localStorage.removeItem("currentBusinessId");
    }
  };

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        currentBusiness,
        setCurrentBusiness: handleSetCurrentBusiness,
        loading,
        error,
        refreshBusinesses: fetchBusinesses,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
}
