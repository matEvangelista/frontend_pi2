import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './navbar';
import Footer from './footer';
import './components.css';
import bookPlaceholder from '../assets/book_placeholder.jpeg';

// Cliente Axios para reutilização
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

export default function Lidos() {
  const [livrosLidos, setLivrosLidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLidos = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError("Usuário não encontrado. Por favor, faça o login.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Busca na API os livros com status "LIDO"
        const response = await apiClient.get(`/usuarios/${userId}/livros/status/LIDO`);
        setLivrosLidos(response.data || []);
      } catch (err) {
        console.error("Erro ao buscar livros lidos:", err);
        setError("Não foi possível carregar os livros. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchLidos();
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100 bg-body-tertiary">
      <Navbar titulo="Lidos" />
      <div className="container py-4 mt-5">
        <h1 className="mb-4">Lidos</h1>
        <p>Veja os livros que você já concluiu a leitura.</p>
        
        {loading && <div className="text-center"><div className="spinner-border" /></div>}
        {error && <div className="alert alert-danger">{error}</div>}
        
        {!loading && !error && (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-3">
            {livrosLidos.length > 0 ? (
              livrosLidos.map((livro) => (
                <div className="col" key={livro.id}>
                  <Link to={`/livros/${livro.id}`} className="text-decoration-none text-dark">
                    <div className="card h-100 d-flex flex-column book-card">
                      <img 
                        src={livro.url_img || bookPlaceholder} 
                        className="card-img-top" 
                        alt={`Capa de ${livro.titulo}`}
                        onError={(e) => { e.target.src = bookPlaceholder; }}
                      />
                      <div className="card-body d-flex flex-column justify-content-end">
                        <h5 className="card-title mt-auto">{livro.titulo}</h5>
                        <p className="card-text text-muted">{livro.autor}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-muted">Você ainda não marcou nenhum livro como lido.</p>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
