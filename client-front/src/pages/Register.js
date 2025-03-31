import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  // Estados para armazenar dados do formulário e controlar comportamento do componente
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  // Função chamada ao submeter o formulário de registro
  const onSubmit = async (e) => {
    e.preventDefault();

    
    setErrorMessage('');

    if (senha !== confirmarSenha) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }
    setIsPending(true);

    try {
      // Faz uma requisição POST para a rota de registro
      await axios.post(`${process.env.REACT_APP_API_URL}/users/register`, {
        nome,
        email,
        senha,
      });

      alert('Usuário cadastrado com sucesso! Você pode fazer login agora.');
      navigate('/login'); // Redireciona o usuário para a página de login
    } catch (err) {
      console.error(err);
      //alert('Não foi possível cadastrar o usuário.');
      setErrorMessage('Não foi possível cadastrar usuário.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow-lg w-100" style={{ maxWidth: '400px' }}>
        <div className="card-body p-5">
          <h1 className="fs-4 card-title fw-bold mb-4 text-center">Cadastre-se</h1>
          <form onSubmit={onSubmit} autoComplete="off">
            <div className="mb-3">
              <label className="mb-2 text-muted" htmlFor="nome">
                Nome
              </label>
              <input
                id="nome"
                type="text"
                className="form-control"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="mb-3">
              <label className="mb-2 text-muted" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="text-muted" htmlFor="senha">
                Senha
              </label>
              <div className="input-group">
                <input
                  id="senha"
                  type={showSenha ? 'text' : 'password'}
                  className="form-control"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowSenha(!showSenha)}
                > 
                  <i className={`bi ${showSenha ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                 
                </button>
              </div>
            </div>
            <div className="mb-3">
              <label className="text-muted" htmlFor="confirmarSenha">
                Confirmar Senha
              </label>
              <div className="input-group">
                <input
                  id="confirmarSenha"
                  type={showConfirmarSenha ? 'text' : 'password'}
                  className="form-control"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                >
                  <i className={`bi ${showConfirmarSenha ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>
            {errorMessage && (
              <div className="alert alert-danger mt-3" role="alert">
                {errorMessage}
              </div>
            )}
              
      
            <div className="d-flex align-items-center">
              <button
                type="submit"
                className="btn btn-primary ms-auto"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">Carregando...</span>
                  </>
                ) : (
                  'Cadastrar'
                )}
              </button>
            </div>
          </form>
        </div>
        <div className="card-footer py-3 border-0 text-center">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-primary">
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
