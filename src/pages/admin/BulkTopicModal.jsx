// src/pages/admin/BulkTopicModal.jsx
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../apiClient';
import { useAuth } from '../../AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function BulkTopicModal({ session, selectedChunkIds, onSave, onClose }) {
    const [allTopics, setAllTopics] = useState([]);
    const [selectedTopicIds, setSelectedTopicIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                // Busca todos os tópicos (assumindo que não são milhares)
                const response = await apiClient.get('/admin/topics?size=500', {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
                setAllTopics(response.data.content || []);
            } catch (err) {
                setError("Não foi possível carregar a lista de tópicos.");
            } finally {
                setLoading(false);
            }
        };
        fetchTopics();
    }, [session]);

    const handleTopicSelect = (topicId) => {
        const newSelection = new Set(selectedTopicIds);
        if (newSelection.has(topicId)) {
            newSelection.delete(topicId);
        } else {
            newSelection.add(topicId);
        }
        setSelectedTopicIds(newSelection);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        const dto = {
            chunkIds: selectedChunkIds,
            topicIds: Array.from(selectedTopicIds)
        };
        try {
            // (Isso chamará o endpoint do backend que ainda vamos criar)
            await apiClient.post('/admin/chunks/bulk-add-topics', dto, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            onSave();
        } catch (err) {
            console.error("Falha ao adicionar tópicos em massa:", err);
            setError(err.response?.data?.message || "Erro ao salvar.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <div className="modal-header">
                        <h2>Adicionar Tópicos em Massa</h2>
                        <button type="button" onClick={onClose} className="close-btn">&times;</button>
                    </div>

                    <div className="modal-body bulk-topic-body">
                        {error && <div className="message-box error">{error}</div>}
                        <p>Selecione os tópicos para adicionar aos <strong>{selectedChunkIds.length} chunks</strong> selecionados.</p>

                        {loading ? <LoadingSpinner /> : (
                            <div className="topic-checkbox-list form-group">
                                {allTopics.length > 0 ? allTopics.map(topic => (
                                    <div key={topic.id} className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            id={`topic-${topic.id}`}
                                            checked={selectedTopicIds.has(topic.id)}
                                            onChange={() => handleTopicSelect(topic.id)}
                                        />
                                        <label htmlFor={`topic-${topic.id}`}>{topic.name}</label>
                                    </div>
                                )) : <p>Nenhum tópico encontrado.</p>}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting || loading}>
                            {isSubmitting ? "Salvando..." : "Salvar Tópicos"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}