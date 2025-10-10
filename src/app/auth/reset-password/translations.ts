// Reset Password page translations
export interface ResetPasswordLayoutTranslations {
  securePassword: string;
  createStrong: string;
  securePasswordTitle: string;
  description: string;
  encryption256: string;
  bcryptHash: string;
  noPlainText: string;
  gdprCompliant: string;
  passwordTips: string;
  tip1: string;
  tip2: string;
  tip3: string;
  tip4: string;
  tip5: string;
  examplesTitle: string;
  securityReminder: string;
  securityReminderText: string;
}

export interface ResetPasswordTranslations {
  // Page loading fallback
  loadingReset: string;
  
  // Validating state
  verifyingLink: string;
  checkingValidity: string;
  
  // Manual verification
  enterCode: string;
  verifyCode: string;
  verifying: string;
  codeFromEmail: string;
  emailAddress: string;
  emailPlaceholder: string;
  codePlaceholder: string;
  linkExpiredManual: string;
  
  // Header
  setNewPassword: string;
  createSecurePassword: string;
  
  // Form labels
  newPassword: string;
  confirmPassword: string;
  passwordPlaceholder: string;
  
  // Password requirements
  passwordRequirements: string;
  minLength: string;
  lowercase: string;
  uppercase: string;
  number: string;
  specialChar: string;
  
  // Password strength
  passwordStrength: string;
  weak: string;
  medium: string;
  strong: string;
  
  // Buttons
  resetPassword: string;
  resetting: string;
  backToLogin: string;
  enterCodeManually: string;
  requestNewEmail: string;
  
  // Messages
  errorOccurred: string;
  passwordChanged: string;
  passwordChangedDesc: string;
  passwordsMatch: string;
  
  // Errors
  enterCodeAndEmail: string;
  sessionFailed: string;
  tokenExpired: string;
  invalidToken: string;
  passwordMinLength: string;
  passwordLowercase: string;
  passwordUppercase: string;
  passwordNumber: string;
  passwordSpecialChar: string;
  passwordMismatch: string;
  sessionExpired: string;
  autoValidationFailed: string;
  linkExpired: string;
  unknownError: string;
}

