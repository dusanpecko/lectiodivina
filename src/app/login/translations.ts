// Login page translations
export interface LoginTranslations {
  // Layout - Welcome section
  welcomeBackTo: string;
  lectioDivina: string;
  continueJourney: string;
  dailyReadingsTitle: string;
  dailyReadingsDesc: string;
  personalNotesTitle: string;
  personalNotesDesc: string;
  prayerGuideTitle: string;
  prayerGuideDesc: string;
  
  // Headers
  welcomeBack: string;
  createAccount: string;
  loginSubtitle: string;
  registerSubtitle: string;
  
  // Loading
  loadingLogin: string;
  checkingAccount: string;
  
  // Form labels
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  rememberMe: string;
  forgotPassword: string;
  
  // Placeholders
  fullNamePlaceholder: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  
  // Buttons
  login: string;
  register: string;
  loggingIn: string;
  registering: string;
  continueWithGoogle: string;
  useEmail: string;
  
  // Login type tabs
  emailTab: string;
  socialTab: string;
  
  // Messages
  success: string;
  loginError: string;
  registrationSuccess: string;
  passwordMismatch: string;
  passwordMinLength: string;
  unknownError: string;
  supabaseUnavailable: string;
  userVerificationFailed: string;
  
  // Toggle between login/register
  alreadyHaveAccount: string;
  signInHere: string;
  noAccount: string;
  registerHere: string;
  
  // Divider
  or: string;
  
  // Footer
  securedConnection: string;
  byLoggingIn: string;
  termsOfService: string;
  and: string;
  privacyPolicy: string;
}

