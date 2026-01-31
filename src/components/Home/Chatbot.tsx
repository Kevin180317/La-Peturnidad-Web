import { lazy, Suspense, useEffect, useRef, useState } from "react";

/* =========================
   Lazy load del chatbot
========================= */
const ChatBot = lazy(() => import("react-chatbotify"));

/* =========================
   Interfaces
========================= */

interface ChatParams {
  userInput: string;
}

/* =========================
     Flow del chatbot
  ========================= */
const flow = {
  start: {
    message: "Hello! Welcome to FurryFndr. How can I help you today?",
    options: [
      "🔍 I lost a pet",
      "🐕 I found a pet",
      "🤔 What is Peturnidad?",
      "🌎 How does the community help?",
      "📩 Contact & support",
    ],

    path: (params: ChatParams) => {
      switch (params.userInput) {
        case "🔍 I lost a pet": {
          return "lostPet";
        }
        case "🐕 I found a pet": {
          return "foundPet";
        }
        case "🤔 What is Peturnidad?": {
          return "whatIsPeturnidad";
        }
        case "🌎 How does the community help?": {
          return "communityHelp";
        }
        case "📩 Contact & support": {
          return "contactSupport";
        }
      }
    },
  },

  lostPet: {
    message:
      "I’m sorry you’re going through this 💙 What would you like to do?",
    options: [
      "📢 Report my lost pet",
      "📍 How location tracking works",
      "🧠 Tips to find a lost pet",
      "⬅️ Back to menu",
    ],
    path: (params: ChatParams) => {
      switch (params.userInput) {
        case "📢 Report my lost pet":
          return "lostPetReport";
        case "📍 How location tracking works":
          return "lostPetTracking";
        case "🧠 Tips to find a lost pet":
          return "lostPetTips";
        case "⬅️ Back to menu":
          return "start";
      }
    },
  },

  lostPetReport: {
    message:
      "You can create a lost pet report with photos, description, and last known location.\nThis helps nearby users receive alerts.",
    options: ["⬅️ Back to menu"],
    path: "start",
  },

  lostPetTracking: {
    message:
      "Peturnidad uses community alerts and location-based reports to help reconnect pets with their families faster.",
    options: ["⬅️ Back to menu"],
    path: "start",
  },

  lostPetTips: {
    message:
      "Here are some tips:\n• Share clear photos\n• Include last seen location\n• Ask neighbors & local shelters",
    options: ["⬅️ Back to menu"],
    path: "start",
  },

  foundPet: {
    message:
      "Thank you for helping a pet in need 🐶 What would you like to do?",
    options: [
      "📝 Report a found pet",
      "🔍 Search lost pets nearby",
      "🛟 What should I do meanwhile?",
      "⬅️ Back to menu",
    ],
    path: (params: ChatParams) => {
      switch (params.userInput) {
        case "📝 Report a found pet":
          return "foundPetReport";
        case "🔍 Search lost pets nearby":
          return "foundPetSearch";
        case "🛟 What should I do meanwhile?":
          return "foundPetMeanwhile";
        case "⬅️ Back to menu":
          return "start";
      }
    },
  },

  foundPetReport: {
    message: "Create a found pet post so owners nearby can identify their pet.",
    options: ["⬅️ Back to menu"],
    path: "start",
  },

  foundPetSearch: {
    message:
      "You can browse recent lost pet reports filtered by your location.",
    options: ["⬅️ Back to menu"],
    path: "start",
  },

  foundPetMeanwhile: {
    message:
      "Meanwhile:\n• Keep the pet safe\n• Check for ID or tags\n• Avoid assuming ownership",
    options: ["⬅️ Back to menu"],
    path: "start",
  },

  whatIsPeturnidad: {
    message:
      "Peturnidad is a community-powered platform designed to reunite lost pets with their families 🐕🐈",
    options: [
      "💡 What problems does it solve?",
      "🛠️ What features does it offer?",
      "👥 Who is it for?",
      "⬅️ Back to menu",
    ],
    path: (params: ChatParams) => {
      switch (params.userInput) {
        case "💡 What problems does it solve?":
          return "peturnidadProblems";
        case "🛠️ What features does it offer?":
          return "peturnidadFeatures";
        case "👥 Who is it for?":
          return "peturnidadForWho";
        case "⬅️ Back to menu":
          return "start";
      }
    },
  },

  peturnidadProblems: {
    message:
      "It reduces the time pets stay lost by connecting communities through alerts and shared information.",
    options: ["⬅️ Back to menu"],
    path: "start",
  },

  peturnidadFeatures: {
    message:
      "Features include:\n• Lost & found pet reports\n• Location-based alerts\n• Community collaboration",
    options: ["⬅️ Back to menu"],
    path: "start",
  },

  peturnidadForWho: {
    message:
      "Pet owners, animal lovers, and anyone who wants to help reunite pets with their families.",
    options: ["⬅️ Back to menu"],
    path: "start",
  },

  communityHelp: {
    message:
      "Community is the heart of Peturnidad 💛 How would you like to help?",
    options: [
      "🤝 How can I help others?",
      "📣 How alerts work",
      "🐾 Why community matters",
      "⬅️ Back to menu",
    ],
    path: (params: ChatParams) => {
      switch (params.userInput) {
        case "🤝 How can I help others?":
          return "communityHelpOthers";
        case "📣 How alerts work":
          return "communityAlerts";
        case "🐾 Why community matters":
          return "communityWhy";
        case "⬅️ Back to menu":
          return "start";
      }
    },
  },

  communityHelpOthers: {
    message:
      "You can share reports, keep an eye out, and spread information locally.",
    options: ["⬅️ Back to menu"],
    path: "start",
  },

  communityAlerts: {
    message:
      "Users nearby receive notifications when a pet is reported lost or found in their area.",
    options: ["⬅️ Back to menu"],
    path: "start",
  },

  communityWhy: {
    message: "The more people involved, the faster pets return home.",
    options: ["⬅️ Back to menu"],
    path: "start",
  },

  contactSupport: {
    message: "Need help or want to reach the team?",
    options: [
      "📧 Contact information",
      "❓ Frequently asked questions",
      "⬅️ Back to menu",
    ],
    path: (params: ChatParams) => {
      switch (params.userInput) {
        case "📧 Contact information":
          return "contactInfo";
        case "❓ Frequently asked questions":
          return "faq";
        case "⬅️ Back to menu":
          return "start";
      }
    },
  },

  contactInfo: {
    message:
      "You can reach the Peturnidad team via the contact section on the website.",
    options: ["⬅️ Back to menu"],
    path: "start",
  },

  faq: {
    message:
      "Common questions include how to post reports, edit information, and stay safe.",
    options: ["⬅️ Back to menu"],
    path: "start",
  },
};

/* =========================
     Render
  ========================= */
export default function ChatbotComponent() {
  const [isLoaded, setIsLoaded] = useState(true);

  return (
    <>
      {isLoaded && (
        <Suspense fallback={<div>Loading...</div>}>
          <ChatBot
            flow={flow}
            settings={{
              general: {
                embedded: true,
              },
              chatHistory: {
                storageKey: "example_basic_form",
              },
            }}
          />
        </Suspense>
      )}
    </>
  );
}
