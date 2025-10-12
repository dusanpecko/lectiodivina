// src/app/profile/translations.ts
import { Language } from "../components/LanguageProvider";

export interface ProfileTranslations {
  header: {
    title: string;
    description: string;
  };
  loading: {
    title: string;
    checking_access: string;
  };
  sections: {
    profile_info: {
      title: string;
      change_avatar: string;
      full_name: string;
      full_name_placeholder: string;
      save_changes: string;
      saving: string;
    };
    account_info: {
      title: string;
      email_address: string;
      registration_date: string;
      user_role: string;
      role_loading: string;
    };
    notifications: {
      title: string;
      description: string;
      loading: string;
      error_loading: string;
      subscribe_all: string;
      unsubscribe_all: string;
      total_subscribed: string;
      no_topics_available: string;
      category: {
        spiritual: string;
        educational: string;
        news: string;
        events: string;
        other: string;
      };
      topic_card: {
        subscribed: string;
        subscribe: string;
        unsubscribe: string;
        default_topic: string;
      };
      messages: {
        subscribed_success: string;
        unsubscribed_success: string;
        subscribe_error: string;
        unsubscribe_error: string;
        bulk_subscribe_success: string;
        bulk_unsubscribe_success: string;
      };
    };
    security: {
      title: string;
      password_change: {
        title: string;
        description: string;
        button: string;
      };
      logout: {
        title: string;
        description: string;
        button: string;
      };
      delete_account: {
        title: string;
        description: string;
        button: string;
      };
    };
  };
  footer: {
    help_text: string;
    contact_us: string;
  };
  validation: {
    name_required: string;
    password_min_length: string;
    passwords_not_match: string;
    password_same_as_current: string;
    wrong_current_password: string;
    delete_confirmation_text: string;
    delete_confirmation_required: string;
  };
  messages: {
    profile_saved: string;
    avatar_changed: string;
    password_changed: string;
    account_deleted: string;
    save_error: string;
    avatar_error: string;
    password_error: string;
    delete_error: string;
  };
  dialogs: {
    change_password: {
      title: string;
      current_password: string;
      new_password: string;
      confirm_password: string;
      cancel: string;
      change: string;
      changing: string;
    };
    delete_account: {
      title: string;
      warning_title: string;
      warning_text: string;
      confirmation_label: string;
      confirmation_text: string;
      what_will_be_deleted: string;
      deletion_list: {
        profile: string;
        avatar: string;
        data: string;
        admin_access: string;
      };
      cancel: string;
      delete: string;
      deleting: string;
    };
    logout: {
      title: string;
      message: string;
      cancel: string;
      logout: string;
    };
    avatar_picker: {
      title: string;
      select_image: string;
      cancel: string;
      upload: string;
      uploading: string;
    };
  };
}

