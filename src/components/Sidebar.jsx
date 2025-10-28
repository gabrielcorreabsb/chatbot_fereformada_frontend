import ChatPage from './ChatPage.jsx';


export default function Sidebar({
                                    conversations,
                                    currentChatId,
                                    onSelectChat,
                                    onNewChat
                                }) {
    return (
        <aside className="Sidebar">
            <button className="NewChatBtn" onClick={onNewChat}>
                + Novo Chat
            </button>
            <div className="ConversationList">
                {conversations.map(convo => (
                    <div
                        key={convo.id}
                        className={`ConvoItem ${convo.id === currentChatId ? 'active' : ''}`}
                        onClick={() => onSelectChat(convo.id)}
                        title={convo.title} // Adiciona tooltip para títulos longos
                    >
                        {convo.title}
                    </div>
                ))}
            </div>
        </aside>
    );
}