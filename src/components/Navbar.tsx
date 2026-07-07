import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X, MessageCircle, LogOut, LayoutDashboard, LogIn, CalendarRange } from "lucide-react";
import logo from "@/assets/logo-small.webp";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "@/components/auth/UserMenu";
import { Skeleton } from "@/components/ui/skeleton";

interface NavbarProps {
  onOpenChat: () => void;
}

type NavItem = { label: string; to?: string; section?: string };

const NAV_ITEMS: NavItem[] = [
  { label: "Routes", to: "/routes" },
  { label: "News", to: "/news" },
  { label: "The Guide", section: "about" },
  { label: "Training", section: "fitness" },
  { label: "Contact", section: "contact" },
];

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Navbar = ({ onOpenChat }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the full-screen mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isMobileOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isMobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobileOpen]);

  // Keep the closed overlay out of the tab order (React 18 has no `inert`
  // JSX prop, so toggle the attribute directly) and manage focus: move it
  // into the menu on open, hand it back to the hamburger on close.
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    if (isMobileOpen) {
      overlay.removeAttribute("inert");
      // Defer past the opening transition before grabbing focus.
      const raf = requestAnimationFrame(() => {
        overlay.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
      });
      return () => cancelAnimationFrame(raf);
    }

    if (overlay.contains(document.activeElement)) {
      toggleRef.current?.focus();
    }
    overlay.setAttribute("inert", "");
  }, [isMobileOpen]);

  // Simple focus trap: Tab from the last focusable wraps to the first,
  // Shift+Tab from the first wraps to the last.
  const onOverlayKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !overlayRef.current) return;
    const focusables = Array.from(
      overlayRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const scrollTo = (id: string) => {
    setIsMobileOpen(false);
    // Defer to next tick so the overlay close transition doesn't fight the scroll
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition duration-300 ${
          isScrolled || isMobileOpen
            ? "bg-background/95 backdrop-blur-md shadow-lg border-b border-border/50"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
          <button
            onClick={() => scrollTo("services")}
            className="flex items-center gap-3 group"
            aria-label="SummitFit Adventures home"
          >
            <img
              src={logo}
              alt=""
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover ring-2 ring-accent/30 group-hover:ring-accent/60 transition"
            />
            <div className="text-left">
              <div className="font-heading font-bold text-foreground text-lg leading-tight tracking-wider uppercase">
                SummitFit
              </div>
              <div className="text-accent text-xs tracking-widest uppercase">
                Adventures
              </div>
            </div>
          </button>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map(({ label, to, section }) => {
              const cls =
                "relative text-muted-foreground hover:text-accent transition-colors text-sm font-heading font-medium tracking-wider uppercase after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-accent after:transition-all hover:after:w-full";
              return to ? (
                <Link key={label} to={to} className={cls}>
                  {label}
                </Link>
              ) : (
                <button key={label} onClick={() => scrollTo(section!)} className={cls}>
                  {label}
                </button>
              );
            })}
            <Link
              to="/booking"
              className="bg-accent hover:bg-cyan-hover text-accent-foreground px-5 py-2.5 rounded-lg font-heading font-bold text-xs tracking-wider uppercase shadow-button transition hover:scale-105"
            >
              Book Now
            </Link>

            {loading ? (
              <Skeleton className="w-9 h-9 rounded-full" />
            ) : user ? (
              <UserMenu />
            ) : (
              <Link
                to="/login"
                className="text-muted-foreground hover:text-accent transition-colors text-sm font-heading font-medium tracking-wider uppercase"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            ref={toggleRef}
            className="md:hidden text-foreground p-2 -mr-2 rounded-lg hover:bg-foreground/5 transition-colors"
            onClick={() => setIsMobileOpen((v) => !v)}
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileOpen}
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay menu */}
      <div
        ref={overlayRef}
        onKeyDown={onOverlayKeyDown}
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          isMobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isMobileOpen}
      >
        <div className="absolute inset-0 bg-background/98 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-[image:var(--glow-cyan-top)]" />

        <div className="relative h-full flex flex-col pt-20 pb-8 px-6 overflow-y-auto">
          <nav className="flex-1 flex flex-col justify-center gap-1 max-w-sm mx-auto w-full">
            {NAV_ITEMS.map(({ label, to, section }, i) => {
              const style = {
                transitionDelay: isMobileOpen ? `${i * 50 + 80}ms` : "0ms",
              };
              const cls = `group flex items-center justify-between text-left py-4 border-b border-border/30 font-heading font-bold tracking-wider uppercase text-2xl text-foreground hover:text-accent transition duration-300 ${
                isMobileOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`;
              const arrow = (
                <span className="text-accent/40 group-hover:text-accent group-hover:translate-x-1 transition text-base">
                  →
                </span>
              );
              return to ? (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setIsMobileOpen(false)}
                  style={style}
                  className={cls}
                >
                  <span>{label}</span>
                  {arrow}
                </Link>
              ) : (
                <button key={label} onClick={() => scrollTo(section!)} style={style} className={cls}>
                  <span>{label}</span>
                  {arrow}
                </button>
              );
            })}
          </nav>

          <div
            style={{
              transitionDelay: isMobileOpen ? `${NAV_ITEMS.length * 50 + 120}ms` : "0ms",
            }}
            className={`max-w-sm mx-auto w-full mt-8 flex flex-col gap-3 transition duration-300 ${
              isMobileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Link
              to="/booking"
              onClick={() => setIsMobileOpen(false)}
              className="bg-accent hover:bg-cyan-hover text-accent-foreground px-6 py-4 rounded-lg font-heading font-bold text-sm tracking-wider uppercase shadow-button transition-colors flex items-center justify-center gap-2"
            >
              <CalendarRange className="w-4 h-4" /> Book Now
            </Link>

            <button
              onClick={() => {
                onOpenChat();
                setIsMobileOpen(false);
              }}
              className="inline-flex items-center justify-center gap-2 text-muted-foreground hover:text-accent px-6 py-3 rounded-lg font-heading font-bold text-sm tracking-wider uppercase transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Ask a Question
            </button>
            <a
              href="https://wa.me/27671301536?text=Hi!%20I'm%20interested%20in%20learning%20more%20about%20SummitFit%20Adventures."
              onClick={() => setIsMobileOpen(false)}
              className="border border-foreground/20 text-foreground hover:border-accent hover:text-accent px-6 py-4 rounded-lg font-heading font-bold text-sm tracking-wider uppercase transition-colors text-center"
            >
              WhatsApp Ernest
            </a>

            {!loading &&
              (user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileOpen(false)}
                    className="inline-flex items-center justify-center gap-2 text-muted-foreground hover:text-accent px-6 py-3 rounded-lg font-heading font-bold text-sm tracking-wider uppercase transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" /> My Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileOpen(false);
                      void signOut();
                    }}
                    className="inline-flex items-center justify-center gap-2 text-muted-foreground hover:text-destructive px-6 py-3 rounded-lg font-heading font-bold text-sm tracking-wider uppercase transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 text-muted-foreground hover:text-accent px-6 py-3 rounded-lg font-heading font-bold text-sm tracking-wider uppercase transition-colors"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
