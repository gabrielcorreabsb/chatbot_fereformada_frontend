// src/pages/admin/SynonymManagement.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../AuthContext';
import { apiClient } from '../../apiClient';
import { jwtDecode } from 'jwt-decode';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function SynonymManagement() {
    const [synonyms, setSynonyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estado para o formulário de "Adicionar Novo"
    const [newTerm, setNewTerm] = useState("");
    const [newSynonym, setNewSynonym] = useState("");

    const { session } = useAuth();
    const decodedToken = session ? jwtDecode(session.access_token) : null;
    const userRoles = decodedToken?.roles || [];
    const isAdmin = userRoles.includes('ADMIN');

    // Função para buscar os dados da API
    const fetchData = useCallback(async () => {
        if (!session) return;
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/admin/synonyms', {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            setSynonyms(response.data || []);
        } catch (err) {
            console.error("Falha ao buscar sinônimos:", err);
            setError("Não foi possível carregar os sinônimos.");
        } finally {
            setLoading(false);
        }
    }, [session]);

    // Buscar dados no carregamento inicial
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handler para submeter o novo formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newTerm || !newSynonym) {
            setError("Ambos os campos são obrigatórios.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const dto = {
            mainTerm: newTerm.trim(),
            synonym: newSynonym.trim()
        };

        try {
            await apiClient.post('/admin/synonyms', dto, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            setNewTerm("");   // Limpa o formulário
            setNewSynonym(""); // Limpa o formulário
            fetchData();      // Recarrega a lista
        } catch (err) {
            console.error("Falha ao criar sinônimo:", err);
            setError(err.response?.data?.message || "Erro ao salvar.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handler para deletar um sinônimo
    const handleDelete = async (synonymId) => {
        if (!window.confirm("Tem certeza que deseja deletar este par de sinônimos?")) {
            return;
        }

        setError(null);
        setLoading(true); // Reutiliza o loading principal

        try {
            await apiClient.delete(`/admin/synonyms/${synonymId}`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            fetchData(); // Recarrega a lista
        } catch (err) {
            console.error("Falha ao deletar sinônimo:", err);
            alert(err.response?.data?.message || "Erro ao deletar.");
            setLoading(false);
        }
    };

    // Agrupa os sinônimos pelo 'mainTerm' para melhor visualização
    const groupedSynonyms = useMemo(() => {
        return synonyms.reduce((acc, current) => {
            (acc[current.mainTerm] = acc[current.mainTerm] || []).push(current);
            return acc;
        }, {});
    }, [synonyms]);


    if (loading && synonyms.length === 0) return <LoadingSpinner />;

    return (
        <div className="content-box">
            <h1>Gerenciar Sinônimos Teológicos</h1>
            <p>
                Esta lista alimenta a expansão de busca do RAG.
                (Ex: Adicionar "salvação" &rarr; "redenção" fará com que uma busca por "salvação"
                também procure por "redenção").
            </p>

            {isAdmin && (
                <form onSubmit={handleSubmit} className="filter-bar" style={{ marginBottom: '1.5rem' }}>
                    <div className="form-group">
                        <label htmlFor="mainTerm">Termo Principal</label>
                        <input
                            type="text"
                            id="mainTerm"
                            value={newTerm}
                            onChange={(e) => setNewTerm(e.target.value)}
                            placeholder="Ex: salvação"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="synonym">Sinônimo</label>
                        <input
                            type="text"
                            id="synonym"
                            value={newSynonym}
                            onChange={(e) => setNewSynonym(e.target.value)}
                            placeholder="Ex: redenção"
                            disabled={isSubmitting}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? "Adicionando..." : "+ Adicionar Sinônimo"}
                    </button>
                </form>
            )}

            {error && <div className="message-box error" style={{ marginBottom: '1rem' }}>{error}</div>}

            {loading && <LoadingSpinner />}

            <table className="admin-table">
                <thead>
                <tr>
                    <th>Termo Principal</th>
                    <th>Sinônimo Associado</th>
                    {isAdmin && <th>Ações</th>}
                </tr>
                </thead>
                <tbody>
                {synonyms.length === 0 ? (
                    <tr>
                        <td colSpan={isAdmin ? 3 : 2}>Nenhum sinônimo cadastrado.</td>
                    </tr>
                ) : (
                    // Itera sobre os grupos
                    Object.entries(groupedSynonyms).map(([mainTerm, items]) => (
                        // Itera sobre os sinônimos dentro de cada grupo
                        items.map((item, index) => (
                            <tr key={item.id}>
                                {/* Mostra o Termo Principal apenas na primeira linha do grupo */}
                                {index === 0 ? (
                                    <td data-label="Termo Principal" rowSpan={items.length}>
                                        <strong>{item.mainTerm}</strong>
                                    </td>
                                ) : null}

                                <td data-label="Sinônimo">{item.synonym}</td>

                                {isAdmin && (
                                    <td data-label="Ações" className="table-actions">
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="btn btn-danger btn-sm"
                                            disabled={loading}
                                        >
                                            Deletar
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
}