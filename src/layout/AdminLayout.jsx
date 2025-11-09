import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import './AdminLayout.css'; // O CSS que propus anteriormente
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';

export default function AdminLayout() {
    const { session } = useAuth();

    // Função de logout
    const handleLogout = async () => {
        await supabase.auth.signOut();
        // O AuthProvider cuidará do redirecionamento
    };

    return (
        <div className="admin-layout">
            <nav className="admin-sidebar">
                <div className="sidebar-header">
                    <h3>IA Reformada</h3>
                    <span>Painel Admin</span>
                </div>
                <ul>
                    {/* O NavLink 'index' (to="/admin") não é comum,
                       mas podemos adicionar um Dashboard se 'index: true' for usado */}
                    <li><NavLink to="/admin/works">Obras</NavLink></li>
                    <li><NavLink to="/admin/authors">Autores</NavLink></li>
                    <li><NavLink to="/admin/topics">Tópicos</NavLink></li>

                    {/* ESTA É A CORREÇÃO:
                        O 'to' agora corresponde ao 'path' do seu main.jsx */}
                    <li><NavLink to="/admin/import-chunks">Importar JSON</NavLink></li>
                </ul>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="btn btn-secondary">
                        Sair
                    </button>
                </div>
            </nav>

            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
}