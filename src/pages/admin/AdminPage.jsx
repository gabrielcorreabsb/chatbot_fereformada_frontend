// src/pages/admin/AdminPage.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import './Admin.css'; // Importa nosso novo CSS

export default function AdminPage() {
    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-content">
                {/* O Outlet renderiza o componente da rota filha aqui */}
                {/* (Ex: <WorkManagement /> ou <ChunkManagement />) */}
                <Outlet />
            </main>
        </div>
    );
}