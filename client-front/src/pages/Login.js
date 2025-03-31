import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  // Estados para armazenar email, senha, status de carregamento, visibilidade se senha e mensagens de erro
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Função chamada ao submeter o formulário de login
  const onSubmit = async (e) => {
    e.preventDefault();

    setIsPending(true);

    try {
      //Faz uma requisição POST para a rota de login
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/users/login`, {
        email,
        senha,
      });

      login(res.data.token); // Chama a função de login do contexto com o token recebido
      navigate('/listas'); // Redireciona o usuário para a página de listas
    } catch (err) {
      console.error(err);
      //alert('Falha no login. Verifique suas credenciais.');
      setErrorMessage('Falha no login. Verifique suas credenciais.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow-lg w-100" style={{ maxWidth: '400px' }}>
        <div className="card-body p-5">
          <h1 className="fs-4 card-title fw-bold mb-4 text-center">Login</h1>
          <form onSubmit={onSubmit} autoComplete="off">
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
                autoFocus
              />
            </div>
            <div className="mb-3">
              <label className="text-muted" htmlFor="senha">
                Senha
              </label>
              <div className='input-group'>
              <input
                id="senha"
                type={showSenha ? 'text' : "password"}
                className="form-control"
                required
                autoComplete='current-password'
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                
              />
              <button
                type='button'
                className='btn btn-outline-secondary'
                onClick={() => setShowSenha(!showSenha)}
              >
                 <i className={`bi ${showSenha ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
              </div>
              
            </div>
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
                  'Entrar'
                )}
              </button>
            </div>
          </form>
          {errorMessage && (
            <div className='alert alert-danger mt-3' role='alert'>
              {errorMessage}
            </div>  
          )}

        </div>
        <div className="card-footer py-3 border-0 text-center">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-primary">
            Registre-se
          </Link>
          
        </div>
        
      </div>
      
    </div>
  );

  
};


export default Login;
