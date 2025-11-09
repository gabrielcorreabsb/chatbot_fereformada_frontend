// src/pages/admin/TopicManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../AuthContext';
import { apiClient } from '../../apiClient';
import TopicFormModal from './TopicFormModal';
import { jwtDecode } from 'jwt-decode';
import LoadingSpinner from '../../components/LoadingSpinner'; // <-- 1. ADICIONADO

export default function TopicManagement() {
    // (Estados... sem mudanças)
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [topicToEdit, setTopicToEdit] = useState(null);
    const { session } = useAuth();
    const decodedToken = session ? jwtDecode(session.access_token) : null;
    const userRoles = decodedToken?.roles || [];
    const isAdmin = userRoles.includes('ADMIN');

    // (fetchData... sem mudanças)
    const fetchData = useCallback(async () => {
        if (!session) return;
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/admin/topics', {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            setTopics(response.data.content || []);
        } catch (err) {
            console.error("Falha ao buscar tópicos:", err);
            setError("Não foi possível carregar os tópicos.");
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // (handleOpenModal, handleCloseModal, handleSave... sem mudanças)
    const handleOpenModal = (topic = null) => { setTopicToEdit(topic); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setTopicToEdit(null); };
    const handleSave = () => { handleCloseModal(); fetchData(); };

    // (handleDelete... sem mudanças)
    const handleDelete = async (topicId) => {
        if (!window.confirm("Tem certeza que deseja deletar este tópico?")) {
            return;
        }
        try {
            await apiClient.delete(`/admin/topics/${topicId}`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            fetchData();
        } catch (err) {
            console.error("Falha ao deletar tópico:", err);
            alert(err.response?.data?.message || "Erro ao deletar.");
        }
    };

    // --- 2. ATUALIZADO (Loading/Error) ---
    if (loading) return <LoadingSpinner />;
    if (error) return <div className="message-box error">{error}</div>;

    return (
        // --- 3. ATUALIZADO (Container) ---
        <div className="content-box">
            {isModalOpen && (
                <TopicFormModal
                    session={session}
                    topicToEdit={topicToEdit}
                    onSave={handleSave}
                    onClose={handleCloseModal}
                />
            )}

            <h1>Gerenciar Tópicos</h1>

            {isAdmin && (
                // --- 4. ATUALIZADO (Botão) ---
                <button
                    onClick={() => handleOpenModal(null)}
                    className="btn btn-primary"
                    style={{ marginBottom: '1.5rem' }}
                >
                    + Adicionar Novo Tópico
                </button>
            )}

            <table className="admin-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Descrição</th>
                    {isAdmin && <th>Ações</th>}
                </tr>
                </thead>
                <tbody>
                {topics.length === 0 ? (
                    <tr>
                        <td colSpan={isAdmin ? 4 : 3}>Nenhum tópico encontrado.</td>
                    </tr>
                ) : (
                    topics.map((topic) => (
                        <tr key={topic.id}>
                            <td>{topic.id}</td>
                            <td>{topic.name}</td>
                            <td>{topic.description?.substring(0, 100) || 'N/A'}{topic.description?.length > 100 ? '...' : ''}</td>
                            {isAdmin && (
                                // --- 5. ATUALIZADO (Botões da Tabela) ---
                                <td className="table-actions">
                                    <button
                                        onClick={() => handleOpenModal(topic)}
                                        className="btn btn-secondary"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(topic.id)}
                                        className="btn btn-danger"
                                        style={{ marginLeft: '0.5rem' }}
                                    >
                                        Deletar
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
}