import React, { useState } from "react";

import { useTranslations } from "../i18n/utils";

function NavBar({ lang }) {
  const t = useTranslations(lang);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const [isMobileLanguageOpen, setIsMobileLanguageOpen] = useState(false);

  const changeLanguage = (newLang) => {
    const { pathname, search, hash } = window.location;

    // Quitar /en si existe al inicio
    const pathWithoutLang = pathname.startsWith("/en")
      ? pathname.replace(/^\/en/, "")
      : pathname;

    const newPath =
      newLang === "en" ? `/en${pathWithoutLang}` : pathWithoutLang || "/";

    window.location.href = newPath + search + hash;
  };

  return (
    <section className="fixed top-0 bg-[#F0F3EC] w-full z-50">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <a
            href={lang === "es" ? "/" : "/en"}
            title="Petnow Home"
            aria-label="Go to home page"
          >
            <figure>
              <img src="/logo.png" alt="Logo" />
            </figure>
          </a>
          <div className="hidden lg:block">
            <div className="flex items-center font-medium justify-center gap-16 text-xl">
              <div className="relative inline-block group">
                <button className="group-hover:text-principal pl-4">
                  FurryFndrApp
                </button>
                <div className="hidden absolute group-hover:block min-w-44 top-full z-10 bg-fondo pt-8 p-4">
                  <div className="flex flex-col gap-2">
                    <a
                      href={lang === "en" ? "/en/about" : "/about"}
                      title="About Page"
                      aria-label="Learn more about us"
                      className="hover:text-principal"
                    >
                      {t("nav.about")}
                    </a>
                    <a
                      href={lang === "en" ? "/en/how-to-use" : "/how-to-use"}
                      title="How To Use Page"
                      aria-label="How to use the app"
                      className="hover:text-principal"
                    >
                      {t("nav.howToUse")}
                    </a>
                  </div>
                </div>
              </div>
              <a
                href={lang === "en" ? "/en/contact" : "/contact"}
                title="Contact Page"
                aria-label="Contact us"
                className="hover:text-principal"
              >
                {t("nav.contact")}
              </a>
              <a
                href={lang === "en" ? "/en/faq" : "/faq"}
                title="FAQ Page"
                aria-label="Frequently Asked Questions"
                className="hover:text-principal"
              >
                {t("nav.faq")}
              </a>

              <div className="flex flex-col text-xl relative ml-4">
                <button
                  className="bg-principal rounded-2xl text-white py-3 px-8 flex items-center justify-center gap-3 hover:cursor-pointer"
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isLanguageOpen}
                  onClick={() => setIsLanguageOpen((s) => !s)}
                >
                  <p>{t("nav.language")}</p>
                  <svg
                    className="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 9-7 7-7-7"
                    />
                  </svg>
                </button>

                <div
                  className={`absolute w-40 top-full z-10 bg-fondo mt-2 transition-opacity duration-150 ${
                    isLanguageOpen ? "opacity-100 block" : "opacity-0 hidden"
                  }`}
                >
                  <div className="flex flex-col">
                    <a
                      title="Spanish Page"
                      aria-label="Go to Spanish version"
                      className={`p-4 text-left block ${
                        lang === "es"
                          ? "text-principal cursor-default pointer-events-none"
                          : "hover:bg-[#FFEEEA]"
                      }`}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        changeLanguage("es");
                        setIsLanguageOpen(false);
                      }}
                    >
                      Español
                    </a>
                    <a
                      title="English Page"
                      aria-label="Go to English version"
                      className={`p-4 text-left block ${
                        lang === "en"
                          ? "text-principal cursor-default pointer-events-none"
                          : "hover:bg-[#FFEEEA]"
                      }`}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        changeLanguage("en");
                        setIsLanguageOpen(false);
                      }}
                    >
                      English
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="block lg:hidden">
            <button
              className="flex items-end justify-center h-12 w-12 hover:cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    d="M4 6H20M4 12H20M4 18H20"
                    stroke="#000000"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>{" "}
                </g>
              </svg>
            </button>
          </div>

          {/* overlay que oscurece el fondo cuando el menu mobile está abierto */}
          <div
            aria-hidden={!isMenuOpen}
            onClick={() => setIsMenuOpen(false)}
            className={`fixed inset-0 bg-black/50 lg:hidden transition-opacity duration-300 ${
              isMenuOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            } z-40`}
          />

          <div
            className={`
    fixed top-0 right-0 h-screen bg-fondo shadow-lg py-8 max-w-[500px] w-full px-4
    transform transition-transform duration-300 ease-in-out
    ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
    z-50
  `}
          >
            <div className="flex flex-col h-full text-texto">
              <div className="flex-1 flex flex-col items-center justify-start pt-6">
                <div className="flex items-center justify-between w-full px-4 h-5 mb-12">
                  <a href="/" title="Petnow Home" aria-label="Go to home page">
                    <figure>
                      <img src="/logo.png" alt="Logo" />
                    </figure>
                  </a>

                  <button
                    className="w-10 h-10 hover:cursor-pointer flex items-center justify-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg
                      viewBox="-0.5 0 25 25"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 21.32L21 3.32001"
                        stroke="#000000"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 3.32001L21 21.32"
                        stroke="#000000"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                {/* dropdown de idioma dentro del menú móvil */}
                <div className="w-full px-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setIsMobileLanguageOpen((s) => !s)}
                    aria-expanded={isMobileLanguageOpen}
                    className="w-full text-left py-2 px-2 flex items-center justify-between hover:cursor-pointer"
                  >
                    <span className="text-base text-principal">
                      {t("nav.language")}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isMobileLanguageOpen ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-200 ${
                      isMobileLanguageOpen
                        ? "flex flex-col max-h-40 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        changeLanguage("es");
                        setIsLanguageOpen(false);
                      }}
                      className="hover:text-principal pl-2"
                    >
                      Español
                    </a>

                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        changeLanguage("en");
                        setIsLanguageOpen(false);
                      }}
                      className="hover:text-principal pl-2"
                    >
                      English
                    </a>
                  </div>
                </div>

                <a
                  href={lang === "en" ? "/en/about" : "/about"}
                  title="About page"
                  aria-label="Learn more about us"
                  className="py-2 px-4 w-full hover:text-principal"
                >
                  {t("nav.about")}
                </a>
                <a
                  href={lang === "en" ? "/en/how-to-use" : "/how-to-use"}
                  title="How To Use Page"
                  aria-label="How to use the app"
                  className="py-2 px-4 w-full hover:text-principal"
                >
                  {t("nav.howToUse")}
                </a>
                <a
                  href={lang === "en" ? "/contact" : "/contact"}
                  title="Contact Page"
                  aria-label="Contact Us"
                  className="py-2 px-4 w-full hover:text-principal"
                >
                  {t("nav.contact")}
                </a>
                <a
                  href={lang === "en" ? "/en/faq" : "/faq"}
                  title="FAQ Page"
                  aria-label="Frequently Asked Questions"
                  className="py-2 px-4 w-full hover:text-principal"
                >
                  {t("nav.faq")}
                </a>
              </div>

              {/* footer dentro del menú móvil */}
              <div className="border-t border-neutral-200 p-4 bg-[#F7F8F6]">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-neutral-600">
                    Prometheus R&D | © 2025 Petnow
                  </div>
                  <div className="flex gap-3">
                    <a
                      href="https://www.facebook.com/petnowofficial"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-600 hover:text-principal"
                      aria-label="Facebook"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M13.135 6H15V3h-1.865a4.147 4.147 0 0 0-4.142 4.142V9H7v3h2v9.938h3V12h2.021l.592-3H12V6.591A.6.6 0 0 1 12.592 6h.543Z" />
                      </svg>
                    </a>
                    <a
                      href="https://www.instagram.com/petnow_official/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-600 hover:text-principal"
                      aria-label="Instagram"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Zm5-3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm7.597 2.214a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NavBar;
