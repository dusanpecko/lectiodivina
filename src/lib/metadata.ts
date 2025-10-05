// src/lib/metadata.ts

export const metadataTranslations = {
  sk: {
    title: 'Lectio Divina - Duchovné čítanie a modlitby',
    description: 'Denné duchovné čítania, modlitby a meditácie pre hlbší duchovný život.',
    keywords: 'lectio divina, modlitby, duchovné čítanie, biblia, meditácie, svätí, liturgia',
  },
  en: {
    title: 'Lectio Divina - Spiritual Reading and Prayers',
    description: 'Daily spiritual readings, prayers and meditations for deeper spiritual life.',
    keywords: 'lectio divina, prayers, spiritual reading, bible, meditations, saints, liturgy',
  },
  es: {
    title: 'Lectio Divina - Lectura Espiritual y Oraciones',
    description: 'Lecturas espirituales diarias, oraciones y meditaciones para una vida espiritual más profunda.',
    keywords: 'lectio divina, oraciones, lectura espiritual, biblia, meditaciones, santos, liturgia',
  },
  cz: {
    title: 'Lectio Divina - Duchovní čtení a modlitby',
    description: 'Denní duchovní čtení, modlitby a meditace pro hlubší duchovní život.',
    keywords: 'lectio divina, modlitby, duchovní čtení, bible, meditace, svatí, liturgie',
  },
  de: {
    title: 'Lectio Divina - Geistliche Lesung und Gebete',
    description: 'Tägliche geistliche Lesungen, Gebete und Meditationen für ein tieferes geistliches Leben.',
    keywords: 'lectio divina, gebete, geistliche lesung, bibel, meditationen, heilige, liturgie',
  },
}

export function getMetadata(locale: string = 'sk') {
  const meta = metadataTranslations[locale as keyof typeof metadataTranslations] || metadataTranslations.sk;
  
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://lectio.one${locale !== 'sk' ? `/${locale}` : ''}`,
      siteName: 'Lectio Divina',
      locale: getOpenGraphLocale(locale),
      type: 'website',
    },
    alternates: {
      canonical: `https://lectio.one${locale !== 'sk' ? `/${locale}` : ''}`,
      languages: {
        'sk': 'https://lectio.one',
        'en': 'https://lectio.one',
        'es': 'https://lectio.one',
        'cz': 'https://lectio.one',
        'de': 'https://lectio.one',
      }
    }
  }
}

function getOpenGraphLocale(locale: string): string {
  const localeMap: { [key: string]: string } = {
    sk: 'sk_SK',
    en: 'en_US',
    es: 'es_ES',
    cz: 'cs_CZ',
    de: 'de_DE',
  }
  return localeMap[locale] || 'sk_SK';
}