import { useState } from "react";
import Chatbot from "./Chatbot";

export default function ChatbotLauncher({ lang }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-primary bg-fondo rounded-full w-14 h-14 shadow-lg flex items-center justify-center hover:scale-105 transition"
        aria-label="Abrir chat"
      >
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
      </button>

      {/* Contenedor del chatbot */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[90vw] h-[500px] shadow-xl rounded-lg overflow-hidden">
          <Chatbot lang={lang} client:visible />
        </div>
      )}
    </>
  );
}
