'use client';

import { useLanguage } from '@/app/components/LanguageProvider';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

export default function SupportContactPage() {
  const { lang } = useLanguage();

  const translations = {
    sk: {
      title: 'Kontakt & Podpora',
      subtitle: 'Potrebujete pomoc? Sme tu pre vás.',
      email: 'Email',
      emailAddress: 'info@lectiodivina.sk',
      phone: 'Telefón',
      phoneNumber: '+421 XXX XXX XXX',
      hours: 'Pracovné hodiny',
      hoursText: 'Pondelok - Piatok: 9:00 - 17:00',
      address: 'Adresa',
      addressText: 'Slovensko',
      contactForm: 'Kontaktný formulár',
      name: 'Meno',
      emailPlaceholder: 'vas@email.sk',
      subject: 'Predmet',
      message: 'Správa',
      send: 'Odoslať správu',
      faq: 'Často kladené otázky',
      faqItems: [
        {
          q: 'Ako zrušiť predplatné?',
          a: 'Predplatné môžete zrušiť kedykoľvek vo svojom účte v sekcii Nastavenia.',
        },
        {
          q: 'Ako zmeniť údaje na faktúre?',
          a: 'Kontaktujte nás emailom a my vám pomôžeme upraviť fakturačné údaje.',
        },
        {
          q: 'Kde nájdem moje objednávky?',
          a: 'Všetky objednávky nájdete vo svojom účte v sekcii "Moje objednávky".',
        },
        {
          q: 'Problém s platbou?',
          a: 'Ak máte problém s platbou, kontaktujte nás a pomôžeme vám vyriešiť situáciu.',
        },
      ],
      returnPolicy: 'Vrátenie a reklamácie',
      returnText: 'Fyzické produkty je možné vrátiť do 14 dní od doručenia. Pre digitálne predplatné platia všeobecné obchodné podmienky.',
    },
    en: {
      title: 'Contact & Support',
      subtitle: 'Need help? We\'re here for you.',
      email: 'Email',
      emailAddress: 'info@lectiodivina.sk',
      phone: 'Phone',
      phoneNumber: '+421 XXX XXX XXX',
      hours: 'Working hours',
      hoursText: 'Monday - Friday: 9:00 - 17:00',
      address: 'Address',
      addressText: 'Slovakia',
      contactForm: 'Contact form',
      name: 'Name',
      emailPlaceholder: 'your@email.com',
      subject: 'Subject',
      message: 'Message',
      send: 'Send message',
      faq: 'Frequently asked questions',
      faqItems: [
        {
          q: 'How to cancel subscription?',
          a: 'You can cancel your subscription anytime in your account settings.',
        },
        {
          q: 'How to change invoice details?',
          a: 'Contact us by email and we will help you update your billing information.',
        },
        {
          q: 'Where can I find my orders?',
          a: 'All orders can be found in your account under "My Orders" section.',
        },
        {
          q: 'Payment issues?',
          a: 'If you have payment problems, contact us and we will help resolve the situation.',
        },
      ],
      returnPolicy: 'Returns and complaints',
      returnText: 'Physical products can be returned within 14 days of delivery. Digital subscriptions are subject to general terms and conditions.',
    },
    cz: {
      title: 'Kontakt & Podpora',
      subtitle: 'Potřebujete pomoc? Jsme tu pro vás.',
      email: 'Email',
      emailAddress: 'info@lectiodivina.sk',
      phone: 'Telefon',
      phoneNumber: '+421 XXX XXX XXX',
      hours: 'Pracovní doba',
      hoursText: 'Pondělí - Pátek: 9:00 - 17:00',
      address: 'Adresa',
      addressText: 'Slovensko',
      contactForm: 'Kontaktní formulář',
      name: 'Jméno',
      emailPlaceholder: 'vas@email.cz',
      subject: 'Předmět',
      message: 'Zpráva',
      send: 'Odeslat zprávu',
      faq: 'Často kladené otázky',
      faqItems: [
        {
          q: 'Jak zrušit předplatné?',
          a: 'Předplatné můžete zrušit kdykoli ve svém účtu v sekci Nastavení.',
        },
        {
          q: 'Jak změnit údaje na faktuře?',
          a: 'Kontaktujte nás emailem a my vám pomůžeme upravit fakturační údaje.',
        },
        {
          q: 'Kde najdu své objednávky?',
          a: 'Všechny objednávky najdete ve svém účtu v sekci "Moje objednávky".',
        },
        {
          q: 'Problém s platbou?',
          a: 'Pokud máte problém s platbou, kontaktujte nás a pomůžeme vám situaci vyřešit.',
        },
      ],
      returnPolicy: 'Vrácení a reklamace',
      returnText: 'Fyzické produkty je možné vrátit do 14 dnů od doručení. Pro digitální předplatné platí všeobecné obchodní podmínky.',
    },
    es: {
      title: 'Contacto y Soporte',
      subtitle: '¿Necesita ayuda? Estamos aquí para usted.',
      email: 'Correo electrónico',
      emailAddress: 'info@lectiodivina.sk',
      phone: 'Teléfono',
      phoneNumber: '+421 XXX XXX XXX',
      hours: 'Horario de trabajo',
      hoursText: 'Lunes - Viernes: 9:00 - 17:00',
      address: 'Dirección',
      addressText: 'Eslovaquia',
      contactForm: 'Formulario de contacto',
      name: 'Nombre',
      emailPlaceholder: 'su@email.es',
      subject: 'Asunto',
      message: 'Mensaje',
      send: 'Enviar mensaje',
      faq: 'Preguntas frecuentes',
      faqItems: [
        {
          q: '¿Cómo cancelar la suscripción?',
          a: 'Puede cancelar su suscripción en cualquier momento en la configuración de su cuenta.',
        },
        {
          q: '¿Cómo cambiar los datos de la factura?',
          a: 'Contáctenos por correo electrónico y le ayudaremos a actualizar sus datos de facturación.',
        },
        {
          q: '¿Dónde encuentro mis pedidos?',
          a: 'Todos los pedidos se encuentran en su cuenta en la sección "Mis pedidos".',
        },
        {
          q: '¿Problemas con el pago?',
          a: 'Si tiene problemas con el pago, contáctenos y le ayudaremos a resolver la situación.',
        },
      ],
      returnPolicy: 'Devoluciones y reclamaciones',
      returnText: 'Los productos físicos se pueden devolver dentro de los 14 días posteriores a la entrega. Las suscripciones digitales están sujetas a los términos y condiciones generales.',
    },
  };

  const t = translations[lang as keyof typeof translations] || translations.sk;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-xl text-gray-600">{t.subtitle}</p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <a
            href={`mailto:${t.emailAddress}`}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="text-blue-600" size={24} />
              </div>
              <h3 className="font-semibold text-lg">{t.email}</h3>
            </div>
            <p className="text-gray-600 text-sm">{t.emailAddress}</p>
          </a>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone className="text-green-600" size={24} />
              </div>
              <h3 className="font-semibold text-lg">{t.phone}</h3>
            </div>
            <p className="text-gray-600 text-sm">{t.phoneNumber}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="text-purple-600" size={24} />
              </div>
              <h3 className="font-semibold text-lg">{t.hours}</h3>
            </div>
            <p className="text-gray-600 text-sm">{t.hoursText}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <MapPin className="text-orange-600" size={24} />
              </div>
              <h3 className="font-semibold text-lg">{t.address}</h3>
            </div>
            <p className="text-gray-600 text-sm">{t.addressText}</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageCircle className="text-blue-600" />
            {t.faq}
          </h2>
          <div className="space-y-6">
            {t.faqItems.map((item, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                <h3 className="font-semibold text-lg mb-2">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Return Policy */}
        <div className="bg-blue-50 rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4">{t.returnPolicy}</h2>
          <p className="text-gray-700">{t.returnText}</p>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center text-gray-600">
          <p className="mb-2">
            Lectio Divina - Modlitba pre každého
          </p>
          <p className="text-sm">
            © 2025 Lectio.one | Všetky práva vyhradené
          </p>
        </div>
      </div>
    </div>
  );
}
