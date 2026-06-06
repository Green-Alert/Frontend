import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 8000,
});

// ── Decodifica expiración del JWT sin librería ─────────────────────────────
const getTokenExp = (token) => {
  try {
    // atob es API de browser, siempre disponible en este contexto
    const payload = JSON.parse(window.atob(token.split('.')[1]));
    return payload.exp ?? null;
  } catch {
    return null;
  }
};

// ── Limpia sesión y notifica a la app ─────────────────────────────────────
const clearSession = () => {
  localStorage.removeItem('ga_token');
  localStorage.removeItem('ga_refresh_token');
  localStorage.removeItem('ga_user');
  window.dispatchEvent(new Event('ga:session-expired'));
};

// ── Estado compartido de refresh ──────────────────────────────────────────
let isRefreshing = false;
let proactiveRefreshPromise = null;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// Lógica de refresh reutilizada por ambos interceptores
const doRefresh = () => {
  const refreshToken = localStorage.getItem('ga_refresh_token');
  if (!refreshToken) return Promise.reject(new Error('no_refresh_token'));
  return axios
    .post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken }, { timeout: 8000 })
    .then(({ data }) => {
      const newAccess = data.data.accessToken || data.data.token;
      const newRefresh = data.data.refreshToken;
      localStorage.setItem('ga_token', newAccess);
      if (newRefresh) localStorage.setItem('ga_refresh_token', newRefresh);
      api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
      return newAccess;
    });
};

// ── Request interceptor: refresco PROACTIVO ───────────────────────────────
// Si el token expira en < 2 min, se renueva ANTES de enviar la petición.
// Esto evita fallos en uploads multipart que no se pueden reintentar.
api.interceptors.request.use(async (config) => {
  if (config.url?.includes('/auth/refresh') || config.url?.includes('/auth/login')) {
    return config;
  }

// Adjunta el token JWT en cada petición si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ga_token');
  if (!token) return config;

  const exp = getTokenExp(token);
  const now = Math.floor(Date.now() / 1000);

  if (exp && exp - now < 120) {
    try {
      if (!proactiveRefreshPromise) {
        proactiveRefreshPromise = doRefresh().finally(() => {
          proactiveRefreshPromise = null;
        });
      }
      const freshToken = await proactiveRefreshPromise;
      config.headers.Authorization = `Bearer ${freshToken}`;
      return config;
    } catch {
      // Si falla el refresh proactivo, el response interceptor lo manejará
    }
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: refresco REACTIVO (fallback 401) ────────────────
  return config;
});

// Cola de requests que fallaron mientras se refrescaba el token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

const clearSession = () => {
  localStorage.removeItem('ga_token');
  localStorage.removeItem('ga_refresh_token');
  localStorage.removeItem('ga_user');
};

// Refresh silencioso: si el access token expiró, renueva automáticamente
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // Solo intentar refresh en 401 y si no es una request de auth ni ya reintentada
    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {

      if (!localStorage.getItem('ga_refresh_token')) {
      const refreshToken = localStorage.getItem('ga_refresh_token');

      if (!refreshToken) {
        clearSession();
        return Promise.reject(err);
      }

      // Si ya hay un refresh en curso, encolar esta request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          originalRequest._retry = true;
          return api(originalRequest);
        }).catch((e) => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await doRefresh();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        // Llamada directa con axios para no pasar por este interceptor
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken },
          { timeout: 8000 }
        );

        const newAccessToken = data.data.accessToken || data.data.token;
        const newRefreshToken = data.data.refreshToken;

        localStorage.setItem('ga_token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('ga_refresh_token', newRefreshToken);
        }

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export const checkHealth = () => api.get('/health');

// ── Auth ──
export const loginUser    = (email, password)                                   => api.post('/auth/login',    { email, password });
export const registerUser = (nombre, apellido, email, password, telefono)       => api.post('/auth/register', { nombre, apellido, email, password, telefono });
export const oauthGoogle        = (access_token) => api.post('/auth/google',   { access_token });
export const oauthFacebook      = (code)          => api.post('/auth/facebook', { code });
export const getGoogleAuthUrl   = ()              => api.get('/auth/google/url');
export const getFacebookAuthUrl = ()              => api.get('/auth/facebook/url');

// ── Categorías ──
export const getCategorias         = ()       => api.get('/categorias');
export const getCategoriaPorCodigo = (codigo) => api.get(`/categorias/${codigo}`);

// ── Reportes ──
export const getStats       = ()           => api.get('/reportes/stats');
// FE-20: stats analíticas
export const getStatsCategoria = ()                  => api.get('/reportes/stats/categoria');
export const getStatsTimeline  = (params)            => api.get('/reportes/stats/timeline', { params });
export const getHeatmapPoints  = ()                  => api.get('/reportes/stats/heatmap');
// FE-27 (BE-12): agregados de la IA para gráficos de tendencias
export const getStatsIA        = (params)            => api.get('/reportes/stats/ia', { params });
export const createReporte  = (data) => api.post('/reportes', data, { timeout: 60000 });
export const getReportes    = (params)     => api.get('/reportes', { params });
export const getReporteById = (id, skipView = false) =>
  api.get(`/reportes/${id}`, skipView ? { params: { skip_view: 'true' } } : {});