export const loginTranslations: Record<'sk' | 'cz' | 'en' | 'es', LoginTranslations> = {
  sk: {
    welcomeBackTo: "Vitajte späť v",
    lectioDivina: "Lectio Divina",
    continueJourney: "Pokračujte vo svojej duchovnej ceste s dennými čítaniami, modlitbami a meditáciami.",
    dailyReadingsTitle: "Denné čítania",
    dailyReadingsDesc: "Prístup k liturgickým čítaniam každý deň",
    personalNotesTitle: "Osobné poznámky",
    personalNotesDesc: "Zaznamenávajte si svoje duchovné úvahy",
    prayerGuideTitle: "Sprievodca modlitbou",
    prayerGuideDesc: "Kroky Lectio Divina a ruženec",
    
    welcomeBack: "Vitajte späť",
    createAccount: "Vytvorte si účet",
    loginSubtitle: "Prihláste sa do vášho účtu",
    registerSubtitle: "Zaregistrujte sa a začnite svoju duchovnú cestu",
    
    loadingLogin: "Načítavam prihlásenie",
    checkingAccount: "Kontrolujem váš účet...",
    
    fullName: "Celé meno",
    email: "Emailová adresa",
    password: "Heslo",
    confirmPassword: "Potvrďte heslo",
    rememberMe: "Zapamätať si ma",
    forgotPassword: "Zabudli ste heslo?",
    
    fullNamePlaceholder: "Ján Novák",
    emailPlaceholder: "admin@example.com",
    passwordPlaceholder: "••••••••",
    
    login: "Prihlásiť sa",
    register: "Registrovať sa",
    loggingIn: "Prihlasovanie...",
    registering: "Registrácia...",
    continueWithGoogle: "Pokračovať s Google",
    useEmail: "Použiť email",
    
    emailTab: "Email",
    socialTab: "Sociálne siete",
    
    success: "Úspech!",
    loginError: "Chyba prihlásenia",
    registrationSuccess: "Registrácia bola úspešná! Skontrolujte si email pre overenie účtu.",
    passwordMismatch: "Heslá sa nezhodujú",
    passwordMinLength: "Heslo musí mať minimálne 6 znakov",
    unknownError: "Neznáma chyba",
    supabaseUnavailable: "Supabase client nie je dostupný",
    userVerificationFailed: "Nepodarilo sa overiť používateľa.",
    
    alreadyHaveAccount: "Už máte účet?",
    signInHere: "Prihláste sa",
    noAccount: "Nemáte účet?",
    registerHere: "Zaregistrujte sa",
    
    or: "alebo",
    
    securedConnection: "Zabezpečené SSL pripojenie",
    byLoggingIn: "Prihlásením súhlasíte s našimi",
    termsOfService: "podmienkami používania",
    and: "a",
    privacyPolicy: "ochranou osobných údajov",
  },
  
  cz: {
    welcomeBackTo: "Vítejte zpět v",
    lectioDivina: "Lectio Divina",
    continueJourney: "Pokračujte ve své duchovní cestě s denními čteními, modlitbami a meditacemi.",
    dailyReadingsTitle: "Denní čtení",
    dailyReadingsDesc: "Přístup k liturgickým čtením každý den",
    personalNotesTitle: "Osobní poznámky",
    personalNotesDesc: "Zaznamenávejte si své duchovní úvahy",
    prayerGuideTitle: "Průvodce modlitbou",
    prayerGuideDesc: "Kroky Lectio Divina a růženec",
    
    welcomeBack: "Vítejte zpět",
    createAccount: "Vytvořte si účet",
    loginSubtitle: "Přihlaste se do svého účtu",
    registerSubtitle: "Zaregistrujte se a začněte svou duchovní cestu",
    
    loadingLogin: "Načítám přihlášení",
    checkingAccount: "Kontroluji váš účet...",
    
    fullName: "Celé jméno",
    email: "Emailová adresa",
    password: "Heslo",
    confirmPassword: "Potvrďte heslo",
    rememberMe: "Zapamatovat si mě",
    forgotPassword: "Zapomněli jste heslo?",
    
    fullNamePlaceholder: "Jan Novák",
    emailPlaceholder: "admin@example.com",
    passwordPlaceholder: "••••••••",
    
    login: "Přihlásit se",
    register: "Zaregistrovat se",
    loggingIn: "Přihlašování...",
    registering: "Registrace...",
    continueWithGoogle: "Pokračovat s Google",
    useEmail: "Použít email",
    
    emailTab: "Email",
    socialTab: "Sociální sítě",
    
    success: "Úspěch!",
    loginError: "Chyba přihlášení",
    registrationSuccess: "Registrace byla úspěšná! Zkontrolujte si email pro ověření účtu.",
    passwordMismatch: "Hesla se neshodují",
    passwordMinLength: "Heslo musí mít minimálně 6 znaků",
    unknownError: "Neznámá chyba",
    supabaseUnavailable: "Supabase client není dostupný",
    userVerificationFailed: "Nepodařilo se ověřit uživatele.",
    
    alreadyHaveAccount: "Již máte účet?",
    signInHere: "Přihlaste se",
    noAccount: "Nemáte účet?",
    registerHere: "Zaregistrujte se",
    
    or: "nebo",
    
    securedConnection: "Zabezpečené SSL připojení",
    byLoggingIn: "Přihlášením souhlasíte s našimi",
    termsOfService: "podmínkami používání",
    and: "a",
    privacyPolicy: "ochranou osobních údajů",
  },
  
  en: {
    welcomeBackTo: "Welcome back to",
    lectioDivina: "Lectio Divina",
    continueJourney: "Continue your spiritual journey with daily readings, prayers, and meditations.",
    dailyReadingsTitle: "Daily Readings",
    dailyReadingsDesc: "Access to liturgical readings every day",
    personalNotesTitle: "Personal Notes",
    personalNotesDesc: "Record your spiritual reflections",
    prayerGuideTitle: "Prayer Guide",
    prayerGuideDesc: "Lectio Divina steps and rosary",
    
    welcomeBack: "Welcome Back",
    createAccount: "Create Account",
    loginSubtitle: "Sign in to your account",
    registerSubtitle: "Register and start your spiritual journey",
    
    loadingLogin: "Loading login",
    checkingAccount: "Checking your account...",
    
    fullName: "Full Name",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    
    fullNamePlaceholder: "John Doe",
    emailPlaceholder: "admin@example.com",
    passwordPlaceholder: "••••••••",
    
    login: "Sign In",
    register: "Register",
    loggingIn: "Signing in...",
    registering: "Registering...",
    continueWithGoogle: "Continue with Google",
    useEmail: "Use email",
    
    emailTab: "Email",
    socialTab: "Social Networks",
    
    success: "Success!",
    loginError: "Login Error",
    registrationSuccess: "Registration successful! Check your email to verify your account.",
    passwordMismatch: "Passwords do not match",
    passwordMinLength: "Password must be at least 6 characters",
    unknownError: "Unknown error",
    supabaseUnavailable: "Supabase client is not available",
    userVerificationFailed: "Failed to verify user.",
    
    alreadyHaveAccount: "Already have an account?",
    signInHere: "Sign in",
    noAccount: "Don't have an account?",
    registerHere: "Register",
    
    or: "or",
    
    securedConnection: "Secured SSL connection",
    byLoggingIn: "By logging in you agree to our",
    termsOfService: "terms of service",
    and: "and",
    privacyPolicy: "privacy policy",
  },
  
  es: {
    welcomeBackTo: "Bienvenido de nuevo a",
    lectioDivina: "Lectio Divina",
    continueJourney: "Continúa tu viaje espiritual con lecturas, oraciones y meditaciones diarias.",
    dailyReadingsTitle: "Lecturas diarias",
    dailyReadingsDesc: "Acceso a lecturas litúrgicas todos los días",
    personalNotesTitle: "Notas personales",
    personalNotesDesc: "Registra tus reflexiones espirituales",
    prayerGuideTitle: "Guía de oración",
    prayerGuideDesc: "Pasos de Lectio Divina y rosario",
    
    welcomeBack: "Bienvenido de nuevo",
    createAccount: "Crear cuenta",
    loginSubtitle: "Inicia sesión en tu cuenta",
    registerSubtitle: "Regístrate y comienza tu viaje espiritual",
    
    loadingLogin: "Cargando inicio de sesión",
    checkingAccount: "Verificando tu cuenta...",
    
    fullName: "Nombre completo",
    email: "Dirección de correo",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    rememberMe: "Recuérdame",
    forgotPassword: "¿Olvidaste tu contraseña?",
    
    fullNamePlaceholder: "Juan Pérez",
    emailPlaceholder: "admin@example.com",
    passwordPlaceholder: "••••••••",
    
    login: "Iniciar sesión",
    register: "Registrarse",
    loggingIn: "Iniciando sesión...",
    registering: "Registrando...",
    continueWithGoogle: "Continuar con Google",
    useEmail: "Usar correo electrónico",
    
    emailTab: "Correo",
    socialTab: "Redes sociales",
    
    success: "¡Éxito!",
    loginError: "Error de inicio de sesión",
    registrationSuccess: "¡Registro exitoso! Revisa tu correo para verificar tu cuenta.",
    passwordMismatch: "Las contraseñas no coinciden",
    passwordMinLength: "La contraseña debe tener al menos 6 caracteres",
    unknownError: "Error desconocido",
    supabaseUnavailable: "El cliente Supabase no está disponible",
    userVerificationFailed: "No se pudo verificar el usuario.",
    
    alreadyHaveAccount: "¿Ya tienes una cuenta?",
    signInHere: "Inicia sesión",
    noAccount: "¿No tienes cuenta?",
    registerHere: "Regístrate",
    
    or: "o",
    
    securedConnection: "Conexión SSL segura",
    byLoggingIn: "Al iniciar sesión, aceptas nuestros",
    termsOfService: "términos de servicio",
    and: "y",
    privacyPolicy: "política de privacidad",
  },
};
