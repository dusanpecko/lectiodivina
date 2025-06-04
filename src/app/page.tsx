
"use client";
import { useLanguage } from "./components/LanguageProvider";
import { translations } from "./i18n";

export default function HomePage() {
  return (
    <main>
      <h1 className="text-3xl font-bold mb-4">Vitajte na stránke Lectio Divina</h1>
      <p className="text-lg mb-2">
        Toto je úvodná stránka vašej aplikácie. Vyberte si z menu vyššie.
      </p>
    </main>
  );
}
