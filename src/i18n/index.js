import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import es from "./es.json";
import en from "./en.json";

// Spanish is the default and only active language.
// i18n is kept internally for future multi-language support.
const stored = localStorage.getItem("lang");
// Spanish is the default language. i18n is kept for future multi-language support.
// The language toggle button is hidden in the UI, but the functionality remains.
const lng = stored === "en" ? "en" : "es";

i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en } },
  lng: lng,
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

export default i18n;