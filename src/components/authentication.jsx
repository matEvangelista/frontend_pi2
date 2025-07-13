import './components.css';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Authentication() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); // Lógica de login do contexto

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Enviar a requisição para o servidor
            const response = await axios.post('http://127.0.0.1:8000/auth/login', {
                email,
                senha: password
            });
            
            // Pega o ID do usuário da resposta da API (supondo que ele esteja em response.data.user.id)

            // Armazenando o user.id no localStorage
            localStorage.setItem('userId', response.data.user_id);

            // Opcional: Armazenando o token no localStorage (se necessário)
            // localStorage.setItem('token', response.data.access_token);
            
            // Chama o login do contexto (armazenando o email no contexto)
            login(email);

            // Navega para a página inicial
            navigate('/');
        } catch (err) {
            // Trata erros de conexão e exibe a mensagem correspondente
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Erro de conexão com o servidor.');
            }
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-body-tertiary">
            <form className="p-4 rounded shadow bg-white" style={{ minWidth: 320 }} onSubmit={handleSubmit}>
                <h2 className="mb-4 text-center">Login</h2>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input 
                        type="email" 
                        className="form-control" 
                        id="email" 
                        placeholder="Digite seu email" 
                        required 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Senha</label>
                    <div className="input-group">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-control"
                            id="password"
                            placeholder="Digite sua senha"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <span
                            className="input-group-text bg-white"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setShowPassword((prev) => !prev)}
                            tabIndex={-1}
                        >
                            <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                        </span>
                    </div>
                </div>
                <p>Não tem uma conta? <Link to="/register">Cadastre-se</Link></p>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <button type="submit" className="btn btn-primary w-100">Login</button>
            </form>
        </div>
    );
}