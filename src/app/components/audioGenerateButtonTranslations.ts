export interface AudioGenerateButtonTranslations {
  errors: {
    no_text_to_convert: string;
    generation_failed: string;
    server_error: string;
  };
  buttons: {
    generate_audio: string;
    regenerate: string;
    regenerate_audio: string;
    generating: string;
    play: string;
    hide: string;
  };
  tooltips: {
    enter_text_first: string;
    regenerate_audio: string;
    generate_audio_file: string;
  };
  info: {
    characters: string;
    speech: string;
    characters_and_speech: string;
  };
  status: {
    generation_error: string;
    audio_generated: string;
    language: string;
    model: string;
    voice: string;
    file_size: string;
    audio_preview: string;
    file: string;
    url: string;
  };
  browser: {
    no_audio_support: string;
  };
}

export const audioGenerateButtonTranslations: Record<string, AudioGenerateButtonTranslations> = {
  sk: {
    errors: {
      no_text_to_convert: "Žiadny text na konverziu",
      generation_failed: "Chyba pri generovaní audio",
      server_error: "Chyba ${status}"
    },
    buttons: {
      generate_audio: "Generovať audio",
      regenerate: "Pregenerovať",
      regenerate_audio: "Pregenerovať audio",
      generating: "Generujem...",
      play: "Prehrať",
      hide: "Skryť"
    },
    tooltips: {
      enter_text_first: "Najprv zadajte text",
      regenerate_audio: "Pregenerovať audio",
      generate_audio_file: "Generovať audio súbor"
    },
    info: {
      characters: "znakov",
      speech: "reči",
      characters_and_speech: "${length} znakov • ~${seconds}s reči"
    },
    status: {
      generation_error: "Chyba generovania:",
      audio_generated: "Audio vygenerované",
      language: "Jazyk",
      model: "Model",
      voice: "Hlas",
      file_size: "Veľkosť",
      audio_preview: "🎧 Audio náhľad",
      file: "Súbor",
      url: "URL"
    },
    browser: {
      no_audio_support: "Váš prehliadač nepodporuje prehrávanie audio súborov."
    }
  },
  cz: {
    errors: {
      no_text_to_convert: "Žádný text ke konverzi",
      generation_failed: "Chyba při generování audio",
      server_error: "Chyba ${status}"
    },
    buttons: {
      generate_audio: "Generovat audio",
      regenerate: "Pregenerovat",
      regenerate_audio: "Pregenerovat audio",
      generating: "Generuji...",
      play: "Přehrát",
      hide: "Skrýt"
    },
    tooltips: {
      enter_text_first: "Nejprve zadejte text",
      regenerate_audio: "Pregenerovat audio",
      generate_audio_file: "Generovat audio soubor"
    },
    info: {
      characters: "znaků",
      speech: "řeči",
      characters_and_speech: "${length} znaků • ~${seconds}s řeči"
    },
    status: {
      generation_error: "Chyba generování:",
      audio_generated: "Audio vygenerováno",
      language: "Jazyk",
      model: "Model",
      voice: "Hlas",
      file_size: "Velikost",
      audio_preview: "🎧 Audio náhled",
      file: "Soubor",
      url: "URL"
    },
    browser: {
      no_audio_support: "Váš prohlížeč nepodporuje přehrávání audio souborů."
    }
  },
  en: {
    errors: {
      no_text_to_convert: "No text to convert",
      generation_failed: "Audio generation failed",
      server_error: "Error ${status}"
    },
    buttons: {
      generate_audio: "Generate Audio",
      regenerate: "Regenerate",
      regenerate_audio: "Regenerate Audio",
      generating: "Generating...",
      play: "Play",
      hide: "Hide"
    },
    tooltips: {
      enter_text_first: "Enter text first",
      regenerate_audio: "Regenerate audio",
      generate_audio_file: "Generate audio file"
    },
    info: {
      characters: "characters",
      speech: "speech",
      characters_and_speech: "${length} characters • ~${seconds}s speech"
    },
    status: {
      generation_error: "Generation error:",
      audio_generated: "Audio generated",
      language: "Language",
      model: "Model",
      voice: "Voice",
      file_size: "Size",
      audio_preview: "🎧 Audio Preview",
      file: "File",
      url: "URL"
    },
    browser: {
      no_audio_support: "Your browser does not support audio playback."
    }
  },
  es: {
    errors: {
      no_text_to_convert: "No hay texto para convertir",
      generation_failed: "Error al generar audio",
      server_error: "Error ${status}"
    },
    buttons: {
      generate_audio: "Generar Audio",
      regenerate: "Regenerar",
      regenerate_audio: "Regenerar Audio",
      generating: "Generando...",
      play: "Reproducir",
      hide: "Ocultar"
    },
    tooltips: {
      enter_text_first: "Ingrese texto primero",
      regenerate_audio: "Regenerar audio",
      generate_audio_file: "Generar archivo de audio"
    },
    info: {
      characters: "caracteres",
      speech: "habla",
      characters_and_speech: "${length} caracteres • ~${seconds}s habla"
    },
    status: {
      generation_error: "Error de generación:",
      audio_generated: "Audio generado",
      language: "Idioma",
      model: "Modelo",
      voice: "Voz",
      file_size: "Tamaño",
      audio_preview: "🎧 Vista Previa Audio",
      file: "Archivo",
      url: "URL"
    },
    browser: {
      no_audio_support: "Su navegador no soporta reproducción de audio."
    }
  }
};