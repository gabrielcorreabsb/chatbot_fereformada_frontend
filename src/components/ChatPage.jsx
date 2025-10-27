// src/ChatPage.jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// O URL da sua API Spring Boot
const API_URL = 'http://localhost:8080/api/v1/chat';

export default function ChatPage({ session }) {
    const [conversations, setConversations] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messageListRef = useRef(null); // Para rolar para o final

    // Pega o token de acesso da sessão
    const accessToken = session.access_token;

    // Função para criar o 'header' de autorização
    const getAuthHeaders = () => ({
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    // 1. Carregar a lista de conversas (sidebar) ao iniciar
    const fetchConversations = async () => {
        try {
            const response = await axios.get(API_URL, getAuthHeaders());
            setConversations(response.data);
        } catch (error) {
            console.error('Erro ao buscar conversas:', error);
        }
    };

    // 2. Carregar mensagens de uma conversa específica
    const fetchMessages = async (chatId) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${API_URL}/${chatId}`, getAuthHeaders());
            setMessages(response.data);
            setCurrentChatId(chatId);
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Enviar uma nova mensagem
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        setIsLoading(true);
        const question = userInput;
        const currentChatIdForRequest = currentChatId;

        // Adiciona a pergunta do usuário à UI imediatamente
        setMessages(prev => [...prev, { role: 'user', content: question }]);
        setUserInput(''); // Limpa o input

        try {
            // 3.A. Envia a pergunta para o back-end
            const response = await axios.post(API_URL,
                { question: question, chatId: currentChatIdForRequest }, // O corpo (body)
                getAuthHeaders() // O header de autorização
            );

            // 3.B. A API salvou a pergunta e a resposta. Adiciona a resposta da IA.
            const newChatId = response.data.chatId;
            const aiAnswer = response.data.answer;

            setMessages(prev => [...prev, { role: 'assistant', content: aiAnswer }]);
            setCurrentChatId(newChatId); // Define o ID do chat

            // 3.C. Se for um chat novo, recarrega a sidebar
            if (!currentChatIdForRequest) {
                fetchConversations();
            }

        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao conectar. Tente novamente.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Efeito que roda uma vez: carregar as conversas
    useEffect(() => {
        fetchConversations();
    }, []);

    // Efeito para rolar para o final quando as mensagens mudarem
    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages]);


    return (
        <div className="ChatPage">
            {/* --- BARRA LATERAL --- */}
            <aside className="Sidebar">
                <button className="NewChatBtn" onClick={() => {
                    setCurrentChatId(null);
                    setMessages([]);
                }}>
                    + Novo Chat
                </button>
                {conversations.map(convo => (
                    <div
                        key={convo.id}
                        className={`ConvoItem ${convo.id === currentChatId ? 'active' : ''}`}
                        onClick={() => fetchMessages(convo.id)}
                    >
                        {convo.title}
                    </div>
                ))}
            </aside>

            {/* --- JANELA DO CHAT --- */}
            <main className="ChatWindow">
                <div className="MessageList" ref={messageListRef}>
                    {messages.map((msg, index) => (
                        <div key={index} className={`Message ${msg.role}`}>
                            {/* Usar <pre> preserva quebras de linha na resposta da IA */}
                            <pre>{msg.content}</pre>
                        </div>
                    ))}
                    {isLoading && <div className="Message assistant"><pre>Pensando...</pre></div>}
                </div>
                <form className="ChatForm" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Digite sua pergunta..."
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading}>Enviar</button>
                </form>
            </main>
        </div>
    );
}