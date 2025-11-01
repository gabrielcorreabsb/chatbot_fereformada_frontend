// src/pages/admin/TopicFormModal.jsx
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../apiClient';
import './AdminForm.css'; // Reutiliza o mesmo CSS

export default function TopicFormModal({ session, topicToEdit, onSave, onClose }) {
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const isEditMode = topicToEdit != null;

    useEffect(() => {
        if (isEditMode) {
            setFormData({
                name: topicToEdit.name || '',
                description: topicToEdit.description || '',
            });
        }
    }, [topicToEdit, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const dto = formData; // DTO é simples

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
        <div className="admin-modal-overlay">
            <div className="admin-modal-content">
                <div className="admin-modal-header">
                    <h2>{isEditMode ? "Editar Tópico" : "Adicionar Novo Tópico"}</h2>
                    <button onClick={onClose} className="admin-modal-close-btn">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="admin-form">
                    {error && <div className="admin-form-error">{error}</div>}

                    <div className="admin-form-group">
                        <label htmlFor="name">Nome do Tópico</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="description">Descrição</label>
                        <textarea id="description" name="description" rows="4" value={formData.description} onChange={handleChange} style={{width: '100%', padding: '8px', fontFamily: 'Inter, sans-serif'}} />
                    </div>

                    <div className="admin-form-actions">
                        <button type="button" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Salvando..." : (isEditMode ? "Atualizar Tópico" : "Salvar Tópico")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}