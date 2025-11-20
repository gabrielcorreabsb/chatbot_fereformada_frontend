import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../AuthContext';

const API_URL = 'http://localhost:8080/api/v1/leitor';

export default function BibleReaderPage() {
    const { book, chapter, verse } = useParams(); // 'verse' é o alvo do scroll
    const { session } = useAuth();

    const [verses, setVerses] = useState([]);
    const [loading, setLoading] = useState(true);
    const verseRefs = useRef({});

    useEffect(() => {
        const fetchChapter = async () => {
            if (!session) return;
            setLoading(true);
            try {
                // URL Encode para lidar com espaços em "1 Joao", etc.
                const response = await axios.get(`${API_URL}/biblia/${book}/${chapter}`, {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });
                setVerses(response.data);
            } catch (error) {
                console.error("Erro ao carregar bíblia:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChapter();
    }, [book, chapter, session]);

    useEffect(() => {
        if (!loading && verse && verseRefs.current[verse]) {
            setTimeout(() => {
                verseRefs.current[verse].scrollIntoView({ behavior: 'smooth', block: 'center' });
                verseRefs.current[verse].classList.add('highlight-active');
            }, 300);
        }
    }, [loading, verse]);

    return (
        <div className="ReaderPage" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <header style={{ marginBottom: '20px', borderBottom: '2px solid #ffe0b2', paddingBottom: '10px' }}>
                <Link to="/" style={{ textDecoration: 'none', color: '#666', fontWeight: 'bold' }}>
                    &larr; Voltar ao Chat
                </Link>
                <h1 style={{ color: '#e67e22', marginTop: '10px' }}>
                    📖 {book} {chapter}
                </h1>
            </header>

            {loading ? <LoadingSpinner /> : (
                <div className="bible-content">
                    {verses.length === 0 ? (
                        <p>Texto não encontrado.</p>
                    ) : (
                        verses.map((note) => (
                            <div
                                key={note.id}
                                ref={el => verseRefs.current[note.startVerse] = el}
                                className={`verse-block ${note.startVerse == verse ? 'highlight-active' : ''}`}
                                style={{ marginBottom: '10px', padding: '10px', borderRadius: '6px', transition: 'background 0.5s' }}
                            >
                                <span style={{ fontWeight: 'bold', color: '#e67e22', marginRight: '10px' }}>
                                    {note.startVerse}
                                </span>
                                <span style={{ color: '#444' }}>{note.noteContent}</span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}