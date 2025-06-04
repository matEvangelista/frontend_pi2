import { Link } from 'react-router-dom';
import livros from '../data/livros.json';

export default function Lidos() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-body-tertiary">
      <div className="container py-4 mt-5">
        <h1 className="mb-4">Lidos</h1>
        <p>Veja os livros que você já concluiu a leitura.</p>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-3">
          {livros.filter(livro => livro.lido).map((livro, index) => (
            <div className="col" key={index}>
              <Link to={`/livros/${livro.id}`} className="text-decoration-none text-dark">
                <div className="card h-100 d-flex flex-column book-card">
                  <img src={livro.capa} className="card-img-top" alt={`Capa de ${livro.titulo}`} />
                  <div className="card-body d-flex flex-column justify-content-end">
                    <h5 className="card-title mt-auto">{livro.titulo}</h5>
                    <p className="card-text text-muted">{livro.autor}</p>
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
