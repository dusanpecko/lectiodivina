// src/app/privacy/translations.ts

export type MobilePrivacyTranslations = {
  pageTitle: string;
  backToHome: string;
  validFrom: string;
  lastUpdated: string;
  downloadApp: string;
  cookiesQuestion: string;
  termsConditions: string;
  footerQuestion: string;
  contactUs: string;
  exampleToken: string;
  
  sections: {
    intro: {
      title: string;
      content: {
        description: string;
        purpose: string;
        commitment: string;
      };
    };
    
    tokenData: {
      title: string;
      content: {
        description: string;
        example: string;
        nature: string;
        generator: string;
        approach: string;
        security: string;
        request: string;
      };
    };
    
    personalData: {
      title: string;
      content: {
        intro: string;
        dataTypes: {
          title: string;
          items: string[];
        };
        purpose: string;
        additionalData: {
          title: string;
          location: {
            title: string;
            purpose: string;
          };
          photos: {
            title: string;
            purpose: string;
          };
          appInfo: {
            title: string;
            purpose: string;
          };
          identifiers: {
            title: string;
            purpose: string;
          };
        };
      };
    };
    
    cookies: {
      title: string;
      content: {
        definition: string;
        purpose: string;
        types: string;
        information: string;
        advertising: string;
        settings: string;
        analytics: {
          intro: string;
          description: string;
          anonymity: string;
          settings: string;
          consent: string;
        };
        directive: string;
        appNote: string;
      };
    };
    
    terms: {
      title: string;
      content: {
        intro: string;
        software: {
          title: string;
          ownership: string;
          license: string;
          restrictions: string;
          violations: string;
          liability: string;
        };
        documents: {
          title: string;
          intro: string;
          conditions: string[];
          restrictions: string;
          violations: string;
          designProtection: string;
        };
        disclaimer: {
          title: string;
          warranty: string;
          liability: string;
          accuracy: string;
          changes: string;
        };
      };
    };
  };
  
  footer: {
    copyright: string;
    company: string;
  };
};

