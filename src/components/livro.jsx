import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './navbar';
import Footer from './footer';
import './components.css';
import bookPlaceholder from '../assets/book_placeholder.jpeg';
import { useAuth } from '../context/AuthContext';

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
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const { user, logout } = useAuth();

  const fetchUserRating = async (userId, livroId) => {
    try {
      const API_BASE_URL = 'http://127.0.0.1:8000';
      const apiClient = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: false,
      });
      
      const response = await apiClient.get(`/usuarios/${userId}/livros/${livroId}/avaliacao/`);
      const userRating = response.data.nota;
      setAvaliacoes(prev => ({ ...prev, [livroId]: userRating }));
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setAvaliacoes(prev => ({ ...prev, [livroId]: 0 }));
      } else {
        console.error('Error fetching user rating:', err);
      }
    }
  };

  useEffect(() => {
    const fetchLivro = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://127.0.0.1:8000/livros/${id}/`);
        setLivro(response.data);
        
        if (user && user.id) {
          await fetchUserRating(user.id, response.data.id);
        }
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
  }, [id, user]);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 9000);
      const clearTimer = setTimeout(() => {
        setSuccess('');
      }, 10000);
      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [success]);

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

  async function definirAvaliacao(estrelas) {
    try {
      const avaliacao = {
        nota: estrelas,
        comentario: "Ótimo livro!"
      };  

      const API_BASE_URL = 'http://127.0.0.1:8000';
      const apiClient = axios.create({
          baseURL: API_BASE_URL,
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
          },
          withCredentials: false,
      });

      const user_id = user.id
      const livro_id = livro.id.toString();
      const response = await apiClient.post(`/usuarios/${user_id}/livros/${livro_id}/avaliar/`, avaliacao);   
      setSuccess(`Livro "${livro.titulo}" avaliado com sucesso!`);
      setAvaliacoes(prev => ({ ...prev, [livro.id]: estrelas }));
    } catch (err) {
      console.error('Erro ao avaliar livro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const alterarStatusLeitura = (status) => {
    setLivro({ ...livro, lendo: status === 'lendo', lido: status === 'lido' });
  };

  const estrelas = [1, 2, 3, 4, 5];

  function handleImagemChange(e) {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setSelectedImage(file);
    } else {
      setPreview(null);
      setSelectedImage(null);
    }
  }

  async function handleEditarLivroChange() {
    if (!livro.titulo.trim() || !livro.autor.trim()) {
      setError('Título e autor são obrigatórios');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      let url_img_final = '';
      const oldImageUrl = livro.url_img;

      // Fazendo o upload da nova imagem de capa, se for adicionada uma
      if (selectedImage && selectedImage instanceof File) {
        const uploadData = new FormData();
        uploadData.append('file', selectedImage);
        const uploadResp = await axios.post('http://127.0.0.1:8000/upload/imagem_livro/', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        url_img_final = `http://127.0.0.1:8000${uploadResp.data.url_img}`;
        
        // Deletar a imagem antiga, se não for a placeholder
        if (oldImageUrl && oldImageUrl !== bookPlaceholder && !oldImageUrl.includes('book_placeholder')) {
          await axios.delete(`http://127.0.0.1:8000/upload/imagem_livro/?url_img=${encodeURIComponent(oldImageUrl)}`);
        }
      } else if (livro.url_img && typeof livro.url_img === 'string') {
        url_img_final = livro.url_img;
      }

      const livroData = {
        titulo: livro.titulo.trim(),
        autor_nome: livro.autor.trim(),
        descricao: livro.descricao.trim()
      };

      if (url_img_final) {
        livroData.url_img = url_img_final;
      }

      const API_BASE_URL = 'http://127.0.0.1:8000';
      const apiClient = axios.create({
          baseURL: API_BASE_URL,
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
          },
          withCredentials: false,
      });
      const response = await apiClient.put(`/livros/${livro.id}/`, livroData);   
      setSuccess(`Livro "${livro.titulo}" editado com sucesso!`);
      
      if (url_img_final) {
        setLivro(prev => ({ ...prev, url_img: url_img_final }));
      }

      setPreview(null);
      setSelectedImage(null);
    } catch (err) {
      console.error('Erro ao editar livro:', err);
      setError('Erro ao editar livro.');
    } finally {
      setIsLoading(false);
    }
  }

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
                <button className="btn btn-outline-secondary" onClick={() => {
                  setEditandoLivro(!editandoLivro);
                  if (editandoLivro) {
                    // Reset form when closing
                    setPreview(null);
                    setSelectedImage(null);
                    setError('');
                  }
                }}>
                  {editandoLivro ? 'Fechar edição' : '✏️ Editar livro'}
                </button>
              </div>

              {/* Formulário de edição */}
              {editandoLivro && (
                <div className="mt-3 border rounded p-3 bg-white bg-body-tertiary-2">
                  <h5>Editar informações do livro:</h5>
                  <div className="mb-2">
                    <label className="form-label">Título</label>
                    <input type="text" name="titulo" value={livro.titulo} className="form-control" onChange={e => setLivro({ ...livro, titulo: e.target.value })} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Autor</label>
                    <input type="text" name="autor" value={livro.autor} className="form-control" onChange={e => setLivro({ ...livro, autor: e.target.value })} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Descrição</label>
                    <textarea name="descricao" value={livro.descricao || ''} className="form-control" rows="3" onChange={e => setLivro({ ...livro, descricao: e.target.value })} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Imagem da Capa</label>
                    <input 
                      type="file" 
                      className="form-control" 
                      id="imagemLivro" 
                      accept="image/*" 
                      onChange={handleImagemChange}
                    />
                  </div>
                  
                  {preview && (
                    <div className="text-center mb-3">
                      <img src={preview} alt="Prévia" className="img-fluid rounded" style={{ maxHeight: '200px' }} />
                    </div>
                  )}
                    <div>
                       <button className="btn btn-success" onClick={handleEditarLivroChange} disabled={isLoading}>
                        Salvar edição
                      </button>
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Adicionando...
                        </>
                      ) : <></>}
                      {error && (
                        <div className={`alert alert-danger fade-anim${showSuccess ? ' show' : ' hide'} mt-3`} role="alert">
                          {error}
                        </div>
                      )}
                      
                      {success && (
                        <div className={`alert alert-success fade-anim${showSuccess ? ' show' : ' hide'} mt-3`} role="alert">
                          {success}
                        </div>
                      )}
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