export const resetPasswordTranslations: Record<'sk' | 'cz' | 'en' | 'es', ResetPasswordTranslations> = {
  sk: {
    loadingReset: "Načítavam obnovu hesla...",
    
    verifyingLink: "Overujem odkaz 🔍",
    checkingValidity: "Kontrolujem platnosť vašeho odkazu...",
    
    enterCode: "Zadajte kód z emailu",
    verifyCode: "Overiť kód",
    verifying: "Overujem...",
    codeFromEmail: "Kód z emailu",
    emailAddress: "Emailová adresa",
    emailPlaceholder: "admin@example.com",
    codePlaceholder: "123456",
    linkExpiredManual: "Odkaz expiroval alebo je neplatný. Prosím, zadajte kód z emailu manuálne.",
    
    setNewPassword: "Nastavenie nového hesla 🔒",
    createSecurePassword: "Vytvorte si bezpečné nové heslo",
    
    newPassword: "Nové heslo",
    confirmPassword: "Potvrďte heslo",
    passwordPlaceholder: "••••••••",
    
    passwordRequirements: "Požiadavky na heslo:",
    minLength: "Minimálne 8 znakov",
    lowercase: "Malé písmeno (a-z)",
    uppercase: "Veľké písmeno (A-Z)",
    number: "Číslica (0-9)",
    specialChar: "Špeciálny znak (!@#$...)",
    
    passwordStrength: "Sila hesla:",
    weak: "Slabé",
    medium: "Stredné",
    strong: "Silné",
    
    resetPassword: "Nastaviť nové heslo",
    resetting: "Nastavujem...",
    backToLogin: "Späť na prihlásenie",
    enterCodeManually: "Zadať kód manuálne",
    requestNewEmail: "Požiadať o nový email",
    
    errorOccurred: "Vyskytla sa chyba",
    passwordChanged: "Heslo zmenené! ✓",
    passwordChangedDesc: "Heslo bolo úspešne zmenené! Môžete sa teraz prihlásiť s novým heslom.",
    passwordsMatch: "Heslá sa zhodujú",
    
    enterCodeAndEmail: "Prosím, zadajte kód aj email adresu.",
    sessionFailed: "Nepodarilo sa vytvoriť session.",
    tokenExpired: "Kód expiroval. Prosím, požiadajte o nový email na obnovenie hesla.",
    invalidToken: "Neplatný kód. Skontrolujte, že ste zadali správny kód z emailu.",
    passwordMinLength: "Heslo musí mať aspoň 8 znakov.",
    passwordLowercase: "Heslo musí obsahovať malé písmeno.",
    passwordUppercase: "Heslo musí obsahovať veľké písmeno.",
    passwordNumber: "Heslo musí obsahovať číslicu.",
    passwordSpecialChar: "Heslo musí obsahovať špeciálny znak.",
    passwordMismatch: "Heslá sa nezhodujú.",
    sessionExpired: "Session expirovala. Prosím, použite nový odkaz na obnovu hesla.",
    autoValidationFailed: "Automatická validácia zlyhala. Prosím, kliknite na \"Overiť kód\" nižšie.",
    linkExpired: "Link expiroval alebo je neplatný. Prosím, zadajte kód z emailu manuálne.",
    unknownError: "Nepodarilo sa zmeniť heslo. Skúste to znovu.",
  },
  
  cz: {
    loadingReset: "Načítám obnovu hesla...",
    
    verifyingLink: "Ověřuji odkaz 🔍",
    checkingValidity: "Kontroluji platnost vašeho odkazu...",
    
    enterCode: "Zadejte kód z emailu",
    verifyCode: "Ověřit kód",
    verifying: "Ověřuji...",
    codeFromEmail: "Kód z emailu",
    emailAddress: "Emailová adresa",
    emailPlaceholder: "admin@example.com",
    codePlaceholder: "123456",
    linkExpiredManual: "Odkaz expiroval nebo je neplatný. Prosím, zadejte kód z emailu manuálně.",
    
    setNewPassword: "Nastavení nového hesla 🔒",
    createSecurePassword: "Vytvořte si bezpečné nové heslo",
    
    newPassword: "Nové heslo",
    confirmPassword: "Potvrďte heslo",
    passwordPlaceholder: "••••••••",
    
    passwordRequirements: "Požadavky na heslo:",
    minLength: "Minimálně 8 znaků",
    lowercase: "Malé písmeno (a-z)",
    uppercase: "Velké písmeno (A-Z)",
    number: "Číslice (0-9)",
    specialChar: "Speciální znak (!@#$...)",
    
    passwordStrength: "Síla hesla:",
    weak: "Slabé",
    medium: "Střední",
    strong: "Silné",
    
    resetPassword: "Nastavit nové heslo",
    resetting: "Nastavuji...",
    backToLogin: "Zpět na přihlášení",
    enterCodeManually: "Zadat kód manuálně",
    requestNewEmail: "Požádat o nový email",
    
    errorOccurred: "Vyskytla se chyba",
    passwordChanged: "Heslo změněno! ✓",
    passwordChangedDesc: "Heslo bylo úspěšně změněno! Můžete se nyní přihlásit s novým heslem.",
    passwordsMatch: "Hesla se shodují",
    
    enterCodeAndEmail: "Prosím, zadejte kód i emailovou adresu.",
    sessionFailed: "Nepodařilo se vytvořit session.",
    tokenExpired: "Kód expiroval. Prosím, požádejte o nový email na obnovení hesla.",
    invalidToken: "Neplatný kód. Zkontrolujte, že jste zadali správný kód z emailu.",
    passwordMinLength: "Heslo musí mít alespoň 8 znaků.",
    passwordLowercase: "Heslo musí obsahovat malé písmeno.",
    passwordUppercase: "Heslo musí obsahovat velké písmeno.",
    passwordNumber: "Heslo musí obsahovat číslici.",
    passwordSpecialChar: "Heslo musí obsahovat speciální znak.",
    passwordMismatch: "Hesla se neshodují.",
    sessionExpired: "Session expirovala. Prosím, použijte nový odkaz na obnovu hesla.",
    autoValidationFailed: "Automatická validace selhala. Prosím, klikněte na \"Ověřit kód\" níže.",
    linkExpired: "Odkaz expiroval nebo je neplatný. Prosím, zadejte kód z emailu manuálně.",
    unknownError: "Nepodařilo se změnit heslo. Zkuste to znovu.",
  },
  
  en: {
    loadingReset: "Loading password reset...",
    
    verifyingLink: "Verifying link 🔍",
    checkingValidity: "Checking validity of your link...",
    
    enterCode: "Enter code from email",
    verifyCode: "Verify code",
    verifying: "Verifying...",
    codeFromEmail: "Code from email",
    emailAddress: "Email address",
    emailPlaceholder: "admin@example.com",
    codePlaceholder: "123456",
    linkExpiredManual: "Link has expired or is invalid. Please enter the code from the email manually.",
    
    setNewPassword: "Set New Password 🔒",
    createSecurePassword: "Create a secure new password",
    
    newPassword: "New password",
    confirmPassword: "Confirm password",
    passwordPlaceholder: "••••••••",
    
    passwordRequirements: "Password requirements:",
    minLength: "At least 8 characters",
    lowercase: "Lowercase letter (a-z)",
    uppercase: "Uppercase letter (A-Z)",
    number: "Number (0-9)",
    specialChar: "Special character (!@#$...)",
    
    passwordStrength: "Password strength:",
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
    
    resetPassword: "Set new password",
    resetting: "Setting...",
    backToLogin: "Back to login",
    enterCodeManually: "Enter code manually",
    requestNewEmail: "Request new email",
    
    errorOccurred: "An error occurred",
    passwordChanged: "Password changed! ✓",
    passwordChangedDesc: "Password has been successfully changed! You can now sign in with your new password.",
    passwordsMatch: "Passwords match",
    
    enterCodeAndEmail: "Please enter both code and email address.",
    sessionFailed: "Failed to create session.",
    tokenExpired: "Code has expired. Please request a new password reset email.",
    invalidToken: "Invalid code. Check that you entered the correct code from the email.",
    passwordMinLength: "Password must be at least 8 characters.",
    passwordLowercase: "Password must contain a lowercase letter.",
    passwordUppercase: "Password must contain an uppercase letter.",
    passwordNumber: "Password must contain a number.",
    passwordSpecialChar: "Password must contain a special character.",
    passwordMismatch: "Passwords do not match.",
    sessionExpired: "Session has expired. Please use a new password reset link.",
    autoValidationFailed: "Automatic validation failed. Please click \"Verify code\" below.",
    linkExpired: "Link has expired or is invalid. Please enter the code from email manually.",
    unknownError: "Failed to change password. Please try again.",
  },
  
  es: {
    loadingReset: "Cargando restablecimiento de contraseña...",
    
    verifyingLink: "Verificando enlace 🔍",
    checkingValidity: "Comprobando la validez de tu enlace...",
    
    enterCode: "Ingresa el código del correo",
    verifyCode: "Verificar código",
    verifying: "Verificando...",
    codeFromEmail: "Código del correo",
    emailAddress: "Dirección de correo",
    emailPlaceholder: "admin@example.com",
    codePlaceholder: "123456",
    linkExpiredManual: "El enlace ha expirado o no es válido. Por favor, ingresa el código del correo manualmente.",
    
    setNewPassword: "Establecer Nueva Contraseña 🔒",
    createSecurePassword: "Crea una nueva contraseña segura",
    
    newPassword: "Nueva contraseña",
    confirmPassword: "Confirmar contraseña",
    passwordPlaceholder: "••••••••",
    
    passwordRequirements: "Requisitos de contraseña:",
    minLength: "Al menos 8 caracteres",
    lowercase: "Letra minúscula (a-z)",
    uppercase: "Letra mayúscula (A-Z)",
    number: "Número (0-9)",
    specialChar: "Carácter especial (!@#$...)",
    
    passwordStrength: "Fuerza de contraseña:",
    weak: "Débil",
    medium: "Media",
    strong: "Fuerte",
    
    resetPassword: "Establecer nueva contraseña",
    resetting: "Estableciendo...",
    backToLogin: "Volver al inicio de sesión",
    enterCodeManually: "Ingresar código manualmente",
    requestNewEmail: "Solicitar nuevo correo",
    
    errorOccurred: "Ocurrió un error",
    passwordChanged: "¡Contraseña cambiada! ✓",
    passwordChangedDesc: "¡La contraseña se cambió exitosamente! Ahora puedes iniciar sesión con tu nueva contraseña.",
    passwordsMatch: "Las contraseñas coinciden",
    
    enterCodeAndEmail: "Por favor, ingresa tanto el código como la dirección de correo.",
    sessionFailed: "No se pudo crear la sesión.",
    tokenExpired: "El código ha expirado. Por favor, solicita un nuevo correo de restablecimiento.",
    invalidToken: "Código inválido. Verifica que ingresaste el código correcto del correo.",
    passwordMinLength: "La contraseña debe tener al menos 8 caracteres.",
    passwordLowercase: "La contraseña debe contener una letra minúscula.",
    passwordUppercase: "La contraseña debe contener una letra mayúscula.",
    passwordNumber: "La contraseña debe contener un número.",
    passwordSpecialChar: "La contraseña debe contener un carácter especial.",
    passwordMismatch: "Las contraseñas no coinciden.",
    sessionExpired: "La sesión ha expirado. Por favor, usa un nuevo enlace de restablecimiento.",
    autoValidationFailed: "La validación automática falló. Por favor, haz clic en \"Verificar código\" abajo.",
    linkExpired: "El enlace ha expirado o no es válido. Por favor, ingresa el código del correo manualmente.",
    unknownError: "No se pudo cambiar la contraseña. Por favor, inténtalo de nuevo.",
  },
};

