import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
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

interface BoundaryProps {
  children: ReactNode;
  fallbackTitle: string;
  retryLabel: string;
}

/* =========================
   Error boundary
   Evita que un fallo al cargar
   el chatbot desmonte el navbar
========================= */
class ChatbotErrorBoundary extends Component<
  BoundaryProps,
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-sm text-neutral-500">
            {this.props.fallbackTitle}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="rounded-xl bg-principal px-5 py-2 text-sm font-bold text-white hover:opacity-90"
          >
            {this.props.retryLabel}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
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
    notification: {
      disabled: true,
    },
    header: {
      title: "Roky",
      avatar: "/roky_avatar.png",
    },
  };

  const chatbotStyles = {
    chatInputContainerStyle: { display: "none" },
  };

  return (
    <>
      {isLoaded && (
        <ChatbotErrorBoundary
          fallbackTitle={
            lang === "en"
              ? "Roky couldn't load. Check your connection."
              : "Roky no pudo cargarse. Revisa tu conexión."
          }
          retryLabel={lang === "en" ? "Retry" : "Reintentar"}
        >
          <Suspense
            fallback={
              <div>{lang === "en" ? "Loading..." : "Cargando..."}</div>
            }
          >
            <ChatBot
              settings={settings}
              styles={chatbotStyles}
              flow={flow(t)}
            />
          </Suspense>
        </ChatbotErrorBoundary>
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
          return "whatIsLuckyTracker";
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
    message: t("chatbot.foundPetReport"),
    options: [t("chatbot.back")],
    path: "start",
    chatDisabled: true,
  },

  foundPetSearch: {
    message: t("chatbot.foundPetSearch"),
    options: [t("chatbot.back")],
    path: "start",
    chatDisabled: true,
  },

  foundPetMeanwhile: {
    message: t("chatbot.foundPetMeanwhile"),
    options: [t("chatbot.back")],
    path: "start",
    chatDisabled: true,
  },

  whatIsLuckyTracker: {
    message: t("chatbot.whatIsLuckyTracker"),
    options: [
      t("chatbot.whatIsLuckyTracker.opt1"),
      t("chatbot.whatIsLuckyTracker.opt2"),
      t("chatbot.whatIsLuckyTracker.opt3"),
      t("chatbot.back"),
    ],
    path: (params: ChatParams) => {
      switch (params.userInput) {
        case t("chatbot.whatIsLuckyTracker.opt1"):
          return "luckyTrackerProblems";
        case t("chatbot.whatIsLuckyTracker.opt2"):
          return "luckyTrackerFeatures";
        case t("chatbot.whatIsLuckyTracker.opt3"):
          return "luckyTrackerForWho";
        case t("chatbot.back"):
          return "start";
      }
    },
    chatDisabled: true,
  },

  luckyTrackerProblems: {
    message: t("chatbot.luckyTrackerProblems"),
    options: [t("chatbot.back")],
    path: "start",
    chatDisabled: true,
  },

  luckyTrackerFeatures: {
    message: t("chatbot.luckyTrackerFeatures"),
    options: [t("chatbot.back")],
    path: "start",
    chatDisabled: true,
  },

  luckyTrackerForWho: {
    message: t("chatbot.luckyTrackerForWho"),
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
    message: t("chatbot.communityHelpOthers"),
    options: [t("chatbot.back")],
    path: "start",
    chatDisabled: true,
  },

  communityAlerts: {
    message: t("chatbot.communityAlerts"),
    options: [t("chatbot.back")],
    path: "start",
    chatDisabled: true,
  },

  communityWhy: {
    message: t("chatbot.communityWhy"),
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
