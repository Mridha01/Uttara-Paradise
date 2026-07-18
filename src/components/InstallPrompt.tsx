import { useEffect, useState } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';

/**
 * 📲 PWA Install Prompt
 * - Android/Chrome: captures `beforeinstallprompt` → shows "অ্যাপ ইনস্টল করুন" banner
 * - iOS Safari: shows one-time instructions (Share → Add to Home Screen)
 * - Hidden if already installed (standalone) or dismissed (7 days)
 */

const DISMISS_KEY = 'up-install-dismissed';
const DISMISS_DAYS = 7;

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function recentlyDismissed() {
  const t = Number(localStorage.getItem(DISMISS_KEY) || 0);
  return Date.now() - t < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null);
  const [showIos, setShowIos] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS has no beforeinstallprompt — show manual instructions after 3s
    let t: ReturnType<typeof setTimeout>;
    if (isIos()) {
      t = setTimeout(() => {
        setShowIos(true);
        setVisible(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(t);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setDeferred(null);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-md rounded-2xl border border-primary/30 bg-card shadow-2xl p-4 animate-in slide-in-from-bottom-4">
      <button
        onClick={dismiss}
        aria-label="Close"
        className="absolute top-2 right-2 p-1 rounded-full text-muted-foreground hover:bg-muted"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <img src="/icon-192.png" alt="" className="h-12 w-12 rounded-xl shrink-0" />
        <div className="min-w-0">
          <p className="font-bold text-foreground text-sm">উত্তরা প্যারাডাইস অ্যাপ</p>

          {showIos ? (
            <div className="text-xs text-muted-foreground mt-1 space-y-1">
              <p>ফোনে অ্যাপ হিসেবে ব্যবহার করতে:</p>
              <p className="flex items-center gap-1 flex-wrap">
                <span>১. Safari-তে</span>
                <Share className="h-3.5 w-3.5 inline text-primary" />
                <span className="font-semibold">Share</span>
                <span>বাটনে চাপ দিন</span>
              </p>
              <p className="flex items-center gap-1 flex-wrap">
                <span>২.</span>
                <PlusSquare className="h-3.5 w-3.5 inline text-primary" />
                <span className="font-semibold">Add to Home Screen</span>
                <span>সিলেক্ট করুন</span>
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mt-0.5">
                ফোনের হোম স্ক্রিনে ইনস্টল করুন — অ্যাপের মতো ব্যবহার করুন
              </p>
              <button
                onClick={install}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
              >
                <Download className="h-3.5 w-3.5" />
                ইনস্টল করুন
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
