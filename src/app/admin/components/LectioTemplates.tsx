"use client";

import { BookOpen, Calendar, Sparkles, Star, Sun } from "lucide-react";

// Typ pre template
export interface LectioTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  lucideIcon?: React.ComponentType<{ size?: number; className?: string }>;
  category: 'liturgical' | 'seasonal' | 'special' | 'basic';
  fields: {
    lectio_text?: string;
    meditatio_text?: string;
    oratio_text?: string;
    contemplatio_text?: string;
    // actio_text sa NENAPLŇA z šablóny - vždy je "čítať z Božieho slova"
  };
}

// Predpripravené šablóny
export const LECTIO_TEMPLATES: LectioTemplate[] = [
  {
    id: 'blank',
    name: 'Prázdna šablóna',
    description: 'Začať od začiatku bez predvyplnených textov',
    icon: '📝',
    lucideIcon: BookOpen,
    category: 'basic',
    fields: {}
  },
  {
    id: 'sunday',
    name: 'Nedeľná liturgia',
    description: 'Štandardná štruktúra pre nedeľné čítania',
    icon: '✝️',
    lucideIcon: Sun,
    category: 'liturgical',
    fields: {
      lectio_text: 'Dnešné evanjelium nás pozýva zamyslieť sa nad...\n\nV prvom čítaní sme počuli...\n\nŽalmista nám pripomína...',
      meditatio_text: 'Keď počúvame Božie slovo v dnešnej nedeli, vnímame pozvanie...\n\nJežiš nám ukazuje cestu...\n\n• Ako sa toto posolstvo dotýka môjho života?\n• Na čo ma dnes Pán volá?',
      oratio_text: 'Pane Ježišu, ďakujem Ti za Tvoje slovo, ktoré osvecuje môj život. Pomôž mi žiť podľa Tvojho posolstva a zdieľať Tvoju lásku s druhými.',
      contemplatio_text: 'V tichu sa zastavujem a vnímam Božiu prítomnosť vo svojom srdci.\n\n"Pán je môj pastier, nič mi nechýba."'
    }
  },
  {
    id: 'advent',
    name: 'Advent',
    description: 'Príprava na Kristov príchod v adventnom čase',
    icon: '🕯️',
    lucideIcon: Sparkles,
    category: 'seasonal',
    fields: {
      lectio_text: 'V čase adventného očakávania počúvame slová...\n\nProrok nás vyzýva pripraviť cestu Pánovi...\n\nJán Krstiteľ hlása pokánie a zmenu srdca...',
      meditatio_text: 'Advent je čas prípravy srdca na Kristov príchod. Je to čas ticha, očakávania a nádeje.\n\nKde v mojom živote potrebujem prijať Kristovo svetlo?\n\n• Aké temné miesta môjho života potrebujú svetlo?\n• Ako sa môžem pripraviť na stretnutie s Pánom?',
      oratio_text: 'Príď, Pane Ježišu, do môjho srdca. Osviež ma Tvojím svetlom a pomôž mi pripraviť Ti cestu v mojom živote. Naplň ma radosťou adventného očakávania.',
      contemplatio_text: 'V tichu adventného večera vnímam, ako sa blíži svetlo.\n\n"Hľa, panna počne a porodí syna."'
    }
  },
  {
    id: 'lent',
    name: 'Pôstne obdobie',
    description: 'Cesta pokánia a obrátenia',
    icon: '⛪',
    lucideIcon: Calendar,
    category: 'seasonal',
    fields: {
      lectio_text: 'V pôstnom období nás Cirkev vedie k hlbšiemu obráteniu...\n\nDnešné čítanie nás pozýva k pokániu...\n\nJežiš nám ukazuje cestu kríža...',
      meditatio_text: 'Pôst je časom obrátenia srdca, modlitby a pôstu. Ježiš nás vedie púšťou k novému životu.\n\nČo vo mne potrebuje zomrieť, aby som mohol vstať s Kristom?\n\n• Od čoho sa potrebujem oslobodiť?\n• Ako môžem hlbšie žiť svoju vieru?',
      oratio_text: 'Pane Ježišu, sprevádzaj ma na ceste kríža. Pomôž mi niesť svoj kríž s láskou a dôverou v Tvoje víťazstvo. Obnov vo mne radosť z viery.',
      contemplatio_text: 'Idem s Ježišom cestou na Golgotu a vidím Jeho lásku.\n\n"Kto chce ísť za mnou, nech vezme svoj kríž a nasleduje ma."'
    }
  },
  {
    id: 'easter',
    name: 'Veľkonočná radosť',
    description: 'Oslava zmŕtvychvstania a nového života',
    icon: '🌅',
    lucideIcon: Star,
    category: 'seasonal',
    fields: {
      lectio_text: 'Zmŕtvychvstalý Kristus prichádza k svojim učeníkom...\n\nVeľkonočná radosť preniká celým dnešným čítaním...\n\nSmrť je premožená, Kristus žije...',
      meditatio_text: 'Veľkonočné posolstvo nádeje nás napĺňa radosťou. Kristus vstal z mŕtvych a priniesol nový život!\n\nKde v mojom živote potrebujem zmŕtvychvstanie? Čo potrebuje nový začiatok?\n\n• Kde potrebujem skúsiť Kristovo víťazstvo?\n• Akú nádej mi dáva Jeho zmŕtvychvstanie?',
      oratio_text: 'Zmŕtvychvstalý Pane, ďakujem Ti za víťazstvo nad smrťou. Naplň ma Tvojou veľkonočnou radosťou a daj mi silu žiť ako nový človek v Tebe.',
      contemplatio_text: 'V rannom svetle vidím prázdny hrob a cítim, že všetko je nové.\n\n"Čo hľadáte živého medzi mŕtvymi? Nie je tu, vstal z mŕtvych!"'
    }
  },
  {
    id: 'mary',
    name: 'Mariánske sviatky',
    description: 'Úcta k Panne Márii, Matke Božej',
    icon: '🌹',
    lucideIcon: Star,
    category: 'special',
    fields: {
      lectio_text: 'Dnes slávime pamiatku Panny Márie...\n\nMária, Matka Božia, je vzorom viery a dôvery...\n\nJej "fiat" zmenilo dejiny spásy...',
      meditatio_text: 'Mária nás učí počúvať Božie slovo a zachovávať ho v srdci. Je prvou učeníčkou a našou duchovnou matkou.\n\nČo sa môžem naučiť od Márie? Ako môžem viac dôverovať Bohu?\n\n• Ako sa môžem viac podobať Márii vo svojej viere?\n• O čo môžem Máriu prosiť?',
      oratio_text: 'Mária, Matka Božia a moja Matka, pros za mňa u svojho Syna. Nauč ma milovať Ježiša tak, ako Ty. Pomôž mi vždy povedať "áno" Božej vôli.',
      contemplatio_text: 'Vidím Máriu, ako stojí pod krížom, plná lásky a odvahy.\n\n"Hľa, služobnica Pánova, nech sa mi stane podľa tvojho slova."'
    }
  },
  {
    id: 'saint',
    name: 'Sviatok svätca',
    description: 'Inšpirácia životom svätých',
    icon: '👼',
    lucideIcon: Star,
    category: 'special',
    fields: {
      lectio_text: 'Dnes si pripomíname svätého/svätú...\n\nJeho/jej život bol svedectvom viery a lásky...\n\nNasledoval/a Krista s veľkou odvahou...',
      meditatio_text: 'Svätí sú pre nás príkladom, že je možné žiť evanjelium v každodennom živote. Ich život je cestou k svätosti.\n\nČím ma inšpiruje tento svätec? Čo sa od neho môžem naučiť?\n\n• Ako môžem nasledovať jeho príklad?\n• Na čo ma volá Boh v mojom živote?',
      oratio_text: 'Pane Ježišu, ďakujem Ti za svedectvo svätých. Pomôž mi nasledovať ich príklad a kráčať cestou svätosti. Daj mi odvahu žiť vieru každý deň.',
      contemplatio_text: 'Vidím tohto svätca, ako žiari Božou láskou a svetlom.\n\n"Svätý, svätý, svätý je Pán Boh."'
    }
  },
  {
    id: 'simple',
    name: 'Jednoduchá štruktúra',
    description: 'Stručná verzia pre každodennú meditáciu',
    icon: '🙏',
    lucideIcon: BookOpen,
    category: 'basic',
    fields: {
      lectio_text: 'V dnešnom biblickom čítaní...',
      meditatio_text: 'Toto slovo ma oslovuje...\n\n• Čo mi Boh hovorí?\n• Ako môžem toto žiť?',
      oratio_text: 'Pane, ďakujem Ti za Tvoje slovo. Pomôž mi...',
      contemplatio_text: 'V tichu vnímam Božiu prítomnosť.\n\n"Buď ticho a poznaj, že ja som Boh."'
    }
  }
];

// Helper funkcia na získanie template podľa ID
export function getTemplateById(id: string): LectioTemplate | undefined {
  return LECTIO_TEMPLATES.find(t => t.id === id);
}

// Helper funkcia na získanie templates podľa kategórie
export function getTemplatesByCategory(category: LectioTemplate['category']): LectioTemplate[] {
  return LECTIO_TEMPLATES.filter(t => t.category === category);
}
