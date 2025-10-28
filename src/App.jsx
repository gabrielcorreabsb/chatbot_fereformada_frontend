// src/App.jsx
import {useState, useEffect} from 'react';
import {Auth} from '@supabase/auth-ui-react';
import {ThemeSupa} from '@supabase/auth-ui-shared';
import {supabase} from './supabaseClient';
import ChatPage from './components/ChatPage.jsx';
import LandingChatView from './components/LandingChatView.jsx';
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
    magic_link: {},
    update_password: {
        password_label: "Nova senha",
        password_input_placeholder: "Sua nova senha",
        button_label: "Atualizar senha",
    },
};
export default function App() {
    const [session, setSession] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false); // NOVO: Estado do Modal

    useEffect(() => {
        // Verifica sessão inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });
        // Escuta mudanças de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            // Se o usuário logar com sucesso, fecha o modal
            if (session) {
                setShowLoginModal(false);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    // --- SE NÃO ESTIVER LOGADO ---
    if (!session) {
        return (
            <div className="LandingPage">
                {/* Renderiza a "prévia" do chat */}
                <LandingChatView onLoginClick={() => setShowLoginModal(true)} />

                {/* O Modal de Login (só aparece se showLoginModal for true) */}
                {showLoginModal && (
                    <div className="LoginModalOverlay">
                        <div className="LoginModalContent">
                            <button className="CloseModalButton" onClick={() => setShowLoginModal(false)}>×</button>
                            <h2 className="LoginHeader">Acesse sua conta</h2>
                            <Auth
                                supabaseClient={supabase}
                                appearance={{ theme: ThemeSupa }}
                                theme="light"
                                providers={['google']}
                                localization={{ variables: ptBR_labels }}
                                view="sign_in" // Começa na tela de login
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- SE ESTIVER LOGADO ---
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
