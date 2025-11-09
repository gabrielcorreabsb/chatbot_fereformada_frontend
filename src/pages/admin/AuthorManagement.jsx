// src/pages/admin/AuthorManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../AuthContext';
import { apiClient } from '../../apiClient';
import AuthorFormModal from './AuthorFormModal';
import { jwtDecode } from 'jwt-decode';
import LoadingSpinner from '../../components/LoadingSpinner'; // <-- 1. ADICIONADO

export default function AuthorManagement() {
    // (Estados... sem mudanças)
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [authorToEdit, setAuthorToEdit] = useState(null);
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
            const response = await apiClient.get('/admin/authors', {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            setAuthors(response.data.content || []);
        } catch (err) {
            console.error("Falha ao buscar autores:", err);
            setError("Não foi possível carregar os autores.");
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // (handleOpenModal, handleCloseModal, handleSave... sem mudanças)
    const handleOpenModal = (author = null) => { setAuthorToEdit(author); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setAuthorToEdit(null); };
    const handleSave = () => { handleCloseModal(); fetchData(); };

    // (handleDelete... sem mudanças)
    const handleDelete = async (authorId) => {
        if (!window.confirm("Tem certeza que deseja deletar este autor? Esta ação não pode ser desfeita.")) {
            return;
        }
        try {
            await apiClient.delete(`/admin/authors/${authorId}`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            fetchData();
        } catch (err) {
            console.error("Falha ao deletar autor:", err);
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
                <AuthorFormModal
                    session={session}
                    authorToEdit={authorToEdit}
                    onSave={handleSave}
                    onClose={handleCloseModal}
                />
            )}

            <h1>Gerenciar Autores</h1>

            {isAdmin && (
                // --- 4. ATUALIZADO (Botão) ---
                <button
                    onClick={() => handleOpenModal(null)}
                    className="btn btn-primary"
                    style={{ marginBottom: '1.5rem' }}
                >
                    + Adicionar Novo Autor
                </button>
            )}

            <table className="admin-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Era</th>
                    {isAdmin && <th>Ações</th>}
                </tr>
                </thead>
                <tbody>
                {authors.length === 0 ? (
                    <tr>
                        <td colSpan={isAdmin ? 4 : 3}>Nenhum autor encontrado.</td>
                    </tr>
                ) : (
                    authors.map((author) => (
                        <tr key={author.id}>
                            <td>{author.id}</td>
                            <td>{author.name}</td>
                            <td>{author.era}</td>
                            {isAdmin && (
                                // --- 5. ATUALIZADO (Botões da Tabela) ---
                                <td className="table-actions">
                                    <button
                                        onClick={() => handleOpenModal(author)}
                                        className="btn btn-secondary"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(author.id)}
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