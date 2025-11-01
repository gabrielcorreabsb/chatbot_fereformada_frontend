// src/pages/admin/AuthorManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../AuthContext';
import { apiClient } from '../../apiClient';
import AuthorFormModal from './AuthorFormModal'; // <-- Importa o NOVO modal
import { jwtDecode } from 'jwt-decode'; // <-- Importa para checar a role

export default function AuthorManagement() {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [authorToEdit, setAuthorToEdit] = useState(null); // <-- Para saber se estamos editando
    const { session } = useAuth();

    // Decodifica o token para saber se é ADMIN
    const decodedToken = session ? jwtDecode(session.access_token) : null;
    const userRoles = decodedToken?.roles || [];
    const isAdmin = userRoles.includes('ADMIN');

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

    const handleOpenModal = (author = null) => {
        setAuthorToEdit(author); // Se 'author' for null, é "Criar", se não, é "Editar"
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setAuthorToEdit(null); // Limpa o estado de edição
    };

    const handleSave = () => {
        handleCloseModal();
        fetchData(); // Recarrega a tabela
    };

    const handleDelete = async (authorId) => {
        if (!window.confirm("Tem certeza que deseja deletar este autor? Esta ação não pode ser desfeita.")) {
            return;
        }

        try {
            await apiClient.delete(`/admin/authors/${authorId}`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            fetchData(); // Recarrega
        } catch (err) {
            console.error("Falha ao deletar autor:", err);
            // Mostra o erro de "não pode deletar" que configuramos no backend
            alert(err.response?.data?.message || "Erro ao deletar.");
        }
    };


    if (loading) return <h1>Carregando autores...</h1>;
    if (error) return <h1 style={{ color: 'red' }}>{error}</h1>;

    return (
        <div>
            {isModalOpen && (
                <AuthorFormModal
                    session={session}
                    authorToEdit={authorToEdit}
                    onSave={handleSave}
                    onClose={handleCloseModal}
                />
            )}

            <h1>Gerenciar Autores</h1>

            {/* Só mostra o botão "Adicionar" se for ADMIN */}
            {isAdmin && (
                <button
                    onClick={() => handleOpenModal(null)} // 'null' significa modo "Criar"
                    style={{ marginBottom: '1.5rem', padding: '10px 15px' }}
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
                    {isAdmin && <th>Ações</th>} {/* Só mostra a coluna se for ADMIN */}
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
                                <td>
                                    <button onClick={() => handleOpenModal(author)}>Editar</button>
                                    <button onClick={() => handleDelete(author.id)} style={{ marginLeft: 8 }}>Deletar</button>
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