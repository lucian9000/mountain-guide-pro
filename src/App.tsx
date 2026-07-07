import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useLayoutEffect } from "react";
import AuthProvider from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import AuthLoading from "@/components/auth/AuthLoading";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Code-split everything behind auth so the public marketing page stays lean.
const Login = lazy(() => import("./pages/Login"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Booking = lazy(() => import("./pages/Booking"));
const RoutesIndex = lazy(() => import("./pages/RoutesIndex"));
const RouteDetail = lazy(() => import("./pages/RouteDetail"));
const News = lazy(() => import("./pages/News"));
const DashboardLayout = lazy(() => import("./pages/dashboard/DashboardLayout"));
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const Bookings = lazy(() => import("./pages/dashboard/Bookings"));
const Account = lazy(() => import("./pages/dashboard/Account"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminClients = lazy(() => import("./pages/admin/AdminClients"));
const AdminPricing = lazy(() => import("./pages/admin/AdminPricing"));
const AdminSpecials = lazy(() => import("./pages/admin/AdminSpecials"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminGuides = lazy(() => import("./pages/admin/AdminGuides"));
const AdminRoutes = lazy(() => import("./pages/admin/AdminRoutes"));
const AdminRouteEditor = lazy(() => import("./pages/admin/AdminRouteEditor"));
const AdminUpdates = lazy(() => import("./pages/admin/AdminUpdates"));

const queryClient = new QueryClient();

/**
 * SPA navigations keep the previous scroll position by default (scroll to
 * the bottom of /routes, click Home → you land mid-page). Reset to the top
 * on every path change, before paint so there's no visible jump.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* First tabbable element on every route — jumps past the nav to
            each page's <main id="main">. Visually hidden until focused. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-4 focus:py-3 focus:text-accent-foreground focus:font-semibold"
        >
          Skip to content
        </a>
        <ScrollToTop />
        <AuthProvider>
          <Suspense fallback={<AuthLoading />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/routes" element={<RoutesIndex />} />
              <Route path="/routes/:slug" element={<RouteDetail />} />
              <Route path="/news" element={<News />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<DashboardHome />} />
                  <Route path="/dashboard/bookings" element={<Bookings />} />
                  <Route path="/dashboard/account" element={<Account />} />
                </Route>
              </Route>

              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/clients" element={<AdminClients />} />
                  <Route path="/admin/pricing" element={<AdminPricing />} />
                  <Route path="/admin/specials" element={<AdminSpecials />} />
                  <Route path="/admin/bookings" element={<AdminBookings />} />
                  <Route path="/admin/guides" element={<AdminGuides />} />
                  <Route path="/admin/routes" element={<AdminRoutes />} />
                  <Route path="/admin/routes/new" element={<AdminRouteEditor />} />
                  <Route path="/admin/routes/:id" element={<AdminRouteEditor />} />
                  <Route path="/admin/updates" element={<AdminUpdates />} />
                </Route>
              </Route>

              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
