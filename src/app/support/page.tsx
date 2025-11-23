"use client";

import { useLanguage } from "@/app/components/LanguageProvider";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { motion } from "framer-motion";
import { Check, Heart } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const SUBSCRIPTION_TIERS = [
  {
    tier: "prayer",
    price: 0,
    yearlyPrice: 0,
    name: { sk: "Modlím sa", en: "I'm Praying", cz: "Modlím se", es: "Rezo" },
    description: { 
      sk: "nefinančná modlitebná podpora", 
      en: "non-financial prayer support", 
      cz: "nefinanční modlitební podpora", 
      es: "apoyo de oración no financiero" 
    },
    features: {
      sk: [
        "Pridávam sa k modlitbovej reťazi za lectio.one",
        "denne lectio divina",
        "Mesačný mail s modlitbovými úmyslami (voliteľné)",
        "Bez záväzkov, bez platby"
      ],
      en: [
        "I join the prayer chain for lectio.one",
        "daily lectio divina",
        "Monthly email with prayer intentions (optional)",
        "No commitments, no payment"
      ],
      cz: [
        "Přidávám se k modlitebnímu řetězu za lectio.one",
        "denní lectio divina",
        "Měsíční e-mail s modlitebními úmysly (volitelné)",
        "Bez závazků, bez platby"
      ],
      es: [
        "Me uno a la cadena de oración por lectio.one",
        "lectio divina diaria",
        "Email mensual con intenciones de oración (opcional)",
        "Sin compromisos, sin pago"
      ],
    },
    cta: {
      sk: "Modlím sa s vami",
      en: "I'll pray with you",
      cz: "Modlím se s vámi",
      es: "Rezo con ustedes"
    }
  },
  {
    tier: "friend",
    price: 3,
    yearlyPrice: 30,
    stripePriceMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_FRIEND_MONTHLY || "price_1SQUUsGrGKpSpokk7PtIDvy0",
    stripePriceYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_FRIEND_YEARLY || "price_1SVYYiGrGKpSpokkQMrIqRYL",
    name: { sk: "Priateľ", en: "Friend", cz: "Přítel", es: "Amigo" },
    description: { 
      sk: "ročná podpora, ktorá drží projekt pre všetkých zadarmo", 
      en: "yearly support that keeps the project free for everyone", 
      cz: "roční podpora, která drží projekt pro všechny zdarma", 
      es: "apoyo anual que mantiene el proyecto gratis para todos" 
    },
    features: {
      sk: [
        "Jednorazový dar na 12 mesiacov",
        "Priateľ badge v profile",
        "Ďakovný e-mail a krátky ročný report dopadu",
        "Podporuješ vývoj a lokalizáciu"
      ],
      en: [
        "One-time gift covering 12 months",
        "Friend badge in your profile",
        "Thank-you email and a short annual impact report",
        "You support development and localization"
      ],
      cz: [
        "Jednorázový dar na 12 měsíců",
        "Odznak Přítel v profilu",
        "Děkovný e-mail a krátká výroční zpráva o dopadu",
        "Podporuješ vývoj a lokalizaci"
      ],
      es: [
        "Donación única para 12 meses",
        "Insignia Amigo en tu perfil",
        "Email de agradecimiento e informe anual breve de impacto",
        "Apoyas el desarrollo y la localización"
      ],
    },
    cta: {
      sk: "Vybrať plán",
      en: "Choose plan",
      cz: "Vybrat plán",
      es: "Elegir plan"
    }
  },
  {
    tier: "patron",
    price: 20,
    yearlyPrice: 200,
    stripePriceMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PATRON_MONTHLY || "price_1SQYSSGrGKpSpokkCSnAuMPr",
    stripePriceYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PATRON_YEARLY || "price_1SVYbMGrGKpSpokkP0a2Bbo4",
    name: { sk: "Patrón", en: "Patron", cz: "Patron", es: "Patrono" },
    description: { 
      sk: "stály pilier projektu + výhody naviac", 
      en: "steady pillar of the project + extra benefits", 
      cz: "stálý pilíř projektu + výhody navíc", 
      es: "pilar constante del proyecto + beneficios extra" 
    },
    popular: true,
    features: {
      sk: [
        "Patrón badge v profile",
        "Skorší prístup k novému obsahu a funkciám",
        "Early access k pripravovanému kurzu Lectio Divina",
        "Prioritná podpora a hlasovanie o nových funkciách"
      ],
      en: [
        "Patron badge in your profile",
        "Earlier access to new content and features",
        "Early access to the upcoming Lectio Divina course",
        "Priority support and voting on new features"
      ],
      cz: [
        "Odznak Patron v profilu",
        "Dřívější přístup k novému obsahu a funkcím",
        "Předběžný přístup k připravovanému kurzu Lectio Divina",
        "Prioritní podpora a hlasování o nových funkcích"
      ],
      es: [
        "Insignia Patrono en tu perfil",
        "Acceso anticipado a nuevo contenido y funciones",
        "Acceso anticipado al curso de Lectio Divina en preparación",
        "Soporte prioritario y votación de nuevas funciones"
      ],
    },
    cta: {
      sk: "Stať sa patrónom",
      en: "Become a Patron",
      cz: "Stát se patronem",
      es: "Hacerme Patrono"
    }
  },
  {
    tier: "founder",
    price: 50,
    yearlyPrice: 500,
    stripePriceMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDER_MONTHLY || "price_1SQYauGrGKpSpokkHQhkJUhe",
    stripePriceYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDER_YEARLY || "price_1SVYd9GrGKpSpokkbvQ0nXeG",
    name: { sk: "Zakladateľ", en: "Founder", cz: "Zakladatel", es: "Fundador" },
    description: { 
      sk: "ťaháš dielo dopredu – veľká vďaka!", 
      en: "you move the mission forward — thank you!", 
      cz: "táhneš dílo dopředu – díky!", 
      es: "impulsas la misión — ¡gracias!" 
    },
    features: {
      sk: [
        "Všetko z úrovne Patrón",
        "Ročný žurnál Lectio (tlačený alebo PDF – podľa dostupnosti)",
        "Osobné poďakovanie",
        '(Voliteľné) Uvedenie medzi "Zakladateľmi"'
      ],
      en: [
        "Everything in Patron",
        "Annual Lectio Journal (printed or PDF — subject to availability)",
        "Personal thank-you",
        '(Optional) Listed among "Founders"'
      ],
      cz: [
        "Vše z úrovně Patron",
        "Roční deník Lectio (tištěný nebo PDF – dle dostupnosti)",
        "Osobní poděkování",
        '(Volitelné) Uvedení mezi "Zakladateli"'
      ],
      es: [
        "Todo lo de Patrono",
        "Diario anual de Lectio (impreso o PDF — según disponibilidad)",
        "Agradecimiento personal",
        '(Opcional) Aparición en la lista de "Fundadores"'
      ],
    },
    cta: {
      sk: "Podporiť ako zakladateľ",
      en: "Support as Founder",
      cz: "Podpořit jako zakladatel",
      es: "Apoyar como Fundador"
    }
  },
];

