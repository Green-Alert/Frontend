import { useCallback, useEffect, useRef } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { registrarFcmToken } from '../services/api';

const LOCAL_KEY      = 'ga_fcm_token';
const INIT_DELAY_MS  = 3000; // Espera antes de pedir permiso (no bloquear carga inicial)

/**
 * FE-30 · Hook de Firebase Cloud Messaging.
 *
 * - Solicita permiso de notificaciones al usuario (una sola vez, con delay).
 * - Obtiene el FCM token y lo registra en el backend.
 * - Escucha mensajes en foreground y los muestra como toasts.
 * - Se activa solo cuando hay sesión de usuario activa.
 * - No hace nada si el navegador no soporta FCM (ej: Safari iOS, Firefox modo privado).
 */
export function useFCM() {
  const { user }       = useAuth();
  const { showToast }  = useToast();
  const registradoRef  = useRef(false);
  const unsubscribeRef = useRef(null);

  const inicializar = useCallback(async () => {
    if (!user || registradoRef.current) return;

    // Verificar soporte del navegador (isSupported() ya está dentro de getFirebaseMessaging)
    const messaging = await getFirebaseMessaging();
    if (!messaging) return;

    // No insistir si el usuario ya denegó los permisos
    if (Notification.permission === 'denied') return;

    // Solicitar permiso si aún no se ha decidido
    let permiso = Notification.permission;
    if (permiso === 'default') {
      permiso = await Notification.requestPermission();
    }
    if (permiso !== 'granted') return;

    try {
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        console.warn('[FCM] VITE_FIREBASE_VAPID_KEY no configurada. Push deshabilitado.');
        return;
      }

      // Registrar el Service Worker explícitamente para que getToken lo use
      const swRegistration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js',
        { scope: '/' }
      );

      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swRegistration,
      });

      if (!token) {
        console.warn('[FCM] No se pudo obtener el token FCM.');
        return;
      }

      // Solo llamar al backend si el token cambió respecto al último registrado
      const tokenPrevio = localStorage.getItem(LOCAL_KEY);
      if (tokenPrevio !== token) {
        await registrarFcmToken(token);
        localStorage.setItem(LOCAL_KEY, token);
      }

      registradoRef.current = true;

      // Escuchar mensajes cuando la app está en FOREGROUND
      unsubscribeRef.current = onMessage(messaging, (payload) => {
        const titulo = payload.notification?.title ?? 'Green Alert';
        const cuerpo = payload.notification?.body  ?? '';
        const link   = payload.data?.link;

        showToast(titulo, 'info', 6000, {
          subtitle: cuerpo,
          position: 'top-center',
        });

        // Si hay link, hacer el toast clickeable usando una notificación nativa auxiliar
        // (el toast de la UI ya es visible; no navegamos automáticamente para no interrumpir)
        if (link) {
          // Registrar en el historial de notificaciones visible en el panel (el polling lo detectará)
        }
      });
    } catch (err) {
      // Errores comunes: permiso revocado entre llamadas, SW falla al registrar
      console.error('[FCM] Error al inicializar:', err.message);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (!user) {
      // Usuario deslogueado: limpiar estado y suscripción
      registradoRef.current = false;
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      return;
    }

    // Delay para no bloquear la carga inicial de la app
    const timer = setTimeout(inicializar, INIT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [user, inicializar]);
}
