import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import "./css/index.css";
import App from "./App.jsx";
import Test from "./game/Test.js";
import AboutPage from "./pages/about";
import ContactForm from "./pages/contactOld.tsx";
import { TransitionOverlay } from "./components/Effects/PageTransition";
import Projects from "./pages/projects.tsx";
import ALandGame from "./game/LandingHandler/LandingAbout.tsx";
import CLandGame from "./game/LandingHandler/LandingContact.tsx";
import PLandGame from "./game/LandingHandler/LandingProject.tsx";
import Contact from "./pages/contactPage.tsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      {/* Overlay lives here — outside Routes, always mounted, watches location */}
      <TransitionOverlay />

      <Routes>
        <Route path="/" element={<Test />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/con" element={<ContactForm />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/Aland" element={<ALandGame />} />
        <Route path="/Cland" element={<CLandGame />} />
        <Route path="/Pland" element={<PLandGame />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
);