// FE-24 (BE-09): clasificación de imagen con IA antes de crear el reporte
export const analizarImagenIA = (file) => {
  const formData = new FormData();
  formData.append('imagen', file);
  return api.post('/reportes/analizar-imagen', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
};
// FE-31 (BE-16): sugerencia de título y descripción basada en imágenes adjuntas
export const sugerirContenidoReporte = (formData) =>
  api.post('/reportes/sugerir-contenido', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 45000,
  });
export const updateReporte  = (id, data)   => api.patch(`/reportes/${id}`, data);
export const deleteReporte  = (id)         => api.delete(`/reportes/${id}`);
export const exportReportes = (params)     => api.get('/reportes/export', { params });

// Likes y tendencias
export const toggleLikeReporte  = (id)         => api.post(`/reportes/${id}/like`);
export const getTrendingReportes = (params)    => api.get('/reportes/trending', { params });

// FE-26 (BE-11): zonas de riesgo predictivas y alertas
export const getZonasRiesgo        = (params) => api.get('/reportes/zonas-riesgo',        { params });
export const getAlertasPredictivas = (params) => api.get('/reportes/alertas-predictivas', { params });

// ── Perfil / Auth ──
export const getPerfil            = ()                                               => api.get('/auth/perfil');
export const updatePerfil         = (data)                                            => api.patch('/auth/perfil', data);
export const updateAvatar         = (formData)                                        => api.patch('/auth/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const changePassword       = (currentPassword, newPassword, confirmPassword)   => api.patch('/auth/cambiar-contrasena', { currentPassword, newPassword, confirmPassword });
export const updateNotifications  = (preferences)                                     => api.patch('/auth/notificaciones', preferences);

export const getMisReportes     = (params)                                            => api.get('/reportes/mis-reportes', { params });
export const forgotPassword     = (email)                                              => api.post('/auth/forgot-password', { email });
export const resetPasswordToken = (token, newPassword, confirmPassword)                => api.post('/auth/reset-password', { token, newPassword, confirmPassword });
export const enviarVerificacionOtp = ()                                                => api.post('/auth/enviar-verificacion');
export const verificarEmailOtp     = (codigo)                                          => api.post('/auth/verificar-email', { codigo });

// ── Admin: gestión de usuarios (solo rol admin) ──
export const getAdminStats        = ()                  => api.get('/admin/usuarios/stats');
export const getAdminUsuarios     = (params)            => api.get('/admin/usuarios', { params });
export const getAdminUsuario      = (id)                => api.get(`/admin/usuarios/${id}`);
export const cambiarRolUsuario    = (id, rol)           => api.patch(`/admin/usuarios/${id}/rol`, { rol });
export const cambiarEstadoUsuario = (id, activo)        => api.patch(`/admin/usuarios/${id}/estado`, { activo });
export const eliminarUsuarioAdmin = (id)                => api.delete(`/admin/usuarios/${id}`);

// FE-28 (BE-13): chatbot conversacional
export const sendChatMessage = (payload, options = {}) => api.post('/chatbot/mensaje', payload, { timeout: 10000, ...options });
export const getChatFaqs = () => api.get('/chatbot/faqs');

// FE-29 (BE-14): notificaciones in-app
export const getNotificaciones                = (params)  => api.get('/notificaciones', { params });
export const getNotificacionesContador        = ()        => api.get('/notificaciones/contador');
export const marcarNotificacionLeida          = (uuid)    => api.patch(`/notificaciones/${uuid}/leida`);
export const marcarTodasNotificacionesLeidas  = ()        => api.patch('/notificaciones/marcar-todas');
export const eliminarNotificacion             = (uuid)    => api.delete(`/notificaciones/${uuid}`);

// FE-30 (BE-15): push notifications FCM
export const registrarFcmToken = (token) => api.post('/notificaciones/fcm-token', { token });

// ── Entidades ──
export const getEntidades = () => api.get('/entidades');

// ── Moderación: asignación de reportes a entidades ──
export const asignarReporteEntidad = (idReporte, data) => api.post(`/reportes/${idReporte}/asignaciones`, data);
export const asignarReporteEntidad = (idReporte, data) => api.post(`/reportes/${idReporte}/asignar-entidad`, data);


// ── Panel de entidad ──
export const getMisReportesEntidad          = (params)           => api.get('/entidad/reportes', { params });
export const getMiReporteEntidad            = (idReporte)        => api.get(`/entidad/reportes/${idReporte}`);
export const actualizarAtencionEntidad      = (idReporte, data)  => api.patch(`/entidad/reportes/${idReporte}/atencion`, data);
export const getMisAlertasEntidad           = (params)           => api.get('/entidad/alertas', { params });
export const getMisAlertasNoLeidasCountEntidad = ()              => api.get('/entidad/alertas/contador');
export const marcarAlertaEntidadLeida       = (idAlerta)         => api.patch(`/entidad/alertas/${idAlerta}/leida`);
export const marcarTodasAlertasEntidadLeidas = ()                => api.patch('/entidad/alertas/marcar-todas');
