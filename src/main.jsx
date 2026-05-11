import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import "./css/index.css";
import App from "./App.jsx";
import Home from "./pages/home.jsx";
import Fin from "./pages/fin.jsx";
import Test from "./game/Test.js";
import AboutPage from "./pages/about";
import ContactForm from "./pages/contact.tsx";
import { TransitionOverlay } from "./components/Effects/PageTransition";
import Projects from "./pages/projects.tsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      {/* Overlay lives here — outside Routes, always mounted, watches location */}
      <TransitionOverlay />

      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/t" element={<Test />} />
        <Route path="/home" element={<Home />} />
        <Route path="/fin" element={<Fin />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactForm />} />
        <Route path="/projects" element={<Projects />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
);
