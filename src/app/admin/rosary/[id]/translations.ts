// app/admin/rosary/[id]/translations.ts

export const rosaryAdminTranslations = {
  sk: {
    header: {
      backToList: "Späť na zoznam",
      newRosary: "Pridať nový Lectio Divina Ruženec",
      editRosary: "Upraviť",
      newDescription: "Vytvorte nový duchovný ruženec",
      editDescription: "Upravte existujúci ruženec",
      unsavedChanges: "Neuložené zmeny",
      draftLoaded: "Draft načítaný"
    },
    basicInfo: {
      title: "Základné informácie",
      rosaryName: "Názov ruženec",
      rosaryNamePlaceholder: "Zadajte názov ruženec...",
      biblicalText: "Biblický text",
      biblicalTextPlaceholder: "napr. Anjel Pána zvestoval Panne Márii...",
      category: "Kategória",
      categoryRequired: "Kategória je povinná",
      selectCategory: "-- Vyberte kategóriu --",
      rosaryType: "Typ ruženec",
      rosaryTypeRequired: "Typ ruženec je povinný",
      language: "Jazyk",
      languageRequired: "Jazyk je povinný"
    },
    intro: {
      title: "Úvod",
      description: "Úvodné slová a vysvetlenie pre tento ruženec",
      placeholder: "Úvodný text pre ruženec...",
      audio: "Úvod Audio (URL)",
      audioPlaceholder: "https://example.com/uvod.mp3"
    },
    introductoryPrayers: {
      title: "Úvodné modlitby (HTML)",
      description: "Modlitby na začiatok ruženec (HTML formát)",
      placeholder: "HTML obsah úvodných modlitieb...",
      audio: "Úvodné modlitby Audio (URL)",
      audioPlaceholder: "https://example.com/uvodne_modlitby.mp3"
    },
    biblicalText: {
      title: "Biblický text",
      description: "Biblický text pre tento ruženec",
      placeholder: "Biblický text...",
      importFromBible: "Importovať z Biblie",
      audio: "Biblický text Audio (URL)",
      audioPlaceholder: "https://example.com/biblicky_text.mp3"
    },
    content: {
      title: "Lectio Divina obsah"
    },
    illustrativeImage: {
      title: "Ilustračný obrázok",
      description: "Hlavný obrázok pre tento ruženec",
      upload: "Nahrať obrázok",
      change: "Zmeniť obrázok",
      remove: "Odstrániť obrázok"
    },
    lectio: {
      title: "1. Lectio (Čítanie slova)",
      text: "Lectio text",
      textRequired: "Lectio text je povinný",
      textPlaceholder: "Text pre čítanie a pochopenie Božieho slova...",
      audio: "Lectio Audio (URL)",
      audioPlaceholder: "https://example.com/lectio.mp3",
      comment: "Komentár",
      commentPlaceholder: "Dodatočný komentár alebo vysvetlenie...",
      commentAudio: "Komentár Audio (URL)",
      commentAudioPlaceholder: "https://example.com/komentar.mp3",
      removeVerseNumbers: "Odstrániť čísla veršov",
      removeVerseNumbersTooltip: "Odstráni čísla veršov z textu"
    },
    meditatio: {
      title: "2. Meditatio (Rozjímanie)",
      text: "Meditatio text",
      textRequired: "Meditatio text je povinný",
      textPlaceholder: "Text na rozjímanie a hĺbkové pochopenie...",
      audio: "Meditatio Audio (URL)",
      audioPlaceholder: "https://example.com/meditatio.mp3"
    },
    oratio: {
      title: "3. Oratio (Modlitba)",
      html: "Oratio (HTML)",
      htmlRequired: "Oratio HTML je povinné",
      htmlPlaceholder: "HTML obsah modlitby...",
      audio: "Oratio Audio (URL)",
      audioPlaceholder: "https://example.com/oratio.mp3"
    },
    contemplatio: {
      title: "4. Contemplatio (Kontemplácia)",
      text: "Contemplatio text",
      textRequired: "Contemplatio text je povinný",
      textPlaceholder: "Text pre tichú kontempláciu a odpočinok v Bohu...",
      audio: "Contemplatio Audio (URL)",
      audioPlaceholder: "https://example.com/contemplatio.mp3"
    },
    actio: {
      title: "5. Actio (Konanie)",
      text: "Actio text",
      textRequired: "Actio text je povinný",
      textPlaceholder: "Praktické podnety pre každodenný život...",
      audio: "Actio Audio (URL)",
      audioPlaceholder: "https://example.com/actio.mp3"
    },
    fullAudio: {
      title: "Kompletná audio nahrávka",
      description: "URL na kompletnú audio nahrávku ruženec",
      placeholder: "https://example.com/ruzenec-full.mp3",
      player: "Prehrať audio"
    },
    settings: {
      title: "Nastavenia",
      author: "Autor",
      authorDescription: "Autor alebo tvorca tohto ruženec",
      authorPlaceholder: "Meno autora ruženec...",
      order: "Poradie",
      orderDescription: "Poradie zoradenia (menšie číslo = vyššie)",
      orderPlaceholder: "0"
    },
    media: {
      title: "Médiá",
      illustrativeImage: "Ilustračný obrázok",
      imageUrl: "URL obrázka",
      imageUrlDescription: "URL adresa obrázka alebo nahrajte súbor nižšie",
      uploadImage: "Alebo nahrajte obrázok",
      uploadingImage: "Nahrávam obrázok...",
      preview: "Náhľad:",
      audioRecording: "Audio nahrávka",
      audioUrl: "URL audio súboru",
      audioUrlDescription: "URL adresa audio súboru alebo nahrajte súbor nižšie",
      uploadAudio: "Alebo nahrajte audio",
      uploadingAudio: "Nahrávam audio...",
      audioPlayer: "Audio prehrávač:",
      browserNotSupported: "Váš prehliadač nepodporuje audio prehrávanie."
    },
    publishing: {
      title: "Publikovanie",
      publish: "Publikovať ruženec",
      publishDescription: "Označte, ak má byť ruženec viditeľný pre používateľov v aplikácii"
    },
    voiceSettings: {
      title: "Nastavenia hlasu a modelu",
      voice: "Hlas",
      model: "Model",
      change: "Zmeniť",
      hide: "Skryť",
      selectVoice: "Výber hlasu",
      selectModel: "Výber modelu",
      default: "Predvolený"
    },
    bulkTranslate: {
      title: "Hromadný preklad obsahu",
      description: "Preloží všetky textové polia naraz do vybraného jazyka",
      fieldsCount: "polí na preklad",
      noFields: "Najprv vyplňte textové polia",
      start: "Začať hromadný preklad",
      translating: "Prebieha preklad...",
      selectLanguage: "Vybrať cieľový jazyk",
      translateAll: "Preložiť všetko",
      cancel: "Zrušiť",
      inProgress: "Preklad prebieha...",
      currentItem: "Aktuálna položka",
      completed: "Dokončené",
      errors: "Chyby",
      successful: "úspešných prekladov"
    },
    recordInfo: {
      title: "Informácie o zázname",
      created: "Vytvorené",
      updated: "Posledná úprava",
      newRecord: "Nový záznam",
      never: "Nikdy"
    },
    buttons: {
      save: "Uložiť",
      saveAndPublish: "Uložiť a publikovať",
      saving: "Ukladá sa...",
      cancel: "Zrušiť",
      translate: "Preložiť",
      generateAudio: "Generovať audio",
      backToList: "Späť na zoznam",
      createRosary: "Vytvoriť ruženec",
      saveChanges: "Uložiť zmeny",
      uploading: "Nahrávam súbor..."
    },
    messages: {
      saved: "Ruženec bol úspešne uložený!",
      error: "Nastala chyba pri ukladaní ruženec.",
      uploading: "Nahrávanie...",
      draft: "Koncept - Neuložené zmeny",
      draftLoaded: "Načítaný uložený draft",
      clearDraft: "Vymazať draft",
      draftCleared: "Draft vymazaný",
      confirmLeave: "Máte neuložené zmeny. Naozaj chcete opustiť stránku?",
      loading: "Načítavam...",
      notFound: "Ruženec nenájdený",
      notFoundDescription: "Požadovaný ruženec sa nenašiel v databáze.",
      validationError: "Názov ruženec, biblický text a lectio text sú povinné polia",
      uploadError: "Chyba pri uploade:",
      created: "Ruženec bol úspešne vytvorený",
      updated: "Ruženec bol úspešne aktualizovaný",
      imageUploaded: "Obrázok bol úspešne nahraný",
      audioUploaded: "Audio bol úspešne nahraný"
    },
    validation: {
      required: "Toto pole je povinné",
      categoryRequired: "Vyberte kategóriu",
      rosaryRequired: "Vyberte typ ruženec"
    }
  },
  en: {
    header: {
      backToList: "Back to list",
      newRosary: "Add new Lectio Divina Rosary",
      editRosary: "Edit rosary",
      newDescription: "Create a new spiritual rosary",
      editDescription: "Edit existing rosary",
      unsavedChanges: "Unsaved changes",
      draftLoaded: "Loaded draft"
    },
    basicInfo: {
      title: "Basic Information",
      rosaryName: "Rosary Name",
      rosaryNamePlaceholder: "Enter rosary name...",
      biblicalText: "Biblical Text",
      biblicalTextPlaceholder: "e.g. The Angel of the Lord announced to Mary...",
      category: "Category",
      categoryRequired: "Category is required",
      selectCategory: "-- Select category --",
      rosaryType: "Rosary Type",
      rosaryTypeRequired: "Rosary type is required",
      language: "Language",
      languageRequired: "Language is required"
    },
    intro: {
      title: "Introduction",
      description: "Introductory words and explanation for this rosary",
      placeholder: "Introductory text for the rosary...",
      audio: "Introduction Audio (URL)",
      audioPlaceholder: "https://example.com/intro.mp3"
    },
    introductoryPrayers: {
      title: "Introductory Prayers (HTML)",
      description: "Prayers at the beginning of the rosary (HTML format)",
      placeholder: "HTML content of introductory prayers...",
      audio: "Introductory Prayers Audio (URL)",
      audioPlaceholder: "https://example.com/introductory_prayers.mp3"
    },
    biblicalText: {
      title: "Biblical Text",
      description: "Biblical text for this rosary",
      placeholder: "Biblical text...",
      importFromBible: "Import from Bible",
      audio: "Biblical Text Audio (URL)",
      audioPlaceholder: "https://example.com/biblical_text.mp3"
    },
    content: {
      title: "Lectio Divina Content"
    },
    illustrativeImage: {
      title: "Illustrative Image",
      description: "Main image for this rosary",
      upload: "Upload image",
      change: "Change image",
      remove: "Remove image"
    },
    lectio: {
      title: "1. Lectio (Reading)",
      text: "Lectio Text",
      textRequired: "Lectio text is required",
      textPlaceholder: "Text for reading and understanding God's word...",
      audio: "Lectio Audio (URL)",
      audioPlaceholder: "https://example.com/lectio.mp3",
      comment: "Comment",
      commentPlaceholder: "Additional comment or explanation...",
      commentAudio: "Comment Audio (URL)",
      commentAudioPlaceholder: "https://example.com/comment.mp3",
      removeVerseNumbers: "Remove verse numbers",
      removeVerseNumbersTooltip: "Remove verse numbers from text"
    },
    meditatio: {
      title: "2. Meditatio (Meditation)",
      text: "Meditatio Text",
      textRequired: "Meditatio text is required",
      textPlaceholder: "Text for meditation and deeper understanding...",
      audio: "Meditatio Audio (URL)",
      audioPlaceholder: "https://example.com/meditatio.mp3"
    },
    oratio: {
      title: "3. Oratio (Prayer)",
      html: "Oratio (HTML)",
      htmlRequired: "Oratio HTML is required",
      htmlPlaceholder: "HTML content of the prayer...",
      audio: "Oratio Audio (URL)",
      audioPlaceholder: "https://example.com/oratio.mp3"
    },
    contemplatio: {
      title: "4. Contemplatio (Contemplation)",
      text: "Contemplatio Text",
      textRequired: "Contemplatio text is required",
      textPlaceholder: "Text for silent contemplation and resting in God...",
      audio: "Contemplatio Audio (URL)",
      audioPlaceholder: "https://example.com/contemplatio.mp3"
    },
    actio: {
      title: "5. Actio (Action)",
      text: "Actio Text",
      textRequired: "Actio text is required",
      textPlaceholder: "Practical suggestions for daily life...",
      audio: "Actio Audio (URL)",
      audioPlaceholder: "https://example.com/actio.mp3"
    },
    fullAudio: {
      title: "Complete Audio Recording",
      description: "URL to the complete audio recording of the rosary",
      placeholder: "https://example.com/rosary-full.mp3",
      player: "Play audio"
    },
    settings: {
      title: "Settings",
      author: "Author",
      authorDescription: "Author or creator of this rosary",
      authorPlaceholder: "Rosary author's name...",
      order: "Order",
      orderDescription: "Sort order (lower number = higher)",
      orderPlaceholder: "0"
    },
    media: {
      title: "Media",
      illustrativeImage: "Illustrative Image",
      imageUrl: "Image URL",
      imageUrlDescription: "Image URL or upload a file below",
      uploadImage: "Or upload image",
      uploadingImage: "Uploading image...",
      preview: "Preview:",
      audioRecording: "Audio Recording",
      audioUrl: "Audio File URL",
      audioUrlDescription: "Audio file URL or upload a file below",
      uploadAudio: "Or upload audio",
      uploadingAudio: "Uploading audio...",
      audioPlayer: "Audio Player:",
      browserNotSupported: "Your browser does not support audio playback."
    },
    publishing: {
      title: "Publishing",
      publish: "Publish rosary",
      publishDescription: "Check if the rosary should be visible to users in the app"
    },
    voiceSettings: {
      title: "Voice and Model Settings",
      voice: "Voice",
      model: "Model",
      change: "Change",
      hide: "Hide",
      selectVoice: "Select voice",
      selectModel: "Select model",
      default: "Default"
    },
    bulkTranslate: {
      title: "Bulk Content Translation",
      description: "Translate all text fields at once into the selected language",
      fieldsCount: "fields to translate",
      noFields: "Fill in text fields first",
      start: "Start bulk translation",
      translating: "Translation in progress...",
      selectLanguage: "Select target language",
      translateAll: "Translate all",
      cancel: "Cancel",
      inProgress: "Translation in progress...",
      currentItem: "Current item",
      completed: "Completed",
      errors: "Errors",
      successful: "successful translations"
    },
    recordInfo: {
      title: "Record Information",
      created: "Created",
      updated: "Last Updated",
      newRecord: "New Record",
      never: "Never"
    },
    buttons: {
      save: "Save",
      saveAndPublish: "Save and Publish",
      saving: "Saving...",
      cancel: "Cancel",
      translate: "Translate",
      generateAudio: "Generate Audio",
      backToList: "Back to List",
      createRosary: "Create Rosary",
      saveChanges: "Save Changes",
      uploading: "Uploading file..."
    },
    messages: {
      saved: "Rosary was saved successfully!",
      error: "An error occurred while saving the rosary.",
      uploading: "Uploading...",
      draft: "Draft - Unsaved changes",
      draftLoaded: "Loaded draft",
      clearDraft: "Clear draft",
      draftCleared: "Draft cleared",
      confirmLeave: "You have unsaved changes. Do you really want to leave the page?",
      loading: "Loading...",
      notFound: "Rosary not found",
      notFoundDescription: "The requested rosary was not found in the database.",
      validationError: "Rosary name, biblical text, and lectio text are required fields",
      uploadError: "Upload error:",
      created: "Rosary was created successfully",
      updated: "Rosary was updated successfully",
      imageUploaded: "Image was uploaded successfully",
      audioUploaded: "Audio was uploaded successfully"
    },
    validation: {
      required: "This field is required",
      categoryRequired: "Select a category",
      rosaryRequired: "Select rosary type"
    }
  },
  cz: {
    header: {
      backToList: "Zpět na seznam",
      newRosary: "Přidat nový Lectio Divina růženec",
      editRosary: "Upravit",
      newDescription: "Vytvořte nový duchovní růženec",
      editDescription: "Upravte existující růženec",
      unsavedChanges: "Neuložené změny",
      draftLoaded: "Načtený koncept"
    },
    basicInfo: {
      title: "Základní informace",
      rosaryName: "Název růžence",
      rosaryNamePlaceholder: "Zadejte název růžence...",
      biblicalText: "Biblický text",
      biblicalTextPlaceholder: "např. Anděl Páně zvěstoval Panně Marii...",
      category: "Kategorie",
      categoryRequired: "Kategorie je povinná",
      selectCategory: "-- Vyberte kategorii --",
      rosaryType: "Typ růžence",
      rosaryTypeRequired: "Typ růžence je povinný",
      language: "Jazyk",
      languageRequired: "Jazyk je povinný"
    },
    intro: {
      title: "Úvod",
      description: "Úvodní slova a vysvětlení pro tento růženec",
      placeholder: "Úvodní text pro růženec...",
      audio: "Úvod Audio (URL)",
      audioPlaceholder: "https://example.com/uvod.mp3"
    },
    introductoryPrayers: {
      title: "Úvodní modlitby (HTML)",
      description: "Modlitby na začátek růžence (HTML formát)",
      placeholder: "HTML obsah úvodních modliteb...",
      audio: "Úvodní modlitby Audio (URL)",
      audioPlaceholder: "https://example.com/uvodni_modlitby.mp3"
    },
    biblicalText: {
      title: "Biblický text",
      description: "Biblický text pro tento růženec",
      placeholder: "Biblický text...",
      importFromBible: "Importovat z Bible",
      audio: "Biblický text Audio (URL)",
      audioPlaceholder: "https://example.com/biblicky_text.mp3"
    },
    content: {
      title: "Lectio Divina obsah"
    },
    illustrativeImage: {
      title: "Ilustrační obrázek",
      description: "Hlavní obrázek pro tento růženec",
      upload: "Nahrát obrázek",
      change: "Změnit obrázek",
      remove: "Odstranit obrázek"
    },
    lectio: {
      title: "1. Lectio (Čtení)",
      text: "Lectio text",
      textRequired: "Lectio text je povinný",
      textPlaceholder: "Text pro čtení a pochopení Božího slova...",
      audio: "Lectio Audio (URL)",
      audioPlaceholder: "https://example.com/lectio.mp3",
      comment: "Komentář",
      commentPlaceholder: "Dodatečný komentář alebo vysvětlení...",
      commentAudio: "Komentář Audio (URL)",
      commentAudioPlaceholder: "https://example.com/komentar.mp3",
      removeVerseNumbers: "Odstranit čísla veršů",
      removeVerseNumbersTooltip: "Odstraní čísla veršů z textu"
    },
    meditatio: {
      title: "2. Meditatio (Rozjímání)",
      text: "Meditatio text",
      textRequired: "Meditatio text je povinný",
      textPlaceholder: "Text na rozjímání a hluboké pochopení...",
      audio: "Meditatio Audio (URL)",
      audioPlaceholder: "https://example.com/meditatio.mp3"
    },
    oratio: {
      title: "3. Oratio (Modlitba)",
      html: "Oratio (HTML)",
      htmlRequired: "Oratio HTML je povinné",
      htmlPlaceholder: "HTML obsah modlitby...",
      audio: "Oratio Audio (URL)",
      audioPlaceholder: "https://example.com/oratio.mp3"
    },
    contemplatio: {
      title: "4. Contemplatio (Kontemplace)",
      text: "Contemplatio text",
      textRequired: "Contemplatio text je povinný",
      textPlaceholder: "Text pre tichú kontemplaci a odpočinok v Bohu...",
      audio: "Contemplatio Audio (URL)",
      audioPlaceholder: "https://example.com/contemplatio.mp3"
    },
    actio: {
      title: "5. Actio (Jednání)",
      text: "Actio text",
      textRequired: "Actio text je povinný",
      textPlaceholder: "Praktické podněty pro každodenní život...",
      audio: "Actio Audio (URL)",
      audioPlaceholder: "https://example.com/actio.mp3"
    },
    fullAudio: {
      title: "Kompletní audio nahrávka",
      description: "URL na kompletní audio nahrávku růžence",
      placeholder: "https://example.com/ruzenec-full.mp3",
      player: "Přehrát audio"
    },
    settings: {
      title: "Nastavení",
      author: "Autor",
      authorDescription: "Autor nebo tvůrce tohoto růžence",
      authorPlaceholder: "Jméno autora růžence...",
      order: "Pořadí",
      orderDescription: "Pořadí zobrazení (menší číslo = výše)",
      orderPlaceholder: "0"
    },
    media: {
      title: "Média",
      illustrativeImage: "Ilustrační obrázek",
      imageUrl: "URL obrázku",
      imageUrlDescription: "URL adresa obrázku alebo nahrajte súbor nižšie",
      uploadImage: "Alebo nahrajte obrázok",
      uploadingImage: "Nahrávam obrázok...",
      preview: "Náhľad:",
      audioRecording: "Audio nahrávka",
      audioUrl: "URL audio súboru",
      audioUrlDescription: "URL adresa audio súboru alebo nahrajte súbor nižšie",
      uploadAudio: "Alebo nahrajte audio",
      uploadingAudio: "Nahrávam audio...",
      audioPlayer: "Audio prehrávač:",
      browserNotSupported: "Váš prehliadač nepodporuje audio prehrávanie."
    },
    publishing: {
      title: "Publikování",
      publish: "Publikovat růženec",
      publishDescription: "Zaškrtněte, pokud má být růženec viditelný pro uživatele v aplikaci"
    },
    voiceSettings: {
      title: "Nastavení hlasu a modelu",
      voice: "Hlas",
      model: "Model",
      change: "Změnit",
      hide: "Skrýt",
      selectVoice: "Výběr hlasu",
      selectModel: "Výběr modelu",
      default: "Výchozí"
    },
    bulkTranslate: {
      title: "Hromadný překlad obsahu",
      description: "Přeloží všechna textová pole najednou do vybraného jazyka",
      fieldsCount: "polí k překladu",
      noFields: "Nejprve vyplňte textová pole",
      start: "Začít hromadný překlad",
      translating: "Probíhá překlad...",
      selectLanguage: "Vyberte cílový jazyk",
      translateAll: "Přeložit vše",
      cancel: "Zrušit",
      inProgress: "Překlad probíhá...",
      currentItem: "Aktuální položka",
      completed: "Dokončeno",
      errors: "Chyby",
      successful: "úspěšných překladů"
    },
    recordInfo: {
      title: "Informace o záznamu",
      created: "Vytvořeno",
      updated: "Poslední úprava",
      newRecord: "Nový záznam",
      never: "Nikdy"
    },
    buttons: {
      save: "Uložit",
      saveAndPublish: "Uložit a publikovat",
      saving: "Ukládám...",
      cancel: "Zrušit",
      translate: "Přeložit",
      generateAudio: "Generovat audio",
      backToList: "Zpět na seznam",
      createRosary: "Vytvořit růženec",
      saveChanges: "Uložit změny",
      uploading: "Nahrávam súbor..."
    },
    messages: {
      saved: "Růženec byl úspěšně uložen!",
      error: "Došlo k chybě při ukládání růžence.",
      uploading: "Nahrávám...",
      draft: "Koncept - Neuložené zmeny",
      draftLoaded: "Načtený koncept",
      clearDraft: "Vymazat koncept",
      draftCleared: "Koncept vymazán",
      confirmLeave: "Máte neuložené změny. Opravdu chcete opustit stránku?",
      loading: "Načítám...",
      notFound: "Růženec nenalezen",
      notFoundDescription: "Požadovaný růženec nebyl nalezen v databázi.",
      validationError: "Název růžence, biblický text a lectio text jsou povinná pole",
      uploadError: "Chyba při nahrávání:",
      created: "Růženec byl úspěšně vytvořen",
      updated: "Růženec byl úspěšně aktualizován",
      imageUploaded: "Obrázek byl úspěšně nahrán",
      audioUploaded: "Audio bylo úspěšně nahráno"
    },
    validation: {
      required: "Toto pole je povinné",
      categoryRequired: "Vyberte kategorii",
      rosaryRequired: "Vyberte typ růžence"
    }
  },
  es: {
    header: {
      backToList: "Volver a la lista",
      newRosary: "Añadir nuevo Rosario Lectio Divina",
      editRosary: "Editar",
      newDescription: "Crea un nuevo rosario espiritual",
      editDescription: "Edita el rosario existente",
      unsavedChanges: "Cambios no guardados",
      draftLoaded: "Borrador cargado"
    },
    basicInfo: {
      title: "Información básica",
      rosaryName: "Nombre del rosario",
      rosaryNamePlaceholder: "Introduce el nombre del rosario...",
      biblicalText: "Texto bíblico",
      biblicalTextPlaceholder: "ej. El ángel del Señor anunció a María...",
      category: "Categoría",
      categoryRequired: "La categoría es obligatoria",
      selectCategory: "-- Selecciona categoría --",
      rosaryType: "Tipo de rosario",
      rosaryTypeRequired: "El tipo de rosario es obligatorio",
      language: "Idioma",
      languageRequired: "El idioma es obligatorio"
    },
    intro: {
      title: "Introducción",
      description: "Palabras introductorias y explicación para este rosario",
      placeholder: "Texto introductorio para el rosario...",
      audio: "Audio de introducción (URL)",
      audioPlaceholder: "https://example.com/intro.mp3"
    },
    introductoryPrayers: {
      title: "Oraciones introductorias (HTML)",
      description: "Oraciones al inicio del rosario (formato HTML)",
      placeholder: "Contenido HTML de las oraciones introductorias...",
      audio: "Audio de oraciones introductorias (URL)",
      audioPlaceholder: "https://example.com/oraciones_intro.mp3"
    },
    biblicalText: {
      title: "Texto bíblico",
      description: "Texto bíblico para este rosario",
      placeholder: "Texto bíblico...",
      importFromBible: "Importar de la Biblia",
      audio: "Audio de texto bíblico (URL)",
      audioPlaceholder: "https://example.com/texto_biblico.mp3"
    },
    content: {
      title: "Contenido Lectio Divina"
    },
    illustrativeImage: {
      title: "Imagen ilustrativa",
      description: "Imagen principal para este rosario",
      upload: "Subir imagen",
      change: "Cambiar imagen",
      remove: "Eliminar imagen"
    },
    lectio: {
      title: "1. Lectio (Lectura)",
      text: "Texto Lectio",
      textRequired: "El texto Lectio es obligatorio",
      textPlaceholder: "Texto para leer y comprender la palabra de Dios...",
      audio: "Audio Lectio (URL)",
      audioPlaceholder: "https://example.com/lectio.mp3",
      comment: "Comentario",
      commentPlaceholder: "Comentario adicional o explicación...",
      commentAudio: "Audio de comentario (URL)",
      commentAudioPlaceholder: "https://example.com/comentario.mp3",
      removeVerseNumbers: "Eliminar números de versículo",
      removeVerseNumbersTooltip: "Elimina los números de versículo del texto"
    },
    meditatio: {
      title: "2. Meditatio (Meditación)",
      text: "Texto Meditatio",
      textRequired: "El texto Meditatio es obligatorio",
      textPlaceholder: "Texto para meditar y comprender profundamente...",
      audio: "Audio Meditatio (URL)",
      audioPlaceholder: "https://example.com/meditatio.mp3"
    },
    oratio: {
      title: "3. Oratio (Oración)",
      html: "Oratio (HTML)",
      htmlRequired: "Oratio HTML es obligatorio",
      htmlPlaceholder: "Contenido HTML de la oración...",
      audio: "Audio Oratio (URL)",
      audioPlaceholder: "https://example.com/oratio.mp3"
    },
    contemplatio: {
      title: "4. Contemplatio (Contemplación)",
      text: "Texto Contemplatio",
      textRequired: "El texto Contemplatio es obligatorio",
      textPlaceholder: "Texto para la contemplación silenciosa y el descanso en Dios...",
      audio: "Audio Contemplatio (URL)",
      audioPlaceholder: "https://example.com/contemplatio.mp3"
    },
    actio: {
      title: "5. Actio (Acción)",
      text: "Texto Actio",
      textRequired: "El texto Actio es obligatorio",
      textPlaceholder: "Sugerencias prácticas para la vida diaria...",
      audio: "Audio Actio (URL)",
      audioPlaceholder: "https://example.com/actio.mp3"
    },
    fullAudio: {
      title: "Grabación de audio completa",
      description: "URL de la grabación de audio completa del rosario",
      placeholder: "https://example.com/rosario-full.mp3",
      player: "Reproducir audio"
    },
    settings: {
      title: "Configuración",
      author: "Autor",
      authorDescription: "Autor o creador de este rosario",
      authorPlaceholder: "Nombre del autor...",
      order: "Orden",
      orderDescription: "Orden de clasificación (número menor = más alto)",
      orderPlaceholder: "0"
    },
    media: {
      title: "Medios",
      illustrativeImage: "Imagen ilustrativa",
      imageUrl: "URL de la imagen",
      imageUrlDescription: "Dirección URL de la imagen o sube un archivo abajo",
      uploadImage: "O sube una imagen",
      uploadingImage: "Subiendo imagen...",
      preview: "Vista previa:",
      audioRecording: "Grabación de audio",
      audioUrl: "URL del archivo de audio",
      audioUrlDescription: "Dirección URL del archivo de audio o sube un archivo abajo",
      uploadAudio: "O sube un audio",
      uploadingAudio: "Subiendo audio...",
      audioPlayer: "Reproductor de audio:",
      browserNotSupported: "Tu navegador no soporta la reproducción de audio."
    },
    publishing: {
      title: "Publicación",
      publish: "Publicar rosario",
      publishDescription: "Marca si el rosario debe ser visible para los usuarios en la aplicación"
    },
    voiceSettings: {
      title: "Configuración de voz y modelo",
      voice: "Voz",
      model: "Modelo",
      change: "Cambiar",
      hide: "Ocultar",
      selectVoice: "Seleccionar voz",
      selectModel: "Seleccionar modelo",
      default: "Predeterminado"
    },
    bulkTranslate: {
      title: "Traducción masiva de contenido",
      description: "Traduce todos los campos de texto a la vez al idioma seleccionado",
      fieldsCount: "campos para traducir",
      noFields: "Primero rellena los campos de texto",
      start: "Iniciar traducción masiva",
      translating: "Traducción en curso...",
      selectLanguage: "Seleccionar idioma de destino",
      translateAll: "Traducir todo",
      cancel: "Cancelar",
      inProgress: "Traducción en curso...",
      currentItem: "Elemento actual",
      completed: "Completado",
      errors: "Errores",
      successful: "traducciones exitosas"
    },
    recordInfo: {
      title: "Información del registro",
      created: "Creado",
      updated: "Última actualización",
      newRecord: "Nuevo registro",
      never: "Nunca"
    },
    buttons: {
      save: "Guardar",
      saveAndPublish: "Guardar y publicar",
      saving: "Guardando...",
      cancel: "Cancelar",
      translate: "Traducir",
      generateAudio: "Generar audio",
      backToList: "Volver a la lista",
      createRosary: "Crear rosario",
      saveChanges: "Guardar cambios",
      uploading: "Subiendo archivo..."
    },
    messages: {
      saved: "¡El rosario se ha guardado correctamente!",
      error: "Ocurrió un error al guardar el rosario.",
      uploading: "Subiendo...",
      draft: "Borrador - Cambios no guardados",
      draftLoaded: "Borrador cargado",
      clearDraft: "Eliminar borrador",
      draftCleared: "Borrador eliminado",
      confirmLeave: "Tienes cambios no guardados. ¿Realmente quieres salir de la página?",
      loading: "Cargando...",
      notFound: "Rosario no encontrado",
      notFoundDescription: "El rosario solicitado no se encontró en la base de datos.",
      validationError: "El nombre del rosario, el texto bíblico y el texto lectio son campos obligatorios",
      uploadError: "Error de subida:",
      created: "El rosario se ha creado correctamente",
      updated: "El rosario se ha actualizado correctamente",
      imageUploaded: "La imagen se ha subido correctamente",
      audioUploaded: "El audio se ha subido correctamente"
    },
    validation: {
      required: "Este campo es obligatorio",
      categoryRequired: "Selecciona categoría",
      rosaryRequired: "Selecciona tipo de rosario"
    }
  }
};

export type RosaryAdminTranslations = typeof rosaryAdminTranslations.sk;
