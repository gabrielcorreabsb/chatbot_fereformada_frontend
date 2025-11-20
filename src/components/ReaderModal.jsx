// src/components/ReaderModal.jsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import LoadingSpinner from './LoadingSpinner'; // Certifique-se que existe ou remova
import './ReaderModal.css';

const API_URL = 'http://localhost:8080/api/v1/leitor';

export default function ReaderModal({ reference, onClose }) {
    const { session } = useAuth();
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const itemRefs = useRef({}); // Para rolar até o item certo

    // Desestrutura os metadados salvos no banco
    const { type, metadata } = reference;

    // 1. Buscar Conteúdo
    useEffect(() => {
        const fetchData = async () => {
            if (!session || !metadata) return;
            setLoading(true);
            try {
                let url = '';
                // Define a URL baseado no tipo da fonte
                if (type === 'CHUNK') {
                    // Ex: /obras/cfw/1
                    url = `${API_URL}/obras/${metadata.workSlug}/${metadata.chapter}`;
                } else if (type === 'NOTE') {
                    // Ex: /biblia/Romanos/8
                    url = `${API_URL}/biblia/${metadata.book}/${metadata.chapter}`;
                }

                const response = await axios.get(url, {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });
                setContent(response.data);
            } catch (error) {
                console.error("Erro ao carregar modal:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [reference, session]);

    // 2. Scroll Automático (Highlight)
    useEffect(() => {
        if (!loading && content.length > 0) {
            // Se for Chunk, usa 'section'. Se for Nota, usa 'verse'.
            const targetId = type === 'CHUNK' ? metadata.section : metadata.verse;

            if (targetId && itemRefs.current[targetId]) {
                setTimeout(() => {
                    itemRefs.current[targetId].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    itemRefs.current[targetId].classList.add('highlight-modal');
                }, 300);
            }
        }
    }, [loading, content, type, metadata]);

    // Fechar com ESC
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="modal-overlay reader-overlay" onClick={onClose}>
            <div className="reader-modal-container" onClick={e => e.stopPropagation()}>
                <div className="reader-header">
                    <h3>
                        {type === 'NOTE' ? '📖 ' : '⛪ '}
                        {reference.label}
                    </h3>
                    <button onClick={onClose} className="close-reader-btn">&times;</button>
                </div>

                <div className="reader-body">
                    {loading ? <div style={{textAlign:'center', padding: 20}}>Carregando texto...</div> : (
                        <>
                            {type === 'CHUNK' ? (
                                // --- Renderização de DOCUMENTOS (Confissões, Livros) ---
                                content.map(chunk => (
                                    <div
                                        key={chunk.id}
                                        // Guarda a referência do DOM para scrollar depois
                                        ref={el => itemRefs.current[chunk.sectionNumber] = el}
                                        className={`reader-item ${chunk.sectionNumber == metadata.section ? 'highlight-modal' : ''}`}
                                    >
                                        <strong className="item-marker">§{chunk.sectionNumber}</strong>
                                        <span className="item-text">{chunk.content}</span>
                                    </div>
                                ))
                            ) : (
                                // --- Renderização de BÍBLIA ---
                                content.map(note => (
                                    <div
                                        key={note.id}
                                        ref={el => itemRefs.current[note.startVerse] = el}
                                        className={`reader-item ${note.startVerse == metadata.verse ? 'highlight-modal' : ''}`}
                                    >
                                        <strong className="item-marker verse">{note.startVerse}</strong>
                                        <span className="item-text">{note.noteContent}</span>
                                    </div>
                                ))
                            )}

                            {content.length === 0 && <p>Texto não encontrado.</p>}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}