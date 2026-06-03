import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Clock, RefreshCw,
  MapPin, CheckCircle2,
  Loader2, Eye, Filter, X, MessageSquare, Image as ImageIcon, Building2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { asignarReporteEntidad, getEntidades, getReportes, updateReporte, getReporteById } from '../services/api';
import { useToast } from '../context/ToastContext';
import { helpers, CONFIGURACION_CATEGORIAS } from '../constants/categorias';

// â”€â”€ Constantes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ESTADOS = [
  { value: 'pendiente',   label: 'Pendiente',   color: 'text-gray-400',   bg: 'bg-gray-500/15 border-gray-500/30' },
  { value: 'en_proceso',  label: 'En proceso',  color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30' },
  { value: 'resuelto',    label: 'Resuelto',    color: 'text-green-400',  bg: 'bg-green-500/15 border-green-500/30' },
  { value: 'rechazado',   label: 'Rechazado',   color: 'text-red-400',    bg: 'bg-red-500/15 border-red-500/30' },
];

const CATEGORIAS_OPCIONES = Object.entries(CONFIGURACION_CATEGORIAS).map(([value, cfg]) => ({
  value,
  label: cfg.nombre,
  color: cfg.color,
}));

const SEVERIDAD_OPCIONES = [
  { value: 'bajo',    label: 'Baja' },
  { value: 'medio',   label: 'Media' },
  { value: 'alto',    label: 'Alta' },
  { value: 'critico', label: 'Crítico' },
];

const SEVERIDAD_CLASS = {
  bajo:    'bg-green-500/15 text-green-400 border-green-500/30',
  medio:   'bg-orange-500/15 text-orange-400 border-orange-500/30',
  alto:    'bg-red-500/15 text-red-400 border-red-500/30',
  critico: 'bg-red-600/25 text-rose-200 border-red-500/60',
};
const SEVERIDAD_LABEL = { bajo: 'Baja', medio: 'Media', alto: 'Alta', critico: 'Crítico' };
const ESTADOS_VISIBLES = ESTADOS;
const TRANSICIONES_BACKEND = {
  pendiente: ['en_proceso', 'rechazado'],
  en_proceso: ['resuelto', 'rechazado'],
  resuelto: [],
  rechazado: [],
};
const PRIORIDADES_ASIGNACION = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Critica' },
];
const TIPOS_ASIGNACION = [
  { value: 'principal', label: 'Principal' },
  { value: 'apoyo', label: 'Apoyo' },
];
const TIPOS_ASIGNACION_VALIDOS = new Set(TIPOS_ASIGNACION.map((tipo) => tipo.value));

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

function getBadge(estado) {
  const e = ESTADOS.find((x) => x.value === estado);
  return e ?? { label: estado, color: 'text-gray-400', bg: 'bg-gray-500/15 border-gray-500/30' };
}

