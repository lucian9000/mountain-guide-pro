import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import UserMenu from "@/components/auth/UserMenu";
import AdminSidebar, { ADMIN_NAV } from "@/components/admin/AdminSidebar";

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  const current =
    [...ADMIN_NAV]
      .sort((a, b) => b.to.length - a.to.length)
      .find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)))?.label ??
    "Admin";

  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:block fixed inset-y-0 left-0 w-60 border-r border-border/40 z-30">
        <AdminSidebar />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-primary border-border/40">
          <AdminSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="md:pl-60">
        <header className="sticky top-0 z-20 h-16 bg-background/95 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-foreground p-2 -ml-2 rounded-lg hover:bg-foreground/5 transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-heading font-bold text-foreground tracking-wider uppercase text-lg">
              {current}
            </h1>
          </div>
          <UserMenu />
        </header>

        <main className="px-4 md:px-8 py-6 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
