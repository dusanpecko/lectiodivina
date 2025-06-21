// app/about/i18n.ts
import { Language } from "../components/LanguageProvider";

interface SupportWay {
  title: string;
  text: string;
  link?: string;
  button?: string;
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