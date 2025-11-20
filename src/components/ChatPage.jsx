import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar.jsx'; // Importar
import ChatWindow from './ChatWindow.jsx';
import ReaderModal from "./ReaderModal.jsx"; // Importar

const API_URL = 'http://localhost:8080/api/v1/chat';

export default function ChatPage({ session }) {
    const [conversations, setConversations] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false); // NOVO: Estado do menu mobile

    const [activeReference, setActiveReference] = useState(null);

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
        if (!chatId) return;
        setIsLoading(true);
        setMessages([]);
        setCurrentChatId(chatId);
        setIsSidebarOpenMobile(false);
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
        setIsSidebarOpenMobile(false);
    };

    // --- AQUI ESTÁ A MUDANÇA PRINCIPAL ---
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        setIsLoading(true);
        const question = userInput;
        const chatIdForRequest = currentChatId;

        setMessages(prev => [...prev, { id: `temp-${Date.now()}`, role: 'user', content: question }]);
        setUserInput('');

        try {
            const response = await axios.post(API_URL,
                { question: question, chatId: chatIdForRequest },
                getAuthHeaders()
            );

            // 1. Desestruturar a resposta completa do Backend
            const { chatId, answer, references } = response.data;

            // 2. Salvar a mensagem COM as referências
            setMessages(prev => [...prev, {
                id: `temp-${Date.now()+1}`,
                role: 'assistant',
                content: answer,
                references: references // <--- O ARRAY RICO ENTRA AQUI
            }]);

            if (!chatIdForRequest) {
                setCurrentChatId(chatId);
                fetchConversations();
            }

        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            setMessages(prev => [...prev, { id: `temp-err-${Date.now()}`, role: 'assistant', content: 'Erro ao conectar. Tente novamente.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    return (
        <div className={`ChatPage ${isSidebarOpenMobile ? 'sidebar-mobile-open' : ''}`}>
            <button
                className="MobileMenuButton"
                onClick={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
            >
                ☰
            </button>

            <Sidebar
                conversations={conversations}
                currentChatId={currentChatId}
                onSelectChat={fetchMessages}
                onNewChat={handleNewChat}
            />
            <ChatWindow
                messages={messages}
                isLoading={isLoading}
                userInput={userInput}
                onInputChange={(e) => setUserInput(e.target.value)}
                onSendMessage={handleSendMessage}
                // PASSANDO A FUNÇÃO PARA ABRIR O MODAL
                onOpenReference={(ref) => setActiveReference(ref)}
            />

            {/* RENDERIZAÇÃO CONDICIONAL DO MODAL */}
            {activeReference && (
                <ReaderModal
                    reference={activeReference}
                    onClose={() => setActiveReference(null)}
                />
            )}
        </div>
    );
}