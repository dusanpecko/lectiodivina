export interface ErrorReportModalTranslations {
  header: {
    title: string;
  };
  form: {
    original_text: {
      label: string;
      placeholder: string;
    };
    corrected_text: {
      label: string;
      placeholder: string;
    };
    severity: {
      label: string;
      levels: {
        low: {
          label: string;
          description: string;
        };
        medium: {
          label: string;
          description: string;
        };
        high: {
          label: string;
          description: string;
        };
        critical: {
          label: string;
          description: string;
        };
      };
    };
    notes: {
      label: string;
      placeholder: string;
    };
  };
  actions: {
    cancel: string;
    submit: string;
    submitting: string;
  };
  validation: {
    required_fields: string;
    texts_identical: string;
    submit_error: string;
  };
}

export const errorReportModalTranslations: Record<string, ErrorReportModalTranslations> = {
  sk: {
    header: {
      title: "Nahlásiť chybu"
    },
    form: {
      original_text: {
        label: "Pôvodný text (s chybou) *",
        placeholder: "Skopírujte časť textu, kde ste našli chybu..."
      },
      corrected_text: {
        label: "Opravený text *",
        placeholder: "Napište správnu verziu textu..."
      },
      severity: {
        label: "Stupeň závažnosti *",
        levels: {
          low: {
            label: "Malá chyba",
            description: "Preklep"
          },
          medium: {
            label: "Gramatika",
            description: "Gramatická chyba"
          },
          high: {
            label: "Význam",
            description: "Chyba vo význame"
          },
          critical: {
            label: "Kritická",
            description: "Nesprávna informácia"
          }
        }
      },
      notes: {
        label: "Poznámky (nepovinné)",
        placeholder: "Doplňujúce informácie, kontext chyby..."
      }
    },
    actions: {
      cancel: "Zrušiť",
      submit: "Odoslať hlásenie",
      submitting: "Odosielam..."
    },
    validation: {
      required_fields: "Prosím vyplňte pôvodný aj opravený text.",
      texts_identical: "Pôvodný a opravený text nemôžu byť rovnaké.",
      submit_error: "Nepodarilo sa odoslať hlásenie. Skúste to prosím znova."
    }
  },
  cz: {
    header: {
      title: "Nahlásit chybu"
    },
    form: {
      original_text: {
        label: "Původní text (s chybou) *",
        placeholder: "Zkopírujte část textu, kde jste našli chybu..."
      },
      corrected_text: {
        label: "Opravený text *",
        placeholder: "Napište správnou verzi textu..."
      },
      severity: {
        label: "Stupeň závažnosti *",
        levels: {
          low: {
            label: "Malá chyba",
            description: "Překlep"
          },
          medium: {
            label: "Gramatika",
            description: "Gramatická chyba"
          },
          high: {
            label: "Význam",
            description: "Chyba ve významu"
          },
          critical: {
            label: "Kritická",
            description: "Nesprávná informace"
          }
        }
      },
      notes: {
        label: "Poznámky (nepovinné)",
        placeholder: "Doplňující informace, kontext chyby..."
      }
    },
    actions: {
      cancel: "Zrušit",
      submit: "Odeslat hlášení",
      submitting: "Odesílám..."
    },
    validation: {
      required_fields: "Prosím vyplňte původní i opravený text.",
      texts_identical: "Původní a opravený text nemohou být stejné.",
      submit_error: "Nepodařilo se odeslat hlášení. Zkuste to prosím znovu."
    }
  },
  en: {
    header: {
      title: "Report Error"
    },
    form: {
      original_text: {
        label: "Original text (with error) *",
        placeholder: "Copy the part of text where you found the error..."
      },
      corrected_text: {
        label: "Corrected text *",
        placeholder: "Write the correct version of the text..."
      },
      severity: {
        label: "Severity level *",
        levels: {
          low: {
            label: "Minor error",
            description: "Typo"
          },
          medium: {
            label: "Grammar",
            description: "Grammar error"
          },
          high: {
            label: "Meaning",
            description: "Error in meaning"
          },
          critical: {
            label: "Critical",
            description: "Wrong information"
          }
        }
      },
      notes: {
        label: "Notes (optional)",
        placeholder: "Additional information, error context..."
      }
    },
    actions: {
      cancel: "Cancel",
      submit: "Submit Report",
      submitting: "Submitting..."
    },
    validation: {
      required_fields: "Please fill in both original and corrected text.",
      texts_identical: "Original and corrected text cannot be the same.",
      submit_error: "Failed to submit report. Please try again."
    }
  },
  es: {
    header: {
      title: "Reportar Error"
    },
    form: {
      original_text: {
        label: "Texto original (con error) *",
        placeholder: "Copie la parte del texto donde encontró el error..."
      },
      corrected_text: {
        label: "Texto corregido *",
        placeholder: "Escriba la versión correcta del texto..."
      },
      severity: {
        label: "Nivel de severidad *",
        levels: {
          low: {
            label: "Error menor",
            description: "Error tipográfico"
          },
          medium: {
            label: "Gramática",
            description: "Error gramatical"
          },
          high: {
            label: "Significado",
            description: "Error de significado"
          },
          critical: {
            label: "Crítico",
            description: "Información incorrecta"
          }
        }
      },
      notes: {
        label: "Notas (opcional)",
        placeholder: "Información adicional, contexto del error..."
      }
    },
    actions: {
      cancel: "Cancelar",
      submit: "Enviar Reporte",
      submitting: "Enviando..."
    },
    validation: {
      required_fields: "Por favor complete tanto el texto original como el corregido.",
      texts_identical: "El texto original y corregido no pueden ser iguales.",
      submit_error: "No se pudo enviar el reporte. Inténtelo de nuevo."
    }
  }
};