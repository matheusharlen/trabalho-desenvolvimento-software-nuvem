import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { authData, logout } = useContext(AuthContext);
  const { token, userName } = authData;

  // Função para obter o primeiro nome
  const getFirstName = (fullName) => {
    return fullName.split(' ')[0];
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        {/* Brand */}
        <Link className="navbar-brand" to="/">Lista de Compras</Link>

        {/* Botão de Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Alternar navegação"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links da Navbar */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto">
            {!token ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Registrar</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <span className="nav-link">Olá, {getFirstName(userName)}</span>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/listas">Minhas Listas</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/perfil">Perfil</Link>
                </li>
                <li className="nav-item">
                  <button className="btn btn-link nav-link" onClick={logout}>Sair</button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
