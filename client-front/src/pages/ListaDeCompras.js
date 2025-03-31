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

  // Busca lista no servidor
  const fetchLista = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/listas/${listaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLista(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  
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


  // Adiciona um item sem categoria
  const addItemSemCategoria = async () => {
    if (!novoItemSemCategoria.trim()) {
      alert('Digite um nome de item para adicionar.');
      return;
    }
    const newItem = {
      nome: novoItemSemCategoria,
      quantidade: 1,
      preco: 0,
      checked: false,
    };
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/listas/${listaId}/itens`, newItem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNovoItemSemCategoria('');
    } catch (err) {
      console.error(err);
    }
  };

  // Edição de itens sem categoria (debounce)
  const debouncedUpdateItem = useCallback(
    debounce(async (itemId, updatedItem) => {
      try {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/listas/${listaId}/itens/${itemId}`,
          updatedItem,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error(err);
      }
    }, 500),
    [listaId, token]
  );

  // Função para atualizar um item sem categoria
  const handleInputChange = (index, key, value) => {
    if (!lista) return;
    const updatedItem = { ...lista.itens[index], [key]: value };
    if (key === 'quantidade' || key === 'preco') {
      updatedItem.total = updatedItem.quantidade * updatedItem.preco;
    }
    setLista((prev) => {
      const novosItens = [...prev.itens];
      novosItens[index] = updatedItem;
      return { ...prev, itens: novosItens };
    });
    debouncedUpdateItem(updatedItem._id, updatedItem);
  };

  return (

  );
};
export default ListaDeCompras;