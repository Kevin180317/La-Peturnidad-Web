import { lazy, Suspense, useEffect, useRef, useState } from "react";

/* =========================
   Lazy load del chatbot
========================= */
const ChatBot = lazy(() => import("react-chatbotify"));

/* =========================
   Interfaces
========================= */
interface FormData {
  name?: string;
  age?: string;
  pet_ownership?: string;
  pet_choices?: string[] | string;
  num_work_days?: string;
}

interface ChatParams {
  userInput: string;
}

type UpdateFormPatch = Partial<FormData>;

/* =========================
   Componente
========================= */
export default function Home() {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const formRef = useRef<FormData>({});

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const updateForm = (patch: UpdateFormPatch) => {
    Object.assign(formRef.current, patch);
  };

  const formStyle: React.CSSProperties = {
    color: "black",
    marginTop: 10,
    marginLeft: 20,
    border: "1px solid #491d8d",
    padding: 10,
    borderRadius: 5,
    maxWidth: 300,
  };

  /* =========================
     Flow del chatbot
  ========================= */
  const flow = {
    start: {
      message: "Hello! Welcome to FurryFndr. How can I help you today?",
      function: (params: ChatParams) => updateForm({ name: params.userInput }),
      path: "ask_age",
    },

    ask_age: {
      message: (params: ChatParams) =>
        `Nice to meet you ${params.userInput}, what is your age?`,
      function: (params: ChatParams) => updateForm({ age: params.userInput }),
      path: "ask_pet",
    },

    ask_pet: {
      message: "Do you own any pets?",
      options: ["Yes", "No"],
      chatDisabled: true,
      function: (params: ChatParams) =>
        updateForm({ pet_ownership: params.userInput }),
      path: "ask_choice",
    },

    ask_choice: {
      message: "Select at least 2 pets that you are comfortable to work with:",
      checkboxes: {
        items: ["Dog", "Cat", "Rabbit", "Hamster"],
        min: 2,
      },
      chatDisabled: true,
      function: (params: ChatParams) =>
        updateForm({ pet_choices: params.userInput }),
      path: "ask_work_days",
    },

    ask_work_days: {
      message: "How many days can you work per week?",
      function: (params: ChatParams) =>
        updateForm({ num_work_days: params.userInput }),
      path: "end",
    },

    end: {
      message: "Thank you for your interest, we will get back to you shortly!",
      component: () => {
        const form = formRef.current;

        return (
          <div style={formStyle}>
            <p>Name: {form.name}</p>
            <p>Age: {form.age}</p>
            <p>Pet Ownership: {form.pet_ownership}</p>
            <p>
              Pet Choices:{" "}
              {Array.isArray(form.pet_choices)
                ? form.pet_choices.join(", ")
                : form.pet_choices}
            </p>
            <p>Num Work Days: {form.num_work_days}</p>
          </div>
        );
      },
      options: ["New Application"],
      chatDisabled: true,
      path: "start",
    },
  };

  /* =========================
     Render
  ========================= */
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
