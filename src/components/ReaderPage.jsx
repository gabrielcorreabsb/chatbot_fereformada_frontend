import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
// Se não tiver o componente LoadingSpinner, pode remover e usar <p>Carregando...</p>
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../AuthContext'; // Importar sessão para pegar o token

const API_URL = 'http://localhost:8080/api/v1/leitor';

export default function ReaderPage() {
    const { workSlug, chapter } = useParams();
    const [searchParams] = useSearchParams();
    const targetSection = searchParams.get('section');
    const { session } = useAuth();

    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const sectionRefs = useRef({}); // Referências para scroll

    useEffect(() => {
        const fetchContent = async () => {
            if (!session) return;
            setLoading(true);
            try {
                // Importante: Passar o Token no Header
                const response = await axios.get(`${API_URL}/obras/${workSlug}/${chapter}`, {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });
                setContent(response.data);
            } catch (error) {
                console.error("Erro ao carregar capítulo:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [workSlug, chapter, session]);

    // Lógica de Scroll e Highlight
    useEffect(() => {
        if (!loading && targetSection && sectionRefs.current[targetSection]) {
            setTimeout(() => {
                sectionRefs.current[targetSection].scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Adiciona classe CSS para piscar
                sectionRefs.current[targetSection].classList.add('highlight-section');
            }, 300); // Delay um pouco maior para garantir renderização
        }
    }, [loading, targetSection]);

    return (
        <div className="ReaderPage" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <header style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <Link to="/" style={{ textDecoration: 'none', color: '#666', fontWeight: 'bold' }}>
                    &larr; Voltar ao Chat
                </Link>
                <h1 style={{ textTransform: 'uppercase', color: '#2c3e50', marginTop: '10px' }}>
                    {workSlug} - Cap. {chapter}
                </h1>
            </header>

            {loading ? <LoadingSpinner /> : (
                <div className="document-content">
                    {content.length === 0 ? (
                        <p>Conteúdo não encontrado ou capítulo inexistente.</p>
                    ) : (
                        content.map((chunk) => (
                            <div
                                key={chunk.id}
                                ref={el => sectionRefs.current[chunk.sectionNumber] = el}
                                id={`sec-${chunk.sectionNumber}`}
                                className={`chunk-block ${chunk.sectionNumber == targetSection ? 'highlight-active' : ''}`}
                                style={{ marginBottom: '15px', padding: '15px', borderRadius: '8px', transition: 'background 0.5s' }}
                            >
                                <strong style={{ color: '#888', marginRight: '8px' }}>
                                    §{chunk.sectionNumber}
                                </strong>
                                <span style={{ lineHeight: '1.6', color: '#333' }}>
                                    {chunk.content}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}