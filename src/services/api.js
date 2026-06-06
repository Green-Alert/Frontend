import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 8000,
});

const NETWORK_LOADING_EVENT = 'ga:network-loading';
const MUTATION_LOADING_MESSAGES = {
  post: 'Procesando...',
  put: 'Guardando cambios...',
  patch: 'Guardando cambios...',
  delete: 'Eliminando...',
};

let pendingRequests = 0;
let currentLoadingMessage = 'Procesando...';

const emitNetworkLoading = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(NETWORK_LOADING_EVENT, {
    detail: {
      active: pendingRequests > 0,
      message: currentLoadingMessage,
      pending: pendingRequests,
    },
  }));
};

const getDefaultLoadingMessage = (config) => {
  const method = String(config.method || 'get').toLowerCase();
  return MUTATION_LOADING_MESSAGES[method] || 'Cargando datos...';
};

const startRequestLoading = (config) => {
  if (config.metadata?.silentLoading) return config;
  pendingRequests += 1;
  currentLoadingMessage = config.metadata?.loadingMessage || getDefaultLoadingMessage(config);
  config.metadata = { ...(config.metadata ?? {}), loadingTracked: true };
  emitNetworkLoading();
  return config;
};

const finishRequestLoading = (config) => {
  if (!config?.metadata?.loadingTracked) return;
  pendingRequests = Math.max(0, pendingRequests - 1);
  if (pendingRequests === 0) {
    currentLoadingMessage = 'Procesando...';
  }
  emitNetworkLoading();
};

// Adjunta el token JWT en cada petición si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ga_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return startRequestLoading(config);
});

// Si el token expira o es inválido, limpia la sesión
api.interceptors.response.use(
  (res) => {
    finishRequestLoading(res.config);
    return res;
  },
  (err) => {
    finishRequestLoading(err.config);
    if (err.response?.status === 401) {
      localStorage.removeItem('ga_token');
      localStorage.removeItem('ga_user');
    }
    return Promise.reject(err);
  }
);

export const checkHealth = () => api.get('/health');

// ── Auth ──
export const loginUser    = (email, password)                                   => api.post('/auth/login',    { email, password }, { metadata: { loadingMessage: 'Iniciando sesion...' } });
export const registerUser = (nombre, apellido, email, password, telefono)       => api.post('/auth/register', { nombre, apellido, email, password, telefono }, { metadata: { loadingMessage: 'Creando cuenta...' } });
export const oauthGoogle   = (access_token) => api.post('/auth/google',   { access_token }, { metadata: { loadingMessage: 'Iniciando sesion...' } });
export const oauthFacebook = (code)          => api.post('/auth/facebook', { code }, { metadata: { loadingMessage: 'Iniciando sesion...' } });
export const getGoogleAuthUrl = () => api.get('/auth/google/url');
export const getFacebookAuthUrl = () => api.get('/auth/facebook/url');
export const exchangeOAuthCallbackCode = (code) => api.post('/auth/oauth/exchange', { code }, { metadata: { loadingMessage: 'Completando autenticacion...' } });

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
export const createReporte  = (data) => api.post('/reportes', data, { metadata: { loadingMessage: 'Enviando reporte...' } });
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
    metadata: { loadingMessage: 'Analizando imagen...' },
  });
};
// FE-31 (BE-16): sugerencia de título y descripción basada en imágenes adjuntas
export const sugerirContenidoReporte = (formData) =>
  api.post('/reportes/sugerir-contenido', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 45000,
    metadata: { loadingMessage: 'Generando sugerencias...' },
  });
export const updateReporte  = (id, data)   => api.patch(`/reportes/${id}`, data);
export const deleteReporte  = (id)         => api.delete(`/reportes/${id}`);
export const exportReportes = (params)     => api.get('/reportes/export', { params, responseType: 'arraybuffer' });
export const exportReportes = (params)     => api.get('/reportes/export', { params });

export const asignarReporteEntidad = (id, data) => api.post(`/reportes/${id}/asignaciones`, data);

// Likes y tendencias
export const toggleLikeReporte  = (id)         => api.post(`/reportes/${id}/like`);
export const getTrendingReportes = (params)    => api.get('/reportes/trending', { params });

// FE-26 (BE-11): zonas de riesgo predictivas y alertas
export const getZonasRiesgo        = (params) => api.get('/reportes/zonas-riesgo',        { params });
export const getAlertasPredictivas = (params) => api.get('/reportes/alertas-predictivas', { params });

// ── Perfil / Auth ──
export const getPerfil            = ()                                               => api.get('/auth/perfil');
export const updatePerfil         = (data)                                            => api.patch('/auth/perfil', data);
export const updateAvatar         = (formData)                                        => api.patch('/auth/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' }, metadata: { loadingMessage: 'Subiendo foto...' } });
export const changePassword       = (currentPassword, newPassword, confirmPassword)   => api.patch('/auth/cambiar-contrasena', { currentPassword, newPassword, confirmPassword });
export const updateNotifications  = (preferences)                                     => api.patch('/auth/notificaciones', preferences);

export const getMisReportes     = (params)                                            => api.get('/reportes/mis-reportes', { params });
export const forgotPassword     = (email)                                              => api.post('/auth/forgot-password', { email }, { metadata: { loadingMessage: 'Enviando correo...' } });
export const resetPasswordToken = (token, newPassword, confirmPassword)                => api.post('/auth/reset-password', { token, newPassword, confirmPassword }, { metadata: { loadingMessage: 'Actualizando contrasena...' } });
export const enviarVerificacionOtp = ()                                                => api.post('/auth/enviar-verificacion', undefined, { metadata: { loadingMessage: 'Enviando codigo...' } });
export const verificarEmailOtp     = (codigo)                                          => api.post('/auth/verificar-email', { codigo }, { metadata: { loadingMessage: 'Verificando codigo...' } });

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

// Entidades institucionales
export const getEntidades = () => api.get('/entidades');
export const getMisReportesEntidad = (params) => api.get('/entidades/mis-reportes', { params });
export const getMiReporteEntidad = (id) => api.get(`/entidades/mis-reportes/${id}`);
export const actualizarAtencionEntidad = (id, data) => api.patch(`/entidades/mis-reportes/${id}/atencion`, data);
export const getMisAlertasEntidad = (params) => api.get('/entidades/mis-alertas', { params });
export const getMisAlertasNoLeidasEntidad = (params) => api.get('/entidades/mis-alertas/no-leidas', { params });
export const getMisAlertasNoLeidasCountEntidad = () => api.get('/entidades/mis-alertas/no-leidas/count');
export const marcarAlertaEntidadLeida = (id) => api.patch(`/entidades/mis-alertas/${id}/leer`);
export const marcarAlertaEntidadLeidaAlias = (id) => api.patch(`/entidades/mis-alertas/${id}`);
export const marcarTodasAlertasEntidadLeidas = () => api.patch('/entidades/mis-alertas/leer-todas');

