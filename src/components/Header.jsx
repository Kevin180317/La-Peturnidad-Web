import React, { useState } from "react";

function Header() {
  const [showLanguages, setShowLanguages] = useState(false);

  const toggleLanguagesMenu = () => {
    setShowLanguages((showLanguages) => !showLanguages);
  };

  return (
    <section className="sticky top-0 bg-white">
      <div className="lg:container mx-auto px-6 lg:px-24">
        <div className="flex justify-between items-center h-20">
          <figure>
            <img
              src="https://www.petnow.io/_next/static/media/logo.23d1613d.svg"
              alt="Logo"
            />
          </figure>
          <div className="hidden xl:block">
            <div className="flex items-center font-medium justify-center gap-16 text-xl">
              <div className="relative inline-block">
                <button className="hover:text-principal hover:block">
                  Petnow App
                </button>
                <div className="hidden hover:block min-w-44 absolute top-full z-10 bg-white pt-8 p-4">
                  <div className="flex flex-col gap-4">
                    <a href="" className="hover:text-principal">
                      About
                    </a>
                    <a href="" className="hover:text-principal">
                      How to Use
                    </a>
                  </div>
                </div>
              </div>
              <h1>PetWayHome</h1>
              <h1>Contact</h1>
              <h1>FAQ</h1>

              <div className="flex flex-col text-xl relative ml-4">
                <button
                  className="bg-principal rounded-2xl text-white py-3 px-8 flex items-center justify-center gap-3 hover:cursor-pointer"
                  onClick={toggleLanguagesMenu}
                  type="button"
                >
                  <p>Idioma</p>
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
                {showLanguages && (
                  <div className="absolute top-full left-0 bg-white rounded-lg shadow-lg mt-2 z-10 flex flex-col min-w-[120px]">
                    <button className="px-4 py-2 text-left hover:bg-gray-100">
                      Español
                    </button>
                    <button className="px-4 py-2 text-left hover:bg-gray-100">
                      Inglés
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="block xl:hidden">
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
                stroke="#CCCCCC"
                stroke-width="0.8160000000000001"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <path
                  d="M4 18L20 18"
                  stroke="#000000"
                  stroke-width="2"
                  stroke-linecap="round"
                ></path>{" "}
                <path
                  d="M4 12L20 12"
                  stroke="#000000"
                  stroke-width="2"
                  stroke-linecap="round"
                ></path>{" "}
                <path
                  d="M4 6L20 6"
                  stroke="#000000"
                  stroke-width="2"
                  stroke-linecap="round"
                ></path>{" "}
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Header;
