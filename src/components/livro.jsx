import { useParams, useNavigate } from 'react-router-dom';
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

export default function Livro() {
  const { id: livroId } = useParams();
  const navigate = useNavigate();
  const [livro, setLivro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para funcionalidades
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [comentarioEditado, setComentarioEditado] = useState('');
  const [favoritos, setFavoritos] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState({});
  const [editandoLivro, setEditandoLivro] = useState(false);
  const [estantes, setEstantes] = useState([]);
  const [loadingEstantes, setLoadingEstantes] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  useEffect(() => {
    const fetchData = async () => {
      if (!livroId) return;
      setLoading(true);
      setError(null);
      try {
        const livroResponse = await apiClient.get(`/livros/${livroId}/`);
        const livroData = livroResponse.data;
        const userId = localStorage.getItem('userId');
        let interactionStatus = { lendo: false, lido: false };
        if (userId) {
          try {
            const interactionResponse = await apiClient.get(`/usuarios/${userId}/livros/${livroId}/interacao`);
            const status = interactionResponse.data?.status;
            if (status) {
              interactionStatus = { lendo: status === 'LENDO', lido: status === 'LIDO' };
            }
          } catch (interactionError) {
            if (interactionError.response?.status !== 404) {
              console.error('Erro ao buscar status de interação:', interactionError);
            }
          }
        }
        setLivro({ ...livroData, ...interactionStatus });
        fetchEstantes();
      } catch (err) {
        console.error('Error fetching livro:', err);
        setError(err.message || 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    const fetchEstantes = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        setLoadingEstantes(true);
        try {
            const response = await apiClient.get(`/usuarios/${userId}/colecoes/`);
            setEstantes(response.data || []);
        } catch (err) {
            console.error("Erro ao buscar estantes:", err);
        } finally {
            setLoadingEstantes(false);
        }
    };

    fetchData();
  }, [livroId]);
  
  // --- Funções de Interação com API ---

  const handleDeletarLivro = async () => {
    if (window.confirm(`Tem certeza que deseja deletar "${livro.titulo}"? Esta ação não pode ser desfeita.`)) {
        setFeedback({ message: '', type: '' });
        try {
            await apiClient.delete(`/livros/${livroId}`);
            alert('Livro deletado com sucesso!');
            navigate('/livros');
        } catch (err) {
            console.error("Erro ao deletar livro:", err);
            setFeedback({ message: 'Falha ao deletar o livro. Tente novamente.', type: 'danger' });
            setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
        }
    }
  };

  const handleStatusChange = async (status) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        setFeedback({ message: 'Você precisa estar logado para alterar o status.', type: 'warning' });
        return;
    }
    const backendStatusMap = { 'lendo': 'LENDO', 'lido': 'LIDO', 'nenhum': 'NOVO' };
    const backendStatus = backendStatusMap[status];
    setFeedback({ message: '', type: '' });
    try {
        await apiClient.post(`/usuarios/${userId}/livros/${livroId}/interacao`, { status: backendStatus });
        setLivro(prevLivro => ({ ...prevLivro, lendo: status === 'lendo', lido: status === 'lido' }));
        setFeedback({ message: `Status do livro atualizado!`, type: 'success' });
    } catch (err) {
        console.error("Erro ao atualizar status do livro:", err);
        setFeedback({ message: 'Falha ao atualizar o status. Tente novamente.', type: 'danger' });
    } finally {
        setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
    }
  };

  const adicionarLivroNaEstante = async (colecaoId) => {
    setFeedback({ message: '', type: '' });
    try {
        await apiClient.post(`/colecoes/${colecaoId}/livros/${livroId}`);
        setFeedback({ message: `Livro adicionado à estante com sucesso!`, type: 'success' });
    } catch (err) {
        console.error("Erro ao adicionar livro na estante:", err);
        setFeedback({ message: 'Falha ao adicionar o livro. Tente novamente.', type: 'danger' });
    } finally {
        setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
    }
  };
  
  // --- Funções Locais com Lógica Restaurada ---
  const adicionarComentario = () => {
    if (novoComentario.trim() === '') return;
    const novo = { id: Date.now(), texto: novoComentario };
    setComentarios([...comentarios, novo]);
    setNovoComentario('');
  };

  const iniciarEdicao = (id, texto) => {
    setEditandoId(id);
    setComentarioEditado(texto);
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

  const handleEditarLivroChange = (e) => {
    const { name, value } = e.target;
    setLivro({ ...livro, [name]: value });
  };

  if (loading) {
    return (
      <>
        <Navbar titulo={"Minha Biblioteca"} />
        <div className="container mt-5 text-center"><div className="spinner-border" role="status"><span className="visually-hidden">Carregando...</span></div><p className="mt-2">Carregando livro...</p></div>
      </>
    );
  }

  if (error || !livro) {
    return (
      <>
        <Navbar titulo={"Minha Biblioteca"} />
        <div className="container mt-5"><div className="alert alert-danger" role="alert"><h4 className="alert-heading">Erro ao carregar livro!</h4><p>{error || 'Livro não encontrado'}</p></div></div>
      </>
    );
  }

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
                onError={(e) => { e.target.src = bookPlaceholder; }}
              />
            </div>
            <div className="col-md-8 book-details my-5">
              <h2 className='mt-4'>{livro.titulo}</h2>
              <h4 className="text-muted">por {livro.autor}</h4>

              <div className="mt-3">
                <h5>Status de leitura:</h5>
                <div className="btn-group" role="group">
                  <button className={`btn ${livro.lendo ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => handleStatusChange('lendo')}>📖 Lendo agora</button>
                  <button className={`btn ${livro.lido ? 'btn-success' : 'btn-outline-success'}`} onClick={() => handleStatusChange('lido')}>✅ Já li</button>
                  <button className={`btn ${!livro.lendo && !livro.lido ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={() => handleStatusChange('nenhum')}>❌ Ainda não li</button>
                </div>
              </div>
              
              <div className="d-flex flex-wrap align-items-center mt-3">
                <div className="dropdown me-2 mb-2">
                    <button className="btn btn-outline-primary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                        <i className="bi bi-plus-lg me-2"></i> Adicionar à Estante
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                        {loadingEstantes ? (
                        <li><span className="dropdown-item text-muted">Carregando...</span></li>
                        ) : (
                        estantes.length > 0 ? (
                            estantes.map(estante => (
                            <li key={estante.id}>
                                <button className="dropdown-item" onClick={() => adicionarLivroNaEstante(estante.id)}>{estante.nome}</button>
                            </li>
                            ))
                        ) : (
                            <li><span className="dropdown-item text-muted">Nenhuma estante encontrada.</span></li>
                        )
                        )}
                    </ul>
                </div>
                <button className={`btn mb-2 ${favoritos.includes(livro.id) ? 'btn-danger' : 'btn-outline-danger'}`} onClick={alternarFavorito}>
                    {favoritos.includes(livro.id) ? 'Remover dos Favoritos ❤️' : 'Adicionar aos Favoritos 🤍'}
                </button>
              </div>

              {feedback.message && (<div className={`alert alert-${feedback.type} mt-2`}>{feedback.message}</div>)}

              <div className="mt-3">
                <h5 className="mb-2">Sua avaliação:</h5>
                {estrelas.map(estrela => (
                  <span key={estrela} onClick={() => definirAvaliacao(estrela)} style={{ cursor: 'pointer', fontSize: '1.8rem', color: estrela <= (avaliacoes[livro.id] || 0) ? '#FFD700' : '#ccc' }}>★</span>
                ))}
              </div>

              <div className="mt-4">
                <button className="btn btn-outline-success me-2" onClick={() => setEditandoLivro(!editandoLivro)}>{editandoLivro ? 'Fechar edição' : '✏️ Editar livro'}</button>
                <button className="btn btn-outline-danger" onClick={handleDeletarLivro}>🗑️ Deletar livro</button>
              </div>

              {editandoLivro && (
                <div className="mt-3 border rounded p-3 bg-white bg-body-tertiary-2">
                  <h5>Editar informações do livro:</h5>
                  <div className="mb-2"><label className="form-label">Título</label><input type="text" name="titulo" value={livro.titulo} onChange={handleEditarLivroChange} className="form-control" /></div>
                  <div className="mb-2"><label className="form-label">Autor</label><input type="text" name="autor" value={livro.autor} onChange={handleEditarLivroChange} className="form-control" /></div>
                  <div className="mb-2"><label className="form-label">Descrição</label><textarea name="descricao" value={livro.descricao || ''} onChange={handleEditarLivroChange} className="form-control" rows="3" /></div>
                  <div className="mb-2"><label className="form-label">URL da imagem</label><input type="text" name="url_img" value={livro.url_img || ''} onChange={handleEditarLivroChange} className="form-control" /></div>
                </div>
              )}

              <div className='mt-5 mb-2 p-3 sinopse-card'>
                <h3>Sinopse</h3>
                <p>{livro.descricao || 'Sinopse não disponível'}</p>
              </div>

              <div className='mt-5 mb-2 p-3 sinopse-card'>
                <h3>Comentários</h3>
                <textarea className="form-control" rows="3" placeholder="Escreva seu comentário aqui..." value={novoComentario} onChange={(e) => setNovoComentario(e.target.value)}></textarea>
                <button className="btn botao mt-3" onClick={adicionarComentario}>Enviar</button>
                {comentarios.map((comentario) => (
                  <div key={comentario.id} className="mt-4 p-3 border rounded bg-light">
                    {editandoId === comentario.id ? (
                      <>
                        <textarea className="form-control" rows="3" value={comentarioEditado} onChange={(e) => setComentarioEditado(e.target.value)}></textarea>
                        <div className="mt-2"><button className="btn btn-success btn-sm me-2" onClick={salvarEdicao}>Salvar</button><button className="btn btn-secondary btn-sm" onClick={() => setEditandoId(null)}>Cancelar</button></div>
                      </>
                    ) : (
                      <>
                        <p>{comentario.texto}</p>
                        <div><button className="btn btn-outline-primary btn-sm me-2" onClick={() => iniciarEdicao(comentario.id, comentario.texto)}>Editar</button><button className="btn btn-outline-danger btn-sm" onClick={() => excluirComentario(comentario.id)}>Excluir</button></div>
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
