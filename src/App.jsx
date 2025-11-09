// src/App.jsx
import {useState, useEffect} from 'react';
import {Auth} from '@supabase/auth-ui-react';
import {ThemeSupa} from '@supabase/auth-ui-shared';
import {supabase} from './supabaseClient';
import { jwtDecode } from 'jwt-decode';
import ChatPage from './components/ChatPage.jsx';
import LandingChatView from './components/LandingChatView.jsx';
import { useAuth } from './AuthContext';
import './App.css';
import { Link } from 'react-router-dom';

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
    const { session } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [userRoles, setUserRoles] = useState([]);

    useEffect(() => {
        if (session) {
            setShowLoginModal(false);
            try {
                const decodedToken = jwtDecode(session.access_token);
                setUserRoles(decodedToken.roles || []);
            } catch (e) {
                console.error("Erro ao decodificar token:", e);
                setUserRoles([]);
            }
        } else {
            setUserRoles([]);
        }
    }, [session]);

    // --- SE NÃO ESTIVER LOGADO ---
    if (!session) {
        return (
            <div className="LandingPage">
                <LandingChatView onLoginClick={() => setShowLoginModal(true)} />

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
                                view="sign_in"
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- SE ESTIVER LOGADO ---
    const isPrivilegedUser = userRoles.includes('ADMIN') || userRoles.includes('MODERATOR');

    return (
        <div className="App">
            <header className="Header">
                {isPrivilegedUser && (
                    // 1. "BOTÃO MELHOR" APLICADO (substitui 'admin-link-button')
                    <Link to="/admin" className="btn btn-secondary">
                        Painel Admin
                    </Link>
                )}
                <span>Logado como: {session.user.email}</span>

                {/* 2. ESTILO GLOBAL APLICADO AO BOTÃO "SAIR" */}
                <button
                    onClick={() => supabase.auth.signOut()}
                    className="btn btn-danger" // (Usando a classe de perigo)
                >
                    Sair
                </button>
            </header>
            <ChatPage session={session} />
        </div>
    );
}