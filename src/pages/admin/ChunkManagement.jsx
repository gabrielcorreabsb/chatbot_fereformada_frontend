// src/pages/admin/ChunkManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { apiClient } from '../../apiClient';
import ChunkFormModal from './ChunkFormModal';
import { jwtDecode } from 'jwt-decode';
import LoadingSpinner from '../../components/LoadingSpinner';
import ChunkPreviewModal from './ChunkPreviewModal';
import BulkTopicModal from './BulkTopicModal';

export default function ChunkManagement() {
    const { workId } = useParams();
    const [chunks, setChunks] = useState([]);
    const [work, setWork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chunkToEdit, setChunkToEdit] = useState(null);
    const { session } = useAuth();
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [previewChunk, setPreviewChunk] = useState(null);
    const [isModalLoading, setIsModalLoading] = useState(false);

    // --- ESTADOS PARA AÇÕES EM MASSA ---
    const [selectedChunkIds, setSelectedChunkIds] = useState(new Set());
    const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);

    // --- ESTADOS PARA BUSCA E CLASSIFICAÇÃO ---
    const [searchTerm, setSearchTerm] = useState(""); // O que o usuário digita
    const [filterTerm, setFilterTerm] = useState(""); // O que foi aplicado na API
    const [sortConfig, setSortConfig] = useState({ field: "id", order: "asc" });

    // --- Lógica de Roles ---
    const decodedToken = session ? jwtDecode(session.access_token) : null;
    const userRoles = decodedToken?.roles || [];
    const isAdmin = userRoles.includes('ADMIN');
    const isModerator = userRoles.includes('MODERATOR');

    /**
     * Função principal de busca de dados.
     * Agora inclui os parâmetros de busca e classificação.
     */
    const fetchData = useCallback(async (pageToFetch) => {
        if (!session || !workId) return;
        setLoading(true);
        setError(null);
        setSelectedChunkIds(new Set()); // Limpa seleção ao trocar de página

        // Monta os parâmetros de query para a API
        const params = new URLSearchParams();
        params.append('page', pageToFetch);
        params.append('sort', `${sortConfig.field},${sortConfig.order}`);

        if (filterTerm) {
            params.append('search', filterTerm);
        }

        try {
            // A URL agora inclui os parâmetros
            const [chunksResponse, workResponse] = await Promise.all([
                apiClient.get(`/admin/works/${workId}/chunks?${params.toString()}`, {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                }),
                apiClient.get(`/admin/works/${workId}`, {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                })
            ]);

            setChunks(chunksResponse.data.content || []);
            setCurrentPage(chunksResponse.data.number || 0);
            setTotalPages(chunksResponse.data.totalPages || 0);
            setWork(workResponse.data || null);

        } catch (err) {
            console.error("Falha ao buscar chunks:", err);
            setError("Não foi possível carregar os chunks.");
        } finally {
            setLoading(false);
        }
    }, [session, workId, filterTerm, sortConfig]); // Depende dos filtros

    // Efeito para re-buscar dados quando a página ou os filtros mudam
    useEffect(() => {
        fetchData(currentPage);
    }, [fetchData, currentPage]); // 'fetchData' já inclui filterTerm e sortConfig

    // --- Handlers de Busca e Classificação ---

    const handleSortChange = (e) => {
        const [field, order] = e.target.value.split(',');
        setSortConfig({ field, order });
        setCurrentPage(0); // Volta para a primeira página
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setFilterTerm(searchTerm); // Aplica o filtro
        setCurrentPage(0); // Volta para a primeira página
    };

    // --- Handlers de Modais e CRUD (Sem mudanças) ---
    const handleCloseModal = () => { setIsModalOpen(false); setChunkToEdit(null); };
    const handleSave = () => { handleCloseModal(); fetchData(currentPage); };

    const handleDelete = async (chunkId) => {
        if (!window.confirm("Tem certeza que deseja deletar este bloco de conteúdo?")) { return; }
        try {
            await apiClient.delete(`/admin/chunks/${chunkId}`, { headers: { Authorization: `Bearer ${session.access_token}` } });
            fetchData(currentPage);
        } catch (err) { alert(err.response?.data?.message || "Erro ao deletar."); }
    };

    const handleOpenModal = async (chunkId) => {
        if (!chunkId) { setChunkToEdit(null); setIsModalOpen(true); return; }
        setIsModalLoading(true);
        try {
            const response = await apiClient.get(`/admin/chunks/${chunkId}`, { headers: { Authorization: `Bearer ${session.access_token}` } });
            setChunkToEdit(response.data);
            setIsModalOpen(true);
        } catch (err) { alert("Não foi possível carregar os dados completos do chunk."); }
        finally { setIsModalLoading(false); }
    };

    const handleOpenPreview = async (chunkId) => {
        setIsModalLoading(true);
        try {
            const response = await apiClient.get(`/admin/chunks/${chunkId}`, { headers: { Authorization: `Bearer ${session.access_token}` } });
            setPreviewChunk(response.data);
        } catch (err) { alert("Não foi possível carregar os dados completos do chunk."); }
        finally { setIsModalLoading(false); }
    };

    // --- Handlers de Ações em Massa (Sem mudanças) ---
    const handleSelectOne = (chunkId) => {
        const newSelection = new Set(selectedChunkIds);
        if (newSelection.has(chunkId)) {
            newSelection.delete(chunkId);
        } else {
            newSelection.add(chunkId);
        }
        setSelectedChunkIds(newSelection);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedChunkIds(new Set(chunks.map(c => c.id)));
        } else {
            setSelectedChunkIds(new Set());
        }
    };

    const areAllOnPageSelected = chunks.length > 0 && chunks.every(c => selectedChunkIds.has(c.id));

    const handleDeleteSelected = async () => {
        if (!window.confirm(`Tem certeza que deseja deletar ${selectedChunkIds.size} chunks?`)) { return; }
        try {
            await apiClient.delete('/admin/chunks/bulk-delete', {
                headers: { Authorization: `Bearer ${session.access_token}` },
                data: { ids: Array.from(selectedChunkIds) }
            });
            fetchData(currentPage);
        } catch (err) {
            console.error("Falha ao deletar chunks em massa:", err);
            alert(err.response?.data?.message || "Erro ao deletar.");
        }
    };

    const handleBulkTopicsSaved = () => {
        setIsTopicModalOpen(false);
        fetchData(currentPage);
    };


    // --- Renderização ---
    if (loading && chunks.length === 0) return <LoadingSpinner />;
    if (error) return <div className="message-box error">{error}</div>;

    return (
        <div className="content-box" style={{ position: 'relative' }}>
            {isModalLoading && <LoadingSpinner />}
            {isModalOpen && ( <ChunkFormModal session={session} workId={workId} chunkToEdit={chunkToEdit} onSave={handleSave} onClose={handleCloseModal} /> )}
            {previewChunk && ( <ChunkPreviewModal chunk={previewChunk} onClose={() => setPreviewChunk(null)} /> )}
            {isTopicModalOpen && (
                <BulkTopicModal
                    session={session}
                    selectedChunkIds={Array.from(selectedChunkIds)}
                    onSave={handleBulkTopicsSaved}
                    onClose={() => setIsTopicModalOpen(false)}
                />
            )}

            <h3>
                <Link to="/admin/works" className="content-link">Obras</Link> / {work ? work.title : 'Carregando...'}
            </h3>
            <h1>Gerenciar Conteúdo (Chunks)</h1>

            {(isAdmin || isModerator) && (
                <button
                    onClick={() => handleOpenModal(null)}
                    className="btn btn-primary"
                    style={{ marginBottom: '1.5rem' }}
                >
                    + Adicionar Novo Bloco
                </button>
            )}

            {/* --- BARRA DE BUSCA E CLASSIFICAÇÃO --- */}
            <form onSubmit={handleSearchSubmit} className="filter-bar">
                <div className="form-group">
                    <label htmlFor="search">Buscar</label>
                    <input
                        type="text"
                        id="search"
                        placeholder="Buscar em conteúdo, pergunta, título..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="sort">Classificar por</label>
                    <select id="sort" value={`${sortConfig.field},${sortConfig.order}`} onChange={handleSortChange}>
                        <option value="id,asc">ID (Crescente)</option>
                        <option value="id,desc">ID (Decrescente)</option>
                        <option value="content,asc">Conteúdo (A-Z)</option>
                        <option value="content,desc">Conteúdo (Z-A)</option>
                        <option value="question,asc">Pergunta (A-Z)</option>
                        <option value="question,desc">Pergunta (Z-A)</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">Buscar</button>
            </form>

            {/* --- BARRA DE AÇÕES EM MASSA --- */}
            {selectedChunkIds.size > 0 && (isAdmin || isModerator) && (
                <div className="bulk-action-bar">
                    <strong>{selectedChunkIds.size} selecionado(s)</strong>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIsTopicModalOpen(true)}
                        disabled={!isAdmin}
                    >
                        Adicionar Tópicos...
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={handleDeleteSelected}
                        disabled={!isAdmin}
                    >
                        Deletar Selecionados
                    </button>
                    {!isAdmin && <small>(Apenas Admins podem executar ações em massa)</small>}
                </div>
            )}

            {loading && <LoadingSpinner />}

            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th className="checkbox-cell">
                            <input
                                type="checkbox"
                                checked={areAllOnPageSelected}
                                onChange={handleSelectAll}
                            />
                        </th>
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
                            <td colSpan="6">
                                {filterTerm ? `Nenhum chunk encontrado para "${filterTerm}".` : "Nenhum bloco de conteúdo encontrado."}
                            </td>
                        </tr>
                    ) : (
                        chunks.map((chunk) => (
                            <tr key={chunk.id} className={selectedChunkIds.has(chunk.id) ? 'row-selected' : ''}>
                                <td data-label="Selecionar" className="checkbox-cell">
                                    <input
                                        type="checkbox"
                                        checked={selectedChunkIds.has(chunk.id)}
                                        onChange={() => handleSelectOne(chunk.id)}
                                    />
                                </td>
                                <td data-label="ID">{chunk.id}</td>
                                <td data-label="Cap/Perg">
                                    {chunk.chapterNumber && `Cap ${chunk.chapterNumber}`}
                                    {chunk.sectionNumber && ` / Sec ${chunk.sectionNumber}`}
                                    {!chunk.chapterNumber && chunk.sectionNumber && `Perg. ${chunk.sectionNumber}`}
                                </td>
                                <td data-label="Conteúdo">
                                    <strong>{chunk.question ? chunk.question.substring(0, 100) + '...' : ''}</strong>
                                    {!chunk.question && chunk.content ? chunk.content.substring(0, 100) + '...' : ''}
                                </td>
                                <td data-label="Tópicos">
                                    {chunk.topics && chunk.topics.length > 0 ? (
                                        <span style={{ fontSize: '0.9em', color: 'var(--color-text-muted)' }}>
                                                {chunk.topics.map(t => t.name).join(', ')}
                                            </span>
                                    ) : 'N/A'}
                                </td>
                                <td data-label="Ações" className="table-actions">
                                    <button
                                        onClick={() => handleOpenPreview(chunk.id)}
                                        className="btn btn-secondary btn-sm"
                                        disabled={isModalLoading}
                                    >
                                        Ver
                                    </button>
                                    {(isAdmin || isModerator) && (
                                        <button
                                            onClick={() => handleOpenModal(chunk.id)}
                                            className="btn btn-secondary btn-sm"
                                            disabled={isModalLoading}
                                        >
                                            Editar
                                        </button>
                                    )}
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDelete(chunk.id)}
                                            className="btn btn-danger btn-sm"
                                            disabled={isModalLoading}
                                        >
                                            Deletar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 0 || loading}
                    className="btn btn-secondary"
                >
                    Anterior
                </button>
                <span>
                    Página {currentPage + 1} de {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage + 1 >= totalPages || loading}
                    className="btn btn-secondary"
                >
                    Próxima
                </button>
            </div>
        </div>
    );
}