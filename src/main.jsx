// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './index.css';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Páginas
import App from './App'; // Sua página pública E de login
import AdminPage from './pages/admin/AdminPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import WorkManagement from './pages/admin/WorkManagement';
import AuthorManagement from './pages/admin/AuthorManagement';
import TopicManagement from "./pages/admin/TopicManagement.jsx";
import ChunkManagement from "./pages/admin/ChunkManagement.jsx";

// === 2. ESTE É O ÚNICO PLACEHOLDER QUE RESTA ===
// (Note que só há UMA definição de ChunkManagement)

// === 3. DEFINIÇÃO ÚNICA DO ROTEADOR ===
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
                element: <AdminPage />,
                children: [
                    // O roteador usa os componentes que importamos acima
                    { index: true, element: <AdminDashboard /> },
                    { path: 'works', element: <WorkManagement /> },
                    { path: 'authors', element: <AuthorManagement /> },
                    { path: 'works/:workId/chunks', element: <ChunkManagement /> },
                    { path: 'topics', element: <TopicManagement /> },
                ],
            },
        ],
    },
]);

// === 4. RENDERIZAÇÃO DO APP ===
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    </React.StrictMode>
);