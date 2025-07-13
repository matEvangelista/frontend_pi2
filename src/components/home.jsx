import './components.css'
import Navbar from './navbar'
import livros from '../data/livros.json';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import bookPlaceholder from '../assets/book_placeholder.jpeg';
import { Link } from 'react-router-dom';
import Footer from './footer';

export default function Home() {

    const [livrosFavoritos, setLivrosFavoritos] = useState([]);
    const [livrosRecentes, setLivrosRecentes] = useState([]);
    //const [livrosRecomendados, setLivrosRecomendados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLivros = async () => {
        try {
            setLoading(true);
            const  user_id  = localStorage.getItem('userId');
            const responseFavoritos = await axios.get(`http://127.0.0.1:8000/usuarios/${user_id}/favoritos`);
            setLivrosFavoritos(responseFavoritos.data);
            const responseRecentes = await axios.get(`http://127.0.0.1:8000/usuarios/${user_id}/livros/recentes?limite=4`);
            setLivrosRecentes(responseRecentes.data);
            //const response = await axios.get(`http://127.0.0.1:8000/usuarios/${user_id}/livros/registrados`);
            //setLivros(response.data);
        } catch (err) {
            console.error('Error fetching livros:', err);
            setError(err.message || 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
        };

        fetchLivros();
    }, []);

    if (loading) {
        return (
        <div className="d-flex flex-column min-vh-100 bg-body-tertiary">
            <div className="container py-4 mt-5">
            <div className="text-center">
                <div className="spinner-border" role="status">
                <span className="visually-hidden">Carregando...</span>
                </div>
                <p className="mt-2">Carregando livros...</p>
            </div>
            </div>
        </div>
        );
    }

    if (error) {
        return (
        <div className="d-flex flex-column min-vh-100 bg-body-tertiary">
            <div className="container py-4 mt-5">
            <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Erro ao carregar livros!</h4>
                <p>{error}</p>
                <hr />
                <p className="mb-0">Verifique se o servidor da API está rodando</p>
            </div>
            </div>
        </div>
        );
    }

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
                            {livrosFavoritos.map((livro, index) => (
                                <div className="col" key={livro.id || index}>
                                    <Link to={`/livros/${livro.id}`} className="text-decoration-none text-dark">
                                    <div className="card h-100 d-flex flex-column book-card">
                                        <img 
                                        src={livro.url_img || bookPlaceholder} 
                                        className="card-img-top" 
                                        alt={`Capa de ${livro.titulo}`} 
                                        onError={(e) => {
                                            e.target.src = bookPlaceholder;
                                        }}
                                        />
                                        <div className="card-body d-flex flex-column justify-content-end">
                                        <h5 className="card-title mt-auto">{livro.titulo}</h5>
                                        <p className="card-text text-muted">{livro.autor || 'Autor desconhecido'}</p>
                                        </div>
                                    </div>
                                    </Link>
                                </div>
                        ))}
                        </div>
                        <h2 className='mt-5'>Adicionado recentemente</h2>
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-3">
                            {livrosRecentes.map((livro, index) => (
                                <div className="col" key={livro.id || index}>
                                    <Link to={`/livros/${livro.id}`} className="text-decoration-none text-dark">
                                    <div className="card h-100 d-flex flex-column book-card">
                                        <img 
                                        src={livro.url_img || bookPlaceholder} 
                                        className="card-img-top" 
                                        alt={`Capa de ${livro.titulo}`} 
                                        onError={(e) => {
                                            e.target.src = bookPlaceholder;
                                        }}
                                        />
                                        <div className="card-body d-flex flex-column justify-content-end">
                                        <h5 className="card-title mt-auto">{livro.titulo}</h5>
                                        <p className="card-text text-muted">{livro.autor || 'Autor desconhecido'}</p>
                                        </div>
                                    </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                        <h2 className='mt-5'>Recomendados para você</h2>
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-3 pb-5">
                            {livros.map((livro, index) => (
                                <div className="col" key={livro.id || index}>
                                    <Link to={`/livros/${livro.id}`} className="text-decoration-none text-dark">
                                    <div className="card h-100 d-flex flex-column book-card">
                                        <img 
                                        src={livro.url_img || bookPlaceholder} 
                                        className="card-img-top" 
                                        alt={`Capa de ${livro.titulo}`} 
                                        onError={(e) => {
                                            e.target.src = bookPlaceholder;
                                        }}
                                        />
                                        <div className="card-body d-flex flex-column justify-content-end">
                                        <h5 className="card-title mt-auto">{livro.titulo}</h5>
                                        <p className="card-text text-muted">{livro.autor || 'Autor desconhecido'}</p>
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