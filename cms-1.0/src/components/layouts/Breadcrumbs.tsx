import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  customLabel?: (path: string) => string;
}

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  home: "Home",
  clients: "Clients",
  "request-types": "Request Types",
  teams: "Teams",
  settings: "Settings",
  mcp: "Monthly Content Plan",
  opmp: "One Page Marketing Plan",
  requests: "Requests",
  "my-requests": "My Requests",
  support: "Support",
  feedback: "Feedback",
  onboarding: "Onboarding",
  reports: "Reports",
  analytics: "Analytics",
  "audit-logs": "Audit Logs",
  users: "Users",
};

export function Breadcrumbs({ items, customLabel }: BreadcrumbsProps) {
  const location = useLocation();
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const paths = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Add home
    breadcrumbs.push({
      label: "Home",
      href: paths[0] === "app" ? `/${paths[0]}/${paths[1]}/dashboard` : "/",
    });

    // Generate breadcrumbs from path
    let currentPath = "";
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      
      if (path !== "app" && index < paths.length - 1) {
        const label = customLabel ? customLabel(path) : routeLabels[path] || path;
        breadcrumbs.push({
          label: label.charAt(0).toUpperCase() + label.slice(1).replace(/-/g, " "),
          href: currentPath,
        });
      } else if (index === paths.length - 1) {
        // Last item is current page (no link)
        const label = customLabel ? customLabel(path) : routeLabels[path] || path;
        breadcrumbs.push({
          label: label.charAt(0).toUpperCase() + label.slice(1).replace(/-/g, " "),
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index === 0 && item.href && (
            <Link to={item.href} className="hover:text-foreground">
              <Home className="h-4 w-4" />
            </Link>
          )}
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          {item.href && index !== breadcrumbItems.length - 1 ? (
            <Link to={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className={index === breadcrumbItems.length - 1 ? "text-foreground font-medium" : ""}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
