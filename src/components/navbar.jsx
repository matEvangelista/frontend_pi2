// components/navbar.js (atualizado)
import './components.css';
import { Link } from 'react-router-dom';

export default function Navbar({ titulo }) {
  return (
    <nav className="navbar navbar-expand-md bg-body-tertiary navbar-custom">
      <div className="container d-flex align-items-center justify-content-between me-auto w-md-100">
        {/* Botão de menu mobile */}
        <div className="d-flex align-items-center">
          <button
            className="btn d-md-none me-2"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileSidebar"
            aria-controls="mobileSidebar"
          >
            <i className="bi bi-list fs-4"></i>
          </button>

          <Link className="navbar-brand" to="/">
            <i className="bi bi-book"></i> <span>{titulo}</span>
          </Link>
        </div>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <div className="ms-auto w-100 d-flex justify-content-center">
            <form className="d-flex w-75" role="search">
              <input
                className="form-control me-2"
                type="search"
                placeholder="O Senhor dos Anéis"
                aria-label="Search"
              />
              <button className="btn botao" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}
