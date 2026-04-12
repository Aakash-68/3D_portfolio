import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './css/index.css';
import App from './App.jsx';
import Home from './pages/home.jsx';
import Fin from './pages/fin.jsx';
import Test from './game/Test.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/3D_portfolio/">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/t" element={<Test />} />
        <Route path="/t2" element={<t/>} />
        <Route path="/home" element={<Home />} />
        <Route path="/fin" element={<Fin />} />
      </Routes>
    </BrowserRouter >
  </StrictMode>
);
