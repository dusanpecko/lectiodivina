"use client";

import { useLanguage } from "@/app/components/LanguageProvider";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { motion } from "framer-motion";
import { Check, Heart } from "lucide-react";
import { useState } from "react";

const SUBSCRIPTION_TIERS = [
  {
    tier: "test_daily",
    price: 1,
    interval: "deň",
    name: { sk: "Test Denné", en: "Test Daily", cz: "Test Denní", es: "Test Diario" },
    testMode: true,
    features: {
      sk: ["🧪 TEST: Obnovuje sa každý deň", "Pre testovanie automatic renewal", "€1/deň"],
      en: ["🧪 TEST: Renews daily", "For testing automatic renewal", "€1/day"],
      cz: ["🧪 TEST: Obnovuje se každý den", "Pro testování automatického obnovení", "€1/den"],
      es: ["🧪 TEST: Se renueva diariamente", "Para probar la renovación automática", "€1/día"],
    },
  },
  {
    tier: "free",
    price: 0,
    name: { sk: "Zdarma", en: "Free", cz: "Zdarma", es: "Gratis" },
    features: {
      sk: ["Prístup k základným lectio", "Denná citácia", "Základné funkcie"],
      en: ["Access to basic lectio", "Daily quote", "Basic features"],
      cz: ["Přístup k základním lectio", "Denní citát", "Základní funkce"],
      es: ["Acceso a lectio básico", "Cita diaria", "Funciones básicas"],
    },
  },
  {
    tier: "supporter",
    price: 3,
    name: { sk: "Podporovateľ", en: "Supporter", cz: "Podporovatel", es: "Partidario" },
    popular: true,
    features: {
      sk: ["Všetky lectio bez reklám", "Pokročilé funkcie", "Podpora projektu", "Ďakovné email"],
      en: ["All lectio ad-free", "Advanced features", "Support the project", "Thank you email"],
      cz: ["Všechna lectio bez reklam", "Pokročilé funkce", "Podpora projektu", "Děkovný email"],
      es: ["Todos los lectio sin anuncios", "Funciones avanzadas", "Apoyar el proyecto", "Email de agradecimiento"],
    },
  },
  {
    tier: "patron",
    price: 20,
    name: { sk: "Patrón", en: "Patron", cz: "Patron", es: "Patrón" },
    features: {
      sk: ["Všetko z Podporovateľ", "Exkluzívny obsah", "Prioritná podpora", "Možnosť volby nových funkcií"],
      en: ["Everything in Supporter", "Exclusive content", "Priority support", "Vote on new features"],
      cz: ["Vše z Podporovatel", "Exkluzivní obsah", "Prioritní podpora", "Hlasování o nových funkcích"],
      es: ["Todo en Partidario", "Contenido exclusivo", "Soporte prioritario", "Votar sobre nuevas funciones"],
    },
  },
  {
    tier: "benefactor",
    price: 50,
    name: { sk: "Dobrodinci", en: "Benefactor", cz: "Dobrodinci", es: "Benefactor" },
    features: {
      sk: ["Všetko z Patrón", "Osobné poďakovanie", "Ovplyvniť budúci obsah", "Uvedenie v titulkoch (voliteľné)"],
      en: ["Everything in Patron", "Personal acknowledgment", "Influence future content", "Credit in app (optional)"],
      cz: ["Vše z Patron", "Osobní poděkování", "Ovlivnění budoucího obsahu", "Uvedení v aplikaci (volitelné)"],
      es: ["Todo en Patrón", "Reconocimiento personal", "Influir en el contenido futuro", "Crédito en la aplicación (opcional)"],
    },
  },
];

const DONATION_AMOUNTS = [5, 10, 25, 50, 100];

