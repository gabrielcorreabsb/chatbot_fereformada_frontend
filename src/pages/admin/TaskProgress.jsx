import React from 'react';
// import './AdminForm.css'; // <-- 1. REMOVIDO!

// (Ícones... sem mudanças)
const IconCheck = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 32, height: 32, color: 'green' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);
const IconError = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 32, height: 32, color: 'red' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);


export default function TaskProgress({ taskStatus, onReset }) {

    if (!taskStatus) {
        return <div className="content-box">Carregando status da tarefa...</div>;
    }

    const { status, totalItems, processedItems, currentLog, errorMessage } = taskStatus;

    const percentage = (totalItems > 0 && processedItems > 0)
        ? Math.round((processedItems / totalItems) * 100)
        : 0;

    let title = "Importação em Andamento...";
    if (status === 'COMPLETED') title = "Importação Concluída!";
    if (status === 'FAILED') title = "A Importação Falhou";
    if (status === 'PENDING') title = "Tarefa na fila, aguardando início...";

    return (
        // 2. CLASSE ATUALIZADA
        <div className="content-box progress-view">
            <div className="progress-header">
                {status === 'COMPLETED' && <IconCheck />}
                {status === 'FAILED' && <IconError />}
                <h2>{title}</h2>
            </div>

            {(status === 'PROCESSING' || status === 'COMPLETED') && (
                <div className="progress-container">
                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fg"
                            style={{ width: `${percentage}%` }}
                        >
                            {percentage > 10 && `${percentage}%`}
                        </div>
                    </div>
                    <div className="progress-count">
                        {processedItems} / {totalItems} Chunks
                    </div>
                    <div className="progress-log">
                        {currentLog}
                    </div>
                </div>
            )}

            {status === 'FAILED' && (
                // 3. CLASSE ATUALIZADA
                <div className="message-box error progress-error">
                    <strong>Erro:</strong> {errorMessage}
                </div>
            )}

            {(status === 'COMPLETED' || status === 'FAILED') && (
                // 4. CLASSE DE BOTÃO ATUALIZADA
                <button
                    onClick={onReset}
                    className="btn btn-primary" // (Decidi usar 'primary' aqui)
                    style={{ marginTop: '2rem' }}
                >
                    Iniciar Nova Importação
                </button>
            )}
        </div>
    );
}