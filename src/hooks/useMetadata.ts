// src/hooks/useMetadata.ts
import { useEffect } from 'react'
import { metadataTranslations } from '../lib/metadata'

export function useMetadata(locale: string) {
  useEffect(() => {
    const meta = metadataTranslations[locale as keyof typeof metadataTranslations] || metadataTranslations.sk;
    
    // Aktualizuj title
    document.title = meta.title;
    
    // Aktualizuj meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', meta.description);
    } else {
      // Vytvor meta description ak neexistuje
      const newMetaDescription = document.createElement('meta');
      newMetaDescription.name = 'description';
      newMetaDescription.content = meta.description;
      document.head.appendChild(newMetaDescription);
    }
    
    // Aktualizuj meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', meta.keywords);
    } else {
      // Vytvor meta keywords ak neexistuje
      const newMetaKeywords = document.createElement('meta');
      newMetaKeywords.name = 'keywords';
      newMetaKeywords.content = meta.keywords;
      document.head.appendChild(newMetaKeywords);
    }
    
    // Aktualizuj Open Graph meta tagy
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', meta.title);
    } else {
      const newOgTitle = document.createElement('meta');
      newOgTitle.setAttribute('property', 'og:title');
      newOgTitle.content = meta.title;
      document.head.appendChild(newOgTitle);
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', meta.description);
    } else {
      const newOgDescription = document.createElement('meta');
      newOgDescription.setAttribute('property', 'og:description');
      newOgDescription.content = meta.description;
      document.head.appendChild(newOgDescription);
    }
    
    // Aktualizuj lang atribút
    document.documentElement.lang = locale;
    
  }, [locale]);
}