import './components.css';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

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
  const [preview, setPreview] = useState(null);

  function handleImagemChange(e) {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
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
            <form>
              <div className="mb-3">
                <label htmlFor="tituloLivro" className="form-label">Título</label>
                <input type="text" className="form-control" id="tituloLivro" />
              </div>
              <div className="mb-3">
                <label htmlFor="autorLivro" className="form-label">Autor</label>
                <input type="text" className="form-control" id="autorLivro" />
              </div>
              <div className="mb-3">
                <label htmlFor="categoriaLivro" className="form-label">Categoria</label>
                <input type="text" className="form-control" id="categoriaLivro" />
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
            </form>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button className="btn btn-primary">Adicionar</button>
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
