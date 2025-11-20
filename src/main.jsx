// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
// 1. IMPORTAR 'Navigate' PARA FAZER O REDIRECIONAMENTO
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// --- CSS GLOBAIS ---
import './index.css';
import './layout/AdminLayout.css';

// --- PROVIDERS ---
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';

// --- PÁGINAS ---
import App from './App';
import AdminLayout from './layout/AdminLayout';

// --- PÁGINAS FILHAS
import AdminDashboard from './pages/admin/AdminDashboard';
import WorkManagement from './pages/admin/WorkManagement';
import AuthorManagement from './pages/admin/AuthorManagement';
import TopicManagement from "./pages/admin/TopicManagement.jsx";
import ChunkManagement from "./pages/admin/ChunkManagement.jsx";
import ImportPage from './pages/admin/ImportPage';
import StudyNoteManagement from './pages/admin/StudyNoteManagement';
import SynonymManagement from './pages/admin/SynonymManagement.jsx';


const router = createBrowserRouter([
    {
        path: '/*',
        element: <App />,
    },
    {
        path: '/admin',
        element: <ProtectedRoute />,
        children: [
            {
                element: <AdminLayout />,
                children: [
                    // ======================================================
                    // 2. ADICIONE ESTA LINHA: A ROTA PADRÃO (index)
                    // ======================================================
                    { index: true, element: <Navigate to="/admin/dashboard" replace /> },

                    // --- Suas rotas filhas existentes ---
                    { path: 'dashboard', element: <AdminDashboard /> },
                    { path: 'works', element: <WorkManagement /> },
                    { path: 'authors', element: <AuthorManagement /> },
                    { path: 'works/:workId/chunks', element: <ChunkManagement /> },
                    { path: 'topics', element: <TopicManagement /> },
                    { path: 'import-chunks', element: <ImportPage /> },
                    { path: 'studynotes', element: <StudyNoteManagement /> },
                    { path: 'synonyms', element: <SynonymManagement /> }

                ],
            },
        ],
    },
]);

// --- RENDERIZAÇÃO ---
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    </React.StrictMode>
);