import { useEffect, useRef } from 'react';

// Componente para exibir uma única mensagem
const MessageBubble = ({ msg }) => (
    <div className={`Message ${msg.role}`}>
        {typeof msg.content === 'string' ? <pre>{msg.content}</pre> : msg.content}
    </div>
);

export default function ChatWindow({
                                       messages,
                                       isLoading,
                                       userInput,
                                       onInputChange,
                                       onSendMessage
                                   }) {
    const messageListRef = useRef(null);

    // Efeito para rolar para o final
    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages, isLoading]); // Rola quando mensagens mudam ou loading aparece

    return (
        <main className="ChatWindow">
            <div className="MessageList" ref={messageListRef}>
                {messages.map((msg, index) => (
                    <MessageBubble key={msg.id || `msg-${index}`} msg={msg} />
                ))}
                {/* Mostra "Pensando..." como uma bolha de assistente */}
                {isLoading && <MessageBubble msg={{ role: 'assistant', content: 'Pensando...' }} />}
            </div>
            <form className="ChatForm" onSubmit={onSendMessage}>
                <input
                    type="text"
                    value={userInput}
                    onChange={onInputChange}
                    placeholder="Digite sua pergunta..."
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !userInput.trim()}>Enviar</button>
            </form>
        </main>
    );
}