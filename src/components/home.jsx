import './components.css'
import Navbar from './navbar'
import livros from '../data/livros.json';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Footer from './footer';

export default function Home() {
    return (
        <>
            <Navbar titulo={"Minha Biblioteca"}/>
            <div className='bg-body-tertiary'>
                <div className='container min-vh-100'>
                    <h1 className='bold pt-5 mt-3'>Bem-vindo à sua Biblioteca</h1>
                    <p>Organize, descubra e acompanhe seus livros em um só lugar</p>
                    <div>
                        <h2>Seus favoritos</h2>
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-3">
                            {livros.map((livro, index) => (
                                <div className="col" key={index}>
                                <Link to={`/livros/${livro.id}`} className="text-decoration-none text-dark">
                                    <div className="card h-100 d-flex flex-column book-card">
                                        <img src={livro.capa} className="card-img-top" alt={`Capa de ${livro.titulo}`} />
                                        <div className="card-body d-flex flex-column justify-content-end">
                                            <h5 className="card-title mt-auto">{livro.titulo}</h5>
                                            <p className="card-text text-muted">{livro.autor}</p>
                                        </div>
                                    </div>
                                </Link>
                                </div>
                        ))}
                        </div>
                        <h2 className='mt-5'>Adicionado recentemente</h2>
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-3">
                            {livros.map((livro, index) => (
                                <div className="col" key={index}>
                                <Link to={`/livros/${livro.id}`} className="text-decoration-none text-dark">
                                    <div className="card h-100 d-flex flex-column book-card">
                                        <img src={livro.capa} className="card-img-top" alt={`Capa de ${livro.titulo}`} />
                                        <div className="card-body d-flex flex-column justify-content-end">
                                            <h5 className="card-title mt-auto">{livro.titulo}</h5>
                                            <p className="card-text text-muted">{livro.autor}</p>
                                        </div>
                                    </div>
                                </Link>
                                </div>
                            ))}
                        </div>
                        <h2 className='mt-5'>Recomendados para você</h2>
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-3 pb-5">
                            {livros.map((livro, index) => (
                                <div className="col" key={index}>
                                <Link to={`/livros/${livro.id}`} className="text-decoration-none text-dark">
                                    <div className="card h-100 d-flex flex-column book-card">
                                        <img src={livro.capa} className="card-img-top" alt={`Capa de ${livro.titulo}`} />
                                        <div className="card-body d-flex flex-column justify-content-end">
                                            <h5 className="card-title mt-auto">{livro.titulo}</h5>
                                            <p className="card-text text-muted">{livro.autor}</p>
                                        </div>
                                    </div>
                                </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    )
}