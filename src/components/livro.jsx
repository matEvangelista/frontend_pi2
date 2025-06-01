import { useParams } from 'react-router-dom';
import { useState } from 'react';
import livros from '../data/livros.json';
import Navbar from './navbar';
import Footer from './footer';
import './components.css';

export default function Livro() {
  const { id } = useParams();
  const livro = livros.find(l => l.id === parseInt(id));

  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [comentarioEditado, setComentarioEditado] = useState('');

  const [favoritos, setFavoritos] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState({}); // { [id]: numero }

  if (!livro) {
    return (
      <>
        <Navbar titulo={"Minha Biblioteca"} />
        <div className="container mt-5">
          <h2 className="text-danger">Livro não encontrado</h2>
        </div>
      </>
    );
  }

  const adicionarComentario = () => {
    if (novoComentario.trim() === '') return;
    const novo = {
      id: Date.now(),
      texto: novoComentario
    };
    setComentarios([...comentarios, novo]);
    setNovoComentario('');
  };

  const iniciarEdicao = (id, textoAtual) => {
    setEditandoId(id);
    setComentarioEditado(textoAtual);
  };

  const salvarEdicao = () => {
    setComentarios(comentarios.map(c =>
      c.id === editandoId ? { ...c, texto: comentarioEditado } : c
    ));
    setEditandoId(null);
    setComentarioEditado('');
  };

  const excluirComentario = (id) => {
    setComentarios(comentarios.filter(c => c.id !== id));
  };

  const alternarFavorito = () => {
    if (favoritos.includes(livro.id)) {
      setFavoritos(favoritos.filter(favId => favId !== livro.id));
    } else {
      setFavoritos([...favoritos, livro.id]);
    }
  };

  const definirAvaliacao = (estrelas) => {
    setAvaliacoes({ ...avaliacoes, [livro.id]: estrelas });
  };

  const estrelas = [1, 2, 3, 4, 5];

  return (
    <>
      <Navbar titulo={"Minha Biblioteca"} />
      <div className='bg-body-tertiary'>
        <div className="container">
          <div className="row py-5 min-vh-100">
            <div className="col-lg-4 my-auto">
              <img
                src={livro.capa}
                alt={livro.titulo}
                className="img-fluid rounded"
              />
            </div>
            <div className="col-md-8 book-details my-5">
              <h2 className='mt-4'>{livro.titulo}</h2>
              <h4 className="text-muted">por {livro.autor}</h4>

              {/* Botão de favorito */}
              <button
                className={`btn mt-3 ${favoritos.includes(livro.id) ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={alternarFavorito}
              >
                {favoritos.includes(livro.id) ? 'Remover dos Favoritos ❤️' : 'Adicionar aos Favoritos 🤍'}
              </button>

              {/* Avaliação por estrelas */}
              <div className="mt-3">
                <h5 className="mb-2">Sua avaliação:</h5>
                {estrelas.map(estrela => (
                  <span
                    key={estrela}
                    onClick={() => definirAvaliacao(estrela)}
                    style={{
                      cursor: 'pointer',
                      fontSize: '1.8rem',
                      color: estrela <= (avaliacoes[livro.id] || 0) ? '#FFD700' : '#ccc'
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>

              <div className='mt-5 mb-2 p-3 sinopse-card'>
                <h3>Sinopse</h3>
                <p>{livro.descricao}</p>
              </div>

              <div className='mt-5 mb-2 p-3 sinopse-card'>
                <h3>Comentários</h3>

                {/* Caixa para novo comentário */}
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Escreva seu comentário aqui..."
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                ></textarea>
                <button className="btn botao mt-3" onClick={adicionarComentario}>
                  Enviar
                </button>

                {/* Lista de comentários */}
                {comentarios.map((comentario) => (
                  <div key={comentario.id} className="mt-4 p-3 border rounded bg-light">
                    {editandoId === comentario.id ? (
                      <>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={comentarioEditado}
                          onChange={(e) => setComentarioEditado(e.target.value)}
                        ></textarea>
                        <div className="mt-2">
                          <button className="btn btn-success btn-sm me-2" onClick={salvarEdicao}>
                            Salvar
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditandoId(null)}>
                            Cancelar
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p>{comentario.texto}</p>
                        <div>
                          <button
                            className="btn btn-outline-primary btn-sm me-2"
                            onClick={() => iniciarEdicao(comentario.id, comentario.texto)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => excluirComentario(comentario.id)}
                          >
                            Excluir
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
