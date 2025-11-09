import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { apiClient } from '../../apiClient';
import TaskProgress from './TaskProgress';

export default function ImportPage() {
    const { session } = useAuth();

    // (Estados... sem mudanças)
    const [works, setWorks] = useState([]);
    const [selectedWorkId, setSelectedWorkId] = useState('');
    const [file, setFile] = useState(null);
    const [stagedChunks, setStagedChunks] = useState([]);
    const [currentTaskId, setCurrentTaskId] = useState(null);
    const [taskStatus, setTaskStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);

    // (useEffect de buscar obras... sem mudanças)
    useEffect(() => {
        if (!session?.access_token) return;
        const fetchWorks = async () => {
            try {
                const response = await apiClient.get('/admin/works', {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
                setWorks(response.data?.content || []);
            } catch (err) {
                console.error("Erro ao buscar obras:", err);
                setError("Não foi possível carregar a lista de Obras.");
            }
        };
        fetchWorks();
    }, [session]);

    // (handleFileChange... sem mudanças)
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        if (!selectedWorkId) {
            setError("Por favor, selecione uma Obra primeiro.");
            e.target.value = null;
            return;
        }
        setFile(selectedFile);
        setError(null);
        setMessage('Arquivo selecionado. Processando pré-carregamento...');
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const fileContent = event.target.result;
                const rawData = JSON.parse(fileContent);
                if (!Array.isArray(rawData)) {
                    throw new Error("O JSON não é um array (lista).");
                }
                const selectedWork = works.find(w => w.id === parseInt(selectedWorkId, 10));
                const workAcronym = selectedWork.acronym;
                const transformedData = rawData
                    .filter(item => item.content && item.content.trim() !== "")
                    .map(item => ({
                        workAcronym: workAcronym,
                        topics: [],
                        chapterTitle: item.chapter_title || null,
                        chapterNumber: item.chapter_number || null,
                        sectionTitle: item.section_title || null,
                        sectionNumber: item.section_number || null,
                        subsectionTitle: item.subsection_title || null,
                        subSubsectionTitle: item.sub_subsection_title || null,
                        question: item.question || null,
                        content: item.content || "",
                    }));
                setStagedChunks(transformedData);
                setMessage(`Pré-carregamento concluído: ${transformedData.length} chunks prontos para revisão.`);
            } catch (err) {
                console.error("Erro ao ler ou processar o JSON:", err);
                setError(`Erro ao processar o arquivo: ${err.message}`);
                setStagedChunks([]);
            }
        };
        reader.readAsText(selectedFile);
    };

    // (handleSaveToDatabase... sem mudanças)
    const handleSaveToDatabase = async () => {
        if (stagedChunks.length === 0) {
            setError("Não há chunks para salvar.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setMessage(`Iniciando a importação de ${stagedChunks.length} chunks...`);
        try {
            const response = await apiClient.post(
                '/admin/chunks/bulk-import',
                stagedChunks,
                { headers: { 'Authorization': `Bearer ${session.access_token}` } }
            );
            setTaskStatus(response.data);
            setCurrentTaskId(response.data.id);
            setStagedChunks([]);
            setFile(null);
            setMessage('');
        } catch (err) {
            console.error("Erro ao iniciar a importação:", err);
            const apiError = err.response?.data?.message || err.message;
            setError(`Erro ao iniciar: ${apiError}`);
        } finally {
            setIsLoading(false);
        }
    };

    // (useEffect de polling... sem mudanças)
    useEffect(() => {
        if (!currentTaskId) return;
        const fetchTaskStatus = async () => {
            try {
                const response = await apiClient.get(
                    `/admin/import-tasks/${currentTaskId}`,
                    { headers: { Authorization: `Bearer ${session.access_token}` } }
                );
                const task = response.data;
                setTaskStatus(task);
                if (task.status === 'COMPLETED' || task.status === 'FAILED') {
                    clearInterval(intervalId);
                }
            } catch (err) {
                console.error("Erro ao buscar status da tarefa:", err);
                setError("Falha ao monitorar a importação.");
                clearInterval(intervalId);
            }
        };
        fetchTaskStatus();
        const intervalId = setInterval(fetchTaskStatus, 3000);
        return () => clearInterval(intervalId);
    }, [currentTaskId, session]);

    // (handleReset... sem mudanças)
    const handleReset = () => {
        setCurrentTaskId(null);
        setTaskStatus(null);
        setSelectedWorkId('');
        setError(null);
        setMessage('');
    };

    // MODO 2: Monitoramento
    if (currentTaskId) {
        return (
            <TaskProgress
                taskStatus={taskStatus}
                onReset={handleReset}
            />
        );
    }

    // MODO 1: Configuração (COM CLASSES ATUALIZADAS)
    return (
        // 2. CLASSE ATUALIZADA
        <div className="content-box">
            <h2>Importador de Obras (JSON em Massa)</h2>
            <p>
                Carregue um arquivo JSON (Padrão 1 - Chunks) para uma Obra específica.
            </p>

            <div className="form-group">
                <label htmlFor="workSelect">1. Selecione a Obra de Destino:</label>
                <select
                    id="workSelect"
                    value={selectedWorkId}
                    onChange={e => setSelectedWorkId(e.target.value)}
                    disabled={isLoading || stagedChunks.length > 0}
                >
                    <option value="">-- Escolha uma Obra --</option>
                    {works.map(work => (
                        <option key={work.id} value={work.id}>
                            {work.title} (Sigla: {work.acronym})
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="jsonFile">2. Selecione o Arquivo JSON:</label>
                <input
                    id="jsonFile"
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    disabled={!selectedWorkId || isLoading || stagedChunks.length > 0}
                    key={file ? file.name : 'file-input'}
                />
            </div>

            {/* 3. CLASSES DE MENSAGEM ATUALIZADAS */}
            {message && <div className="message-box success">{message}</div>}
            {error && <div className="message-box error">{error}</div>}

            {stagedChunks.length > 0 && (
                // 4. CLASSE ATUALIZADA
                <div className="preview-container" style={{ marginTop: '2rem' }}>
                    <h3>Revisão de Pré-carregamento</h3>
                    <p>Os dados abaixo estão prontos para serem enviados para a obra: **{works.find(w => w.id === parseInt(selectedWorkId, 10))?.title}**</p>

                    <table className="admin-table">
                        {/* (Tabela... sem mudanças) */}
                        <thead>
                        <tr>
                            <th>Cap/Perg Nº</th>
                            <th>Conteúdo (Início)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {stagedChunks.map((chunk, index) => (
                            <tr key={index}>
                                <td>
                                    {chunk.chapterNumber && `Cap ${chunk.chapterNumber}`}
                                    {chunk.sectionNumber && ` / Sec ${chunk.sectionNumber}`}
                                    {!chunk.chapterNumber && chunk.sectionNumber && `Perg. ${chunk.sectionNumber}`}
                                </td>
                                <td>
                                    <strong>{chunk.question ? chunk.question.substring(0, 50) + '...' : ''}</strong>
                                    {!chunk.question && chunk.content ? chunk.content.substring(0, 50) + '...' : ''}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                        {/* 5. CLASSES DE BOTÃO ATUALIZADAS */}
                        <button
                            onClick={handleSaveToDatabase}
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Iniciando...' : `Confirmar e Iniciar Importação de ${stagedChunks.length} Chunks`}
                        </button>
                        <button
                            onClick={() => { setStagedChunks([]); setFile(null); setError(null); setMessage(''); }}
                            className="btn btn-secondary"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}