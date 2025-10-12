// app/about/i18n.ts
import { Language } from "../components/LanguageProvider";

interface SupportWay {
  title: string;
  text: string;
  link?: string;
  button?: string;
}

interface TeamMember {
  name: string;
  role: string;
  bio: string;
}

interface Stats {
  downloads: string;
  downloads_desc: string;
  feedback: string;
  feedback_desc: string;
  fruits: string;
  fruits_desc: string;
}

interface AboutTranslation {
  title: string;
  subtitle: string;
  origin: {
    title: string;
    text: string;
  };
  vision: {
    title: string;
    text: string;
  };
  what_is: {
    title: string;
    text: string;
  };
  proven_project: {
    title: string;
    text: string;
  };
  stats: Stats;
  team: {
    title: string;
    description: string;
    show_bio: string;
    contact_link: string;
    members: TeamMember[];
  };
  new_version: {
    title: string;
    completed: string;
    completed_text: string;
    working_on: string;
    features: string[];
  };
  support: {
    title: string;
    subtitle: string;
    intro: string;
    ways: SupportWay[];
  };
  conclusion: {
    text: string;
    thanks: string;
  };
}

export const aboutTranslations: Record<Language, AboutTranslation> = {
  sk: {
    title: "O projekte Lectio Divina",
    subtitle: "Naša cesta k hlbšiemu vzťahu s Bohom cez jeho Slovo",
    
    origin: {
      title: "Ako sa to všetko začalo",
      text: "Všetko sa začalo na jednom výlete s birmovancami. Videl som, ako veľmi mladí ľudia potrebujú venovať čas čítaniu Svätého písma a rozjímaniu nad ním. Uvedomil som si, že len tak sa z nich môžu stávať kvalitní kresťania, ktorí aktívne žijú kresťanské hodnoty v našom svete. Z tejto túžby sa zrodila prvá verzia aplikácie Lectio Divina."
    },

    vision: {
      title: "Naša vízia",
      text: "Dnes, s odstupom času a povzbudení obrovským záujmom, stojíme na prahu novej etapy. Pracujeme na úplne novej verzii aplikácie, pretože veríme slovám pápeža Benedikta XVI., že „stále čítanie Svätého písma, sprevádzané modlitbou, prinesie Cirkvi novú duchovnú jar.\" Naším cieľom je, aby táto aplikácia bola moderným a dostupným nástrojom, ktorý vám pomôže prežívať túto „novú duchovnú jar\" priamo vo vašom živote."
    },

    what_is: {
      title: "Čo je to Lectio Divina?",
      text: "\"Lectio Divina\" znamená \"božské čítanie\". Je to starobylá prax modlitby nad Písmom, ktorá nás pozýva zotrvať nad biblickým textom, takmer ho „prežúvať\", aby sme z neho vyťažili „šťavu\", ktorá živí našu dušu. Kľúčom nie je text iba intelektuálne pochopiť, ale ako radí aj návod v aplikácii: „Nechajte text na seba pôsobiť.\" Ide o to, aby sme sa v tichu pýtali: Čo mi tento text hovorí? Aké pocity a emócie vo mne vyvoláva? A napokon, v kontemplácii, jednoducho spočinúť v Božej prítomnosti ako jeho milované dieťa."
    },

    proven_project: {
      title: "Osvedčený projekt s víziou do budúcnosti",
      text: "Prvá verzia aplikácie nám ukázala, že túžba po hlbšom vzťahu s Bohom cez jeho Slovo je obrovská. Za prvý mesiac si ju stiahlo viac ako päťtisíc ľudí! Dostali sme úžasné ohlasy od jednotlivcov, rodín aj spoločenstiev. Videli sme, ako sa Lectio Divina stalo súčasťou stretiek s mladými či rodinami a ako im táto prax dáva „úžasnú možnosť rásť v hodnotách\". Práve tento osvedčený úspech a reálny dopad nás motivujú ísť ďalej. Nová verzia nie je len vylepšením, ale krokom vpred, postaveným na pevných základoch a spätnej väzbe od používateľov."
    },

    stats: {
      downloads: "5000+",
      downloads_desc: "Stiahnutí za prvý mesiac",
      feedback: "100%",
      feedback_desc: "Pozitívna spätná väzba",
      fruits: "∞",
      fruits_desc: "Duchovné ovocie"
    },

    team: {
      title: "Náš tím",
      description: "Spoznajte ľudí, ktorí stoja za projektom Lectio Divina a každý deň pracujú na tom, aby ste mohli prežívať hlbší vzťah s Bohom.",
      show_bio: "Zobraziť bio",
      contact_link: "Môj kontakt →",
      members: [
        {
          name: "o Dušan Pecko",
          role: "Zakladateľ a vedúci projektu",
          bio: "o. Dušan je kňaz Žilinskej diecézy a zakladateľ projektu Lectio Divina. Jeho vášňou je pomáhať ľuďom objavovať hlbší vzťah s Bohom cez Božie slovo. Pôsobí ako výkonný riaditeľ diecézneho pastoračného fondu KROK, ktorý podporuje pastoráciu a duchovné iniciatívy v Žilinskej diecéze."
        },
        {
          name: "Adam Čižmárik",
          role: "Prekladateľ a člen tímu pre rozvoj projektu",
          bio: "Adam je členom projektu od jeho začiatkov. Pracuje na prekladoch do angličtiny a popri tom študuje právo, kde je v druhom ročníku. Usiluje sa žiť podľa princípov Lectio Divina a prenášať ich do každodenného života. Je autorom projektu mypro.one, ktorý sa venuje digitálnym vizitkám a moderným formám online identity."
        },
        {
          name: "Kristínka Krchová",
          role: "Koordinátorka obsahu a srdce projektu",
          bio: "Kristínka je súčasťou projektu od jeho začiatkov a stála pri budovaní jeho základov. Vďaka jej trpezlivej práci boli do databázy zapracované všetky údaje, pričom venovala projektu nespočetné hodiny. Je srdcom tímu Lectio Divina a aj počas materskej zostáva jeho neoddeliteľnou súčasťou."
        },
        {
          name: "sr. Mary Carmen",
          role: "Koordinátorka španielskeho prekladu",
          bio: "Sr. Mary Carmen pochádza zo Španielska a je rehoľnou sestrou Kongregácie Sestier Panny Márie Útechy. Spolu so svojimi spolusestrami má na starosti preklad projektu Lectio Divina do španielčiny a tvorí modlitbové zázemie, ktoré sprevádza celý projekt s duchovnou podporou a modlitbou."
        },
        {
          name: "Matúš Sedliak",
          role: "Grafický a audio tvorca projektu",
          bio: "Matúš je najmladším členom tímu – má len 16 rokov a svoju prax začal v pastoračnom fonde KROK. Myšlienka projektu Lectio Divina ho nadchla natoľko, že sa stal jeho aktívnou súčasťou. Zodpovedá za grafické prvky projektu a stará sa aj o generovanie zvuku prostredníctvom ElevenLabs. Sme vďační, že je súčasťou tímu – prináša tvorivosť, nadšenie a svieži pohľad."
        }
      ]
    },

    new_version: {
      title: "Na čo sa môžete tešiť v novej verzii?",
      completed: "Už je hotové:",
      completed_text: "Srdce aplikácie s moderným dizajnom, prehrávaním zamyslení a modulom pre prosby o modlitbu.",
      working_on: "Na čom pracujeme:",
      features: [
        "Notifikačný systém: Jemná pripomienka na váš čas stíšenia.",
        "Widget na plochu: Božie slovo na jeden dotyk.",
        "Tvorba obsahu: Pripravujeme nové zamyslenia v slovenčine, češtine, angličtine, nemčine a španielčine.",
        "Prístupnosť: Tmavý a svetlý režim a automatické prispôsobenie veľkosti písma."
      ]
    },

    support: {
      title: "Staňte sa súčasťou našej misie",
      subtitle: "Ako môžete pomôcť?",
      intro: "Tento projekt je dielom mnohých ochotných sŕdc. Aby sme ho mohli úspešne dokončiť a dlhodobo prevádzkovať, obraciame sa s prosbou o pomoc aj na vás.",
      
      ways: [
        {
          title: "Priama finančná podpora",
          text: "Vývoj, údržba serverov a tvorba kvalitného obsahu si vyžadujú nemalé finančné zdroje. Vaša podpora nám umožní nielen dokončiť plánované funkcie, ale aj dlhodobo zabezpečiť chod a rozvoj aplikácie.",
          link: "https://dcza.24-pay.sk/darovat/lectio-divina",
          button: "Podporiť projekt"
        },
        {
          title: "Podporný balíček",
          text: "Môžete si objednať náš podporný balíček (tričko, pero, šnúrka na kľúče). Pošleme vám ho domov a následne je na vašom slobodnom rozhodnutí, akou čiastkou sa rozhodnete projekt podporiť."
        },
        {
          title: "Podpora pre firmy",
          text: "Firmám ponúkame možnosť zviditeľniť svoje logo v sekcii \"Donátori a podporovatelia\" a spojiť tak svoje meno s projektom, ktorý má hlboký duchovný a spoločenský rozmer."
        },
        {
          title: "Nápady a spätná väzba",
          text: "Vaše postrehy sú pre nás zlatom. Napíšte nám svoje nápady."
        },
        {
          title: "Modlitbová podpora",
          text: "Prosíme vás o modlitby za celý tím a za to, aby táto aplikácia priniesla bohaté duchovné ovocie všetkým, ktorí ju budú používať."
        }
      ]
    },

    conclusion: {
      text: "Či už budete Lectio Divina praktizovať sami, v rodine alebo v spoločenstve, veríme, že váš život s Bohom sa prostredníctvom čítania jeho Slova začne prehlbovať.",
      thanks: "Ďakujeme vám za vašu priazeň a akúkoľvek formu pomoci!"
    }
  },
  cz: {
    title: "O projektu Lectio Divina",
    subtitle: "Naše cesta k hlubšímu vztahu s Bohem skrze jeho Slovo",
    origin: {
      title: "Jak to všechno začalo",
      text: "Všechno začalo na jednom výletě s biřmovanci. Viděl jsem, jak moc mladí lidé potřebují věnovat čas čtení Písma a rozjímání nad ním. Uvědomil jsem si, že jen tak se z nich mohou stát kvalitní křesťané, kteří aktivně žijí křesťanské hodnoty v našem světě. Z této touhy vznikla první verze aplikace Lectio Divina."
    },
    vision: {
      title: "Naše vize",
      text: "Dnes, s odstupem času a povzbuzeni obrovským zájmem, stojíme na prahu nové etapy. Pracujeme na zcela nové verzi aplikace, protože věříme slovům papeže Benedikta XVI., že „stále čtení Písma, doprovázené modlitbou, přinese Církvi nové duchovní jaro.\" Naším cílem je, aby tato aplikace byla moderním a dostupným nástrojem, který vám pomůže prožívat toto „nové duchovní jaro\" přímo ve vašem životě."
    },
    what_is: {
      title: "Co je Lectio Divina?",
      text: "\"Lectio Divina\" znamená \"božské čtení\". Je to starobylá praxe modlitby nad Písmem, která nás zve setrvat nad biblickým textem, téměř ho „přežvykovat\", abychom z něj získali „šťávu\", která živí naši duši. Klíčem není text pouze intelektuálně pochopit, ale jak radí i návod v aplikaci: „Nechte text na sebe působit.\" Jde o to, abychom se v tichu ptali: Co mi tento text říká? Jaké pocity a emoce ve mně vyvolává? A nakonec, v kontemplaci, jednoduše spočinout v Boží přítomnosti jako jeho milované dítě."
    },
    proven_project: {
      title: "Osvědčený projekt s vizí do budoucna",
      text: "První verze aplikace nám ukázala, že touha po hlubším vztahu s Bohem skrze jeho Slovo je obrovská. Za první měsíc si ji stáhlo více než pět tisíc lidí! Dostali jsme úžasné ohlasy od jednotlivců, rodin i společenství. Viděli jsme, jak se Lectio Divina stalo součástí setkání s mladými či rodinami a jak jim tato praxe dává „úžasnou možnost růst v hodnotách\". Právě tento osvědčený úspěch a reálný dopad nás motivují jít dál. Nová verze není jen vylepšením, ale krokem vpřed, postaveným na pevných základech a zpětné vazbě od uživatelů."
    },

    stats: {
      downloads: "5000+",
      downloads_desc: "Stažení za první měsíc",
      feedback: "100%",
      feedback_desc: "Pozitivní zpětná vazba",
      fruits: "∞",
      fruits_desc: "Duchovní ovoce"
    },

    team: {
      title: "Náš tým",
      description: "Poznáte lidi, kteří stojí za projektem Lectio Divina a každý den pracují na tom, abyste mohli prožívat hlubší vztah s Bohem.",
      show_bio: "Zobrazit bio",
      contact_link: "Můj kontakt →",
      members: [
        {
          name: "o Dušan Pecko",
          role: "Zakladatel a vedoucí projektu",
          bio: "o. Dušan je kněz Žilinské diecéze a zakladatel projektu Lectio Divina. Jeho vášní je pomáhat lidem objevovat hlubší vztah s Bohem skrze Boží slovo. Působí jako výkonný ředitel diecézního pastorálního fondu KROK, který podporuje pastoraci a duchovní iniciativy v Žilinské diecézi."
        },
        {
          name: "Adam Čižmárik",
          role: "Překladatel a člen týmu pro rozvoj projektu",
          bio: "Adam je členem projektu od jeho začátků. Pracuje na překladech do angličtiny a vedle toho studuje právo, kde je ve druhém ročníku. Snaží se žít podle principů Lectio Divina a přenášet je do každodenního života. Je autorem projektu mypro.one, který se věnuje digitálním vizitkám a moderním formám online identity."
        },
        {
          name: "Kristínka Krchová",
          role: "Koordinátorka obsahu a srdce projektu",
          bio: "Kristínka je součástí projektu od jeho začátků a stála při budování jeho základů. Díky její trpělivé práci byly do databáze zpracovány všechny údaje, přičemž věnovala projektu nespočetné hodiny. Je srdcem týmu Lectio Divina a i během mateřské zůstává jeho neoddělitelnou součástí."
        },
        {
          name: "sr. Mary Carmen",
          role: "Koordinátorka španělského překladu",
          bio: "Sr. Mary Carmen pochází ze Španělska a je řeholní sestrou Kongregace Sester Panny Marie Útěchy. Spolu se svými spolusestrami má na starosti překlad projektu Lectio Divina do španělštiny a tvoří modlitební zázemí, které doprovází celý projekt s duchovní podporou a modlitbou."
        },
        {
          name: "Matúš Sedliak",
          role: "Grafický a audio tvůrce projektu",
          bio: "Matúš je nejmladším členem týmu – má jen 16 let a svou praxi začal v pastorálním fondu KROK. Myšlenka projektu Lectio Divina ho nadchla natolik, že se stal jeho aktivní součástí. Zodpovídá za grafické prvky projektu a stará se také o generování zvuku prostřednictvím ElevenLabs. Jsme vděční, že je součástí týmu – přináší kreativitu, nadšení a svěží pohled."
        }
      ]
    },

    new_version: {
      title: "Na co se můžete těšit v nové verzi?",
      completed: "Již je hotovo:",
      completed_text: "Srdce aplikace s moderním designem, přehráváním zamyšlení a modulem pro prosby o modlitbu.",
      working_on: "Na čem pracujeme:",
      features: [
        "Notifikační systém: Jemná připomínka na váš čas ztišení.",
        "Widget na plochu: Boží slovo na jeden dotek.",
        "Tvorba obsahu: Připravujeme nová zamyšlení v češtině, slovenštině, angličtině, němčině a španělštině.",
        "Přístupnost: Tmavý a světlý režim a automatické přizpůsobení velikosti písma."
      ]
    },
    support: {
      title: "Staňte se součástí naší mise",
      subtitle: "Jak můžete pomoci?",
      intro: "Tento projekt je dílem mnoha ochotných srdcí. Abychom jej mohli úspěšně dokončit a dlouhodobě provozovat, obracíme se s prosbou o pomoc i na vás.",
      ways: [
        {
          title: "Přímá finanční podpora",
          text: "Vývoj, údržba serverů a tvorba kvalitního obsahu vyžadují nemalé finanční prostředky. Vaše podpora nám umožní nejen dokončit plánované funkce, ale i dlouhodobě zajistit chod a rozvoj aplikace.",
          link: "https://dcza.24-pay.sk/darovat/lectio-divina",
          button: "Podpořit projekt"
        },
        {
          title: "Podpůrný balíček",
          text: "Můžete si objednat náš podpůrný balíček (tričko, pero, šňůrka na klíče). Pošleme vám jej domů a následně je na vašem svobodném rozhodnutí, jakou částkou se rozhodnete projekt podpořit."
        },
        {
          title: "Podpora pro firmy",
          text: "Firmám nabízíme možnost zviditelnit své logo v sekci \"Donátoři a podporovatelé\" a spojit tak své jméno s projektem, který má hluboký duchovní a společenský rozměr."
        },
        {
          title: "Nápady a zpětná vazba",
          text: "Vaše postřehy jsou pro nás zlatem. Napište nám své nápady."
        },
        {
          title: "Modlitební podpora",
          text: "Prosíme vás o modlitby za celý tým a za to, aby tato aplikace přinesla bohaté duchovní ovoce všem, kteří ji budou používat."
        }
      ]
    },
    conclusion: {
      text: "Ať už budete Lectio Divina praktikovat sami, v rodině nebo ve společenství, věříme, že váš život s Bohem se prostřednictvím čtení jeho Slova začne prohlubovat.",
      thanks: "Děkujeme vám za vaši přízeň a jakoukoli formu pomoci!"
    }
  },
  en: {
    title: "About the Lectio Divina Project",
    subtitle: "Our journey to a deeper relationship with God through His Word",
    origin: {
      title: "How it all began",
      text: "It all started on a trip with confirmation candidates. I saw how much young people need to spend time reading the Scriptures and meditating on them. I realized that only then can they become quality Christians who actively live Christian values in our world. From this desire, the first version of the Lectio Divina app was born."
    },
    vision: {
      title: "Our Vision",
      text: "Today, with time and encouraged by great interest, we stand on the threshold of a new stage. We are working on a completely new version of the app because we believe in the words of Pope Benedict XVI: \"Constant reading of the Scriptures, accompanied by prayer, will bring a new spiritual spring to the Church.\" Our goal is for this app to be a modern and accessible tool to help you experience this \"new spiritual spring\" in your life."
    },
    what_is: {
      title: "What is Lectio Divina?",
      text: "\"Lectio Divina\" means \"divine reading.\" It is an ancient practice of praying with Scripture, inviting us to linger over the biblical text, almost \"chewing\" it to extract the \"juice\" that nourishes our soul. The key is not just to understand the text intellectually, but as the app guide advises: \"Let the text work on you.\" It's about quietly asking: What is this text saying to me? What feelings and emotions does it evoke in me? And finally, in contemplation, simply resting in God's presence as His beloved child."
    },
    proven_project: {
      title: "A Proven Project with a Vision for the Future",
      text: "The first version of the app showed us that the desire for a deeper relationship with God through His Word is huge. In the first month, more than five thousand people downloaded it! We received amazing feedback from individuals, families, and communities. We saw how Lectio Divina became part of meetings with young people and families, giving them a \"wonderful opportunity to grow in values.\" This proven success and real impact motivate us to go further. The new version is not just an improvement, but a step forward, built on a solid foundation and user feedback."
    },

    stats: {
      downloads: "5000+",
      downloads_desc: "Downloads in the first month",
      feedback: "100%",
      feedback_desc: "Positive feedback",
      fruits: "∞",
      fruits_desc: "Spiritual fruits"
    },

    team: {
      title: "Our Team",
      description: "Meet the people behind the Lectio Divina project who work every day to help you experience a deeper relationship with God.",
      show_bio: "Show bio",
      contact_link: "My contact →",
      members: [
        {
          name: "Fr. Dušan Pecko",
          role: "Founder and Project Leader",
          bio: "Fr. Dušan is a priest of the Žilina Diocese and founder of the Lectio Divina project. His passion is helping people discover a deeper relationship with God through God's word. He serves as executive director of the diocesan pastoral fund KROK, which supports pastoral work and spiritual initiatives in the Žilina Diocese."
        },
        {
          name: "Adam Čižmárik",
          role: "Translator and Project Development Team Member",
          bio: "Adam has been a member of the project since its beginning. He works on English translations while studying law in his second year. He strives to live according to Lectio Divina principles and bring them into everyday life. He is the author of the mypro.one project, which focuses on digital business cards and modern forms of online identity."
        },
        {
          name: "Kristínka Krchová",
          role: "Content Coordinator and Heart of the Project",
          bio: "Kristínka has been part of the project since its beginning and stood by its foundation building. Thanks to her patient work, all data was incorporated into the database, dedicating countless hours to the project. She is the heart of the Lectio Divina team and remains its inseparable part even during maternity leave."
        },
        {
          name: "Sr. Mary Carmen",
          role: "Spanish Translation Coordinator",
          bio: "Sr. Mary Carmen comes from Spain and is a religious sister of the Congregation of Sisters of Our Lady of Consolation. Together with her fellow sisters, she is responsible for translating the Lectio Divina project into Spanish and creates the prayer foundation that accompanies the entire project with spiritual support and prayer."
        },
        {
          name: "Matúš Sedliak",
          role: "Graphic and Audio Creator of the Project",
          bio: "Matúš is the youngest team member – he is only 16 years old and started his practice at the pastoral fund KROK. The idea of the Lectio Divina project captivated him so much that he became its active part. He is responsible for the graphic elements of the project and also takes care of sound generation through ElevenLabs. We are grateful that he is part of the team – he brings creativity, enthusiasm and a fresh perspective."
        }
      ]
    },

    new_version: {
      title: "What can you look forward to in the new version?",
      completed: "Already completed:",
      completed_text: "The heart of the app with a modern design, playback of reflections, and a prayer request module.",
      working_on: "What we're working on:",
      features: [
        "Notification system: A gentle reminder for your quiet time.",
        "Home screen widget: God's word at a touch.",
        "Content creation: We are preparing new reflections in Slovak, Czech, English, German, and Spanish.",
        "Accessibility: Dark and light mode and automatic font size adjustment."
      ]
    },
    support: {
      title: "Become part of our mission",
      subtitle: "How can you help?",
      intro: "This project is the work of many willing hearts. To successfully complete and operate it long-term, we also turn to you for help.",
      ways: [
        {
          title: "Direct financial support",
          text: "Development, server maintenance, and quality content creation require considerable financial resources. Your support will enable us not only to complete planned features but also to ensure the long-term operation and development of the app.",
          link: "https://dcza.24-pay.sk/darovat/lectio-divina",
          button: "Support the project"
        },
        {
          title: "Support package",
          text: "You can order our support package (t-shirt, pen, lanyard). We will send it to your home, and then it is up to your free decision how much you wish to support the project."
        },
        {
          title: "Support for companies",
          text: "We offer companies the opportunity to display their logo in the \"Donors and Supporters\" section and thus associate their name with a project that has a deep spiritual and social dimension."
        },
        {
          title: "Ideas and feedback",
          text: "Your insights are gold for us. Write us your ideas."
        },
        {
          title: "Prayer support",
          text: "We ask for your prayers for the whole team and that this app brings abundant spiritual fruit to all who use it."
        }
      ]
    },
    conclusion: {
      text: "Whether you practice Lectio Divina alone, with your family, or in a community, we believe your life with God will deepen through reading His Word.",
      thanks: "Thank you for your favor and any form of help!"
    }
  },
  es: {
    title: "Sobre el proyecto Lectio Divina",
    subtitle: "Nuestro camino hacia una relación más profunda con Dios a través de Su Palabra",
    origin: {
      title: "Cómo empezó todo",
      text: "Todo comenzó en un viaje con candidatos a la confirmación. Vi cuánto necesitan los jóvenes dedicar tiempo a leer las Escrituras y meditar en ellas. Me di cuenta de que solo así pueden convertirse en cristianos de calidad que vivan activamente los valores cristianos en nuestro mundo. De este deseo nació la primera versión de la aplicación Lectio Divina."
    },
    vision: {
      title: "Nuestra visión",
      text: "Hoy, con el tiempo y animados por un gran interés, estamos en el umbral de una nueva etapa. Estamos trabajando en una versión completamente nueva de la aplicación porque creemos en las palabras del Papa Benedicto XVI: \"La lectura constante de las Escrituras, acompañada de la oración, traerá una nueva primavera espiritual a la Iglesia.\" Nuestro objetivo es que esta aplicación sea una herramienta moderna y accesible que te ayude a vivir esta \"nueva primavera espiritual\" en tu vida."
    },
    what_is: {
      title: "¿Qué es Lectio Divina?",
      text: "\"Lectio Divina\" significa \"lectura divina\". Es una antigua práctica de oración con las Escrituras que nos invita a permanecer en el texto bíblico, casi \"masticándolo\" para extraer el \"jugo\" que alimenta nuestra alma. La clave no es solo comprender el texto intelectualmente, sino, como aconseja la guía de la aplicación: \"Deja que el texto actúe en ti.\" Se trata de preguntarse en silencio: ¿Qué me dice este texto? ¿Qué sentimientos y emociones despierta en mí? Y finalmente, en la contemplación, simplemente descansar en la presencia de Dios como su hijo amado."
    },
    proven_project: {
      title: "Un proyecto probado con visión de futuro",
      text: "La primera versión de la aplicación nos mostró que el deseo de una relación más profunda con Dios a través de Su Palabra es enorme. ¡En el primer mes, más de cinco mil personas la descargaron! Recibimos comentarios increíbles de personas, familias y comunidades. Vimos cómo Lectio Divina se convirtió en parte de reuniones con jóvenes y familias, dándoles una \"maravillosa oportunidad de crecer en valores.\" Este éxito probado y el impacto real nos motivan a seguir adelante. La nueva versión no es solo una mejora, sino un paso adelante, construido sobre una base sólida y la retroalimentación de los usuarios."
    },

    stats: {
      downloads: "5000+",
      downloads_desc: "Descargas en el primer mes",
      feedback: "100%",
      feedback_desc: "Comentarios positivos",
      fruits: "∞",
      fruits_desc: "Frutos espirituales"
    },

    team: {
      title: "Nuestro Equipo",
      description: "Conoce a las personas detrás del proyecto Lectio Divina que trabajan todos los días para ayudarte a experimentar una relación más profunda con Dios.",
      show_bio: "Mostrar bio",
      contact_link: "Mi contacto →",
      members: [
        {
          name: "P. Dušan Pecko",
          role: "Fundador y Líder del Proyecto",
          bio: "P. Dušan es sacerdote de la Diócesis de Žilina y fundador del proyecto Lectio Divina. Su pasión es ayudar a las personas a descubrir una relación más profunda con Dios a través de la palabra de Dios. Sirve como director ejecutivo del fondo pastoral diocesano KROK, que apoya el trabajo pastoral y las iniciativas espirituales en la Diócesis de Žilina."
        },
        {
          name: "Adam Čižmárik",
          role: "Traductor y Miembro del Equipo de Desarrollo del Proyecto",
          bio: "Adam ha sido miembro del proyecto desde sus inicios. Trabaja en traducciones al inglés mientras estudia derecho en su segundo año. Se esfuerza por vivir según los principios de Lectio Divina y llevarlos a la vida cotidiana. Es el autor del proyecto mypro.one, que se centra en tarjetas de presentación digitales y formas modernas de identidad en línea."
        },
        {
          name: "Kristínka Krchová",
          role: "Coordinadora de Contenido y Corazón del Proyecto",
          bio: "Kristínka ha sido parte del proyecto desde sus inicios y estuvo presente en la construcción de sus cimientos. Gracias a su trabajo paciente, todos los datos se incorporaron a la base de datos, dedicando innumerables horas al proyecto. Ella es el corazón del equipo Lectio Divina y sigue siendo su parte inseparable incluso durante su licencia de maternidad."
        },
        {
          name: "Hna. Mary Carmen",
          role: "Coordinadora de Traducción al Español",
          bio: "Hna. Mary Carmen viene de España y es una hermana religiosa de la Congregación de Hermanas de Nuestra Señora de la Consolación. Junto con sus hermanas, es responsable de traducir el proyecto Lectio Divina al español y crea la base de oración que acompaña todo el proyecto con apoyo espiritual y oración."
        },
        {
          name: "Matúš Sedliak",
          role: "Creador Gráfico y de Audio del Proyecto",
          bio: "Matúš es el miembro más joven del equipo: tiene solo 16 años y comenzó su práctica en el fondo pastoral KROK. La idea del proyecto Lectio Divina lo cautivó tanto que se convirtió en su parte activa. Es responsable de los elementos gráficos del proyecto y también se encarga de la generación de sonido a través de ElevenLabs. Estamos agradecidos de que sea parte del equipo: aporta creatividad, entusiasmo y una perspectiva fresca."
        }
      ]
    },

    new_version: {
      title: "¿Qué puedes esperar en la nueva versión?",
      completed: "Ya está listo:",
      completed_text: "El corazón de la aplicación con un diseño moderno, reproducción de reflexiones y un módulo de peticiones de oración.",
      working_on: "En qué estamos trabajando:",
      features: [
        "Sistema de notificaciones: Un suave recordatorio para tu tiempo de silencio.",
        "Widget de pantalla de inicio: La palabra de Dios al alcance de un toque.",
        "Creación de contenido: Estamos preparando nuevas reflexiones en eslovaco, checo, inglés, alemán y español.",
        "Accesibilidad: Modo oscuro y claro y ajuste automático del tamaño de fuente."
      ]
    },
    support: {
      title: "Sé parte de nuestra misión",
      subtitle: "¿Cómo puedes ayudar?",
      intro: "Este proyecto es obra de muchos corazones dispuestos. Para completarlo y operarlo con éxito a largo plazo, también recurrimos a ti en busca de ayuda.",
      ways: [
        {
          title: "Apoyo financiero directo",
          text: "El desarrollo, el mantenimiento del servidor y la creación de contenido de calidad requieren considerables recursos financieros. Tu apoyo nos permitirá no solo completar las funciones planificadas, sino también garantizar el funcionamiento y desarrollo a largo plazo de la aplicación.",
          link: "https://dcza.24-pay.sk/darovat/lectio-divina",
          button: "Apoyar el proyecto"
        },
        {
          title: "Paquete de apoyo",
          text: "Puedes pedir nuestro paquete de apoyo (camiseta, bolígrafo, cordón). Te lo enviaremos a casa y luego depende de tu decisión libre con cuánto deseas apoyar el proyecto."
        },
        {
          title: "Apoyo para empresas",
          text: "Ofrecemos a las empresas la oportunidad de mostrar su logotipo en la sección \"Donantes y patrocinadores\" y así asociar su nombre con un proyecto que tiene una profunda dimensión espiritual y social."
        },
        {
          title: "Ideas y comentarios",
          text: "Tus ideas son oro para nosotros. Escríbenos tus sugerencias."
        },
        {
          title: "Apoyo en oración",
          text: "Te pedimos oraciones por todo el equipo y para que esta aplicación traiga abundantes frutos espirituales a todos los que la usen."
        }
      ]
    },
    conclusion: {
      text: "Ya sea que practiques Lectio Divina solo, en familia o en comunidad, creemos que tu vida con Dios se profundizará a través de la lectura de Su Palabra.",
      thanks: "¡Gracias por tu apoyo y cualquier forma de ayuda!"
    }
  }
}