// src/pages/admin/ChunkPreviewModal.jsx
import React from 'react';
import './AdminForm.css'; // Reutilizando os estilos do modal

export default function ChunkPreviewModal({ chunk, onClose }) {
    if (!chunk) return null;

    // Prepara o JSON bruto para exibição
    const rawJson = JSON.stringify(chunk, null, 2);

    return (
        <div className="admin-modal-backdrop" onClick={onClose}>
            <div className="admin-modal-content" onClick={e => e.stopPropagation()}>

                <div className="admin-modal-header">
                    <h2>Pré-visualização (Chunk ID: {chunk.id})</h2>
                    <button onClick={onClose} className="admin-modal-close">&times;</button>
                </div>

                {/* Usamos 'admin-form' para o padding, mas mudamos o layout */}
                <div className="admin-form" style={{ maxHeight: '75vh', overflowY: 'auto', padding: '1rem 2rem' }}>

                    {/* --- 1. A PRÉ-VISUALIZAÇÃO --- */}

                    {chunk.question && (
                        <div className="form-group">
                            <label>Pergunta:</label>
                            {/* white-space: pre-wrap preserva as quebras de linha */}
                            <p style={{ whiteSpace: 'pre-wrap', fontSize: '1.1em', background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                                {chunk.question}
                            </p>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Conteúdo Principal:</label>
                        <div style={{
                            whiteSpace: 'pre-wrap',
                            border: '1px solid #e2e8f0',
                            padding: '12px',
                            borderRadius: '6px',
                            background: '#f8fafc',
                            maxHeight: '250px',
                            overflowY: 'auto'
                        }}>
                            {chunk.content || "(Conteúdo vazio)"}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Tópicos:</label>
                        <p>{chunk.topics && chunk.topics.length > 0 ? chunk.topics.map(t => t.name).join(', ') : 'Nenhum'}</p>
                    </div>

                    <hr style={{ margin: '2rem 0' }} />

                    {/* --- 2. O "BOTÃO DE JSON" (Visualizador JSON) --- */}

                    <div className="form-group">
                        <label>Dados JSON Brutos:</label>
                        <pre style={{
                            background: '#1e293b',
                            color: '#e2e8f0',
                            padding: '12px',
                            borderRadius: '6px',
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }}>
              <code>{rawJson}</code>
            </pre>
                    </div>
                </div>

                <div className="admin-modal-footer">
                    <button type="button" className="admin-button secondary" onClick={onClose}>
                        Fechar
                    </button>
                </div>

            </div>
        </div>
    );
}