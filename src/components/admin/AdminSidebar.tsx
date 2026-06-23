import { NavLink } from "react-router-dom";
import {
  ArrowLeft,
  CalendarRange,
  LayoutDashboard,
  Mountain,
  Tag,
  Users,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.jpeg";

export const ADMIN_NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/clients", label: "Clients", icon: Users, end: false },
  { to: "/admin/pricing", label: "Pricing", icon: Tag, end: false },
  { to: "/admin/specials", label: "Specials", icon: Sparkles, end: false },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarRange, end: false },
  { to: "/admin/guides", label: "Guides", icon: Mountain, end: false },
] as const;

interface AdminSidebarProps {
  /** Called after a nav item is clicked (used to close the mobile drawer). */
  onNavigate?: () => void;
}

const AdminSidebar = ({ onNavigate }: AdminSidebarProps) => (
  <div className="flex h-full flex-col bg-primary">
    <div className="px-5 h-16 flex items-center gap-3 border-b border-border/30">
      <img
        src={logo}
        alt=""
        className="w-9 h-9 rounded-full object-cover ring-2 ring-accent/30"
      />
      <div className="leading-tight">
        <div className="font-heading font-bold text-foreground tracking-wider uppercase text-sm">
          SummitFit
        </div>
        <div className="text-accent text-[10px] tracking-widest uppercase">Admin</div>
      </div>
    </div>

    <nav className="flex-1 px-3 py-4 space-y-1">
      {ADMIN_NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-heading font-medium tracking-wider uppercase transition-colors",
              isActive
                ? "bg-accent/15 text-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
            )
          }
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>

    <div className="px-3 py-4 border-t border-border/30">
      <NavLink
        to="/"
        onClick={onNavigate}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-accent hover:bg-foreground/5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Site
      </NavLink>
    </div>
  </div>
);

export default AdminSidebar;
