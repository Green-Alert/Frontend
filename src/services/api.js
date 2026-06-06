import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 8000,
});

// Adjunta el token JWT en cada petición si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ga_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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
export const oauthGoogle   = (access_token) => api.post('/auth/google',   { access_token });
export const oauthFacebook = (code)          => api.post('/auth/facebook', { code });

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

