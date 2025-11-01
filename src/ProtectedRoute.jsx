// src/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from './AuthContext'; // Usa nosso context
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Lembre-se: npm install jwt-decode

const ProtectedRoute = () => {
    const { session, loading } = useAuth();

    if (loading) {
        return <div>Carregando sessão...</div>; // Ou um spinner
    }

    if (!session || !session.access_token) {
        // 1. Não está logado
        // Redireciona para a página inicial (que mostrará o modal de login)
        return <Navigate to="/" replace />;
    }

    // 2. Está logado, vamos checar as roles
    const token = session.access_token;
    const decodedToken = jwtDecode(token);

    // Nossas roles do Supabase (ex: ["ADMIN", "MODERATOR"])
    const roles = decodedToken.roles || [];

    // 3. Verifica se tem a permissão
    if (roles.includes('ADMIN') || roles.includes('MODERATOR')) {
        return <Outlet />; // Permite acesso (renderiza o AdminPage)
    } else {
        // 4. Está logado, mas não é admin/mod
        return <Navigate to="/" replace />; // Redireciona para a Home
    }
};

export default ProtectedRoute;