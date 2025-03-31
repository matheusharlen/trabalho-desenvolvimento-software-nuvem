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

  // Função para marcar/desmarcar item sem categoria
  const toggleChecked = (index) => {
    if (!lista) return;
    const updatedItem = {
      ...lista.itens[index],
      checked: !lista.itens[index].checked,
    };
    debouncedUpdateItem(updatedItem._id, updatedItem);
  };

  // Função para deletar um item sem categoria
  const deleteItem = async (itemId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/listas/${listaId}/itens/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Cria uma nova categoria
  const addCategory = async () => {
    if (!novaCategoria.trim()) {
      alert('Digite um nome de categoria para adicionar.');
      return;
    }
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/listas/${listaId}/categorias`,
        { nome: novaCategoria },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLista((prev) => ({
        ...prev,
        categorias: [...prev.categorias, res.data],
      }));
      setNovaCategoria('');
    } catch (err) {
      console.error(err);
    }
  };

  // Adicionar item a uma categoria
  const addItemToCategory = async (catId) => {
    const nomeItem = novoItemNaCategoria[catId];
    if (!nomeItem || !nomeItem.trim()) {
      alert('Digite um nome de item para esta categoria.');
      return;
    }
    const newItem = {
      nome: nomeItem,
      quantidade: 1,
      preco: 0,
      checked: false,
    };
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/listas/${listaId}/categorias/${catId}/itens`,
        newItem,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLista((prev) => {
        const novasCategorias = prev.categorias.map((cat) => {
          if (cat._id === catId) {
            return { ...cat, itens: [...cat.itens, res.data] };
          }
          return cat;
        });
        return { ...prev, categorias: novasCategorias };
      });
      setNovoItemNaCategoria((prev) => ({ ...prev, [catId]: '' }));
    } catch (err) {
      console.error(err);
    }
  };
  // A função "debounced" adia a execução até 500ms após a última chamada, evitando requisições repetitivas enquanto o usuário digita
  const debouncedUpdateItemInCategory = useCallback(
    debounce(async (catId, itemId, updatedItem) => {
      try {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/listas/${listaId}/categorias/${catId}/itens/${itemId}`,
          updatedItem,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error(err);
      }
    }, 500),
    [listaId, token]
  );
  // Função para atualizar uma propriedade de um item dentro de uma categoria
  const handleCategoryItemChange = (catIndex, itemIndex, key, value) => {
    if (!lista) return;
    const updatedCategorias = [...lista.categorias];
    const cat = updatedCategorias[catIndex];
    const updatedItem = { ...cat.itens[itemIndex], [key]: value };

    if (key === 'quantidade' || key === 'preco') {
      updatedItem.total = updatedItem.quantidade * updatedItem.preco;
    }

    cat.itens[itemIndex] = updatedItem;
    updatedCategorias[catIndex] = cat;

    setLista((prev) => ({ ...prev, categorias: updatedCategorias }));
    debouncedUpdateItemInCategory(cat._id, updatedItem._id, updatedItem);
  };

  // Função para alternar o estado "checked" de um item dentro de uma categoria
  const toggleCategoryItemChecked = (catIndex, itemIndex) => {
    if (!lista) return;
    const updatedCategorias = [...lista.categorias];
    const cat = updatedCategorias[catIndex];
    const item = cat.itens[itemIndex];
    const updatedItem = { ...item, checked: !item.checked };

    cat.itens[itemIndex] = updatedItem;
    updatedCategorias[catIndex] = cat;

    setLista((prev) => ({ ...prev, categorias: updatedCategorias }));
    debouncedUpdateItemInCategory(cat._id, updatedItem._id, updatedItem);
  };

  // Função para deletar um item dentro de uma categoria
  const deleteItemInCategory = async (catId, itemId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/listas/${listaId}/categorias/${catId}/itens/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLista((prev) => {
        const novasCategorias = prev.categorias.map((c) => {
          if (c._id === catId) {
            return {
              ...c,
              itens: c.itens.filter((i) => i._id !== itemId),
            };
          }
          return c;
        });
        return { ...prev, categorias: novasCategorias };
      });
    } catch (err) {
      console.error(err);
    }
  };

    // Editar categoria
    const toggleEditCategory = (catId, currentName) => {
        const isEditing = editingCategory[catId];
        setEditingCategory((prev) => ({ ...prev, [catId]: !isEditing }));
        if (!isEditing) {
        setEditCategoryName((prev) => ({ ...prev, [catId]: currentName }));
        }
    };
  // Função para atualizar o estado do nome da categoria enquanto esta sendo editado
  const handleCategoryNameChange = (catId, newValue) => {
    setEditCategoryName((prev) => ({ ...prev, [catId]: newValue }));
  };

  // Função para atualizar o nome da categoria
  const updateCategoryName = async (catId) => {
    const newName = editCategoryName[catId];
    if (!newName || !newName.trim()) {
      alert('O nome da categoria não pode estar vazio.');
      return;
    }
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/listas/${listaId}/categorias/${catId}`,
        { nome: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLista((prev) => {
        const novasCategorias = prev.categorias.map((c) => {
          if (c._id === catId) {
            return { ...c, nome: res.data.nome };
          }
          return c;
        });
        return { ...prev, categorias: novasCategorias };
      });
      setEditingCategory((prev) => ({ ...prev, [catId]: false }));
    } catch (err) {
      console.error(err);
    }
  };
  // Função para deletar uma categoria
  const deleteCategory = async (catId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria e todos os itens dentro dela?')) {
      return;
    }
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/listas/${listaId}/categorias/${catId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLista((prev) => ({
        ...prev,
        categorias: prev.categorias.filter((c) => c._id !== catId),
      }));
    } catch (err) {
      console.error(err);
    }
  };


  // Função para calcular o valor total da lista
  const calculateTotal = () => {
    if (!lista) return 0;
    let totalSemCat = lista.itens.reduce((sum, item) => sum + (item.total || 0), 0);
    let totalCategorias = 0;
    for (const cat of lista.categorias) {
      totalCategorias += cat.itens.reduce((sum, i) => sum + (i.total || 0), 0);
    }
    return totalSemCat + totalCategorias;
  };

  // Caso ainda não tenha carregado a lista, uma espera é exibida para o usuário
  if (!lista) {
    return <div>Carregando...</div>;
  }

  const filteredTopLevelItems = applyFilter(lista.itens);


  
  return (
    <div className="container py-4">
  
      <h1 className="mb-4">{lista.nome}</h1>

      {/* ITENS SEM CATEGORIA */}
      <section className="mb-4">
        <h4>Itens Sem Categoria</h4>
        
        {/* Linha para inserir item sem categoria */}
        <div className="row g-2 mb-3">
          <div className="col">
            <input
              type="text"
              placeholder="Item sem categoria"
              className="form-control"
              value={novoItemSemCategoria}
              onChange={(e) => setNovoItemSemCategoria(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItemSemCategoria()}
            />
          </div>
          <div className="col-auto">
            <button 
              className="btn btn-primary w-100" 
              onClick={addItemSemCategoria}
            >
              Adicionar Item SEM Categoria
            </button>
          </div>
        </div>

        {/* Filtro de itens */}
        <div className="row g-2 mb-3">
          <div className="col-auto">
            <select
              className="form-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="checked">Marcados</option>
              <option value="unchecked">Desmarcados</option>
            </select>
          </div>
        </div>
      </section>

      {/*Criar nova categoria*/}
      <section className="mb-4">
        <h4>Criar Nova Categoria</h4>
        
        <div className="row g-2">
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Nome da categoria"
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)                
              }
              onKeyDown={(e) => e.key === 'Enter' && addCategory()}
            />
          </div>
          <div className="col-auto">
            <button 
              className="btn btn-success w-100" 
              onClick={addCategory}
            >
              Adicionar Categoria
            </button>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="mb-4">
        {lista.categorias.map((cat, catIndex) => {
          const isEditing = editingCategory[cat._id] || false;
          
          
          const filteredCatItems = applyFilter(cat.itens);
          if (filter !== 'all' && filteredCatItems.length === 0) {
            return null;
          }
          

          return (
            <div className="card mb-3" key={cat._id}>
              <div className="card-body">
                {/* Cabeçalho da categoria (nome, editar, excluir) */}
                <div className="d-flex align-items-center mb-3">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        className="form-control me-2"
                        value={editCategoryName[cat._id] || ''}
                        onChange={(e) => handleCategoryNameChange(cat._id, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && updateCategoryName(cat._id)}
                        
                      />
                      <button
                        className="btn btn-primary me-2"
                        onClick={() => updateCategoryName(cat._id)}
                      >
                        Salvar
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setEditingCategory((prev) => ({
                            ...prev,
                            [cat._id]: false,
                          }));
                        }}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <h5 className="mb-0">{cat.nome}</h5>
                      <button
                        className="btn btn-link ms-3"
                        onClick={() => toggleEditCategory(cat._id, cat.nome)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-danger ms-2"
                        onClick={() => deleteCategory(cat._id)}
                      >
                        Excluir Categoria
                      </button>
                    </>
                  )}
                </div>

                {/* Listagem de itens dentro da categoria */}
                <ul className="list-group">
                  {filteredCatItems.map((item, itemIndex) => (
                    <li
                      key={item._id}
                      className="list-group-item d-flex align-items-center"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleCategoryItemChecked(catIndex, itemIndex)}
                        className="me-2"
                      />

                      {/* Nome do item */}
                      <input
                        type="text"
                        placeholder="Nome do Produto"
                        value={item.nome}
                        onChange={(e) =>
                          handleCategoryItemChange(catIndex, itemIndex, 'nome', e.target.value)
                        }
                        className="form-control me-2"
                        style={{ maxWidth: '200px' }}
                      />

                      {/* Quantidade */}
                      <input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) =>
                          handleCategoryItemChange(catIndex, itemIndex, 'quantidade', parseInt(e.target.value))
                        }
                        className="form-control me-2"
                        style={{ maxWidth: '80px' }}
                      />

                      {/* Preço */}
                      <input
                        type="number"
                        min="0"
                        value={item.preco}
                        onChange={(e) =>
                          handleCategoryItemChange(catIndex, itemIndex, 'preco', parseFloat(e.target.value))
                        }
                        className="form-control me-2"
                        style={{ maxWidth: '80px' }}
                      />

                      {/* Total */}
                      <span className="ms-auto me-3">
                        Total: R${item.total?.toFixed(2) || '0.00'}
                      </span>

                      {/* Botão Excluir */}
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteItemInCategory(cat._id, item._id)}
                      >
                        Excluir
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Campo para adicionar novo item na categoria */}
                <div className="d-flex align-items-center mt-3">
                  <input
                    type="text"
                    placeholder="Novo item na categoria"
                    className="form-control me-2"
                    value={novoItemNaCategoria[cat._id] || ''}
                    onChange={(e) =>
                      setNovoItemNaCategoria((prev) => ({
                        ...prev,
                        [cat._id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => e.key === 'Enter' && addItemToCategory(cat._id)}
                  />
                  
                  <div className="col-auto">
                    <button 
                      className="btn btn-info w-100" 
                      onClick={() => addItemToCategory(cat._id)}
                    >
                      Adicionar Item
                    </button>
                  </div>  
                 
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ITENS SEM CATEGORIA (LISTAGEM) */}
      <section className="mb-4">
        <h4>Lista de Itens Sem Categoria</h4>
        <ul className="list-group">
          {filteredTopLevelItems.map((item, index) => (
            <li key={item._id} className="list-group-item d-flex align-items-center">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleChecked(index)}
                className="me-2"
              />

              <input
                type="text"
                placeholder="Nome do Produto"
                value={item.nome}
                onChange={(e) => handleInputChange(index, 'nome', e.target.value)}
                className="form-control me-2"
                style={{ maxWidth: '200px' }}
              />

              <input
                type="number"
                min="1"
                value={item.quantidade}
                onChange={(e) => handleInputChange(index, 'quantidade', parseInt(e.target.value))}
                className="form-control me-2"
                style={{ maxWidth: '80px' }}
              />

              <input
                type="number"
                min="0"
                value={item.preco}
                onChange={(e) => handleInputChange(index, 'preco', parseFloat(e.target.value))}
                className="form-control me-2"
                style={{ maxWidth: '80px' }}
              />

              <span className="ms-auto me-3">
                Total: R${item.total?.toFixed(2) || '0.00'}
              </span>

              <button
                className="btn btn-danger"
                onClick={() => deleteItem(item._id)}
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      </section>

      
      <h2 className="text-end">
        Valor Total: R${calculateTotal().toFixed(2)}
      </h2>
    </div>
  );
};

export default ListaDeCompras;