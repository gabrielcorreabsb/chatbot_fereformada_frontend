// src/pages/admin/TopicManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../AuthContext';
import { apiClient } from '../../apiClient';
import TopicFormModal from './TopicFormModal'; // <-- Importa o NOVO modal
import { jwtDecode } from 'jwt-decode';

export default function TopicManagement() {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [topicToEdit, setTopicToEdit] = useState(null);
    const { session } = useAuth();

    const decodedToken = session ? jwtDecode(session.access_token) : null;
    const userRoles = decodedToken?.roles || [];
    const isAdmin = userRoles.includes('ADMIN');

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

    const handleOpenModal = (topic = null) => {
        setTopicToEdit(topic);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTopicToEdit(null);
    };

    const handleSave = () => {
        handleCloseModal();
        fetchData();
    };

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

    if (loading) return <h1>Carregando tópicos...</h1>;
    if (error) return <h1 style={{ color: 'red' }}>{error}</h1>;

    return (
        <div>
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
                <button
                    onClick={() => handleOpenModal(null)}
                    style={{ marginBottom: '1.5rem', padding: '10px 15px' }}
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
                                <td>
                                    <button onClick={() => handleOpenModal(topic)}>Editar</button>
                                    <button onClick={() => handleDelete(topic.id)} style={{ marginLeft: 8 }}>Deletar</button>
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