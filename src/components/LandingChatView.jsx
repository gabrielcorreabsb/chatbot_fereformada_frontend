import ChatPage from './ChatPage.jsx';


const ComparisonCard = ({title, icon, content, source, isReformed}) => (
    <div className={`ComparisonCard ${isReformed ? 'reformed' : 'generic'}`}>
        <h3><span className="logo-icon">{icon}</span> {title}</h3>
        <p>{content}</p>
        <span className="SourceTag">{source}</span>
    </div>
);

export default function LandingChatView({onLoginClick}) {

    const initialMessages = [
        // Mensagem 1: Pergunta do Usuário (igual)
        {
            id: 'msg1',
            role: 'user',
            content: 'O que é a IA Fé Reformada?'
        },
        // Mensagem 2: Explicação da IA (igual)
        {
            id: 'msg2',
            role: 'assistant',
            isTyping: true,
            content:
                (
                    // Usamos um Fragment <>...</> para agrupar
                    <>
                        <p>Bem-vindo! Sou uma Inteligência Artificial treinada <strong>exclusivamente</strong> com
                            fontes fiéis da Tradição Reformada.</p>

                        <p><strong>Minha Diferença:</strong><br/>
                            IAs comuns (ChatGPT, Gemini) usam toda a internet e podem dar respostas vagas ou
                            teologicamente incorretas. Eu sou diferente.</p>

                        <p><strong>Minhas Fontes:</strong></p>
                        <ul>
                            <li>Bíblia Sagrada (com notas da Bíblia de Genebra)</li>
                            <li>Confissão de Fé de Westminster</li>
                            <li>Catecismos Maior e Breve de Westminster</li>
                            <li>As Institutas da Religião Cristã (João Calvino)</li>
                            <li>Teologia Sistemática (Louis Berkhof)</li>
                        </ul>

                        <p><strong>Meu Objetivo:</strong><br/>
                            Fornecer respostas alinhadas com a sã doutrina, ajudando você em seus estudos teológicos de
                            forma confiável.</p>

                        <p><em>(Versão Alpha v0.1.0 - Em desenvolvimento) Pode conter erros textuais e de formatação,
                            aguardo seu feedback para melhoras!</em></p>
                    </>
                )
        },
        // 👇 Mensagem 3: A Comparação (NOVO) 👇
        {
            id: 'msg3',
            role: 'assistant',
            isComparison: true, // Flag para estilo especial
            content: ( // Usamos JSX diretamente aqui
                <div className="ComparisonMessageContent">
                    <h2></h2>
                    <p className="ComparisonIntro">Fizemos a pergunta <strong>"O que é a predestinação?"</strong> para
                        as IAs:</p>
                    <div className="ComparisonContainer landing">
                        <ComparisonCard
                            title="IA Fé Reformada"
                            icon="IA"
                            content="A predestinação, conforme ensinada pelas Escrituras e sistematizada pela Teologia Reformada, é o eterno e soberano propósito de Deus pelo qual Ele, antes da fundação do mundo, escolheu pessoas em Cristo para a vida eterna e a glória, não com base em qualquer mérito ou previsão de fé ou obras nelas, mas unicamente segundo o beneplácito de Sua vontade e de Sua livre graça e amor. Este decreto divino é um plano de graça salvífica soberana que capacita os crentes a retrocederem sua fé e salvação à decisão eterna de Deus de conduzi-los à conformidade com Cristo e à glorificação. A Confissão de Fé de Westminster, em harmonia com este ensino bíblico, elucida que Deus, para a manifestação de Sua glória, predestinou alguns homens para a vida eterna, demonstrando que esta escolha é um ato de pura e imutável graça divina, não condicionada por nada na criatura, mas fundamentada em Seu eterno e imutável propósito"
                            source="Fonte: Confissão de Fé de Westminster, Cap. 3"
                            isReformed={true}
                        />
                        <ComparisonCard
                            title="ChatGPT"
                            icon="🤖"
                            content="A predestinação é a doutrina teológica que afirma que Deus, em Sua soberania e sabedoria eterna, determinou de antemão o destino final de todas as pessoas, especialmente quem será salvo e quem não será. Essa ideia está baseada na compreensão de que a salvação não depende do mérito humano, mas exclusivamente da graça divina. Assim, antes mesmo da criação do mundo, Deus teria escolhido, por Seu propósito e amor, aqueles que receberiam a fé e a vida eterna em Cristo. Essa doutrina é central no pensamento reformado e visa destacar a supremacia da vontade de Deus em todas as coisas."
                            source="Fonte: Conhecimento geral da internet"
                            isReformed={false}
                        />
                        <ComparisonCard
                            title="Gemini"
                            icon="✨"
                            content="A predestinação é a doutrina, principalmente teológica, que sustenta que todos os eventos, ou de forma mais específica a salvação de certas pessoas, foram determinados ou decididos por Deus antecipadamente, ou seja, desde a eternidade, independentemente de qualquer mérito ou escolha humana posterior, embora em algumas visões essa determinação divina seja feita com base na presciência (conhecimento prévio) de Deus sobre as escolhas das pessoas."
                            source="Fonte: Conhecimento geral da internet"
                            isReformed={false}
                        />
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="ChatPage landing-view">
            {/* --- Sidebar Refinada --- */}
            <aside className="Sidebar landing-sidebar">
                <div className="SidebarPlaceholder">
                    <h1 className="IntroLogo" style={{fontSize: '2.5rem', padding: '20px 20px 0 20px', margin: 0}}>IA Fé
                        Reformada</h1>
                    {/*<p className="SidebarSlogan">Expondo a Verdade Eterna</p>*/}
                    <div className="AlphaWarning sidebar-warning">
                        <strong>Versão Alpha</strong>
                        <span>(v0.1.0) - Pode conter erros textuais e de formatação, aguardo seu feedback para melhoras!</span>
                    </div>
                    {/* Poderíamos adicionar links rápidos aqui no futuro */}
                </div>
            </aside>

            {/* --- Janela de Chat Estática --- */}
            <main className="ChatWindow">
                <div className="MessageList landing-list">
                    {initialMessages.map((msg) => (
                        // A classe 'comparison-message' agora só se aplica se for comparação
                        <div key={msg.id}
                             className={`Message ${msg.role} ${msg.isComparison ? 'comparison-message' : ''}`}>
                            {/* 👇 Renderização Simplificada 👇 */}
                            {/* Se o content for JSX (como msg2 e msg3), ele renderiza. Se for string (msg1), também. */}
                            {typeof msg.content === 'string' ? <pre>{msg.content}</pre> : msg.content}
                        </div>
                    ))}
                </div>

                {/* --- O Bloco de Ação (Login) Refinado --- */}
                <div className="LandingForm">
                    <p>Pronto para começar seu estudo?</p>
                    <div className="LandingButtons">
                        <button className="LoginButton" onClick={onLoginClick}>
                            Entrar ou Cadastrar-se Gratuitamente
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}