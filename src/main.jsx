// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// --- CSS GLOBAIS ---
import './index.css';
import './layout/AdminLayout.css'; //

// --- PROVIDERS ---
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';

// --- PÁGINAS ---
import App from './App';
import AdminLayout from './layout/AdminLayout'; // <-- 2. IMPORTA O NOVO LAYOUT

// --- PÁGINAS FILHAS
import AdminDashboard from './pages/admin/AdminDashboard';
import WorkManagement from './pages/admin/WorkManagement';
import AuthorManagement from './pages/admin/AuthorManagement';
import TopicManagement from "./pages/admin/TopicManagement.jsx";
import ChunkManagement from "./pages/admin/ChunkManagement.jsx";
import ImportPage from './pages/admin/ImportPage';


const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
    },
    {
        path: '/admin',
        element: <ProtectedRoute />,
        children: [
            {
                // 3. USA O NOVO AdminLayout COMO O "ESQUELETO"
                element: <AdminLayout />,
                children: [
                    { index: true, element: <AdminDashboard /> },
                    { path: 'works', element: <WorkManagement /> },
                    { path: 'authors', element: <AuthorManagement /> },
                    { path: 'works/:workId/chunks', element: <ChunkManagement /> },
                    { path: 'topics', element: <TopicManagement /> },
                    // O path abaixo corresponde ao seu router original
                    { path: 'import-chunks', element: <ImportPage /> }
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