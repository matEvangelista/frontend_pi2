import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import bookPlaceholder from '../assets/book_placeholder.jpeg';

// Helper function to get the correct image URL
const getImageUrl = (urlImg) => {
  if (!urlImg) return bookPlaceholder;
  if (urlImg.startsWith('/static/')) {
    return `http://127.0.0.1:8000${urlImg}`;
  }
  return urlImg;
};

export default function Livros() {
  const [livros, setLivros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLivros = async () => {
      try {
        setLoading(true);
        const  user_id  = localStorage.getItem('userId');
        const response = await axios.get(`http://127.0.0.1:8000/usuarios/${user_id}/livros/registrados`);
        setLivros(response.data);
      } catch (err) {
        console.error('Error fetching livros:', err);
        setError(err.message || 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchLivros();
  }, []);

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-body-tertiary">
        <div className="container py-4 mt-5">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-2">Carregando livros...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-body-tertiary">
        <div className="container py-4 mt-5">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Erro ao carregar livros!</h4>
            <p>{error}</p>
            <hr />
            <p className="mb-0">Verifique se o servidor da API está rodando</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-body-tertiary">
      <div className="container py-4 mt-5">
        <h1 className="mb-4">Minha Biblioteca</h1>
        <p>Visualize, edite e gerencie todos os seus livros aqui.</p>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-3">
          {livros.map((livro, index) => (
            <div className="col" key={livro.id || index}>
              <Link to={`/livros/${livro.id}`} className="text-decoration-none text-dark">
                <div className="card h-100 d-flex flex-column book-card">
                  <img 
                    src={getImageUrl(livro.url_img)} 
                    className="card-img-top" 
                    alt={`Capa de ${livro.titulo}`} 
                    onError={(e) => {
                      e.target.src = bookPlaceholder;
                    }}
                  />
                  <div className="card-body d-flex flex-column justify-content-end">
                    <h5 className="card-title mt-auto">{livro.titulo}</h5>
                    <p className="card-text text-muted">{livro.autor || 'Autor desconhecido'}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
