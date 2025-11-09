// src/pages/admin/ChunkFormModal.jsx
import React, { useState, useEffect} from 'react';
import { apiClient } from '../../apiClient';
import './AdminForm.css'; // Reutiliza o mesmo CSS

export default function ChunkFormModal({ session, workId, chunkToEdit, onSave, onClose }) {
    // ...    // --- Estados do Formulário ---
    const [formData, setFormData] = useState({
        question: '',
        content: '',
        chapterTitle: '',
        chapterNumber: null,
        sectionTitle: '',
        sectionNumber: null,
        subsectionTitle: '',
        subSubsectionTitle: '',
    });

    // --- Estados dos Tópicos ---
    const [allTopics, setAllTopics] = useState([]); // Lista de todos os tópicos (para o checklist)
    const [selectedTopics, setSelectedTopics] = useState(new Set()); // IDs dos tópicos marcados

    // --- Estados de Controle ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true); // Carregando os tópicos
    const [error, setError] = useState(null);

    const isEditMode = chunkToEdit != null;

    // 1. Busca todos os tópicos para construir o checklist
    useEffect(() => {
        const fetchAllTopics = async () => {
            try {
                // NOTA: Você precisa de um endpoint que retorne TODOS os tópicos, não uma página
                // Vamos assumir que criamos /api/admin/topics/all
                const response = await apiClient.get('/admin/topics/all', { // <--- Verifique este endpoint!
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
                setAllTopics(response.data || []);
            } catch (err) {
                console.error("Falha ao buscar tópicos:", err);
                setError("Não foi possível carregar a lista de tópicos.");
            } finally {
                setLoading(false);
            }
        };
        fetchAllTopics();
    }, [session]);

    // 2. Preenche o formulário se estiver no modo de edição
    useEffect(() => {
        if (isEditMode) {
            setFormData({
                question: chunkToEdit.question || '',
                content: chunkToEdit.content || '',
                chapterTitle: chunkToEdit.chapterTitle || '',
                chapterNumber: chunkToEdit.chapterNumber || null,
                sectionTitle: chunkToEdit.sectionTitle || '',
                sectionNumber: chunkToEdit.sectionNumber || null,
                subsectionTitle: chunkToEdit.subsectionTitle || '',
                subSubsectionTitle: chunkToEdit.subSubsectionTitle || '',
            });

            // Preenche os tópicos que já estavam selecionados
            const initialTopicIds = chunkToEdit.topics.map(topic => topic.id);
            setSelectedTopics(new Set(initialTopicIds));
        }
    }, [chunkToEdit, isEditMode]);

    // 3. Lida com as caixas de seleção (checkbox)
    const handleTopicChange = (topicId) => {
        setSelectedTopics(prev => {
            const newSet = new Set(prev);
            if (newSet.has(topicId)) {
                newSet.delete(topicId);
            } else {
                newSet.add(topicId);
            }
            return newSet;
        });
    };

    // 4. Lida com os campos de texto
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value === '' ? null : value // Envia 'null' se o campo for esvaziado
        }));
    };

    // 5. Envia o formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Junta os dados do formulário E os IDs dos tópicos
        const dto = {
            ...formData,
            chapterNumber: formData.chapterNumber ? parseInt(formData.chapterNumber, 10) : null,
            sectionNumber: formData.sectionNumber ? parseInt(formData.sectionNumber, 10) : null,
            topicIds: Array.from(selectedTopics) // Converte o Set em Array
        };

        // console.log("Enviando DTO:", dto); // Ótimo para debug

        try {
            if (isEditMode) {
                // API de Atualização
                await apiClient.put(`/admin/chunks/${chunkToEdit.id}`, dto, {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
            } else {
                // API de Criação (note que usa /works/{workId}/chunks)
                await apiClient.post(`/admin/works/${workId}/chunks`, dto, {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
            }
            onSave(); // Avisa o pai para recarregar e fechar

        } catch (err) {
            console.error("Falha ao salvar chunk:", err);
            setError(err.response?.data?.message || "Erro ao salvar. Verifique o console.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-content" style={{maxWidth: '800px'}}>
                <div className="admin-modal-header">
                    <h2>{isEditMode ? "Editar Bloco de Conteúdo" : "Adicionar Novo Bloco"}</h2>
                    <button onClick={onClose} className="admin-modal-close-btn">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="admin-form">
                    {error && <div className="admin-form-error">{error}</div>}

                    {/* Layout de 2 colunas para o formulário */}
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {/* Coluna da Esquerda (Dados do Chunk) */}
                        <div style={{ flex: 2 }}>
                            <div className="admin-form-group">
                                <label htmlFor="question">Pergunta (Opcional)</label>
                                <textarea id="question" name="question" rows="3" value={formData.question || ''} onChange={handleChange} />
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="content">Conteúdo / Resposta (Obrigatório)</label>
                                <textarea id="content" name="content" rows="8" value={formData.content || ''} onChange={handleChange} required />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="admin-form-group" style={{flex: 1}}>
                                    <label htmlFor="chapterNumber">Nº Cap.</label>
                                    <input type="number" id="chapterNumber" name="chapterNumber" value={formData.chapterNumber || ''} onChange={handleChange} />
                                </div>
                                <div className="admin-form-group" style={{flex: 1}}>
                                    <label htmlFor="sectionNumber">Nº Seção/Perg.</label>
                                    <input type="number" id="sectionNumber" name="sectionNumber" value={formData.sectionNumber || ''} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="chapterTitle">Título do Capítulo</label>
                                <input type="text" id="chapterTitle" name="chapterTitle" value={formData.chapterTitle || ''} onChange={handleChange} />
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="sectionTitle">Título da Seção</label>
                                <input type="text" id="sectionTitle" name="sectionTitle" value={formData.sectionTitle || ''} onChange={handleChange} />
                            </div>

                            {/* Você pode adicionar subsectionTitle e subSubsectionTitle aqui se precisar */}

                        </div>

                        {/* Coluna da Direita (Tópicos) */}
                        <div style={{ flex: 1, borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
                            <label>Tópicos Associados</label>
                            {loading ? (
                                <p>Carregando tópicos...</p>
                            ) : (
                                <div className="admin-form-group">
                                    {allTopics.map(topic => (
                                        <div key={topic.id} style={{ display: 'block', marginBottom: '0.5rem' }}>
                                            <input
                                                type="checkbox"
                                                id={`topic-${topic.id}`}
                                                checked={selectedTopics.has(topic.id)}
                                                onChange={() => handleTopicChange(topic.id)}
                                            />
                                            <label htmlFor={`topic-${topic.id}`} style={{ marginLeft: '0.5rem', fontWeight: 'normal' }}>
                                                {topic.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="admin-form-actions">
                        <button type="button" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Salvando..." : (isEditMode ? "Atualizar Bloco" : "Salvar Bloco")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}