// App.js
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './App.css';
import Home from './components/home';
import Livro from './components/livro';
import Sidebar from './components/sidebar';
import Navbar from './components/navbar';
import Livros from './components/livros';
import Descobrir from './components/descobrir';
import LendoAgora from './components/lendoAgora';
import Lidos from './components/Lidos';
import Authentication from './components/authentication';
import Register from './components/register';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorPage from './components/ErrorPage';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  const [count, setCount] = useState(0);
  const location = useLocation();

  if (location.pathname === '/login') {
    return <Authentication />;
  }
  if (location.pathname === '/register') {
    return <Register />;
  }
  if (location.pathname !== '/' &&
      location.pathname !== '/livros' &&
      !location.pathname.startsWith('/livros/') &&
      location.pathname !== '/descobrir' &&
      location.pathname !== '/lendo-agora' &&
      location.pathname !== '/lidos') {
    return <ErrorPage />;
  }

  return (
    <div className="app-layout d-flex">
      <Sidebar />
      <div className="main-content flex-grow-1">
        <Navbar titulo="Minha Biblioteca" />
        <div className="">
          <Routes>
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/livros/:id" element={<PrivateRoute><Livro /></PrivateRoute>} />
            <Route path="/livros" element={<PrivateRoute><Livros /></PrivateRoute>} />
            <Route path="/descobrir" element={<PrivateRoute><Descobrir /></PrivateRoute>} />
            <Route path="/lendo-agora" element={<PrivateRoute><LendoAgora /></PrivateRoute>} />
            <Route path='/lidos' element={<PrivateRoute><Lidos/></PrivateRoute>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppWrapper;
