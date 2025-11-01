// src/pages/admin/AuthorFormModal.jsx
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../apiClient';
import './AdminForm.css'; // Reutiliza o mesmo CSS

export default function AuthorFormModal({ session, authorToEdit, onSave, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        biography: '',
        era: 'Reforma', // Valor padrão
        birthDate: '',
        deathDate: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const isEditMode = authorToEdit != null;

    // Se for modo de edição, preenche o formulário
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // O DTO para enviar (garante que datas vazias sejam nulas)
        const dto = {
            ...formData,
            birthDate: formData.birthDate || null,
            deathDate: formData.deathDate || null,
        };

        try {
            if (isEditMode) {
                // API de Atualização (PUT)
                await apiClient.put(`/admin/authors/${authorToEdit.id}`, dto, {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
            } else {
                // API de Criação (POST)
                await apiClient.post('/admin/authors', dto, {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
            }
            onSave(); // Avisa o pai para recarregar e fechar

        } catch (err) {
            console.error("Falha ao salvar autor:", err);
            setError(err.response?.data?.message || "Erro ao salvar. Verifique o console.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-content">
                <div className="admin-modal-header">
                    <h2>{isEditMode ? "Editar Autor" : "Adicionar Novo Autor"}</h2>
                    <button onClick={onClose} className="admin-modal-close-btn">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="admin-form">
                    {error && <div className="admin-form-error">{error}</div>}

                    <div className="admin-form-group">
                        <label htmlFor="name">Nome</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="era">Era (ex: Reforma, Puritanos)</label>
                        <input type="text" id="era" name="era" value={formData.era} onChange={handleChange} />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="birthDate">Data de Nascimento (AAAA-MM-DD)</label>
                        <input type="date" id="birthDate" name="birthDate" value={formData.birthDate} onChange={handleChange} />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="deathDate">Data de Falecimento (AAAA-MM-DD)</label>
                        <input type="date" id="deathDate" name="deathDate" value={formData.deathDate} onChange={handleChange} />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="biography">Biografia</label>
                        <textarea id="biography" name="biography" rows="4" value={formData.biography} onChange={handleChange} style={{width: '100%', padding: '8px'}} />
                    </div>

                    <div className="admin-form-actions">
                        <button type="button" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Salvando..." : (isEditMode ? "Atualizar Autor" : "Salvar Autor")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}