const DONATION_AMOUNTS = [5, 10, 25, 50, 100];

export default function SupportPage() {
  const { lang } = useLanguage();
  const { supabase, session } = useSupabase();
  const [mode, setMode] = useState<"subscription" | "donation">("subscription");
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const [customAmount, setCustomAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch user's current subscription tier
  useEffect(() => {
    const fetchUserTier = async () => {
      if (!session?.user?.id) {
        setCurrentTier(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('tier, status, cancel_at_period_end')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .single();

        if (error || !data || data.cancel_at_period_end) {
          setCurrentTier(null);
        } else {
          setCurrentTier(data.tier);
        }
      } catch (err) {
        console.error('Error fetching user tier:', err);
        setCurrentTier(null);
      }
    };

    fetchUserTier();
  }, [session, supabase]);

  const translations = {
    title: { sk: "Podporiť Lectio Divina", en: "Support Lectio Divina", cz: "Podpořit Lectio Divina", es: "Apoyar Lectio Divina" },
    subtitle: {
      sk: "Spoločne prinesieme ticho cez Božie slovo do digitálneho sveta",
      en: "Together we bring silence through God's Word into the digital world",
      cz: "Společně přineseme ticho skrze Boží slovo do digitálního světa",
      es: "Juntos traemos el silencio a través de la Palabra de Dios al mundo digital",
    },
    subscriptionTab: { sk: "Mesačná podpora", en: "Monthly Support", cz: "Měsíční podpora", es: "Apoyo mensual" },
    donationTab: { sk: "Jednorazový príspevok", en: "One-time Donation", cz: "Jednorázový příspěvek", es: "Donación única" },
    monthly: { sk: "Mesačne", en: "Monthly", cz: "Měsíčně", es: "Mensual" },
    yearly: { sk: "Ročne", en: "Yearly", cz: "Ročně", es: "Anual" },
    perMonth: { sk: "/mesiac", en: "/month", cz: "/měsíc", es: "/mes" },
    perYear: { sk: "/rok", en: "/year", cz: "/rok", es: "/año" },
    saveMonths: { sk: "Ušetríte 2 mesiace", en: "Save 2 months", cz: "Ušetříte 2 měsíce", es: "Ahorra 2 meses" },
    popular: { sk: "Najobľúbenejšie", en: "Most popular", cz: "Nejoblíbenější", es: "El más popular" },
    customAmount: { sk: "Vlastná suma", en: "Custom amount", cz: "Vlastní částka", es: "Cantidad personalizada" },
    message: { sk: "Správa (voliteľné)", en: "Message (optional)", cz: "Zpráva (volitelné)", es: "Mensaje (opcional)" },
    donate: { sk: "Prispieť", en: "Donate", cz: "Přispět", es: "Donar" },
    oneTime: { sk: "Jednorazový príspevok", en: "One-time donation", cz: "Jednorázový příspěvek", es: "Donación única" },
    noPaywall: {
      sk: "Lectio.one je bez paywallu. Dary môžeš kedykoľvek zrušiť. Ďakujeme za každú formu podpory – modlitbou aj financiami.",
      en: "Lectio.one has no paywall. You can cancel donations at any time. Thank you for every form of support — in prayer and financially.",
      cz: "Lectio.one je bez paywallu. Dar můžeš kdykoli zrušit. Děkujeme za každou formu podpory — modlitbou i finančně.",
      es: "Lectio.one no tiene paywall. Puedes cancelar tu donación en cualquier momento. Gracias por cualquier forma de apoyo — con tu oración y con tu ayuda económica."
    },
    loginRequired: {
      sk: "Prihlásenie potrebné",
      en: "Login Required",
      cz: "Přihlášení povinné",
      es: "Inicio de sesión requerido"
    },
    loginMessage: {
      sk: "Pre vytvorenie predplatného sa prosím prihláste alebo zaregistrujte.",
      en: "Please log in or register to create a subscription.",
      cz: "Pro vytvoření předplatného se prosím přihlaste nebo zaregistrujte.",
      es: "Por favor, inicie sesión o regístrese para crear una suscripción."
    },
    loginButton: {
      sk: "Prihlásiť sa",
      en: "Log in",
      cz: "Přihlásit se",
      es: "Iniciar sesión"
    },
    cancelButton: {
      sk: "Zrušiť",
      en: "Cancel",
      cz: "Zrušit",
      es: "Cancelar"
    }
  };

  const handleSubscribe = async (tier: string, priceId: string) => {
    if (tier === "free") return;

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/checkout/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          priceId,
          userId: user.id,
          email: user.email || null,
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
            <>
              {/* Billing Interval Toggle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-center items-center gap-4 mb-8"
              >
                <span className={`text-lg font-semibold ${billingInterval === "monthly" ? "text-[#40467b]" : "text-gray-400"}`}>
                  {translations.monthly[lang as keyof typeof translations.monthly]}
                </span>
                <button
                  onClick={() => setBillingInterval(billingInterval === "monthly" ? "yearly" : "monthly")}
                  className="relative w-16 h-8 rounded-full transition-colors"
                  style={{ backgroundColor: billingInterval === "yearly" ? "#40467b" : "#cbd5e1" }}
                >
                  <span
                    className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform"
                    style={{ transform: billingInterval === "yearly" ? "translateX(32px)" : "translateX(0)" }}
                  />
                </button>
                <span className={`text-lg font-semibold ${billingInterval === "yearly" ? "text-[#40467b]" : "text-gray-400"}`}>
                  {translations.yearly[lang as keyof typeof translations.yearly]}
                </span>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SUBSCRIPTION_TIERS.map((tier, index) => (
                <motion.div
                  key={tier.tier}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="backdrop-blur-md rounded-3xl shadow-lg p-8 relative border hover:shadow-2xl transition-all flex flex-col"
                  style={
                    tier.popular 
                      ? {
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderColor: '#40467b',
                          borderWidth: '3px'
                        }
                      : {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderColor: 'rgba(64, 70, 123, 0.15)'
                        }
                  }
                >
                {tier.popular && (
                  <div 
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-white px-4 py-1 rounded-full text-sm font-semibold"
                    style={{ background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)' }}
                  >
                    {translations.popular[lang as keyof typeof translations.popular]}
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-1" style={{ color: '#40467b' }}>
                  {tier.name[lang as keyof typeof tier.name]}
                </h3>
                
                {tier.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {tier.description[lang as keyof typeof tier.description]}
                  </p>
                )}

                <div className="mb-6">
                  <span className="text-4xl font-bold" style={{ color: '#40467b' }}>
                    €{billingInterval === "monthly" ? tier.price : tier.yearlyPrice}
                  </span>
                  {tier.price > 0 && (
                    <span className="text-gray-600">
                      {billingInterval === "monthly" 
                        ? translations.perMonth[lang as keyof typeof translations.perMonth]
                        : translations.perYear[lang as keyof typeof translations.perYear]
                      }
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {tier.features[lang as keyof typeof tier.features].map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    if (tier.tier === "prayer" || currentTier === tier.tier) return;
                    const priceId = billingInterval === "monthly" 
                      ? tier.stripePriceMonthly 
                      : tier.stripePriceYearly;
                    if (priceId) handleSubscribe(tier.tier, priceId);
                  }}
                  disabled={loading || tier.tier === "prayer" || currentTier === tier.tier}
                  className="w-full py-3 rounded-xl font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white"
                  style={
                    tier.tier === "prayer" || currentTier === tier.tier
                      ? { backgroundColor: '#9ca3af' }
                      : { background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)' }
                  }
                >
                  {currentTier === tier.tier 
                    ? (lang === "sk" ? "Aktívne predplatné" : lang === "en" ? "Active subscription" : lang === "cz" ? "Aktivní předplatné" : "Suscripción activa")
                    : tier.cta[lang as keyof typeof tier.cta]
                  }
                </button>
              </motion.div>
            ))}
              </div>

              {/* No paywall message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-12"
              >
                <div 
                  className="backdrop-blur-md rounded-2xl p-6 border text-center"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderColor: 'rgba(64, 70, 123, 0.1)'
                  }}
                >
                  <p className="text-gray-700 leading-relaxed">
                    {translations.noPaywall[lang as keyof typeof translations.noPaywall]}
                  </p>
                </div>
              </motion.div>
            </>
          )}

          {/* One-time Donations */}
          {mode === "donation" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch"
            >
              {/* Image Side */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[600px]">
                <Image
                  src="/support_gift.webp"
                  alt="Support Lectio Divina"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h2 className="text-3xl md:text-4xl font-bold mb-3">
                    {translations.oneTime[lang as keyof typeof translations.oneTime]}
                  </h2>
                  <p className="text-lg text-white/90">
                    {translations.subtitle[lang as keyof typeof translations.subtitle]}
                  </p>
                </div>
              </div>

              {/* Form Side */}
              <div 
                className="backdrop-blur-md rounded-3xl shadow-xl p-8 border flex flex-col justify-between"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderColor: 'rgba(64, 70, 123, 0.2)'
                }}
              >
                <div className="mb-8">
                  <Heart size={48} className="mx-auto mb-4" style={{ color: '#40467b' }} />
                  <h3 className="text-2xl font-bold text-center mb-2" style={{ color: '#40467b' }}>
                    {translations.customAmount[lang as keyof typeof translations.customAmount]}
                  </h3>
                </div>

                {/* Preset amounts */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {DONATION_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleDonate(amount)}
                      disabled={loading}
                      className="py-4 rounded-xl font-bold text-xl transition-all hover:shadow-lg disabled:opacity-50 text-white"
                      style={{ background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)' }}
                    >
                      €{amount}
                    </button>
                  ))}
                </div>

                {/* Custom amount input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#40467b' }}>
                    {translations.customAmount[lang as keyof typeof translations.customAmount]}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold" style={{ color: '#40467b' }}>€</span>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:border-transparent text-xl font-semibold"
                      style={{
                        borderColor: 'rgba(64, 70, 123, 0.3)',
                        '--tw-ring-color': '#40467b'
                      } as React.CSSProperties}
                      placeholder="10.00"
                    />
                  </div>
                </div>

                {/* Message textarea */}
                <div className="mb-6 flex-grow">
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#40467b' }}>
                    {translations.message[lang as keyof typeof translations.message]}
                  </label>
                  <textarea
                    value={donationMessage}
                    onChange={(e) => setDonationMessage(e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:border-transparent resize-none"
                    style={{
                      borderColor: 'rgba(64, 70, 123, 0.3)',
                      '--tw-ring-color': '#40467b'
                    } as React.CSSProperties}
                    rows={4}
                    placeholder="Vaša správa..."
                  />
                </div>

                {/* Submit button */}
                <button
                  onClick={() => handleDonate(parseFloat(customAmount) || 0)}
                  disabled={loading || !customAmount || parseFloat(customAmount) <= 0}
                  className="w-full text-white py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)' }}
                >
                  {translations.donate[lang as keyof typeof translations.donate]}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
          >
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)' }}
              >
                <Heart size={32} className="text-white" />
              </div>
              
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#40467b' }}>
                {translations.loginRequired[lang as keyof typeof translations.loginRequired]}
              </h3>
              
              <p className="text-gray-600 mb-8">
                {translations.loginMessage[lang as keyof typeof translations.loginMessage]}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold border-2 transition-all hover:bg-gray-50"
                  style={{ borderColor: 'rgba(64, 70, 123, 0.3)', color: '#40467b' }}
                >
                  {translations.cancelButton[lang as keyof typeof translations.cancelButton]}
                </button>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #40467b 0%, #5a6191 100%)' }}
                >
                  {translations.loginButton[lang as keyof typeof translations.loginButton]}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
