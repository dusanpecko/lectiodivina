// Forgot Password page translations
export interface ForgotPasswordTranslations {
  // Layout - Left side
  passwordReset: string;
  secureRecovery: string;
  accessCredentials: string;
  forgotPasswordInfo: string;
  processStep1: string;
  processStep2: string;
  processStep3: string;
  processStep4: string;
  securityFirst: string;
  linkValid1Hour: string;
  sslEncryption: string;
  noPlainTextPasswords: string;
  autoLogoutAfterChange: string;
  needHelp: string;
  needHelpDesc: string;
  
  // Success state
  emailSent: string;
  checkInbox: string;
  emailSuccessfullySent: string;
  emailSentMessage: string;
  
  // Next steps
  nextSteps: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  
  // Warning
  noEmail: string;
  checkSpam: string;
  wait2to3Minutes: string;
  verifyEmail: string;
  
  // Form state
  forgotPasswordTitle: string;
  forgotPasswordSubtitle: string;
  sendingError: string;
  
  // Form
  email: string;
  emailPlaceholder: string;
  emailHelp: string;
  
  // Buttons
  sendAgain: string;
  backToLogin: string;
  sendResetEmail: string;
  sendingEmail: string;
  
  // Security info
  securityInfo: string;
  linkValidFor: string;
  
  // Help
  stillHaveProblems: string;
  contactSupport: string;
  
  // Error messages
  sendError: string;
}