export const mobilePrivacyTranslations: Record<string, MobilePrivacyTranslations> = {
  sk: {
    pageTitle: "Ochrana osobných údajov - Mobilná aplikácia",
    backToHome: "Späť na hlavnú stránku",
    validFrom: "Platné od:",
    lastUpdated: "Posledná aktualizácia: November 2024",
    downloadApp: "Stiahnuť aplikáciu:",
    cookiesQuestion: "Čo sú Cookies?",
    termsConditions: "Podmienky použitia:",
    footerQuestion: "Máte otázky ohľadom ochrany osobných údajov v našej mobilnej aplikácii?",
    contactUs: "Kontaktujte nás",
    exampleToken: "Príklad registration token:",
    
    sections: {
      intro: {
        title: "Ochrana osobných údajov v mobilnej aplikácii Lectio Divina",
        content: {
          description: "Táto mobilná aplikácia Lectio Divina je primárne určená na zasielanie Push notifikácií s duchovnými obsahmi a čítaniami.",
          purpose: "Aplikácia slúži na poskytovanie každodenných duchovných čítaní, meditácií a modlitieb podľa tradície Lectio Divina.",
          commitment: "K spracúvaniu Vašich osobných údajov pristupujeme len zákonným spôsobom, profesionálne a citlivo. Vaše osobné údaje sú uložené v zabezpečenom informačnom systéme."
        }
      },
      
      tokenData: {
        title: "Registration Token",
        content: {
          description: "Informácia ktorú aplikácia získava, prenáša na náš server, a ktorú ukladáme je tzv. registration id/token (ďalej len token) a ktorý slúži na zaslanie Push notifikácie na Vaše zariadenie.",
          example: "Príklad token-u: APE67jH0MjbpdsXtn4OzYpLKCvvNl_uZ-26kU1f-P10pumLO0vp91X_cHnPcZ_WwTcCJYsDrJiwXLtJhar-xPuptCqx0TPwW_VRr_3Jf00sdUdnyneRQhTA1DDRfNg5t0Ra7KE1diuNs",
          nature: "Tento token nie je osobný údaj, nakoľko tento token nie je pre nás možné spojiť s Vašou osobou.",
          generator: "Tento token je generovaný Google službou.",
          approach: "K spracúvaniu Vašich osobných údajov pristupujeme len zákonným spôsobom, profesionálne a citlivo.",
          security: "Vaše osobné údaje sú uložené v zabezpečenom informačnom systéme. Získavame od Vás iba tie údaje, ktoré sú potrebné na splnenie účelu, na základe ktorého ste nás kontaktovali.",
          request: "Môžete nás kedykoľvek požiadať o zmazanie vašich osobných údajov a to e-mailom alebo písomne."
        }
      },
      
      personalData: {
        title: "Spracúvanie osobných údajov",
        content: {
          intro: "Aplikácia môže spracovávať po súhlase osobné informácie:",
          dataTypes: {
            title: "Základné osobné údaje:",
            items: [
              "Vaše meno a priezvisko",
              "Váš email",
              "Vaše tel. č.",
              "Adresu bydliska (ulicu)"
            ]
          },
          purpose: "Tieto osobné údaje sú potrebné pre spätné kontaktovanie vašej osoby pre promptné vyriešenie vášho podnetu.",
          additionalData: {
            title: "Aplikácia môže ďalej spracovávať:",
            location: {
              title: "Presnú polohu",
              purpose: "Polohu používame pre zabezpečenie správnosti a použiteľnosti fungovania modulov, napríklad pre zaznamenanie polohy pri vytváraní podnetu."
            },
            photos: {
              title: "Fotografie",
              purpose: "Fotografie používame pre spracovanie podnetu od používateľa."
            },
            appInfo: {
              title: "Informácie o aplikácii a výkone",
              purpose: "Tieto informácie používame pre diagnostiku porúch aplikácie a vyhodnocovanie štatistík používanosti aplikácie."
            },
            identifiers: {
              title: "Ostatné identifikátory",
              purpose: "Tieto informácie používame pre správne doručovanie PUSH notifikácií."
            }
          }
        }
      },
      
      cookies: {
        title: "Cookies",
        content: {
          definition: "Cookies sú malé súbory, ktoré sa sťahujú do zariadenia (počítač, tablet, mobilný telefón atď.) klienta počas používania webovej stránky.",
          purpose: "Prevádzkovateľ pomocou Cookies skúma účinnosť webovej stránky. Cookies vo všeobecnosti nemajú žiadne informácie slúžiace na identifikáciu jednotlivých osôb, ale namiesto toho sa používajú na identifikáciu prehliadača na konkrétnom zariadení.",
          types: "Cookies môžu byť dočasné alebo trvalé, ktoré zostanú v zariadení užívateľa aj po zatvorení prehliadača po dobu uvedenú v Cookie.",
          information: "Informácie, ktoré zhromažďujeme prostredníctvom webovej stránky, zahŕňajú: typ prehliadača, internetovú adresu, z ktorej si sa pripojil na internetovú stránku, operačný systém zariadenia, IP adresa zariadenia.",
          advertising: "Pre zobrazovanie relevantných reklám sú niektoré Cookies stanovené reklamným systémom tretích strán, ako je Google Adsense. Toto je možné vypnúť vo vašom účte Google.",
          settings: "Počítač je možné nastaviť tak, aby Cookies odmietal, aj keď v takom prípade je možné, že niektoré funkcie stránky nebudú funkčné.",
          analytics: {
            intro: "Prevádzkovateľ informuje Klientov, že prostredníctvom svojej webovej stránky využíva Google Analytics (analýza webu) s funkciou User ID, ktorú poskytuje spoločnosť Google Inc. ktorá analyzuje klientovo používanie webovej stránky.",
            description: "Google Analytics využíva na analýzu klientovho používania stránky súbory Cookies. Cookies sú textové súbory, ktoré sa ukladajú do klientovho počítača.",
            anonymity: "Všetky informácie získané prostredníctvom vyššie uvedenej aplikácie sú anonymné bez zobrazenie plnej formy IP adresy klientov.",
            settings: "Ukladanie súborov Cookies môže klient taktiež v nastaveniach webového prehliadača zakázať.",
            consent: "Užívateľ používaním webovej stránky a využívaním služieb súhlasí s používaním Google Analytics s funkciou User ID."
          },
          directive: "Prevádzkovateľ v zmysle Smernice Európskeho parlamentu a Rady 2002/58/ES o súkromí a elektronických komunikáciách informuje užívateľov, že prostredníctvom webovej stránky využíva súbory Cookies. Klient používaním webovej stránky súhlasí s používaním cookies, no taktiež môže Cookies zablokovať alebo aj vymazávať, čo však v niektorých prípadoch môže zabrániť k využívaniu plného potenciálu stránky.",
          appNote: "V našej mobilnej aplikácii Lectio Divina nepoužívame cookies."
        }
      },
      
      terms: {
        title: "Všeobecné podmienky",
        content: {
          intro: "Tento dokument obsahuje právne informácie vzťahujúce sa na mobilnú aplikáciu Lectio Divina a súvisiacu webovú stránku.",
          software: {
            title: "Softvér",
            ownership: "Spoločnosť KROK – Pastoračný fond Žilinskej diecézy a/alebo jej dodávatelia vlastnia alebo vykonávajú autorské práva k softvéru aplikácie Lectio Divina.",
            license: "Softvér možno používať iba v súlade s licenčnou zmluvou koncového používateľa. Softvér sa poskytuje výlučne pre koncových používateľov na používanie, ktoré je v súlade s Licenčnou zmluvou.",
            restrictions: "Výslovne zakazujeme akékoľvek reprodukovanie Softvéru a/alebo jeho šírenie, ktoré nie je v súlade s Licenčnou zmluvou. Zakazujeme umiestňovanie Softvéru alebo kópií Softvéru na iné webové stránky alebo akékoľvek iné nosiče údajov.",
            violations: "Každý, kto poruší Licenčnú zmluvu, sa vystavuje riziku trestnoprávneho postihu a riziku občianskoprávneho sporu.",
            liability: "Ak nie je uvedené v Licenčnej zmluve inak, softvér poskytujeme 'tak, ako je' a neposkytujeme naň nijaké záruky, vrátane záruky vhodnosti na konkrétny účel a záruky neporušenia cudzích práv."
          },
          documents: {
            title: "Dokumenty a obsah",
            intro: "Povoľujeme použitie dokumentov a obsahu z aplikácie a webovej stránky, pokiaľ budú dodržané nasledujúce podmienky:",
            conditions: [
              "použitie dokumentu nie je výslovne zakázané",
              "dokument nebude použitý na účel, ktorý je priamo alebo nepriamo komerčný",
              "dokumenty budú použité výlučne na informačné účely pre osobnú potrebu a nebudú nijakým spôsobom kopírované ani ďalej šírené",
              "dokument nebude žiadnym spôsobom upravovaný",
              "dokument a každá jeho kópia bude obsahovať údaje o nositeľovi autorských práv",
              "bude uvedený zdroj, z ktorého bol dokument získaný"
            ],
            restrictions: "Použitie dokumentov na akýkoľvek iný účel je výslovne zakázané. Takéto konanie je protizákonné.",
            violations: "Každý, kto neoprávnene použije dokumenty, sa vystavuje riziku trestnoprávneho postihu a riziku občianskoprávneho sporu.",
            designProtection: "Usporiadanie a úprava aplikácie ako aj webových stránok je chránená príslušnými predpismi a zákonmi o autorských právach, predpismi a zákonmi o ochranných alebo obchodných známkach."
          },
          disclaimer: {
            title: "Vyhlásenie o zodpovednosti",
            warranty: "Neposkytujeme žiadne vyhlásenia o vhodnosti informácií obsiahnutých v aplikácii alebo na webových stránkach na akýkoľvek účel. Všetky dokumenty, informácie a grafické prvky sú poskytované bez akejkoľvek záruky, v stave 'tak, ako sú'.",
            liability: "V maximálnom možnom rozsahu nezodpovedáme za škodu alebo inú ujmu, ktoré vznikli tretím stranám z použitia informácií v aplikácii alebo na webových stránkach.",
            accuracy: "Informácie publikované v aplikácii alebo na webových stránkach môžu obsahovať technické nepresnosti a/alebo typografické chyby.",
            changes: "Môžeme kedykoľvek bez predchádzajúceho upozornenia vylepšiť alebo zmeniť tu popisované produkty a/alebo služby a/alebo programy. Informácie sa preto z času na čas menia."
          }
        }
      }
    },
    
    footer: {
      copyright: "Copyright © 2024 KROK – Pastoračný fond Žilinskej diecézy",
      company: "Všetky práva vyhradené."
    }
  },

  en: {
    pageTitle: "Privacy Policy - Mobile Application",
    backToHome: "Back to homepage",
    validFrom: "Valid from:",
    lastUpdated: "Last updated: November 2024",
    downloadApp: "Download app:",
    cookiesQuestion: "What are Cookies?",
    termsConditions: "Terms of Use:",
    footerQuestion: "Do you have questions regarding privacy in our mobile application?",
    contactUs: "Contact us",
    exampleToken: "Example registration token:",
    
    sections: {
      intro: {
        title: "Privacy Policy for Lectio Divina Mobile Application",
        content: {
          description: "This Lectio Divina mobile application is primarily designed to send Push notifications with spiritual content and readings.",
          purpose: "The application serves to provide daily spiritual readings, meditations and prayers according to the Lectio Divina tradition.",
          commitment: "We approach the processing of your personal data only in a legal manner, professionally and sensitively. Your personal data is stored in a secure information system."
        }
      },
      
      tokenData: {
        title: "Registration Token",
        content: {
          description: "The information that the application obtains, transmits to our server, and which we store is the so-called registration id/token (hereinafter just token) and which serves to send Push notifications to your device.",
          example: "Example token: APE67jH0MjbpdsXtn4OzYpLKCvvNl_uZ-26kU1f-P10pumLO0vp91X_cHnPcZ_WwTcCJYsDrJiwXLtJhar-xPuptCqx0TPwW_VRr_3Jf00sdUdnyneRQhTA1DDRfNg5t0Ra7KE1diuNs",
          nature: "This token is not personal data, as this token cannot be linked to your person by us.",
          generator: "This token is generated by Google service.",
          approach: "We approach the processing of your personal data only in a legal manner, professionally and sensitively.",
          security: "Your personal data is stored in a secure information system. We obtain from you only the data that is necessary to fulfill the purpose for which you contacted us.",
          request: "You can request deletion of your personal data at any time by email or in writing."
        }
      },
      
      personalData: {
        title: "Personal Data Processing",
        content: {
          intro: "The application may process personal information with consent:",
          dataTypes: {
            title: "Basic personal data:",
            items: [
              "Your name and surname",
              "Your email",
              "Your phone number",
              "Your address (street)"
            ]
          },
          purpose: "This personal data is necessary for contacting you back for prompt resolution of your inquiry.",
          additionalData: {
            title: "The application may further process:",
            location: {
              title: "Precise location",
              purpose: "We use location to ensure correctness and usability of module functions, for example to record location when creating an inquiry."
            },
            photos: {
              title: "Photos",
              purpose: "We use photos to process inquiries from users."
            },
            appInfo: {
              title: "Application and performance information",
              purpose: "We use this information for application failure diagnostics and evaluation of usage statistics."
            },
            identifiers: {
              title: "Other identifiers",
              purpose: "We use this information for proper delivery of PUSH notifications."
            }
          }
        }
      },
      
      cookies: {
        title: "Cookies",
        content: {
          definition: "Cookies are small files that are downloaded to a client's device (computer, tablet, mobile phone, etc.) while using a website.",
          purpose: "The operator uses Cookies to examine the effectiveness of the website. Cookies generally do not have any information to identify individuals, but instead are used to identify the browser on a specific device.",
          types: "Cookies can be temporary or persistent, which remain on the user's device even after closing the browser for the period specified in the Cookie.",
          information: "Information we collect through the website includes: browser type, internet address from which you connected to the website, device operating system, device IP address.",
          advertising: "For displaying relevant ads, some Cookies are set by third-party advertising systems, such as Google Adsense. This can be disabled in your Google account.",
          settings: "The computer can be set to reject Cookies, although in that case it is possible that some website functions will not be functional.",
          analytics: {
            intro: "The operator informs Clients that through its website it uses Google Analytics (web analysis) with User ID function, provided by Google Inc. which analyzes the client's use of the website.",
            description: "Google Analytics uses Cookies files to analyze the client's use of the page. Cookies are text files that are stored on the client's computer.",
            anonymity: "All information obtained through the above application is anonymous without displaying the full form of clients' IP addresses.",
            settings: "The client can also disable the storage of Cookies files in the web browser settings.",
            consent: "By using the website and using the services, the user agrees to the use of Google Analytics with User ID function."
          },
          directive: "The operator, in accordance with Directive 2002/58/EC of the European Parliament and of the Council on privacy and electronic communications, informs users that it uses Cookies through the website. By using the website, the client agrees to the use of cookies, but can also block or delete Cookies, which in some cases may prevent the use of the full potential of the page.",
          appNote: "We do not use cookies in our Lectio Divina mobile application."
        }
      },
      
      terms: {
        title: "General Terms",
        content: {
          intro: "This document contains legal information relating to the Lectio Divina mobile application and related website.",
          software: {
            title: "Software",
            ownership: "KROK – Pastoral Fund of the Diocese of Žilina and/or its suppliers own or exercise copyrights to the Lectio Divina application software.",
            license: "The software may only be used in accordance with the end user license agreement. The software is provided exclusively for end users for use that is in accordance with the License Agreement.",
            restrictions: "We expressly prohibit any reproduction of the Software and/or its distribution that is not in accordance with the License Agreement. We prohibit placing the Software or copies of the Software on other websites or any other data carriers.",
            violations: "Anyone who violates the License Agreement is exposed to the risk of criminal prosecution and the risk of civil litigation.",
            liability: "Unless otherwise stated in the License Agreement, we provide the software 'as is' and provide no warranties on it, including warranty of fitness for a particular purpose and warranty of non-infringement of third party rights."
          },
          documents: {
            title: "Documents and Content",
            intro: "We allow the use of documents and content from the application and website, provided the following conditions are met:",
            conditions: [
              "use of the document is not expressly prohibited",
              "the document will not be used for a purpose that is directly or indirectly commercial",
              "documents will be used exclusively for informational purposes for personal needs and will not be copied or further distributed in any way",
              "the document will not be modified in any way",
              "the document and each copy will contain information about the copyright holder",
              "the source from which the document was obtained will be indicated"
            ],
            restrictions: "Use of documents for any other purpose is expressly prohibited. Such conduct is illegal.",
            violations: "Anyone who unlawfully uses documents is exposed to the risk of criminal prosecution and the risk of civil litigation.",
            designProtection: "The arrangement and modification of the application as well as websites is protected by relevant regulations and laws on copyright, regulations and laws on protective or trademarks."
          },
          disclaimer: {
            title: "Disclaimer",
            warranty: "We make no representations about the suitability of information contained in the application or on websites for any purpose. All documents, information and graphic elements are provided without any warranty, in 'as is' condition.",
            liability: "To the maximum extent possible, we are not liable for damage or other harm that arose to third parties from the use of information in the application or on websites.",
            accuracy: "Information published in the application or on websites may contain technical inaccuracies and/or typographical errors.",
            changes: "We may at any time without prior notice improve or change the products and/or services and/or programs described herein. Information therefore changes from time to time."
          }
        }
      }
    },
    
    footer: {
      copyright: "Copyright © 2024 KROK – Pastoral Fund of the Diocese of Žilina",
      company: "All rights reserved."
    }
  },

  cz: {
    pageTitle: "Ochrana osobních údajů - Mobilní aplikace",
    backToHome: "Zpět na hlavní stránku",
    validFrom: "Platné od:",
    lastUpdated: "Poslední aktualizace: Listopad 2024",
    downloadApp: "Stáhnout aplikaci:",
    cookiesQuestion: "Co jsou Cookies?",
    termsConditions: "Podmínky použití:",
    footerQuestion: "Máte otázky ohledně ochrany osobních údajů v naší mobilní aplikaci?",
    contactUs: "Kontaktujte nás",
    exampleToken: "Příklad registration token:",
    
    sections: {
      intro: {
        title: "Ochrana osobních údajů v mobilní aplikaci Lectio Divina",
        content: {
          description: "Tato mobilní aplikace Lectio Divina je primárně určena k zasílání Push notifikací s duchovními obsahy a čteními.",
          purpose: "Aplikace slouží k poskytování každodenních duchovních čtení, meditací a modliteb podle tradice Lectio Divina.",
          commitment: "Ke zpracování vašich osobních údajů přistupujeme pouze zákonným způsobem, profesionálně a citlivě. Vaše osobní údaje jsou uloženy v zabezpečeném informačním systému."
        }
      },
      
      tokenData: {
        title: "Registration Token",
        content: {
          description: "Informace kterou aplikace získává, přenáší na náš server, a kterou ukládáme je tzv. registration id/token (dále jen token) a který slouží k zaslání Push notifikace na vaše zařízení.",
          example: "Příklad token-u: APE67jH0MjbpdsXtn4OzYpLKCvvNl_uZ-26kU1f-P10pumLO0vp91X_cHnPcZ_WwTcCJYsDrJiwXLtJhar-xPuptCqx0TPwW_VRr_3Jf00sdUdnyneRQhTA1DDRfNg5t0Ra7KE1diuNs",
          nature: "Tento token není osobní údaj, neboť tento token není pro nás možné spojit s vaší osobou.",
          generator: "Tento token je generován Google službou.",
          approach: "Ke zpracování vašich osobních údajů přistupujeme pouze zákonným způsobem, profesionálně a citlivě.",
          security: "Vaše osobní údaje jsou uloženy v zabezpečeném informačním systému. Získáváme od vás pouze ty údaje, které jsou potřebné k splnění účelu, na základě kterého jste nás kontaktovali.",
          request: "Můžete nás kdykoliv požádat o smazání vašich osobních údajů a to e-mailem nebo písemně."
        }
      },
      
      personalData: {
        title: "Zpracování osobních údajů",
        content: {
          intro: "Aplikace může zpracovávat po souhlasu osobní informace:",
          dataTypes: {
            title: "Základní osobní údaje:",
            items: [
              "Vaše jméno a příjmení",
              "Váš email",
              "Vaše tel. č.",
              "Adresu bydliště (ulici)"
            ]
          },
          purpose: "Tyto osobní údaje jsou potřebné pro zpětné kontaktování vaší osoby pro promptní vyřešení vašeho podnětu.",
          additionalData: {
            title: "Aplikace může dále zpracovávat:",
            location: {
              title: "Přesnou polohu",
              purpose: "Polohu používáme pro zabezpečení správnosti a použitelnosti fungování modulů, například pro zaznamenání polohy při vytváření podnětu."
            },
            photos: {
              title: "Fotografie",
              purpose: "Fotografie používáme pro zpracování podnětu od uživatele."
            },
            appInfo: {
              title: "Informace o aplikaci a výkonu",
              purpose: "Tyto informace používáme pro diagnostiku poruch aplikace a vyhodnocování statistik používanosti aplikace."
            },
            identifiers: {
              title: "Ostatní identifikátory",
              purpose: "Tyto informace používáme pro správné doručování PUSH notifikací."
            }
          }
        }
      },
      
      cookies: {
        title: "Cookies",
        content: {
          definition: "Cookies jsou malé soubory, které se stahují do zařízení (počítač, tablet, mobilní telefon atd.) klienta během používání webové stránky.",
          purpose: "Provozovatel pomocí Cookies zkoumá účinnost webové stránky. Cookies obecně nemají žádné informace sloužící k identifikaci jednotlivých osob, ale místo toho se používají k identifikaci prohlížeče na konkrétním zařízení.",
          types: "Cookies mohou být dočasné nebo trvalé, které zůstávají v zařízení uživatele i po zavření prohlížeče po dobu uvedenou v Cookie.",
          information: "Informace, které shromažďujeme prostřednictvím webové stránky, zahrnují: typ prohlížeče, internetovou adresu, ze které jste se připojili na internetovou stránku, operační systém zařízení, IP adresa zařízení.",
          advertising: "Pro zobrazování relevantních reklam jsou některé Cookies stanovené reklamním systémem třetích stran, jako je Google Adsense. Toto je možné vypnout ve vašem účtu Google.",
          settings: "Počítač je možné nastavit tak, aby Cookies odmítal, i když v takovém případě je možné, že některé funkce stránky nebudou funkční.",
          analytics: {
            intro: "Provozovatel informuje Klienty, že prostřednictvím své webové stránky využívá Google Analytics (analýza webu) s funkcí User ID, kterou poskytuje společnost Google Inc. která analyzuje klientovo používání webové stránky.",
            description: "Google Analytics využívá k analýze klientova používání stránky soubory Cookies. Cookies jsou textové soubory, které se ukládají do klientova počítače.",
            anonymity: "Všechny informace získané prostřednictvím výše uvedené aplikace jsou anonymní bez zobrazení plné formy IP adres klientů.",
            settings: "Ukládání souborů Cookies může klient také v nastavení webového prohlížeče zakázat.",
            consent: "Uživatel používáním webové stránky a využíváním služeb souhlasí s používáním Google Analytics s funkcí User ID."
          },
          directive: "Provozovatel ve smyslu Směrnice Evropského parlamentu a Rady 2002/58/ES o soukromí a elektronických komunikacích informuje uživatele, že prostřednictvím webové stránky využívá soubory Cookies. Klient používáním webové stránky souhlasí s používáním cookies, ale také může Cookies blokovat nebo i vymazávat, což však v některých případech může zabránit k využívání plného potenciálu stránky.",
          appNote: "V naší mobilní aplikaci Lectio Divina nepoužíváme cookies."
        }
      },
      
      terms: {
        title: "Všeobecné podmínky",
        content: {
          intro: "Tento dokument obsahuje právní informace vztahující se na mobilní aplikaci Lectio Divina a související webovou stránku.",
          software: {
            title: "Software",
            ownership: "Společnost KROK – Pastorační fond Žilinské diecéze a/nebo její dodavatelé vlastní nebo vykonávají autorská práva k softwaru aplikace Lectio Divina.",
            license: "Software lze používat pouze v souladu s licenční smlouvou koncového uživatele. Software se poskytuje výhradně pro koncové uživatele k používání, které je v souladu s Licenční smlouvou.",
            restrictions: "Výslovně zakazujeme jakékoliv reprodukování Softwaru a/nebo jeho šíření, které není v souladu s Licenční smlouvou. Zakazujeme umístění Softwaru nebo kopií Softwaru na jiné webové stránky nebo jakékoliv jiné nosiče údajů.",
            violations: "Každý, kdo poruší Licenční smlouvu, se vystavuje riziku trestněprávního postihu a riziku občanskoprávního sporu.",
            liability: "Pokud není uvedeno v Licenční smlouvě jinak, software poskytujeme 'tak, jak je' a neposkytujeme na něj žádné záruky, včetně záruky vhodnosti na konkrétní účel a záruky neporušení cizích práv."
          },
          documents: {
            title: "Dokumenty a obsah",
            intro: "Povolujeme použití dokumentů a obsahu z aplikace a webové stránky, pokud budou dodrženy následující podmínky:",
            conditions: [
              "použití dokumentu není výslovně zakázáno",
              "dokument nebude použit na účel, který je přímo nebo nepřímo komerční",
              "dokumenty budou použity výhradně na informační účely pro osobní potřebu a nebudou žádným způsobem kopírovány ani dále šířeny",
              "dokument nebude žádným způsobem upravován",
              "dokument a každá jeho kopie bude obsahovat údaje o nositeli autorských práv",
              "bude uveden zdroj, ze kterého byl dokument získán"
            ],
            restrictions: "Použití dokumentů na jakýkoliv jiný účel je výslovně zakázáno. Takové jednání je protizákonné.",
            violations: "Každý, kdo neoprávněně použije dokumenty, se vystavuje riziku trestněprávního postihu a riziku občanskoprávního sporu.",
            designProtection: "Uspořádání a úprava aplikace i webových stránek je chráněna příslušnými předpisy a zákony o autorských právech, předpisy a zákony o ochranných nebo obchodních známkách."
          },
          disclaimer: {
            title: "Prohlášení o odpovědnosti",
            warranty: "Neposkytujeme žádná prohlášení o vhodnosti informací obsažených v aplikaci nebo na webových stránkách na jakýkoliv účel. Všechny dokumenty, informace a grafické prvky jsou poskytovány bez jakékoliv záruky, ve stavu 'tak, jak jsou'.",
            liability: "V maximálním možném rozsahu neneseme odpovědnost za škodu nebo jinou újmu, které vznikly třetím stranám z použití informací v aplikaci nebo na webových stránkách.",
            accuracy: "Informace publikované v aplikaci nebo na webových stránkách mohou obsahovat technické nepřesnosti a/nebo typografické chyby.",
            changes: "Můžeme kdykoliv bez předchozího upozornění vylepšit nebo změnit zde popisované produkty a/nebo služby a/nebo programy. Informace se proto z času na čas mění."
          }
        }
      }
    },
    
    footer: {
      copyright: "Copyright © 2024 KROK – Pastorační fond Žilinské diecéze",
      company: "Všechna práva vyhrazena."
    }
  },

  es: {
    pageTitle: "Política de Privacidad - Aplicación Móvil",
    backToHome: "Volver a la página principal",
    validFrom: "Válido desde:",
    lastUpdated: "Última actualización: Noviembre 2024",
    downloadApp: "Descargar aplicación:",
    cookiesQuestion: "¿Qué son las Cookies?",
    termsConditions: "Condiciones de uso:",
    footerQuestion: "¿Tiene preguntas sobre la privacidad en nuestra aplicación móvil?",
    contactUs: "Contáctanos",
    exampleToken: "Ejemplo de registration token:",
    
    sections: {
      intro: {
        title: "Política de Privacidad para la Aplicación Móvil Lectio Divina",
        content: {
          description: "Esta aplicación móvil Lectio Divina está diseñada principalmente para enviar notificaciones Push con contenido espiritual y lecturas.",
          purpose: "La aplicación sirve para proporcionar lecturas espirituales diarias, meditaciones y oraciones según la tradición de Lectio Divina.",
          commitment: "Abordamos el procesamiento de sus datos personales solo de manera legal, profesional y sensible. Sus datos personales se almacenan en un sistema de información seguro."
        }
      },
      
      tokenData: {
        title: "Token de Registro",
        content: {
          description: "La información que obtiene la aplicación, transmite a nuestro servidor y que almacenamos es el llamado registration id/token (en adelante solo token) y que sirve para enviar notificaciones Push a su dispositivo.",
          example: "Ejemplo de token: APE67jH0MjbpdsXtn4OzYpLKCvvNl_uZ-26kU1f-P10pumLO0vp91X_cHnPcZ_WwTcCJYsDrJiwXLtJhar-xPuptCqx0TPwW_VRr_3Jf00sdUdnyneRQhTA1DDRfNg5t0Ra7KE1diuNs",
          nature: "Este token no es un dato personal, ya que este token no puede ser vinculado a su persona por nosotros.",
          generator: "Este token es generado por el servicio de Google.",
          approach: "Abordamos el procesamiento de sus datos personales solo de manera legal, profesional y sensible.",
          security: "Sus datos personales se almacenan en un sistema de información seguro. Obtenemos de usted solo los datos que son necesarios para cumplir el propósito por el cual nos contactó.",
          request: "Puede solicitar la eliminación de sus datos personales en cualquier momento por correo electrónico o por escrito."
        }
      },
      
      personalData: {
        title: "Procesamiento de Datos Personales",
        content: {
          intro: "La aplicación puede procesar información personal con consentimiento:",
          dataTypes: {
            title: "Datos personales básicos:",
            items: [
              "Su nombre y apellido",
              "Su correo electrónico",
              "Su número de teléfono",
              "Su dirección (calle)"
            ]
          },
          purpose: "Estos datos personales son necesarios para contactarlo de vuelta para la resolución rápida de su consulta.",
          additionalData: {
            title: "La aplicación puede procesar además:",
            location: {
              title: "Ubicación precisa",
              purpose: "Usamos la ubicación para asegurar la corrección y usabilidad de las funciones del módulo, por ejemplo para registrar la ubicación al crear una consulta."
            },
            photos: {
              title: "Fotografías",
              purpose: "Usamos fotografías para procesar consultas de usuarios."
            },
            appInfo: {
              title: "Información de aplicación y rendimiento",
              purpose: "Usamos esta información para diagnósticos de fallas de aplicación y evaluación de estadísticas de uso."
            },
            identifiers: {
              title: "Otros identificadores",
              purpose: "Usamos esta información para la entrega adecuada de notificaciones PUSH."
            }
          }
        }
      },
      
      cookies: {
        title: "Cookies",
        content: {
          definition: "Las cookies son archivos pequeños que se descargan al dispositivo del cliente (computadora, tablet, teléfono móvil, etc.) mientras usa un sitio web.",
          purpose: "El operador usa Cookies para examinar la efectividad del sitio web. Las cookies generalmente no tienen información para identificar individuos, sino que se usan para identificar el navegador en un dispositivo específico.",
          types: "Las cookies pueden ser temporales o persistentes, que permanecen en el dispositivo del usuario incluso después de cerrar el navegador por el período especificado en la Cookie.",
          information: "La información que recopilamos a través del sitio web incluye: tipo de navegador, dirección de internet desde la cual se conectó al sitio web, sistema operativo del dispositivo, dirección IP del dispositivo.",
          advertising: "Para mostrar anuncios relevantes, algunas Cookies son establecidas por sistemas publicitarios de terceros, como Google Adsense. Esto puede deshabilitarse en su cuenta de Google.",
          settings: "La computadora puede configurarse para rechazar Cookies, aunque en ese caso es posible que algunas funciones del sitio web no sean funcionales.",
          analytics: {
            intro: "El operador informa a los Clientes que a través de su sitio web utiliza Google Analytics (análisis web) con función User ID, proporcionado por Google Inc. que analiza el uso del sitio web por parte del cliente.",
            description: "Google Analytics utiliza archivos Cookies para analizar el uso de la página por parte del cliente. Las cookies son archivos de texto que se almacenan en la computadora del cliente.",
            anonymity: "Toda la información obtenida a través de la aplicación mencionada es anónima sin mostrar la forma completa de las direcciones IP de los clientes.",
            settings: "El cliente también puede deshabilitar el almacenamiento de archivos Cookies en la configuración del navegador web.",
            consent: "Al usar el sitio web y usar los servicios, el usuario acepta el uso de Google Analytics con función User ID."
          },
          directive: "El operador, de acuerdo con la Directiva 2002/58/CE del Parlamento Europeo y del Consejo sobre privacidad y comunicaciones electrónicas, informa a los usuarios que utiliza Cookies a través del sitio web. Al usar el sitio web, el cliente acepta el uso de cookies, pero también puede bloquear o eliminar Cookies, lo que en algunos casos puede prevenir el uso del potencial completo de la página.",
          appNote: "No usamos cookies en nuestra aplicación móvil Lectio Divina."
        }
      },
      
      terms: {
        title: "Términos Generales",
        content: {
          intro: "Este documento contiene información legal relacionada con la aplicación móvil Lectio Divina y el sitio web relacionado.",
          software: {
            title: "Software",
            ownership: "KROK – Fondo Pastoral de la Diócesis de Žilina y/o sus proveedores poseen o ejercen derechos de autor sobre el software de la aplicación Lectio Divina.",
            license: "El software solo puede usarse de acuerdo con el acuerdo de licencia de usuario final. El software se proporciona exclusivamente para usuarios finales para uso que esté de acuerdo con el Acuerdo de Licencia.",
            restrictions: "Prohibimos expresamente cualquier reproducción del Software y/o su distribución que no esté de acuerdo con el Acuerdo de Licencia. Prohibimos colocar el Software o copias del Software en otros sitios web o cualquier otro portador de datos.",
            violations: "Cualquiera que viole el Acuerdo de Licencia está expuesto al riesgo de enjuiciamiento penal y al riesgo de litigio civil.",
            liability: "A menos que se establezca lo contrario en el Acuerdo de Licencia, proporcionamos el software 'tal como está' y no proporcionamos garantías sobre él, incluyendo garantía de idoneidad para un propósito particular y garantía de no infracción de derechos de terceros."
          },
          documents: {
            title: "Documentos y Contenido",
            intro: "Permitimos el uso de documentos y contenido de la aplicación y sitio web, siempre que se cumplan las siguientes condiciones:",
            conditions: [
              "el uso del documento no está expresamente prohibido",
              "el documento no será usado para un propósito que sea directa o indirectamente comercial",
              "los documentos serán usados exclusivamente para propósitos informativos para necesidades personales y no serán copiados o distribuidos de ninguna manera",
              "el documento no será modificado de ninguna manera",
              "el documento y cada copia contendrá información sobre el titular de los derechos de autor",
              "se indicará la fuente de donde se obtuvo el documento"
            ],
            restrictions: "El uso de documentos para cualquier otro propósito está expresamente prohibido. Tal conducta es ilegal.",
            violations: "Cualquiera que use documentos ilegalmente está expuesto al riesgo de enjuiciamiento penal y al riesgo de litigio civil.",
            designProtection: "La disposición y modificación de la aplicación así como los sitios web está protegida por regulaciones y leyes relevantes sobre derechos de autor, regulaciones y leyes sobre marcas protectoras o comerciales."
          },
          disclaimer: {
            title: "Descargo de Responsabilidad",
            warranty: "No hacemos representaciones sobre la idoneidad de la información contenida en la aplicación o en los sitios web para cualquier propósito. Todos los documentos, información y elementos gráficos se proporcionan sin garantía, en condición 'tal como están'.",
            liability: "En la máxima medida posible, no somos responsables por daños u otros perjuicios que surgieron a terceros por el uso de información en la aplicación o en sitios web.",
            accuracy: "La información publicada en la aplicación o en sitios web puede contener imprecisiones técnicas y/o errores tipográficos.",
            changes: "Podemos en cualquier momento sin aviso previo mejorar o cambiar los productos y/o servicios y/o programas descritos aquí. Por lo tanto, la información cambia de vez en cuando."
          }
        }
      }
    },
    
    footer: {
      copyright: "Copyright © 2024 KROK – Fondo Pastoral de la Diócesis de Žilina",
      company: "Todos los derechos reservados."
    }
  }
};