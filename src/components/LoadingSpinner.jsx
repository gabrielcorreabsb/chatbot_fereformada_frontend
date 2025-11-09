import React from 'react';
import './LoadingSpinner.css'; // Vamos criar este CSS

export default function LoadingSpinner() {
    return (
        <div className="spinner-overlay">
            <div className="spinner-container"></div>
        </div>
    );
}