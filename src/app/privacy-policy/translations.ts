// src/app/privacy-policy/translations.ts

export type PrivacyTranslations = {
  pageTitle: string;
  backToHome: string;
  validFrom: string;
  contactQuestion: string;
  contactSubtitle: string;
  
  sections: {
    controller: {
      title: string;
      content: {
        intro: string;
        companyTitle: string;
      };
    };
    
    contact: {
      title: string;
      content: {
        intro: string;
      };
    };
    
    declaration: {
      title: string;
      content: {
        intro: string;
        points: string[];
      };
    };
    
    scope: {
      title: string;
      content: {
        intro: string;
        dataTitle: string;
        dataPoints: string[];
        purposesTitle: string;
        purposes: {
          newsletters: string;
          services: {
            title: string;
            items: string[];
          };
          accounting: string;
        };
        retentionTitle: string;
        retention: string;
      };
    };
    
    thirdParties: {
      title: string;
      content: {
        intro: string;
        categories: {
          internal: {
            title: string;
            desc: string;
          };
          accounting: {
            title: string;
            desc: string;
          };
          accommodation: {
            title: string;
            desc: string;
          };
          delivery: {
            title: string;
            desc: string;
          };
        };
        confidentiality: {
          title: string;
          desc: string;
        };
      };
    };
    
    euData: {
      title: string;
      content: string;
    };
    
    cookies: {
      title: string;
      content: {
        intro: string;
        usage: {
          title: string;
          desc: string;
        };
        settings: {
          title: string;
          desc: string;
        };
      };
    };
    
    security: {
      title: string;
      content: {
        intro: string;
        measures: string[];
        note: string;
      };
    };
    
    rights: {
      title: string;
      content: {
        intro: string;
        contactEmails: {
          first: string;
          second: string;
        };
        rightsList: {
          title: string;
          desc?: string;
          article?: string;
        }[];
      };
    };
  };
  
  footer: {
    signature: string;
    position: string;
  };
};

