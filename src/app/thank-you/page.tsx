"use client";

import { useLanguage } from "@/app/components/LanguageProvider";
import { CheckCircle, Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function ThankYouContent() {
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const type = searchParams.get("type"); // 'subscription', 'donation', or 'order'

  // Clear cart after successful order
  useEffect(() => {
    if (type === 'order') {
      localStorage.removeItem('lectio_cart');
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [type]);

  const translations = {
    title: { sk: "Ďakujeme!", en: "Thank You!", cz: "Děkujeme!", es: "¡Gracias!" },
    subscriptionMessage: {
      sk: "Vaša mesačná podpora je pre nás veľkou pomocou. Ďakujeme, že ste súčasťou našej komunity!",
      en: "Your monthly support means the world to us. Thank you for being part of our community!",
      cz: "Vaše měsíční podpora je pro nás velkou pomocí. Děkujeme, že jste součástí naší komunity!",
      es: "Tu apoyo mensual significa mucho para nosotros. ¡Gracias por ser parte de nuestra comunidad!",
    },
    donationMessage: {
      sk: "Váš príspevok nám pomáha prinášať duchovný obsah ďalším ľuďom. Nech vás Boh žehná!",
      en: "Your donation helps us bring spiritual content to more people. May God bless you!",
      cz: "Váš příspěvek nám pomáhá přinášet duchovní obsah dalším lidem. Ať vás Bůh žehná!",
      es: "Tu donación nos ayuda a llevar contenido espiritual a más personas. ¡Que Dios te bendiga!",
    },
    orderMessage: {
      sk: "Vaša objednávka bola úspešne prijatá. Obdržíte potvrdenie emailom.",
      en: "Your order has been successfully received. You will receive a confirmation email.",
      cz: "Vaše objednávka byla úspěšně přijata. Obdržíte potvrzení emailem.",
      es: "Su pedido ha sido recibido exitosamente. Recibirá un correo electrónico de confirmación.",
    },
    goToAccount: { sk: "Prejsť na účet", en: "Go to account", cz: "Přejít na účet", es: "Ir a la cuenta" },
    backToHome: { sk: "Späť na domov", en: "Back to home", cz: "Zpět na domov", es: "Volver al inicio" },
    continueReading: { sk: "Pokračovať v čítaní", en: "Continue reading", cz: "Pokračovat ve čtení", es: "Continuar leyendo" },
  };

  const getIcon = () => {
    if (type === "order") return <ShoppingBag size={64} className="text-green-600" />;
    if (type === "donation") return <Heart size={64} className="text-red-500" />;
    return <CheckCircle size={64} className="text-purple-600" />;
  };

  const getMessage = () => {
    if (type === "order")
      return translations.orderMessage[lang as keyof typeof translations.orderMessage];
    if (type === "donation")
      return translations.donationMessage[lang as keyof typeof translations.donationMessage];
    return translations.subscriptionMessage[lang as keyof typeof translations.subscriptionMessage];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-12 text-center">
        <div className="mb-8">{getIcon()}</div>

        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          {translations.title[lang as keyof typeof translations.title]}
        </h1>

        <p className="text-xl text-gray-700 mb-8">{getMessage()}</p>

        {sessionId && (
          <p className="text-sm text-gray-500 mb-8">
            Session ID: <code className="bg-gray-100 px-2 py-1 rounded">{sessionId}</code>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/account"
            className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            {translations.goToAccount[lang as keyof typeof translations.goToAccount]}
          </Link>

          <Link
            href="/"
            className="bg-white text-gray-700 px-8 py-4 rounded-lg font-semibold border-2 border-gray-300 hover:bg-gray-50 transition"
          >
            {translations.backToHome[lang as keyof typeof translations.backToHome]}
          </Link>

          <Link
            href="/lectio"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition"
          >
            {translations.continueReading[lang as keyof typeof translations.continueReading]}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
