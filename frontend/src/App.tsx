import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ui/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CursosPage from './pages/CursosPage';
import CursoDetalhePage from './pages/CursoDetalhePage';
import AulaPage from './pages/AulaPage';
import DashboardHome from './pages/DashboardHome';
import ProfilePage from './pages/ProfilePage';
import ConfigPage from './pages/ConfigPage';
import MeusCursosPage from './pages/MeusCursosPage';
import NotificacoesPage from './pages/NotificacoesPage';
import RankingPage from './pages/RankingPage';
import AdminCursosPage from './pages/admin/AdminCursosPage';
import AdminCursoFormPage from './pages/admin/AdminCursoFormPage';
import AdminAulasPage from './pages/admin/AdminAulasPage';
import AdminPage from './pages/admin/AdminPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ContatoPage from './pages/ContatoPage';
import { PublicLayout } from './components/layouts/PublicLayout';

function RootRouter() {
  const { usuario, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return usuario ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster position="bottom-right" expand={false} richColors closeButton theme="system" />
          <Routes>
            {/* Raiz pública */}
            <Route path="/" element={<RootRouter />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
<Route path="/redefinir-senha" element={<ResetPasswordPage />} />
<Route path="/contato" element={
  <PublicLayout>
    <ContatoPage />
    </PublicLayout>} />

            {/* Rotas protegidas com DashboardLayout */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><DashboardHome /></DashboardLayout></ProtectedRoute>} />
            <Route path="/cursos" element={<ProtectedRoute><DashboardLayout><CursosPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/cursos/:slug" element={<ProtectedRoute><DashboardLayout><CursoDetalhePage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/cursos/:cursoSlug/aulas/:aulaSlug" element={<ProtectedRoute><DashboardLayout><AulaPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/meus-cursos" element={<ProtectedRoute><DashboardLayout><MeusCursosPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><DashboardLayout><ProfilePage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><DashboardLayout><ConfigPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/notificacoes" element={<ProtectedRoute><DashboardLayout><NotificacoesPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/ranking" element={<ProtectedRoute><DashboardLayout><RankingPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><DashboardLayout><AdminPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/cursos" element={<ProtectedRoute><DashboardLayout><AdminCursosPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/cursos/novo" element={<ProtectedRoute><DashboardLayout><AdminCursoFormPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/cursos/:id/editar" element={<ProtectedRoute><DashboardLayout><AdminCursoFormPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/cursos/:cursoId/aulas" element={<ProtectedRoute><DashboardLayout><AdminAulasPage /></DashboardLayout></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}