import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "@/components/auth/UserMenu";
import logo from "@/assets/logo-small.webp";

/**
 * Sticky header for public subpages (/routes, /news, …) — same design as the
 * booking page header, plus the primary content nav links.
 */
const PublicHeader = () => {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <img
            src={logo}
            alt="SummitFit Adventures"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-accent/30"
          />
          <span className="font-heading font-bold text-foreground tracking-wider uppercase truncate">
            SummitFit
          </span>
        </Link>

        <nav className="flex items-center gap-4 md:gap-6">
          {[
            ["/routes", "Routes"],
            ["/news", "News"],
          ].map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm font-heading font-medium tracking-wider uppercase transition-colors ${
                  isActive ? "text-accent" : "text-muted-foreground hover:text-accent"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <Link
            to="/booking"
            className="hidden sm:inline-flex bg-accent hover:bg-cyan-hover text-accent-foreground px-4 py-2 rounded-lg font-heading font-bold text-xs tracking-wider uppercase shadow-button transition-colors"
          >
            Book Now
          </Link>
          {!loading &&
            (user ? (
              <UserMenu />
            ) : (
              <Link
                to="/login"
                className="text-muted-foreground hover:text-accent text-sm font-heading font-medium tracking-wider uppercase transition-colors"
              >
                Sign In
              </Link>
            ))}
        </nav>
      </div>
    </header>
  );
};

export default PublicHeader;
