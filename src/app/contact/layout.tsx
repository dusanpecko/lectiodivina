// app/contact/layout.tsx

import { Metadata } from 'next';
import { contactTranslations } from './translations';
import NavBar from '@/app/components/NavBar';

// Get the language from headers or use default
function getLanguage(): 'sk' | 'cz' | 'en' | 'es' {
  // This would normally come from your language detection logic
  // For now, defaulting to Slovak
  return 'sk';
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = getLanguage();
  const t = contactTranslations[lang];

  return {
    title: t.meta.title,
    description: t.meta.description,
    keywords: ['lectio divina', 'kontakt', 'aplikácia', 'modlitba', 'kresťanstvo', 'žilinská diecéza'],
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      type: 'website',
      locale: lang === 'sk' ? 'sk_SK' : lang === 'cz' ? 'cs_CZ' : lang === 'es' ? 'es_ES' : 'en_US',
      siteName: 'Lectio Divina',
    },
    twitter: {
      card: 'summary_large_image',
      title: t.meta.title,
      description: t.meta.description,
    },
    alternates: {
      canonical: '/contact',
      languages: {
        'sk': '/sk/contact',
        'cs': '/cz/contact', 
        'en': '/en/contact',
        'es': '/es/contact',
      },
    },
  };
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <NavBar />
      <main>
        {children}
      </main>
    </div>
  );
}