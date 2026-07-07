import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "@/components/auth/UserMenu";
import logo from "@/assets/logo-small.webp";

const navItems = [
  ["/dashboard", "Overview"],
  ["/dashboard/bookings", "My Bookings"],
  ["/dashboard/account", "My Account"],
] as const;

/** Shell for the signed-in client area (/dashboard/*). */
const DashboardLayout = () => {
  const { profile } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="SummitFit Adventures"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-accent/30"
            />
            <span className="font-heading font-bold text-foreground tracking-wider uppercase">
              SummitFit
            </span>
          </Link>
          <UserMenu />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <nav className="flex flex-wrap gap-2 mb-8">
          {navItems.map(([to, label]) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-lg text-sm font-heading font-medium tracking-wider uppercase transition-colors ${
                  active
                    ? "bg-accent/15 text-accent"
                    : "text-muted-foreground hover:text-accent hover:bg-accent/5"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <p className="text-muted-foreground text-sm mb-6">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}.
        </p>

        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
