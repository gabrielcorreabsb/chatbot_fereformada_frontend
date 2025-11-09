// src/pages/admin/TopicFormModal.jsx
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../apiClient';
// import './AdminForm.css'; // <-- 1. REMOVIDO!

export default function TopicFormModal({ session, topicToEdit, onSave, onClose }) {
    // (Lógica de estado e 'isEditMode'... sem mudanças)
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const isEditMode = topicToEdit != null;

    // (useEffect... sem mudanças)
    useEffect(() => {
        if (isEditMode) {
            setFormData({
                name: topicToEdit.name || '',
                description: topicToEdit.description || '',
            });
        }
    }, [topicToEdit, isEditMode]);

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
        const dto = formData;
        try {
            if (isEditMode) {
                await apiClient.put(`/admin/topics/${topicToEdit.id}`, dto, {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
            } else {
                await apiClient.post('/admin/topics', dto, {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
            }
            onSave();
        } catch (err) {
            console.error("Falha ao salvar tópico:", err);
            setError(err.response?.data?.message || "Erro ao salvar.");
            setIsSubmitting(false);
        }
    };

    return (
        // --- 2. CLASSES ATUALIZADAS ---
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <div className="modal-header">
                        <h2>{isEditMode ? "Editar Tópico" : "Adicionar Novo Tópico"}</h2>
                        <button type="button" onClick={onClose} className="close-btn">&times;</button>
                    </div>

                    <div className="modal-body">
                        {error && <div className="message-box error">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="name">Nome do Tópico</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Descrição</label>
                            {/* 3. 'style' REMOVIDO */}
                            <textarea id="description" name="description" rows="4" value={formData.description} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? "Salvando..." : (isEditMode ? "Atualizar Tópico" : "Salvar Tópico")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}