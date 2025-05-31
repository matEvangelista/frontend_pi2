import './components.css'

export default function Navbar({ titulo, fig}) {
    return (
      <nav className="navbar navbar-expand-md bg-body-tertiary border-bottom">
        <div className="container">
          {/* Título */}
          <a className="navbar-brand" href="#"><i class="bi bi-book"></i> <span>{titulo}</span></a>
  
          {/* Botão para mobile */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
  
          {/* Conteúdo colapsável */}
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <div className="ms-auto w-100 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              {/* Caixa de pesquisa */}
              <form className="d-flex w-50 mx-auto" role="search">
                <input
                  className="form-control me-2"
                  type="search"
                  placeholder="O Senhor dos Anéis"
                  aria-label="Search"
                />
                <button className="btn botao" type="submit"><i class="bi bi-search"></i></button>
              </form>
  
              {/* Botão de adicionar */}
              <button type="button" className="btn botao">
                + Adicionar livros
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }
  