import { useEffect, useState } from 'react';
import axios from 'axios';
import bookPlaceholder from '../assets/book_placeholder.jpeg';

export default function Descobrir() {
  const [recomendacoes, setRecomendacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecomendacoes = async () => {
      try {
        setLoading(true);
        setError(null);
        const user_id = localStorage.getItem('userId');
        if (!user_id) {
          setError('Usuário não autenticado. Faça login para ver recomendações.');
          setLoading(false);
          return;
        }
        const response = await axios.get(`http://127.0.0.1:8000/usuarios/${user_id}/recomendacoes`);
        setRecomendacoes(response.data.recomendacoes || []);
      } catch (err) {
        setError('Erro ao buscar recomendações.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecomendacoes();
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100 bg-body-tertiary">
      <div className="container py-4 mt-5">
        <h1 className="mb-4">Descobrir</h1>
        <p>Explore novos livros, autores e categorias.</p>
        {loading && (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-2">Carregando recomendações...</p>
          </div>
        )}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        {!loading && !error && (
          <div>
            <h2 className="mt-4">Recomendações para você</h2>
            {recomendacoes.length === 0 ? (
              <p>Nenhuma recomendação encontrada.</p>
            ) : (
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-3 pb-5">
                {recomendacoes.map((livro, index) => (
                  <div className="col" key={livro.id || index}>
                    <div className="card h-100 d-flex flex-column book-card">
                      <img
                        src={bookPlaceholder}
                        className="card-img-top"
                        alt={`Capa de ${livro.titulo}`}
                      />
                      <div className="card-body d-flex flex-column justify-content-end">
                        <h5 className="card-title mt-auto">{livro.titulo}</h5>
                        <p className="card-text text-muted">{livro.autor || 'Autor desconhecido'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
  