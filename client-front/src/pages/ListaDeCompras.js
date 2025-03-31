import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import debounce from 'lodash.debounce';
import '../css/ListaDeCompras.css';

const ListaDeCompras = () => {
  const [lista, setLista] = useState(null);
  const [filter, setFilter] = useState('all');
  const { authData } = useContext(AuthContext);
  const { token } = authData;
  const { id: listaId } = useParams();

  // Estados para criar item sem categoria e categoria
  const [novoItemSemCategoria, setNovoItemSemCategoria] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('');
  const [novoItemNaCategoria, setNovoItemNaCategoria] = useState({});

  // Estados para editar nome da categoria
  const [editCategoryName, setEditCategoryName] = useState({});
  const [editingCategory, setEditingCategory] = useState({});

  // Ao montar, verifica token e busca lista
  useEffect(() => {
    if (!token) {
      alert('Você precisa estar logado para acessar esta página.');
      window.location.href = '/login';
    } else {
      fetchLista();
    }
  }, [token]);

  // WebSocket (Socket.io) para atualizações em tempo real
  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_URL);
    socket.emit('join', `lista_${listaId}`);

    socket.on('item_adicionado', (item) => {
      setLista((prev) => ({
        ...prev,
        itens: [...prev.itens, item],
      }));
    });
    socket.on('item_atualizado', (itemAtualizado) => {
      setLista((prev) => ({
        ...prev,
        itens: prev.itens.map((item) =>
          item._id === itemAtualizado._id ? itemAtualizado : item
        ),
      }));
    });
    socket.on('item_removido', ({ itemId }) => {
      setLista((prev) => ({
        ...prev,
        itens: prev.itens.filter((item) => item._id !== itemId),
      }));
    });

    return () => {
      socket.emit('leave', `lista_${listaId}`);
      socket.disconnect();
    };
  }, [listaId]);

  
  // Função filtro (aplica check/uncheck/all)
  const applyFilter = (items) => {
    if (filter === 'checked') {
      return items.filter((item) => item.checked);
    } else if (filter === 'unchecked') {
      return items.filter((item) => !item.checked);
    } else {  // 'all'
      return items; 
    }
  };


  return (

  );
};
export default ListaDeCompras;