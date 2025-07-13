import './components.css';
import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// --- Constante da API ---
const API_BASE_URL = 'http://127.0.0.1:8000';

// --- Cliente Axios ---
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});


export default function Sidebar() {
  const [estantes, setEstantes] = useState([]);
  const [loading, setLoading] = useState(true);
  // Gerenciar o userId como um estado para garantir que a busca ocorra no momento certo.
  const [userId, setUserId] = useState(null);

  // Efeito que roda uma única vez para pegar o userId do localStorage.
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
        // Se não houver ID, paramos o carregamento para não ficar em loop infinito.
        setLoading(false);
        console.warn("Nenhum userId encontrado no localStorage na montagem inicial.");
    }
  }, []); // Array de dependências vazio para rodar apenas uma vez.

  // A função de busca agora depende do estado `userId`.
  const fetchEstantes = useCallback(async () => {
    // Só executa se o userId existir.
    if (!userId) {
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.get(`/usuarios/${userId}/colecoes/`);
      if (Array.isArray(response.data)) {
        setEstantes(response.data);
      } else {
        console.error("Erro: A resposta da API de coleções não é um array.", response.data);
        setEstantes([]);
      }
    } catch (error) {
      console.error("Erro ao buscar estantes:", error);
      setEstantes([]);
    } finally {
      setLoading(false);
    }
  }, [userId]); // Depende do `userId` do estado.

  // Efeito para buscar as estantes sempre que o `userId` for definido.
  useEffect(() => {
    fetchEstantes();
  }, [fetchEstantes]);


  // Funções de editar e excluir
  function editarEstante(id, novoNome, novoEmoji) {
    // TODO: Adicionar chamada à API para persistir a edição e depois chamar fetchEstantes()
    setEstantes((prev) =>
      prev.map((estante) =>
        estante.id === id ? { ...estante, nome: novoNome, emoji: novoEmoji } : estante
      )
    );
  }

  function excluirEstante(id) {
     // TODO: Adicionar chamada à API para persistir a exclusão e depois chamar fetchEstantes()
    setEstantes((prev) => prev.filter((estante) => estante.id !== id));
  }
  
  // Callback para o modal filho chamar quando uma estante for criada.
  const handleEstanteCriada = () => {
    fetchEstantes();
  };

  return (
    <>
      <div className="sidebar d-none d-md-block bg-light border-end">
        <SidebarContent
          estantes={estantes}
          onEditar={editarEstante}
          onExcluir={excluirEstante}
          loading={loading}
        />
      </div>

      <div className="offcanvas offcanvas-start d-md-none" tabIndex="-1" id="mobileSidebar">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Menu</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Fechar"></button>
        </div>
        <div className="offcanvas-body">
          <SidebarContent
            estantes={estantes}
            onEditar={editarEstante}
            onExcluir={excluirEstante}
            loading={loading}
          />
        </div>
      </div>

      <ModalAdicionarLivro />
      <ModalNovaEstante onEstanteCriada={handleEstanteCriada} />
    </>
  );
}

function SidebarContent({ estantes, onEditar, onExcluir, loading }) {
  return (
    <div className="p-3 d-flex flex-column h-100 justify-content-between">
      <ul className="nav flex-column">
        {/* Links de navegação */}
        <li className="nav-item mb-2"><Link to="/" className="nav-link text-dark"><i className="bi bi-house-door me-2"></i> Início</Link></li>
        <li className="nav-item mb-2"><Link to="/livros" className="nav-link text-dark"><i className="bi bi-bookshelf me-2"></i> Minha Biblioteca</Link></li>
        <li className="nav-item mb-2"><Link to="/descobrir" className="nav-link text-dark"><i className="bi bi-search me-2"></i> Descobrir</Link></li>
        <li className="nav-item mb-2"><Link to="/lendo-agora" className="nav-link text-dark"><i className="bi bi-book-half me-2"></i> Lendo Agora</Link></li>
        
        {/* ALTERAÇÃO: Movi o link "Lidos" para cá */}
        <li className="nav-item mb-4"><Link to="/lidos" className="nav-link text-dark"><i className="bi bi-check2-circle me-2"></i> Lidos</Link></li>

        <h6 className="text-uppercase text-muted px-2">Minhas Estantes</h6>

        {/* Renderização dinâmica das estantes */}
        {loading ? (
           <li className="nav-item mb-2 px-2 text-muted">Carregando estantes...</li>
        ) : (
          estantes.map((estante) => (
            <li key={estante.id} className="nav-item mb-2 d-flex align-items-center justify-content-between">
              <Link to={`/estante/${estante.id}`} className="nav-link text-dark flex-grow-1">
                <span className="me-2">{estante.emoji || '📚'}</span>
                {estante.nome}
              </Link>
              <div className="btn-group btn-group-sm ms-2" role="group">
                <button className="btn btn-outline-secondary" onClick={() => {
                    const novoNome = prompt('Novo nome da estante:', estante.nome);
                    if (novoNome) {
                      const novoEmoji = prompt('Novo emoji da estante:', estante.emoji) || estante.emoji;
                      onEditar(estante.id, novoNome, novoEmoji);
                    }
                  }} title="Editar estante">
                  <i className="bi bi-pencil"></i>
                </button>
                <button className="btn btn-outline-danger" onClick={() => onExcluir(estante.id)} title="Excluir estante">
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </li>
          ))
        )}

        <hr />
        <li className="nav-item mt-2">
          <button className="btn btn-sm btn-outline-secondary w-100" data-bs-toggle="modal" data-bs-target="#modalNovaEstante">
            <i className="bi bi-plus-lg me-2"></i> Nova Estante
          </button>
        </li>
      </ul>

      <div className="mt-4">
        <button type="button" className="btn btn-outline-primary w-100" data-bs-toggle="modal" data-bs-target="#modalAdicionarLivro">
          <i className="bi bi-plus-lg me-2"></i> Adicionar livros
        </button>
      </div>
    </div>
  );
}

