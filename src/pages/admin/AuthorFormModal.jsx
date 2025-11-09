// src/pages/admin/AuthorFormModal.jsx
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../apiClient';
// import './AdminForm.css'; // <-- 1. REMOVIDO!

export default function AuthorFormModal({ session, authorToEdit, onSave, onClose }) {
    // (Lógica de estado e 'isEditMode'... sem mudanças)
    const [formData, setFormData] = useState({
        name: '',
        biography: '',
        era: 'Reforma',
        birthDate: '',
        deathDate: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const isEditMode = authorToEdit != null;

    // (useEffect... sem mudanças)
    useEffect(() => {
        if (isEditMode) {
            setFormData({
                name: authorToEdit.name || '',
                biography: authorToEdit.biography || '',
                era: authorToEdit.era || 'Reforma',
                birthDate: authorToEdit.birthDate || '',
                deathDate: authorToEdit.deathDate || '',
            });
        }
    }, [authorToEdit, isEditMode]);

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
            birthDate: formData.birthDate || null,
            deathDate: formData.deathDate || null,
        };
        try {
            if (isEditMode) {
                await apiClient.put(`/admin/authors/${authorToEdit.id}`, dto, {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
            } else {
                await apiClient.post('/admin/authors', dto, {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
            }
            onSave();
        } catch (err) {
            console.error("Falha ao salvar autor:", err);
            setError(err.response?.data?.message || "Erro ao salvar. Verifique o console.");
            setIsSubmitting(false);
        }
    };

    return (
        // --- 2. CLASSES ATUALIZADAS ---
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <div className="modal-header">
                        <h2>{isEditMode ? "Editar Autor" : "Adicionar Novo Autor"}</h2>
                        <button type="button" onClick={onClose} className="close-btn">&times;</button>
                    </div>

                    <div className="modal-body">
                        {error && <div className="message-box error">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="name">Nome</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="era">Era (ex: Reforma, Puritanos)</label>
                            <input type="text" id="era" name="era" value={formData.era} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="birthDate">Data de Nascimento (AAAA-MM-DD)</label>
                            <input type="date" id="birthDate" name="birthDate" value={formData.birthDate} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="deathDate">Data de Falecimento (AAAA-MM-DD)</label>
                            <input type="date" id="deathDate" name="deathDate" value={formData.deathDate} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="biography">Biografia</label>
                            {/* 3. 'style' REMOVIDO */}
                            <textarea id="biography" name="biography" rows="4" value={formData.biography} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? "Salvando..." : (isEditMode ? "Atualizar Autor" : "Salvar Autor")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}