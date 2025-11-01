// src/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

// 1. Cria o Contexto
const AuthContext = createContext(null);

// 2. Cria o "Provedor" (Provider) que vai gerenciar a sessão
export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true); // Começa carregando

    useEffect(() => {
        // Pega a sessão inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false); // Terminou de carregar
        });

        // Ouve mudanças na autenticação (login, logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
            }
        );

        // Limpa a inscrição quando o componente é desmontado
        return () => subscription.unsubscribe();
    }, []); // O array vazio [] significa que isso roda só uma vez

    // O valor que será compartilhado com todo o app
    const value = {
        session,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Só renderiza o app (children) depois que a sessão inicial for checada */}
            {!loading && children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    return useContext(AuthContext);
};