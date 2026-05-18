/**
 * FE-30 · Configuración de Firebase para el frontend.
 *
 * Usa isSupported() de Firebase para verificar compatibilidad del navegador
 * antes de inicializar Messaging (Safari iOS, algunos entornos SSR no lo soportan).
 *
 * Variables de entorno requeridas (.env):
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_STORAGE_BUCKET
 *   VITE_FIREBASE_MESSAGING_SENDER_ID
 *   VITE_FIREBASE_APP_ID
 *   VITE_FIREBASE_VAPID_KEY
 */

import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

let _messagingInstance = null;

/**
 * Retorna la instancia de Firebase Messaging si el navegador la soporta,
 * o null si no hay soporte (Safari iOS, modo privado de Firefox, etc.).
 *
 * Es seguro llamarla múltiples veces: siempre devuelve la misma instancia.
 *
 * @returns {Promise<import('firebase/messaging').Messaging|null>}
 */
export async function getFirebaseMessaging() {
  if (_messagingInstance) return _messagingInstance;

  const soportado = await isSupported();
  if (!soportado) return null;

  const app = getApps().length > 0
    ? getApps()[0]
    : initializeApp(firebaseConfig);

  _messagingInstance = getMessaging(app);
  return _messagingInstance;
}

export { firebaseConfig };
