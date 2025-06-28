import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './navbar';
import Footer from './footer';
import './components.css';
import bookPlaceholder from '../assets/book_placeholder.jpeg';

export default function Livro() {
  const { id } = useParams();
  const [livro, setLivro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [comentarioEditado, setComentarioEditado] = useState('');
  const [favoritos, setFavoritos] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState({});
  const [editandoLivro, setEditandoLivro] = useState(false);

  useEffect(() => {
    const fetchLivro = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://127.0.0.1:8000/livros/${id}/`);
        setLivro(response.data);
      } catch (err) {
        console.error('Error fetching livro:', err);
        setError(err.message || 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLivro();
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar titulo={"Minha Biblioteca"} />
        <div className="container mt-5">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-2">Carregando livro...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !livro) {
    return (
      <>
        <Navbar titulo={"Minha Biblioteca"} />
        <div className="container mt-5">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Erro ao carregar livro!</h4>
            <p>{error || 'Livro não encontrado'}</p>
            <hr />
            <p className="mb-0">Verifique se o servidor da API está rodando</p>
          </div>
        </div>
      </>
    );
  }

  const adicionarComentario = () => {
    if (novoComentario.trim() === '') return;
    const novo = { id: Date.now(), texto: novoComentario };
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

  const alterarStatusLeitura = (status) => {
    setLivro({ ...livro, lendo: status === 'lendo', lido: status === 'lido' });
  };

  const handleEditarLivroChange = (e) => {
    const { name, value } = e.target;
    setLivro({ ...livro, [name]: value });
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
                src={livro.url_img || bookPlaceholder} 
                alt={livro.titulo} 
                className="img-fluid rounded"
                onError={(e) => {
                  e.target.src = bookPlaceholder;
                }}
              />
            </div>
            <div className="col-md-8 book-details my-5">
              <h2 className='mt-4'>{livro.titulo}</h2>
              <h4 className="text-muted">por {livro.autor}</h4>

              {/* Botões de status de leitura */}
              <div className="mt-3">
                <h5>Status de leitura:</h5>
                <div className="btn-group" role="group">
                  <button className={`btn ${livro.lendo ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => alterarStatusLeitura('lendo')}>
                    📖 Lendo agora
                  </button>
                  <button className={`btn ${livro.lido ? 'btn-success' : 'btn-outline-success'}`} onClick={() => alterarStatusLeitura('lido')}>
                    ✅ Já li
                  </button>
                  <button className={`btn ${!livro.lendo && !livro.lido ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={() => alterarStatusLeitura('nenhum')}>
                    ❌ Ainda não li
                  </button>
                </div>
              </div>

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

              {/* Botão para editar livro */}
              <div className="mt-4">
                <button className="btn btn-outline-success" onClick={() => setEditandoLivro(!editandoLivro)}>
                  {editandoLivro ? 'Fechar edição' : '✏️ Editar livro'}
                </button>
              </div>

              {/* Formulário de edição */}
              {editandoLivro && (
                <div className="mt-3 border rounded p-3 bg-white bg-body-tertiary-2">
                  <h5>Editar informações do livro:</h5>
                  <div className="mb-2">
                    <label className="form-label">Título</label>
                    <input type="text" name="titulo" value={livro.titulo} onChange={handleEditarLivroChange} className="form-control" />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Autor</label>
                    <input type="text" name="autor" value={livro.autor} onChange={handleEditarLivroChange} className="form-control" />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Descrição</label>
                    <textarea name="descricao" value={livro.descricao || ''} onChange={handleEditarLivroChange} className="form-control" rows="3" />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">URL da imagem</label>
                    <input type="text" name="url_img" value={livro.url_img || ''} onChange={handleEditarLivroChange} className="form-control" />
                  </div>
                </div>
              )}

              {/* Sinopse */}
              <div className='mt-5 mb-2 p-3 sinopse-card'>
                <h3>Sinopse</h3>
                <p>{livro.descricao || 'Sinopse não disponível'}</p>
              </div>

              {/* Comentários */}
              <div className='mt-5 mb-2 p-3 sinopse-card'>
                <h3>Comentários</h3>
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
                          <button className="btn btn-success btn-sm me-2" onClick={salvarEdicao}>Salvar</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditandoId(null)}>Cancelar</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p>{comentario.texto}</p>
                        <div>
                          <button className="btn btn-outline-primary btn-sm me-2" onClick={() => iniciarEdicao(comentario.id, comentario.texto)}>Editar</button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => excluirComentario(comentario.id)}>Excluir</button>
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