export const privacyTranslations: Record<string, PrivacyTranslations> = {
  sk: {
    pageTitle: "Ochrana osobných údajov",
    backToHome: "Späť na hlavnú stránku",
    validFrom: "Platné od: 2. 11. 2024",
    contactQuestion: "Máte otázky k ochrane osobných údajov?",
    contactSubtitle: "Kontaktujte nás a radi vám poskytneme všetky potrebné informácie.",
    
    sections: {
      controller: {
        title: "Kto je správca osobných údajov",
        content: {
          intro: "Správcom osobných údajov účastníkov podujatí (najmä seminárov a konferencií) organizovaných KROK – Pastoračný fond Žilinskej diecézy, odberateľov newslettera, dobrovoľníkov a podporovateľov, dodávateľov služieb a korešpondentov s našou organizáciou, získaných prostredníctvom registračných formulárov na jednotlivé podujatia, prostredníctvom formulára na odoberanie newslettera uverejnenom na našej webovej stránke www.lectiodivina.sk, objednávkového formulára na knihy alebo prostredníctvom osobnej korešpondencie, je:",
          companyTitle: "KROK – Pastoračný fond Žilinskej diecézy"
        }
      },
      
      contact: {
        title: "Kontaktné údaje",
        content: {
          intro: "Pokiaľ sa na nás budete chcieť v priebehu spracúvania obrátiť, môžete nás kontaktovať:"
        }
      },
      
      declaration: {
        title: "Vyhlásenie", 
        content: {
          intro: "Vyhlasujeme, že ako správca vašich osobných údajov spĺňame všetky zákonné povinnosti vyžadované platnou legislatívou – zákonom č. 18/2018 Z.z. a GDPR, t. j.:",
          points: [
            "vaše osobné údaje budeme spracúvať len v prípade, ak disponujeme primeraným právnym základom, a to predovšetkým udelením súhlasu, plnením zmluvy či zákonnou povinnosťou;",
            "plníme si v zmysle článku 13 GDPR informačnú povinnosť ešte pred začatím spracúvania osobných údajov;",
            "umožníme a budeme vás podporovať v uplatňovaní a v plnení vašich práv podľa zákona č. 18/2018 Z.z. a GDPR."
          ]
        }
      },
      
      scope: {
        title: "Rozsah osobných údajov, účely spracúvania a právny základ spracúvania",
        content: {
          intro: "Vaše osobné údaje spracúvame na základe súhlasu so spracúvaním osobných údajov v maximálnom rozsahu:",
          dataTitle: "Spracúvané údaje:",
          dataPoints: [
            "meno, priezvisko, titul",
            "poštová adresa, e-mailová adresa, telefónne číslo", 
            "dátum narodenia, číslo občianskeho preukazu",
            "prípadná príslušnosť k farnosti a diecéze",
            "údaje o špeciálnych stravovacích obmedzeniach",
            "fotografie a videá zachytené počas podujatí poverenou osobou"
          ],
          purposesTitle: "Účely spracúvania:",
          purposes: {
            newsletters: "📧 Vytváranie a zasielanie newsletterov a informačných e-mailov",
            services: {
              title: "🎯 Poskytovanie služieb:",
              items: [
                "organizácia a zabezpečenie nami organizovaných podujatí vrátane stravy a ubytovania",
                "poskytovanie odborného poradenstva prostredníctvom e-mailu a/alebo telefonicky",
                "zasielanie informácií o podujatiach registrovaným účastníkom",
                "potvrdenie prihlásenia sa na podujatie, prijatia platieb za podujatia a darov",
                "identifikácia doručenej platby",
                "evidencia registrovaných účastníkov podujatí na účely riešenia prípadných reklamácií",
                "vedenie evidencie dobrovoľníkov a komunikácia s nimi",
                "spracúvanie a zasielanie objednávok kníh a vytvorenie s tým súvisiacich daňových dokladov"
              ]
            },
            accounting: "📊 Vedenie účtovníctva"
          },
          retentionTitle: "Doba uchovávania:",
          retention: "Vaše osobné údaje si ponechávame po dobu plynutia premlčacej doby, ak zákon nestanoví dlhšiu dobu na ich uchovávanie."
        }
      },
      
      thirdParties: {
        title: "Poskytnutie osobných údajov tretím osobám",
        content: {
          intro: "K vašim osobným údajom majú prístup:",
          categories: {
            internal: {
              title: "🏢 Interní pracovníci",
              desc: "Výkonní pracovníci Pastoračného fondu KROK a dobrovoľník/ci zodpovedný/í za organizačné vedenie daného podujatia. Dobrovoľníci spracúvajú osobné údaje iba účastníkov toho podujatia, za ktoré sú organizačne zodpovední."
            },
            accounting: {
              title: "📊 Účtovníctvo a audit",
              desc: "Účtovníčka a audítor Pastoračného fondu Žilinskej diecézy – KROK"
            },
            accommodation: {
              title: "🏨 Ubytovacie a stravovacie služby",
              desc: "Na podujatiach, na ktorých pre účastníkov zabezpečujeme aj ubytovanie a stravu, vaše osobné údaje poskytujeme v nevyhnutnom rozsahu len spoločnostiam a organizáciám, ktoré majú oprávnenie poskytovať ubytovacie a stravovacie služby (Penzion Bystrík)."
            },
            delivery: {
              title: "📦 Doručovacie služby",
              desc: "V prípade doručovania pošty alebo inej korešpondencie vaše osobné údaje poskytujeme v nevyhnutnom rozsahu len spoločnostiam, ktoré majú oprávnenie poskytovať doručovacie a kuriérske služby (Slovenská pošta, Slovak Parcel Service, TNT, Geis...)."
            }
          },
          confidentiality: {
            title: "Záruka mlčanlivosti:",
            desc: "Uisťujeme vás, že všetci spracúvatelia vašich osobných údajov sú povinní zachovávať mlčanlivosť o osobných údajoch a o bezpečnostných opatreniach. Bez vášho súhlasu nebudú vaše osobné údaje vydané/poskytnuté žiadnej inej tretej strane."
          }
        }
      },
      
      euData: {
        title: "Poskytnutie dát mimo Európskej únie",
        content: "Spracúvanie osobných údajov bude prebiehať výlučne na území Európskej únie. Vaše osobné údaje nebudú prenášané do tretích krajín ani medzinárodných organizácií."
      },
      
      cookies: {
        title: "Cookies",
        content: {
          intro: "Pri prehliadaní webových stránok www.lectiodivina.sk zaznamenávame vašu IP adresu, časový interval strávený na stránke a to, z ktorej stránky prichádzate.",
          usage: {
            title: "🍪 Použitie cookies",
            desc: "Cookies používame na meranie návštevnosti webu a prispôsobenie zobrazenia webových stránok ako svoj oprávnený záujem správcu, lebo vďaka tomu môžeme ponúknuť lepšie služby. Cookies pre cielenie reklamy KROK nepoužívalo a ani v budúcnosti nebudú spracúvané na tento účel."
          },
          settings: {
            title: "⚙️ Nastavenia",
            desc: "Naše webové stránky sa dajú prehliadať aj v režime, ktorý neumožňuje zbierať osobné údaje. Používanie cookies môžete na svojom počítači zakázať."
          }
        }
      },
      
      security: {
        title: "Zabezpečenie a ochrana osobných údajov",
        content: {
          intro: "Osobné údaje chránime v maximálnej možnej miere pomocou moderných technológií, ktoré zodpovedajú stupňu technického rozvoja, prostredníctvom technických a organizačných opatrení, ktoré zamedzujú zneužitiu, poškodeniu alebo zničeniu vašich osobných údajov:",
          measures: [
            "zabezpečeným prístupom do našich počítačov (zabezpečené heslom)",
            "zabezpečeným prístupom do našich telefónov (zabezpečené heslom a čítačkou odtlačkov prstov)",
            "zabezpečeným prístupom do našich e-mailových schránok (zabezpečené užívateľským menom a heslom)",
            "zabezpečeným prístupom do aplikácií na e-mailové rozosielanie (zabezpečené menom a heslom)",
            "zabezpečeným prístupom do databáz účastníkov prihlásených na jednotlivé podujatia (zabezpečené menom a heslom)",
            "zabezpečeným prístupom do databáz dobrovoľníkov a darcov nášho občianskeho združenia (zabezpečené menom a heslom)",
            "zabezpečeným prístupom do fakturačných systémov (zabezpečené menom a heslom)",
            "pravidelnou aktualizáciou softwéru"
          ],
          note: "Osobné údaje budú spracúvané v elektronickej podobe automatizovaným spôsobom alebo v tlačenej podobe neautomatizovaným spôsobom."
        }
      },
      
      rights: {
        title: "Vaše práva v súvislosti s ochranou osobných údajov",
        content: {
          intro: "V súvislosti s ochranou osobných údajov máte viacero práv. Ak budete niektoré z týchto práv chcieť využiť, prosíme, kontaktujte nás na",
          contactEmails: {
            first: "mojkrok@dcza.sk",
            second: "info@lectiodivina.sk"
          },
          rightsList: [
            {
              title: "Právo na informácie",
              desc: "plnené už touto informačnou stránkou so zásadami spracúvania osobných údajov"
            },
            {
              title: "Právo na prístup k svojim osobným údajom",
              desc: "máte právo získať potvrdenie o tom, aké vaše osobné údaje spracúvame",
              article: "čl. 15 GDPR"
            },
            {
              title: "Právo na opravu nesprávnych osobných údajov",
              desc: "a doplnenie neúplných osobných údajov",
              article: "čl. 16 GDPR"
            },
            {
              title: "Právo na vymazanie (tzv. právo na zabudnutie)",
              desc: "osobných údajov",
              article: "čl. 17 GDPR"
            },
            {
              title: "Právo na obmedzenie spracúvania",
              desc: "obmedziť môžete rozsah osobných údajov alebo účelov spracovania",
              article: "čl. 18 GDPR"
            },
            {
              title: "Právo na prenosnosť údajov",
              article: "čl. 20 GDPR"
            },
            {
              title: "Právo namietať",
              desc: "z dôvodov týkajúcich sa konkrétnej situácie proti spracúvaniu osobných údajov",
              article: "čl. 21 GDPR"
            },
            {
              title: "Právo podať sťažnosť",
              desc: "na Úrad pre ochranu osobných údajov v prípade, že sa domnievate, že bolo porušené vaše právo na ochranu osobných údajov"
            },
            {
              title: "Odhlásenie zo zasielania newslettrov",
              desc: "stlačením odhlasovacieho odkazu, ktorý sa nachádza v každom zaslanom newsletteri"
            },
            {
              title: "Odhlásenie zo zasielania informačných e-mailov",
              desc: "zaslaním krátkej správy v znení: 'Odhlasujem sa zo zasielania informačných e-mailov' na adresu: mojkrok@dcza.sk alebo info@lectiodivina.sk"
            }
          ]
        }
      }
    },
    
    footer: {
      signature: "Mgr. Dušan Pecko",
      position: "štatutárny zástupca KROK Pastoračný fond Žilinskej diecézy"
    }
  },

  en: {
    pageTitle: "Privacy Policy", 
    backToHome: "Back to homepage",
    validFrom: "Valid from: November 2, 2024",
    contactQuestion: "Do you have questions about data protection?",
    contactSubtitle: "Contact us and we will be happy to provide you with all the necessary information.",
    
    sections: {
      controller: {
        title: "Who is the personal data controller",
        content: {
          intro: "The controller of personal data of event participants (especially seminars and conferences) organized by KROK – Pastoral Fund of the Diocese of Žilina, newsletter subscribers, volunteers and supporters, service providers and correspondents with our organization, obtained through registration forms for individual events, through the newsletter subscription form published on our website www.lectiodivina.sk, book order form or through personal correspondence, is:",
          companyTitle: "KROK – Pastoral Fund of the Diocese of Žilina"
        }
      },
      
      contact: {
        title: "Contact information",
        content: {
          intro: "If you want to contact us during the processing, you can contact us:"
        }
      },
      
      declaration: {
        title: "Declaration",
        content: {
          intro: "We declare that as the controller of your personal data, we fulfill all legal obligations required by applicable legislation – Act No. 18/2018 Coll. and GDPR, i.e.:",
          points: [
            "we will process your personal data only if we have an adequate legal basis, primarily by granting consent, fulfilling a contract or legal obligation;",
            "we fulfill our information obligation under Article 13 GDPR even before starting the processing of personal data;",
            "we will enable and support you in asserting and fulfilling your rights under Act No. 18/2018 Coll. and GDPR."
          ]
        }
      },
      
      scope: {
        title: "Scope of personal data, purposes of processing and legal basis for processing",
        content: {
          intro: "We process your personal data based on consent to the processing of personal data to the maximum extent:",
          dataTitle: "Processed data:",
          dataPoints: [
            "name, surname, title",
            "postal address, email address, phone number",
            "date of birth, identity card number", 
            "possible affiliation to parish and diocese",
            "data on special dietary restrictions",
            "photos and videos captured during events by an authorized person"
          ],
          purposesTitle: "Processing purposes:",
          purposes: {
            newsletters: "📧 Creating and sending newsletters and informational emails",
            services: {
              title: "🎯 Providing services:",
              items: [
                "organization and provision of events organized by us, including meals and accommodation",
                "providing professional advice via email and/or telephone",
                "sending information about events to registered participants",
                "confirmation of event registration, receipt of payments for events and donations",
                "identification of delivered payment",
                "keeping records of registered event participants for complaint resolution purposes",
                "maintaining records of volunteers and communicating with them",
                "processing and sending book orders and creating related tax documents"
              ]
            },
            accounting: "📊 Accounting records"
          },
          retentionTitle: "Retention period:",
          retention: "We retain your personal data for the duration of the limitation period, unless the law stipulates a longer period for their retention."
        }
      },
      
      thirdParties: {
        title: "Provision of personal data to third parties",
        content: {
          intro: "Your personal data is accessed by:",
          categories: {
            internal: {
              title: "🏢 Internal staff",
              desc: "Executive staff of the KROK Pastoral Fund and volunteer(s) responsible for the organizational management of the given event. Volunteers process personal data only of participants of the event for which they are organizationally responsible."
            },
            accounting: {
              title: "📊 Accounting and audit",
              desc: "Accountant and auditor of the Pastoral Fund of the Diocese of Žilina – KROK"
            },
            accommodation: {
              title: "🏨 Accommodation and catering services",
              desc: "At events where we also provide accommodation and meals for participants, we provide your personal data to the necessary extent only to companies and organizations that are authorized to provide accommodation and catering services (Penzion Bystrík)."
            },
            delivery: {
              title: "📦 Delivery services",
              desc: "In case of mail or other correspondence delivery, we provide your personal data to the necessary extent only to companies that are authorized to provide delivery and courier services (Slovak Post, Slovak Parcel Service, TNT, Geis...)."
            }
          },
          confidentiality: {
            title: "Confidentiality guarantee:",
            desc: "We assure you that all processors of your personal data are obliged to maintain confidentiality about personal data and security measures. Without your consent, your personal data will not be issued/provided to any other third party."
          }
        }
      },
      
      euData: {
        title: "Data transfer outside the European Union",
        content: "Personal data processing will take place exclusively within the territory of the European Union. Your personal data will not be transferred to third countries or international organizations."
      },
      
      cookies: {
        title: "Cookies",
        content: {
          intro: "When browsing the website www.lectiodivina.sk, we record your IP address, the time interval spent on the page and where you come from.",
          usage: {
            title: "🍪 Use of cookies",
            desc: "We use cookies to measure website traffic and customize the display of web pages as our legitimate interest as a controller, because this allows us to offer better services. KROK has not used cookies for advertising targeting and will not process them for this purpose in the future."
          },
          settings: {
            title: "⚙️ Settings",
            desc: "Our web pages can also be browsed in a mode that does not allow the collection of personal data. You can disable the use of cookies on your computer."
          }
        }
      },
      
      security: {
        title: "Security and protection of personal data",
        content: {
          intro: "We protect personal data to the maximum extent possible using modern technologies that correspond to the level of technical development, through technical and organizational measures that prevent misuse, damage or destruction of your personal data:",
          measures: [
            "secured access to our computers (password protected)",
            "secured access to our phones (password and fingerprint reader protected)",
            "secured access to our email boxes (username and password protected)",
            "secured access to email distribution applications (name and password protected)",
            "secured access to databases of participants registered for individual events (name and password protected)",
            "secured access to databases of volunteers and donors of our civic association (name and password protected)",
            "secured access to billing systems (name and password protected)",
            "regular software updates"
          ],
          note: "Personal data will be processed electronically in an automated manner or in printed form in a non-automated manner."
        }
      },
      
      rights: {
        title: "Your rights in connection with personal data protection",
        content: {
          intro: "In connection with the protection of personal data, you have several rights. If you want to exercise any of these rights, please contact us at",
          contactEmails: {
            first: "mojkrok@dcza.sk",
            second: "info@lectiodivina.sk"
          },
          rightsList: [
            {
              title: "Right to information",
              desc: "already fulfilled by this information page with personal data processing principles"
            },
            {
              title: "Right of access to your personal data",
              desc: "you have the right to obtain confirmation of what personal data we process about you",
              article: "Art. 15 GDPR"
            },
            {
              title: "Right to rectification of incorrect personal data",
              desc: "and completion of incomplete personal data",
              article: "Art. 16 GDPR"
            },
            {
              title: "Right to erasure (so-called right to be forgotten)",
              desc: "of personal data",
              article: "Art. 17 GDPR"
            },
            {
              title: "Right to restriction of processing",
              desc: "you can restrict the scope of personal data or processing purposes",
              article: "Art. 18 GDPR"
            },
            {
              title: "Right to data portability",
              article: "Art. 20 GDPR"
            },
            {
              title: "Right to object",
              desc: "for reasons relating to your particular situation against the processing of personal data",
              article: "Art. 21 GDPR"
            },
            {
              title: "Right to lodge a complaint",
              desc: "with the Personal Data Protection Office if you believe that your right to personal data protection has been violated"
            },
            {
              title: "Unsubscribe from newsletters",
              desc: "by clicking the unsubscribe link found in each newsletter sent"
            },
            {
              title: "Unsubscribe from informational emails",
              desc: "by sending a short message saying: 'I unsubscribe from receiving informational emails' to: mojkrok@dcza.sk or info@lectiodivina.sk"
            }
          ]
        }
      }
    },
    
    footer: {
      signature: "Mgr. Dušan Pecko",
      position: "statutory representative of KROK Pastoral Fund of the Diocese of Žilina"
    }
  },

  cz: {
    pageTitle: "Ochrana osobních údajů",
    backToHome: "Zpět na hlavní stránku", 
    validFrom: "Platné od: 2. 11. 2024",
    contactQuestion: "Máte otázky k ochraně osobních údajů?",
    contactSubtitle: "Kontaktujte nás a rádi vám poskytneme všechny potřebné informace.",
    
    sections: {
      controller: {
        title: "Kdo je správce osobních údajů",
        content: {
          intro: "Správcem osobních údajů účastníků akcí (zejména seminářů a konferencí) organizovaných KROK – Pastorační fond Žilinské diecéze, odběratelů newsletteru, dobrovolníků a podporovatelů, dodavatelů služeb a korespondentů s naší organizací, získaných prostřednictvím registračních formulářů na jednotlivé akce, prostřednictvím formuláře pro odběr newsletteru zveřejněném na našich webových stránkách www.lectiodivina.sk, objednávkového formuláře na knihy nebo prostřednictvím osobní korespondence, je:",
          companyTitle: "KROK – Pastorační fond Žilinské diecéze"
        }
      },
      
      contact: {
        title: "Kontaktní údaje",
        content: {
          intro: "Pokud se na nás budete chtít v průběhu zpracování obrátit, můžete nás kontaktovat:"
        }
      },
      
      declaration: {
        title: "Prohlášení",
        content: {
          intro: "Prohlašujeme, že jako správce vašich osobních údajů plníme všechny zákonné povinnosti vyžadované platnou legislativou – zákonem č. 18/2018 Sb. a GDPR, tj.:",
          points: [
            "vaše osobní údaje budeme zpracovávat pouze v případě, že disponujeme přiměřeným právním základem, a to především udělením souhlasu, plněním smlouvy či zákonnou povinností;",
            "plníme si ve smyslu článku 13 GDPR informační povinnost ještě před začátkem zpracování osobních údajů;",
            "umožníme a budeme vás podporovat v uplatňování a plnění vašich práv podle zákona č. 18/2018 Sb. a GDPR."
          ]
        }
      },
      
      scope: {
        title: "Rozsah osobních údajů, účely zpracování a právní základ zpracování",
        content: {
          intro: "Vaše osobní údaje zpracováváme na základě souhlasu se zpracováním osobních údajů v maximálním rozsahu:",
          dataTitle: "Zpracovávané údaje:",
          dataPoints: [
            "jméno, příjmení, titul",
            "poštovní adresa, e-mailová adresa, telefonní číslo",
            "datum narození, číslo občanského průkazu",
            "případná příslušnost k farnosti a diecézi",
            "údaje o speciálních stravovacích omezeních",
            "fotografie a videa zachycená během akcí pověřenou osobou"
          ],
          purposesTitle: "Účely zpracování:",
          purposes: {
            newsletters: "📧 Vytváření a zasílání newsletterů a informačních e-mailů",
            services: {
              title: "🎯 Poskytování služeb:",
              items: [
                "organizace a zabezpečení námi organizovaných akcí včetně stravy a ubytování",
                "poskytování odborného poradenství prostřednictvím e-mailu a/nebo telefonicky",
                "zasílání informací o akcích registrovaným účastníkům",
                "potvrzení přihlášení na akci, přijetí plateb za akce a darů",
                "identifikace doručené platby",
                "evidence registrovaných účastníků akcí pro účely řešení případných reklamací",
                "vedení evidence dobrovolníků a komunikace s nimi",
                "zpracování a zasílání objednávek knih a vytvoření s tím souvisejících daňových dokladů"
              ]
            },
            accounting: "📊 Vedení účetnictví"
          },
          retentionTitle: "Doba uchovávání:",
          retention: "Vaše osobní údaje si ponecháváme po dobu plynutí promlčecí doby, pokud zákon nestanoví delší dobu pro jejich uchovávání."
        }
      },
      
      thirdParties: {
        title: "Poskytnutí osobních údajů třetím osobám",
        content: {
          intro: "K vašim osobním údajům mají přístup:",
          categories: {
            internal: {
              title: "🏢 Interní pracovníci",
              desc: "Výkonní pracovníci Pastoračního fondu KROK a dobrovolník/ci odpovědný/í za organizační vedení dané akce. Dobrovolníci zpracovávají osobní údaje pouze účastníků té akce, za kterou jsou organizačně odpovědní."
            },
            accounting: {
              title: "📊 Účetnictví a audit",
              desc: "Účetní a auditor Pastoračního fondu Žilinské diecéze – KROK"
            },
            accommodation: {
              title: "🏨 Ubytovací a stravovací služby",
              desc: "Na akcích, na kterých pro účastníky zabezpečujeme také ubytování a stravu, vaše osobní údaje poskytujeme v nezbytném rozsahu pouze společnostem a organizacím, které mají oprávnění poskytovat ubytovací a stravovací služby (Penzion Bystrík)."
            },
            delivery: {
              title: "📦 Doručovací služby",
              desc: "V případě doručování pošty nebo jiné korespondence vaše osobní údaje poskytujeme v nezbytném rozsahu pouze společnostem, které mají oprávnění poskytovat doručovací a kurýrní služby (Slovenská pošta, Slovak Parcel Service, TNT, Geis...)."
            }
          },
          confidentiality: {
            title: "Záruka mlčenlivosti:",
            desc: "Ujišťujeme vás, že všichni zpracovatelé vašich osobních údajů jsou povinni zachovávat mlčenlivost o osobních údajích a bezpečnostních opatřeních. Bez vašeho souhlasu nebudou vaše osobní údaje vydány/poskytnuty žádné jiné třetí straně."
          }
        }
      },
      
      euData: {
        title: "Poskytnutí dat mimo Evropskou unii",
        content: "Zpracování osobních údajů bude probíhat výhradně na území Evropské unie. Vaše osobní údaje nebudou přenášeny do třetích zemí ani mezinárodních organizací."
      },
      
      cookies: {
        title: "Cookies",
        content: {
          intro: "Při prohlížení webových stránek www.lectiodivina.sk zaznamenáváme vaši IP adresu, časový interval strávený na stránce a to, z které stránky přicházíte.",
          usage: {
            title: "🍪 Použití cookies",
            desc: "Cookies používáme k měření návštěvnosti webu a přizpůsobení zobrazení webových stránek jako svůj oprávněný zájem správce, protože díky tomu můžeme nabídnout lepší služby. Cookies pro cílení reklamy KROK nepoužíval a ani v budoucnosti nebudou zpracovávány za tímto účelem."
          },
          settings: {
            title: "⚙️ Nastavení",
            desc: "Naše webové stránky lze prohlížet také v režimu, který neumožňuje sbírání osobních údajů. Používání cookies můžete na svém počítači zakázat."
          }
        }
      },
      
      security: {
        title: "Zabezpečení a ochrana osobních údajů",
        content: {
          intro: "Osobní údaje chráníme v maximální možné míře pomocí moderních technologií, které odpovídají stupni technického rozvoje, prostřednictvím technických a organizačních opatření, která zabraňují zneužití, poškození nebo zničení vašich osobních údajů:",
          measures: [
            "zabezpečeným přístupem do našich počítačů (zabezpečené heslem)",
            "zabezpečeným přístupem do našich telefonů (zabezpečené heslem a čtečkou otisků prstů)",
            "zabezpečeným přístupem do našich e-mailových schránek (zabezpečené uživatelským jménem a heslem)",
            "zabezpečeným přístupem do aplikací na e-mailové rozesílání (zabezpečené jménem a heslem)",
            "zabezpečeným přístupem do databází účastníků přihlášených na jednotlivé akce (zabezpečené jménem a heslem)",
            "zabezpečeným přístupem do databází dobrovolníků a dárců našeho občanského sdružení (zabezpečené jménem a heslem)",
            "zabezpečeným přístupem do fakturačních systémů (zabezpečené jménem a heslem)",
            "pravidelnou aktualizací softwaru"
          ],
          note: "Osobní údaje budou zpracovávány v elektronické podobě automatizovaným způsobem nebo v tištěné podobě neautomatizovaným způsobem."
        }
      },
      
      rights: {
        title: "Vaše práva v souvislosti s ochranou osobních údajů",
        content: {
          intro: "V souvislosti s ochranou osobních údajů máte několik práv. Pokud budete některé z těchto práv chtít využít, prosíme, kontaktujte nás na",
          contactEmails: {
            first: "mojkrok@dcza.sk",
            second: "info@lectiodivina.sk"
          },
          rightsList: [
            {
              title: "Právo na informace",
              desc: "plněné již touto informační stránkou se zásadami zpracování osobních údajů"
            },
            {
              title: "Právo na přístup ke svým osobním údajům",
              desc: "máte právo získat potvrzení o tom, jaké vaše osobní údaje zpracováváme",
              article: "čl. 15 GDPR"
            },
            {
              title: "Právo na opravu nesprávných osobních údajů",
              desc: "a doplnění neúplných osobních údajů",
              article: "čl. 16 GDPR"
            },
            {
              title: "Právo na výmaz (tzv. právo být zapomenut)",
              desc: "osobních údajů",
              article: "čl. 17 GDPR"
            },
            {
              title: "Právo na omezení zpracování",
              desc: "omezit můžete rozsah osobních údajů nebo účelů zpracování",
              article: "čl. 18 GDPR"
            },
            {
              title: "Právo na přenositelnost údajů",
              article: "čl. 20 GDPR"
            },
            {
              title: "Právo namítat",
              desc: "z důvodů týkajících se konkrétní situace proti zpracování osobních údajů",
              article: "čl. 21 GDPR"
            },
            {
              title: "Právo podat stížnost",
              desc: "na Úřad pro ochranu osobních údajů v případě, že se domníváte, že bylo porušeno vaše právo na ochranu osobních údajů"
            },
            {
              title: "Odhlášení ze zasílání newsletterů",
              desc: "stisknutím odhlašovacího odkazu, který se nachází v každém zaslaném newsletteru"
            },
            {
              title: "Odhlášení ze zasílání informačních e-mailů",
              desc: "zasláním krátké zprávy ve znění: 'Odhlašuji se ze zasílání informačních e-mailů' na adresu: mojkrok@dcza.sk nebo info@lectiodivina.sk"
            }
          ]
        }
      }
    },
    
    footer: {
      signature: "Mgr. Dušan Pecko",
      position: "statutární zástupce KROK Pastorační fond Žilinské diecéze"
    }
  },

  es: {
    pageTitle: "Política de Privacidad",
    backToHome: "Volver a la página principal",
    validFrom: "Válido desde: 2 de noviembre de 2024",
    contactQuestion: "¿Tiene preguntas sobre la protección de datos?",
    contactSubtitle: "Contáctenos y estaremos encantados de proporcionarle toda la información necesaria.",
    
    sections: {
      controller: {
        title: "Quién es el responsable del tratamiento de datos personales",
        content: {
          intro: "El responsable del tratamiento de datos personales de los participantes de eventos (especialmente seminarios y conferencias) organizados por KROK – Fondo Pastoral de la Diócesis de Žilina, suscriptores de newsletters, voluntarios y seguidores, proveedores de servicios y corresponsales con nuestra organización, obtenidos a través de formularios de registro para eventos individuales, a través del formulario de suscripción al newsletter publicado en nuestro sitio web www.lectiodivina.sk, formulario de pedido de libros o a través de correspondencia personal, es:",
          companyTitle: "KROK – Fondo Pastoral de la Diócesis de Žilina"
        }
      },
      
      contact: {
        title: "Información de contacto",
        content: {
          intro: "Si desea contactarnos durante el procesamiento, puede contactarnos:"
        }
      },
      
      declaration: {
        title: "Declaración",
        content: {
          intro: "Declaramos que como responsable del tratamiento de sus datos personales, cumplimos con todas las obligaciones legales requeridas por la legislación vigente – Ley No. 18/2018 Coll. y GDPR, es decir:",
          points: [
            "procesaremos sus datos personales solo si tenemos una base legal adecuada, principalmente mediante el otorgamiento de consentimiento, cumplimiento de contrato u obligación legal;",
            "cumplimos con nuestra obligación de información bajo el Artículo 13 GDPR incluso antes de comenzar el procesamiento de datos personales;",
            "le permitiremos y apoyaremos en la afirmación y cumplimiento de sus derechos bajo la Ley No. 18/2018 Coll. y GDPR."
          ]
        }
      },
      
      scope: {
        title: "Alcance de datos personales, propósitos del procesamiento y base legal para el procesamiento",
        content: {
          intro: "Procesamos sus datos personales basados en el consentimiento para el procesamiento de datos personales en el máximo alcance:",
          dataTitle: "Datos procesados:",
          dataPoints: [
            "nombre, apellido, título",
            "dirección postal, dirección de correo electrónico, número de teléfono",
            "fecha de nacimiento, número de documento de identidad",
            "posible afiliación a parroquia y diócesis",
            "datos sobre restricciones dietéticas especiales",
            "fotografías y videos capturados durante eventos por una persona autorizada"
          ],
          purposesTitle: "Propósitos del procesamiento:",
          purposes: {
            newsletters: "📧 Creación y envío de newsletters y correos informativos",
            services: {
              title: "🎯 Prestación de servicios:",
              items: [
                "organización y provisión de eventos organizados por nosotros, incluyendo comidas y alojamiento",
                "prestación de asesoramiento profesional vía correo electrónico y/o teléfono",
                "envío de información sobre eventos a participantes registrados",
                "confirmación de registro de eventos, recepción de pagos por eventos y donaciones",
                "identificación de pago entregado",
                "mantener registros de participantes de eventos registrados para propósitos de resolución de quejas",
                "mantener registros de voluntarios y comunicarse con ellos",
                "procesamiento y envío de pedidos de libros y creación de documentos fiscales relacionados"
              ]
            },
            accounting: "📊 Registros contables"
          },
          retentionTitle: "Período de retención:",
          retention: "Retenemos sus datos personales durante la duración del período de prescripción, a menos que la ley estipule un período más largo para su retención."
        }
      },
      
      thirdParties: {
        title: "Provisión de datos personales a terceros",
        content: {
          intro: "Sus datos personales son accedidos por:",
          categories: {
            internal: {
              title: "🏢 Personal interno",
              desc: "Personal ejecutivo del Fondo Pastoral KROK y voluntario(s) responsable(s) de la gestión organizacional del evento dado. Los voluntarios procesan datos personales solo de participantes del evento por el cual son organizacionalmente responsables."
            },
            accounting: {
              title: "📊 Contabilidad y auditoría",
              desc: "Contador y auditor del Fondo Pastoral de la Diócesis de Žilina – KROK"
            },
            accommodation: {
              title: "🏨 Servicios de alojamiento y catering",
              desc: "En eventos donde también proporcionamos alojamiento y comidas para participantes, proporcionamos sus datos personales en la medida necesaria solo a empresas y organizaciones que están autorizadas a proporcionar servicios de alojamiento y catering (Penzion Bystrík)."
            },
            delivery: {
              title: "📦 Servicios de entrega",
              desc: "En caso de entrega de correo u otra correspondencia, proporcionamos sus datos personales en la medida necesaria solo a empresas que están autorizadas a proporcionar servicios de entrega y mensajería (Slovak Post, Slovak Parcel Service, TNT, Geis...)."
            }
          },
          confidentiality: {
            title: "Garantía de confidencialidad:",
            desc: "Le aseguramos que todos los procesadores de sus datos personales están obligados a mantener la confidencialidad sobre los datos personales y las medidas de seguridad. Sin su consentimiento, sus datos personales no serán emitidos/proporcionados a ningún otro tercero."
          }
        }
      },
      
      euData: {
        title: "Transferencia de datos fuera de la Unión Europea",
        content: "El procesamiento de datos personales tendrá lugar exclusivamente dentro del territorio de la Unión Europea. Sus datos personales no serán transferidos a terceros países u organizaciones internacionales."
      },
      
      cookies: {
        title: "Cookies",
        content: {
          intro: "Al navegar por el sitio web www.lectiodivina.sk, registramos su dirección IP, el intervalo de tiempo pasado en la página y de dónde viene.",
          usage: {
            title: "🍪 Uso de cookies",
            desc: "Utilizamos cookies para medir el tráfico del sitio web y personalizar la visualización de páginas web como nuestro interés legítimo como responsable del tratamiento, porque esto nos permite ofrecer mejores servicios. KROK no ha utilizado cookies para orientación publicitaria y no las procesará para este propósito en el futuro."
          },
          settings: {
            title: "⚙️ Configuraciones",
            desc: "Nuestras páginas web también pueden navegarse en un modo que no permite la recopilación de datos personales. Puede deshabilitar el uso de cookies en su computadora."
          }
        }
      },
      
      security: {
        title: "Seguridad y protección de datos personales",
        content: {
          intro: "Protegemos los datos personales en la máxima medida posible utilizando tecnologías modernas que corresponden al nivel de desarrollo técnico, a través de medidas técnicas y organizacionales que previenen el mal uso, daño o destrucción de sus datos personales:",
          measures: [
            "acceso seguro a nuestras computadoras (protegido por contraseña)",
            "acceso seguro a nuestros teléfonos (protegido por contraseña y lector de huellas dactilares)",
            "acceso seguro a nuestras casillas de correo electrónico (protegido por nombre de usuario y contraseña)",
            "acceso seguro a aplicaciones de distribución de correo electrónico (protegido por nombre y contraseña)",
            "acceso seguro a bases de datos de participantes registrados para eventos individuales (protegido por nombre y contraseña)",
            "acceso seguro a bases de datos de voluntarios y donantes de nuestra asociación cívica (protegido por nombre y contraseña)",
            "acceso seguro a sistemas de facturación (protegido por nombre y contraseña)",
            "actualizaciones regulares de software"
          ],
          note: "Los datos personales serán procesados electrónicamente de manera automatizada o en forma impresa de manera no automatizada."
        }
      },
      
      rights: {
        title: "Sus derechos en relación con la protección de datos personales",
        content: {
          intro: "En relación con la protección de datos personales, tiene varios derechos. Si desea ejercer alguno de estos derechos, por favor contáctenos en",
          contactEmails: {
            first: "mojkrok@dcza.sk",
            second: "info@lectiodivina.sk"
          },
          rightsList: [
            {
              title: "Derecho a la información",
              desc: "ya cumplido por esta página informativa con principios de procesamiento de datos personales"
            },
            {
              title: "Derecho de acceso a sus datos personales",
              desc: "tiene derecho a obtener confirmación de qué datos personales procesamos sobre usted",
              article: "Art. 15 GDPR"
            },
            {
              title: "Derecho a rectificación de datos personales incorrectos",
              desc: "y completar datos personales incompletos",
              article: "Art. 16 GDPR"
            },
            {
              title: "Derecho al borrado (llamado derecho al olvido)",
              desc: "de datos personales",
              article: "Art. 17 GDPR"
            },
            {
              title: "Derecho a restricción del procesamiento",
              desc: "puede restringir el alcance de datos personales o propósitos de procesamiento",
              article: "Art. 18 GDPR"
            },
            {
              title: "Derecho a la portabilidad de datos",
              article: "Art. 20 GDPR"
            },
            {
              title: "Derecho a objetar",
              desc: "por razones relacionadas con su situación particular contra el procesamiento de datos personales",
              article: "Art. 21 GDPR"
            },
            {
              title: "Derecho a presentar una queja",
              desc: "ante la Oficina de Protección de Datos Personales si cree que su derecho a la protección de datos personales ha sido violado"
            },
            {
              title: "Cancelar suscripción a newsletters",
              desc: "haciendo clic en el enlace de cancelación que se encuentra en cada newsletter enviado"
            },
            {
              title: "Cancelar suscripción a correos informativos",
              desc: "enviando un mensaje corto que diga: 'Me doy de baja de recibir correos informativos' a: mojkrok@dcza.sk o info@lectiodivina.sk"
            }
          ]
        }
      }
    },
    
    footer: {
      signature: "Mgr. Dušan Pecko",
      position: "representante legal de KROK Fondo Pastoral de la Diócesis de Žilina"
    }
  }
};