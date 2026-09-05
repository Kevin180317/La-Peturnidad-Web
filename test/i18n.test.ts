/**
 * Tests unitarios de la lógica de internacionalización (i18n).
 *
 * Con qué se usan estos tests:
 * - `getLangFromUrl`: detección del idioma activo según la URL.
 * - `useTranslations`: traducción correcta por idioma y fallback al idioma por defecto.
 *
 * Cómo ejecutarlos:
 *   bun test                          # ejecuta todos los tests del proyecto
 *   bun test test/i18n.test.ts        # solo este archivo
 *   bun test --watch                  # re-ejecuta en vivo al guardar cambios
 *   bun test --coverage               # reporte de cobertura
 */
import { describe, expect, test } from "bun:test";
import { getLangFromUrl, useTranslations } from "../src/i18n/utils";
import { ui } from "../src/i18n/ui";

describe("getLangFromUrl", () => {
  test("detecta inglés cuando la URL empieza con /en", () => {
    expect(getLangFromUrl(new URL("https://luckytracker.com.mx/en/about"))).toBe(
      "en"
    );
    expect(getLangFromUrl(new URL("https://luckytracker.com.mx/en/"))).toBe(
      "en"
    );
    expect(getLangFromUrl(new URL("https://luckytracker.com.mx/en"))).toBe("en");
  });

  test("usa el idioma por defecto en rutas sin prefijo de idioma", () => {
    expect(getLangFromUrl(new URL("https://luckytracker.com.mx/"))).toBe("es");
    expect(getLangFromUrl(new URL("https://luckytracker.com.mx/contact"))).toBe(
      "es"
    );
    expect(getLangFromUrl(new URL("https://luckytracker.com.mx/how-to-use"))).toBe(
      "es"
    );
  });

  test("reconoce el prefijo /es explícito", () => {
    expect(getLangFromUrl(new URL("https://luckytracker.com.mx/es/policy"))).toBe(
      "es"
    );
    expect(getLangFromUrl(new URL("https://luckytracker.com.mx/es"))).toBe("es");
  });

  test("cae al idioma por defecto ante idiomas desconocidos", () => {
    expect(getLangFromUrl(new URL("https://luckytracker.com.mx/fr/faq"))).toBe(
      "es"
    );
    expect(getLangFromUrl(new URL("https://luckytracker.com.mx/de/about"))).toBe(
      "es"
    );
  });

  test("cae al idioma por defecto cuando la URL es indefinida", () => {
    expect(getLangFromUrl(undefined)).toBe("es");
  });
});

describe("useTranslations", () => {
  test("retorna la traducción en el idioma solicitado", () => {
    const t = useTranslations("en");
    expect(t("nav.about")).toBe("About");
    expect(t("nav.howToUse")).toBe("How to Use");
  });

  test("retorna traducciones distintas por idioma", () => {
    expect(useTranslations("en")("contact.form.button")).toBe("Submit");
    expect(useTranslations("es")("contact.form.button")).toBe("Enviar");
    expect(useTranslations("en")("home.hero.h1")).toBe(
      "Technology that keeps them safe!"
    );
    expect(useTranslations("es")("home.hero.h1")).toBe(
      "¡Tecnología que los mantiene seguros!"
    );
  });

  test("el texto completo de valores multilínea coincide", () => {
    const es = useTranslations("es");
    expect(es("about.h1")).toBe("Acerca de Lucky Tracker");
  });

  test("no lanza error con keys inexistentes y retorna falsy", () => {
    const t = useTranslations("es");
    const bogus = t("no.existe" as keyof (typeof ui)["es"]);
    expect(bogus).toBeFalsy();
  });
});