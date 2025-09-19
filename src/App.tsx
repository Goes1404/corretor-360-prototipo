import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppLayout } from "./components/Layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import Calendario from "./pages/Calendario";
import Simuladores from "./pages/Simuladores";
import Documentos from "./pages/Documentos";
import Recomendacoes from "./pages/Recomendacoes";
import AnaliseMercado from "./pages/AnaliseMercado";
import Auth from "./pages/Auth";
import GestorDashboard from "./pages/GestorDashboard";
import Produtos from "./pages/Produtos";
import ClienteDetalhes from "./pages/ClienteDetalhes";
import NovoLead from "./pages/NovoLead";
import UploadDocumentos from "./pages/UploadDocumentos";
import FazerLigacao from "./pages/FazerLigacao";
import EnviarEmail from "./pages/EnviarEmail";
import NotFound from "./pages/NotFound";
import VendasFinalizadas from "./pages/VendasFinalizadas";
import LeadsQualificados from "./pages/LeadsQualificados";
import FecharVenda from "./pages/FecharVenda";
import DetalhesLead from "./pages/DetalhesLead";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Carregando...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, profile } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/auth" element={<Navigate to="/" replace />} />
        <Route path="/" element={
          profile?.role === 'GESTOR' ? <GestorDashboard /> : <Dashboard />
        } />
        <Route path="/crm" element={<ProtectedRoute><CRM /></ProtectedRoute>} />
        <Route path="/calendario" element={<ProtectedRoute><Calendario /></ProtectedRoute>} />
        <Route path="/clientes/:clientId" element={<ProtectedRoute><ClienteDetalhes /></ProtectedRoute>} />
        <Route path="/novo-lead" element={<ProtectedRoute><NovoLead /></ProtectedRoute>} />
        <Route path="/upload-documentos" element={<ProtectedRoute><UploadDocumentos /></ProtectedRoute>} />
        <Route path="/fazer-ligacao" element={<ProtectedRoute><FazerLigacao /></ProtectedRoute>} />
        <Route path="/enviar-email" element={<ProtectedRoute><EnviarEmail /></ProtectedRoute>} />
        <Route path="/simuladores" element={<ProtectedRoute><Simuladores /></ProtectedRoute>} />
        <Route path="/documentos" element={<ProtectedRoute><Documentos /></ProtectedRoute>} />
        <Route path="/produtos" element={<ProtectedRoute><Produtos /></ProtectedRoute>} />
        <Route path="/recomendacoes" element={<ProtectedRoute><Recomendacoes /></ProtectedRoute>} />
        <Route path="/analise-mercado" element={<ProtectedRoute><AnaliseMercado /></ProtectedRoute>} />
        <Route path="/vendas-finalizadas" element={<ProtectedRoute><VendasFinalizadas /></ProtectedRoute>} />
        <Route path="/leads-qualificados" element={<ProtectedRoute><LeadsQualificados /></ProtectedRoute>} />
        <Route path="/fechar-venda/:leadId" element={<ProtectedRoute><FecharVenda /></ProtectedRoute>} />
        <Route path="/detalhes-lead/:leadId" element={<ProtectedRoute><DetalhesLead /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