export const profileTranslations: Record<Language, ProfileTranslations> = {
  sk: {
    header: {
      title: "Môj profil",
      description: "Spravujte svoje údaje a nastavenia"
    },
    loading: {
      title: "Načítavam profil",
      checking_access: "Overujem prístup..."
    },
    sections: {
      profile_info: {
        title: "Profilové informácie",
        change_avatar: "Zmeniť avatar",
        full_name: "Celé meno",
        full_name_placeholder: "Zadajte svoje meno",
        save_changes: "Uložiť zmeny",
        saving: "Ukladá sa..."
      },
      account_info: {
        title: "Informácie o účte",
        email_address: "Emailová adresa",
        registration_date: "Dátum registrácie",
        user_role: "Používateľská rola",
        role_loading: "Načítava sa..."
      },
      notifications: {
        title: "Notifikácie",
        description: "Spravujte svoje nastavenia pre push notifikácie a emaily",
        loading: "Načítavam témy notifikácií...",
        error_loading: "Chyba pri načítaní nastavení notifikácií",
        subscribe_all: "Prihlásiť sa na všetky",
        unsubscribe_all: "Odhlásiť sa zo všetkých",
        total_subscribed: "Prihlásené témy",
        no_topics_available: "Momentálne nie sú k dispozícii žiadne témy notifikácií",
        category: {
          spiritual: "Duchovné",
          educational: "Vzdelávacie",
          news: "Novinky",
          events: "Podujatia",
          other: "Ostatné"
        },
        topic_card: {
          subscribed: "Prihlásené",
          subscribe: "Prihlásiť sa",
          unsubscribe: "Odhlásiť sa",
          default_topic: "Predvolená téma"
        },
        messages: {
          subscribed_success: "Úspešne ste sa prihlásili na tému",
          unsubscribed_success: "Úspešne ste sa odhlásili z témy",
          subscribe_error: "Chyba pri prihlásení na tému",
          unsubscribe_error: "Chyba pri odhlásení z témy",
          bulk_subscribe_success: "Úspešne ste sa prihlásili na všetky témy",
          bulk_unsubscribe_success: "Úspešne ste sa odhlásili zo všetkých tém"
        }
      },
      security: {
        title: "Bezpečnosť",
        password_change: {
          title: "Zmena hesla",
          description: "Pravidelne si meňte heslo pre lepšiu bezpečnosť vašeho účtu.",
          button: "Zmeniť heslo"
        },
        logout: {
          title: "Odhlásiť sa",
          description: "Odhláste sa zo svojho účtu, ak používate zdieľané zariadenie.",
          button: "Odhlásiť sa"
        },
        delete_account: {
          title: "Odstrániť účet",
          description: "Trvale odstránite svoj účet a všetky súvisiace údaje.",
          button: "Odstrániť účet"
        }
      }
    },
    footer: {
      help_text: "Potrebujete pomoc s nastavením profilu?",
      contact_us: "Kontaktujte nás"
    },
    validation: {
      name_required: "Meno je povinné",
      password_min_length: "Nové heslo musí mať minimálne 6 znakov",
      passwords_not_match: "Heslá sa nezhodujú",
      password_same_as_current: "Nové heslo nemôže byť rovnaké ako aktuálne",
      wrong_current_password: "Nesprávne aktuálne heslo",
      delete_confirmation_text: "ODSTRÁNIŤ",
      delete_confirmation_required: "Potvrďte zmazanie zadaním textu \"ODSTRÁNIŤ\""
    },
    messages: {
      profile_saved: "Profil bol úspešne uložený",
      avatar_changed: "Avatar bol úspešne zmenený",
      password_changed: "Heslo bolo úspešne zmenené",
      account_deleted: "Účet bol úspešne odstránený",
      save_error: "Chyba pri ukladaní",
      avatar_error: "Chyba pri nahrávaní avatara",
      password_error: "Chyba",
      delete_error: "Chyba pri odstraňovaní účtu"
    },
    dialogs: {
      change_password: {
        title: "Zmena hesla",
        current_password: "Aktuálne heslo",
        new_password: "Nové heslo",
        confirm_password: "Potvrdiť heslo",
        cancel: "Zrušiť",
        change: "Zmeniť heslo",
        changing: "Mením heslo..."
      },
      delete_account: {
        title: "Odstrániť účet",
        warning_title: "Varovanie!",
        warning_text: "Táto akcia je nezvratná. Váš účet a všetky súvisiace údaje budú trvale odstránené.",
        confirmation_label: "Pre potvrdenie napíšte:",
        confirmation_text: "ODSTRÁNIŤ",
        what_will_be_deleted: "Čo sa odstráni:",
        deletion_list: {
          profile: "Váš používateľský profil",
          avatar: "Profilový obrázok",
          data: "Všetky súvisiace údaje",
          admin_access: "Prístup k administrácii"
        },
        cancel: "Zrušiť",
        delete: "Odstrániť účet",
        deleting: "Odstraňujem účet..."
      },
      logout: {
        title: "Odhlásiť sa",
        message: "Naozaj sa chcete odhlásiť zo svojho účtu?",
        cancel: "Zrušiť",
        logout: "Odhlásiť sa"
      },
      avatar_picker: {
        title: "Zmeniť avatar",
        select_image: "Vyberte obrázok",
        cancel: "Zrušiť",
        upload: "Nahrať",
        uploading: "Nahrávam..."
      }
    }
  },
  cz: {
    header: {
      title: "Můj profil",
      description: "Spravujte své údaje a nastavení"
    },
    loading: {
      title: "Načítám profil",
      checking_access: "Ověřuji přístup..."
    },
    sections: {
      profile_info: {
        title: "Profilové informace",
        change_avatar: "Změnit avatar",
        full_name: "Celé jméno",
        full_name_placeholder: "Zadejte své jméno",
        save_changes: "Uložit změny",
        saving: "Ukládám..."
      },
      account_info: {
        title: "Informace o účtu",
        email_address: "E-mailová adresa",
        registration_date: "Datum registrace",
        user_role: "Uživatelská role",
        role_loading: "Načítám..."
      },
      notifications: {
        title: "Oznámení",
        description: "Spravujte své nastavení pro push oznámení a e-maily",
        loading: "Načítám témata oznámení...",
        error_loading: "Chyba při načítání nastavení oznámení",
        subscribe_all: "Přihlásit se ke všem",
        unsubscribe_all: "Odhlásit se ze všech",
        total_subscribed: "Přihlášená témata",
        no_topics_available: "Momentálně nejsou k dispozici žádná témata oznámení",
        category: {
          spiritual: "Duchovní",
          educational: "Vzdělávací",
          news: "Novinky",
          events: "Události",
          other: "Ostatní"
        },
        topic_card: {
          subscribed: "Přihlášeno",
          subscribe: "Přihlásit se",
          unsubscribe: "Odhlásit se",
          default_topic: "Výchozí téma"
        },
        messages: {
          subscribed_success: "Úspěšně jste se přihlásili k tématu",
          unsubscribed_success: "Úspěšně jste se odhlásili z tématu",
          subscribe_error: "Chyba při přihlášení k tématu",
          unsubscribe_error: "Chyba při odhlášení z tématu",
          bulk_subscribe_success: "Úspěšně jste se přihlásili ke všem tématům",
          bulk_unsubscribe_success: "Úspěšně jste se odhlásili ze všech témat"
        }
      },
      security: {
        title: "Bezpečnost",
        password_change: {
          title: "Změna hesla",
          description: "Pravidelně si měňte heslo pro lepší bezpečnost vašeho účtu.",
          button: "Změnit heslo"
        },
        logout: {
          title: "Odhlásit se",
          description: "Odhlaste se ze svého účtu, pokud používáte sdílené zařízení.",
          button: "Odhlásit se"
        },
        delete_account: {
          title: "Odstranit účet",
          description: "Trvale odstraníte svůj účet a všechna související data.",
          button: "Odstranit účet"
        }
      }
    },
    footer: {
      help_text: "Potřebujete pomoc s nastavením profilu?",
      contact_us: "Kontaktujte nás"
    },
    validation: {
      name_required: "Jméno je povinné",
      password_min_length: "Nové heslo musí mít minimálně 6 znaků",
      passwords_not_match: "Hesla se neshodují",
      password_same_as_current: "Nové heslo nemůže být stejné jako současné",
      wrong_current_password: "Nesprávné současné heslo",
      delete_confirmation_text: "ODSTRANIT",
      delete_confirmation_required: "Potvrďte smazání zadáním textu \"ODSTRANIT\""
    },
    messages: {
      profile_saved: "Profil byl úspěšně uložen",
      avatar_changed: "Avatar byl úspěšně změněn",
      password_changed: "Heslo bylo úspěšně změněno",
      account_deleted: "Účet byl úspěšně odstraněn",
      save_error: "Chyba při ukládání",
      avatar_error: "Chyba při nahrávání avataru",
      password_error: "Chyba",
      delete_error: "Chyba při odstraňování účtu"
    },
    dialogs: {
      change_password: {
        title: "Změna hesla",
        current_password: "Současné heslo",
        new_password: "Nové heslo",
        confirm_password: "Potvrdit heslo",
        cancel: "Zrušit",
        change: "Změnit heslo",
        changing: "Měním heslo..."
      },
      delete_account: {
        title: "Odstranit účet",
        warning_title: "Varování!",
        warning_text: "Tato akce je nevratná. Váš účet a všechna související data budou trvale odstraněna.",
        confirmation_label: "Pro potvrzení napište:",
        confirmation_text: "ODSTRANIT",
        what_will_be_deleted: "Co bude odstraněno:",
        deletion_list: {
          profile: "Váš uživatelský profil",
          avatar: "Profilový obrázek",
          data: "Všechna související data",
          admin_access: "Přístup k administraci"
        },
        cancel: "Zrušit",
        delete: "Odstranit účet",
        deleting: "Odstraňujem účet..."
      },
      logout: {
        title: "Odhlásit se",
        message: "Opravdu se chcete odhlásit ze svého účtu?",
        cancel: "Zrušit",
        logout: "Odhlásit se"
      },
      avatar_picker: {
        title: "Změnit avatar",
        select_image: "Vyberte obrázek",
        cancel: "Zrušit",
        upload: "Nahrát",
        uploading: "Nahrávám..."
      }
    }
  },
  en: {
    header: {
      title: "My Profile",
      description: "Manage your data and settings"
    },
    loading: {
      title: "Loading profile",
      checking_access: "Verifying access..."
    },
    sections: {
      profile_info: {
        title: "Profile Information",
        change_avatar: "Change Avatar",
        full_name: "Full Name",
        full_name_placeholder: "Enter your name",
        save_changes: "Save Changes",
        saving: "Saving..."
      },
      account_info: {
        title: "Account Information",
        email_address: "Email Address",
        registration_date: "Registration Date",
        user_role: "User Role",
        role_loading: "Loading..."
      },
      notifications: {
        title: "Notifications",
        description: "Manage your push notification and email settings",
        loading: "Loading notification topics...",
        error_loading: "Error loading notification settings",
        subscribe_all: "Subscribe to all",
        unsubscribe_all: "Unsubscribe from all",
        total_subscribed: "Subscribed topics",
        no_topics_available: "No notification topics are currently available",
        category: {
          spiritual: "Spiritual",
          educational: "Educational",
          news: "News",
          events: "Events",
          other: "Other"
        },
        topic_card: {
          subscribed: "Subscribed",
          subscribe: "Subscribe",
          unsubscribe: "Unsubscribe",
          default_topic: "Default topic"
        },
        messages: {
          subscribed_success: "Successfully subscribed to topic",
          unsubscribed_success: "Successfully unsubscribed from topic",
          subscribe_error: "Error subscribing to topic",
          unsubscribe_error: "Error unsubscribing from topic",
          bulk_subscribe_success: "Successfully subscribed to all topics",
          bulk_unsubscribe_success: "Successfully unsubscribed from all topics"
        }
      },
      security: {
        title: "Security",
        password_change: {
          title: "Password Change",
          description: "Regularly change your password for better security of your account.",
          button: "Change Password"
        },
        logout: {
          title: "Sign Out",
          description: "Sign out from your account if you're using a shared device.",
          button: "Sign Out"
        },
        delete_account: {
          title: "Delete Account",
          description: "Permanently delete your account and all related data.",
          button: "Delete Account"
        }
      }
    },
    footer: {
      help_text: "Need help with profile settings?",
      contact_us: "Contact Us"
    },
    validation: {
      name_required: "Name is required",
      password_min_length: "New password must be at least 6 characters",
      passwords_not_match: "Passwords do not match",
      password_same_as_current: "New password cannot be the same as current",
      wrong_current_password: "Incorrect current password",
      delete_confirmation_text: "DELETE",
      delete_confirmation_required: "Confirm deletion by typing \"DELETE\""
    },
    messages: {
      profile_saved: "Profile was successfully saved",
      avatar_changed: "Avatar was successfully changed",
      password_changed: "Password was successfully changed",
      account_deleted: "Account was successfully deleted",
      save_error: "Error saving",
      avatar_error: "Error uploading avatar",
      password_error: "Error",
      delete_error: "Error deleting account"
    },
    dialogs: {
      change_password: {
        title: "Change Password",
        current_password: "Current Password",
        new_password: "New Password",
        confirm_password: "Confirm Password",
        cancel: "Cancel",
        change: "Change Password",
        changing: "Changing password..."
      },
      delete_account: {
        title: "Delete Account",
        warning_title: "Warning!",
        warning_text: "This action is irreversible. Your account and all related data will be permanently deleted.",
        confirmation_label: "To confirm, type:",
        confirmation_text: "DELETE",
        what_will_be_deleted: "What will be deleted:",
        deletion_list: {
          profile: "Your user profile",
          avatar: "Profile picture",
          data: "All related data",
          admin_access: "Access to administration"
        },
        cancel: "Cancel",
        delete: "Delete Account",
        deleting: "Deleting account..."
      },
      logout: {
        title: "Sign Out",
        message: "Do you really want to sign out from your account?",
        cancel: "Cancel",
        logout: "Sign Out"
      },
      avatar_picker: {
        title: "Change Avatar",
        select_image: "Select Image",
        cancel: "Cancel",
        upload: "Upload",
        uploading: "Uploading..."
      }
    }
  },
  es: {
    header: {
      title: "Mi Perfil",
      description: "Gestiona tus datos y configuración"
    },
    loading: {
      title: "Cargando perfil",
      checking_access: "Verificando acceso..."
    },
    sections: {
      profile_info: {
        title: "Información del Perfil",
        change_avatar: "Cambiar Avatar",
        full_name: "Nombre Completo",
        full_name_placeholder: "Ingresa tu nombre",
        save_changes: "Guardar Cambios",
        saving: "Guardando..."
      },
      account_info: {
        title: "Información de la Cuenta",
        email_address: "Dirección de Correo",
        registration_date: "Fecha de Registro",
        user_role: "Rol de Usuario",
        role_loading: "Cargando..."
      },
      notifications: {
        title: "Notificaciones",
        description: "Gestiona tus configuraciones de push notifications y correos",
        loading: "Cargando temas de notificaciones...",
        error_loading: "Error al cargar configuraciones de notificación",
        subscribe_all: "Suscribirse a todos",
        unsubscribe_all: "Desuscribirse de todos",
        total_subscribed: "Temas suscritos",
        no_topics_available: "No hay temas de notificación disponibles actualmente",
        category: {
          spiritual: "Espiritual",
          educational: "Educativo",
          news: "Noticias",
          events: "Eventos",
          other: "Otros"
        },
        topic_card: {
          subscribed: "Suscrito",
          subscribe: "Suscribirse",
          unsubscribe: "Desuscribirse",
          default_topic: "Tema predeterminado"
        },
        messages: {
          subscribed_success: "Suscrito exitosamente al tema",
          unsubscribed_success: "Desuscrito exitosamente del tema",
          subscribe_error: "Error al suscribirse al tema",
          unsubscribe_error: "Error al desuscribirse del tema",
          bulk_subscribe_success: "Suscrito exitosamente a todos los temas",
          bulk_unsubscribe_success: "Desuscrito exitosamente de todos los temas"
        }
      },
      security: {
        title: "Seguridad",
        password_change: {
          title: "Cambio de Contraseña",
          description: "Cambia regularmente tu contraseña para mejor seguridad de tu cuenta.",
          button: "Cambiar Contraseña"
        },
        logout: {
          title: "Cerrar Sesión",
          description: "Cierra sesión de tu cuenta si estás usando un dispositivo compartido.",
          button: "Cerrar Sesión"
        },
        delete_account: {
          title: "Eliminar Cuenta",
          description: "Elimina permanentemente tu cuenta y todos los datos relacionados.",
          button: "Eliminar Cuenta"
        }
      }
    },
    footer: {
      help_text: "¿Necesitas ayuda con la configuración del perfil?",
      contact_us: "Contáctanos"
    },
    validation: {
      name_required: "El nombre es obligatorio",
      password_min_length: "La nueva contraseña debe tener al menos 6 caracteres",
      passwords_not_match: "Las contraseñas no coinciden",
      password_same_as_current: "La nueva contraseña no puede ser igual a la actual",
      wrong_current_password: "Contraseña actual incorrecta",
      delete_confirmation_text: "ELIMINAR",
      delete_confirmation_required: "Confirma la eliminación escribiendo \"ELIMINAR\""
    },
    messages: {
      profile_saved: "El perfil se guardó exitosamente",
      avatar_changed: "El avatar se cambió exitosamente",
      password_changed: "La contraseña se cambió exitosamente",
      account_deleted: "La cuenta se eliminó exitosamente",
      save_error: "Error al guardar",
      avatar_error: "Error al subir avatar",
      password_error: "Error",
      delete_error: "Error al eliminar cuenta"
    },
    dialogs: {
      change_password: {
        title: "Cambiar Contraseña",
        current_password: "Contraseña Actual",
        new_password: "Nueva Contraseña",
        confirm_password: "Confirmar Contraseña",
        cancel: "Cancelar",
        change: "Cambiar Contraseña",
        changing: "Cambiando contraseña..."
      },
      delete_account: {
        title: "Eliminar Cuenta",
        warning_title: "¡Advertencia!",
        warning_text: "Esta acción es irreversible. Tu cuenta y todos los datos relacionados serán eliminados permanentemente.",
        confirmation_label: "Para confirmar, escribe:",
        confirmation_text: "ELIMINAR",
        what_will_be_deleted: "Qué se eliminará:",
        deletion_list: {
          profile: "Tu perfil de usuario",
          avatar: "Imagen de perfil",
          data: "Todos los datos relacionados",
          admin_access: "Acceso a la administración"
        },
        cancel: "Cancelar",
        delete: "Eliminar Cuenta",
        deleting: "Eliminando cuenta..."
      },
      logout: {
        title: "Cerrar Sesión",
        message: "¿Realmente quieres cerrar sesión de tu cuenta?",
        cancel: "Cancelar",
        logout: "Cerrar Sesión"
      },
      avatar_picker: {
        title: "Cambiar Avatar",
        select_image: "Seleccionar Imagen",
        cancel: "Cancelar",
        upload: "Subir",
        uploading: "Subiendo..."
      }
    }
  }
};