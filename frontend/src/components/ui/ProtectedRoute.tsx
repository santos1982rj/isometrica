/**
 * @file ProtectedRoute.tsx
 * @description Componente que protege rotas que exigem autenticação.
 * 
 * Se o usuário não estiver autenticado, redireciona para /login.
 * Exibe um loading enquanto verifica o estado de autenticação.
 * 
 * @see AuthContext: src/contexts/AuthContext.tsx
 * 
 * @example
 * // Em App.tsx:
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <DashboardHome />
 *   </ProtectedRoute>
 * } />
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { usuario, loading } = useAuth();

  // Enquanto verifica o token salvo, exibe indicador de carregamento
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não autenticado, redireciona para login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Autenticado: renderiza o conteúdo protegido
  return <>{children}</>;
};

export default ProtectedRoute;