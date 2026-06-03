import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const NETWORK_LOADING_EVENT = 'ga:network-loading';
const SHOW_DELAY_MS = 180;

export default function GlobalLoadingIndicator() {
  const [state, setState] = useState({
    active: false,
    message: 'Procesando...',
    pending: 0,
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onNetworkLoading = (event) => {
      setState({
        active: Boolean(event.detail?.active),
        message: event.detail?.message || 'Procesando...',
        pending: Number(event.detail?.pending) || 0,
      });
    };

    window.addEventListener(NETWORK_LOADING_EVENT, onNetworkLoading);
    return () => window.removeEventListener(NETWORK_LOADING_EVENT, onNetworkLoading);
  }, []);

  useEffect(() => {
    if (!state.active) {
      setVisible(false);
      return undefined;
    }

    const timeout = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [state.active]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[9998]" aria-live="polite">
      <div className="h-1 w-full overflow-hidden bg-gray-950/80">
        <div className="ga-loading-bar h-full w-1/3 bg-gradient-to-r from-green-400 via-emerald-300 to-cyan-300 shadow-[0_0_18px_rgba(52,211,153,0.7)]" />
      </div>

      <div className="fixed bottom-5 left-1/2 z-[9998] -translate-x-1/2">
        <div className="flex items-center gap-3 rounded-full border border-green-500/25 bg-gray-950/92 px-4 py-2.5 text-sm text-gray-100 shadow-2xl shadow-black/60 backdrop-blur-xl">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/12 text-green-300">
            <Loader2 size={16} className="animate-spin" />
          </span>
          <span className="font-medium">{state.message}</span>
          {state.pending > 1 && (
            <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
              {state.pending}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
