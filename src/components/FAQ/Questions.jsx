import React, { useState } from "react";

function Questions() {
  const accordionData = [
    {
      title: "What’s FurryFndr?",
      content:
        "FurryFndr is an app that enables pet parents to keep track of their love ones by sending community driven alerts in case their pets are missing.",
    },
    {
      title: "What type of alerts do I get in case my pet is missing?",
      content: "",
    },
    {
      title: "Does FurryFndr gives me accurate position 24/7 of my pet?",
      content: "",
    },
    {
      title: "Do community alerts has any cost?",
      content: "",
    },
    {
      title: "Where can I download the app?",
      content: "",
    },
    // {
    //   title: "I want to know more about petnow!",
    //   content: "For more information about petnow, feel free to email ",
    //   Link: { text: "contact@petnow.io", href: "mailto:contact@petnow.io" },
    // },
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="flex flex-col items-center justify-center my-16 md:my-20 lg:my-26 mx-4">
      <div className="max-w-[1000px] w-full text-lg md:text-2xl">
        <h1 className="text-center font-bold my-4 mb-6">
          Frequently Asked Questions
        </h1>
        <hr className="border-1 border-neutral-300" />
        {accordionData.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl shadow-[0_2px_8px_0_rgba(0,0,0,0.08)] p-6 mt-12 cursor-pointer bg-white"
            onClick={() => toggleAccordion(index)}
          >
            <div className="flex justify-start items-center relative">
              <h2 className="font-semibold pr-14">{item.title}</h2>
              <div className="w-12 h-12 absolute right-0">
                {activeIndex === index ? (
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
                        d="M18.2929 15.2893C18.6834 14.8988 18.6834 14.2656 18.2929 13.8751L13.4007 8.98766C12.6195 8.20726 11.3537 8.20757 10.5729 8.98835L5.68257 13.8787C5.29205 14.2692 5.29205 14.9024 5.68257 15.2929C6.0731 15.6835 6.70626 15.6835 7.09679 15.2929L11.2824 11.1073C11.673 10.7168 12.3061 10.7168 12.6966 11.1073L16.8787 15.2893C17.2692 15.6798 17.9024 15.6798 18.2929 15.2893Z"
                        fill="#0F0F0F"
                      ></path>{" "}
                    </g>
                  </svg>
                ) : (
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
                        d="M5.70711 9.71069C5.31658 10.1012 5.31658 10.7344 5.70711 11.1249L10.5993 16.0123C11.3805 16.7927 12.6463 16.7924 13.4271 16.0117L18.3174 11.1213C18.708 10.7308 18.708 10.0976 18.3174 9.70708C17.9269 9.31655 17.2937 9.31655 16.9032 9.70708L12.7176 13.8927C12.3271 14.2833 11.6939 14.2832 11.3034 13.8927L7.12132 9.71069C6.7308 9.32016 6.09763 9.32016 5.70711 9.71069Z"
                        fill="#0F0F0F"
                      ></path>{" "}
                    </g>
                  </svg>
                )}
              </div>
            </div>
            <div
              className={`transition-all ease-in-out duration-300 ${
                activeIndex === index
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0"
              } overflow-hidden `}
            >
              <p className="mt-8 text-neutral-400">{item.content}</p>
              {item.Link && (
                <a
                  href={item.Link.href}
                  className="text-principal hover:underline"
                >
                  {item.Link.text}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Questions;
