// intro/meditatio/translations.ts

export type MeditatioTranslations = {

  stepIndicator: string;
  heroTitle: string;
  heroQuote: string;
  heroReference: string;
  heroDescription: string;

  whatIsTitle: string;
  whatIsContent1: string;
  whatIsContent2: string;
  whatIsQuote: string;

  howToTitle: string;
  howToSteps: string[];

  twoQuestionsTitle: string;
  aboutGodTitle: string;
  aboutGodList: string[];
  aboutMeTitle: string;
  aboutMeList: string[];

  practicalTitle: string;
  practicalTips: {
    icon: string;
    title: string;
    description: string;
    content: string;
  }[];

  exampleTitle: string;
  exampleVerse: string;
  exampleSteps: {
    title: string;
    content: string;
  }[];
  examplePersonal: string;
  exampleWord: string;

  closingTitle: string;
  closingText1: string;
  closingQuote: string;
  closingText2: string;

  back: string;
  next: string;
};

export const meditatioTranslations: Record<string, MeditatioTranslations> = {
  sk: {
    stepIndicator: "Krok 2 z 5",
    heroTitle: "💭 MEDITATIO – Rozjímanie",
    heroQuote: "Celé Písmo je vdýchnuté Bohom a užitočné na učenie, na vyvracanie, na nápravu a na výchovu v spravodlivosti.",
    heroReference: "2 Tim 3,16",
    heroDescription:
      "Po tom, čo sme Slovo prečítali a prijali do srdca, prichádza čas ho „žuvať“ – nechať ho v nás dozrieť, rozvinúť jeho význam. Fáza meditatio je o ponorení sa do hĺbky.",

    whatIsTitle: "🔍 Čo je Meditatio?",
    whatIsContent1:
      "Meditatio je tiché, pozorné rozjímanie. Nie intelektuálna analýza, ale počúvanie srdcom. Tu už nejde len o slová, ale o ich vnútorný odkaz, ich dotyk.",
    whatIsContent2:
      "Ako keď človek prežúva pokrm, aby z neho získal všetky živiny – tak aj v tejto fáze nechávame Slovo preniknúť naše myšlienky, pocity a dušu.",
    whatIsQuote:
      '"Božie slovo je chlieb života. Nechaj ho preniknúť do svojho vnútra, nie ako informáciu, ale ako výživu."',

    howToTitle: "🧠 Ako praktizovať rozjímanie?",
    howToSteps: [
      "Zostaň pri tom slove, vete alebo obraze, ktorý ťa oslovil počas čítania (Lectio).",
      "Opakuj si ho pomaly v mysli – akoby si ho ochutnával znova a znova.",
      "Vnímaj, čo sa v tebe hýbe: pocity, myšlienky, pozvania, výzvy, svetlo."
    ],

    twoQuestionsTitle: "❓ Dve základné otázky na rozjímanie",
    aboutGodTitle: "1. O Bohu",
    aboutGodList: [
      "Ako sa mi Boh zjavuje?",
      "Ako Otec? Ako priateľ?",
      "Ako ten, kto pozýva, utešuje, povzbudzuje?"
    ],
    aboutMeTitle: "2. O mne",
    aboutMeList: [
      "V čom je to pre mňa výzva?",
      "Kde vidím svetlo, povzbudenie, uzdravenie?",
      "Ako súvisí s tým, čo dnes prežívam?"
    ],

    practicalTitle: "✍️ Praktické návody",
    practicalTips: [
      {
        icon: "Repeat",
        title: "Opakuj si slovo",
        description: "Zostaň pri slove, ktoré ťa oslovilo v Lectio",
        content:
          "Vezmi slovo, vetu alebo obraz z predchádzajúceho čítania a opakuj si ho v mysli. Nie mechanicky, ale ako keď ochutnávaš dobré jedlo – pomaly, s pozornosťou. Nechaj ho „rozplynúť“ v tvojom srdci."
      },
      {
        icon: "MessageCircle",
        title: "Polož si otázky",
        description: "Dva kľúčové smery rozjímania",
        content:
          "Opýtaj sa seba: 1) Čo mi tento text hovorí o Bohu? Ako sa mi zjavuje? 2) Čo mi hovorí o mne a mojom živote dnes? Neponáhľaj sa s odpoveďami – nechaj ich vynoriť z teba prirodzene."
      },
      {
        icon: "Search",
        title: "Hľadaj súvislosti",
        description: "Prepoj text s biblickým kontextom",
        content:
          "Ak ti slovo pripomína inú časť Biblie, nájdi si ju. Ako Boh hovoril o tej istej téme inde? Napríklad „neboj sa“ – kde všade to Boh hovorí? Ale nejde o štúdium – ide o hlbšie počúvanie."
      },
      {
        icon: "Pause",
        title: "Zostaň v tichu",
        description: "Daj priestor Slovu, aby dozrelo",
        content:
          "Po rozjímaní neponáhľaj sa ďalej. Zostaň chvíľu v tichu ako Mária, ktorá „zachovávala tieto slová vo svojom srdci“. Nechaj Slovo vyklíčiť v tebe ako semeno v zemi."
      },
      {
        icon: "BookOpen",
        title: "Zapíš si pozorovania",
        description: "Zachovaj ovocie rozjímania",
        content:
          "Zapíš si do denníka alebo poznámok: slovo ktoré ťa oslovilo, tvoje pocity, odpovede na otázky, osobné pozorovania. Môžeš sa k nim vrátiť počas dňa alebo v budúcnosti."
      }
    ],

    exampleTitle: "📝 Príklad rozjímania",
    exampleVerse: 'Slovo ktoré ma oslovilo: "Neboj sa" (Lk 1,30)',
    exampleSteps: [
      {
        title: "Rozjímanie:",
        content:
          "Čo mi hovorí o Bohu? Boh vidí môj strach a chce ma upokojiť. Je láskavý a starostlivý."
      },
      {
        title: "",
        content:
          "Čo mi hovorí o mne? Mám právo mať strach, ale nemusím v ňom zostať. Boh ma pozýva k dôvere."
      }
    ],
    examplePersonal:
      'Dnes mám strach z pracovného pohovoru. Boh mi hovorí "neboj sa" – nie preto, že by sa nič nestalo, ale preto, že On je so mnou.',
    exampleWord: '"Neboj sa, Boh je s tebou."',

    closingTitle: "🕯️ Buď v tichu a počúvaj",
    closingText1:
      "Po odpovediach nehovor hneď ďalej. Zostaň chvíľu v tichu. Nechaj Slovo „vyklíčiť“ – tak ako semienko potrebuje čas v zemi.",
    closingQuote:
      '"Mária zachovávala všetky tieto slová vo svojom srdci." (Lk 2,19)',
    closingText2:
      "Rozjímanie je most medzi čítaním a modlitbou. Je to chvíľa, keď sa Slovo Božie stretáva s tvojím životom.",

    back: "Lectio",
    next: "Oratio"
  },

cz: {
  stepIndicator: "Krok 2 z 5",
  heroTitle: "💭 MEDITATIO – Rozjímání",
  heroQuote: "Veškeré Písmo pochází od Boha a je užitečné k učení, k usvědčování, k napravování a k výchově ve spravedlnosti.",
  heroReference: "2 Tim 3,16",
  heroDescription:
    "Poté, co jsme Boží slovo četli a přijali do srdce, přichází čas ho „přežvykovat“ – nechat ho v nás uzrát, rozvinout jeho smysl. Fáze meditatio je o ponoření se do hloubky.",

  whatIsTitle: "🔍 Co je Meditatio?",
  whatIsContent1:
    "Meditatio je tiché, soustředěné rozjímání. Není to intelektuální analýza, ale naslouchání srdcem. Nejde už jen o slova, ale o jejich vnitřní poselství, dotek.",
  whatIsContent2:
    "Jako když člověk přežvykuje potravu, aby z ní získal všechnu výživu – tak i v této fázi necháváme Slovo proniknout naše myšlenky, pocity a duši.",
  whatIsQuote:
    "\"Boží slovo je chléb života. Nech ho proniknout do svého nitra – ne jako informaci, ale jako výživu.\"",

  howToTitle: "🧠 Jak praktikovat rozjímání?",
  howToSteps: [
    "Zůstaň u toho slova, věty nebo obrazu, který tě oslovil při čtení (Lectio).",
    "Opakuj si ho pomalu v mysli – jako bys ho znovu ochutnával.",
    "Vnímej, co se v tobě děje: pocity, myšlenky, pozvání, výzvy, světlo."
  ],

  twoQuestionsTitle: "❓ Dvě základní otázky k rozjímání",
  aboutGodTitle: "1. O Bohu",
  aboutGodList: [
    "Jak se mi Bůh zjevuje?",
    "Jako Otec? Jako přítel?",
    "Jako ten, kdo zve, těší, povzbuzuje?"
  ],
  aboutMeTitle: "2. O mně",
  aboutMeList: [
    "V čem je to pro mě výzva?",
    "Kde vidím světlo, povzbuzení, uzdravení?",
    "Jak to souvisí s tím, co právě prožívám?"
  ],

  practicalTitle: "✍️ Praktické návody",
  practicalTips: [
    {
      icon: "Repeat",
      title: "Opakuj si slovo",
      description: "Zůstaň u slova, které tě oslovilo v Lectio",
      content:
        "Vezmi si slovo, větu nebo obraz z předchozího čtení a opakuj si ho v mysli. Ne mechanicky, ale jako když vychutnáváš dobré jídlo – pomalu a pozorně. Nech ho „rozplynout“ ve svém srdci."
    },
    {
      icon: "MessageCircle",
      title: "Polož si otázky",
      description: "Dva klíčové směry rozjímání",
      content:
        "Zeptej se sám sebe: 1) Co mi tento text říká o Bohu? Jak se mi zjevuje? 2) Co mi říká o mně a mém životě dnes? Nespěchej s odpověďmi – nech je přirozeně vyvstat."
    },
    {
      icon: "Search",
      title: "Hledej souvislosti",
      description: "Propoj text s biblickým kontextem",
      content:
        "Pokud ti slovo připomíná jinou část Bible, najdi si ji. Jak Bůh mluví o tomtéž jinde? Například „neboj se“ – kde všude to říká? Nejde o studium – ale o hlubší naslouchání."
    },
    {
      icon: "Pause",
      title: "Zůstaň v tichu",
      description: "Dej Slovu prostor dozrát",
      content:
        "Po rozjímání se hned neposouvej dál. Zůstaň chvíli v tichu jako Maria, která „uchovávala ta slova ve svém srdci“. Nech Slovo v sobě klíčit jako semínko v zemi."
    },
    {
      icon: "BookOpen",
      title: "Zapiš si postřehy",
      description: "Zachyť ovoce rozjímání",
      content:
        "Zapiš si do deníku nebo poznámek: slovo, které tě oslovilo, své pocity, odpovědi na otázky, osobní postřehy. Můžeš se k nim vracet během dne nebo později."
    }
  ],

  exampleTitle: "📝 Příklad rozjímání",
  exampleVerse: 'Slovo, které mě oslovilo: "Neboj se" (Lk 1,30)',
  exampleSteps: [
    {
      title: "Rozjímání:",
      content:
        "Co mi říká o Bohu? Bůh vidí můj strach a chce mě utišit. Je laskavý a starostlivý."
    },
    {
      title: "",
      content:
        "Co mi říká o mně? Mám právo mít strach, ale nemusím v něm zůstat. Bůh mě zve k důvěře."
    }
  ],
  examplePersonal:
    "Dnes mám strach z pracovního pohovoru. Bůh mi říká \"neboj se\" – ne proto, že by se nic nestalo, ale protože On je se mnou.",
  exampleWord: "\"Neboj se, Bůh je s tebou.\"",

  closingTitle: "🕯️ Buď v tichu a naslouchej",
  closingText1:
    "Po odpovědích hned nemluv dál. Zůstaň chvíli v tichu. Nech Slovo „klíčit“ – jako semínko potřebuje čas v zemi.",
  closingQuote:
    "\"Maria uchovávala všechna ta slova ve svém srdci.\" (Lk 2,19)",
  closingText2:
    "Rozjímání je most mezi čtením a modlitbou. Je to chvíle, kdy se Boží slovo setkává s tvým životem.",

  back: "Lectio",
  next: "Oratio"
},
en: {
  stepIndicator: "Step 2 of 5",
  heroTitle: "💭 MEDITATIO – Meditation",
  heroQuote: "All Scripture is inspired by God and is useful for teaching, for refutation, for correction, and for training in righteousness.",
  heroReference: "2 Tim 3:16",
  heroDescription:
    "After reading and receiving the Word into our hearts, it is time to \"chew\" it – to let it mature within us and unfold its meaning. The meditatio phase is about diving deep.",

  whatIsTitle: "🔍 What is Meditatio?",
  whatIsContent1:
    "Meditatio is quiet, attentive reflection. It’s not an intellectual analysis, but a listening with the heart. It’s no longer just about words, but about their inner message, their touch.",
  whatIsContent2:
    "Just like we chew food slowly to draw all nourishment from it – in this phase, we let the Word penetrate our thoughts, feelings, and soul.",
  whatIsQuote:
    "\"God’s Word is the bread of life. Let it enter your innermost being – not as information, but as nourishment.\"",  

  howToTitle: "🧠 How to Practice Meditation?",
  howToSteps: [
    "Stay with the word, phrase, or image that touched you during the reading (Lectio).",
    "Repeat it slowly in your mind – as if you were savoring it again and again.",
    "Notice what stirs in you: feelings, thoughts, invitations, challenges, light."
  ],

  twoQuestionsTitle: "❓ Two Fundamental Questions for Meditation",
  aboutGodTitle: "1. About God",
  aboutGodList: [
    "How is God revealing Himself to me?",
    "As a Father? As a friend?",
    "As the One who invites, comforts, encourages?"
  ],
  aboutMeTitle: "2. About Me",
  aboutMeList: [
    "In what way is this a challenge for me?",
    "Where do I see light, encouragement, healing?",
    "How does it relate to what I’m experiencing today?"
  ],

  practicalTitle: "✍️ Practical Tips",
  practicalTips: [
    {
      icon: "Repeat",
      title: "Repeat the Word",
      description: "Stay with the word that touched you in Lectio",
      content:
        "Take the word, phrase, or image from the reading and repeat it in your mind. Not mechanically, but like savoring a delicious meal – slowly and attentively. Let it dissolve into your heart."
    },
    {
      icon: "MessageCircle",
      title: "Ask Questions",
      description: "Two essential directions for meditation",
      content:
        "Ask yourself: 1) What does this text say about God? How is He revealing Himself? 2) What does it say about me and my life today? Don’t rush – let the answers rise naturally from within."
    },
    {
      icon: "Search",
      title: "Look for Connections",
      description: "Link the text with the broader biblical context",
      content:
        "If a word reminds you of another Scripture, look it up. How has God spoken about this theme elsewhere? For example, “do not be afraid” – where else does He say that? It’s not about studying, but deeper listening."
    },
    {
      icon: "Pause",
      title: "Remain in Silence",
      description: "Give the Word space to grow",
      content:
        "After meditating, don’t rush ahead. Remain in silence, like Mary who \"kept all these things in her heart.\" Let the Word take root like a seed in the soil."
    },
    {
      icon: "BookOpen",
      title: "Write Down Observations",
      description: "Preserve the fruit of meditation",
      content:
        "Jot down in a journal or notes: the word that spoke to you, your feelings, responses, personal insights. You may return to them later today or in the future."
    }
  ],

  exampleTitle: "📝 Example of Meditation",
  exampleVerse: 'Word that touched me: "Do not be afraid" (Lk 1:30)',
  exampleSteps: [
    {
      title: "Meditation:",
      content:
        "What does it say about God? He sees my fear and wants to calm me. He is kind and caring."
    },
    {
      title: "",
      content:
        "What does it say about me? It’s okay to be afraid, but I don’t have to stay in fear. God invites me to trust."
    }
  ],
  examplePersonal:
    "Today I’m afraid of a job interview. God tells me “do not be afraid” – not because nothing will happen, but because He is with me.",
  exampleWord: "\"Do not be afraid, God is with you.\"",

  closingTitle: "🕯️ Be Silent and Listen",
  closingText1:
    "Don’t speak immediately after the answers. Stay in silence. Let the Word \"take root\" – just as a seed needs time in the soil.",
  closingQuote:
    "\"Mary kept all these things in her heart.\" (Lk 2:19)",
  closingText2:
    "Meditation is the bridge between reading and prayer. It’s the moment when God’s Word meets your life.",

  back: "Lectio",
  next: "Oratio"
},

es: {
  stepIndicator: "Paso 2 de 5",
  heroTitle: "💭 MEDITATIO – Meditación",
  heroQuote: "Toda la Escritura está inspirada por Dios y es útil para enseñar, para reprender, para corregir y para educar en la justicia.",
  heroReference: "2 Tim 3,16",
  heroDescription:
    "Después de leer y acoger la Palabra en el corazón, llega el momento de “rumiarla” – dejar que madure en nosotros y despliegue su significado. La fase de meditatio es una inmersión profunda.",

  whatIsTitle: "🔍 ¿Qué es la Meditatio?",
  whatIsContent1:
    "Meditatio es una reflexión silenciosa y atenta. No es un análisis intelectual, sino una escucha con el corazón. Ya no se trata solo de palabras, sino de su mensaje interior, su toque.",
  whatIsContent2:
    "Así como se mastica lentamente el alimento para extraer todos sus nutrientes, en esta fase dejamos que la Palabra penetre nuestros pensamientos, sentimientos y alma.",
  whatIsQuote:
    "\"La Palabra de Dios es pan de vida. Déjala entrar en tu interior, no como información, sino como alimento.\"",

  howToTitle: "🧠 ¿Cómo practicar la meditación?",
  howToSteps: [
    "Permanece con la palabra, frase o imagen que resonó durante la lectura (Lectio).",
    "Repítela lentamente en tu mente, como si la saborearas una y otra vez.",
    "Observa lo que se mueve en ti: sentimientos, pensamientos, invitaciones, desafíos, luz."
  ],

  twoQuestionsTitle: "❓ Dos preguntas clave para meditar",
  aboutGodTitle: "1. Sobre Dios",
  aboutGodList: [
    "¿Cómo se me revela Dios?",
    "¿Como Padre? ¿Como amigo?",
    "¿Como quien invita, consuela, anima?"
  ],
  aboutMeTitle: "2. Sobre mí",
  aboutMeList: [
    "¿En qué es esto un desafío para mí?",
    "¿Dónde veo luz, consuelo, sanación?",
    "¿Cómo se relaciona con lo que vivo hoy?"
  ],

  practicalTitle: "✍️ Consejos prácticos",
  practicalTips: [
    {
      icon: "Repeat",
      title: "Repite la palabra",
      description: "Permanece con la palabra que te tocó en Lectio",
      content:
        "Toma la palabra, frase o imagen de la lectura anterior y repítela en tu mente. No de forma mecánica, sino como quien saborea un buen plato – lentamente y con atención. Déjala fundirse en tu corazón."
    },
    {
      icon: "MessageCircle",
      title: "Hazte preguntas",
      description: "Dos direcciones clave para meditar",
      content:
        "Pregúntate: 1) ¿Qué me dice este texto sobre Dios? ¿Cómo se revela? 2) ¿Qué me dice sobre mí y mi vida hoy? No te apresures – deja que las respuestas emerjan naturalmente."
    },
    {
      icon: "Search",
      title: "Busca conexiones",
      description: "Relaciona el texto con otros pasajes bíblicos",
      content:
        "Si una palabra te recuerda otro pasaje bíblico, búscalo. ¿Cómo ha hablado Dios sobre este tema en otros lugares? Por ejemplo, “no temas” – ¿dónde más lo dice? No se trata de estudiar, sino de escuchar más profundamente."
    },
    {
      icon: "Pause",
      title: "Permanece en silencio",
      description: "Dale espacio a la Palabra para que madure",
      content:
        "Después de meditar, no sigas enseguida. Quédate un momento en silencio, como María que “guardaba todas estas cosas en su corazón”. Deja que la Palabra germine como una semilla en la tierra."
    },
    {
      icon: "BookOpen",
      title: "Escribe lo que has descubierto",
      description: "Guarda el fruto de tu meditación",
      content:
        "Escribe en un diario o cuaderno: la palabra que te tocó, tus sentimientos, respuestas, observaciones personales. Puedes volver a ellas durante el día o más adelante."
    }
  ],

  exampleTitle: "📝 Ejemplo de meditación",
  exampleVerse: 'Palabra que resuena: "No temas" (Lc 1,30)',
  exampleSteps: [
    {
      title: "Meditación:",
      content:
        "¿Qué me dice sobre Dios? Dios ve mi miedo y quiere calmarme. Es bondadoso y cuidadoso."
    },
    {
      title: "",
      content:
        "¿Qué me dice sobre mí? Tengo derecho a tener miedo, pero no debo quedarme en él. Dios me invita a confiar."
    }
  ],
  examplePersonal:
    "Hoy tengo miedo por una entrevista de trabajo. Dios me dice \"no temas\" – no porque no vaya a pasar nada, sino porque Él está conmigo.",
  exampleWord: "\"No temas, Dios está contigo.\"",

  closingTitle: "🕯️ Permanece en silencio y escucha",
  closingText1:
    "No hables de inmediato después de meditar. Quédate un momento en silencio. Deja que la Palabra \"germine\" – como una semilla necesita tiempo bajo tierra.",
  closingQuote:
    "\"María guardaba todas estas cosas en su corazón.\" (Lc 2,19)",
  closingText2:
    "La meditación es el puente entre la lectura y la oración. Es el momento en que la Palabra de Dios se encuentra con tu vida.",

  back: "Lectio",
  next: "Oratio"
},


};