export const forgotPasswordTranslations: Record<'sk' | 'cz' | 'en' | 'es', ForgotPasswordTranslations> = {
  sk: {
    passwordReset: "Obnovenie hesla",
    secureRecovery: "Bezpečné obnovenie",
    accessCredentials: "prístupových údajov",
    forgotPasswordInfo: "Zabudli ste heslo? Žiadny problém! Pošleme vám bezpečný odkaz na obnovenie hesla priamo do vašej emailovej schránky.",
    processStep1: "Zadajte svoj email",
    processStep2: "Skontrolujte emailovú schránku",
    processStep3: "Kliknite na odkaz a nastavte nové heslo",
    processStep4: "Prihláste sa s novým heslom",
    securityFirst: "Bezpečnosť na prvom mieste",
    linkValid1Hour: "Odkaz je platný iba 1 hodinu",
    sslEncryption: "Zabezpečené SSL šifrovanie",
    noPlainTextPasswords: "Žiadne uloženie hesiel v plain texte",
    autoLogoutAfterChange: "Automatické odhlásenie po zmene",
    needHelp: "Potrebujete pomoc?",
    needHelpDesc: "Ak máte problémy s obnovením hesla, kontaktujte nášho správcu systému alebo IT podporu vašej organizácie.",
    
    emailSent: "Email odoslaný! 📧",
    checkInbox: "Skontrolujte si doručenú poštu",
    emailSuccessfullySent: "Email úspešne odoslaný",
    emailSentMessage: "Na váš email bol odoslaný odkaz na obnovenie hesla. Skontrolujte si doručenú poštu a spam.",
    
    nextSteps: "Ďalšie kroky:",
    step1: "Otvorte si emailovú schránku",
    step2: "Nájdite email s obnovením hesla",
    step3: "Kliknite na odkaz v emaili",
    step4: "Nastavte si nové heslo",
    
    noEmail: "Nevidíte email?",
    checkSpam: "Skontrolujte spam/nevyžiadanú poštu",
    wait2to3Minutes: "Počkajte 2-3 minúty",
    verifyEmail: "Overte správnosť emailovej adresy",
    
    forgotPasswordTitle: "Zabudli ste heslo? 🔑",
    forgotPasswordSubtitle: "Pošleme vám odkaz na obnovenie hesla",
    sendingError: "Chyba odosielania",
    
    email: "Emailová adresa",
    emailPlaceholder: "admin@example.com",
    emailHelp: "Zadajte email, ktorý používate na prihlásenie do administrácie",
    
    sendAgain: "Odoslať znovu",
    backToLogin: "Späť na prihlásenie",
    sendResetEmail: "Odoslať obnovovací email",
    sendingEmail: "Odosielam email...",
    
    securityInfo: "Bezpečnostné informácie",
    linkValidFor: "Odkaz na obnovenie hesla bude platný 1 hodinu. Ak email nedostanete, skontrolujte spam a skúste znovu.",
    
    stillHaveProblems: "Stále máte problémy?",
    contactSupport: "Kontaktujte podporu",
    
    sendError: "Nepodarilo sa odoslať email. Skontrolujte emailovú adresu a skúste znovu.",
  },
  
  cz: {
    passwordReset: "Obnovení hesla",
    secureRecovery: "Bezpečné obnovení",
    accessCredentials: "přístupových údajů",
    forgotPasswordInfo: "Zapomněli jste heslo? Žádný problém! Pošleme vám bezpečný odkaz na obnovení hesla přímo do vaší emailové schránky.",
    processStep1: "Zadejte svůj email",
    processStep2: "Zkontrolujte emailovou schránku",
    processStep3: "Klikněte na odkaz a nastavte nové heslo",
    processStep4: "Přihlaste se s novým heslem",
    securityFirst: "Bezpečnost na prvním místě",
    linkValid1Hour: "Odkaz je platný pouze 1 hodinu",
    sslEncryption: "Zabezpečené SSL šifrování",
    noPlainTextPasswords: "Žádné ukládání hesel v plain textu",
    autoLogoutAfterChange: "Automatické odhlášení po změně",
    needHelp: "Potřebujete pomoc?",
    needHelpDesc: "Pokud máte problémy s obnovením hesla, kontaktujte našeho správce systému nebo IT podporu vaší organizace.",
    
    emailSent: "Email odeslán! 📧",
    checkInbox: "Zkontrolujte si doručenou poštu",
    emailSuccessfullySent: "Email úspěšně odeslán",
    emailSentMessage: "Na váš email byl odeslán odkaz na obnovení hesla. Zkontrolujte si doručenou poštu a spam.",
    
    nextSteps: "Další kroky:",
    step1: "Otevřete si emailovou schránku",
    step2: "Najděte email s obnovením hesla",
    step3: "Klikněte na odkaz v emailu",
    step4: "Nastavte si nové heslo",
    
    noEmail: "Nevidíte email?",
    checkSpam: "Zkontrolujte spam/nevyžádanou poštu",
    wait2to3Minutes: "Počkejte 2-3 minuty",
    verifyEmail: "Ověřte správnost emailové adresy",
    
    forgotPasswordTitle: "Zapomněli jste heslo? 🔑",
    forgotPasswordSubtitle: "Pošleme vám odkaz na obnovení hesla",
    sendingError: "Chyba odesílání",
    
    email: "Emailová adresa",
    emailPlaceholder: "admin@example.com",
    emailHelp: "Zadejte email, který používáte pro přihlášení do administrace",
    
    sendAgain: "Odeslat znovu",
    backToLogin: "Zpět na přihlášení",
    sendResetEmail: "Odeslat obnovovací email",
    sendingEmail: "Odesílám email...",
    
    securityInfo: "Bezpečnostní informace",
    linkValidFor: "Odkaz na obnovení hesla bude platný 1 hodinu. Pokud email nedostanete, zkontrolujte spam a zkuste znovu.",
    
    stillHaveProblems: "Stále máte problémy?",
    contactSupport: "Kontaktujte podporu",
    
    sendError: "Nepodařilo se odeslat email. Zkontrolujte emailovou adresu a zkuste znovu.",
  },
  
  en: {
    passwordReset: "Password Reset",
    secureRecovery: "Secure Recovery",
    accessCredentials: "of Access Credentials",
    forgotPasswordInfo: "Forgot your password? No problem! We'll send you a secure password reset link directly to your email inbox.",
    processStep1: "Enter your email",
    processStep2: "Check your email inbox",
    processStep3: "Click the link and set a new password",
    processStep4: "Sign in with your new password",
    securityFirst: "Security First",
    linkValid1Hour: "Link valid for 1 hour only",
    sslEncryption: "Secured SSL encryption",
    noPlainTextPasswords: "No plain text password storage",
    autoLogoutAfterChange: "Automatic logout after change",
    needHelp: "Need help?",
    needHelpDesc: "If you're having trouble resetting your password, contact your system administrator or your organization's IT support.",
    
    emailSent: "Email sent! 📧",
    checkInbox: "Check your inbox",
    emailSuccessfullySent: "Email successfully sent",
    emailSentMessage: "A password reset link has been sent to your email. Check your inbox and spam folder.",
    
    nextSteps: "Next steps:",
    step1: "Open your email inbox",
    step2: "Find the password reset email",
    step3: "Click the link in the email",
    step4: "Set a new password",
    
    noEmail: "Don't see the email?",
    checkSpam: "Check spam/junk folder",
    wait2to3Minutes: "Wait 2-3 minutes",
    verifyEmail: "Verify your email address",
    
    forgotPasswordTitle: "Forgot password? 🔑",
    forgotPasswordSubtitle: "We'll send you a password reset link",
    sendingError: "Sending error",
    
    email: "Email Address",
    emailPlaceholder: "admin@example.com",
    emailHelp: "Enter the email you use to sign in to the administration",
    
    sendAgain: "Send again",
    backToLogin: "Back to login",
    sendResetEmail: "Send reset email",
    sendingEmail: "Sending email...",
    
    securityInfo: "Security Information",
    linkValidFor: "The password reset link will be valid for 1 hour. If you don't receive the email, check spam and try again.",
    
    stillHaveProblems: "Still having problems?",
    contactSupport: "Contact support",
    
    sendError: "Failed to send email. Check your email address and try again.",
  },
  
  es: {
    passwordReset: "Restablecimiento de Contraseña",
    secureRecovery: "Recuperación Segura",
    accessCredentials: "de Credenciales de Acceso",
    forgotPasswordInfo: "¿Olvidaste tu contraseña? ¡No hay problema! Te enviaremos un enlace seguro de restablecimiento directamente a tu bandeja de entrada.",
    processStep1: "Ingresa tu correo",
    processStep2: "Revisa tu bandeja de entrada",
    processStep3: "Haz clic en el enlace y establece una nueva contraseña",
    processStep4: "Inicia sesión con tu nueva contraseña",
    securityFirst: "Seguridad Primero",
    linkValid1Hour: "Enlace válido solo por 1 hora",
    sslEncryption: "Cifrado SSL seguro",
    noPlainTextPasswords: "Sin almacenamiento de contraseñas en texto plano",
    autoLogoutAfterChange: "Cierre de sesión automático después del cambio",
    needHelp: "¿Necesitas ayuda?",
    needHelpDesc: "Si tienes problemas para restablecer tu contraseña, contacta al administrador del sistema o al soporte de TI de tu organización.",
    
    emailSent: "¡Email enviado! 📧",
    checkInbox: "Revisa tu bandeja de entrada",
    emailSuccessfullySent: "Email enviado exitosamente",
    emailSentMessage: "Se ha enviado un enlace de restablecimiento de contraseña a tu correo. Revisa tu bandeja de entrada y spam.",
    
    nextSteps: "Próximos pasos:",
    step1: "Abre tu bandeja de entrada",
    step2: "Encuentra el correo de restablecimiento de contraseña",
    step3: "Haz clic en el enlace del correo",
    step4: "Establece una nueva contraseña",
    
    noEmail: "¿No ves el correo?",
    checkSpam: "Revisa la carpeta de spam/correo no deseado",
    wait2to3Minutes: "Espera 2-3 minutos",
    verifyEmail: "Verifica la dirección de correo",
    
    forgotPasswordTitle: "¿Olvidaste tu contraseña? 🔑",
    forgotPasswordSubtitle: "Te enviaremos un enlace para restablecer tu contraseña",
    sendingError: "Error al enviar",
    
    email: "Dirección de correo",
    emailPlaceholder: "admin@example.com",
    emailHelp: "Ingresa el correo que usas para iniciar sesión en la administración",
    
    sendAgain: "Enviar de nuevo",
    backToLogin: "Volver al inicio de sesión",
    sendResetEmail: "Enviar correo de restablecimiento",
    sendingEmail: "Enviando correo...",
    
    securityInfo: "Información de seguridad",
    linkValidFor: "El enlace de restablecimiento será válido por 1 hora. Si no recibes el correo, revisa el spam e intenta de nuevo.",
    
    stillHaveProblems: "¿Sigues teniendo problemas?",
    contactSupport: "Contacta soporte",
    
    sendError: "No se pudo enviar el correo. Verifica tu dirección de correo e intenta de nuevo.",
  },
};
