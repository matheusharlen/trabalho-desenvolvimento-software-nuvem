import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Cria um contexto para gerenciar autenticação
export const AuthContext = createContext();

// Encapsula a lógica de autenticação
export const AuthProvider = ({ children }) => {
  // Armazerna o token e o nome do usuário
  const [authData, setAuthData] = useState({
    token: localStorage.getItem('token'),
    userName: '',
  });
  // Decodifica o token e atualiza o nome do usuário quando o token muda
  const { token } = authData;
  useEffect(() => {
    if (token) {
      try {
        // Decodigica o token JWT
        const decoded = jwtDecode(token);
        setAuthData(prevState => ({
          ...prevState,
          userName: decoded.user.nome,
        }));
      } catch (error) {
        console.error('Erro ao decodificar o token:', error);
        setAuthData({ token: null, userName: '' }); // Limpa os dados de autenticação em caso de erro
        localStorage.removeItem('token'); // Remove o token invalido do local storage
      }
    }
  }, [token]);
  // Funçao para fazer login. Armazena token e nome do usuário no local storage
  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    setAuthData({ token, userName: decoded.user.nome });
  };
  // Função para fazer logout removendo o token e limpando os dados do usuário
  const logout = () => {
    localStorage.removeItem('token');
    setAuthData({ token: null, userName: '' });
  };
  // Função para atualizar o nome do usuário 
  const updateUserName = (newName) => {
    setAuthData((prevState) => ({
      ...prevState,
      userName: newName,
    }));
  };
   // Fornece o contexto de autenticação para componentes filhos
  return (
    <AuthContext.Provider value={{ authData, login, logout,updateUserName }}>
      {children}
    </AuthContext.Provider>
  );
};  