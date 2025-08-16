import React, { useState } from "react";

function Questions() {
  const accordionData = [
    {
      title: "What is Petnow?",
      content:
        "Petnow is a company providing AI-driven pet biometric identification service. Petnow aims to build a better world without any lost or abandoned pets.",
    },
    {
      title: "Is nose print identification accurate?",
      content:
        "'Nose print' is unique to each dog and its patter never changes. Petnow' has an accuracy reate of over 99.9% for pet identification and verification.",
    },
    {
      title: "It's hard to scan a nose print.",
      content:
        "Check if the place has sufficient light and make sure the dog's nose is clean! ",
      Link: {
        text: "Learn more about how to scan biometric information faster and easier.",
        href: "/how-to-use",
      },
    },
    {
      title: "What feature does petnow provide?",
      content:
        "Petnow provides pet biometric registration, identification, verification and lost and found services for pet's safety. In addition, petnow also offers pet insurance and external chip purchases to support better pet's life.",
    },
    {
      title:
        "How can I reunite with lost pets after registering my pet's biometric information?",
      content:
        "By using the 'Neighborhood' tab on petnow, you can report your pet as missing. The real-time lost pet map will help you reunite with your pet faster.",
    },
    {
      title: "I want to know more about petnow!",
      content: "For more information about petnow, feel free to email ",
      Link: { text: "contact@petnow.io", href: "mailto:contact@petnow.io" },
    },
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="flex flex-col items-center justify-center my-16 md:my-20 lg:my-26 mx-4">
      <div className="max-w-[600px] w-full text-lg md:text-2xl">
        <h1 className="text-center font-bold my-4 mb-6">FAQ</h1>
        <hr className="border-1 border-neutral-300" />
        {accordionData.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl shadow-[0_2px_8px_0_rgba(0,0,0,0.08)] p-10 mt-12 cursor-pointer"
            onClick={() => toggleAccordion(index)}
          >
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Q. {item.title}</h2>
              <p className="text-principal">
                {activeIndex === index ? "-" : "+"}
              </p>
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