function ModalAdicionarLivro() {
  const [formData, setFormData] = useState({
    titulo: '',
    autor_nome: '',
    categorias: '',
    url_img: '',
    descricao: '',
    ano_publicacao: ''
  });
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleImagemChange(e) {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setFormData(prev => ({ ...prev, url_img: url }));
    } else {
      setPreview(null);
      setFormData(prev => ({ ...prev, url_img: '' }));
    }
  }

  async function handleAdicionarClick() {
    if (!formData.titulo.trim() || !formData.autor_nome.trim() || !formData.categorias.trim()) {
      setError('Título, autor e categoria são obrigatórios');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const livroData = {
        titulo: formData.titulo.trim(),
        autor_nome: formData.autor_nome.trim(),
        categorias: formData.categorias.trim().split(',').map(cat => cat.trim())
      };
      if (formData.descricao && formData.descricao.trim()) livroData.descricao = formData.descricao.trim();
      if (formData.ano_publicacao && formData.ano_publicacao.trim()) livroData.ano_publicacao = parseInt(formData.ano_publicacao);
      if (formData.url_img && formData.url_img.trim()) livroData.url_img = formData.url_img.trim();

      const user_id = localStorage.getItem('userId');
      await apiClient.post(`/usuarios/${user_id}/livros/`, livroData);   
      setSuccess(`Livro "${formData.titulo}" criado com sucesso!`);
      setFormData({ titulo: '', autor_nome: '', categorias: '', url_img: '', descricao: '', ano_publicacao: '' });
      setPreview(null);
      setTimeout(() => {
        const modalEl = document.getElementById('modalAdicionarLivro');
        if (modalEl) {
            const modal = window.bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }
        setSuccess('');
        window.location.reload(); // Idealmente, isso também se tornaria um callback.
      }, 1500);
    } catch (err) {
      setError('Ocorreu um erro ao criar o livro. Tente novamente.');
      console.error('Erro ao criar livro:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="modal fade" id="modalAdicionarLivro" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Adicionar Livro</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div className="modal-body">
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    <div className="mb-3">
                        <label htmlFor="tituloLivro" className="form-label">Título *</label>
                        <input type="text" className="form-control" id="tituloLivro" name="titulo" value={formData.titulo} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="autorLivro" className="form-label">Autor *</label>
                        <input type="text" className="form-control" id="autorLivro" name="autor_nome" value={formData.autor_nome} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="categoriaLivro" className="form-label">Categorias *</label>
                        <input type="text" className="form-control" id="categoriaLivro" name="categorias" value={formData.categorias} onChange={handleInputChange} placeholder="Ex: Ficção, Romance" />
                        <div className="form-text">Separe múltiplas categorias por vírgula</div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="anoPublicacao" className="form-label">Ano de Publicação</label>
                      <input type="number" className="form-control" id="anoPublicacao" name="ano_publicacao" value={formData.ano_publicacao} onChange={handleInputChange} />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="descricaoLivro" className="form-label">Descrição</label>
                      <textarea className="form-control" id="descricaoLivro" name="descricao" value={formData.descricao} onChange={handleInputChange} rows="3"></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="imagemLivro" className="form-label">Imagem da Capa</label>
                      <input type="file" className="form-control" id="imagemLivro" accept="image/*" onChange={handleImagemChange} />
                    </div>
                    {preview && (
                      <div className="text-center mb-3">
                        <img src={preview} alt="Prévia" className="img-fluid rounded" style={{ maxHeight: '200px' }} />
                      </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" disabled={isLoading}>Cancelar</button>
                    <button type="button" className="btn btn-primary" onClick={handleAdicionarClick} disabled={isLoading}>
                        {isLoading ? (<><span className="spinner-border spinner-border-sm me-2"></span>Adicionando...</>) : ('Adicionar')}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}

function ModalNovaEstante({ onEstanteCriada }) {
  const [nome, setNome] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleCriarEstante() {
    if (!nome.trim()) {
      setError('O nome da estante é obrigatório.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError("Usuário não identificado. Faça login novamente.");
        setIsLoading(false);
        return;
      }
      const estanteData = { nome: nome.trim() };
      await apiClient.post(`/usuarios/${userId}/colecoes/`, estanteData);
      setSuccess(`Estante "${nome}" criada com sucesso!`);
      setNome('');
      if (onEstanteCriada) {
        onEstanteCriada();
      }
      setTimeout(() => {
        const modalEl = document.getElementById('modalNovaEstante');
        if (modalEl) {
            const modal = window.bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError('Ocorreu um erro ao criar a estante. Tente novamente.');
      console.error("Erro ao criar estante:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="modal fade" id="modalNovaEstante" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Nova Estante</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-3">
                <label htmlFor="nomeEstante" className="form-label">Nome da Estante *</label>
                <input type="text" className="form-control" id="nomeEstante" value={nome} onChange={(e) => setNome(e.target.value)} disabled={isLoading} required />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" data-bs-dismiss="modal" disabled={isLoading}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleCriarEstante} disabled={isLoading}>
              {isLoading ? (<><span className="spinner-border spinner-border-sm me-2"></span>Criando...</>) : ('Criar Estante')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
