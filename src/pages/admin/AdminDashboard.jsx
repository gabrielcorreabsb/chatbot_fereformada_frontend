// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { apiClient } from '../../apiClient';
import LoadingSpinner from '../../components/LoadingSpinner';
// --- 1. IMPORTAR COMPONENTES DE GRÁFICO ---
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, Tooltip as PieTooltip
} from 'recharts';


// Componente de Cartão de Estatística (sem mudanças)
function StatCard({ title, value, status = 'default' }) {
    const statusClass = status === 'danger' ? 'stat-danger' : '';
    return (
        <div className={`stat-card ${statusClass}`}>
            <div className="stat-value">{value}</div>
            <div className="stat-title">{title}</div>
        </div>
    );
}

// Cores para o gráfico de pizza
const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Componente Principal do Dashboard
export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { session } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            if (!session) return;
            try {
                setLoading(true);
                const response = await apiClient.get('/admin/dashboard/stats', {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
                setStats(response.data);
            } catch (err) {
                setError("Falha ao carregar as estatísticas do dashboard.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [session]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="message-box error">{error}</div>;
    if (!stats) return null;

    // --- 3. PREPARAR DADOS PARA O GRÁFICO DE PIZZA ---
    const pieChartData = stats.notesBySource.map(item => ({
        name: item.source,
        value: item.count
    }));

    return (
        <div className="content-box">
            <h1>Dashboard</h1>

            {/* --- CARTÕES DE ESTATÍSTICA (Sem mudanças) --- */}
            <div className="stat-card-grid">
                <StatCard title="Total de Obras" value={stats.totalWorks} />
                <StatCard title="Total de Autores" value={stats.totalAuthors} />
                <StatCard title="Total de Tópicos" value={stats.totalTopics} />

                <StatCard title="Total de Chunks" value={stats.totalChunks} />
                <StatCard
                    title="Chunks Sem Vetor"
                    value={stats.chunksWithoutVector}
                    status={stats.chunksWithoutVector > 0 ? 'danger' : 'default'}
                />
                <StatCard title=" " value=" " />

                <StatCard title="Total de Notas" value={stats.totalStudyNotes} />
                <StatCard
                    title="Notas Sem Vetor"
                    value={stats.notesWithoutVector}
                    status={stats.notesWithoutVector > 0 ? 'danger' : 'default'}
                />
            </div>

            {/* --- 4. GRÁFICOS (Substituímos os <pre>) --- */}
            <div className="dashboard-charts">

                {/* Gráfico 1: Chunks por Obra (Gráfico de Barras) */}
                <div className="chart-container">
                    <h2>Chunks por Obra</h2>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.chunksByWork} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="workAcronym" angle={-45} textAnchor="end" interval={0} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" name="Nº de Chunks" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Gráfico 2: Notas por Fonte (Gráfico de Pizza) */}
                <div className="chart-container">
                    <h2>Notas por Fonte</h2>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                                labelLine={false}
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <PieTooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
}