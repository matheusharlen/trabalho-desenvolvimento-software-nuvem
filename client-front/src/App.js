import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import MinhasListas from './pages/MinhasListas';
import ListaDeCompras from './pages/ListaDeCompras';
import Perfil from './pages/Perfil';
import './App.css';

// Componente principal da aplicação
function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/listas" element={<MinhasListas />} />
          <Route path="/lista/:id" element={<ListaDeCompras />} />
          <Route path="/perfil" element={<Perfil/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
