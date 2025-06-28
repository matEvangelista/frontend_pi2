import './components.css';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Sidebar() {
  const [estantes, setEstantes] = useState([]);

  function adicionarEstante(novaEstante) {
    setEstantes((prev) => [...prev, novaEstante]);
  }

  function editarEstante(id, novoNome, novoEmoji) {
    setEstantes((prev) =>
      prev.map((estante) =>
        estante.id === id ? { ...estante, nome: novoNome, emoji: novoEmoji } : estante
      )
    );
  }

  function excluirEstante(id) {
    setEstantes((prev) => prev.filter((estante) => estante.id !== id));
  }

  return (
    <>
      <div className="sidebar d-none d-md-block bg-light border-end">
        <SidebarContent
          estantes={estantes}
          onEditar={editarEstante}
          onExcluir={excluirEstante}
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
          />
        </div>
      </div>

      <ModalAdicionarLivro />
      <ModalNovaEstante onCriar={adicionarEstante} />
    </>
  );
}

function SidebarContent({ estantes, onEditar, onExcluir }) {
  return (
    <div className="p-3 d-flex flex-column h-100 justify-content-between">
      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <Link to="/" className="nav-link text-dark">
            <i className="bi bi-house-door me-2"></i> Início
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/livros" className="nav-link text-dark">
            <i className="bi bi-bookshelf me-2"></i> Minha Biblioteca
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/descobrir" className="nav-link text-dark">
            <i className="bi bi-search me-2"></i> Descobrir
          </Link>
        </li>
        <li className="nav-item mb-4">
          <Link to="/lendo-agora" className="nav-link text-dark">
            <i className="bi bi-book-half me-2"></i> Lendo Agora
          </Link>
        </li>

        <h6 className="text-uppercase text-muted px-2">Minhas Estantes</h6>

        <li className="nav-item mb-4">
          <Link to="/lidos" className="nav-link text-dark">
            <i className="bi bi-check2-circle me-2"></i> Lidos
          </Link>
        </li>

        {estantes.map((estante, idx) => (
          <li key={idx} className="nav-item mb-2 d-flex align-items-center justify-content-between">
            <Link to={`/estante/${estante.id}`} className="nav-link text-dark flex-grow-1">
              <span className="me-2">{estante.emoji}</span> {estante.nome}
            </Link>
            
            <div className="btn-group btn-group-sm ms-2" role="group">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  const novoNome = prompt('Novo nome da estante:', estante.nome);
                  if (novoNome) {
                    const novoEmoji = prompt('Novo emoji da estante:', estante.emoji) || estante.emoji;
                    onEditar(estante.id, novoNome, novoEmoji);
                  }
                }}
                title="Editar estante"
              >
                <i className="bi bi-pencil"></i>
              </button>
              <button
                className="btn btn-outline-danger"
                onClick={() => onExcluir(estante.id)}
                title="Excluir estante"
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          </li>
        ))}

        <hr />
        <li className="nav-item mt-2">
          <button
            className="btn btn-sm btn-outline-secondary w-100"
            data-bs-toggle="modal"
            data-bs-target="#modalNovaEstante"
          >
            <i className="bi bi-plus-lg me-2"></i> Nova Estante
          </button>
        </li>
      </ul>

      <div className="mt-4">
        <button
          type="button"
          className="btn btn-outline-primary w-100"
          data-bs-toggle="modal"
          data-bs-target="#modalAdicionarLivro"
        >
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleImagemChange(e) {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      // For now, we'll just store the file URL as url_img
      // In a real application, you'd upload the file to a server
      setFormData(prev => ({
        ...prev,
        url_img: url
      }));
    } else {
      setPreview(null);
      setFormData(prev => ({
        ...prev,
        url_img: ''
      }));
    }
  }

  async function handleAdicionarClick() {
    // Validate required fields
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
        categorias: formData.categorias.trim() ? formData.categorias.split(',').map(cat => cat.trim()) : []
      };
      if (formData.descricao && formData.descricao.trim()) {
        livroData.descricao = formData.descricao.trim();
      }   
      if (formData.ano_publicacao && formData.ano_publicacao.trim()) {
        livroData.ano_publicacao = parseInt(formData.ano_publicacao);
      }
      if (formData.url_img && formData.url_img.trim()) {
        livroData.url_img = formData.url_img.trim();
      }

      const API_BASE_URL = 'http://127.0.0.1:8000';
      const apiClient = axios.create({
          baseURL: API_BASE_URL,
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
          },
          withCredentials: false, // Disable credentials for CORS
      });
      const response = await apiClient.post('/livros/', livroData);   
      setSuccess(`Livro "${formData.titulo}" criado com sucesso!`);

      setFormData({
        titulo: '',
        autor_nome: '',
        categorias: '',
        url_img: '',
        descricao: '',
        ano_publicacao: ''
      });
      setPreview(null);

      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalAdicionarLivro'));
        modal.hide();
        setSuccess('');
        window.location.reload();
      }, 1500);

    } catch (err) {
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
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            {success && (
              <div className="alert alert-success" role="alert">
                {success}
              </div>
            )}
            
            <div className="mb-3">
              <label htmlFor="tituloLivro" className="form-label">Título *</label>
              <input 
                type="text" 
                className="form-control" 
                id="tituloLivro"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="autorLivro" className="form-label">Autor *</label>
              <input 
                type="text" 
                className="form-control" 
                id="autorLivro"
                name="autor_nome"
                value={formData.autor_nome}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="categoriaLivro" className="form-label">Categorias *</label>
              <input 
                type="text" 
                className="form-control" 
                id="categoriaLivro"
                name="categorias"
                value={formData.categorias}
                onChange={handleInputChange}
                placeholder="Ex: Ficção, Romance, Aventura"
              />
              <div className="form-text">Separe múltiplas categorias por vírgula</div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="anoPublicacao" className="form-label">Ano de Publicação</label>
              <input 
                type="number" 
                className="form-control" 
                id="anoPublicacao"
                name="ano_publicacao"
                value={formData.ano_publicacao}
                onChange={handleInputChange}
                min="1000"
                max="2024"
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="descricaoLivro" className="form-label">Descrição</label>
              <textarea 
                className="form-control" 
                id="descricaoLivro"
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                rows="3"
                placeholder="Breve descrição do livro..."
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="imagemLivro" className="form-label">Imagem da Capa</label>
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
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              data-bs-dismiss="modal"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleAdicionarClick}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Adicionando...
                </>
              ) : (
                'Adicionar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalNovaEstante({ onCriar }) {
  const [nome, setNome] = useState('');
  const [emoji, setEmoji] = useState('📚');
  const [livros, setLivros] = useState([]);

  const emojisDisponiveis = ['📚', '💡', '🎯', '🧠', '🔥', '⭐', '📖', '📘', '📗', '📝', '🧳', '🌟', '🎵', '🧙', '🎮', '🏺'];

  useEffect(() => {
    fetch('/livros.json')
      .then(res => res.json())
      .then(setLivros)
      .catch(err => console.error("Erro ao carregar livros.json:", err));
  }, []);

  function handleCriarEstante() {
    if (!nome.trim()) return;
    onCriar({ id: nome.toLowerCase().replace(/\s+/g, '-'), nome, emoji });
    setNome('');
    setEmoji('📚');
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalNovaEstante'));
    modal.hide();
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
            <form>
              <div className="mb-3">
                <label htmlFor="nomeEstante" className="form-label">Nome da Estante</label>
                <input
                  type="text"
                  className="form-control"
                  id="nomeEstante"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="emojiEstante" className="form-label">Emoji</label>
                <select
                  className="form-select"
                  id="emojiEstante"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                >
                  {emojisDisponiveis.map((emj, idx) => (
                    <option key={idx} value={emj}>{emj}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="livroInicial" className="form-label">Livro Inicial</label>
                <select className="form-select" id="livroInicial">
                  <option value="">Selecione um livro</option>
                  {livros.map((livro) => (
                    <option key={livro.id} value={livro.id}>
                      {livro.titulo}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button className="btn btn-primary" onClick={handleCriarEstante}>Criar Estante</button>
          </div>
        </div>
      </div>
    </div>
  );
}
