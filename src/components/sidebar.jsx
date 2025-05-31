import './components.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Sidebar() {
  return (
    <>
      {/* Sidebar fixa para md+ */}
      <div className="sidebar d-none d-md-block bg-light border-end">
        <SidebarContent />
      </div>

      {/* Sidebar mobile (offcanvas) */}
      <div className="offcanvas offcanvas-start d-md-none" tabIndex="-1" id="mobileSidebar">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Menu</h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Fechar"
          ></button>
        </div>
        <div className="offcanvas-body">
          <SidebarContent />
        </div>
      </div>

      {/* Modal de Adicionar Livro */}
      <ModalAdicionarLivro />
    </>
  );
}

function SidebarContent() {
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
        <li className="nav-item mb-2">
          <Link to="/favoritos" className="nav-link text-dark">
            <i className="bi bi-journal-bookmark me-2"></i> Favoritos
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link to="/lidos" className="nav-link text-dark">
            <i className="bi bi-journal-check me-2"></i> Lidos
          </Link>
        </li>
        <li className="nav-item mb-4">
          <Link to="/desejados" className="nav-link text-dark">
            <i className="bi bi-journal-plus me-2"></i> Desejados
          </Link>
        </li>

        <hr />
        <li className="nav-item mt-2">
          <Link to="/nova-estante" className="nav-link text-muted">
            <i className="bi bi-plus-lg me-2"></i> Nova Estante
          </Link>
        </li>
      </ul>

      {/* Botão para abrir modal de adicionar livro */}
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
    <div
      className="modal fade"
      id="modalAdicionarLivro"
      tabIndex="-1"
      aria-labelledby="modalAdicionarLivroLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="modalAdicionarLivroLabel">
              Adicionar Livro
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Fechar"
            ></button>
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
                  <img src={preview} alt="Prévia da capa" className="img-fluid rounded" style={{ maxHeight: '200px' }} />
                </div>
              )}
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button type="button" className="btn btn-primary">
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
