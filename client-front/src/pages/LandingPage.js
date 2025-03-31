import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
// Componente da página inicial
const LandingPage = () => {
  // Busca os dados de autenticação do contexto
  const { authData } = useContext(AuthContext);
  const { token, userName } = authData;

  return (
    <div className="container text-center my-5">
      <h1>Bem-vindo ao Lista de Compras Inteligente</h1>
      {token ? ( // Verifica se o usuário está autenticado, caso esteja a lading page é personalizada com o primeiro nome
        <div>
          <p>
            Olá, {userName}! Simplifique suas compras e gerencie suas listas de forma fácil e prática.
          </p>
          <Link to="/listas" className="btn btn-primary me-2">
            Minhas Listas
          </Link>
        </div>
      ) : (
        // Se o usuário não estiver autenticado a landing page é outra
        <div>
          <p>
            Organize suas compras de maneira eficiente com nosso aplicativo intuitivo. Crie, edite e acompanhe suas listas de compras em qualquer lugar e a qualquer momento.
          </p>
          <Link to="/register" className="btn btn-primary me-2">
            Registre-se
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Fazer Login
          </Link>
        </div>
      )}
    </div>
  );
};

export default LandingPage;