import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Layout from "@/components/Layout";
import InstallPrompt from "@/components/InstallPrompt";

// Eager: small landing pages users hit first
import Login from "@/pages/Login";
import DashboardV2 from "@/pages/DashboardV2";

// Lazy: heavier pages loaded on demand
const Shareholders = lazy(() => import("@/pages/Shareholders"));
const ShareholderDetail = lazy(() => import("@/pages/ShareholderDetail"));
const Payments = lazy(() => import("@/pages/Payments"));
const Expenses = lazy(() => import("@/pages/Expenses"));
const AdminExpenses = lazy(() => import("@/pages/AdminExpenses"));
const AdminLedger = lazy(() => import("@/pages/AdminLedger"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const ProjectDetails = lazy(() => import("@/pages/ProjectDetails"));
const Directors = lazy(() => import("@/pages/Directors"));
const DirectorSales = lazy(() => import("@/pages/DirectorSales"));
const Installments = lazy(() => import("@/pages/Installments"));
const Rental = lazy(() => import("@/pages/Rental"));
const Portal = lazy(() => import("@/pages/Portal"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground text-sm animate-pulse">
    লোড হচ্ছে...
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <TooltipProvider>
      <Sonner />
      <InstallPrompt />
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/portal/:id" element={<Portal />} />
                <Route path="*" element={
                  <Layout>
                    <Suspense fallback={<PageFallback />}>
                      <Routes>
                        <Route path="/" element={<DashboardV2 />} />
                        <Route path="/shareholders" element={<Shareholders />} />
                        <Route path="/shareholders/:id" element={<ShareholderDetail />} />
                        <Route path="/payments" element={<Payments />} />
                        <Route path="/expenses" element={<Expenses />} />
                        <Route path="/admin-expenses" element={<AdminExpenses />} />
                        <Route path="/admin-ledger" element={<AdminLedger />} />
                        <Route path="/installments" element={<Installments />} />
                        <Route path="/rental" element={<Rental />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/project" element={<ProjectDetails />} />
                        <Route path="/directors" element={<Directors />} />
                        <Route path="/director-sales" element={<DirectorSales />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </Layout>
                } />
              </Routes>
            </Suspense>
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
