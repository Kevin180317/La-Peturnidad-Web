import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useTranslations } from "../../i18n/utils";

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
     Render
  ========================= */
export default function ChatbotComponent({ lang }: { lang: "en" | "es" }) {
  const t = useTranslations(lang);
  const [isLoaded, setIsLoaded] = useState(true);

  const settings = {
    general: {
      headerTitle: "Roky",
      primaryColor: "#f97a5d",
      secondaryColor: "#9bc1bc",
      embedded: true,
    },
    audio: {
      disabled: true,
    },
    chatHistory: {
      storageKey: "example_basic_form",
    },
    botBubble: {
      showAvatar: true,
      avatar: "/roky_avatar.png",
    },
    notifications: {
      disabled: true,
    },
    header: {
      title: "Roky",
      avatar: "/roky_avatar.png",
    },
    // other sections
  };

  return (
    <>
      {isLoaded && (
        <Suspense fallback={<div>Loading...</div>}>
          <ChatBot settings={settings} flow={flow(t)} />
        </Suspense>
      )}
    </>
  );
}

/* =========================
     Flow del chatbot
  ========================= */
const flow = (t: ReturnType<typeof useTranslations>) => ({
  start: {
    message: t("chatbot.welcome"),
    options: [
      t("chatbot.welcome.opt1"),
      t("chatbot.welcome.opt2"),
      t("chatbot.welcome.opt3"),
      t("chatbot.welcome.opt4"),
      t("chatbot.welcome.opt5"),
    ],

    path: (params: ChatParams) => {
      switch (params.userInput) {
        case t("chatbot.welcome.opt1"): {
          return "lostPet";
        }
        case t("chatbot.welcome.opt2"): {
          return "foundPet";
        }
        case t("chatbot.welcome.opt3"): {
          return "whatIsPeturnidad";
        }
        case t("chatbot.welcome.opt4"): {
          return "communityHelp";
        }
        case t("chatbot.welcome.opt5"): {
          return "contactSupport";
        }
      }
    },
    chatDisabled: true,
  },

  lostPet: {
    message: t("chatbot.lostPet"),
    options: [
      t("chatbot.lostPet.opt1"),
      t("chatbot.lostPet.opt2"),
      t("chatbot.lostPet.opt3"),
      t("chatbot.back"),
    ],
    path: (params: ChatParams) => {
      switch (params.userInput) {
        case t("chatbot.lostPet.opt1"):
          return "lostPetReport";
        case t("chatbot.lostPet.opt2"):
          return "lostPetTracking";
        case t("chatbot.lostPet.opt3"):
          return "lostPetTips";
        case t("chatbot.back"):
          return "start";
      }
    },
    chatDisabled: true,
  },

  lostPetReport: {
    message: t("chatbot.lostPetReport"),
    options: [t("chatbot.back")],
    path: "start",
    chatDisabled: true,
  },

  lostPetTracking: {
    message: t("chatbot.lostPetTracking"),
    options: [t("chatbot.back")],
    path: "start",
    chatDisabled: true,
  },

  lostPetTips: {
    message: t("chatbot.lostPetTips"),
    options: [t("chatbot.back")],
    path: "start",
    chatDisabled: true,
  },

  foundPet: {
    message: t("chatbot.foundPet"),
    options: [
      t("chatbot.foundPet.opt1"),
      t("chatbot.foundPet.opt2"),
      t("chatbot.foundPet.opt3"),
      t("chatbot.back"),
    ],
    path: (params: ChatParams) => {
      switch (params.userInput) {
        case t("chatbot.foundPet.opt1"):
          return "foundPetReport";
        case t("chatbot.foundPet.opt2"):
          return "foundPetSearch";
        case t("chatbot.foundPet.opt3"):
          return "foundPetMeanwhile";
        case t("chatbot.back"):
          return "start";
      }
    },
    chatDisabled: true,
  },

  foundPetReport: {
    message: "Create a found pet post so owners nearby can identify their pet.",
    options: [t("chatbot.back")],
    path: "start",
    chatDisabled: true,
  },

  foundPetSearch: {
    message:
      "You can browse recent lost pet reports filtered by your location.",
    options: [t("chatbot.back")],
    path: "start",
    chatDisabled: true,
  },

  foundPetMeanwhile: {
    message:
      "Meanwhile:\n• Keep the pet safe\n• Check for ID or tags\n• Avoid assuming ownership",
    options: [t("chatbot.back")],
    path: "start",
    chatDisabled: true,
  },

  whatIsPeturnidad: {
    message: t("chatbot.whatIsPeturnidad"),
    options: [
      t("chatbot.whatIsPeturnidad.opt1"),
      t("chatbot.whatIsPeturnidad.opt2"),
      t("chatbot.whatIsPeturnidad.opt3"),
      t("chatbot.back"),
    ],
    path: (params: ChatParams) => {
      switch (params.userInput) {
        case t("chatbot.whatIsPeturnidad.opt1"):
          return "peturnidadProblems";
        case t("chatbot.whatIsPeturnidad.opt2"):
          return "peturnidadFeatures";
        case t("chatbot.whatIsPeturnidad.opt3"):
          return "peturnidadForWho";
        case t("chatbot.back"):
          return "start";
      }
    },
    chatDisabled: true,
  },

  peturnidadProblems: {
    message: t("chatbot.peturnidadProblems"),
    options: [t("chatbot.back")],
    path: "start",
    chatDisabled: true,
  },

  peturnidadFeatures: {
    message: t("chatbot.peturnidadFeatures"),
    options: [t("chatbot.back")],
    path: "start",
    chatDisabled: true,
  },

  peturnidadForWho: {
    message: t("chatbot.peturnidadForWho"),
    options: [t("chatbot.back")],
    path: "start",
    chatDisabled: true,
  },

  communityHelp: {
    message: t("chatbot.communityHelp"),
    options: [
      t("chatbot.communityHelp.opt1"),
      t("chatbot.communityHelp.opt2"),
      t("chatbot.communityHelp.opt3"),
      t("chatbot.back"),
    ],
    path: (params: ChatParams) => {
      switch (params.userInput) {
        case t("chatbot.communityHelp.opt1"):
          return "communityHelpOthers";
        case t("chatbot.communityHelp.opt2"):
          return "communityAlerts";
        case t("chatbot.communityHelp.opt3"):
          return "communityWhy";
        case t("chatbot.back"):
          return "start";
      }
    },
    chatDisabled: true,
  },

  communityHelpOthers: {
    message:
      "You can share reports, keep an eye out, and spread information locally.",
    options: [t("chatbot.back")],
    path: "start",
    chatDisabled: true,
  },

  communityAlerts: {
    message:
      "Users nearby receive notifications when a pet is reported lost or found in their area.",
    options: [t("chatbot.back")],
    path: "start",
    chatDisabled: true,
  },

  communityWhy: {
    message: "The more people involved, the faster pets return home.",
    options: [t("chatbot.back")],
    path: "start",
    chatDisabled: true,
  },

  contactSupport: {
    message: t("chatbot.contactSupport"),
    options: [
      t("chatbot.contactSupport.opt1"),
      t("chatbot.contactSupport.opt2"),
      t("chatbot.back"),
    ],
    path: (params: ChatParams) => {
      switch (params.userInput) {
        case t("chatbot.contactSupport.opt1"):
          return "contactInfo";
        case t("chatbot.contactSupport.opt2"):
          return "faq";
        case t("chatbot.back"):
          return "start";
      }
    },
    chatDisabled: true,
  },

  contactInfo: {
    message: t("chatbot.contactInfo"),
    options: [t("chatbot.back")],
    path: "start",
    chatDisabled: true,
  },

  faq: {
    message: t("chatbot.faq"),
    options: [t("chatbot.back")],
    path: "start",
    chatDisabled: true,
  },
});
