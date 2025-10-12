// app/components/ReCaptcha.tsx
"use client";

import { useEffect, useRef } from 'react';

interface GreCaptcha {
  ready: (callback: () => void) => void;
  render: (element: string | Element, options: Record<string, unknown>) => number;
  reset: (widgetId?: number) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

declare global {
  interface Window {
    grecaptcha: GreCaptcha;
    onRecaptchaLoad: () => void;
  }
}

interface ReCaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpired?: () => void;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal' | 'invisible';
  action?: string;
}

export default function ReCaptcha({
  siteKey,
  onVerify,
  onError,
  onExpired,
  theme = 'light',
  size = 'normal'
}: ReCaptchaProps) {
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Load reCAPTCHA script
    const loadReCaptcha = () => {
      if (window.grecaptcha) {
        renderReCaptcha();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit`;
      script.async = true;
      script.defer = true;
      
      window.onRecaptchaLoad = () => {
        renderReCaptcha();
      };
      
      document.head.appendChild(script);
    };

    const renderReCaptcha = () => {
      if (recaptchaRef.current && window.grecaptcha) {
        try {
          // Reset if already rendered
          if (widgetIdRef.current !== null) {
            window.grecaptcha.reset(widgetIdRef.current);
          } else {
            widgetIdRef.current = window.grecaptcha.render(recaptchaRef.current, {
              sitekey: siteKey,
              theme,
              size,
              callback: (token: string) => {
                onVerify(token);
              },
              'error-callback': () => {
                onError?.();
              },
              'expired-callback': () => {
                onExpired?.();
              }
            });
          }
        } catch (error) {
          console.error('reCAPTCHA render error:', error);
          onError?.();
        }
      }
    };

    loadReCaptcha();

    return () => {
      // Cleanup
      if (widgetIdRef.current !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch (error) {
          console.error('reCAPTCHA cleanup error:', error);
        }
      }
    };
  }, [siteKey, theme, size, onVerify, onError, onExpired]);

  return <div ref={recaptchaRef} />;
}

// Hook for invisible reCAPTCHA
export function useInvisibleReCaptcha(siteKey: string, action: string = 'contact_form') {
  const executeRecaptcha = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha) {
        reject(new Error('reCAPTCHA not loaded'));
        return;
      }

      try {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(siteKey, { action }).then((token: string) => {
            resolve(token);
          }).catch((error: unknown) => {
            reject(error);
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  useEffect(() => {
    // Load reCAPTCHA script if not already loaded
    if (!window.grecaptcha) {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      document.head.appendChild(script);
    }
  }, [siteKey]);

  return executeRecaptcha;
}