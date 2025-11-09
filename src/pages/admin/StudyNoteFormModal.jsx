// src/pages/admin/StudyNoteFormModal.jsx
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../apiClient';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function StudyNoteFormModal({ session, noteId, onSave, onClose, onLoading }) {

    const [formData, setFormData] = useState({
        book: '',
        startChapter: 1,
        startVerse: 1,
        endChapter: '',
        endVerse: '',
        noteContent: '',
        source: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const isEditMode = noteId != null;

    // Se for modo de edição, busca os dados da nota
    useEffect(() => {
        if (isEditMode) {
            const fetchNote = async () => {
                onLoading(true);
                try {
                    // Usamos o endpoint de projeção (seguro)
                    const response = await apiClient.get(`/admin/studynotes/${noteId}`, {
                        headers: { Authorization: `Bearer ${session.access_token}` }
                    });
                    const note = response.data;
                    setFormData({
                        book: note.book || '',
                        startChapter: note.startChapter || 1,
                        startVerse: note.startVerse || 1,
                        endChapter: note.endChapter || '',
                        endVerse: note.endVerse || '',
                        noteContent: note.noteContent || '',
                        source: note.source || ''
                    });
                } catch (err) {
                    setError("Não foi possível carregar os dados da nota.");
                } finally {
                    onLoading(false);
                }
            };
            fetchNote();
        }
    }, [isEditMode, noteId, session, onLoading]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Monta o DTO para o backend
        const dto = {
            ...formData,
            startChapter: parseInt(formData.startChapter, 10),
            startVerse: parseInt(formData.startVerse, 10),
            // Envia nulo se os campos estiverem vazios
            endChapter: formData.endChapter ? parseInt(formData.endChapter, 10) : null,
            endVerse: formData.endVerse ? parseInt(formData.endVerse, 10) : null,
        };

        try {
            if (isEditMode) {
                await apiClient.put(`/admin/studynotes/${noteId}`, dto, {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
            } else {
                await apiClient.post('/admin/studynotes', dto, {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
            }
            onSave(); // Sucesso!

        } catch (err) {
            console.error("Falha ao salvar nota:", err);
            setError(err.response?.data?.message || "Erro ao salvar.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <div className="modal-header">
                        <h2>{isEditMode ? "Editar Nota de Estudo" : "Adicionar Nova Nota"}</h2>
                        <button type="button" onClick={onClose} className="close-btn">&times;</button>
                    </div>

                    <div className="modal-body">
                        {error && <div className="message-box error">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="book">Livro</label>
                            <input type="text" id="book" name="book" value={formData.book} onChange={handleChange} required />
                        </div>

                        {/* Wrapper para referência */}
                        <div className="flex gap-3">
                            <div className="form-group" style={{flex: 2}}>
                                <label htmlFor="startChapter">Cap. Início</label>
                                <input type="number" id="startChapter" name="startChapter" value={formData.startChapter} onChange={handleChange} required />
                            </div>
                            <div className="form-group" style={{flex: 1}}>
                                <label htmlFor="startVerse">Ver. Início</label>
                                <input type="number" id="startVerse" name="startVerse" value={formData.startVerse} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="form-group" style={{flex: 2}}>
                                <label htmlFor="endChapter">Cap. Fim (opc)</label>
                                <input type="number" id="endChapter" name="endChapter" value={formData.endChapter} onChange={handleChange} placeholder={formData.startChapter} />
                            </div>
                            <div className="form-group" style={{flex: 1}}>
                                <label htmlFor="endVerse">Ver. Fim (opc)</label>
                                <input type="number" id="endVerse" name="endVerse" value={formData.endVerse} onChange={handleChange} placeholder={formData.startVerse} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="noteContent">Conteúdo da Nota</label>
                            <textarea id="noteContent" name="noteContent" rows="6" value={formData.noteContent} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="source">Fonte (ex: "Bíblia de Estudo de Genebra")</label>
                            <input type="text" id="source" name="source" value={formData.source} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? "Salvando..." : (isEditMode ? "Atualizar Nota" : "Salvar Nota")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}