// src/pages/admin/ChunkManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom'; // <-- Importa useParams
import { useAuth } from '../../AuthContext';
import { apiClient } from '../../apiClient';
import ChunkFormModal from './ChunkFormModal'; // <-- Importa o Modal
import { jwtDecode } from 'jwt-decode';

export default function ChunkManagement() {
    // 1. Pega o ID da obra da URL (ex: /admin/works/17/chunks)
    const { workId } = useParams();

    const [chunks, setChunks] = useState([]);
    const [work, setWork] = useState(null); // Para mostrar o título da obra
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chunkToEdit, setChunkToEdit] = useState(null);
    const { session } = useAuth();

    const decodedToken = session ? jwtDecode(session.access_token) : null;
    const userRoles = decodedToken?.roles || [];
    const isAdmin = userRoles.includes('ADMIN');
    const isModerator = userRoles.includes('MODERATOR'); // Moderadores podem editar chunks

    // 2. Busca os chunks PARA ESTA OBRA
    const fetchData = useCallback(async () => {
        if (!session || !workId) return;
        setLoading(true);
        setError(null);
        try {
            // Vamos buscar os chunks E os detalhes da obra
            const [chunksResponse, workResponse] = await Promise.all([
                apiClient.get(`/admin/works/${workId}/chunks`, { // Endpoint de Chunks da Obra
                    headers: { Authorization: `Bearer ${session.access_token}` }
                }),
                apiClient.get(`/admin/works/${workId}`, { // Endpoint da Obra (para o título)
                    headers: { Authorization: `Bearer ${session.access_token}` }
                })
            ]);

            setChunks(chunksResponse.data.content || []);
            setWork(workResponse.data || null); // Salva os detalhes da obra

        } catch (err) {
            console.error("Falha ao buscar chunks:", err);
            setError("Não foi possível carregar os chunks.");
        } finally {
            setLoading(false);
        }
    }, [session, workId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (chunk = null) => {
        setChunkToEdit(chunk);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setChunkToEdit(null);
    };

    const handleSave = () => {
        handleCloseModal();
        fetchData(); // Recarrega
    };

    const handleDelete = async (chunkId) => {
        if (!window.confirm("Tem certeza que deseja deletar este bloco de conteúdo?")) {
            return;
        }

        try {
            await apiClient.delete(`/admin/chunks/${chunkId}`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            fetchData(); // Recarrega
        } catch (err) {
            console.error("Falha ao deletar chunk:", err);
            alert(err.response?.data?.message || "Erro ao deletar.");
        }
    };

    if (loading) return <h1>Carregando conteúdo...</h1>;
    if (error) return <h1 style={{ color: 'red' }}>{error}</h1>;

    return (
        <div>
            {isModalOpen && (
                <ChunkFormModal
                    session={session}
                    workId={workId} // Passa o ID da Obra para o modal
                    chunkToEdit={chunkToEdit}
                    onSave={handleSave}
                    onClose={handleCloseModal}
                />
            )}

            {/* Navegação "Breadcrumb" */}
            <h3>
                <Link to="/admin/works">Obras</Link> / {work ? work.title : 'Carregando...'}
            </h3>
            <h1>Gerenciar Conteúdo (Chunks)</h1>

            {/* Admins e Moderadores podem criar/editar chunks */}
            {(isAdmin || isModerator) && (
                <button
                    onClick={() => handleOpenModal(null)}
                    style={{ marginBottom: '1.5rem', padding: '10px 15px' }}
                >
                    + Adicionar Novo Bloco
                </button>
            )}

            <table className="admin-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Cap/Perg Nº</th>
                    <th>Pergunta / Conteúdo</th>
                    <th>Tópicos</th>
                    <th>Ações</th>
                </tr>
                </thead>
                <tbody>
                {chunks.length === 0 ? (
                    <tr>
                        <td colSpan="5">Nenhum bloco de conteúdo encontrado para esta obra.</td>
                    </tr>
                ) : (
                    chunks.map((chunk) => (
                        <tr key={chunk.id}>
                            <td>{chunk.id}</td>
                            <td>
                                {/* Mostra Cap. e Seção */}
                                {chunk.chapterNumber && `Cap ${chunk.chapterNumber}`}
                                {chunk.sectionNumber && ` / Sec ${chunk.sectionNumber}`}
                                {!chunk.chapterNumber && chunk.sectionNumber && `Perg. ${chunk.sectionNumber}`}
                            </td>
                            <td>
                                {/* Mostra a Pergunta (se existir) ou o início do Conteúdo */}
                                <strong>{chunk.question ? chunk.question.substring(0, 100) + '...' : ''}</strong>
                                {!chunk.question && chunk.content ? chunk.content.substring(0, 100) + '...' : ''}
                            </td>
                            <td>
                                {/* Mostra os tópicos associados */}
                                {chunk.topics.length > 0 ? (
                                    <span style={{fontSize: '0.9em', color: '#64748b'}}>
                      {chunk.topics.map(t => t.name).join(', ')}
                    </span>
                                ) : 'N/A'}
                            </td>
                            <td>
                                {(isAdmin || isModerator) && (
                                    <button onClick={() => handleOpenModal(chunk)}>Editar</button>
                                )}
                                {isAdmin && (
                                    <button onClick={() => handleDelete(chunk.id)} style={{ marginLeft: 8 }}>Deletar</button>
                                )}
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
}