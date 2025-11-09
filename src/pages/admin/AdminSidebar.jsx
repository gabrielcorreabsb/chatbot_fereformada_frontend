// src/pages/admin/AdminSidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient'; // Ajuste este caminho!

export default function AdminSidebar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login'); // Redireciona para o login após sair
    };

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-header">
                Fé Reformada
                <span style={{ color: '#cbd5e1', fontSize: '0.8rem', display: 'block' }}>Painel Admin</span>
            </div>

            <nav>
                {/* O 'end' é importante para o NavLink não ficar ativo em rotas filhas */}
                <NavLink to="/admin" end>Dashboard</NavLink>
                <NavLink to="/admin/works">Obras</NavLink>
                <NavLink to="/admin/authors">Autores</NavLink>
                <NavLink to="/admin/topics">Tópicos</NavLink>
                <NavLink to="/admin/import-chunks">Importar Obras</NavLink>
                {/* Você pode adicionar mais links aqui, ex: "Autores", "Tópicos" */}
            </nav>

            <div className="admin-sidebar-footer">
                <button onClick={handleLogout}>Sair</button>
            </div>
        </aside>
    );
}