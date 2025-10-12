export interface CookieTranslations {
  title: string;
  description: string;
  accept_all: string;
  decline_all: string;
  more_info: string;
  policy_link_text: string;
  close_aria_label: string;
  error_accepting: string;
  error_declining: string;
  select_language: string;
}

export const cookieTranslations: {
  [key: string]: CookieTranslations;
} = {
  sk: {
    title: "Súhlas s cookies",
    description: "Táto stránka používa cookies na analýzu návštevnosti a zlepšenie používateľského zážitku. Vaše súkromie je pre nás dôležité.",
    accept_all: "Prijať všetko",
    decline_all: "Odmietnuť",
    more_info: "Viac informácií o cookies",
    policy_link_text: "Viac informácií nájdete v našich",
    close_aria_label: "Zavrieť",
    error_accepting: "Chyba pri ukladaní cookie súhlasu",
    error_declining: "Chyba pri odmietnutí cookies",
    select_language: "Vybrať jazyk",
  },

  cz: {
    title: "Souhlas s cookies",
    description: "Tato stránka používá cookies pro analýzu návštěvnosti a zlepšení uživatelského zážitku. Vaše soukromí je pro nás důležité.",
    accept_all: "Přijmout vše",
    decline_all: "Odmítnout",
    more_info: "Více informací o cookies",
    policy_link_text: "Více informací najdete v našich",
    close_aria_label: "Zavřít",
    error_accepting: "Chyba při ukládání souhlasu s cookies",
    error_declining: "Chyba při odmítnutí cookies",
    select_language: "Vybrat jazyk",
  },

  en: {
    title: "Cookie Consent",
    description: "This website uses cookies to analyze traffic and improve user experience. Your privacy is important to us.",
    accept_all: "Accept All",
    decline_all: "Decline",
    more_info: "More information about cookies",
    policy_link_text: "More information can be found in our",
    close_aria_label: "Close",
    error_accepting: "Error saving cookie consent",
    error_declining: "Error declining cookies",
    select_language: "Select language",
  },

  es: {
    title: "Consentimiento de Cookies",
    description: "Este sitio web usa cookies para analizar el tráfico y mejorar la experiencia del usuario. Tu privacidad es importante para nosotros.",
    accept_all: "Aceptar Todo",
    decline_all: "Rechazar",
    more_info: "Más información sobre cookies",
    policy_link_text: "Más información se puede encontrar en nuestras",
    close_aria_label: "Cerrar",
    error_accepting: "Error al guardar el consentimiento de cookies",
    error_declining: "Error al rechazar cookies",
    select_language: "Seleccionar idioma",
  },
};