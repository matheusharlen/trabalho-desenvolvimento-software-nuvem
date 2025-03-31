// cliente-front/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';

// Importações de estilos e scripts do Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// Cria a raiz da aplicação React especifica que será renderizada no DOM
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderiza a aplicação dentro do contexto de autenticação
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
