import { Link, Outlet } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "@/components/auth/UserMenu";

/**
 * Phase 1 admin shell. The full sidebar CRM (Dashboard/Clients/Pricing/
 * Specials/Bookings/Guides) is designed for Phase 2 — see the project plan.
 */
const AdminLayout = () => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-primary/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Site
            </Link>
            <span className="font-heading font-bold text-foreground tracking-wider uppercase">
              Admin
            </span>
          </div>
          <UserMenu />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <p className="text-muted-foreground text-sm mb-6">
          Signed in as {profile?.email} · role: {profile?.role}
        </p>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
