import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar.jsx'; // Importar
import ChatWindow from './ChatWindow.jsx'; // Importar

const API_URL = 'http://localhost:8080/api/v1/chat';

export default function ChatPage({ session }) {
    const [conversations, setConversations] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false); // NOVO: Estado do menu mobile

    const accessToken = session.access_token;
    const getAuthHeaders = () => ({ headers: { 'Authorization': `Bearer ${accessToken}` } });


    // --- Funções movidas/adaptadas para o ChatPage ---
    const fetchConversations = async () => {
        try {
            const response = await axios.get(API_URL, getAuthHeaders());
            setConversations(response.data);
        } catch (error) {
            console.error('Erro ao buscar conversas:', error);
            alert('Erro ao carregar histórico de conversas.'); // Feedback ao usuário
        }
    };

    const fetchMessages = async (chatId) => {
        if (!chatId) return; // Não faz nada se chatId for nulo
        setIsLoading(true); // Mostra loading na janela de chat
        setMessages([]); // Limpa mensagens antigas
        setCurrentChatId(chatId);
        setIsSidebarOpenMobile(false); // Fecha sidebar no mobile ao selecionar chat
        try {
            const response = await axios.get(`${API_URL}/${chatId}`, getAuthHeaders());
            setMessages(response.data);
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
            alert('Erro ao carregar mensagens da conversa.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        setCurrentChatId(null);
        setMessages([]);
        setIsSidebarOpenMobile(false); // Fecha sidebar no mobile
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        setIsLoading(true);
        const question = userInput;
        const chatIdForRequest = currentChatId;

        // Adiciona pergunta à UI imediatamente
        // Usamos um ID temporário para a key, será substituído quando recarregar
        setMessages(prev => [...prev, { id: `temp-${Date.now()}`, role: 'user', content: question }]);
        setUserInput('');

        try {
            const response = await axios.post(API_URL,
                { question: question, chatId: chatIdForRequest },
                getAuthHeaders()
            );

            const newChatId = response.data.chatId;
            const aiAnswer = response.data.answer;

            // Adiciona resposta da IA à UI
            setMessages(prev => [...prev, { id: `temp-${Date.now()+1}`, role: 'assistant', content: aiAnswer }]);

            // Se era um chat novo, atualiza o ID e recarrega a sidebar
            if (!chatIdForRequest) {
                setCurrentChatId(newChatId);
                fetchConversations();
            }

            // Poderíamos recarregar as mensagens aqui para ter os IDs corretos,
            // mas para performance, atualizar a UI diretamente é melhor na maioria dos casos.
            // fetchMessages(newChatId); // Opcional: recarrega tudo do backend

        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            setMessages(prev => [...prev, { id: `temp-err-${Date.now()}`, role: 'assistant', content: 'Erro ao conectar. Tente novamente.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Carrega conversas ao montar
    useEffect(() => {
        fetchConversations();
    }, []);

    return (
        // Adiciona classe condicional para o estado mobile
        <div className={`ChatPage ${isSidebarOpenMobile ? 'sidebar-mobile-open' : ''}`}>
            {/* Botão de Menu (só visível no mobile) */}
            <button
                className="MobileMenuButton"
                onClick={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
            >
                ☰ {/* Ícone de Hambúrguer */}
            </button>

            <Sidebar
                conversations={conversations}
                currentChatId={currentChatId}
                onSelectChat={fetchMessages} // Passa a função de buscar mensagens
                onNewChat={handleNewChat}   // Passa a função de novo chat
            />
            <ChatWindow
                messages={messages}
                isLoading={isLoading}
                userInput={userInput}
                onInputChange={(e) => setUserInput(e.target.value)} // Passa a função de input
                onSendMessage={handleSendMessage} // Passa a função de enviar
            />
        </div>
    );
}
