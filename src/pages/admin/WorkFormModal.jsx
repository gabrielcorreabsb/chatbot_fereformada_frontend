// src/pages/admin/WorkFormModal.jsx
import React, { useState, useEffect } from 'react'; // Adicionado useEffect
import { apiClient } from '../../apiClient';
import './AdminForm.css';

// 1. O modal agora aceita 'workToEdit'
export default function WorkFormModal({ session, authors, workToEdit, onSave, onClose }) {
    const [formData, setFormData] = useState({
        title: '',
        acronym: '',
        type: 'CONFISSAO',
        publicationYear: new Date().getFullYear(),
        authorId: authors.length > 0 ? authors[0].id : '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // 2. Verifica se estamos no modo de edição
    const isEditMode = workToEdit != null;

    // 3. NOVO: useEffect para preencher o formulário se for modo de edição
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
    }, [workToEdit, isEditMode, authors]); // Roda se 'workToEdit' mudar

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

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
                // 4. ATUALIZAÇÃO (PUT) se estiver editando
                await apiClient.put(`/admin/works/${workToEdit.id}`, dto, {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
            } else {
                // 5. CRIAÇÃO (POST) se for novo
                await apiClient.post('/admin/works', dto, {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
            }

            onSave(); // Avisa o componente pai que salvou

        } catch (err) {
            console.error("Falha ao salvar obra:", err);
            setError(err.response?.data?.message || "Erro ao salvar. Verifique o console.");
            setIsSubmitting(false);
        }
    };

    // O resto do seu formulário JSX está quase idêntico
    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-content">
                <div className="admin-modal-header">
                    {/* 6. Título dinâmico */}
                    <h2>{isEditMode ? "Editar Obra" : "Adicionar Nova Obra"}</h2>
                    <button onClick={onClose} className="admin-modal-close-btn">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="admin-form">
                    {error && <div className="admin-form-error">{error}</div>}

                    {/* ... (todos os seus inputs: title, acronym, type, publicationYear) ... */}

                    <div className="admin-form-group">
                        <label htmlFor="title">Título</label>
                        <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div className="admin-form-group">
                        <label htmlFor="acronym">Acrônimo (ex: CM, CFW)</label>
                        <input type="text" id="acronym" name="acronym" value={formData.acronym} onChange={handleChange} required />
                    </div>
                    <div className="admin-form-group">
                        <label htmlFor="type">Tipo</label>
                        <select id="type" name="type" value={formData.type} onChange={handleChange} >
                            <option value="CONFISSAO">Confissão</option>
                            <option value="CATECISMO">Catecismo</option>
                            <option value="LIVRO">Livro</option>
                            <option value="COMENTARIO">Comentário</option>
                        </select>
                    </div>
                    <div className="admin-form-group">
                        <label htmlFor="publicationYear">Ano de Publicação</label>
                        <input type="number" id="publicationYear" name="publicationYear" value={formData.publicationYear} onChange={handleChange} required />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="authorId">Autor</label>
                        <select id="authorId" name="authorId" value={formData.authorId} onChange={handleChange} required >
                            {authors.length === 0 && (
                                <option value="">(Primeiro, crie um autor)</option>
                            )}
                            {authors.map(author => (
                                <option key={author.id} value={author.id}>
                                    {author.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-form-actions">
                        <button type="button" onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </button>
                        {/* 7. Texto do botão dinâmico */}
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Salvando..." : (isEditMode ? "Atualizar Obra" : "Salvar Obra")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}