import { describe, expect, test } from "bun:test";
import { flow } from "./Chatbot";
import { useTranslations } from "../../i18n/utils";

const t = useTranslations("es");
const nodes = flow(t);

const navOf = (nodeName: keyof typeof nodes) =>
  nodes[nodeName].path as (params: { userInput: string }) => string | undefined;

describe("flow del chatbot - nodo start", () => {
  test("cada opción navega a su destino", () => {
    const nav = navOf("start");
    expect(nav({ userInput: t("chatbot.welcome.opt1") })).toBe("lostPet");
    expect(nav({ userInput: t("chatbot.welcome.opt2") })).toBe("foundPet");
    expect(nav({ userInput: t("chatbot.welcome.opt3") })).toBe(
      "whatIsLuckyTracker"
    );
    expect(nav({ userInput: t("chatbot.welcome.opt4") })).toBe("communityHelp");
    expect(nav({ userInput: t("chatbot.welcome.opt5") })).toBe("contactSupport");
  });

  test("input desconocido no lanza error y retorna undefined", () => {
    expect(navOf("start")({ userInput: "opción inexistente" })).toBeUndefined();
  });
});

describe("flow del chatbot - nodo lostPet", () => {
  test("3 opciones + back", () => {
    const nav = navOf("lostPet");
    expect(nav({ userInput: t("chatbot.lostPet.opt1") })).toBe("lostPetReport");
    expect(nav({ userInput: t("chatbot.lostPet.opt2") })).toBe(
      "lostPetTracking"
    );
    expect(nav({ userInput: t("chatbot.lostPet.opt3") })).toBe("lostPetTips");
    expect(nav({ userInput: t("chatbot.back") })).toBe("start");
  });

  test("la opción back está en la lista de opciones", () => {
    expect(nodes.lostPet.options).toContain(t("chatbot.back"));
  });
});

describe("flow del chatbot - nodo foundPet", () => {
  test("3 opciones + back", () => {
    const nav = navOf("foundPet");
    expect(nav({ userInput: t("chatbot.foundPet.opt1") })).toBe("foundPetReport");
    expect(nav({ userInput: t("chatbot.foundPet.opt2") })).toBe("foundPetSearch");
    expect(nav({ userInput: t("chatbot.foundPet.opt3") })).toBe(
      "foundPetMeanwhile"
    );
    expect(nav({ userInput: t("chatbot.back") })).toBe("start");
  });
});

describe("flow del chatbot - nodo whatIsLuckyTracker", () => {
  test("3 opciones + back", () => {
    const nav = navOf("whatIsLuckyTracker");
    expect(nav({ userInput: t("chatbot.whatIsLuckyTracker.opt1") })).toBe(
      "luckyTrackerProblems"
    );
    expect(nav({ userInput: t("chatbot.whatIsLuckyTracker.opt2") })).toBe(
      "luckyTrackerFeatures"
    );
    expect(nav({ userInput: t("chatbot.whatIsLuckyTracker.opt3") })).toBe(
      "luckyTrackerForWho"
    );
    expect(nav({ userInput: t("chatbot.back") })).toBe("start");
  });
});

describe("flow del chatbot - nodo communityHelp", () => {
  test("3 opciones + back", () => {
    const nav = navOf("communityHelp");
    expect(nav({ userInput: t("chatbot.communityHelp.opt1") })).toBe(
      "communityHelpOthers"
    );
    expect(nav({ userInput: t("chatbot.communityHelp.opt2") })).toBe(
      "communityAlerts"
    );
    expect(nav({ userInput: t("chatbot.communityHelp.opt3") })).toBe(
      "communityWhy"
    );
    expect(nav({ userInput: t("chatbot.back") })).toBe("start");
  });
});

describe("flow del chatbot - nodo contactSupport", () => {
  test("2 opciones + back", () => {
    const nav = navOf("contactSupport");
    expect(nav({ userInput: t("chatbot.contactSupport.opt1") })).toBe(
      "contactInfo"
    );
    expect(nav({ userInput: t("chatbot.contactSupport.opt2") })).toBe("faq");
    expect(nav({ userInput: t("chatbot.back") })).toBe("start");
  });
});

describe("flow del chatbot - nodos terminales", () => {
  test("todos los nodos terminales retornan al nodo start", () => {
    const terminalNodes = [
      "lostPetReport",
      "lostPetTracking",
      "lostPetTips",
      "foundPetReport",
      "foundPetSearch",
      "foundPetMeanwhile",
      "luckyTrackerProblems",
      "luckyTrackerFeatures",
      "luckyTrackerForWho",
      "communityHelpOthers",
      "communityAlerts",
      "communityWhy",
      "contactInfo",
      "faq",
    ] as const;

    terminalNodes.forEach((nodeName) => {
      expect(nodes[nodeName].path).toBe("start");
    });
  });
});

describe("flow del chatbot - estructura general", () => {
  test("cada nodo con path tipo función tiene chatDisabled en true", () => {
    const nodesWithNavigation = [
      "start",
      "lostPet",
      "foundPet",
      "whatIsLuckyTracker",
      "communityHelp",
      "contactSupport",
    ] as const;

    nodesWithNavigation.forEach((nodeName) => {
      expect(nodes[nodeName].chatDisabled).toBe(true);
    });
  });

  test("todos los nodos tienen un mensaje no vacío", () => {
    const allNodes = Object.keys(nodes) as (keyof typeof nodes)[];
    allNodes.forEach((nodeName) => {
      expect(nodes[nodeName].message.trim().length).toBeGreaterThan(0);
    });
  });
});