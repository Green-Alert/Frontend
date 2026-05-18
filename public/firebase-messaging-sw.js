/**
 * FE-30 · Service Worker para Firebase Cloud Messaging (background messages).
 *
 * ⚠️ IMPORTANTE: Los Service Workers no pueden acceder a variables de entorno
 * de Vite (VITE_*). Debes copiar manualmente los valores de tu proyecto Firebase
 * en el objeto `firebaseConfig` de abajo. Son los mismos que tienes en tu .env.
 *
 * Estos valores son PÚBLICOS (no son secretos). La seguridad de Firebase
 * se gestiona con Security Rules y tokens de autenticación, no con esta config.
 *
 * Cómo obtenerlos: Firebase Console → Project Settings → General → Your apps.
 */

// Firebase compat SDK vía CDN (compatible con Service Workers)
/* eslint-disable */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ──────────────────────────────────────────────────────────────────────────────
// ⬇️  Reemplaza estos valores con los de tu proyecto Firebase
// ──────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            'AIzaSyBMMamcR8KTSMc6OLQvsXdyUAvnbN0xspY',
  authDomain:        'green-alert-1.firebaseapp.com',
  projectId:         'green-alert-1',
  storageBucket:     'green-alert-1.firebasestorage.app',
  messagingSenderId: '141245905908',
  appId:             '1:141245905908:web:8074ab75778af7c94f97a1',
};
// ──────────────────────────────────────────────────────────────────────────────

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

/**
 * Maneja mensajes recibidos cuando la app está en BACKGROUND o CERRADA.
 * Si el payload tiene notification.title/body, Firebase los muestra automáticamente.
 * Este handler permite personalizar la notificación (ícono, badge, etc.).
 */
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? 'Green Alert';
  const body  = payload.notification?.body  ?? '';
  const link  = payload.data?.link          ?? '/';

  self.registration.showNotification(title, {
    body,
    icon:  '/aurel.png',
    badge: '/favicon.ico',
    data:  { link },
    requireInteraction: false,
  });
});

/**
 * Redirige al usuario a la ruta correcta cuando hace click en la notificación del SO.
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const link = event.notification.data?.link ?? '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si hay una pestaña abierta, la enfoca y navega
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            if ('navigate' in client) client.navigate(link);
            return;
          }
        }
        // Si no hay ninguna pestaña abierta, abre una nueva
        if (clients.openWindow) {
          return clients.openWindow(link);
        }
      })
  );
});
