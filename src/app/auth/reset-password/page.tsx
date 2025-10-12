'use client';

import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";
import { useLanguage } from "@/app/components/LanguageProvider";
import { resetPasswordTranslations } from "./translations";

function LoadingFallback() {
  const { lang } = useLanguage();
  const t = resetPasswordTranslations[lang];
  
  return (
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
      <p className="text-white">{t.loadingReset}</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}