import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
//uepa
export default function Estante() {
  const { colecaoId } = useParams();
  const [estante, setEstante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEstanteData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId || !colecaoId) {
        setError("ID do usuário ou da coleção não encontrado.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Seu endpoint para ler uma coleção específica precisa do user_id e do colecao_id
        const response = await apiClient.get(`/colecoes/${colecaoId}?user_id=${userId}`);
        setEstante(response.data);
      } catch (err) {
        console.error('Erro ao buscar dados da estante:', err);
        setError(err.response?.data?.detail || 'Erro ao carregar estante.');
      } finally {
        setLoading(false);
      }
    };

    fetchEstanteData();
  }, [colecaoId]);

  if (loading) {
    return (
      <>
        <Navbar titulo="Carregando..." />
        <div className="container mt-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </>
    );
  }

  if (error || !estante) {
    return (
      <>
        <Navbar titulo="Erro" />
        <div className="container mt-5">
          <div className="alert alert-danger">
            <h4 className="alert-heading">Não foi possível carregar a estante</h4>
            <p>{error || 'Estante não encontrada.'}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-body-tertiary">
      <Navbar titulo={estante.nome} />
      <div className="container py-4 mt-5">
        <h1 className="mb-4">{estante.nome}</h1>
        <p>Veja os livros que você adicionou a esta estante.</p>
        
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-3">
          {estante.livros && estante.livros.length > 0 ? (
            estante.livros.filter(livro => livro.id).map((livro) => (
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
                      <p className="card-text text-muted">{livro.autor || "Autor desconhecido"}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-12">
              <p className="text-muted">Ainda não há livros nesta estante.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
