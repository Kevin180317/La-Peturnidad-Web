import { useState } from "react";
import Chatbot from "./Chatbot";

export default function ChatbotLauncher({ lang }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-primary text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center hover:scale-105 transition"
        aria-label="Abrir chat"
      >
        💬
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
