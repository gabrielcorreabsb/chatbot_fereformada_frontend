// src/components/ChatWindow.jsx
import { useEffect, useRef } from 'react';
import './ChatWindow.css';

// 1. SourceChip agora aceita 'onClick'
const SourceChip = ({ reference, onClick }) => {
    const { type, label, preview } = reference;

    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                onClick(reference); // Dispara evento para o pai
            }}
            className={`SourceChip ${type.toLowerCase()}`}
            title={preview}
            style={{ cursor: 'pointer' }}
        >
            <span className="chip-icon">{type === 'NOTE' ? '📖' : '⛪'}</span>
            <span className="chip-label">{label}</span>
        </button>
    );
};

const MessageBubble = ({ msg, onOpenReference }) => (
    <div className={`Message ${msg.role}`}>
        <div className="message-content">
            {typeof msg.content === 'string' ? <pre>{msg.content}</pre> : msg.content}
        </div>

        {msg.references && msg.references.length > 0 && (
            <div className="references-container">
                <div className="references-header">Fontes Consultadas:</div>
                <div className="chips-wrapper">
                    {msg.references.map((ref, idx) => (
                        <SourceChip
                            key={idx}
                            reference={ref}
                            onClick={onOpenReference} // Passa a função para baixo
                        />
                    ))}
                </div>
            </div>
        )}
    </div>
);

// 2. ChatWindow recebe 'onOpenReference' do ChatPage
export default function ChatWindow({
                                       messages,
                                       isLoading,
                                       userInput,
                                       onInputChange,
                                       onSendMessage,
                                       onOpenReference // <--- NOVA PROP
                                   }) {
    const messageListRef = useRef(null);

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    return (
        <main className="ChatWindow">
            <div className="MessageList" ref={messageListRef}>
                {messages.map((msg, index) => (
                    <MessageBubble
                        key={msg.id || `msg-${index}`}
                        msg={msg}
                        onOpenReference={onOpenReference} // Passa para o Bubble
                    />
                ))}
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