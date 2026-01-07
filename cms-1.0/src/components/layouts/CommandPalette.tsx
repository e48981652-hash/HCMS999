import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import {
  FileText,
  Users,
  Settings,
  BarChart3,
  Calendar,
  MessageSquare,
  HelpCircle,
  Home,
  Briefcase,
  Shield,
  ClipboardList,
  TrendingUp,
} from "lucide-react";

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const routes: Record<string, { path: string; icon: React.ElementType; label: string }> = {
  dashboard: { path: "/app/client/dashboard", icon: Home, label: "Dashboard" },
  requests: { path: "/app/client/requests", icon: FileText, label: "My Requests" },
  "request-catalog": { path: "/app/client/requests/catalog", icon: ClipboardList, label: "Request Catalog" },
  clients: { path: "/app/admin/clients", icon: Users, label: "Clients" },
  teams: { path: "/app/admin/teams", icon: Shield, label: "Teams" },
  "request-types": { path: "/app/admin/request-types", icon: FileText, label: "Request Types" },
  settings: { path: "/app/admin/settings", icon: Settings, label: "Settings" },
  mcp: { path: "/app/client/mcp", icon: Calendar, label: "Monthly Content Plan" },
  reports: { path: "/app/admin/reports", icon: BarChart3, label: "Reports" },
  analytics: { path: "/app/admin/analytics", icon: TrendingUp, label: "Analytics" },
  support: { path: "/app/client/support", icon: HelpCircle, label: "Support" },
};

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : open;
  const setIsOpen = isControlled ? onOpenChange || (() => {}) : setOpen;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setIsOpen]);

  const handleSelect = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {Object.entries(routes).map(([key, { path, icon: Icon, label }]) => (
            <CommandItem key={key} onSelect={() => handleSelect(path)}>
              <Icon className="mr-2 h-4 w-4" />
              <span>{label}</span>
              <CommandShortcut>⌘K</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => handleSelect("/app/client/requests/catalog")}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Create New Request</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/app/admin/clients")}>
            <Users className="mr-2 h-4 w-4" />
            <span>Add New Client</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/app/admin/teams")}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Manage Teams</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
