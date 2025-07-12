import React, { useState } from "react";

function Header() {
  return (
    <section className="fixed top-0 bg-white w-screen z-50">
      <div className="lg:container mx-auto px-6 lg:px-24">
        <div className="flex justify-between items-center h-20">
          <a href="/">
            <figure>
              <img
                src="https://www.petnow.io/_next/static/media/logo.23d1613d.svg"
                alt="Logo"
              />
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
              <a href="/petwayhome" className="hover:text-principal">
                PetWayHome
              </a>
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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
                stroke="#CCCCCC"
                strokeWidth="0.8160000000000001"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <path
                  d="M4 18L20 18"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                ></path>{" "}
                <path
                  d="M4 12L20 12"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                ></path>{" "}
                <path
                  d="M4 6L20 6"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
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
