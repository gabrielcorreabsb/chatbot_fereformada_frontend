// src/App.jsx
import { useState, useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from './supabaseClient';
import ChatPage from './components/ChatPage.jsx';
import './App.css';

const ptBR_labels = {
    sign_in: {
        email_label: "Endereço de e-mail",
        password_label: "Sua Senha",
        button_label: "Entrar",
        social_provider_text: "Entrar com {{provider}}",
        link_text: "Já tem uma conta? Entrar"
    },
    sign_up: {
        email_label: "Endereço de e-mail",
        password_label: "Crie sua Senha",
        button_label: "Cadastrar",
        link_text: "Não tem uma conta? Cadastre-se"
    },
    forgotten_password: {
        email_label: "Endereço de e-mail",
        button_label: "Enviar instruções de redefinição",
        link_text: "Esqueceu sua senha?",
        confirmation_text: "Verifique seu e-mail para o link de redefinição"
    },
    magic_link: {
    },
    update_password: {
        password_label: "Nova senha",
        password_input_placeholder: "Sua nova senha",
        button_label: "Atualizar senha",
    },
};

export default function App() {
    const [session, setSession] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
        return () => subscription.unsubscribe();
    }, []);

    // --- SE NÃO ESTIVER LOGADO (PÁGINA DE LOGIN) ---
    if (!session) {
        return (
            <div className="HomePageContainer">

                {/* Coluna da Esquerda: A Apresentação */}
                <div className="IntroColumn">
                    <h1 className="IntroLogo">IA Fé Reformada</h1>

                    <div className="AlphaWarning">
                        <strong>Versão Alpha (v0.1.0):</strong> Este é um projeto em desenvolvimento inicial.
                        As respostas podem conter erros de estrutura ou não ser perfeitas, aguardamos o seu feedback para melhoras.
                    </div>

                    <hr className="IntroDivider" />


                    <h2>Qual a diferença de uma IA convencional?</h2>
                    <p>
                        IAs comuns (como o ChatGPT ou Gemini) são treinadas com toda a internet.
                        Suas respostas podem ser vagas, seculares ou conter erros teológicos.
                    </p>

                    <h2>Uma IA Focada</h2>
                    <p>
                        Esta IA é diferente. Ela <strong>não usa a internet</strong> para formular respostas.
                        O conhecimento dela é baseado <strong>exclusivamente</strong> em fontes fiéis da Tradição Reformada:
                    </p>
                    <ul>
                        <li>A Bíblia Sagrada (com notas da Bíblia de Genebra)</li>
                        <li>Confissão de Fé de Westminster</li>
                        <li>Catecismos Maior e Breve</li>
                        <li>As Institutas de João Calvino</li>
                        <li>Teologia Sistemática de Berkhof</li>
                        <li>Entre outros textos que serão adicionados!</li>
                    </ul>
                    <p>
                        Isso garante que você receberá respostas alinhadas com a doutrina,
                        sem "achismos" ou influências seculares
                    </p>
                </div>

                {/* Coluna da Direita: O "Card" de Login */}
                <div className="LoginColumn">
                    <div className="LoginContainer">
                        <h2 className="LoginHeader">Acesse sua conta</h2>
                        <p className="LoginSubheader">Faça login para iniciar seu estudo.</p>
                        <div className="AuthFormContainer">
                            <Auth
                                supabaseClient={supabase}
                                appearance={{ theme: ThemeSupa }}
                                theme="light"
                                providers={['google']}
                                localization={{ variables: ptBR_labels }} //
                            />
                        </div>
                    </div>
                </div>

            </div>
        );
    }

    // --- SE ESTIVER LOGADO (PÁGINA DE CHAT) ---
    return (
        <div className="App">
            <header className="Header">
                <span>Logado como: {session.user.email}</span>
                <button onClick={() => supabase.auth.signOut()}>Sair</button>
            </header>
            <ChatPage session={session} />
        </div>
    );
}