// Auth Callback page translations
export interface CallbackTranslations {
  // Loading state
  completingLogin: string;
  verifyingPermissions: string;
  
  // Success state
  loginSuccessful: string;
  accountCreated: string;
  accountCreatedDesc: string;
  welcomeBack: string;
  redirecting: string;
  
  // Error state
  accessDenied: string;
  loginError: string;
  userInfoError: string;
  userRecordError: string;
  redirectingToLogin: string;
  
  // Error help section
  whatYouCanDo: string;
  contactAdmin: string;
  requestAdminRole: string;
  verifyCorrectAccount: string;
}

export const callbackTranslations: Record<'sk' | 'cz' | 'en' | 'es', CallbackTranslations> = {
  sk: {
    completingLogin: "Dokončovanie prihlásenia",
    verifyingPermissions: "Overujeme vaše oprávnenia...",
    
    loginSuccessful: "Prihlásenie úspešné! ✅",
    accountCreated: "Váš účet bol úspešne vytvorený!",
    accountCreatedDesc: "Váš účet bol úspešne vytvorený! Presmerovávame vás na hlavnú stránku.",
    welcomeBack: "Vitajte späť",
    redirecting: "Presmerovávame...",
    
    accessDenied: "Prístup zamietnutý ❌",
    loginError: "Chyba pri prihlasovaní",
    userInfoError: "Nepodarilo sa získať informácie o používateľovi",
    userRecordError: "Chyba pri vytváraní používateľského záznamu",
    redirectingToLogin: "Presmerovávame na login...",
    
    whatYouCanDo: "Čo môžete robiť:",
    contactAdmin: "Kontaktujte správcu systému",
    requestAdminRole: "Požiadajte o pridelenie admin role",
    verifyCorrectAccount: "Overte, že používate správny účet",
  },
  
  cz: {
    completingLogin: "Dokončování přihlášení",
    verifyingPermissions: "Ověřujeme vaše oprávnění...",
    
    loginSuccessful: "Přihlášení úspěšné! ✅",
    accountCreated: "Váš účet byl úspěšně vytvořen!",
    accountCreatedDesc: "Váš účet byl úspěšně vytvořen! Přesměrovávame vás na hlavní stránku.",
    welcomeBack: "Vítejte zpět",
    redirecting: "Přesměrovávame...",
    
    accessDenied: "Přístup zamítnut ❌",
    loginError: "Chyba při přihlašování",
    userInfoError: "Nepodařilo se získat informace o uživateli",
    userRecordError: "Chyba při vytváření uživatelského záznamu",
    redirectingToLogin: "Přesměrovávame na login...",
    
    whatYouCanDo: "Co můžete dělat:",
    contactAdmin: "Kontaktujte správce systému",
    requestAdminRole: "Požádejte o přidělení admin role",
    verifyCorrectAccount: "Ověřte, že používáte správný účet",
  },
  
  en: {
    completingLogin: "Completing login",
    verifyingPermissions: "Verifying your permissions...",
    
    loginSuccessful: "Login successful! ✅",
    accountCreated: "Your account has been successfully created!",
    accountCreatedDesc: "Your account has been successfully created! Redirecting you to the home page.",
    welcomeBack: "Welcome back",
    redirecting: "Redirecting...",
    
    accessDenied: "Access denied ❌",
    loginError: "Login error",
    userInfoError: "Failed to get user information",
    userRecordError: "Error creating user record",
    redirectingToLogin: "Redirecting to login...",
    
    whatYouCanDo: "What you can do:",
    contactAdmin: "Contact system administrator",
    requestAdminRole: "Request admin role assignment",
    verifyCorrectAccount: "Verify you are using the correct account",
  },
  
  es: {
    completingLogin: "Completando inicio de sesión",
    verifyingPermissions: "Verificando tus permisos...",
    
    loginSuccessful: "¡Inicio de sesión exitoso! ✅",
    accountCreated: "¡Tu cuenta ha sido creada exitosamente!",
    accountCreatedDesc: "¡Tu cuenta ha sido creada exitosamente! Te redirigimos a la página principal.",
    welcomeBack: "Bienvenido de nuevo",
    redirecting: "Redirigiendo...",
    
    accessDenied: "Acceso denegado ❌",
    loginError: "Error al iniciar sesión",
    userInfoError: "No se pudo obtener información del usuario",
    userRecordError: "Error al crear registro de usuario",
    redirectingToLogin: "Redirigiendo al login...",
    
    whatYouCanDo: "Qué puedes hacer:",
    contactAdmin: "Contacta al administrador del sistema",
    requestAdminRole: "Solicita la asignación de rol admin",
    verifyCorrectAccount: "Verifica que estás usando la cuenta correcta",
  },
};
