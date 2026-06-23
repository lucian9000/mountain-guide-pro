import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<AuthLoading />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/booking" element={<Booking />} />

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
