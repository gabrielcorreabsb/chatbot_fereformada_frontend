// src/pages/admin/WorkManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../AuthContext';
import { apiClient } from '../../apiClient';
import WorkFormModal from './WorkFormModal';
import { Link } from 'react-router-dom';
import './AdminForm.css';
import { jwtDecode } from 'jwt-decode'; // <-- Importar para checar a role

export default function WorkManagement() {
    const [works, setWorks] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [workToEdit, setWorkToEdit] = useState(null);
    const { session } = useAuth();

    const decodedToken = session ? jwtDecode(session.access_token) : null;
    const userRoles = decodedToken?.roles || [];
    const isAdmin = userRoles.includes('ADMIN');

    const fetchData = useCallback(async () => {
        if (!session) return;
        setLoading(true);
        setError(null);
        try {
            const [worksResponse, authorsResponse] = await Promise.all([
                apiClient.get('/admin/works', {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                }),
                apiClient.get('/admin/authors', {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                })
            ]);

            const worksData = worksResponse.data;
            if (worksData?.content) {
                setWorks(worksData.content);
            } else if (Array.isArray(worksData)) {
                setWorks(worksData);
            } else {
                throw new Error("Formato de dados de 'Obras' inesperado.");
            }

            const authorsData = authorsResponse.data;
            if (authorsData?.content) {
                setAuthors(authorsData.content);
            } else if (Array.isArray(authorsData)) {
                setAuthors(authorsData);
            } else {
                throw new Error("Formato de dados de 'Autores' inesperado.");
            }

        } catch (err) {
            console.error("Falha ao buscar dados:", err);
            if (err.response?.status === 403) {
                setError("Você não tem permissão para ver este recurso. (403 Forbidden)");
            } else {
                setError("Não foi possível carregar os dados. Verifique se a API está rodando.");
            }
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (work = null) => {
        setWorkToEdit(work);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setWorkToEdit(null);
    };

    const handleSave = () => {
        handleCloseModal();
        fetchData();
    };

    const handleDelete = async (workId) => {
        if (!window.confirm("Tem certeza que deseja deletar esta obra? TODOS os seus chunks (conteúdos) serão perdidos!")) {
            return;
        }

        try {
            await apiClient.delete(`/admin/works/${workId}`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            fetchData();
        } catch (err) {
            console.error("Falha ao deletar obra:", err);
            alert(err.response?.data?.message || "Erro ao deletar.");
        }
    };

    if (loading) {
        return <h1>Carregando obras e autores...</h1>;
    }
    if (error) {
        return <h1 style={{ color: 'red' }}>{error}</h1>;
    }

    return (
        <div>
            {isModalOpen && (
                <WorkFormModal
                    session={session}
                    authors={authors}
                    workToEdit={workToEdit}
                    onSave={handleSave}
                    onClose={handleCloseModal}
                />
            )}

            <h1>Gerenciar Obras</h1>

            {isAdmin && (
                <button
                    onClick={() => handleOpenModal(null)}
                    style={{ marginBottom: '1.5rem', padding: '10px 15px' }}
                    disabled={authors.length === 0}
                >
                    + Adicionar Nova Obra
                </button>
            )}
            {!isAdmin && (
                <p style={{fontStyle: 'italic'}}>Moderadores podem ver obras, mas apenas Admins podem criar, editar ou deletar.</p>
            )}

            <table className="admin-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Título (Clique para ver o conteúdo)</th> {/* <-- 2. Texto da coluna atualizado */}
                    <th>Acrônimo</th>
                    <th>Autor</th>
                    {isAdmin && <th>Ações</th>}
                </tr>
                </thead>
                <tbody>
                {works.length === 0 ? (
                    <tr>
                        <td colSpan={isAdmin ? 5 : 4}>Nenhuma obra encontrada.</td>
                    </tr>
                ) : (
                    works.map((work) => (
                        <tr key={work.id}>
                            <td>{work.id}</td>
                            <td>
                                {/* === 3. A MUDANÇA ESTÁ AQUI === */}
                                {/* Transforma o título em um link para a página de chunks */}
                                <Link
                                    to={`/admin/works/${work.id}/chunks`}
                                    style={{fontWeight: 500, textDecoration: 'none'}}
                                >
                                    {work.title}
                                </Link>
                            </td>
                            <td>{work.acronym}</td>
                            <td>{work.author ? work.author.name : 'N/A'}</td>
                            {isAdmin && (
                                <td>
                                    <button onClick={() => handleOpenModal(work)}>Editar</button>
                                    <button onClick={() => handleDelete(work.id)} style={{ marginLeft: 8 }}>Deletar</button>
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