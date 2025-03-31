import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MinhasListas = () => {
  // Estados para armazenar listas do usuário, nome da nova lista, editar nome da lista
  const [listas, setListas] = useState([]);
  const [nomeLista, setNomeLista] = useState('');
  const { authData } = useContext(AuthContext);
  const { token, userName } = authData;

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    // Verifica se o usuário esta logado
    if (!token) {
      alert('Você precisa estar logado para acessar esta página.');
      window.location.href = '/login';
    } else {
      fetchListas(); // Bsca as listas do usuário
    }
  }, [token]);
  // Função para buscar as listas do usuário no servidor
  const fetchListas = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/listas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListas(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  // Função para criar uma nova lista
  const criarLista = async () => {
    if (nomeLista.trim() === '') {
      alert('O nome da lista não pode estar vazio.');
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/listas`,
        { nome: nomeLista },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNomeLista('');
      setListas((prevListas) => [...prevListas, res.data]);
    } catch (err) {
      console.error(err);
    }
  };
  // Função para deletar uma lista existente
  const deletarLista = async (id) => {
    if (window.confirm('Você tem certeza que deseja deletar esta lista?')) {
      try {
        console.log('Deletando lista com ID:', id);
        await axios.delete(`${process.env.REACT_APP_API_URL}/listas/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Atualizar o estado 'listas' removendo a lista deletada
        setListas((prevListas) => prevListas.filter((lista) => lista._id !== id));
      } catch (err) {
        console.error(err.response ? err.response.data : err.message);
      }
    }
  };

  // Função para atualizar o nome de uma lista
  const updateNameLista = async (id, newName) => {
    if (!newName.trim()) {
      alert('O nome da lista não pode estar vazio.');
      return;
    }
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/listas/${id}`,
        { nome: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Atualiza no estado apenas a lista que foi modificada
      setListas((prevListas) =>
        prevListas.map((lista) => (lista._id === id ? res.data : lista))
      );
      // Sai do modo edição
      setEditingId(null);
      setEditingName('');
    } catch (err) {
      console.error(err);
    }
  };

  // Abre o modo de edição para uma lista específica
  const handleEditClick = (lista) => {
    setEditingId(lista._id);
    setEditingName(lista.nome); // inicia o campo com o nome atual
  };

  // Cancela a edição (sem salvar)
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };
    

  return (
    <div>
      <h2>Minhas Listas</h2>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Nome da Nova Lista"
          value={nomeLista}
          onChange={(e) => setNomeLista(e.target.value)}
          className="form-control"
          onKeyDown={(e) => e.key === 'Enter' && criarLista()}
        />
        <button className="btn btn-primary mt-2" onClick={criarLista}>
          Criar Lista
        </button>
      </div>

      <ul className="list-group">
        {listas.map((lista) => {

          if (editingId === lista._id) {
            return (
              <li key={lista._id} className="list-group-item d-flex align-items-center">
                
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="form-control me-2"
                  onKeyDown={(e) => e.key === 'Enter' && updateNameLista(lista._id, editingName)}
                />
                <button
                  className="btn btn-success me-2"
                  onClick={() => updateNameLista(lista._id, editingName)}
                >
                  Salvar
                </button>
                <button className="btn btn-secondary" onClick={handleCancelEdit}>
                  Cancelar
                </button>
              </li>
            );
          } else {
            
            return (
              <li
                key={lista._id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
               
                <Link to={`/lista/${lista._id}`}>{lista.nome}</Link>

                <div>
                  
                  <button
                    className="btn btn-info me-2"
                    onClick={() => handleEditClick(lista)}
                  >
                    Editar
                  </button>
                 
                  <button
                    className="btn btn-danger"
                    onClick={() => deletarLista(lista._id)}
                  >
                    Excluir
                  </button>
                </div>
              </li>
            );
          }
        })}
      </ul>
    </div>
  );
};

export default MinhasListas;