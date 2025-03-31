import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Perfil = () => {
    // Obtem dados e funções do contexto de autenticação
    const { authData, updateUserName, logout } = useContext(AuthContext);
    const { token } = authData;

    // Estados para controlar a visibilidade das senhas
    const [showSenhaAtual, setShowSenhaAtual] = useState(false);
    const [showNovaSenha, setShowNovaSenha] = useState(false);
    const [showConfirmarNovaSenha, setShowConfirmarNovaSenha] = useState(false);

    // Estado para armazenar dados do usuário
    const [userData, setUserData] = useState({
        nome: '',
        email:'',
    });
    // Estados para gerenciar a edição do nome
    const [editName, setEditName] = useState(false);
    const [newName, setNewName] = useState('');

    // Estados para gerenciar os campos da senha
    const [passwordData, setPasswordData] = useState({
        senhaAtual: '',
        novaSenha: '',
        confirmarNovaSenha: '',
      });

      // Efeito para verificar autenticação e buscar dados do usuário
      useEffect(() => {
        if (!token) {
          alert('Você precisa estar logado para acessar esta página.');
          window.location.href = '/login';
        } else {
          fetchUserProfile();
        }
      }, [token]);
      // Função para buscar os dados do perfil do usuário
      const fetchUserProfile = async () => {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserData(res.data);
          setNewName(res.data.nome);
        } catch (err) {
          console.error(err);
        }
      };
      // Função par atualizar o nome do usuário
      const handleNameChange = async () => {
        if (newName.trim() === '') {
          alert('O nome não pode estar vazio.');
          return;
        }
    
        try {
          const res = await axios.put(
            `${process.env.REACT_APP_API_URL}/users/update-name`,
            { nome: newName },
            { headers: { Authorization: `Bearer ${token}` } }
          );
    
          setUserData(res.data);
          updateUserName(res.data.nome);
          setEditName(false);
          alert('Nome atualizado com sucesso!');
        } catch (err) {
          console.error(err);
          alert('Erro ao atualizar o nome.');
        }
      };
      // Função para atualizar a senha do usuário
      const handlePasswordChange = async (e) => {
        e.preventDefault();
        const { senhaAtual, novaSenha, confirmarNovaSenha } = passwordData;
        // Verifica se todos os campos de senha foram preenchidos
        if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
          alert('Por favor, preencha todos os campos de senha.');
          return;
        }
        // Verifica se a nova senha e a confirmação correspondem
        if (novaSenha !== confirmarNovaSenha) {
          alert('A nova senha e a confirmação não correspondem.');
          return;
        }
    
        try {
          const res = await axios.put(
            `${process.env.REACT_APP_API_URL}/users/update-password`,
            { senhaAtual, novaSenha },
            { headers: { Authorization: `Bearer ${token}` } }
          );
    
          alert(res.data.msg);
          setPasswordData({ senhaAtual: '', novaSenha: '', confirmarNovaSenha: '' });
        } catch (err) {
          console.error(err);
          alert(err.response.data.msg || 'Erro ao atualizar a senha.');
        }
      };
      // Função para excluir a conta do usuário
      const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm(
          'ATENÇÃO: Esta ação é irreversível e todos os seus dados serão perdidos. Tem certeza de que deseja excluir sua conta?'
        );
      
        if (confirmDelete) {
          try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/users/delete-account`, {
              headers: { Authorization: `Bearer ${token}` },
            });
      
            alert('Sua conta foi excluída com sucesso.');
            logout(); // Deslogar o usuário e limpar os dados de autenticação
            window.location.href = '/'; // Redirecionar para a página inicial
          } catch (err) {
            console.error(err);
            alert(err.response.data.msg || 'Erro ao excluir a conta.');
          }
        }
      };
      
    
      return (
        <div>
          <h2>Perfil do Usuário</h2>
          <div className="mb-3">
            <label><strong>Nome:</strong></label>
            {editName ? (
              <div className="d-flex">
                <input
                  type="text"
                  className="form-control me-2"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <button className="btn btn-success me-2" onClick={handleNameChange}>Salvar</button>
                <button className="btn btn-secondary" onClick={() => { setEditName(false); setNewName(userData.nome); }}>Cancelar</button>
              </div>
            ) : (
              <div className="d-flex align-items-center">
                <span>{userData.nome}</span>
                <button className="btn btn-link ms-2" onClick={() => setEditName(true)}>Editar</button>
              </div>
            )}
          </div>
          <div className="mb-3">
            <label><strong>Email:</strong></label>
            <div>{userData.email}</div>
            
          </div>
          
         

          <h3>Alterar Senha</h3>
          <form onSubmit={handlePasswordChange}>
            <input 
              type="hidden" 
              name="username" 
              value={userData.email}  
              autoComplete="username" 
            />
            <div className="mb-3">
                <label>Senha Atual</label>
                <div className="input-group">
                  
                  <input
                    type={showSenhaAtual ? 'text' : 'password'}
                    className="form-control"
                    value={passwordData.senhaAtual}
                    onChange={(e) => setPasswordData({ ...passwordData, senhaAtual: e.target.value })}
                    autoComplete='current-password'
                  />
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                        >
                        <i className={`bi ${showSenhaAtual ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                </div>
                </div>
                <div className="mb-3">
                  <label>Nova Senha</label>
                  <div className="input-group">
                  <input
                    type={showNovaSenha ? 'text' : 'password'}
                    className="form-control"
                    value={passwordData.novaSenha}
                    onChange={(e) => setPasswordData({ ...passwordData, novaSenha: e.target.value })}
                    autoComplete='new-password'
                  
                />
                    <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowNovaSenha(!showNovaSenha)}
                  >
                    <i className={`bi ${showNovaSenha ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                  
                </div>
                </div>
                <div className="mb-3">
                    <label>Confirmar Nova Senha</label>
                    <div className="input-group">
                        <input
                        type={showConfirmarNovaSenha ? 'text' : 'password'}
                        className="form-control"
                        value={passwordData.confirmarNovaSenha}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmarNovaSenha: e.target.value })}
                        autoComplete='new-password'
                        />
                        <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowConfirmarNovaSenha(!showConfirmarNovaSenha)}
                        >
                        <i className={`bi ${showConfirmarNovaSenha ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>

                    </div>
                    </div>
            <button type="submit" className="btn btn-primary">Atualizar Senha</button>
          </form>
          <hr />
            <div className="mt-4">
            <button className="btn btn-danger" onClick={handleDeleteAccount}>
                Excluir Conta
            </button>
            </div>

        </div>
      );
    };
    
    export default Perfil;
