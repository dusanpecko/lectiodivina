import { createContext, useContext } from "react";

// 1. Definícia typov jazykov, ktoré podporuješ
export type Language = "sk" | "cz" | "en" | "es";

// 2. Kontext pre jazyk
export const LangContext = createContext<{ lang: Language }>({ lang: "sk" });

// 4. Hook na získanie aktuálneho jazyka
export function useLang() {
  return useContext(LangContext);
}

// 5. Prehľad všetkých podporovaných jazykov (užitočné pre select input, kontrolu, ...):
export const supportedLangs: Language[] = ["sk", "cz", "en", "es"];

// 6. Príklad prekladov (za týmto blokom vlož tvoj pôvodný `translations`)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const translations: Record<Language, any> = {

  sk: {
    give: "Podporiť",
    the_app:"Aplikácia",
    explore:"Preskúmať",
    today_lectio: "Dnešné Lectio",
    prayer: "Modlitba",
    rosary: "Ruženec",
    start_the_guide:"Začať sprievodcu",
    about_lectio_divina:"O Lectio Divina",
    support: "Podporiť projekt",
    welcome: "Vitajte na stránke Lectio Divina",
    home: "Domov",
    admin: "Administrácia",
    login: "Prihlásenie",
    logout: "Odhlásiť sa",
    logout_success: "Úspešne odhlásený.",
    select_language: "Vyberte jazyk",
    meet_your_hosts: "Zoznámte sa s nami",
    hosts_description: "Sme tím ľudí, ktorí s vierou a nadšením spájajú slovo, umenie a technológiu v projekte Lectio Divina.",
    discover_more: "Spoznajte náš tím",
    daily_actio: "Ži Božie slovo (ACTIO)",
    navbar: {
      about_lectio: "O Lectio Divina",
      lectio_steps: {
        lectio: "Lectio",
        meditatio: "Meditatio", 
        oratio: "Oratio",
        contemplatio: "Contemplatio",
        actio: "Actio"
      }
    },
    homepage: {
      download: "Stiahnuť",
      default_user: "Používateľ",
      profile: "Môj profil",
      notes: "Poznámky",
      login_required_title: "Prihlásenie potrebné",
      login_required_message: "Pre prístup k tejto funkcii sa prosím prihláste do svojho účtu.",
      logout_confirm_title: "Odhlásenie",
      logout_confirm_message: "Naozaj sa chcete odhlásiť zo svojho účtu?"
    },
    calendar_admin_title: "Úprava kalendára",
    language: "Jazyk",
    import_excel: "Importovať Excel",
    add_item: "Pridať položku",
    global_search: "Globálne vyhľadávanie",
    search_name: "Meno",
    search_liturgical: "Liturgický deň",
    search_saints: "Svätí",
    clear_filters: "Vyčistiť filtre",
    date: "Dátum",
    name: "Meno",
    liturgical_day: "Liturgický deň",
    saints: "Svätí",
    lang: "Jazyk",
    actions: "Akcie",
    edit: "Upraviť",
    delete: "Zmazať",
    previous: "Predošlá",
    next: "Ďalšia",
    page: "Strana",
    of: "z",
    no_records: "Žiadne záznamy",
    confirm_delete: "Naozaj chcete zmazať tento záznam?",
    error_add: "Chyba pri pridávaní",
    error_edit: "Chyba pri ukladaní.",
    error_import: "Chyba pri importe",
    imported: "Importované!",
    adding: "Pridávam...",
    add: "Pridať",
    save: "Uložiť",
    cancel: "Zrušiť",
    loading: "Načítavam...",
    dashboard: "Dashboard",
    calendar: "Kalendár",
    daily_quotes: "Citáty dňa",
    content_cards: "Obsahové karty",
    editing: "Upravujem...",
    edit_inline_hint: "Dvojklik pre úpravu",
    unsaved_changes: "Nevyplnené povinné pole alebo nezmenené údaje.",
    export_excel: "Exportovať Excel",
    date_from: "Dátum od",
    date_to: "Dátum do",
    daily_quotes_admin_title: "Úprava denných citátov",
    quote: "Citát",
    reference: "Reference",
    item_not_found: "Položka nenájdená",
    edit_quote_title: "Upraviť citát",
    save_success: "Úspešne uložené",
    save_error: "Chyba pri ukladaní",
    news: "Novinky",
    news_admin_title: "Správa noviniek",
    edit_news_title: "Upraviť novinku",
    title: "Nadpis",
    summary: "Súhrn",
    image_url: "Obrázok URL",
    content: "Obsah",
    published_at: "Publikované",
    likes: "Páči sa mi",
    saving: "Ukladám...",
    add_news_title: "Pridať nový článok",
    // Article statuses
    article_status: {
      draft: "Návrh",
      published: "Publikované", 
      archived: "Archivované"
    },
    preparing: "PRIPRAVUJEME",
    app_title: "Lectio Divina",
    app_subtitle: "aplikácia pre každý deň",
    app_desc: "Nová mobilná aplikácia Lectio Divina pre Android a iOS. Objavte silu Božieho slova a zamyslenia na každý deň.",
    days: "Dní",
    hours: "Hodiny",
    minutes: "Minúty",
    seconds: "Sekundy",
    more: "Zisti viac",
    lectio_steps: [
      {
        title: "LECTIO",
        desc: "Začnite čítať Písmo – čítajte ho znova, pomaly a nechajte ho vsiaknuť. Vyhraďte si čas, aby ste si našli čas. Niet sa kam ponáhľať.",
      },
      {
        title: "MEDITATIO",
        desc: "Čo na teba vyskočí z toho, čo si čítal? Čo sa deje v časti Písma? Viete si v ňom predstaviť seba? Oživte kúsoček vo svojom srdci a mysli.",
      },
      {
        title: "ORATIO",
        desc: "Keď necháte Písmo ožiť, aké modlitby sa formujú vo vašom srdci? Čo chceš prediskutovať s Bohom? Aký rozhovor sa pre vás začína?",
      },
      {
        title: "CONTEMPLATIO",
        desc: "Čo ti hovorí Boh v tomto kuse Písma? Ako to rezonuje vo vašom živote? Ako je to pre vás náročné alebo povzbudzujúce?",
      },
    ],
    lectio_section_title: "Lectio divina – Actio",
    
    // NOVÉ PREKLADY PRE SPRIEVODCU
    lectio_guide_section: {
      badge: "INTERAKTÍVNY SPRIEVODCA",
      title: "Naučte sa Lectio Divina",
      subtitle: "Krok za krokom vás prevedieme celým procesom modlitby Lectio Divina. Každý krok obsahuje praktické návody, príklady a cvičenia.",
      total_duration: "30-60 minút celkovo",
      steps_count: "5 interaktívnych krokov",
      start_step: "Začať krok",
      
      steps: [
        {
          title: "Lectio",
          subtitle: "Čítanie",
          description: "Pozorné a pomalé čítanie Božieho slova s otvoreným srdcom",
          duration: "5-10 min"
        },
        {
          title: "Meditatio",
          subtitle: "Rozjímanie",
          description: "Hlboké premýšľanie nad textom, hľadanie osobného posolstva",
          duration: "10-15 min"
        },
        {
          title: "Oratio",
          subtitle: "Modlitba",
          description: "Otvorený rozhovor s Bohom, zdieľanie myšlienok a pocitov",
          duration: "5-10 min"
        },
        {
          title: "Contemplatio",
          subtitle: "Kontemplácia",
          description: "Tiché zostávanie v Božej prítomnosti, prijímanie jeho lásky",
          duration: "10-20 min"
        },
        {
          title: "Actio",
          subtitle: "Žiť Božie slovo",
          description: "Pretvorenie poznaného do praktického života a činov lásky",
          duration: "Celý deň"
        }
      ],
      
      cta: {
        title: "Pripravení začať svoju duchovnú cestu?",
        description: "Začnite úvodom, ktorý vám vysvetlí základy Lectio Divina, alebo prejdite priamo na prvý krok - Lectio.",
        start_with_intro: "Začať úvodom",
        go_to_lectio: "Prejsť na Lectio"
      }
    },

    // Navigácia pre sprievodcu
    navigation: {
      guide: "Sprievodca",
      guide_dropdown: {
        intro: {
          label: "Úvod do Lectio Divina",
          description: "Základy a prehľad všetkých krokov"
        },
        lectio: {
          label: "1. Lectio - Čítanie",
          description: "Pozorné čítanie Božieho slova"
        },
        meditatio: {
          label: "2. Meditatio - Rozjímanie",
          description: "Hlboké premýšľanie nad textom"
        },
        oratio: {
          label: "3. Oratio - Modlitba",
          description: "Rozhovor s Bohom"
        },
        contemplatio: {
          label: "4. Contemplatio - Kontemplácia",
          description: "Tiché zostávanie s Bohom"
        },
        actio: {
          label: "5. Actio - Žiť Božie slovo",
          description: "Pretvorenie do života"
        }
      }
    },

    cookie_info: "Táto stránka používa cookies a localStorage pre lepší zážitok a uloženie jazykovej preferencie.",
    cookie_agree: "Súhlasím",
    cookie_decline: "Odmietam",
    accept_cookies: "Súhlasím s cookies",
    decline_cookies: "Nesúhlasím",
    cookie_title: "Cookies",
    cookie_text: "Táto stránka používa cookies na analýzu návštevnosti a localStorage pre lepší zážitok a uloženie jazykovej preferencie.",
    close: "Zavrieť",
    accept_cookies_text: "Súhlasím s používaním cookies pre lepší zážitok a ukladanie jazykových preferencií.",
    decline_cookies_text: "Nesúhlasím s používaním cookies a localStorage. Môže to ovplyvniť funkčnosť stránky.",
    cookie_consent: "Súhlas s cookies",
    cookie_consent_desc: "Táto stránka používa cookies a localStorage na zlepšenie používateľského zážitku a ukladanie jazykových preferencií. Môžete si vybrať, či súhlasíte s ich používaním.",
    cookie_consent_agree: "Súhlasím",
    cookie_consent_decline: "Nesúhlasím",
    cookie_consent_info: "Táto stránka používa cookies a localStorage na analýzu návštevnosti a zlepšenie používateľského zážitku. Môžete si vybrať, či súhlasíte s ich používaním.",
    cookie_consent_agree_text: "Súhlasím s používaním cookies a localStorage pre lepší zážitok a ukladanie jazykových preferencií.",
    cookie_consent_decline_text: "Nesúhlasím s používaním cookies a localStorage. Môže to ovplyvniť funkčnosť stránky.",
    cookie_consent_title: "Súhlas s cookies",
    app_section: {
      headline: "MOBILNÁ APLIKÁCIA",
      lead: "Pozývame vás prehĺbiť svoj duchovný život s aplikáciou Lectio Divina!",
      tagline: "Dať Božiemu Slovu priestor vo vašom srdci.",
      p1: "Lectio Divina je starobylá forma modlitby, ktorú po stáročia praktizovali rehoľné komunity aj jednotlivci. Teraz môžete túto obohacujúcu prax integrovať do svojho každodenného života aj vy!",
      p2: "Pozývame vás stiahnuť si našu novú aplikáciu Lectio Divina a dať Božiemu Slovu priestor vo vašom srdci. Či už sa rozhodnete pre Lectio osamote, v rodine, alebo v malej skupine, prostredníctvom čítania Božieho Slova sa váš život s Bohom začne prehlbovať a rozkvitať.",
      p3: "Stiahnite si aplikáciu Lectio Divina ešte dnes a začnite svoju cestu k hlbšiemu vzťahu s Bohom!",
      note: "Aplikácia je momentálne dostupná v slovenčine.",
      more: "Viac o Lectio Divina na www.lectio.one",
      alt: "Ilustrácia mobilnej aplikácie",
      apple_store_alt: "Stiahnuť z App Store",
      google_play_alt: "Stiahnuť z Google Play",
    },
    review_slider: {
      aria_label: "Prejsť na recenziu",
      items: [
        {
          author: "Jana H.",
          text: "Úžasná aplikácia, každé ráno sa teším na čítanie a konečne aj rozumiem, čo Boh ku mne hovorí a cítim radosť a pokoj. Vďaka Otec Dušan",
          rating: 5,
          platform: "Google Play"
        },
        {
          author: "Jkb982",
          text: "Úplne odporúčam! Na každý deň úseky z Písma, nad ktorými môžem rozjímať. Presne toto som hľadal.",
          rating: 5,
          platform: "App Store"
        },
        {
          author: "Štefan J.",
          text: "Výborná pomôcka k duchovnému zreniu. Apka vyhotovená prehľadne a obsahuje moderné prvky. Vďaka za službu :)",
          rating: 5,
          platform: "Google Play"
        },
        {
          author: "Ummarti",
          text: "Skvelá práca. Aplikáciu používam denne. Oceňujem možnosť texty si vypočuť a dokonca v rôznych prekladoch. Krátke zamyslenia sú tak trefné a často mi otvoria nový pohľad na \"známy text\" Sv. Písma. Ďakujem aj za \"Advent\" – všetky zamyslenia a najmä vysvetľujúce komentáre. Vďaka za váš čas a námahu.",
          rating: 5,
          platform: "Google Play"
        },
        {
          author: "Vladislav H.",
          text: "Texty na meditáciu, viacero prekladov na jednom mieste, ako aj zamyslenia ako inšpirácia. Pre mňa skvelý pomocník pre rast v duchovnom živote.",
          rating: 5,
          platform: "Google Play"
        }
      ]
    },
    users_id:"Používatelia",
    latest_news: "Najnovšie články",
    show_article: "Zobraziť článok",
    show_all_news: "Zobraziť všetky články",
    no_articles: "Žiadne články neboli nájdené.",
    previous_article: "Predchádzajúci článok",
    next_article: "Nasledujúci článok",
    lectio_admin_title: "Správa Lectio Divina",
    hlava: "Nadpis",
    suradnice_pismo: "Súradnice Písma",
    datum: "Dátum",
    lectio:"Lectio divina",
    // PRIDAJTE reset password sekciu:
    resetPassword: {
      // Page titles and headers
      title: 'Obnova hesla',
      verifyingLink: 'Overujem odkaz na obnovu hesla...',
      processingAuth: 'Spracovávam autentifikáciu...',
      
      // Form labels
      newPassword: 'Nové heslo',
      confirmPassword: 'Potvrdiť nové heslo',
      enterNewPassword: 'Zadajte nové heslo',
      confirmNewPassword: 'Potvrďte nové heslo',
      changePassword: 'Zmeniť heslo',
      saving: 'Zapisujem...',
      
      // Password requirements
      passwordRequirements: 'Heslo musí obsahovať aspoň 8 znakov, veľké a malé písmeno, číslicu a špeciálny znak.',
      mustBeDifferent: 'Musí byť odlišné od vašeho súčasného hesla.',
      
      // Validation messages
      passwordMinLength: 'Heslo musí mať aspoň 8 znakov.',
      passwordLowercase: 'Heslo musí obsahovať malé písmeno.',
      passwordUppercase: 'Heslo musí obsahovať veľké písmeno.',
      passwordNumber: 'Heslo musí obsahovať číslicu.',
      passwordSpecial: 'Heslo musí obsahovať špeciálny znak.',
      passwordsMismatch: 'Heslá sa nezhodujú.',
      
      // Error messages
      verificationFailed: 'Nepodarilo sa overiť odkaz',
      sessionCreateFailed: 'Session sa nepodarilo vytvoriť z autentifikačného kódu.',
      systemError: 'Systémová chyba',
      missingCode: 'Chýbajúci autentifikačný kód v odkaze.',
      unknownError: 'Neznáma chyba',
      sessionExpired: 'Session expirovala. Prosím, použite nový odkaz na obnovu hesla.',
      sessionCheckError: 'Chyba pri kontrole session',
      invalidLink: 'Link na obnovenie hesla je neplatný alebo expirovaný.',
      passwordDifferentRequired: 'Nové heslo musí byť odlišné od vašeho súčasného hesla.',
      passwordTooWeak: 'Heslo je príliš slabé. Použite silnejšie heslo.',
      passwordUpdateFailed: 'Nepodarilo sa zmeniť heslo. Skúste to znovu.',
      
      // Success messages
      passwordChanged: 'Heslo bolo úspešne zmenené! Môžete sa teraz prihlásiť v aplikácii s novým heslom.',
      success: 'Úspech!',
      
      // Instructions
      nextSteps: 'Ďalšie kroky:',
      openMobileApp: 'Otvorte si mobilnú aplikáciu Lectio Divina',
      loginWithNewPassword: 'Prihláste sa s vaším emailom a novým heslom',
      closeThisPage: 'Túto stránku môžete zatvoriť',
      
      // Invalid link section
      invalidLinkTitle: 'Neplatný odkaz',
      linkExpiredDesc: 'Odkaz na obnovenie hesla expiroval alebo je neplatný.',
      requestNewLink: 'Požiadať o nový odkaz na obnovu hesla',
      
      // Tips
      tipEmailValidity: 'Email odkazy na obnovenie hesla sú platné len 1 hodinu z bezpečnostných dôvodov.',
    },
    footer: {
      contact: "Kontakt",
      legal_info: "Právne informácie",
      links: "Odkazy",
      terms: "Všeobecné obchodné podmienky",
      privacy: "Ochrana osobných údajov - Mobilná aplikácia",
      privacy_policy: "Ochrana osobných údajov",
      manage_cookies: "Spravovať cookies",
      all_rights_reserved: "Všetky práva vyhradené",
      created_by: "vytvoril",
      admin_tooltip: "Administrácia",
      follow_us: "Sledujte nás"
      
    },
  community_section: {
      headline: "Pridajte sa k nám",
      subtitle: "Staňte sa súčasťou našej rastúcej komunity veriacich",
      description: "Hľadáme nadšencov, ktorí nám pomôžu vytvoriť lepšiu aplikáciu pre modlitbu a duchovný rast. Bez ohľadu na to, či chcete testovať, získavať novinky alebo zdieľať nápady - máme pre vás miesto.",
      tester_title: "Staň sa testerom",
      tester_desc: "Pomôžte nám otestovať nové funkcie a vylepšenia pred ich oficiálnym spustením. Vaša spätná väzba je neoceniteľná pre vývoj aplikácie.",
      newsletter_title: "Prihláste sa na newsletter",
      newsletter_desc: "Buďte prvými, ktorí sa dozviete o nových funkciách, duchovných článkoch a dôležitých aktualizáciách aplikácie.",
      idea_title: "Máte nápad?",
      idea_desc: "Zdieľajte s nami svoje nápady na vylepšenie aplikácie, nové funkcie alebo obsah, ktorý by vám pomohol v duchovnom raste.",
      form_name: "Vaše meno",
      form_email: "Emailová adresa",
      form_message: "Správa alebo nápad",
      form_interests: "Čo vás zaujíma?",
      interest_tester: "Chcem pomôcť s testovaním aplikácie",
      interest_newsletter: "Chcem dostávať newsletter",
      interest_idea: "Mám nápad na vylepšenie",
      submit_btn: "Pridať sa ku komunite",
      success_message: "Ďakujeme! Vaša žiadosť bola úspešne odoslaná. Čoskoro vás budeme kontaktovať.",
      error_message: "Nastala chyba. Skontrolujte, či ste vyplnili všetky povinné polia a skúste znova.",
      required_field: "Povinné pole",
      loading_form: "Načítavam formulár...",
      message_placeholder: "Vaša správa alebo nápad..."
    },
    // Community admin preklady
    community_admin_title: "Správa členov komunity",
    community_member_detail: "Detail člena komunity",
    community_stats: {
      total_members: "Celkom členov",
      testers: "Testeri", 
      newsletter_subscribers: "Newsletter",
      idea_contributors: "Nápady"
    },
    community_interests: {
      testing: "Testovanie",
      newsletter: "Newsletter", 
      ideas: "Nápady"
    },
    community_actions: {
      send_email: "Napísať email",
      invite_testing: "Pozvať na testovanie",
      add_newsletter: "Pridať do newslettera",
      edit_member: "Upraviť člena",
      delete_member: "Vymazať člena"
    },
    community_filters: {
      want_testing: "Chce testovať",
      want_newsletter: "Chce newsletter",
      has_idea: "Má nápad",
      registration_date: "Dátum registrácie"
    },
    community_form: {
      basic_info: "Základné informácie",
      interests_preferences: "Záujmy a preferencie",
      message_idea: "Správa alebo nápad",
      quick_actions: "Rýchle akcie",
      wants_testing: "Chce testovať aplikáciu",
      wants_newsletter: "Chce dostávať newsletter", 
      has_improvement_idea: "Má nápad na vylepšenie",
      no_message: "Žiadna správa nebola zadaná",
      last_updated: "Posledná aktualizácia"
    },
    community: "Komunita",
    dailyQuote: {
      loading: "Načítavam dnešný citát...",
      todayLabel: "DNEŠNÝ CITÁT",
      notFound: "Dnešný citát nebol nájdený",
      notFoundDescription: "Skúste to prosím neskôr alebo si prečítajte naše archívne citáty.",
      error: "Chyba pri načítaní citátu",
      no_quote_today: "Na dnešný deň nie je k dispozícii žiadna myšlienka.",
      check_back_tomorrow: "Skúste to zajtra."
    },
    // LectioStepsSection component
    lectioStepsSection: {
      title: "Lectio Divina - Päť krokov",
      subtitle: "Objavte duchovnú cestu cez päť krokov Lectio Divina - starovekú kresťanskú prax meditácie"
    },

    // Lectio Divina steps
    lectio_steps_new: [
      {
        title: "Lectio - Čítanie",
        desc: "Pozorne čítanie Božieho slova s otvoreným srdcom a mysľou"
      },
      {
        title: "Meditatio - Rozjímanie", 
        desc: "Hlboké premýšľanie nad textom a hľadanie osobného posolstva"
      },
      {
        title: "Oratio - Modlitba",
        desc: "Rozhovor s Bohom o tom, čo ste v texte objavili"
      },
      {
        title: "Contemplatio - Kontemplácia",
        desc: "Tiché spočinutie v Božej prítomnosti a láske"
      },
      {
        title: "Actio - Skutok",
        desc: "Pretvorenie duchovnej skúsenosti do konkrétnych skutkov lásky"
      }
    ],
    newsDetail: {
      article_badge: "ČLÁNOK",
      reading_time: "min čítania",
      published_on: "Publikované"
    },
    homeNewsSection: {
      title: "Najnovšie články",
      badge: "NAJNOVŠIE SPRÁVY",
      subtitle: "Zostávajte informovaní o najnovších udalostiach a duchovných témach",
      loading: "Načítavam články pre jazyk:",
      error_title: "Chyba pri načítavaní článkov",
      error_check: "Skontrolujte Supabase databázu a údaje pre jazyk",
      no_articles_title: "Zatiaľ žiadne články",
      no_articles_desc: "Žiadne články pre jazyk \"{lang}\" neboli nájdené.",
      new_badge: "NOVÝ",
      show_article: "Zobraziť článok",
      show_all_articles: "Zobraziť všetky články"
    },
    newsListPage: {
      title: "Najnovšie články",
      all_articles_badge: "VŠETKY ČLÁNKY", 
      subtitle: "Prečítajte si najnovšie články a duchovné úvahy",
      search_placeholder: "Hľadať články...",
      sort_by_date: "Podľa dátumu",
      sort_by_likes: "Podľa obľúbenosti", 
      reading_time: "min čítania",
      new_badge: "NOVÝ",
      showing_results: "Zobrazuje sa {count} z {total} článkov",
      search_results_for: " pre \"{searchTerm}\"",
      no_search_results_title: "Žiadne výsledky",
      no_search_results_desc: "Nenašli sa žiadne články pre hľadaný výraz \"{searchTerm}\". Skúste iné kľúčové slová.",
      clear_search: "Vymazať vyhľadávanie",
      no_articles_title: "Žiadne články",
      no_articles_desc: "Žiadne články neboli nájdené."
    },

    // Notes page translations
    notesPage: {
      title: "Moje poznámky",
      notes_count: "poznámka",
      notes_count_plural: "poznámok",
      new_note: "Nová poznámka",
      search_placeholder: "Hľadať v poznámkach...",
      loading: "Načítavam poznámky...",
      loading_auth: "Načítavam...",
      redirecting_login: "Presmerovávam na prihlásenie...",
      empty_state: {
        title: "Zatiaľ žiadne poznámky",
        subtitle: "Kliknite na 'Nová poznámka' a začnite písať svoje myšlienky",
        button: "Vytvoriť prvú poznámku"
      },
      empty_editor: {
        title: "Vyberte poznámku",
        subtitle: "Kliknite na poznámku v zozname vľavo alebo vytvorte novú poznámku",
        button: "Vytvoriť novú poznámku"
      },
      editor: {
        tabs: {
          list: "Zoznam",
          editor: "Editor"
        },
        modes: {
          new_title: "Nová poznámka",
          edit_title: "Upraviť poznámku",
          empty_title: "Začať písať"
        },
        form: {
          title_label: "Názov poznámky *",
          title_placeholder: "Názov vašej poznámky...",
          content_label: "Obsah poznámky *",
          content_placeholder: "Začnite písať svoje myšlienky...",
          bible_section_title: "Biblický odkaz",
          bible_reference_label: "Odkaz (napr. Ján 3:16)",
          bible_reference_placeholder: "Ján 3:16",
          bible_quote_label: "Citát z Biblie",
          bible_quote_placeholder: "Vložte text z Biblie..."
        },
        actions: {
          save: "Uložiť poznámku",
          saving: "Ukladám...",
          cancel: "Zrušiť",
          delete: "Zmazať poznámku"
        },
        validation: {
          required_fields: "Názov a obsah poznámky sú povinné"
        },
        confirm: {
          close_unsaved: "Máte neuloženú poznámku. Naozaj chcete zavrieť editor?"
        }
      },
      metadata: {
        created: "Vytvorené",
        updated: "Upravené", 
        not_modified: "Poznámka nebola upravovaná"
      }
    }
  },
  
    
  cz: {
    give: "Podpořit",
    the_app:"Aplikace",
    explore:"Prozkoumat",
    prayer: "Modlitba",
    rosary: "Růženec",
    today_lectio: "Dnešní Lectio",
    start_the_guide:"Začít průvodce",
    about_lectio_divina:"O Lectio Divina",
    support: "Podpořit projekt",
    welcome: "Vítejte na stránce Lectio Divina",
    home: "Domů",
    admin: "Administrace",
    login: "Přihlášení",
    logout: "Odhlásit se",
    logout_success: "Úspěšně odhlášen.",
    select_language: "Vyberte jazyk",
    meet_your_hosts: "Seznamte se s námi",
    hosts_description: "Jsme tým lidí, kteří s vírou a nadšením spojují slovo, umění a technologie v projektu Lectio Divina.",
    discover_more: "Poznejte náš tým",
    daily_actio: "Žijte Boží slovo (ACTIO)",
    navbar: {
      about_lectio: "O Lectio Divina",
      lectio_steps: {
        lectio: "Lectio",
        meditatio: "Meditatio", 
        oratio: "Oratio",
        contemplatio: "Contemplatio",
        actio: "Actio"
      }
    },
    homepage: {
      download: "Stáhnout",
      default_user: "Uživatel",
      profile: "Můj profil",
      notes: "Poznámky",
      login_required_title: "Přihlášení je potřeba",
      login_required_message: "Pro přístup k této funkci se prosím přihlaste ke svému účtu.",
      logout_confirm_title: "Odhlášení",
      logout_confirm_message: "Opravdu se chcete odhlásit ze svého účtu?"
    },
    
    // Hero sekcia na hlavnej stránce
    hero: {
      badge: "INTERAKTIVNÍ PRŮVODCE",
      title: "Naučte se Lectio Divina",
      subtitle: "Krok za krokem vás provedeme celým procesem modlitby Lectio Divina",
      cta_primary: "Začít průvodce",
      cta_secondary: "O Lectio Divina", 
      scroll_hint: "Prozkoumat více"
    },
    calendar_admin_title: "Úprava kalendáře",
    language: "Jazyk",
    import_excel: "Importovat Excel",
    add_item: "Přidat položku",
    global_search: "Globální vyhledávání",
    search_name: "Jméno",
    search_liturgical: "Liturgický den",
    search_saints: "Svatí",
    clear_filters: "Vyčistit filtry",
    date: "Datum",
    name: "Jméno",
    liturgical_day: "Liturgický den",
    saints: "Svatí",
    lang: "Jazyk",
    actions: "Akce",
    edit: "Upravit",
    delete: "Smazat",
    previous: "Předchozí",
    next: "Další",
    page: "Stránka",
    of: "z",
    no_records: "Žádné záznamy",
    confirm_delete: "Opravdu chcete smazat tento záznam?",
    error_add: "Chyba při přidávání",
    error_edit: "Chyba při ukládání.",
    error_import: "Chyba při importu",
    imported: "Importováno!",
    adding: "Přidávám...",
    add: "Přidat",
    save: "Uložit",
    cancel: "Zrušit",
    loading: "Načítám...",
    dashboard: "Nástěnka",
    calendar: "Kalendář",
    daily_quotes: "Citáty dne",
    content_cards: "Obsahové karty",
    editing: "Upravuji...",
    edit_inline_hint: "Dvojklik pro úpravu",
    unsaved_changes: "Nevyplněné povinné pole nebo nezměněné údaje.",
    export_excel: "Exportovat Excel",
    date_from: "Datum od",
    date_to: "Datum do",
    daily_quotes_admin_title: "Úprava denních citátů",
    quote: "Citát",
    reference: "Reference",
    item_not_found: "Položka nenalezena",
    edit_quote_title: "Upravit citát",
    save_success: "Úspěšně uloženo",
    save_error: "Chyba při ukládání",
    news: "Novinky",
    news_admin_title: "Správa novinek",
    edit_news_title: "Upravit novinku",
    title: "Nadpis",
    summary: "Souhrn",
    image_url: "Obrázek URL",
    content: "Obsah",
    published_at: "Publikováno",
    likes: "Líbí se mi",
    saving: "Ukládám...",
    add_news_title: "Přidat nový článek",
    // Article statuses
    article_status: {
      draft: "Návrh",
      published: "Publikované",
      archived: "Archivované"
    },
    preparing: "PŘIPRAVUJEME",
    app_title: "Lectio Divina",
    app_subtitle: "aplikace pro každý den",
    app_desc: "Nová mobilní aplikace Lectio Divina pro Android a iOS. Objevte sílu Božího slova a zamyšlení na každý den.",
    days: "Dní",
    hours: "Hodiny",
    minutes: "Minuty",
    seconds: "Sekundy",
    more: "Zjistit více",
    lectio_steps: [
      {
        title: "LECTIO",
        desc: "Začněte číst Písmo – čtěte jej pomalu, opakovaně a nechte je na sebe působit. Dopřejte si čas, není kam spěchat.",
      },
      {
        title: "MEDITATIO",
        desc: "Co vás oslovilo? Co se v textu děje? Dokážete se v něm vidět? Oživte tuto část ve svém srdci a mysli.",
      },
      {
        title: "ORATIO",
        desc: "Jaké modlitby ve vás text vyvolává? O čem chcete Bohu říct? Jaký rozhovor začíná mezi vámi a Bohem?",
      },
      {
        title: "CONTEMPLATIO",
        desc: "Co vám Bůh říká v tomto úryvku? Jak to rezonuje ve vašem životě? Je to pro vás těžké nebo povzbuzující?",
      },
    ],
    lectio_section_title: "Lectio divina – Actio",

    // NOVÉ PREKLADY PRE SPRIEVODCU - CZ
    lectio_guide_section: {
      badge: "INTERAKTIVNÍ PRŮVODCE",
      title: "Naučte se Lectio Divina",
      subtitle: "Krok za krokem vás provedeme celým procesem modlitby Lectio Divina. Každý krok obsahuje praktické návody, příklady a cvičení.",
      total_duration: "30-60 minut celkově",
      steps_count: "5 interaktivních kroků",
      start_step: "Začít krok",
      
      steps: [
        {
          title: "Lectio",
          subtitle: "Čtení",
          description: "Pozorné a pomalé čtení Božího slova s otevřeným srdcem",
          duration: "5-10 min"
        },
        {
          title: "Meditatio",
          subtitle: "Rozjímání",
          description: "Hluboké přemýšlení nad textem, hledání osobního poselství",
          duration: "10-15 min"
        },
        {
          title: "Oratio",
          subtitle: "Modlitba",
          description: "Otevřený rozhovor s Bohem, sdílení myšlenek a pocitů",
          duration: "5-10 min"
        },
        {
          title: "Contemplatio",
          subtitle: "Kontemplace",
          description: "Tiché setrvávání v Boží přítomnosti, přijímání jeho lásky",
          duration: "10-20 min"
        },
        {
          title: "Actio",
          subtitle: "Konání",
          description: "Přetvoření poznaného do praktického života a činů lásky",
          duration: "Celý den"
        }
      ],
      
      cta: {
        title: "Připraveni začít svou duchovní cestu?",
        description: "Začněte úvodem, který vám vysvětlí základy Lectio Divina, nebo přejděte přímo na první krok - Lectio.",
        start_with_intro: "Začít úvodem",
        go_to_lectio: "Přejít na Lectio"
      }
    },

    // Navigácia pre sprievodcu - CZ
    navigation: {
      guide: "Průvodce",
      guide_dropdown: {
        intro: {
          label: "Úvod do Lectio Divina",
          description: "Základy a přehled všech kroků"
        },
        lectio: {
          label: "1. Lectio - Čtení",
          description: "Pozorné čtení Božího slova"
        },
        meditatio: {
          label: "2. Meditatio - Rozjímání",
          description: "Hluboké přemýšlení nad textem"
        },
        oratio: {
          label: "3. Oratio - Modlitba",
          description: "Rozhovor s Bohem"
        },
        contemplatio: {
          label: "4. Contemplatio - Kontemplace",
          description: "Tiché setrvávání s Bohem"
        },
        actio: {
          label: "5. Actio - Konání",
          description: "Přetvoření do života"
        }
      }
    },

    cookie_info: "Tato stránka používá cookies a localStorage pro lepší zážitek a uložení jazykové preference.",
    cookie_agree: "Souhlasím",
    cookie_decline: "Odmítám",
    accept_cookies: "Souhlasím s cookies",
    decline_cookies: "Nesouhlasím",
    cookie_title: "Cookies",
    cookie_text: "Tato stránka používá cookies k analýze návštěvnosti a zlepšení fungování.",
    close: "Zavřít",
    accept_cookies_text: "Souhlasím s používáním cookies pro lepší zážitek a uložení jazykových preferencí.",
    decline_cookies_text: "Nesouhlasím s používáním cookies a localStorage. Může to ovlivnit funkčnost stránky.",
    cookie_consent: "Souhlas s cookies",
    cookie_consent_desc: "Tato stránka používá cookies a localStorage pro zlepšení uživatelského zážitku a uložení jazykových preferencí. Můžete si vybrat, zda souhlasíte s jejich používáním.",
    cookie_consent_agree: "Souhlasím",
    cookie_consent_decline: "Nesouhlasím",
    cookie_consent_info: "Tato stránka používá cookies a localStorage k analýze návštěvnosti a zlepšení uživatelského zážitku. Můžete si vybrat, zda souhlasíte s jejich používáním.",
    cookie_consent_agree_text: "Souhlasím s používáním cookies a localStorage pro lepší zážitek a uložení jazykových preferencí.",
    cookie_consent_decline_text: "Nesouhlasím s používáním cookies a localStorage. Může to ovlivnit funkčnost stránky.",
    cookie_consent_title: "Souhlas s cookies",  
    app_section: {
      headline: "MOBILNÍ APLIKACE",
      lead: "Zveme vás, abyste prohloubili svůj duchovní život s aplikací Lectio Divina!",
      tagline: "Dát Božímu Slovu prostor ve vašem srdci.",
      p1: "Lectio Divina je starobylá forma modlitby, kterou po staletí praktikovali řeholní komunity i jednotlivci. Nyní můžete tuto obohacující praxi začlenit do svého každodenního života i vy!",
      p2: "Zveme vás ke stažení naší nové aplikace Lectio Divina a k tomu, abyste dali Božímu Slovu prostor ve svém srdci. Ať už se rozhodnete pro Lectio sami, v rodině nebo v malé skupině, skrze čtení Božího Slova se váš život s Bohem začne prohlubovat a rozkvétat.",
      p3: "Stáhněte si aplikaci Lectio Divina ještě dnes a začněte svou cestu k hlubšímu vztahu s Bohem!",
      note: "Aplikace je momentálně dostupná v slovenštině.",
      more: "Více o Lectio Divina na www.lectio.one",
      alt: "Ilustrace mobilní aplikace",
      apple_store_alt: "Stáhnout z App Store",
      google_play_alt: "Stáhnout z Google Play",
    },
    review_slider: {
      aria_label: "Přejít na recenzi",
      items: [
        {
          author: "Jana H.",
          text: "Úžasná aplikace, každé ráno se těším na čtení a konečně rozumím, co ke mně Bůh mluví, a cítím radost i pokoj. Díky, otče Dušane.",
          rating: 5,
          platform: "Google Play"
        },
        {
          author: "Jkb982",
          text: "Rozhodně doporučuji! Na každý den úseky z Písma, nad kterými mohu rozjímat. Přesně tohle jsem hledal.",
          rating: 5,
          platform: "App Store"
        },
        {
          author: "Štefan J.",
          text: "Skvělá pomůcka pro duchovní zrání. Aplikace je přehledná a obsahuje moderní prvky. Díky za službu :)",
          rating: 5,
          platform: "Google Play"
        },
        {
          author: "Ummarti",
          text: "Skvělá práce. Aplikaci používám denně. Oceňuji možnost texty si poslechnout a dokonce v různých překladech. Krátká zamyšlení jsou trefná a často mi otevřou nový pohled na \"známý text\" Písma. Děkuji také za \"Advent\", všechna zamyšlení a hlavně vysvětlující komentáře. Díky za váš čas a námahu.",
          rating: 5,
          platform: "Google Play"
        },
        {
          author: "Vladislav H.",
          text: "Texty k meditaci, více překladů na jednom místě i inspirativní zamyšlení. Pro mě skvělý pomocník pro růst v duchovním životě.",
          rating: 5,
          platform: "Google Play"
        }
      ]
    },
    users_id: "Uživatelé",
    latest_news: "Nejnovější články",
    show_article: "Zobrazit článek",
    show_all_news: "Zobrazit všechny články",
    no_articles: "Žádné články nebyly nalezeny.",
    previous_article: "Předchozí článek",
    next_article: "Následující článek",
    lectio_admin_title: "Správa Lectio Divina",
    hlava: "Nadpis",
    suradnice_pismo: "Souřadnice Písma",
    datum: "Datum",
    lectio:"Lectio divina",
    footer: {
      contact: "Kontakt",
      legal_info: "Právní informace",
      links: "Odkazy",
      terms: "Všeobecné obchodní podmínky",
      privacy: "Ochrana osobních údajů - Mobilní aplikace",
      privacy_policy: "Ochrana osobních údajů",
      manage_cookies: "Spravovat cookies",
      all_rights_reserved: "Všechna práva vyhrazena",
      created_by: "vytvořil",
      admin_tooltip: "Administrace",
      follow_us: "Sledujte nás"
    },
    community_section: {
      headline: "Připojte se k nám",
      subtitle: "Staňte se součástí naší rostoucí komunity věřících",
      description: "Hledáme nadšence, kteří nám pomohou vytvořit lepší aplikaci pro modlitbu a duchovní růst. Bez ohledu na to, zda chcete testovat, získávat novinky nebo sdílet nápady - máme pro vás místo.",
      tester_title: "Staň se testerem",
      tester_desc: "Pomozte nám otestovat nové funkce a vylepšení před jejich oficiálním spuštěním. Vaše zpětná vazba je neocenitelná pro vývoj aplikace.",
      newsletter_title: "Přihlaste se k newsletteru",
      newsletter_desc: "Buďte prvními, kteří se dozvědí o nových funkcích, duchovních článcích a důležitých aktualizacích aplikace.",
      idea_title: "Máte nápad?",
      idea_desc: "Sdílejte s námi své nápady na vylepšení aplikace, nové funkce nebo obsah, který by vám pomohl v duchovním růstu.",
      form_name: "Vaše jméno",
      form_email: "Emailová adresa",
      form_message: "Zpráva nebo nápad",
      form_interests: "Co vás zajímá?",
      interest_tester: "Chci pomoci s testováním aplikace",
      interest_newsletter: "Chci dostávat newsletter",
      interest_idea: "Mám nápad na vylepšení",
      submit_btn: "Připojit se ke komunitě",
      success_message: "Děkujeme! Vaše žádost byla úspěšně odeslána. Brzy vás budeme kontaktovat.",
      error_message: "Nastala chyba. Zkontrolujte, zda jste vyplnili všechna povinná pole a zkuste znovu.",
      required_field: "Povinné pole",
      loading_form: "Načítám formulář...",
      message_placeholder: "Vaše zpráva nebo nápad..."
    },
    community_admin_title: "Správa členů komunity",
    community_member_detail: "Detail člena komunity",
    community_stats: {
      total_members: "Celkem členů",
      testers: "Testoři",
      newsletter_subscribers: "Newsletter", 
      idea_contributors: "Nápady"
    },
    community_interests: {
      testing: "Testování",
      newsletter: "Newsletter",
      ideas: "Nápady"
    },
    community_actions: {
      send_email: "Napsat email",
      invite_testing: "Pozvat na testování",
      add_newsletter: "Přidat do newsletteru",
      edit_member: "Upravit člena",
      delete_member: "Smazat člena"
    },
    community_filters: {
      want_testing: "Chce testovat",
      want_newsletter: "Chce newsletter",
      has_idea: "Má nápad",
      registration_date: "Datum registrace"
    },
    community_form: {
      basic_info: "Základní informace",
      interests_preferences: "Zájmy a preference",
      message_idea: "Zpráva nebo nápad",
      quick_actions: "Rychlé akce",
      wants_testing: "Chce testovat aplikaci",
      wants_newsletter: "Chce dostávat newsletter",
      has_improvement_idea: "Má nápad na vylepšení",
      no_message: "Žádná zpráva nebyla zadána",
      last_updated: "Poslední aktualizace"
    },
    community: "Komunita",
    dailyQuote: {
      loading: "Načítám dnešní citát...",
      todayLabel: "DNEŠNÍ CITÁT",
      notFound: "Dnešní citát nebyl nalezen",
      notFoundDescription: "Zkuste to prosím později nebo si přečtěte naše archivní citáty.",
      error: "Chyba při načítání citátu",
      no_quote_today: "Pro dnešní den není k dispozici žádná myšlenka.",
      check_back_tomorrow: "Zkuste to zítra."
    },
    lectioStepsSection: {
  title: "Lectio Divina - Pět kroků",
  subtitle: "Objevte duchovní cestu skrze pět kroků Lectio Divina - prastarou křesťanskou praxi meditace"
},

    lectio_steps_new: [
      {
        title: "Lectio - Čtení",
        desc: "Pozorné čtení Božího slova s otevřeným srdcem a myslí"
      },
      {
        title: "Meditatio - Rozjímání",
        desc: "Hluboké přemýšlení nad textem a hledání osobního poselství"
      },
      {
        title: "Oratio - Modlitba",
        desc: "Rozhovor s Bohem o tom, co jste v textu objevili"
      },
      {
        title: "Contemplatio - Kontemplace",
        desc: "Tiché odpočinutí v Boží přítomnosti a lásce"
      },
      {
        title: "Actio - Skutek",
        desc: "Přetvoření duchovní zkušenosti do konkrétních skutků lásky"
      }
    ],
    newsDetail: {
      article_badge: "ČLÁNEK", 
      reading_time: "min čtení",
      published_on: "Publikováno"
    },
    homeNewsSection: {
      title: "Nejnovější články",
      badge: "NEJNOVĚJŠÍ ZPRÁVY",
      subtitle: "Zůstaňte informováni o nejnovějších událostech a duchovních tématech",
      loading: "Načítám články pro jazyk:",
      error_title: "Chyba při načítání článků",
      error_check: "Zkontrolujte Supabase databázi a údaje pro jazyk",
      no_articles_title: "Zatím žádné články",
      no_articles_desc: "Žádné články pro jazyk \"{lang}\" nebyly nalezeny.",
      new_badge: "NOVÝ",
      show_article: "Zobrazit článek",
      show_all_articles: "Zobrazit všechny články"
    },
    newsListPage: {
      title: "Nejnovější články",
      all_articles_badge: "VŠECHNY ČLÁNKY",
      subtitle: "Přečtěte si nejnovější články a duchovní úvahy", 
      search_placeholder: "Hledat články...",
      sort_by_date: "Podle data",
      sort_by_likes: "Podle oblíbenosti",
      reading_time: "min čtení",
      new_badge: "NOVÝ", 
      showing_results: "Zobrazuje se {count} z {total} článků",
      search_results_for: " pro \"{searchTerm}\"",
      no_search_results_title: "Žádné výsledky",
      no_search_results_desc: "Nenašly se žádné články pro hledaný výraz \"{searchTerm}\". Zkuste jiná klíčová slova.",
      clear_search: "Vymazat vyhledávání",
      no_articles_title: "Žádné články", 
      no_articles_desc: "Žádné články nebyly nalezeny."
    },

    // Notes page translations
    notesPage: {
      title: "Moje poznámky",
      notes_count: "poznámka",
      notes_count_plural: "poznámek",
      new_note: "Nová poznámka",
      search_placeholder: "Hledat v poznámkách...",
      loading: "Načítám poznámky...",
      loading_auth: "Načítám...",
      redirecting_login: "Přesměrovávám na přihlášení...",
      empty_state: {
        title: "Zatím žádné poznámky",
        subtitle: "Klikněte na 'Nová poznámka' a začněte psát své myšlenky",
        button: "Vytvořit první poznámku"
      },
      empty_editor: {
        title: "Vyberte poznámku",
        subtitle: "Klikněte na poznámku v seznamu vlevo nebo vytvořte novou poznámku",
        button: "Vytvořit novou poznámku"
      },
      editor: {
        tabs: {
          list: "Seznam",
          editor: "Editor"
        },
        modes: {
          new_title: "Nová poznámka",
          edit_title: "Upravit poznámku",
          empty_title: "Začít psát"
        },
        form: {
          title_label: "Název poznámky *",
          title_placeholder: "Název vaší poznámky...",
          content_label: "Obsah poznámky *",
          content_placeholder: "Začněte psát své myšlenky...",
          bible_section_title: "Biblický odkaz",
          bible_reference_label: "Odkaz (např. Jan 3:16)",
          bible_reference_placeholder: "Jan 3:16",
          bible_quote_label: "Citát z Bible",
          bible_quote_placeholder: "Vložte text z Bible..."
        },
        actions: {
          save: "Uložit poznámku",
          saving: "Ukládám...",
          cancel: "Zrušit",
          delete: "Smazat poznámku"
        },
        validation: {
          required_fields: "Název a obsah poznámky jsou povinné"
        },
        confirm: {
          close_unsaved: "Máte neuloženou poznámku. Opravdu chcete zavřít editor?"
        }
      },
      metadata: {
        created: "Vytvořeno",
        updated: "Upraveno", 
        not_modified: "Poznámka nebyla upravována"
      }
    }
  },
  en: {
    give: "Give",
    the_app:"The App",
    explore:"Explore",
    prayer: "Prayer",
    rosary: "Rosary",
    today_lectio: "Today's Lectio",
    start_the_guide:"Start the guide",
    about_lectio_divina:"About Lectio Divina",
    support: "Support Project",
    welcome: "Welcome to Lectio Divina website",
    home: "Home",
    admin: "Administration",
    login: "Login",
    logout: "Logout",
    logout_success: "Successfully logged out.",
    select_language: "Select language",
    meet_your_hosts: "Meet Your Hosts",
    hosts_description: "We are a team of people who faithfully and passionately combine word, art and technology in the Lectio Divina project.",
    discover_more: "Discover Our Team",
    daily_actio: "Live God's Word (ACTIO)",
    navbar: {
      about_lectio: "About Lectio Divina",
      lectio_steps: {
        lectio: "Lectio",
        meditatio: "Meditatio", 
        oratio: "Oratio",
        contemplatio: "Contemplatio",
        actio: "Actio"
      }
    },
    homepage: {
      download: "Download",
      default_user: "User",
      profile: "My profile",
      notes: "Notes",
      login_required_title: "Login required",
      login_required_message: "Please sign in to access this feature.",
      logout_confirm_title: "Sign out",
      logout_confirm_message: "Are you sure you want to sign out of your account?"
    },

    calendar_admin_title: "Calendar Edit",
    language: "Language",
    import_excel: "Import Excel",
    add_item: "Add Item",
    global_search: "Global Search",
    search_name: "Name",
    search_liturgical: "Liturgical Day",
    search_saints: "Saints",
    clear_filters: "Clear filters",
    date: "Date",
    name: "Name",
    liturgical_day: "Liturgical Day",
    saints: "Saints",
    lang: "Language",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    previous: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
    no_records: "No records",
    confirm_delete: "Are you sure you want to delete this record?",
    error_add: "Error adding item",
    error_edit: "Error while saving.",
    error_import: "Import error",
    imported: "Imported!",
    adding: "Adding...",
    add: "Add",
    save: "Save",
    cancel: "Cancel",
    loading: "Loading...",
    dashboard: "Dashboard",
    calendar: "Calendar",
    daily_quotes: "Daily Quotes",
    content_cards: "Content Cards",
    editing: "Editing...",
    edit_inline_hint: "Double-click to edit",
    unsaved_changes: "Missing required field or no changes.",
    export_excel: "Export Excel",
    date_from: "Date from",
    date_to: "Date to",
    daily_quotes_admin_title: "Daily Quotes Admin",
    quote: "Quote",
    reference: "Reference",
    item_not_found: "Item not found",
    edit_quote_title: "Edit quote",
    save_success: "Saved successfully",
    save_error: "Error while saving",
    news: "News",
    news_admin_title: "News Admin",
    edit_news_title: "Edit news",
    title: "Title",
    summary: "Summary",
    image_url: "Image URL",
    content: "Content",
    published_at: "Published",
    likes: "Likes",
    saving: "Saving...",
    add_news_title: "Add new article",
    // Article statuses
    article_status: {
      draft: "Draft",
      published: "Published",
      archived: "Archived"
    },
    preparing: "COMING SOON",
    app_title: "Lectio Divina",
    app_subtitle: "an app for every day",
    app_desc: "New Lectio Divina mobile app for Android and iOS. Discover the power of God's word and daily reflections.",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    more: "Learn more",
    lectio_steps: [
      {
        title: "LECTIO",
        desc: "Begin by reading Scripture – read it again, slowly, and let it sink in. Take your time. There's no need to rush.",
      },
      {
        title: "MEDITATIO",
        desc: "What stands out to you in what you read? What is happening in the passage? Can you picture yourself in it? Bring it alive in your heart and mind.",
      },
      {
        title: "ORATIO",
        desc: "As Scripture comes alive, what prayers form in your heart? What do you want to discuss with God? What conversation begins for you?",
      },
      {
        title: "CONTEMPLATIO",
        desc: "What is God saying to you in this passage? How does it resonate in your life? Is it challenging or encouraging for you?",
      },
    ],
    lectio_section_title: "Lectio divina – Actio",

    // NOVÉ PREKLADY PRE SPRIEVODCU - EN
    lectio_guide_section: {
      badge: "INTERACTIVE GUIDE",
      title: "Learn Lectio Divina",
      subtitle: "Step by step we will guide you through the entire Lectio Divina prayer process. Each step contains practical instructions, examples and exercises.",
      total_duration: "30-60 minutes total",
      steps_count: "5 interactive steps",
      start_step: "Start step",
      
      steps: [
        {
          title: "Lectio",
          subtitle: "Reading",
          description: "Attentive and slow reading of God's word with an open heart",
          duration: "5-10 min"
        },
        {
          title: "Meditatio",
          subtitle: "Meditation",
          description: "Deep reflection on the text, seeking personal message",
          duration: "10-15 min"
        },
        {
          title: "Oratio",
          subtitle: "Prayer",
          description: "Open conversation with God, sharing thoughts and feelings",
          duration: "5-10 min"
        },
        {
          title: "Contemplatio",
          subtitle: "Contemplation",
          description: "Silent abiding in God's presence, receiving his love",
          duration: "10-20 min"
        },
        {
          title: "Actio",
          subtitle: "Action",
          description: "Transformation of knowledge into practical life and acts of love",
          duration: "All day"
        }
      ],
      
      cta: {
        title: "Ready to begin your spiritual journey?",
        description: "Start with the introduction that explains the basics of Lectio Divina, or go directly to the first step - Lectio.",
        start_with_intro: "Start with Introduction",
        go_to_lectio: "Go to Lectio"
      }
    },

    // Navigácia pre sprievodcu - EN
    navigation: {
      guide: "Guide",
      guide_dropdown: {
        intro: {
          label: "Introduction to Lectio Divina",
          description: "Basics and overview of all steps"
        },
        lectio: {
          label: "1. Lectio - Reading",
          description: "Attentive reading of God's word"
        },
        meditatio: {
          label: "2. Meditatio - Meditation",
          description: "Deep reflection on the text"
        },
        oratio: {
          label: "3. Oratio - Prayer",
          description: "Conversation with God"
        },
        contemplatio: {
          label: "4. Contemplatio - Contemplation",
          description: "Silent abiding with God"
        },
        actio: {
          label: "5. Actio - Action",
          description: "Transformation into life"
        }
      }
    },

    cookie_info: "This website uses cookies and localStorage for a better experience and to store language preferences.",
    cookie_agree: "I agree",
    cookie_decline: "Decline",
    accept_cookies: "I agree to cookies",
    decline_cookies: "I do not agree",
    cookie_title: "Cookies",
    cookie_text: "This site uses cookies to analyze traffic and improve functionality.",
    close: "Close",
    accept_cookies_text: "I agree to the use of cookies for a better experience and to store language preferences.",
    decline_cookies_text: "I do not agree to the use of cookies and localStorage. This may affect site functionality.",
    cookie_consent: "Cookie Consent",
    cookie_consent_desc: "This site uses cookies and localStorage to enhance user experience and store language preferences. You can choose whether you agree to their use.",
    cookie_consent_agree: "I agree",
    cookie_consent_decline: "I do not agree",
    cookie_consent_info: "This site uses cookies and localStorage to analyze traffic and improve user experience. You can choose whether you agree to their use.",
    cookie_consent_agree_text: "I agree to the use of cookies and localStorage for a better experience and to store language preferences.",
    cookie_consent_decline_text: "I do not agree to the use of cookies and localStorage. This may affect site functionality.",
    cookie_consent_title: "Cookie Consent",
    app_section: {
      headline: "MOBILE APP",
      lead: "We invite you to deepen your spiritual life with the Lectio Divina app!",
      tagline: "Give God's Word space in your heart.",
      p1: "Lectio Divina is an ancient form of prayer practiced for centuries by religious communities and individuals. Now you can integrate this enriching practice into your everyday life!",
      p2: "Download our new Lectio Divina app and give God's Word space in your heart. Whether you choose Lectio alone, with your family, or in a small group, through reading God's Word your life with God will deepen and blossom.",
      p3: "Download the Lectio Divina app today and begin your journey to a deeper relationship with God!",
      note: "The app is currently available in Slovak.",
      more: "More about Lectio Divina at www.lectio.one",
      alt: "Illustration of the mobile app",
      apple_store_alt: "Download on the App Store",
      google_play_alt: "Get it on Google Play",
    },
    review_slider: {
      aria_label: "Go to review",
      items: [
        {
          author: "Jana H.",
          text: "Amazing app. Every morning I look forward to reading and I finally understand what God is speaking to me; I feel joy and peace. Thank you, Father Dušan.",
          rating: 5,
          platform: "Google Play"
        },
        {
          author: "Jkb982",
          text: "Highly recommend! Daily passages of Scripture to meditate on. Exactly what I was looking for.",
          rating: 5,
          platform: "App Store"
        },
        {
          author: "Štefan J.",
          text: "Great tool for spiritual growth. The app is clear and includes modern features. Thanks for the service :)",
          rating: 5,
          platform: "Google Play"
        },
        {
          author: "Ummarti",
          text: "Great work. I use the app every day. I appreciate being able to listen to the texts, even in different translations. The short reflections are so spot-on and often open a new view of a \"familiar text\" of Scripture. Thank you also for the Advent reflections and especially the explanatory comments. Thanks for your time and effort.",
          rating: 5,
          platform: "Google Play"
        },
        {
          author: "Vladislav H.",
          text: "Texts for meditation, multiple translations in one place, and reflections for inspiration. For me, an excellent companion for growing in the spiritual life.",
          rating: 5,
          platform: "Google Play"
        }
      ]
    },
    users_id: "Users",
    latest_news: "Latest Articles",
    show_article: "Read Article",
    show_all_news: "Show all articles",
    no_articles: "No articles found.",
    previous_article: "Previous article",
    next_article: "Next article",
    lectio_admin_title: "Lectio Divina Admin",
    hlava: "Title",
    suradnice_pismo: "Scripture reference",
    datum: "Date",
    lectio:"Lectio divina",
  resetPassword: {
      // Page titles and headers
      title: 'Reset Password',
      verifyingLink: 'Verifying password reset link...',
      processingAuth: 'Processing authentication...',
      
      // Form labels
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      enterNewPassword: 'Enter new password',
      confirmNewPassword: 'Confirm new password',
      changePassword: 'Change Password',
      saving: 'Saving...',
      
      // Password requirements
      passwordRequirements: 'Password must contain at least 8 characters, uppercase and lowercase letters, a number, and a special character.',
      mustBeDifferent: 'Must be different from your current password.',
      
      // Validation messages
      passwordMinLength: 'Password must be at least 8 characters long.',
      passwordLowercase: 'Password must contain a lowercase letter.',
      passwordUppercase: 'Password must contain an uppercase letter.',
      passwordNumber: 'Password must contain a number.',
      passwordSpecial: 'Password must contain a special character.',
      passwordsMismatch: 'Passwords do not match.',
      
      // Error messages
      verificationFailed: 'Failed to verify link',
      sessionCreateFailed: 'Failed to create session from authentication code.',
      systemError: 'System error',
      missingCode: 'Missing authentication code in link.',
      unknownError: 'Unknown error',
      sessionExpired: 'Session expired. Please use a new password reset link.',
      sessionCheckError: 'Error checking session',
      invalidLink: 'Password reset link is invalid or expired.',
      passwordDifferentRequired: 'New password must be different from your current password.',
      passwordTooWeak: 'Password is too weak. Use a stronger password.',
      passwordUpdateFailed: 'Failed to change password. Please try again.',
      
      // Success messages
      passwordChanged: 'Password successfully changed! You can now sign in to the app with your new password.',
      success: 'Success!',
      
      // Instructions
      nextSteps: 'Next steps:',
      openMobileApp: 'Open the Lectio Divina mobile app',
      loginWithNewPassword: 'Sign in with your email and new password',
      closeThisPage: 'You can close this page',
      
      // Invalid link section
      invalidLinkTitle: 'Invalid Link',
      linkExpiredDesc: 'The password reset link has expired or is invalid.',
      requestNewLink: 'Request a new password reset link',
      
      // Tips
      tipEmailValidity: 'Email password reset links are valid for only 1 hour for security reasons.',
    },
    footer: {
      contact: "Contact",
      legal_info: "Legal Information",
      links: "Links",
      terms: "Terms and Conditions",
      privacy: "Privacy Policy - Mobile App",
      privacy_policy: "Privacy Policy",
      manage_cookies: "Manage cookies",
      all_rights_reserved: "All rights reserved",
      created_by: "created by",
      admin_tooltip: "Administration",
      follow_us: "Follow Us"
    },
    community_section: {
      headline: "Join Our Community",
      subtitle: "Become part of our growing community of believers",
      description: "We're looking for enthusiasts who will help us create a better app for prayer and spiritual growth. Whether you want to test, receive news, or share ideas - we have a place for you.",
      tester_title: "Become a Tester",
      tester_desc: "Help us test new features and improvements before their official release. Your feedback is invaluable for app development.",
      newsletter_title: "Subscribe to Newsletter",
      newsletter_desc: "Be the first to learn about new features, spiritual articles, and important app updates.",
      idea_title: "Have an Idea?",
      idea_desc: "Share your ideas for app improvements, new features, or content that would help you in spiritual growth.",
      form_name: "Your Name",
      form_email: "Email Address",
      form_message: "Message or Idea",
      form_interests: "What interests you?",
      interest_tester: "I want to help with app testing",
      interest_newsletter: "I want to receive newsletter",
      interest_idea: "I have an improvement idea",
      submit_btn: "Join the Community",
      success_message: "Thank you! Your request has been successfully submitted. We will contact you soon.",
      error_message: "An error occurred. Please check that you have filled in all required fields and try again.",
      required_field: "Required field",
      loading_form: "Loading form...",
      message_placeholder: "Your message or idea..."
    },
    community_admin_title: "Community Members Management",
    community_member_detail: "Community Member Detail",
    community_stats: {
      total_members: "Total Members",
      testers: "Testers",
      newsletter_subscribers: "Newsletter",
      idea_contributors: "Ideas"
    },
    community_interests: {
      testing: "Testing",
      newsletter: "Newsletter",
      ideas: "Ideas"
    },
    community_actions: {
      send_email: "Send Email",
      invite_testing: "Invite to Testing",
      add_newsletter: "Add to Newsletter",
      edit_member: "Edit Member",
      delete_member: "Delete Member"
    },
    community_filters: {
      want_testing: "Wants Testing",
      want_newsletter: "Wants Newsletter",
      has_idea: "Has Idea",
      registration_date: "Registration Date"
    },
    community_form: {
      basic_info: "Basic Information",
      interests_preferences: "Interests and Preferences",
      message_idea: "Message or Idea",
      quick_actions: "Quick Actions",
      wants_testing: "Wants to test application",
      wants_newsletter: "Wants to receive newsletter",
      has_improvement_idea: "Has improvement idea",
      no_message: "No message was provided",
      last_updated: "Last Updated"
    },
    community: "Community", 
    dailyQuote: {
      loading: "Loading today's quote...",
      todayLabel: "TODAY'S QUOTE",
      notFound: "Today's quote was not found",
      notFoundDescription: "Please try again later or read our archived quotes.",
      error: "Error loading quote",
      no_quote_today: "No quote is available for today.",
      check_back_tomorrow: "Please check back tomorrow."
    },
    lectioStepsSection: {
      title: "Lectio Divina - Five Steps",
      subtitle: "Discover the spiritual journey through five steps of Lectio Divina - an ancient Christian practice of meditation"
    },

    lectio_steps_new: [
      {
        title: "Lectio - Reading",
        desc: "Attentive reading of God's word with an open heart and mind"
      },
      {
        title: "Meditatio - Meditation",
        desc: "Deep reflection on the text and seeking personal message"
      },
      {
        title: "Oratio - Prayer",
        desc: "Conversation with God about what you discovered in the text"
      },
      {
        title: "Contemplatio - Contemplation",
        desc: "Silent resting in God's presence and love"
      },
      {
        title: "Actio - Action",
        desc: "Transforming spiritual experience into concrete acts of love"
      }
    ],
    newsDetail: {
      article_badge: "ARTICLE",
      reading_time: "min read", 
      published_on: "Published on"
    },
    homeNewsSection: {
      title: "Latest Articles",
      badge: "LATEST NEWS",
      subtitle: "Stay informed about the latest events and spiritual topics",
      loading: "Loading articles for language:",
      error_title: "Error loading articles",
      error_check: "Check Supabase database and data for language",
      no_articles_title: "No articles yet",
      no_articles_desc: "No articles for language \"{lang}\" were found.",
      new_badge: "NEW",
      show_article: "Show article", 
      show_all_articles: "Show all articles"
    },
    newsListPage: {
      title: "Latest Articles",
      all_articles_badge: "ALL ARTICLES",
      subtitle: "Read the latest articles and spiritual reflections",
      search_placeholder: "Search articles...",
      sort_by_date: "By date",
      sort_by_likes: "By popularity",
      reading_time: "min read",
      new_badge: "NEW",
      showing_results: "Showing {count} of {total} articles", 
      search_results_for: " for \"{searchTerm}\"",
      no_search_results_title: "No results",
      no_search_results_desc: "No articles found for search term \"{searchTerm}\". Try different keywords.",
      clear_search: "Clear search",
      no_articles_title: "No articles",
      no_articles_desc: "No articles were found."
    },

    // Notes page translations
    notesPage: {
      title: "My Notes",
      notes_count: "note",
      notes_count_plural: "notes",
      new_note: "New Note",
      search_placeholder: "Search notes...",
      loading: "Loading notes...",
      loading_auth: "Loading...",
      redirecting_login: "Redirecting to login...",
      empty_state: {
        title: "No notes yet",
        subtitle: "Click 'New Note' and start writing your thoughts",
        button: "Create first note"
      },
      empty_editor: {
        title: "Select a note",
        subtitle: "Click on a note in the left list or create a new note",
        button: "Create new note"
      },
      editor: {
        tabs: {
          list: "List",
          editor: "Editor"
        },
        modes: {
          new_title: "New Note",
          edit_title: "Edit Note",
          empty_title: "Start Writing"
        },
        form: {
          title_label: "Note Title *",
          title_placeholder: "Your note title...",
          content_label: "Note Content *",
          content_placeholder: "Start writing your thoughts...",
          bible_section_title: "Bible Reference",
          bible_reference_label: "Reference (e.g. John 3:16)",
          bible_reference_placeholder: "John 3:16",
          bible_quote_label: "Bible Quote",
          bible_quote_placeholder: "Insert text from Bible..."
        },
        actions: {
          save: "Save Note",
          saving: "Saving...",
          cancel: "Cancel",
          delete: "Delete Note"
        },
        validation: {
          required_fields: "Note title and content are required"
        },
        confirm: {
          close_unsaved: "You have an unsaved note. Do you really want to close the editor?"
        }
      },
      metadata: {
        created: "Created",
        updated: "Updated", 
        not_modified: "Note was not modified"
      }
    }
  },
  es: {
    give: "Donar",
    the_app:"La App",
    explore: "Explorar",
    prayer: "Oración",
    rosary: "Rosario",
    today_lectio: "Lectio de hoy",
    start_the_guide:"Iniciar la guía",
    about_lectio_divina:"Acerca de la Lectio Divina",
    support: "Apoyar Proyecto",
    welcome: "Bienvenido a la página de Lectio Divina",
    home: "Inicio",
    admin: "Administración",
    login: "Iniciar sesión",
    logout: "Cerrar sesión",
    logout_success: "Cierre de sesión exitoso.",
    select_language: "Seleccione el idioma",
    meet_your_hosts: "Conoce a Tus Anfitriones",
    hosts_description: "Somos un equipo de personas que con fe y pasión combinamos palabra, arte y tecnología en el proyecto Lectio Divina.",
    discover_more: "Descubre Nuestro Equipo",
    daily_actio: "Vive la Palabra de Dios (ACTIO)",
    navbar: {
      about_lectio: "Acerca de Lectio Divina",
      lectio_steps: {
        lectio: "Lectio",
        meditatio: "Meditatio", 
        oratio: "Oratio",
        contemplatio: "Contemplatio",
        actio: "Actio"
      }
    },
    homepage: {
      download: "Descargar",
      default_user: "Usuario",
      profile: "Mi perfil",
      notes: "Notas",
      login_required_title: "Inicio de sesión requerido",
      login_required_message: "Inicia sesión en tu cuenta para acceder a esta función.",
      logout_confirm_title: "Cerrar sesión",
      logout_confirm_message: "¿Estás seguro de que deseas cerrar sesión en tu cuenta?"
    },

    calendar_admin_title: "Edición del calendario",
    import_excel: "Importar Excel",
    add_item: "Agregar elemento",
    global_search: "Búsqueda global",
    search_name: "Nombre",
    search_liturgical: "Día litúrgico",
    search_saints: "Santos",
    clear_filters: "Limpiar filtros",
    date: "Fecha",
    name: "Nombre",
    liturgical_day: "Día litúrgico",
    saints: "Santos",
    lang: "Idioma",
    actions: "Acciones",
    edit: "Editar",
    delete: "Eliminar",
    previous: "Anterior",
    next: "Siguiente",
    page: "Página",
    of: "de",
    no_records: "No hay registros",
    confirm_delete: "¿Está seguro de que desea eliminar este registro?",
    error_add: "Error al agregar",
    error_edit: "Error al guardar.",
    error_import: "Error de importación",
    imported: "¡Importado!",
    adding: "Agregando...",
    add: "Agregar",
    save: "Guardar",
    cancel: "Cancelar",
    loading: "Cargando...",
    dashboard: "Panel",
    calendar: "Calendario",
    daily_quotes: "Citas del día",
    content_cards: "Tarjetas de contenido",
    editing: "Editando...",
    edit_inline_hint: "Doble clic para editar",
    unsaved_changes: "Falta campo requerido o no hay cambios.",
    export_excel: "Exportar Excel",
    date_from: "Fecha desde",
    date_to: "Fecha hasta",
    daily_quotes_admin_title: "Administrar citas diarias",
    quote: "Cita",
    reference: "Referencia",
    item_not_found: "Elemento no encontrado",
    edit_quote_title: "Editar cita",
    save_success: "Guardado con éxito",
    save_error: "Error al guardar",
    news: "Noticias",
    news_admin_title: "Administrar noticias",
    edit_news_title: "Editar noticia",
    title: "Título",
    summary: "Resumen",
    image_url: "URL de imagen",
    content: "Contenido",
    published_at: "Publicado",
    likes: "Me gusta",
    saving: "Guardando...",
    add_news_title: "Agregar nuevo artículo",
    // Article statuses
    article_status: {
      draft: "Borrador",
      published: "Publicado",
      archived: "Archivado"
    },
    preparing: "PRÓXIMAMENTE",
    app_title: "Lectio Divina",
    app_subtitle: "aplicación para cada día",
    app_desc: "Nueva aplicación móvil Lectio Divina para Android y iOS. Descubre el poder de la Palabra de Dios y reflexiones diarias.",
    days: "Días",
    hours: "Horas",
    minutes: "Minutos",
    seconds: "Segundos",
    more: "Saber más",
    lectio_steps: [
      {
        title: "LECTIO",
        desc: "Comienza leyendo la Escritura, léela de nuevo, despacio, y deja que penetre en ti. Tómate tu tiempo. No hay prisa.",
      },
      {
        title: "MEDITATIO",
        desc: "¿Qué te llama la atención de lo que has leído? ¿Qué sucede en el pasaje? ¿Puedes verte allí? Hazlo vivo en tu mente y corazón.",
      },
      {
        title: "ORATIO",
        desc: "Al dejar que la Escritura cobre vida, ¿qué oraciones se forman en tu corazón? ¿Qué quieres compartir con Dios? ¿Qué diálogo se inicia?",
      },
      {
        title: "CONTEMPLATIO",
        desc: "¿Qué te dice Dios en este fragmento? ¿Cómo resuena en tu vida? ¿Te desafía o te anima?",
      },
    ],
    lectio_section_title: "Lectio divina – Actio",

    // NOVÉ PREKLADY PRE SPRIEVODCU - ES
    lectio_guide_section: {
      badge: "GUÍA INTERACTIVA",
      title: "Aprende Lectio Divina",
      subtitle: "Paso a paso te guiaremos a través de todo el proceso de oración de Lectio Divina. Cada paso contiene instrucciones prácticas, ejemplos y ejercicios.",
      total_duration: "30-60 minutos en total",
      steps_count: "5 pasos interactivos",
      start_step: "Comenzar paso",
      
      steps: [
        {
          title: "Lectio",
          subtitle: "Lectura",
          description: "Lectura atenta y calmada de la palabra de Dios con corazón abierto",
          duration: "5-10 min"
        },
        {
          title: "Meditatio",
          subtitle: "Meditación",
          description: "Reflexión profunda sobre el texto, buscando mensaje personal",
          duration: "10-15 min"
        },
        {
          title: "Oratio",
          subtitle: "Oración",
          description: "Conversación abierta con Dios, compartiendo pensamientos y sentimientos",
          duration: "5-10 min"
        },
        {
          title: "Contemplatio",
          subtitle: "Contemplación",
          description: "Permanecer en silencio en la presencia de Dios, recibiendo su amor",
          duration: "10-20 min"
        },
        {
          title: "Actio",
          subtitle: "Acción",
          description: "Transformación de lo aprendido para practicarlo en la vida con actos de amor",
          duration: "Todo el día"
        }
      ],
      
      cta: {
        title: "¿Listo para comenzar tu viaje espiritual?",
        description: "Comienza con la introducción que explica los fundamentos de la Lectio Divina, o ve directamente al primer paso - Lectio.",
        start_with_intro: "Comenzar con Introducción",
        go_to_lectio: "Ir a Lectio"
      }
    },

    // Navigácia pre sprievodcu - ES
    navigation: {
      guide: "Guía",
      guide_dropdown: {
        intro: {
          label: "Introducción a Lectio Divina",
          description: "Fundamentos y resumen de todos los pasos"
        },
        lectio: {
          label: "1. Lectio - Lectura",
          description: "Lectura atenta de la palabra de Dios"
        },
        meditatio: {
          label: "2. Meditatio - Meditación",
          description: "Reflexión profunda sobre el texto"
        },
        oratio: {
          label: "3. Oratio - Oración",
          description: "Conversación con Dios"
        },
        contemplatio: {
          label: "4. Contemplatio - Contemplación",
          description: "Permanecer en silencio con Dios"
        },
        actio: {
          label: "5. Actio - Acción",
          description: "Transformación en la vida"
        }
      }
    },

    cookie_info: "Este sitio web utiliza cookies y localStorage para una mejor experiencia y para guardar las preferencias de idioma.",
    cookie_agree: "Acepto",
    cookie_decline: "Rechazo",
    accept_cookies: "Acepto las cookies",
    decline_cookies: "No acepto",
    cookie_title: "Cookies",
    cookie_text: "Este sitio utiliza cookies para analizar el tráfico y mejorar la funcionalidad.",
    close: "Cerrar",
    accept_cookies_text: "Acepto el uso de cookies para una mejor experiencia y para guardar las preferencias de idioma.",
    decline_cookies_text: "No acepto el uso de cookies y localStorage. Esto puede afectar la funcionalidad del sitio.",
    cookie_consent: "Consentimiento de cookies",
    cookie_consent_desc: "Este sitio utiliza cookies y localStorage para mejorar la experiencia del usuario y guardar las preferencias de idioma. Puedes elegir si aceptas su uso.",
    cookie_consent_agree: "Acepto",
    cookie_consent_decline: "No acepto",
    cookie_consent_info: "Este sitio utiliza cookies y localStorage para analizar el tráfico y mejorar la experiencia del usuario. Puedes elegir si aceptas su uso.",
    cookie_consent_agree_text: "Acepto el uso de cookies y localStorage para una mejor experiencia y para guardar las preferencias de idioma.",
    cookie_consent_decline_text: "No acepto el uso de cookies y localStorage. Esto puede afectar la funcionalidad del sitio.",
    cookie_consent_title: "Consentimiento de cookies",
    app_section: {
      headline: "APLICACIÓN MÓVIL",
      lead: "¡Te invitamos a profundizar tu vida espiritual con la aplicación Lectio Divina!",
      tagline: "Dale espacio a la Palabra de Dios en tu corazón.",
      p1: "Lectio Divina es una forma antigua de oración practicada durante siglos por comunidades religiosas y personas individuales. ¡Ahora puedes integrar esta práctica enriquecedora en tu vida cotidiana!",
      p2: "Descarga nuestra nueva aplicación Lectio Divina y dale un espacio a la Palabra de Dios en tu corazón. Ya sea que elijas Lectio a solas, en familia o en un pequeño grupo, a través de la lectura de la Palabra de Dios tu vida con Él empezará a profundizarse y florecer.",
      p3: "¡Descarga la aplicación Lectio Divina hoy y comienza tu camino hacia una relación más profunda con Dios!",
      note: "La aplicación está disponible actualmente en eslovaco.",
      more: "Más sobre Lectio Divina en www.lectio.one",
      alt: "Ilustración de la aplicación móvil",
      apple_store_alt: "Descargar en App Store",
      google_play_alt: "Obtener en Google Play",
    },
    review_slider: {
      aria_label: "Ir a la reseña",
      items: [
        {
          author: "Jana H.",
          text: "Aplicación increíble, cada mañana espero con ganas la lectura y por fin entiendo lo que Dios me dice; siento alegría y paz. Gracias, padre Dušan.",
          rating: 5,
          platform: "Google Play"
        },
        {
          author: "Jkb982",
          text: "La recomiendo totalmente. Pasajes diarios de la Escritura para meditar. Justo lo que buscaba.",
          rating: 5,
          platform: "App Store"
        },
        {
          author: "Štefan J.",
          text: "Excelente herramienta para el crecimiento espiritual. La app es clara e incluye elementos modernos. Gracias por el servicio :)",
          rating: 5,
          platform: "Google Play"
        },
        {
          author: "Ummarti",
          text: "Gran trabajo. Uso la aplicación cada día. Aprecio poder escuchar los textos, incluso en diferentes traducciones. Las breves reflexiones son muy acertadas y a menudo me abren una nueva mirada sobre un \"texto conocido\" de la Sagrada Escritura. Gracias también por el Adviento, todas las reflexiones y especialmente los comentarios explicativos. Gracias por su tiempo y esfuerzo.",
          rating: 5,
          platform: "Google Play"
        },
        {
          author: "Vladislav H.",
          text: "Textos para la meditación, varias traducciones en un solo lugar y reflexiones como inspiración. Para mí es un gran apoyo para crecer en la vida espiritual.",
          rating: 5,
          platform: "Google Play"
        }
      ]
    },
    users_id: "Usuarios",
    latest_news: "Artículos más recientes",
    show_article: "Ver artículo",
    show_all_news: "Ver todos los artículos",
    no_articles: "No se encontraron artículos.",
    previous_article: "Artículo anterior",
    next_article: "Siguiente artículo",
    lectio_admin_title: "Administración Lectio Divina",
    hlava: "Título",
    suradnice_pismo: "Referencia bíblica",
    datum: "Fecha",
    lectio:"Lectio divina",
    footer: {
      contact: "Contacto",
      legal_info: "Información Legal",
      links: "Enlaces",
      terms: "Términos y Condiciones",
      privacy: "Política de Privacidad - Aplicación Móvil",
      privacy_policy: "Política de Privacidad",
      manage_cookies: "Gestionar cookies",
      all_rights_reserved: "Todos los derechos reservados",
      created_by: "creado por",
      admin_tooltip: "Administración",
      follow_us: "Síguenos"
    },
    community_section: {
      headline: "Únete a Nuestra Comunidad",
      subtitle: "Forma parte de nuestra creciente comunidad de creyentes",
      description: "Buscamos entusiastas que nos ayuden a crear una mejor aplicación para la oración y el crecimiento espiritual. Ya sea que quieras probar, recibir noticias o compartir ideas, tenemos un lugar para ti.",
      tester_title: "Conviértete en Probador",
      tester_desc: "Ayúdanos a probar nuevas características y mejoras antes de su lanzamiento oficial. Tus comentarios son imprescincibles para el desarrollo de la aplicación.",
      newsletter_title: "Suscríbete al Newsletter",
      newsletter_desc: "Sé el primero en conocer nuevas características, artículos espirituales y actualizaciones importantes de la aplicación.",
      idea_title: "¿Tienes una Idea?",
      idea_desc: "Comparte tus ideas para mejoras de la aplicación, nuevas características o contenido que te ayudaría en el crecimiento espiritual.",
      form_name: "Tu Nombre",
      form_email: "Dirección de Email",
      form_message: "Mensaje o Idea",
      form_interests: "¿Qué te interesa?",
      interest_tester: "Quiero ayudar con las pruebas de la aplicación",
      interest_newsletter: "Quiero recibir el newsletter",
      interest_idea: "Tengo una idea de mejora",
      submit_btn: "Unirse a la Comunidad",
      success_message: "¡Gracias! Tu solicitud ha sido enviada exitosamente. Te contactaremos pronto.",
      error_message: "Ocurrió un error. Por favor verifica que hayas completado todos los campos obligatorios e intenta de nuevo.",
      required_field: "Campo obligatorio",
      loading_form: "Cargando formulario...",
      message_placeholder: "Tu mensaje o idea..."
    },
    community_admin_title: "Gestión de Miembros de la Comunidad",
    community_member_detail: "Detalle del Miembro de la Comunidad",
    community_stats: {
      total_members: "Total de Miembros",
      testers: "Probadores",
      newsletter_subscribers: "Newsletter",
      idea_contributors: "Ideas"
    },
    community_interests: {
      testing: "Pruebas",
      newsletter: "Newsletter", 
      ideas: "Ideas"
    },
    community_actions: {
      send_email: "Enviar Email",
      invite_testing: "Invitar a Pruebas",
      add_newsletter: "Agregar al Newsletter",
      edit_member: "Editar Miembro",
      delete_member: "Eliminar Miembro"
    },
    community_filters: {
      want_testing: "Quiere Probar",
      want_newsletter: "Quiere Newsletter",
      has_idea: "Tiene Idea",
      registration_date: "Fecha de Registro"
    },
    community_form: {
      basic_info: "Información Básica",
      interests_preferences: "Intereses y Preferencias",
      message_idea: "Mensaje o Idea",
      quick_actions: "Acciones Rápidas",
      wants_testing: "Quiere probar la aplicación",
      wants_newsletter: "Quiere recibir newsletter",
      has_improvement_idea: "Tiene idea de mejora",
      no_message: "No se proporcionó ningún mensaje",
      last_updated: "Última Actualización"
    },
    community: "Comunidad",
    dailyQuote: {
      loading: "Cargando la cita de hoy...",
      todayLabel: "CITA DE HOY",
      notFound: "La cita de hoy no fue encontrada",
      notFoundDescription: "Por favor, inténtelo más tarde o lea nuestras citas archivadas.",
      error: "Error al cargar la cita",
      no_quote_today: "No hay ninguna cita disponible para hoy.",
      check_back_tomorrow: "Por favor, vuelve mañana."
    },
    lectioStepsSection: {
      title: "Lectio Divina - Cinco Pasos",
      subtitle: "Descubre el viaje espiritual a través de cinco pasos de Lectio Divina - una antigua práctica cristiana de meditación"
    },

    lectio_steps_new: [
      {
        title: "Lectio - Lectura",
        desc: "Lectura atenta de la palabra de Dios con corazón y mente abiertos"
      },
      {
        title: "Meditatio - Meditación",
        desc: "Reflexión profunda sobre el texto y búsqueda del mensaje personal"
      },
      {
        title: "Oratio - Oración",
        desc: "Conversación con Dios sobre lo que descubriste en el texto"
      },
      {
        title: "Contemplatio - Contemplación",
        desc: "Descanso silencioso en la presencia y amor de Dios"
      },
      {
        title: "Actio - Acción",
        desc: "Transformación de la experiencia espiritual en actos concretos de amor"
      }
    ],
    newsDetail: {
      article_badge: "ARTÍCULO",
      reading_time: "min de lectura",
      published_on: "Publicado el"
    },
    homeNewsSection: {
      title: "Últimos Artículos",
      badge: "ÚLTIMAS NOTICIAS",
      subtitle: "Manténgase informado sobre los últimos eventos y temas espirituales",
      loading: "Cargando artículos para idioma:",
      error_title: "Error al cargar artículos",
      error_check: "Verifique la base de datos Supabase y los datos para el idioma",
      no_articles_title: "Aún no hay artículos",
      no_articles_desc: "No se encontraron artículos para el idioma \"{lang}\".",
      new_badge: "NUEVO",
      show_article: "Mostrar artículo",
      show_all_articles: "Mostrar todos los artículos"
    },
    newsListPage: {
      title: "Últimos Artículos",
      all_articles_badge: "TODOS LOS ARTÍCULOS",
      subtitle: "Lea los últimos artículos y reflexiones espirituales",
      search_placeholder: "Buscar artículos...",
      sort_by_date: "Por fecha",
      sort_by_likes: "Por popularidad",
      reading_time: "min de lectura",
      new_badge: "NUEVO",
      showing_results: "Mostrando {count} de {total} artículos",
      search_results_for: " para \"{searchTerm}\"",
      no_search_results_title: "Sin resultados",
      no_search_results_desc: "No se encontraron artículos para el término de búsqueda \"{searchTerm}\". Pruebe con diferentes palabras clave.",
      clear_search: "Limpiar búsqueda",
      no_articles_title: "Sin artículos",
      no_articles_desc: "No se encontraron artículos."
    },

    // Notes page translations
    notesPage: {
      title: "Mis Notas",
      notes_count: "nota",
      notes_count_plural: "notas",
      new_note: "Nueva Nota",
      search_placeholder: "Buscar notas...",
      loading: "Cargando notas...",
      loading_auth: "Cargando...",
      redirecting_login: "Redirigiendo al inicio de sesión...",
      empty_state: {
        title: "Aún no hay notas",
        subtitle: "Haz clic en 'Nueva Nota' y empieza a escribir tus pensamientos",
        button: "Crear primera nota"
      },
      empty_editor: {
        title: "Selecciona una nota",
        subtitle: "Haz clic en una nota de la lista izquierda o crea una nueva nota",
        button: "Crear nueva nota"
      },
      editor: {
        tabs: {
          list: "Lista",
          editor: "Editor"
        },
        modes: {
          new_title: "Nueva Nota",
          edit_title: "Editar Nota",
          empty_title: "Empezar a Escribir"
        },
        form: {
          title_label: "Título de la Nota *",
          title_placeholder: "Título de tu nota...",
          content_label: "Contenido de la Nota *",
          content_placeholder: "Empieza a escribir tus pensamientos...",
          bible_section_title: "Referencia Bíblica",
          bible_reference_label: "Referencia (ej. Juan 3:16)",
          bible_reference_placeholder: "Juan 3:16",
          bible_quote_label: "Cita Bíblica",
          bible_quote_placeholder: "Insertar texto de la Biblia..."
        },
        actions: {
          save: "Guardar Nota",
          saving: "Guardando...",
          cancel: "Cancelar",
          delete: "Eliminar Nota"
        },
        validation: {
          required_fields: "El título y contenido de la nota son obligatorios"
        },
        confirm: {
          close_unsaved: "Tiene una nota sin guardar. ¿Realmente quiere cerrar el editor?"
        }
      },
      metadata: {
        created: "Creado",
        updated: "Actualizado", 
        not_modified: "La nota no fue modificada"
      }
    }
  },
  
}

// Typ pre hodnotu translations (definovaný po vytvorení objektu)
export type Translations = typeof translations;