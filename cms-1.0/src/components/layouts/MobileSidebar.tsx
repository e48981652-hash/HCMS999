import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Users,
  HelpCircle,
  MessageSquare,
  Settings,
  FolderKanban,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

const clientNavItems: NavItem[] = [
  { title: "nav.dashboard", href: "/app/client/home", icon: LayoutDashboard },
  { title: "nav.requests", href: "/app/client/requests", icon: FileText },
  { title: "nav.myRequests", href: "/app/client/my-requests", icon: FolderKanban },
  { title: "nav.mcp", href: "/app/client/mcp", icon: Calendar },
  { title: "nav.opmp", href: "/app/client/opmp", icon: FileText },
  { title: "nav.support", href: "/app/client/support", icon: HelpCircle },
  { title: "nav.feedback", href: "/app/client/feedback", icon: MessageSquare },
];

const adminNavItems: NavItem[] = [
  { title: "nav.dashboard", href: "/app/admin/dashboard", icon: LayoutDashboard },
  { title: "nav.clients", href: "/app/admin/clients", icon: Users },
  { title: "nav.requestTypes", href: "/app/admin/request-types", icon: FileText },
  { title: "nav.mcp", href: "/app/admin/mcp", icon: Calendar },
  { title: "nav.teams", href: "/app/admin/teams", icon: Users },
  { title: "nav.settings", href: "/app/admin/settings", icon: Settings },
];

const staffNavItems: NavItem[] = [
  { title: "nav.dashboard", href: "/app/staff/dashboard", icon: LayoutDashboard },
  { title: "nav.requests", href: "/app/staff/requests", icon: FileText },
  { title: "nav.mcp", href: "/app/staff/mcp", icon: Calendar },
];

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const { user } = useAuth();
  const { t, isRTL } = useI18n();

  const getNavItems = () => {
    if (!user) return [];
    if (user.role === "admin") return adminNavItems;
    if (user.role === "staff") return staffNavItems;
    return clientNavItems;
  };

  const navItems = getNavItems();

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={isRTL ? "right" : "left"}>
      <DrawerContent className={cn("h-full", isRTL ? "right-0" : "left-0")}>
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <DrawerTitle>Menu</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => onOpenChange(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <Icon className="h-5 w-5" />
                <span>{t(item.title)}</span>
              </NavLink>
            );
          })}
        </nav>
      </DrawerContent>
    </Drawer>
  );
}
