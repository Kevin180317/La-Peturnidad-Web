import React, { useState } from "react";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  console.log(isMenuOpen);
  return (
    <section className="fixed top-0 bg-white w-screen z-50">
      <div className="lg:container mx-auto px-6 lg:px-24">
        <div className="flex justify-between items-center h-20">
          <a href="/">
            <figure>
              <img src="/logo.23d1613d.svg" alt="Logo" />
            </figure>
          </a>
          <div className="hidden xl:block">
            <div className="flex items-center font-medium justify-center gap-16 text-xl">
              <div className="relative inline-block group">
                <button className="group-hover:text-principal pl-4">
                  Petnow App
                </button>
                <div className="hidden absolute group-hover:block min-w-44 top-full z-10 bg-white pt-8 p-4">
                  <div className="flex flex-col gap-2">
                    <a href="/about" className="hover:text-principal">
                      About
                    </a>
                    <a href="/how-to-use" className="hover:text-principal">
                      How to Use
                    </a>
                  </div>
                </div>
              </div>
              {/* <a href="/petwayhome" className="hover:text-principal">
                PetWayHome
              </a> */}
              <a href="/contact" className="hover:text-principal">
                Contact
              </a>
              <a href="/faq" className="hover:text-principal">
                FAQ
              </a>

              <div className="flex flex-col text-xl relative ml-4 group">
                <button
                  className="bg-principal rounded-2xl text-white py-3 px-8 flex items-center justify-center gap-3 hover:cursor-pointer"
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
                <div className="hidden absolute group-hover:block w-40 top-full z-10 bg-white rounded-2xl">
                  <div className="flex flex-col">
                    <a
                      href="/"
                      className="p-4 pb-[-8px] text-left hover:bg-[#FFEEEA]"
                    >
                      Español
                    </a>
                    <a href="/en" className="p-4 text-left hover:bg-[#FFEEEA]">
                      English
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="block xl:hidden">
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
          {isMenuOpen && (
            <div className="absolute top-0 right-0 bg-white shadow-lg h-screen w-96 py-8">
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center justify-between w-full px-4 h-10 mb-8">
                  <a href="/">
                    <figure>
                      <img
                        src="https://www.petnow.io/_next/static/media/logo.23d1613d.svg"
                        alt="Logo"
                      />
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
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          d="M3 21.32L21 3.32001"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                        <path
                          d="M3 3.32001L21 21.32"
                          stroke="#000000"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                      </g>
                    </svg>
                  </button>
                </div>
                <a href="/about" className="py-2 px-4 w-full">
                  About
                </a>
                <a href="/how-to-use" className="py-2 px-4 w-full ">
                  How to Use
                </a>
                <a href="/petwayhome" className="py-2 px-4 w-full ">
                  PetWayHome
                </a>
                <a href="/contact" className="py-2 px-4 w-full">
                  Contact
                </a>
                <a href="/faq" className="py-2 px-4 w-full">
                  FAQ
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Header;
