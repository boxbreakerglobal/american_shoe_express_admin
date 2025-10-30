import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import Revenue from "./pages/Revenue";
import AddItem from "./pages/AddItem";
import AllItems from "./pages/AllItems";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute><AdminLayout><Revenue /></AdminLayout></ProtectedRoute>} path="/" />
          <Route element={<ProtectedRoute><AdminLayout><Orders /></AdminLayout></ProtectedRoute>} path="/orders" />
          <Route element={<ProtectedRoute><AdminLayout><AddItem /></AdminLayout></ProtectedRoute>} path="/add-item" />
          <Route element={<ProtectedRoute><AdminLayout><AllItems /></AdminLayout></ProtectedRoute>} path="/all-items" />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