// â”€â”€ Tarjeta de reporte â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ReporteCard({ reporte, onEstadoChange, onOpenAsignacion, updating }) {
  const categoriaConfig = helpers.obtenerConfig(reporte.tipo_contaminacion);
  const badge = getBadge(reporte.estado);
  const transiciones = TRANSICIONES_BACKEND[reporte.estado] ?? [];
  const [showEv, setShowEv]   = useState(false);
  const [evidencias, setEv]   = useState(null);
  const [evLoading, setEvLoad]= useState(false);
  const [lightbox, setLightbox] = useState(null);

  const accentColor = categoriaConfig?.color ?? '#6B7280';

  const loadEvidencias = async () => {
    if (evidencias !== null) { setShowEv((v) => !v); return; }
    setShowEv(true);
    setEvLoad(true);
    try {
      const { data } = await getReporteById(reporte.id_reporte, true);
      setEv(data.data.evidencias ?? []);
    } catch {
      setEv([]);
    } finally {
      setEvLoad(false);
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex"
      >
        {/* Barra de acento izquierda */}
        <div className="w-1 shrink-0" style={{ background: accentColor }} />

        <div className="flex-1 p-4 flex flex-col gap-3 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span
                  className="badge border"
                  style={{ background: `${accentColor}18`, color: accentColor, borderColor: `${accentColor}40` }}
                >
                  {categoriaConfig?.nombre ?? reporte.tipo_contaminacion}
                </span>
                <span className={`badge border ${SEVERIDAD_CLASS[reporte.nivel_severidad]}`}>
                  {SEVERIDAD_LABEL[reporte.nivel_severidad] ?? reporte.nivel_severidad}
                </span>
                {reporte.subcategoria && (
                  <span className="badge border border-gray-700 bg-gray-800/60 text-gray-400">
                    {reporte.subcategoria}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-gray-100 leading-snug line-clamp-2">{reporte.titulo}</h3>
            </div>
            <span className={`badge border shrink-0 ${badge.bg} ${badge.color}`}>
              {badge.label}
            </span>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            {reporte.municipio && (
              <span className="flex items-center gap-1">
                <MapPin size={11} className="shrink-0" /> {reporte.municipio}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={11} className="shrink-0" /> {formatDate(reporte.created_at)}
            </span>
            {(reporte.autor_nombre || reporte.autor_apellido) && (
              <span className="flex items-center gap-1 ml-auto">
                Por: <span className="text-gray-400 ml-0.5">{`${reporte.autor_nombre ?? ''} ${reporte.autor_apellido ?? ''}`.trim()}</span>
              </span>
            )}
          </div>

          {/* Evidencias expandibles */}
          <div className="border-t border-gray-800 pt-2">
            <button
              onClick={loadEvidencias}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-400 transition-colors"
            >
              {evLoading
                ? <Loader2 size={12} className="animate-spin" />
                : <ImageIcon size={12} />}
              {showEv ? 'Ocultar evidencias' : 'Ver evidencias'}
            </button>

            <AnimatePresence>
              {showEv && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  {evLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    </div>
                  ) : evidencias?.length === 0 ? (
                    <p className="text-xs text-gray-600 italic mt-2">Sin evidencias adjuntas.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {evidencias?.map((ev) => (
                        <button
                          key={ev.id_evidencia}
                          onClick={() => setLightbox(ev)}
                          className="w-16 h-16 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <img
                            src={ev.url_archivo}
                            alt={ev.nombre_original ?? 'Evidencia'}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = ''; e.currentTarget.style.background='#374151'; }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-gray-800">
            <Link
              to={`/reports/${reporte.id_reporte}`}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:border-green-500/40 hover:text-green-400 transition-colors"
            >
              <Eye size={12} /> Ver detalle
            </Link>
            <button
              type="button"
              onClick={() => onOpenAsignacion(reporte)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:border-blue-500/40 hover:text-blue-300 transition-colors"
            >
              <Building2 size={12} /> Asignar entidad
            </button>

            {transiciones.length > 0 && (
              <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                <span className="text-xs text-gray-600">Cambiar a:</span>
                {transiciones.map((est) => {
                  const b = getBadge(est);
                  return (
                    <button
                      key={est}
                      disabled={updating === reporte.id_reporte}
                      onClick={() => onEstadoChange(reporte.id_reporte, est)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border cursor-pointer active:scale-95 transition-all disabled:opacity-40 ${b.bg} ${b.color}`}
                    >
                      {updating === reporte.id_reporte ? (
                        <Loader2 size={10} className="animate-spin inline" />
                      ) : (
                        <>a {b.label}</>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightbox(null)}
                className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-gray-300 hover:text-white hover:border-gray-400 transition-all z-10"
              >
                <X size={14} />
              </button>
              <img
                src={lightbox.url_archivo}
                alt={lightbox.nombre_original ?? 'Evidencia'}
                className="w-full rounded-xl border border-gray-700 shadow-2xl max-h-[80vh] object-contain bg-gray-950"
              />
              {lightbox.nombre_original && (
                <p className="text-xs text-gray-400 text-center mt-2">{lightbox.nombre_original}</p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// â”€â”€ Pagina principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function Moderacion() {
  const { showToast } = useToast();

  const [reportes,       setReportes]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [updating,       setUpdating]       = useState(null);
  const [filtroEstado,   setFiltroEstado]   = useState('pendiente');
  const [filtroTipo,     setFiltroTipo]     = useState('');
  const [filtroSeveridad,setFiltroSeveridad]= useState('');
  const [rechazoModal,   setRechazoModal]   = useState(null); // { id, nuevoEstado }
  const [rechazoComent,  setRechazoComent]  = useState('');
  const [entidades,      setEntidades]      = useState([]);
  const [asignacionModal,setAsignacionModal]= useState(null);
  const [asignacionForm, setAsignacionForm] = useState({ id_entidad: '', prioridad: 'media', tipo_asignacion: 'principal' });
  const [asignando,      setAsignando]      = useState(false);

  const hayFiltrosExtra = filtroTipo !== '' || filtroSeveridad !== '';

  const limpiarFiltros = () => {
    setFiltroTipo('');
    setFiltroSeveridad('');
  };

  const fetchReportes = useCallback(async () => {
    setLoading(true);
    try {
      const params = { estado: filtroEstado, limit: 50 };
      if (filtroTipo)      params.tipo_contaminacion = filtroTipo;
      if (filtroSeveridad) params.nivel_severidad    = filtroSeveridad;
      const { data } = await getReportes(params);
      setReportes(data.data.reportes ?? []);
    } catch {
      showToast('No se pudieron cargar los reportes.', 'error');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado, filtroTipo, filtroSeveridad]);

  useEffect(() => { fetchReportes(); }, [fetchReportes]);

  useEffect(() => {
    getEntidades()
      .then(({ data }) => setEntidades(data?.data?.entidades ?? []))
      .catch(() => setEntidades([]));
  }, []);

  const handleEstadoChange = async (id, nuevoEstado) => {
    if (nuevoEstado === 'rechazado' || nuevoEstado === 'resuelto') {
      setRechazoComent('');
      setRechazoModal({ id, nuevoEstado });
      return;
    }
    setUpdating(id);
    try {
      await updateReporte(id, { estado: nuevoEstado });
      showToast(`Estado actualizado a "${getBadge(nuevoEstado).label}".`, 'success');
      setReportes((prev) => prev.filter((r) => r.id_reporte !== id));
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Error al actualizar el estado.', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const handleConfirmarRechazo = async () => {
    if (!rechazoComent.trim()) return;
    const { id, nuevoEstado } = rechazoModal;
    setUpdating(id);
    try {
      await updateReporte(id, { estado: nuevoEstado, comentario_moderacion: rechazoComent.trim() });
      showToast(`Reporte actualizado a "${getBadge(nuevoEstado).label}".`, 'success');
      setReportes((prev) => prev.filter((r) => r.id_reporte !== id));
      setRechazoModal(null);
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Error al actualizar el reporte.', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const handleOpenAsignacion = (reporte) => {
    setAsignacionModal(reporte);
    setAsignacionForm({
      id_entidad: entidades[0]?.id_entidad ? String(entidades[0].id_entidad) : '',
      prioridad: reporte.nivel_severidad === 'critico' ? 'critica' : 'media',
      tipo_asignacion: 'principal',
    });
  };

  const handleAsignarEntidad = async () => {
    if (!asignacionModal || !asignacionForm.id_entidad) return;
    if (!TIPOS_ASIGNACION_VALIDOS.has(asignacionForm.tipo_asignacion)) {
      showToast('El tipo de asignacion debe ser Principal o Apoyo.', 'error');
      return;
    }
    setAsignando(true);
    try {
      await asignarReporteEntidad(asignacionModal.id_reporte, {
        id_entidad: Number(asignacionForm.id_entidad),
        prioridad: asignacionForm.prioridad,
        tipo_asignacion: asignacionForm.tipo_asignacion,
      });
      showToast('Reporte asignado a la entidad correctamente.', 'success');
      setAsignacionModal(null);
    } catch (err) {
      showToast(err.response?.data?.message ?? 'No se pudo asignar la entidad.', 'error');
    } finally {
      setAsignando(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Encabezado */}
      <div className="flex items-start sm:items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Panel de <span className="text-green-400">Moderacion</span>
            </h1>
          </div>
          <p className="text-sm text-gray-500 pl-[52px]">
            {loading
              ? 'Cargando reportes...'
              : `${reportes.length} reporte${reportes.length !== 1 ? 's' : ''} en estado "${getBadge(filtroEstado).label}"`}
          </p>
        </div>
        <button
          onClick={fetchReportes}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-green-500/40 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* Barra de filtros - card unificada */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 space-y-3">
        {/* Tabs de estado */}
        <div className="flex gap-1.5 flex-wrap">
          {ESTADOS_VISIBLES.map((e) => (
            <button
              key={e.value}
              onClick={() => setFiltroEstado(e.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                filtroEstado === e.value
                  ? `${e.bg} ${e.color}`
                  : 'bg-gray-800/50 text-gray-400 border-gray-700/60 hover:border-gray-600 hover:text-gray-300'
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800" />

        {/* Filtros adicionales */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
            <Filter size={13} /> Filtrar:
          </div>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="">Todas las categorias</option>
            {CATEGORIAS_OPCIONES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            value={filtroSeveridad}
            onChange={(e) => setFiltroSeveridad(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="">Todas las severidades</option>
            {SEVERIDAD_OPCIONES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {hayFiltrosExtra && (
            <button
              onClick={limpiarFiltros}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors border border-gray-700 hover:border-red-500/50 rounded-lg px-2.5 py-1.5"
            >
              <X size={12} /> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Lista de reportes */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      ) : reportes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-gray-600" />
            </div>
            <div className="absolute inset-0 rounded-full border border-gray-700 animate-ping opacity-30" />
          </div>
          <div className="text-center">
            <p className="text-gray-300 text-sm font-medium">Todo en orden</p>
            <p className="text-gray-600 text-xs mt-1">
              No hay reportes con estado <span className="text-gray-400">&quot;{getBadge(filtroEstado).label}&quot;</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {reportes.map((r) => (
              <ReporteCard
                key={r.id_reporte}
                reporte={r}
                onEstadoChange={handleEstadoChange}
                onOpenAsignacion={handleOpenAsignacion}
                updating={updating}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {asignacionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-start gap-3 mb-4">
                <Building2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-100 mb-1">Asignar entidad responsable</h3>
                  <p className="text-xs text-gray-400 line-clamp-2">{asignacionModal.titulo}</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="block text-xs text-gray-500 mb-1">Entidad</span>
                  <select
                    value={asignacionForm.id_entidad}
                    onChange={(e) => setAsignacionForm((form) => ({ ...form, id_entidad: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none"
                  >
                    {entidades.length === 0 ? (
                      <option value="">Sin entidades activas</option>
                    ) : entidades.map((entidad) => (
                      <option key={entidad.id_entidad} value={entidad.id_entidad}>{entidad.nombre}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="block text-xs text-gray-500 mb-1">Prioridad</span>
                  <select
                    value={asignacionForm.prioridad}
                    onChange={(e) => setAsignacionForm((form) => ({ ...form, prioridad: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none"
                  >
                    {PRIORIDADES_ASIGNACION.map((prioridad) => (
                      <option key={prioridad.value} value={prioridad.value}>{prioridad.label}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="block text-xs text-gray-500 mb-1">Tipo de asignacion</span>
                  <select
                    value={asignacionForm.tipo_asignacion}
                    onChange={(e) => setAsignacionForm((form) => ({ ...form, tipo_asignacion: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none"
                  >
                    {TIPOS_ASIGNACION.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex gap-3 justify-end mt-5">
                <button
                  onClick={() => setAsignacionModal(null)}
                  disabled={asignando}
                  className="btn-secondary text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAsignarEntidad}
                  disabled={asignando || !asignacionForm.id_entidad}
                  className="text-sm font-semibold px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-95 disabled:opacity-40"
                >
                  {asignando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Asignar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de comentario obligatorio para cierre */}
      <AnimatePresence>
        {rechazoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-start gap-3 mb-4">
                <MessageSquare className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-100 mb-1">
                    {rechazoModal.nuevoEstado === 'resuelto' ? 'Resolver reporte' : 'Rechazar reporte'}
                  </h3>
                  <p className="text-xs text-gray-400">Debes registrar un comentario para cerrar este cambio de estado.</p>
                </div>
              </div>
              <textarea
                value={rechazoComent}
                onChange={(e) => setRechazoComent(e.target.value)}
                placeholder={rechazoModal.nuevoEstado === 'resuelto'
                  ? 'Ej: La situacion fue atendida y se verifico el cierre del caso.'
                  : 'Ej: El reporte esta duplicado, fuera de area o no tiene evidencia suficiente.'}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 focus:border-red-500 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none resize-none transition-colors mb-4"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setRechazoModal(null)}
                  disabled={updating === rechazoModal.id}
                  className="btn-secondary text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarRechazo}
                  disabled={!rechazoComent.trim() || updating === rechazoModal.id}
                  className="text-sm font-semibold px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-all active:scale-95 disabled:opacity-40"
                >
                  {updating === rechazoModal.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
