// src/apiClient.js
import axios from 'axios';

// Crie uma instância 'apiClient'
export const apiClient = axios.create({
    // Coloque a URL da sua API Spring Boot
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json'
    }
});