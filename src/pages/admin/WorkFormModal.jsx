// src/pages/admin/WorkFormModal.jsx
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../apiClient';
// import './AdminForm.css'; // <-- 1. REMOVIDO!

// <-- ADICIONADO: Constante para as opções de boost -->
const BOOST_OPTIONS = [
    { value: 0, label: "0 - Normal (Livros, Padrão)" },
    { value: 1, label: "1 - Prioritário (Institutas, Teologia)" },
    { value: 2, label: "2 - Essencial (Confissões, Catecismos)" },
    { value: 3, label: "3 - Bíblia (Notas de Estudo)" }
];

export default function WorkFormModal({ session, authors, workToEdit, onSave, onClose }) {

    const [formData, setFormData] = useState({
        title: '',
        acronym: '',
        type: 'CONFISSAO',
        publicationYear: new Date().getFullYear(),
        authorId: authors.length > 0 ? authors[0].id : '',
        boostPriority: 0 // <-- ADICIONADO: Valor padrão para 'boostPriority'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const isEditMode = workToEdit != null;

    useEffect(() => {
        if (isEditMode) {
            setFormData({
                title: workToEdit.title || '',
                acronym: workToEdit.acronym || '',
                type: workToEdit.type || 'CONFISSAO',
                publicationYear: workToEdit.publicationYear || 2000,
                authorId: workToEdit.author?.id || (authors.length > 0 ? authors[0].id : ''),
                // <-- ATUALIZADO: Carrega o boostPriority do 'workToEdit', com fallback para 0 -->
                boostPriority: workToEdit.boostPriority !== null && workToEdit.boostPriority !== undefined
                    ? workToEdit.boostPriority
                    : 0
            });
        }
    }, [workToEdit, isEditMode, authors]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // <-- ATUALIZADO: O DTO agora inclui o boostPriority, também convertido para Int -->
        const dto = {
            ...formData,
            publicationYear: parseInt(formData.publicationYear, 10),
            authorId: parseInt(formData.authorId, 10),
            boostPriority: parseInt(formData.boostPriority, 10) // <-- ADICIONADO
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
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <div className="modal-header">
                        <h2>{isEditMode ? "Editar Obra" : "Adicionar Nova Obra"}</h2>
                        <button type="button" onClick={onClose} className="close-btn">&times;</button>
                    </div>

                    <div className="modal-body">
                        {error && <div className="message-box error">{error}</div>}

                        {/* Título (sem mudança) */}
                        <div className="form-group">
                            <label htmlFor="title">Título</label>
                            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
                        </div>

                        {/* Acrônimo (sem mudança) */}
                        <div className="form-group">
                            <label htmlFor="acronym">Acrônimo (ex: CM, CFW)</label>
                            <input type="text" id="acronym" name="acronym" value={formData.acronym} onChange={handleChange} required />
                        </div>

                        {/* Tipo (sem mudança) */}
                        <div className="form-group">
                            <label htmlFor="type">Tipo</label>
                            <select id="type" name="type" value={formData.type} onChange={handleChange}>
                                <option value="CONFISSAO">Confissão</option>
                                <option value="CATECISMO">Catecismo</option>
                                <option value="LIVRO">Livro</option>
                                <option value="COMENTARIO">Comentário</option>
                                {/* Adicionei os outros tipos que vi no seu outro modal, para consistência */}
                                <option value="TEOLOGIA">Teologia Sistemática</option>
                                <option value="NOTAS_BIBLICAS">Notas Bíblicas</option>
                            </select>
                        </div>

                        {/* // ======================================================
                        // NOVO CAMPO DE BOOST ADICIONADO
                        // ======================================================
                        */}
                        <div className="form-group">
                            <label htmlFor="boostPriority">Prioridade de Boost (RAG)</label>
                            <select
                                id="boostPriority"
                                name="boostPriority"
                                value={formData.boostPriority}
                                onChange={handleChange}
                            >
                                {BOOST_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Ano (sem mudança) */}
                        <div className="form-group">
                            <label htmlFor="publicationYear">Ano de Publicação</label>
                            <input type="number" id="publicationYear" name="publicationYear" value={formData.publicationYear} onChange={handleChange} required />
                        </div>

                        {/* Autor (sem mudança) */}
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

                    {/* Footer (sem mudança) */}
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