export const resetPasswordLayoutTranslations: Record<'sk' | 'cz' | 'en' | 'es', ResetPasswordLayoutTranslations> = {
  sk: {
    securePassword: "Bezpečné heslo",
    createStrong: "Vytvorte si silné",
    securePasswordTitle: "a bezpečné heslo",
    description: "Vaše nové heslo bude chránené najmodernejšími bezpečnostnými štandardmi. Vytvorme spoločne heslo, ktoré bude silné a ľahko zapamätateľné.",
    encryption256: "256-bit AES šifrovanie",
    bcryptHash: "Bcrypt hash algoritmus",
    noPlainText: "Žiadne uloženie v plain texte",
    gdprCompliant: "GDPR compliant",
    passwordTips: "Tipy pre silné heslo",
    tip1: "💡 Použite kombináciu slov, ktoré si ľahko zapamätáte",
    tip2: "🔢 Pridajte číslice a špeciálne znaky",
    tip3: "📏 Minimálne 8 znakov, ideálne 12+",
    tip4: "🚫 Nepoužívajte osobné údaje (meno, dátum narodenia)",
    tip5: "🔄 Nepoužívajte rovnaké heslo na iných stránkach",
    examplesTitle: "Príklady dobrých hesiel:",
    securityReminder: "Bezpečnostné upozornenie",
    securityReminderText: "Po zmene hesla budete automaticky odhlásení. Prihláste sa znovu s novým heslom v aplikácii.",
  },
  cz: {
    securePassword: "Bezpečné heslo",
    createStrong: "Vytvořte si silné",
    securePasswordTitle: "a bezpečné heslo",
    description: "Vaše nové heslo bude chráněno nejmodernějšími bezpečnostními standardy. Vytvořme společně heslo, které bude silné a snadno zapamatovatelné.",
    encryption256: "256-bit AES šifrování",
    bcryptHash: "Bcrypt hash algoritmus",
    noPlainText: "Žádné uložení v plain textu",
    gdprCompliant: "GDPR compliant",
    passwordTips: "Tipy pro silné heslo",
    tip1: "💡 Použijte kombinaci slov, která si snadno zapamatujete",
    tip2: "🔢 Přidejte číslice a speciální znaky",
    tip3: "📏 Minimálně 8 znaků, ideálně 12+",
    tip4: "🚫 Nepoužívejte osobní údaje (jméno, datum narození)",
    tip5: "🔄 Nepoužívejte stejné heslo na jiných stránkách",
    examplesTitle: "Příklady dobrých hesel:",
    securityReminder: "Bezpečnostní upozornění",
    securityReminderText: "Po změně hesla budete automaticky odhlášeni. Přihlaste se znovu s novým heslem v aplikaci.",
  },
  en: {
    securePassword: "Secure Password",
    createStrong: "Create a strong",
    securePasswordTitle: "and secure password",
    description: "Your new password will be protected by the most modern security standards. Let's create a password that is strong and easy to remember.",
    encryption256: "256-bit AES encryption",
    bcryptHash: "Bcrypt hash algorithm",
    noPlainText: "No plain text storage",
    gdprCompliant: "GDPR compliant",
    passwordTips: "Tips for a strong password",
    tip1: "💡 Use a combination of words you can easily remember",
    tip2: "🔢 Add numbers and special characters",
    tip3: "📏 At least 8 characters, ideally 12+",
    tip4: "🚫 Don't use personal information (name, date of birth)",
    tip5: "🔄 Don't use the same password on other sites",
    examplesTitle: "Examples of good passwords:",
    securityReminder: "Security reminder",
    securityReminderText: "After changing your password, you will be automatically logged out. Sign in again with your new password in the app.",
  },
  es: {
    securePassword: "Contraseña Segura",
    createStrong: "Crea una",
    securePasswordTitle: "contraseña fuerte y segura",
    description: "Tu nueva contraseña estará protegida por los estándares de seguridad más modernos. Creemos juntos una contraseña que sea fuerte y fácil de recordar.",
    encryption256: "Cifrado AES de 256 bits",
    bcryptHash: "Algoritmo hash Bcrypt",
    noPlainText: "Sin almacenamiento en texto plano",
    gdprCompliant: "Cumple con GDPR",
    passwordTips: "Consejos para una contraseña fuerte",
    tip1: "💡 Usa una combinación de palabras que puedas recordar fácilmente",
    tip2: "🔢 Agrega números y caracteres especiales",
    tip3: "📏 Al menos 8 caracteres, idealmente 12+",
    tip4: "🚫 No uses información personal (nombre, fecha de nacimiento)",
    tip5: "🔄 No uses la misma contraseña en otros sitios",
    examplesTitle: "Ejemplos de buenas contraseñas:",
    securityReminder: "Recordatorio de seguridad",
    securityReminderText: "Después de cambiar tu contraseña, serás desconectado automáticamente. Inicia sesión nuevamente con tu nueva contraseña en la aplicación.",
  },
};
