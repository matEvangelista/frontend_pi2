import './components.css';

export default function Footer() {
  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <div className="container text-center">
        <p className="mb-1">📚 Minha Biblioteca — Projeto de livros com React</p>
        <small>&copy; {new Date().getFullYear()} Desenvolvido pelo Grupo 1</small>
      </div>
    </footer>
  );
}
