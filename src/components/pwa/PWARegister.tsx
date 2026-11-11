'use client';

import React, { useEffect, useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    // 1. Register service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
          // Silent catch for private browsing or unsupported environments
        });
      });
    }

    // 2. Check if already installed / standalone
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isStandaloneMode);

    // 3. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice && !isStandaloneMode);

    // 4. Capture native install prompt for Chrome/Edge/Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSHint(true);
      setTimeout(() => setShowIOSHint(false), 8000);
    }
  };

  if (isStandalone) return null;

  return (
    <>
      {isInstallable && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleInstallClick}
          icon={<Download className="w-3.5 h-3.5 text-blue-500 animate-bounce" />}
          className="no-print border-blue-400/50 hover:border-blue-500 text-blue-600 dark:text-blue-400"
          title="Install app on your phone or laptop"
        >
          Install App
        </Button>
      )}

      {isIOS && !isInstallable && (
        <div className="relative inline-block no-print">
          <Button
            variant="outline"
            size="sm"
            onClick={handleInstallClick}
            icon={<Smartphone className="w-3.5 h-3.5 text-blue-500" />}
            className="border-blue-400/50 hover:border-blue-500 text-blue-600 dark:text-blue-400"
            title="Add to Home Screen on iPhone"
          >
            Install on Phone
          </Button>

          {showIOSHint && (
            <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-2xl border border-slate-700 z-50 animate-fade-in">
              <p className="font-semibold mb-1 flex items-center gap-1.5 text-blue-400">
                <Smartphone className="w-4 h-4" /> To Install on iPhone:
              </p>
              <p className="text-slate-300">
                Tap the Safari <strong>Share</strong> button (box with arrow ↑) at the bottom, then select <strong>Add to Home Screen</strong>.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
