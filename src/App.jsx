// App.js
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Importe seus estilos e bibliotecas
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// Importe seus componentes
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
import Estante from './components/Estante';
import ErrorPage from './components/ErrorPage';
import { AuthProvider, useAuth } from './context/AuthContext';

// Componente para proteger rotas que exigem login
function PrivateRoute({ children }) {
  const { user } = useAuth();
  // Se o usuário não estiver logado, redireciona para a página de login
  return user ? children : <Navigate to="/login" replace />;
}

// Componente principal que define o layout e as rotas
function App() {
  const location = useLocation();

  // Rotas que não usam o layout principal (Sidebar + Navbar)
  if (location.pathname === '/login') {
    return <Authentication />;
  }
  if (location.pathname === '/register') {
    return <Register />;
  }

  // Layout principal para todas as outras rotas
  return (
    <div className="app-layout d-flex">
      <Sidebar />
      <div className="main-content flex-grow-1">
        <Navbar titulo="Minha Biblioteca" />
        {/* CORREÇÃO: Removi a classe "content-area" para evitar conflitos de layout */}
        <div className="">
          <Routes>
            {/* Rotas protegidas */}
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/livros/:id" element={<PrivateRoute><Livro /></PrivateRoute>} />
            <Route path="/livros" element={<PrivateRoute><Livros /></PrivateRoute>} />
            <Route path="/descobrir" element={<PrivateRoute><Descobrir /></PrivateRoute>} />
            <Route path="/lendo-agora" element={<PrivateRoute><LendoAgora /></PrivateRoute>} />
            <Route path='/lidos' element={<PrivateRoute><Lidos /></PrivateRoute>} />
            
            {/* Rota para a página da estante */}
            <Route path='/estante/:colecaoId' element={<PrivateRoute><Estante /></PrivateRoute>} />

            {/* ROTA DE ERRO: Pega qualquer outra rota não definida */}
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

// Wrapper que fornece o BrowserRouter e o Contexto de Autenticação para a aplicação
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
