import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import 'bootstrap-icons/font/bootstrap-icons.css';

import './App.css'
import Navbar from './components/navbar';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Navbar titulo={"Minha Biblioteca"}></Navbar>
    <div className="container mt-5">
      <h1 className="text-primary">Olá, Bootstrap no React!</h1>
      <h2>Count is {count}</h2>
      <button className="btn btn-success" onClick={() => setCount((count) => count + 1)}>Clique aqui</button>
    </div>
    </>
  );
}

export default App
