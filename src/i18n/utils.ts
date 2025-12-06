import { ui, defaultLang } from "./ui";

export function getLangFromUrl(url: URL | undefined) {
  if (!url || !url.pathname) {
    console.error("Invalid URL object:", url);
    return defaultLang;
  }

  const [, lang] = url.pathname.split("/");
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}
