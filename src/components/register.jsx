import './components.css'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        try {
            await axios.post('http://127.0.0.1:8000/auth/register', {
                name,
                surname,
                email,
                password
            });
            navigate('/login');
        } catch (err) {
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
                <h2 className="mb-4 text-center">Cadastre-se</h2>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Nome</label>
                    <input type="text" className="form-control" id="name" placeholder="Digite seu nome" required value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label htmlFor="surname" className="form-label">Sobrenome</label>
                    <input type="text" className="form-control" id="surname" placeholder="Digite seu sobrenome" required value={surname} onChange={e => setSurname(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" className="form-control" id="email" placeholder="Digite seu email" required value={email} onChange={e => setEmail(e.target.value)} />
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
                <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirmar Senha</label>
                    <div className="input-group">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            className="form-control"
                            id="confirmPassword"
                            placeholder="Confirme sua senha"
                            required
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                        <span
                            className="input-group-text bg-white"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            tabIndex={-1}
                        >
                            <i className={`bi ${showConfirmPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                        </span>
                    </div>
                </div>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <button type="submit" className="btn btn-primary w-100">Cadastar-se</button>
            </form>
        </div>
    );
}