export const normalizeEstado = (value) => (
  typeof value === 'string'
    ? value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')
    : ''
);

export const ESTADO_REPORTE_LABEL = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  resuelto: 'Resuelto',
  rechazado: 'Rechazado',
};

export const ESTADO_SEGUIMIENTO_LABEL = {
  pendiente: 'Enviado',
  en_proceso: 'En proceso',
  resuelto: 'Resuelto',
  rechazado: 'Rechazado',
};

export const ESTADO_REPORTE_BADGE_CLASS = {
  pendiente: 'bg-gray-500/15 text-gray-400 border border-gray-500/30',
  en_proceso: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  resuelto: 'bg-green-500/15 text-green-400 border border-green-500/30',
  rechazado: 'bg-red-500/15 text-red-400 border border-red-500/30',
};

export const ESTADO_REPORTE_DOT_CLASS = {
  pendiente: 'bg-gray-400',
  en_proceso: 'bg-orange-400',
  resuelto: 'bg-green-400',
  rechazado: 'bg-red-400',
};

export const ESTADO_REPORTE_TEXT_CLASS = {
  pendiente: 'text-gray-400',
  en_proceso: 'text-orange-400',
  resuelto: 'text-green-400',
  rechazado: 'text-red-400',
};

export const ESTADO_REPORTE_MAP_COLOR = {
  pendiente: '#ef4444',
  en_proceso: '#fb923c',
  resuelto: '#4ade80',
  rechazado: '#6b7280',
};

export const ESTADO_REPORTE_MAP_BADGE_STYLE = {
  pendiente: { background: '#450a0a', color: '#fca5a5' },
  en_proceso: { background: '#431407', color: '#fdba74' },
  resuelto: { background: '#052e16', color: '#86efac' },
  rechazado: { background: '#1f2937', color: '#9ca3af' },
};

export const getEstadoAtencionResponsable = (reporte) => normalizeEstado(
  reporte?.estado_atencion_responsable
    ?? reporte?.estado_atencion
    ?? reporte?.asignacion?.estado_atencion
);

export const getEstadoSeguimientoReporte = (reporte) => {
  const estado = normalizeEstado(reporte?.estado);

  if (estado === 'resuelto' || estado === 'rechazado') {
    return estado;
  }

  const atencion = getEstadoAtencionResponsable(reporte);
  if (
    estado === 'en_proceso' ||
    ['en_atencion', 'atendido', 'cerrado'].includes(atencion)
  ) {
    return 'en_proceso';
  }

  return 'pendiente';
};

export const canManageCitizenReport = (reporte) => (
  normalizeEstado(reporte?.estado) === 'pendiente' &&
  getEstadoSeguimientoReporte(reporte) === 'pendiente'
);
