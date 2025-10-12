"use client";

import { useEffect, useState } from "react";

export default function EmergencyCookieTrigger() {
  const [cookieStatus, setCookieStatus] = useState<string>('loading...');

  useEffect(() => {
    const updateStatus = () => {
      if (typeof window !== 'undefined') {
        const status = localStorage.getItem('cookieConsent');
        setCookieStatus(status || 'null (banner should show)');
      }
    };

    updateStatus();
    
    // Update on storage changes
    window.addEventListener('storage', updateStatus);
    const interval = setInterval(updateStatus, 1000);

    return () => {
      window.removeEventListener('storage', updateStatus);
      clearInterval(interval);
    };
  }, []);

  const handleClearAndReload = () => {
    console.log('🚨 EMERGENCY: Clearing cookies and forcing reload');
    localStorage.removeItem('cookieConsent');
    localStorage.removeItem('cookieConsentDate');
    
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    window.location.reload();
  };

  const handleForceShow = () => {
    console.log('🚨 EMERGENCY: Creating direct DOM cookie dialog');
    
    // Remove existing dialog
    const existing = document.getElementById('emergency-dialog');
    if (existing) existing.remove();
    
    // Create emergency dialog
    const dialog = document.createElement('div');
    dialog.id = 'emergency-dialog';
    dialog.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.8);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    dialog.innerHTML = `
      <div style="
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        max-width: 400px;
        text-align: center;
        margin: 1rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      ">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🍪</div>
        <h3 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; color: #333;">
          EMERGENCY Cookie Dialog
        </h3>
        <p style="color: #666; margin-bottom: 2rem; line-height: 1.5;">
          Toto je núdzový cookie dialog vytvorený priamo v DOM.<br>
          Súhlasíte s používaním cookies?
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <button id="emergency-accept" style="
            background: #4f46e5; color: white;
            padding: 0.75rem 1.5rem;
            border: none; border-radius: 0.5rem;
            cursor: pointer; font-weight: bold;
            transition: background-color 0.2s;
          ">Prijať všetko</button>
          <button id="emergency-decline" style="
            background: #6b7280; color: white;
            padding: 0.75rem 1.5rem;
            border: none; border-radius: 0.5rem;
            cursor: pointer; font-weight: bold;
            transition: background-color 0.2s;
          ">Odmietnuť</button>
          <button id="emergency-close" style="
            background: #ef4444; color: white;
            padding: 0.75rem 1.5rem;
            border: none; border-radius: 0.5rem;
            cursor: pointer; font-weight: bold;
            transition: background-color 0.2s;
          ">Zavrieť</button>
        </div>
        <p style="font-size: 0.75rem; color: #999; margin-top: 1rem;">
          Emergency fallback - React komponent nefunguje správne
        </p>
      </div>
    `;
    
    // Add event listeners
    const acceptBtn = dialog.querySelector('#emergency-accept');
    const declineBtn = dialog.querySelector('#emergency-decline');
    const closeBtn = dialog.querySelector('#emergency-close');
    
    acceptBtn?.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'accepted');
      localStorage.setItem('cookieConsentDate', new Date().toISOString());
      dialog.remove();
      alert('✅ Cookies accepted via emergency dialog!');
      window.location.reload();
    });
    
    declineBtn?.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'declined');
      localStorage.setItem('cookieConsentDate', new Date().toISOString());
      dialog.remove();
      alert('❌ Cookies declined via emergency dialog!');
      window.location.reload();
    });
    
    closeBtn?.addEventListener('click', () => {
      dialog.remove();
    });
    
    // Close on overlay click
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        dialog.remove();
      }
    });
    
    // Close on ESC key
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dialog.remove();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
    
    document.body.appendChild(dialog);
  };

  const handleTestReactDialog = () => {
    console.log('🧪 Testing React dialog via context...');
    
    // Try to trigger via custom event
    window.dispatchEvent(new CustomEvent('force-cookie-banner', {
      detail: { source: 'emergency-trigger' }
    }));
    
    // Also try direct DOM query and click
    setTimeout(() => {
      const reactTrigger = document.querySelector('[data-cookie-trigger]') as HTMLElement;
      if (reactTrigger) {
        console.log('🧪 Found React trigger, clicking...');
        reactTrigger.click();
      } else {
        console.log('🧪 No React trigger found');
      }
    }, 100);
  };

  return (
    <>
      {/* Emergency Controls Panel */}
      <div className="fixed top-4 right-4 z-[10001] bg-red-100 border-2 border-red-400 rounded-lg p-3 text-xs max-w-xs shadow-2xl">
        <div className="text-red-800 font-bold mb-2">🚨 EMERGENCY COOKIE CONTROLS</div>
        
        <div className="space-y-2">
          <button
            onClick={handleClearAndReload}
            className="w-full bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors font-semibold"
            title="Vymaže všetky cookies a obnoví stránku"
          >
            🗑️ CLEAR & RELOAD
          </button>
          
          <button
            onClick={handleForceShow}
            className="w-full bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors font-semibold"
            title="Ukáže núdzový cookie dialog"
          >
            🍪 FORCE DOM DIALOG
          </button>
          
          <button
            onClick={handleTestReactDialog}
            className="w-full bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 transition-colors font-semibold"
            title="Pokús o spustenie React dialogu"
          >
            ⚛️ TEST REACT DIALOG
          </button>
        </div>
      </div>
      
      {/* Status Display */}
      <div 
        className="fixed bottom-4 right-4 z-[10001] bg-black text-green-400 p-3 rounded text-xs max-w-xs"
        style={{ fontFamily: 'monospace' }}
      >
        <div className="text-yellow-400 font-bold mb-1">Cookie Status:</div>
        <div className="break-all">{cookieStatus}</div>
        <div className="mt-2 text-gray-400 text-[10px]">
          Updated every second
        </div>
      </div>
      
      {/* Console Logger */}
      <div className="fixed bottom-20 right-4 z-[10001] bg-gray-900 text-white p-2 rounded text-[10px] max-w-xs opacity-80">
        <div className="text-cyan-400 font-bold">Console Debug:</div>
        <div>Open DevTools → Console</div>
        <div>Watch for 🍪 logs</div>
      </div>
    </>
  );
}