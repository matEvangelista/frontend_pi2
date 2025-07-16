import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from './navbar';
import Footer from './footer';
import './components.css';

const BOOK_PLACEHOLDER_URL = 'https://placehold.co/300x450/f0f0f0/666?text=Capa';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default function Livro() {
  const { id: livroId } = useParams();
  const navigate = useNavigate();
  const [livro, setLivro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorito, setIsFavorito] = useState(false);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [comentarioEditado, setComentarioEditado] = useState('');
  const [avaliacoes, setAvaliacoes] = useState({});
  const [editandoLivro, setEditandoLivro] = useState(false);
  const [estantes, setEstantes] = useState([]);
  const [loadingEstantes, setLoadingEstantes] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [livroNaEstante, setLivroNaEstante] = useState(null);
  const loggedInUserId = parseInt(localStorage.getItem('userId'), 10);

  const fetchData = useCallback(async () => {
    if (!livroId) return;
    setLoading(true);
    setError(null);
    try {
      const userId = localStorage.getItem('userId');

      const requestLivro = apiClient.get(`/livros/${livroId}`);
      const requestComentarios = apiClient.get(`/livros/${livroId}/comentarios`);
      const requestInteracao = userId ? apiClient.get(`/usuarios/${userId}/livros/${livroId}/interacao`) : Promise.resolve(null);
      const requestFavoritos = userId ? apiClient.get(`/usuarios/${userId}/favoritos`) : Promise.resolve(null);
      const requestEstantes = userId ? apiClient.get(`/usuarios/${userId}/colecoes/`) : Promise.resolve(null);

      const [
        responseLivro,
        responseComentarios,
        responseInteracao,
        responseFavoritos,
        responseEstantes,
      ] = await Promise.allSettled([
        requestLivro,
        requestComentarios,
        requestInteracao,
        requestFavoritos,
        requestEstantes,
      ]);

      if (responseLivro.status === 'fulfilled') {
        let livroData = responseLivro.value.data;
        if (responseInteracao.status === 'fulfilled' && responseInteracao.value) {
            const status = responseInteracao.value.data?.status;
            livroData.lendo = status === 'LENDO';
            livroData.lido = status === 'LIDO';
        }
        setLivro(livroData);
      } else {
        throw new Error("Não foi possível carregar os detalhes do livro.");
      }

      if (responseComentarios.status === 'fulfilled') {
        setComentarios(responseComentarios.value.data);
      }

      if (responseFavoritos.status === 'fulfilled' && responseFavoritos.value) {
        const isFav = responseFavoritos.value.data.some(fav => fav.id === parseInt(livroId));
        setIsFavorito(isFav);
      }

      if (responseEstantes.status === 'fulfilled' && responseEstantes.value) {
        const estantesData = responseEstantes.value.data || [];
        setEstantes(estantesData);
        const estanteComLivro = estantesData.find(estante => estante.livros.some(l => l.id === parseInt(livroId)));
        setLivroNaEstante(estanteComLivro ? estanteComLivro.id : null);
      }

      // Buscar avaliação prévia do usuário
      try {
        const avaliacaoResponse = await apiClient.get(`/usuarios/${userId}/livros/${livroId}/avaliacao`);
        if (avaliacaoResponse.data && typeof avaliacaoResponse.data.nota === 'number') {
          setAvaliacoes(prev => ({ ...prev, [livroId]: avaliacaoResponse.data.nota }));
        }
      } catch (avaliacaoError) {
        if (avaliacaoError.response?.status !== 404) {
          console.error('Erro ao buscar avaliação:', avaliacaoError);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar dados da página do livro:', err);
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [livroId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const adicionarComentario = async () => {
    if (!novoComentario.trim() || !loggedInUserId) {
        alert("Você precisa estar logado e digitar um comentário para enviar.");
        return;
    }
    try {
        const response = await apiClient.post(`/usuarios/${loggedInUserId}/livros/${livroId}/comentarios`, { texto: novoComentario });
        setComentarios([response.data, ...comentarios]);
        setNovoComentario('');
    } catch (error) {
        console.error("Erro ao adicionar comentário:", error);
        alert("Falha ao adicionar comentário. Verifique se você está logado e tente novamente.");
    }
  };

  const salvarEdicao = async () => {
    if (!comentarioEditado.trim() || !editandoId || !loggedInUserId) return;
    try {
      const response = await apiClient.put(`/usuarios/${loggedInUserId}/comentarios/${editandoId}`, {
        texto: comentarioEditado,
      });
      setComentarios(comentarios.map(c => c.id === editandoId ? response.data : c));
      setEditandoId(null);
      setComentarioEditado('');
    } catch (error) {
      console.error("Erro ao editar comentário:", error);
      alert("Falha ao editar comentário.");
    }
  };

  const excluirComentario = async (comentarioId) => {
    if (!loggedInUserId) return;
    if (window.confirm("Tem certeza que deseja excluir este comentário?")) {
        try {
            await apiClient.delete(`/usuarios/${loggedInUserId}/comentarios/${comentarioId}`);
            setComentarios(comentarios.filter(c => c.id !== comentarioId));
        } catch (error) {
            console.error("Erro ao excluir comentário:", error);
            alert("Falha ao excluir comentário.");
        }
    }
  };

  const alternarFavorito = async () => {
    if (!loggedInUserId) {
        setFeedback({ message: 'Você precisa estar logado para favoritar livros.', type: 'warning' });
        setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
        return;
    }
    const endpoint = `/usuarios/${loggedInUserId}/livros/${livroId}/favoritar`;
    try {
        if (isFavorito) {
            await apiClient.delete(endpoint);
            setIsFavorito(false);
            setFeedback({ message: 'Livro removido dos favoritos.', type: 'info' });
        } else {
            await apiClient.post(endpoint);
            setIsFavorito(true);
            setFeedback({ message: 'Livro adicionado aos favoritos!', type: 'success' });
        }
    } catch (err) {
        console.error("Erro ao alterar status de favorito:", err);
        setFeedback({ message: 'Falha ao atualizar favoritos.', type: 'danger' });
    } finally {
        setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
    }
  };

  const handleDeletarLivro = async () => {
    if (window.confirm(`Tem certeza que deseja deletar "${livro.titulo}"? Esta ação não pode ser desfeita.`)) {
        try {
            await apiClient.delete(`/livros/${livroId}`);
            alert('Livro deletado com sucesso!');
            navigate('/livros');
        } catch (err) {
            console.error("Erro ao deletar livro:", err);
            setFeedback({ message: 'Falha ao deletar o livro.', type: 'danger' });
        }
    }
  };

  const handleStatusChange = async (status) => {
    if (!loggedInUserId) {
        setFeedback({ message: 'Você precisa estar logado para alterar o status.', type: 'warning' });
        return;
    }
    const backendStatusMap = { 'lendo': 'LENDO', 'lido': 'LIDO', 'nenhum': 'NOVO' };
    const backendStatus = backendStatusMap[status];
    try {
        await apiClient.post(`/usuarios/${loggedInUserId}/livros/${livroId}/interacao`, { status: backendStatus });
        setLivro(prevLivro => ({ ...prevLivro, lendo: status === 'lendo', lido: status === 'lido' }));
        setFeedback({ message: `Status do livro atualizado!`, type: 'success' });
    } catch (err) {
        console.error("Erro ao atualizar status do livro:", err);
        setFeedback({ message: 'Falha ao atualizar o status.', type: 'danger' });
    } finally {
        setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
    }
  };

  const adicionarLivroNaEstante = async (colecaoId) => {
    if (!loggedInUserId) return;
    try {
        await apiClient.post(`/colecoes/${colecaoId}/livros/${livroId}`);
        setFeedback({ message: `Livro adicionado à estante com sucesso!`, type: 'success' });
        setLivroNaEstante(colecaoId);
        fetchData();
    } catch (err) {
        console.error("Erro ao adicionar livro na estante:", err);
        setFeedback({ message: 'Falha ao adicionar o livro.', type: 'danger' });
    } finally {
        setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
    }
  };

  const removerDaEstante = async () => {
    if (!livroNaEstante || !loggedInUserId) return;
    try {
        await apiClient.delete(`/colecoes/${livroNaEstante}/livros/${livroId}`);
        setFeedback({ message: 'Livro removido da estante com sucesso!', type: 'success' });
        setLivroNaEstante(null);
    } catch (err) {
        console.error("Erro ao remover livro da estante:", err);
        setFeedback({ message: 'Falha ao remover o livro.', type: 'danger' });
    } finally {
        setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
    }
  };

  const mudarDeEstante = async (novaEstanteId) => {
    if (!loggedInUserId || !livroNaEstante) return;
    try {
        await apiClient.delete(`/colecoes/${livroNaEstante}/livros/${livroId}`);
        await apiClient.post(`/colecoes/${novaEstanteId}/livros/${livroId}`);
        setFeedback({ message: 'Livro movido para outra estante com sucesso!', type: 'success' });
        setLivroNaEstante(novaEstanteId);
    } catch (err) {
        console.error("Erro ao mudar o livro de estante:", err);
        setFeedback({ message: 'Falha ao mover o livro.', type: 'danger' });
    } finally {
        setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
    }
  };
  
  // Função para avaliar o livro
  const avaliarLivro = async (estrelas) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setFeedback({ message: 'Você precisa estar logado para avaliar livros.', type: 'warning' });
      setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
      return;
    }
    setFeedback({ message: '', type: '' });
    try {
      await apiClient.post(`/usuarios/${userId}/livros/${livroId}/avaliar`, { nota: estrelas });
      setAvaliacoes({ ...avaliacoes, [livro.id]: estrelas });
      setFeedback({ message: 'Avaliação registrada com sucesso!', type: 'success' });
    } catch (err) {
      console.error('Erro ao avaliar livro:', err);
      setFeedback({ message: 'Falha ao registrar avaliação. Tente novamente.', type: 'danger' });
    } finally {
      setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
    }
  };

  const definirAvaliacao = (estrelas) => {
    avaliarLivro(estrelas);
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
                src={livro.url_img && livro.url_img.startsWith('/static/') ? `http://127.0.0.1:8000${livro.url_img}` : BOOK_PLACEHOLDER_URL} 
                alt={livro.titulo} 
                className="img-fluid rounded"
                onError={(e) => { e.target.src = BOOK_PLACEHOLDER_URL; }}
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
                {livroNaEstante ? (
                  <>
                    <button className="btn btn-outline-danger me-2 mb-2" onClick={removerDaEstante}>Remover da estante</button>
                    <div className="dropdown me-2 mb-2">
                      <button className="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i className="bi bi-pencil me-2"></i> Mudar de estante
                      </button>
                      <ul className="dropdown-menu">
                        {estantes.filter(e => e.id !== livroNaEstante).map(estante => (
                          <li key={estante.id}>
                            <button className="dropdown-item" onClick={() => mudarDeEstante(estante.id)}>{estante.nome}</button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="dropdown me-2 mb-2">
                    <button className="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i className="bi bi-plus-lg me-2"></i> Adicionar à Estante
                    </button>
                    <ul className="dropdown-menu">
                      {estantes.length > 0 ? estantes.map(estante => (
                        <li key={estante.id}>
                          <button className="dropdown-item" onClick={() => adicionarLivroNaEstante(estante.id)}>{estante.nome}</button>
                        </li>
                      )) : <li><span className="dropdown-item text-muted">Nenhuma estante criada.</span></li>}
                    </ul>
                  </div>
                )}
                <button className={`btn mb-2 ${isFavorito ? 'btn-danger' : 'btn-outline-danger'}`} onClick={alternarFavorito}>
                    {isFavorito ? 'Remover dos Favoritos ❤️' : 'Adicionar aos Favoritos 🤍'}
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
                        <div className="mt-2">
                            <button className="btn btn-success btn-sm me-2" onClick={salvarEdicao}>Salvar</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditandoId(null)}>Cancelar</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p><strong>{comentario.user_name || 'Usuário'}:</strong> {comentario.texto}</p>
                        {loggedInUserId === comentario.user_id && (
                            <div>
                                <button className="btn btn-outline-primary btn-sm me-2" onClick={() => {setEditandoId(comentario.id); setComentarioEditado(comentario.texto);}}>Editar</button>
                                <button className="btn btn-outline-danger btn-sm" onClick={() => excluirComentario(comentario.id)}>Excluir</button>
                            </div>
                        )}
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