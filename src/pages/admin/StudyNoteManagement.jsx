// src/pages/admin/StudyNoteManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../AuthContext';
import { apiClient } from '../../apiClient';
import { jwtDecode } from 'jwt-decode';
import LoadingSpinner from '../../components/LoadingSpinner';
import StudyNoteFormModal from './StudyNoteFormModal';

export default function StudyNoteManagement() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { session } = useAuth();

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterTerm, setFilterTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ field: "id", order: "asc" });

    const [sources, setSources] = useState([]);
    const [selectedSource, setSelectedSource] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [noteToEditId, setNoteToEditId] = useState(null);
    const [isModalLoading, setIsModalLoading] = useState(false);

    const decodedToken = session ? jwtDecode(session.access_token) : null;
    const userRoles = decodedToken?.roles || [];
    const isAdmin = userRoles.includes('ADMIN');

    useEffect(() => {
        if (session) {
            const fetchSources = async () => {
                try {
                    const response = await apiClient.get('/admin/studynotes/sources', {
                        headers: { Authorization: `Bearer ${session.access_token}` }
                    });
                    setSources(response.data || []);
                } catch (err) {
                    console.error("Falha ao buscar fontes:", err);
                }
            };
            fetchSources();
        }
    }, [session]);


    const fetchData = useCallback(async (pageToFetch) => {
        if (!session) return;
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append('page', pageToFetch);
        params.append('sort', `${sortConfig.field},${sortConfig.order}`);
        if (filterTerm) {
            params.append('search', filterTerm);
        }
        if (selectedSource) {
            params.append('source', selectedSource);
        }

        try {
            const response = await apiClient.get(`/admin/studynotes?${params.toString()}`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            setNotes(response.data.content || []);
            setCurrentPage(response.data.number || 0);
            setTotalPages(response.data.totalPages || 0);
        } catch (err) {
            console.error("Falha ao buscar notas de estudo:", err);
            setError("Não foi possível carregar as notas de estudo.");
        } finally {
            setLoading(false);
        }
    }, [session, filterTerm, sortConfig, selectedSource]);

    // Re-busca os dados quando a página atual ou os filtros mudam
    useEffect(() => {
        // Agora este useEffect é a *única* fonte de 'fetchData' quando a página muda
        fetchData(currentPage);
    }, [fetchData, currentPage]);

    // --- Handlers de Busca e Classificação ---
    const handleSortChange = (e) => {
        const [field, order] = e.target.value.split(',');
        setSortConfig({ field, order });
        setCurrentPage(0);
    };
    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setFilterTerm(searchTerm);
        setCurrentPage(0);
    };
    const handleSourceChange = (e) => {
        setSelectedSource(e.target.value);
        setCurrentPage(0);
    };

    // --- Handlers de Modal e CRUD (sem mudanças) ---
    const handleCloseModal = () => { setIsModalOpen(false); setNoteToEditId(null); };
    const handleSave = () => { handleCloseModal(); fetchData(currentPage); };
    const handleOpenModal = (noteId = null) => { setNoteToEditId(noteId); setIsModalOpen(true); };

    // O handleDelete está correto
    const handleDelete = async (noteId) => {
        if (!window.confirm("Tem certeza que deseja deletar esta nota? Esta ação não pode ser desfeita.")) {
            return;
        }
        setIsModalLoading(true);
        setError(null);
        try {
            await apiClient.delete(`/admin/studynotes/${noteId}`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            if (notes.length === 1 && currentPage > 0) {
                // Se era o último item, volta uma página
                setCurrentPage(currentPage - 1); // O useEffect cuidará do fetchData
            } else {
                // Apenas recarrega a página atual
                fetchData(currentPage);
            }
        } catch (err) {
            console.error("Falha ao deletar nota:", err);
            setError("Não foi possível deletar a nota.");
        } finally {
            setIsModalLoading(false);
        }
    };

    /**
     * ======================================================
     * CORREÇÃO 1: Função formatReference implementada
     * ======================================================
     */
    const formatReference = (note) => {
        if (!note?.book) return "N/A";

        // Início: "Livro Cap:Vers"
        let ref = `${note.book} ${note.startChapter}:${note.startVerse}`;

        // Checa se endChapter existe E é diferente do startChapter
        if (note.endChapter && note.endChapter !== note.startChapter) {
            ref += ` - ${note.endChapter}:${note.endVerse || 1}`; // Ex: Gênesis 1:1 - 2:3
        }
        // Senão, checa se endVerse existe E é diferente do startVerse
        else if (note.endVerse && note.endVerse !== note.startVerse) {
            ref += `-${note.endVerse}`; // Ex: Gênesis 1:1-5
        }

        // Se não, o formato base "Gênesis 1:1" já está correto.
        return ref;
    };

    // --- Renderização ---
    if (loading && notes.length === 0) return <LoadingSpinner />;
    if (error) return <div className="message-box error">{error}</div>;

    return (
        <div className="content-box" style={{ position: 'relative' }}>
            {isModalLoading && <LoadingSpinner />}
            {isModalOpen && (
                <StudyNoteFormModal
                    session={session}
                    noteId={noteToEditId}
                    onSave={handleSave}
                    onClose={handleCloseModal}
                    onLoading={setIsModalLoading}
                />
            )}

            <h1>Gerenciar Notas de Estudo</h1>

            {isAdmin && (
                <button
                    onClick={() => handleOpenModal(null)}
                    className="btn btn-primary"
                    style={{ marginBottom: '1.5rem' }}
                >
                    + Adicionar Nova Nota
                </button>
            )}

            <form onSubmit={handleSearchSubmit} className="filter-bar">
                <div className="form-group">
                    <label htmlFor="search">Buscar</label>
                    <input
                        type="text"
                        id="search"
                        placeholder="Buscar em livro, conteúdo, fonte..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="source">Filtrar por Fonte</label>
                    <select id="source" value={selectedSource} onChange={handleSourceChange}>
                        <option value="">-- Todas as Fontes --</option>
                        {sources.map((item) => (
                            <option key={item.source} value={item.source}>
                                {item.source} ({item.count} notas)
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="sort">Classificar por</label>
                    <select id="sort" value={`${sortConfig.field},${sortConfig.order}`} onChange={handleSortChange}>
                        <option value="id,asc">ID (Crescente)</option>
                        <option value="id,desc">ID (Decrescente)</option>
                        {/* * ======================================================
                          * CORREÇÃO 2: 'valueMusic' corrigido para 'value'
                          * ======================================================
                          */}
                        <option value="book,asc">Livro (A-Z)</option>
                        <option value="book,desc">Livro (Z-A)</option>
                        <option value="noteContent,asc">Conteúdo (A-Z)</option>
                        <option value="noteContent,desc">Conteúdo (Z-A)</option>
                    </select>
                </div>

                <button type="submit" className="btn btn-primary">Buscar</button>
            </form>

            {loading && <LoadingSpinner />}

            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>Referência</th>
                        <th>Conteúdo da Nota</th>
                        <th>Fonte</th>
                        {isAdmin && <th>Ações</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {notes.length === 0 ? (
                        <tr>
                            <td colSpan={isAdmin ? 4 : 3}>
                                {filterTerm || selectedSource ? `Nenhuma nota encontrada para os filtros aplicados.` : "Nenhuma nota de estudo encontrada."}
                            </td>
                        </tr>
                    ) : (
                        notes.map((note) => (
                            <tr key={note.id}>
                                <td data-label="Referência">{formatReference(note)}</td>
                                <td data-label="Conteúdo">{note.noteContent.substring(0, 150)}...</td>
                                <td data-label="Fonte">{note.source || 'N/A'}</td>
                                {isAdmin && (
                                    <td data-label="Ações" className="table-actions">
                                        <button
                                            onClick={() => handleOpenModal(note.id)}
                                            className="btn btn-secondary btn-sm"
                                            disabled={isModalLoading}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(note.id)}
                                            className="btn btn-danger btn-sm"
                                            disabled={isModalLoading}
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

            {/* * ======================================================
              * CORREÇÃO 3: Paginação corrigida (chama só setCurrentPage)
              * ======================================================
              */}
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