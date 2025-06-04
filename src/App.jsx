// App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './App.css';
import Home from './components/home';
import Livro from './components/livro';
import Sidebar from './components/sidebar';
import Navbar from './components/navbar';
import Livros from './components/livros';
import Descobrir from './components/descobrir';
import LendoAgora from './components/lendoAgora';
import Lidos from './components/Lidos';


function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <div className="app-layout d-flex">
        <Sidebar />
        <div className="main-content flex-grow-1">
          <Navbar titulo="Minha Biblioteca" />
          <div className="">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/livros/:id" element={<Livro />} />
              <Route path="/livros" element={<Livros />} />
              <Route path="/descobrir" element={<Descobrir />} />
              <Route path="/lendo-agora" element={<LendoAgora />} />
              <Route path='/lidos' element={<Lidos/>} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