export default function SupportPage() {
  const { lang } = useLanguage();
  const { supabase } = useSupabase();
  const [mode, setMode] = useState<"subscription" | "donation">("subscription");
  const [customAmount, setCustomAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const translations = {
    title: { sk: "Podporiť Lectio Divina", en: "Support Lectio Divina", cz: "Podpořit Lectio Divina", es: "Apoyar Lectio Divina" },
    subtitle: {
      sk: "Pomôžte nám prinášať duchovný obsah širšiemu publiku",
      en: "Help us bring spiritual content to a wider audience",
      cz: "Pomozte nám přinášet duchovní obsah širšímu publiku",
      es: "Ayúdanos a llevar contenido espiritual a un público más amplio",
    },
    subscriptionTab: { sk: "Mesačná podpora", en: "Monthly Support", cz: "Měsíční podpora", es: "Apoyo mensual" },
    donationTab: { sk: "Jednorazový príspevok", en: "One-time Donation", cz: "Jednorázový příspěvek", es: "Donación única" },
    perMonth: { sk: "/mesiac", en: "/month", cz: "/měsíc", es: "/mes" },
    selectPlan: { sk: "Vybrať plán", en: "Select plan", cz: "Vybrat plán", es: "Seleccionar plan" },
    currentPlan: { sk: "Aktuálny plán", en: "Current plan", cz: "Aktuální plán", es: "Plan actual" },
    popular: { sk: "Populárne", en: "Popular", cz: "Populární", es: "Popular" },
    customAmount: { sk: "Vlastná suma", en: "Custom amount", cz: "Vlastní částka", es: "Cantidad personalizada" },
    message: { sk: "Správa (voliteľné)", en: "Message (optional)", cz: "Zpráva (volitelné)", es: "Mensaje (opcional)" },
    donate: { sk: "Prispieť", en: "Donate", cz: "Přispět", es: "Donar" },
    oneTime: { sk: "Jednorazový príspevok", en: "One-time donation", cz: "Jednorázový příspěvek", es: "Donación única" },
  };

  const handleSubscribe = async (tier: string) => {
    if (tier === "free") return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const response = await fetch("/api/checkout/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          userId: user?.id || null,
          email: user?.email || null,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      alert("Chyba pri vytváraní subscripcie");
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async (amount: number) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const response = await fetch("/api/checkout/donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          userId: user?.id || null,
          email: user?.email || null,
          message: donationMessage || null,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating donation:", error);
      alert("Chyba pri vytváraní donation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Hero Section with gradient */}
      <section className="relative min-h-[45vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #40467b 0%, #5a6191 50%, #40467b 100%)',
          }}
        >
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Heart size={64} className="mx-auto text-white mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              {translations.title[lang as keyof typeof translations.title]}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              {translations.subtitle[lang as keyof typeof translations.subtitle]}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="relative z-20 -mt-12">
        <div className="max-w-7xl mx-auto px-4 pb-12">

          {/* Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center gap-4 mb-12 relative z-30"
          >
            <button
              onClick={() => setMode("subscription")}
              className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:shadow-xl ${
                mode === "subscription"
                  ? "text-white shadow-lg"
                  : "backdrop-blur-md border text-gray-700"
              }`}
              style={mode === "subscription" 
                ? { background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)' }
                : { 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderColor: 'rgba(64, 70, 123, 0.15)'
                  }
              }
            >
              {translations.subscriptionTab[lang as keyof typeof translations.subscriptionTab]}
            </button>
            <button
              onClick={() => setMode("donation")}
              className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:shadow-xl ${
                mode === "donation"
                  ? "text-white shadow-lg"
                  : "backdrop-blur-md border text-gray-700"
              }`}
              style={mode === "donation"
                ? { background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)' }
                : { 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderColor: 'rgba(64, 70, 123, 0.15)'
                  }
              }
            >
              {translations.donationTab[lang as keyof typeof translations.donationTab]}
            </button>
          </motion.div>

          {/* Subscription Tiers */}
          {mode === "subscription" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SUBSCRIPTION_TIERS.map((tier, index) => (
                <motion.div
                  key={tier.tier}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`backdrop-blur-md rounded-3xl shadow-lg p-8 relative border hover:shadow-2xl transition-all ${
                    tier.testMode ? "bg-yellow-50/90" : ""
                  }`}
                  style={
                    tier.popular 
                      ? {
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderColor: '#40467b',
                          borderWidth: '3px'
                        }
                      : tier.testMode
                      ? {
                          borderColor: '#eab308',
                          borderWidth: '3px'
                        }
                      : {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderColor: 'rgba(64, 70, 123, 0.15)'
                        }
                  }
                >
                {tier.testMode && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                    🧪 TEST MODE
                  </div>
                )}
                {tier.popular && (
                  <div 
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-white px-4 py-1 rounded-full text-sm font-semibold"
                    style={{ background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)' }}
                  >
                    {translations.popular[lang as keyof typeof translations.popular]}
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-2" style={{ color: '#40467b' }}>
                  {tier.name[lang as keyof typeof tier.name]}
                </h3>

                <div className="mb-6">
                  <span className="text-4xl font-bold" style={{ color: '#40467b' }}>€{tier.price}</span>
                  {tier.price > 0 && (
                    <span className="text-gray-600">
                      {tier.interval === "deň" ? "/deň" : translations.perMonth[lang as keyof typeof translations.perMonth]}
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features[lang as keyof typeof tier.features].map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(tier.tier)}
                  disabled={loading || tier.tier === "free"}
                  className="w-full py-3 rounded-xl font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white"
                  style={
                    tier.tier === "free"
                      ? { backgroundColor: '#9ca3af' }
                      : { background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)' }
                  }
                >
                  {tier.tier === "free"
                    ? translations.currentPlan[lang as keyof typeof translations.currentPlan]
                    : translations.selectPlan[lang as keyof typeof translations.selectPlan]}
                </button>
              </motion.div>
            ))}
          </div>
          )}

          {/* One-time Donations */}
          {mode === "donation" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto backdrop-blur-md rounded-3xl shadow-xl p-8 border"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: 'rgba(64, 70, 123, 0.2)'
              }}
            >
              <div className="text-center mb-8">
                <Heart size={48} className="mx-auto text-red-500 mb-4" />
                <h2 className="text-3xl font-bold mb-2" style={{ color: '#40467b' }}>
                  {translations.oneTime[lang as keyof typeof translations.oneTime]}
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {DONATION_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleDonate(amount)}
                    disabled={loading}
                    className="py-4 rounded-xl font-bold text-xl transition-all hover:shadow-lg text-white"
                    style={{ background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)' }}
                  >
                    €{amount}
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2" style={{ color: '#40467b' }}>
                  {translations.customAmount[lang as keyof typeof translations.customAmount]}
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent"
                  style={{
                    borderColor: 'rgba(64, 70, 123, 0.3)',
                    '--tw-ring-color': '#40467b'
                  } as React.CSSProperties}
                  placeholder="10.00"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2" style={{ color: '#40467b' }}>
                  {translations.message[lang as keyof typeof translations.message]}
                </label>
                <textarea
                  value={donationMessage}
                  onChange={(e) => setDonationMessage(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent resize-none"
                  style={{
                    borderColor: 'rgba(64, 70, 123, 0.3)',
                    '--tw-ring-color': '#40467b'
                  } as React.CSSProperties}
                  rows={4}
                  placeholder="Vaša správa..."
                />
              </div>

              <button
                onClick={() => handleDonate(parseFloat(customAmount) || 0)}
                disabled={loading || !customAmount || parseFloat(customAmount) <= 0}
                className="w-full text-white py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)' }}
              >
                {translations.donate[lang as keyof typeof translations.donate]}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
