import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Droplets, Trees, Flame, Wind, Trash2, Leaf,
  Waves, ArrowLeft, MapPin, Calendar, Eye,
  User, ShieldCheck, ImageOff, Sparkles,
  Pencil, Check, AlertTriangle, Loader2, MessageSquare,
  ChevronDown, ChevronUp, Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getReporteById, updateReporte, deleteReporte } from '../services/api';
import { helpers } from '../constants/categorias';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LikeButton from '../components/LikeButton';
import MediaLightbox from '../components/MediaLightbox';
import {
  canManageCitizenReport,
  ESTADO_REPORTE_BADGE_CLASS,
  ESTADO_SEGUIMIENTO_LABEL,
  getEstadoSeguimientoReporte,
  normalizeEstado,
} from '../utils/reporteEstado';
import { getValidIaAnalysis } from '../utils/reporteIA';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const typeIcons = {
  agua: Droplets, aire: Wind, suelo: Leaf,
  residuos: Trash2,
  deforestacion: Trees, incendios_forestales: Flame,
  avalanchas_fluviotorrenciales: Waves,
  otro: Leaf,
};

const reportPin = L.divIcon({
  className: '',
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22S28 24.5 28 14C28 6.27 21.73 0 14 0z" fill="#22c55e" stroke="white" stroke-width="1.5"/>
    <circle cx="14" cy="14" r="5.5" fill="white"/>
  </svg>`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -36],
});

const DETAIL_MAP_TILES = [
  {
    key: 'light',
    label: 'Claro',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    key: 'dark',
    label: 'Oscuro',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    key: 'satellite',
    label: 'Satélite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP',
    labelsUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
  },
];

function ReportDetailMap({ lat, lon }) {
  const [mapStyle, setMapStyle] = useState(
    () => localStorage.getItem('ga-map-style') || 'light'
  );
  const tile = DETAIL_MAP_TILES.find((t) => t.key === mapStyle) ?? DETAIL_MAP_TILES[0];

  const handleStyleChange = (key) => {
    setMapStyle(key);
    localStorage.setItem('ga-map-style', key);
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-700/60 h-56 sm:h-72 z-0" style={{ isolation: 'isolate' }}>
      {/* Selector de estilo */}
      <div className="absolute top-2 right-2 z-[1000] flex gap-0.5 bg-gray-950/90 backdrop-blur border border-gray-700 rounded-lg p-0.5">
        {DETAIL_MAP_TILES.map((t) => (
          <button
            key={t.key}
            onClick={() => handleStyleChange(t.key)}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
              mapStyle === t.key ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <MapContainer
        center={[lat, lon]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl
        scrollWheelZoom
      >
        <TileLayer
          key={tile.key}
          url={tile.url}
          attribution={tile.attribution}
          maxZoom={19}
        />
        {tile.labelsUrl && <TileLayer url={tile.labelsUrl} maxZoom={19} opacity={1} />}
        <Marker position={[lat, lon]} icon={reportPin} />
      </MapContainer>
    </div>
  );
}
const severityClass = {
  bajo:    'bg-green-500/15 text-green-400 border border-green-500/30',
  medio:   'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  alto:    'bg-red-500/15 text-red-400 border border-red-500/30',
  critico: 'bg-red-600/25 text-rose-200 border border-red-500/60',
};
const severityLabel = { bajo: 'Baja', medio: 'Media', alto: 'Alta', critico: 'Crítico' };

const rolLabel = {
  ciudadano: 'Ciudadano', moderador: 'Moderador', admin: 'Administrador',
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

function ImageCard({ ev, onOpen }) {
  const [err, setErr] = useState(false);
  const isImage = ev.mime_type?.startsWith('image/') || ev.tipo_archivo === 'imagen';
  if (!isImage) return null;
  const handleKey = (e) => {
    if (!err && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onOpen?.();
    }
  };
  return (
    <button
      type="button"
      onClick={!err ? onOpen : undefined}
      onKeyDown={handleKey}
      disabled={err}
      aria-label={`Ampliar evidencia ${ev.nombre_original ?? ''}`.trim()}
      className={[
        'group relative aspect-video rounded-lg overflow-hidden bg-gray-800 border border-gray-700 text-left',
        err ? 'cursor-default' : 'cursor-zoom-in hover:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/60',
        'transition-colors',
      ].join(' ')}
    >
      {err ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-600">
          <ImageOff size={28} />
          <span className="text-xs">{ev.nombre_original ?? 'Imagen'}</span>
        </div>
      ) : (
        <>
          <img
            src={ev.url_archivo}
            alt={ev.nombre_original ?? 'Evidencia'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={() => setErr(true)}
            loading="lazy"
          />
          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        </>
      )}
    </button>
  );
}

function IaBadge({ iaAnalysis, report }) {
  const [open, setOpen] = useState(false);
  const { principal, etiquetas, confianza } = iaAnalysis;
  const coincide = normalizeEstado(principal.label) === normalizeEstado(report.tipo_contaminacion);

  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 overflow-hidden">
      {/* Pill / header colapsable */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-purple-500/5 transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <span className="text-xs font-semibold uppercase tracking-wide text-purple-300">Análisis con IA</span>
        <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30 tabular-nums">
          {Math.round(confianza)}% confianza
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-purple-400 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
      </button>

      {/* Contenido expandido */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-purple-500/20 space-y-3">
              <p className="text-sm text-gray-300">
                Categoría principal detectada:{' '}
                <span className="font-semibold text-white">{principal.nombre ?? principal.label}</span>{' '}
                {coincide
                  ? <span className="text-emerald-300">— coincide con la categoría del reporte.</span>
                  : <span className="text-amber-300">— el usuario eligió una categoría distinta.</span>
                }
              </p>
              <ul className="space-y-2">
                {etiquetas.slice(0, 5).map((e, idx) => {
                  const score = Math.max(0, Math.min(100, Number(e.score) || 0));
                  const esTop = idx === 0;
                  return (
                    <li key={`${e.label}-${idx}`} className="text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className={esTop ? 'text-white font-medium' : 'text-gray-400'}>
                          {e.nombre ?? e.label}
                        </span>
                        <span className="font-mono text-gray-500">{score}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${esTop ? 'bg-purple-400' : 'bg-purple-500/40'}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VideoCard({ ev }) {
  const isVideo = ev.mime_type?.startsWith('video/') || ev.tipo_archivo === 'video';
  if (!isVideo) return null;
  return (
    <div className="rounded-lg overflow-hidden bg-gray-800 border border-gray-700 col-span-full">
      <video
        src={ev.url_archivo}
        controls
        preload="metadata"
        className="w-full max-h-72 object-contain"
      />
      <p className="text-xs text-gray-500 px-3 py-1.5 truncate">{ev.nombre_original ?? 'Video'}</p>
    </div>
  );
}

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [report,    setReport]    = useState(null);
  const [autor,     setAutor]     = useState(null);
  const [evidencias,setEvidencias]= useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  // Edición inline (solo dueño + estado pendiente)
  const [editMode,    setEditMode]    = useState(false);
  const [editForm,    setEditForm]    = useState(null);
  const [editError,   setEditError]   = useState('');
  const [saving,      setSaving]      = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(false);
  const [deleting,    setDeleting]    = useState(false);

  // Visor de evidencias
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    const storedUser = (() => { try { return JSON.parse(localStorage.getItem('ga_user')); } catch { return null; } })();
    const uid = storedUser?.id_usuario ?? 'anon';
    const seenKey = 'ga_seen_reports';
    const seen = (() => { try { return JSON.parse(localStorage.getItem(seenKey) || '{}'); } catch { return {}; } })();
    const alreadySeen = Array.isArray(seen[uid]) && seen[uid].includes(Number(id));

    getReporteById(id, alreadySeen)
      .then(({ data }) => {
        setReport(data.data.reporte);
        setAutor(data.data.autor ?? null);
        setEvidencias(data.data.evidencias ?? []);
        if (!alreadySeen) {
          seen[uid] = [...(seen[uid] ?? []), Number(id)];
          localStorage.setItem(seenKey, JSON.stringify(seen));
        }
      })
      .catch(() => setError('No se pudo cargar el reporte.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center text-gray-500">
        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Cargando reporte...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-red-400 mb-4">{error || 'Reporte no encontrado.'}</p>
        <button onClick={() => navigate('/reports')} className="btn-secondary text-sm">
          Volver a Reportes
        </button>
      </div>
    );
  }

  const cfg      = helpers.obtenerConfig(report.tipo_contaminacion);
  const catColor = cfg?.color ?? '#6B7280';
  const catNombre= cfg?.nombre ?? report.tipo_contaminacion;
  const Icon     = typeIcons[report.tipo_contaminacion] ?? Leaf;
  const location = [report.municipio, report.departamento].filter(Boolean).join(', ') || report.direccion;
  const imageEvidencias = evidencias.filter(
    (e) => e.mime_type?.startsWith('image/') || e.tipo_archivo === 'imagen'
  );
  const videoEvidencias = evidencias.filter(
    (e) => e.mime_type?.startsWith('video/') || e.tipo_archivo === 'video'
  );
  const hasMedia = imageEvidencias.length > 0 || videoEvidencias.length > 0;
  // Lightbox: solo navega entre imágenes (los videos tienen su propio reproductor inline).
  const mediaItems = imageEvidencias;
  const estadoSeguimiento = getEstadoSeguimientoReporte(report);
  const iaAnalysis = getValidIaAnalysis(report);

  // Permisos: solo el dueño puede editar/eliminar mientras esté pendiente.
  const isOwner    = user && report.id_usuario === user.id_usuario;
  const canManage  = isOwner && canManageCitizenReport(report);

  const startEdit = () => {
    setEditForm({
      titulo:       report.titulo       ?? '',
      descripcion:  report.descripcion  ?? '',
      direccion:    report.direccion    ?? '',
      municipio:    report.municipio    ?? '',
      departamento: report.departamento ?? '',
    });
    setEditError('');
    setEditMode(true);
  };

  const cancelEdit = () => {
    if (saving) return;
    setEditMode(false);
    setEditForm(null);
    setEditError('');
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;
    const titulo      = editForm.titulo.trim();
    const descripcion = editForm.descripcion.trim();
    if (titulo.length < 3) {
      setEditError('El título debe tener al menos 3 caracteres.');
      return;
    }
    if (titulo.length > 150) {
      setEditError('El título no puede superar 150 caracteres.');
      return;
    }
    if (descripcion.length > 2000) {
      setEditError('La descripción no puede superar 2000 caracteres.');
      return;
    }
    setEditError('');
    setSaving(true);
    try {
      const { data } = await updateReporte(id, {
        titulo,
        descripcion,
        direccion:    editForm.direccion.trim(),
        municipio:    editForm.municipio.trim(),
        departamento: editForm.departamento.trim(),
      });
      setReport(data.data.reporte ?? { ...report, titulo, descripcion, direccion: editForm.direccion.trim(), municipio: editForm.municipio.trim(), departamento: editForm.departamento.trim() });
      setEditMode(false);
      setEditForm(null);
      showToast('Reporte actualizado.', 'success');
    } catch (err) {
      setEditError(err.response?.data?.message ?? 'No se pudo actualizar el reporte.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteReporte(id);
      showToast('Reporte eliminado.', 'success');
      navigate('/profile');
    } catch (err) {
      showToast(err.response?.data?.message ?? 'No se pudo eliminar el reporte.', 'error');
      setDeleting(false);
      setConfirmDel(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      {/* Sticky back — mobile only */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-2 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/60 flex items-center lg:hidden mb-4">
        <button
          onClick={() => navigate('/reports')}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      </div>

      {/* Desktop back */}
      <button
        onClick={() => navigate('/reports')}
        className="hidden lg:flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Reportes
      </button>

      <div className="card overflow-hidden flex flex-col gap-0 !p-0">
        {/* Color banner */}
        <div className="h-1.5 w-full shrink-0" style={{ background: catColor }} />

        <div className="lg:flex lg:divide-x lg:divide-gray-800">
          {/* LEFT: contenido principal */}
          <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4 sm:justify-between">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: catColor + '20', border: `1.5px solid ${catColor}55` }}
              >
                <Icon className="w-5 h-5" style={{ color: catColor }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: catColor }}>
                  {catNombre}
                </p>
                {editMode ? (
                  <>
                    <input
                      type="text"
                      value={editForm.titulo}
                      onChange={(e) => setEditForm((s) => ({ ...s, titulo: e.target.value }))}
                      maxLength={150}
                      autoFocus
                      className="w-full bg-gray-800 border border-blue-500/50 rounded-lg px-3 py-2 text-lg sm:text-xl font-bold text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <p className="text-[10px] text-gray-600 mt-1 text-right">{editForm.titulo.length}/150</p>
                  </>
                ) : (
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-snug">{report.titulo}</h1>
                )}
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                {report.subcategoria && (
                  <span className="badge border border-gray-600 bg-gray-700/40 text-gray-300">
                    {report.subcategoria}
                  </span>
                )}
                <span className={`badge ${severityClass[report.nivel_severidad]}`}>
                  {severityLabel[report.nivel_severidad] ?? report.nivel_severidad}
                </span>
                <span className={`badge ${ESTADO_REPORTE_BADGE_CLASS[estadoSeguimiento] ?? ESTADO_REPORTE_BADGE_CLASS.pendiente}`}>
                  {ESTADO_SEGUIMIENTO_LABEL[estadoSeguimiento] ?? estadoSeguimiento}
                </span>
              </div>
              {/* Vistas (izq) y like (der) debajo de los badges */}
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 text-xs text-gray-400"
                  title="Vistas del reporte"
                >
                  <Eye size={13} />
                  <span className="tabular-nums">{Number(report.vistas) || 0}</span>
                  <span>{(Number(report.vistas) || 0) === 1 ? 'vista' : 'vistas'}</span>
                </span>
                <span className="w-px h-3.5 bg-gray-700" />
                <LikeButton
                  id_reporte={report.id_reporte}
                  liked={!!report.liked_by_me}
                  count={Number(report.votos_relevancia) || 0}
                  ownerId={report.id_usuario}
                  size="sm"
                  onChange={({ liked, count }) =>
                    setReport((r) => (r ? { ...r, liked_by_me: liked, votos_relevancia: count } : r))
                  }
                />
              </div>
            </div>
          </div>

          {/* Acciones del propietario (editar / eliminar) */}
          {canManage && !editMode && (
            <div className="flex items-center gap-2 -mt-2">
              <span className="text-[11px] text-gray-500 mr-auto flex items-center gap-1">
                <Pencil size={11} /> Puedes editar o eliminar este reporte mientras esté pendiente.
              </span>
              <button
                type="button"
                onClick={startEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 transition-colors"
              >
                <Pencil size={13} /> Editar
              </button>
              <button
                type="button"
                onClick={() => setConfirmDel(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-colors"
              >
                <Trash2 size={13} /> Eliminar
              </button>
            </div>
          )}

          {/* Description */}
          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Descripción</label>
                <textarea
                  value={editForm.descripcion}
                  onChange={(e) => setEditForm((s) => ({ ...s, descripcion: e.target.value }))}
                  maxLength={2000}
                  rows={5}
                  placeholder="Describe el problema ambiental con el mayor detalle posible…"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-y"
                />
                <p className="text-[10px] text-gray-600 mt-1 text-right">{editForm.descripcion.length}/2000</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Dirección</label>
                <input
                  type="text"
                  value={editForm.direccion}
                  onChange={(e) => setEditForm((s) => ({ ...s, direccion: e.target.value }))}
                  maxLength={255}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Municipio</label>
                  <input
                    type="text"
                    value={editForm.municipio}
                    onChange={(e) => setEditForm((s) => ({ ...s, municipio: e.target.value }))}
                    maxLength={100}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Departamento</label>
                  <input
                    type="text"
                    value={editForm.departamento}
                    onChange={(e) => setEditForm((s) => ({ ...s, departamento: e.target.value }))}
                    maxLength={100}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <p className="text-[11px] text-gray-500 flex items-start gap-1.5">
                <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                La categoría, severidad y coordenadas no son modificables desde aquí.
              </p>

              {editError && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
                  <AlertTriangle size={13} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-300 leading-relaxed">{editError}</p>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="btn-secondary text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={saving || !editForm.titulo.trim()}
                  className="text-sm font-semibold px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving ? <><Loader2 size={13} className="animate-spin" /> Guardando…</> : <><Check size={13} /> Guardar cambios</>}
                </button>
              </div>
            </div>
          ) : report.descripcion ? (
            <p className="text-gray-300 leading-relaxed text-base text-justify">
              {report.descripcion}
            </p>
          ) : (
            <p className="text-gray-500 italic text-sm">Sin descripción proporcionada.</p>
          )}

          {/* IA colapsable */}
          {iaAnalysis && <IaBadge iaAnalysis={iaAnalysis} report={report} />}

          {/* Comentario del moderador */}
          {report.comentario_moderacion && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/25">
              <MessageSquare className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-300 mb-1">Comentario del moderador</p>
                <p className="text-sm text-gray-300 leading-relaxed">{report.comentario_moderacion}</p>
              </div>
            </div>
          )}

          {/* Evidencias */}
          {hasMedia && (
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">
                Evidencias ({evidencias.length})
              </p>
              <div className={`grid gap-3 ${
                imageEvidencias.length === 1 && videoEvidencias.length === 0
                  ? 'grid-cols-1 max-w-sm'
                  : 'grid-cols-2 sm:grid-cols-3'
              }`}>
                {videoEvidencias.map((ev) => (
                  <VideoCard key={ev.id_evidencia} ev={ev} />
                ))}
                {imageEvidencias.map((ev) => {
                  const idx = mediaItems.findIndex((m) => m.id_evidencia === ev.id_evidencia);
                  return (
                    <ImageCard
                      key={ev.id_evidencia}
                      ev={ev}
                      onOpen={() => setLightboxIndex(idx)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          </div>{/* end LEFT */}

          {/* RIGHT: mapa + meta */}
          <div className="flex flex-col gap-5 p-6 sm:p-8 lg:w-80 lg:shrink-0 border-t border-gray-800 lg:border-t-0">

          {/* Mapa de ubicación */}
          {report.latitud && report.longitud && (
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Ubicación en el mapa
              </p>
              <ReportDetailMap
                lat={parseFloat(report.latitud)}
                lon={parseFloat(report.longitud)}
              />
            </div>
          )}

          {/* Meta grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4 pt-4 border-t border-gray-800 lg:border-t-0 text-sm">
            {location && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-green-400 shrink-0" />
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Ubicación</p>
                  <p className="text-gray-200">{location}</p>
                  {report.direccion && location !== report.direccion && (
                    <p className="text-gray-500 text-xs mt-0.5">{report.direccion}</p>
                  )}
                </div>
              </div>
            )}

            {report.latitud && report.longitud && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-gray-600 shrink-0" />
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Coordenadas</p>
                  <p className="text-gray-400 font-mono text-xs">
                    {parseFloat(report.latitud).toFixed(6)}, {parseFloat(report.longitud).toFixed(6)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 mt-0.5 text-green-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Registrado</p>
                <p className="text-gray-200">{formatDate(report.created_at)}</p>
              </div>
            </div>

            {/* Autor */}
            {autor && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center overflow-hidden shrink-0">
                  {autor.avatar_url
                    ? <img src={autor.avatar_url} alt={autor.nombre} className="w-full h-full object-cover" />
                    : <User className="w-4 h-4 text-green-400" />}
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Creado por</p>
                  <p className="text-sm text-gray-200 font-medium">
                    {autor.nombre} {autor.apellido}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    {(autor.rol === 'moderador' || autor.rol === 'admin') && (
                      <ShieldCheck className="w-3 h-3 text-blue-400" />
                    )}
                    {rolLabel[autor.rol] ?? autor.rol}
                  </p>
                </div>
              </div>
            )}

            {report.updated_at && report.updated_at !== report.created_at && (
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-gray-600 shrink-0" />
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Última actualización</p>
                  <p className="text-gray-400 text-xs">{formatDate(report.updated_at)}</p>
                </div>
              </div>
            )}

            {report.confianza_evidencia != null && (
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 mt-0.5 text-gray-600 shrink-0" />
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Score de evidencia</p>
                  <p className="text-xs">
                    <span className={`font-semibold ${
                      Number(report.confianza_evidencia) >= 70 ? 'text-green-400'
                      : Number(report.confianza_evidencia) >= 40 ? 'text-amber-400'
                      : 'text-red-400'
                    }`}>{Math.round(Number(report.confianza_evidencia))}%</span>
                    <span className="text-gray-600 ml-1">calidad de evidencias</span>
                  </p>
                </div>
              </div>
            )}
          </div>
          </div>{/* end RIGHT */}
        </div>{/* end lg:flex */}
      </div>

      {/* Confirmación de eliminación */}
      <AnimatePresence>
        {confirmDel && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget && !deleting) setConfirmDel(false); }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-start gap-3 mb-5">
                <div className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">¿Eliminar reporte?</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Esta acción es permanente y no se puede deshacer. El reporte y sus evidencias serán borrados.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmDel(false)}
                  disabled={deleting}
                  className="btn-secondary text-sm"
                  autoFocus
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-sm font-semibold px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {deleting ? <><Loader2 size={13} className="animate-spin" /> Eliminando…</> : <><Trash2 size={13} /> Eliminar</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox para evidencias de imagen */}
      <MediaLightbox
        items={mediaItems}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChange={setLightboxIndex}
      />
    </motion.div>
  );
}
