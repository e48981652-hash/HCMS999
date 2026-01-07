import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search, X, FileText, Users, Briefcase } from "lucide-react";
import { apiClient } from "@/lib/api";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({ placeholder = "Search...", className = "" }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (query.length < 2) {
      setResults({});
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await apiClient.search(query, "all");
        if (response.success && response.data) {
          setResults(response.data);
        }
      } catch (error: any) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const handleSelect = (item: any) => {
    navigate(item.url);
    setOpen(false);
    setQuery("");
  };

  const allResults = [
    ...(results.requests || []),
    ...(results.businesses || []),
    ...(results.clients || []),
  ];

  return (
    <>
      <div className={`relative ${className}`}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults({});
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search requests, businesses, clients..." value={query} onValueChange={setQuery} />
        <CommandList>
          {loading && <CommandEmpty>Searching...</CommandEmpty>}
          {!loading && allResults.length === 0 && query.length >= 2 && (
            <CommandEmpty>No results found</CommandEmpty>
          )}
          
          {allResults.length > 0 && (
            <>
              {results.requests && results.requests.length > 0 && (
                <CommandGroup heading="Requests">
                  {results.requests.map((item: any) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => handleSelect(item)}
                      className="cursor-pointer"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results.businesses && results.businesses.length > 0 && (
                <CommandGroup heading="Businesses">
                  {results.businesses.map((item: any) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => handleSelect(item)}
                      className="cursor-pointer"
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results.clients && results.clients.length > 0 && (
                <CommandGroup heading="Clients">
                  {results.clients.map((item: any) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => handleSelect(item)}
                      className="cursor-pointer"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
