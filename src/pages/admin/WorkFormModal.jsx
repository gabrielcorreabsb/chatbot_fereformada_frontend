// src/pages/admin/WorkFormModal.jsx
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../apiClient';
// import './AdminForm.css'; // <-- 1. REMOVIDO!

export default function WorkFormModal({ session, authors, workToEdit, onSave, onClose }) {
    // (Lógica de estado e 'isEditMode'... sem mudanças)
    const [formData, setFormData] = useState({
        title: '',
        acronym: '',
        type: 'CONFISSAO',
        publicationYear: new Date().getFullYear(),
        authorId: authors.length > 0 ? authors[0].id : '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const isEditMode = workToEdit != null;

    // (useEffect... sem mudanças)
    useEffect(() => {
        if (isEditMode) {
            setFormData({
                title: workToEdit.title || '',
                acronym: workToEdit.acronym || '',
                type: workToEdit.type || 'CONFISSAO',
                publicationYear: workToEdit.publicationYear || 2000,
                authorId: workToEdit.author?.id || (authors.length > 0 ? authors[0].id : ''),
            });
        }
    }, [workToEdit, isEditMode, authors]);

    // (handleChange... sem mudanças)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // (handleSubmit... sem mudanças)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        const dto = {
            ...formData,
            publicationYear: parseInt(formData.publicationYear, 10),
            authorId: parseInt(formData.authorId, 10),
        };
        try {
            if (isEditMode) {
                await apiClient.put(`/admin/works/${workToEdit.id}`, dto, {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
            } else {
                await apiClient.post('/admin/works', dto, {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
            }
            onSave();
        } catch (err) {
            console.error("Falha ao salvar obra:", err);
            if (err.response) {
                if (err.response.status === 409) setError(err.response.data.message || "Este item já existe.");
                else setError(err.response.data.message || "Erro desconhecido ao salvar.");
            } else {
                setError("Não foi possível conectar ao servidor. Tente novamente.");
            }
            setIsSubmitting(false);
        }
    };

    return (
        // --- 2. CLASSES ATUALIZADAS ---
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <div className="modal-header">
                        <h2>{isEditMode ? "Editar Obra" : "Adicionar Nova Obra"}</h2>
                        <button type="button" onClick={onClose} className="close-btn">&times;</button>
                    </div>

                    <div className="modal-body">
                        {error && <div className="message-box error">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="title">Título</label>
                            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="acronym">Acrônimo (ex: CM, CFW)</label>
                            <input type="text" id="acronym" name="acronym" value={formData.acronym} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="type">Tipo</label>
                            <select id="type" name="type" value={formData.type} onChange={handleChange}>
                                <option value="CONFISSAO">Confissão</option>
                                <option value="CATECISMO">Catecismo</option>
                                <option value="LIVRO">Livro</option>
                                <option value="COMENTARIO">Comentário</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="publicationYear">Ano de Publicação</label>
                            <input type="number" id="publicationYear" name="publicationYear" value={formData.publicationYear} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="authorId">Autor</label>
                            <select id="authorId" name="authorId" value={formData.authorId} onChange={handleChange} required>
                                {authors.length === 0 && <option value="">(Primeiro, crie um autor)</option>}
                                {authors.map(author => (
                                    <option key={author.id} value={author.id}>{author.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? "Salvando..." : (isEditMode ? "Atualizar Obra" : "Salvar Obra")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}