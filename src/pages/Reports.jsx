import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Droplets, Trees, Flame, Wind, Trash2, Leaf, Search, Lightbulb,
  AlertTriangle, Waves, ChevronLeft, ChevronRight, CalendarDays,
  User, Plus, LayoutGrid, List, X, MapPin, Clock, Heart, Eye, AlertCircle,
  Download, Building2, FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getReportes, getTrendingReportes, getMisReportes, exportReportes, toggleLikeReporte } from '../services/api';
import { helpers } from '../constants/categorias';
import { useAuth } from '../context/AuthContext';
import {
  ESTADO_REPORTE_BADGE_CLASS,
  ESTADO_REPORTE_DOT_CLASS,
  ESTADO_SEGUIMIENTO_LABEL,
  getEstadoSeguimientoReporte,
} from '../utils/reporteEstado';

const severityClass = {
  bajo:    'bg-green-500/15 text-green-400 border border-green-500/30',
  medio:   'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  alto:    'bg-red-500/15 text-red-400 border border-red-500/30',
  critico: 'bg-red-600/25 text-rose-200 border border-red-500/60',
};

const severityLabel = { bajo: 'Baja', medio: 'Media', alto: 'Alta', critico: 'Crítico' };

const typeIcons = {
  agua:                          Droplets,
  aire:                          Wind,
  suelo:                         Trees,
  ruido:                         Flame,
  residuos:                      Trash2,
  luminica:                      Lightbulb,
  deforestacion:                 Trees,
  incendios_forestales:          Flame,
  deslizamientos:                AlertTriangle,
  avalanchas_fluviotorrenciales: Waves,
  otro:                          Leaf,
};

const TYPES_RIESGO        = ['deforestacion', 'incendios_forestales', 'deslizamientos', 'avalanchas_fluviotorrenciales'];
const TYPES_CONTAMINACION = ['agua', 'aire', 'suelo', 'ruido', 'residuos', 'luminica'];
const ALL_TYPES           = [...TYPES_RIESGO, ...TYPES_CONTAMINACION, 'otro'];

const STATUSES   = ['Todos', 'pendiente', 'en_proceso', 'resuelto', 'rechazado'];
const SEVERITIES = ['Todos', 'bajo', 'medio', 'alto', 'critico'];

const GRUPOS = [
  { value: 'Todos',         label: 'Todas las categorías' },
  { value: 'riesgo',        label: '⚠ Riesgo Natural' },
  { value: 'contaminacion', label: '☁ Contaminación' },
];

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Más recientes' },
  { value: 'oldest',     label: 'Más antiguos' },
  { value: 'severity',   label: 'Mayor severidad' },
  { value: 'relevancia', label: 'Más relevantes' },
];

const SEVERITY_ORDER = { critico: 4, alto: 3, medio: 2, bajo: 1 };

const PAGE_SIZE = 20;

function getTypeLabel(tipo) {
  return helpers.obtenerConfig(tipo)?.nombre ?? tipo;
}

function getCategoryColor(tipo) {
  return helpers.obtenerConfig(tipo)?.color ?? '#6B7280';
}

function typesForGroup(group) {
  if (group === 'riesgo')        return TYPES_RIESGO;
  if (group === 'contaminacion') return TYPES_CONTAMINACION;
  return ALL_TYPES;
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return 'hace un momento';
  if (diff < 3600)  return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  const d = Math.floor(diff / 86400);
  return d === 1 ? 'hace 1 día' : `hace ${d} días`;
}

function SkeletonCard({ list }) {
  if (list) {
    return (
      <div className="bg-white/[0.02] border border-gray-800 rounded-xl flex items-center gap-4 animate-pulse py-3 px-4">
        <div className="w-10 h-10 rounded-xl bg-gray-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-800 rounded w-2/3" />
          <div className="h-3 bg-gray-800 rounded w-1/3" />
        </div>
        <div className="w-16 h-5 bg-gray-800 rounded-full shrink-0" />
      </div>
    );
  }
  return (
    <div className="bg-white/[0.02] border border-gray-800 rounded-xl overflow-hidden animate-pulse">
      <div className="h-1 bg-gray-800 w-full" />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-800 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-gray-800 rounded w-1/2" />
            <div className="h-2.5 bg-gray-800 rounded w-1/3" />
          </div>
          <div className="h-5 bg-gray-800 rounded-full w-12 shrink-0" />
        </div>
        <div className="h-4 bg-gray-800 rounded w-4/5" />
        <div className="h-3 bg-gray-800 rounded w-full" />
        <div className="h-3 bg-gray-800 rounded w-3/5" />
        <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
          <div className="h-3 bg-gray-800 rounded w-1/3" />
          <div className="h-5 bg-gray-800 rounded-full w-16" />
        </div>
      </div>
    </div>
  );
}

// ── Card estilo Netflix Top-3 ────────────────────────────────────────────────
function TrendCard({ r, rank, metric }) {
  const cfg   = helpers.obtenerConfig(r.tipo_contaminacion);
  const color = cfg?.color ?? '#6b7280';
  const Icon  = typeIcons[r.tipo_contaminacion] ?? Leaf;
  const lugar = [r.municipio, r.departamento].filter(Boolean).join(', ');
  return (
    <Link
      to={`/reports/${r.id_reporte}`}
      className="group relative flex items-end h-full"
    >
      {/* Número de ranking — estilo Netflix (trazo sin relleno) */}
      <span
        className="absolute bottom-0 left-0 select-none pointer-events-none z-0 font-black italic"
        style={{
          fontSize: '92px',
          lineHeight: 0.82,
          color: 'transparent',
          WebkitTextStroke: '2px #374151',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {rank}
      </span>
      {/* Tarjeta — se superpone al número desde la derecha */}
      <motion.div
        className="relative z-10 ml-12 flex-1 h-full bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group-hover:border-gray-600 transition-colors flex flex-col"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.18 }}
      >
        <div className="h-[3px] w-full shrink-0" style={{ background: color }} />
        <div className="p-3 flex flex-col gap-2 flex-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${color}22` }}
          >
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <p className="text-[11px] font-semibold text-white leading-snug line-clamp-2">{r.titulo}</p>
          {lugar && (
            <p className="text-[10px] text-gray-500 flex items-center gap-1 leading-tight">
              <MapPin size={8} className="shrink-0" />
              <span className="truncate">{lugar}</span>
            </p>
          )}
          <div className={`flex items-center gap-1 text-[11px] font-bold ${metric === 'likes' ? 'text-rose-400' : 'text-blue-400'}`}>
            {metric === 'likes'
              ? <><Heart size={11} className="fill-current shrink-0" />{Number(r.votos_relevancia) || 0} likes</>
              : <><Eye size={11} className="shrink-0" />{Number(r.vistas) || 0} vistas</>
            }
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function Reports() {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const isEntidad  = user?.rol === 'entidad';
  const canExport  = user?.rol === 'admin' || user?.rol === 'moderador';

  const [activeTab,      setActiveTab]      = useState('todos');
  const [exportLoading,  setExportLoading]  = useState(false);

  const [reports,        setReports]        = useState([]);
  const [totalBackend,   setTotalBackend]   = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [search,         setSearch]         = useState('');
  const [groupFilter,    setGroupFilter]    = useState('Todos');
  const [typeFilter,     setTypeFilter]     = useState('Todos');
  const [statusFilter,   setStatusFilter]   = useState('Todos');
  const [severityFilter, setSeverityFilter] = useState('Todos');
  const [sortBy,         setSortBy]         = useState('newest');
  const [page,           setPage]           = useState(1);
  const [viewMode,       setViewMode]       = useState(
    () => localStorage.getItem('reports-view') ?? 'grid'
  );

  useEffect(() => {
    localStorage.setItem('reports-view', viewMode);
  }, [viewMode]);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError('');
      try {
        if (activeTab === 'mis') {
          const { data } = await getMisReportes({ limit: 100 });
          setReports(data.data.reportes ?? []);
          setTotalBackend(data.data.total ?? 0);
        } else {
          const params = {};
          if (typeFilter   !== 'Todos') params.tipo_contaminacion = typeFilter;
          if (statusFilter !== 'Todos') params.estado = statusFilter;
          params.limit = 100;
          const { data } = await getReportes(params);
          setReports(data.data.reportes ?? []);
          setTotalBackend(data.data.total ?? 0);
        }
      } catch {
        setError('No se pudo cargar la lista de reportes.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [typeFilter, statusFilter, activeTab]);

  useEffect(() => {
    if (groupFilter !== 'Todos' && typeFilter !== 'Todos') {
      if (!typesForGroup(groupFilter).includes(typeFilter)) setTypeFilter('Todos');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupFilter]);

  useEffect(() => { setPage(1); }, [search, groupFilter, typeFilter, statusFilter, severityFilter, sortBy]);

  const filtered = reports.filter((r) => {
    if (groupFilter    !== 'Todos' && helpers.obtenerGrupo(r.tipo_contaminacion) !== groupFilter) return false;
    if (severityFilter !== 'Todos' && r.nivel_severidad !== severityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !r.titulo?.toLowerCase().includes(q) &&
        !r.direccion?.toLowerCase().includes(q) &&
        !r.municipio?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'oldest')     return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === 'severity')   return (SEVERITY_ORDER[b.nivel_severidad] ?? 0) - (SEVERITY_ORDER[a.nivel_severidad] ?? 0);
    if (sortBy === 'relevancia') return (Number(b.votos_relevancia) * 3 + Number(b.vistas)) - (Number(a.votos_relevancia) * 3 + Number(a.vistas));
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const statsPills = [
    { key: 'pendiente',   label: 'Pendientes', color: 'text-gray-400' },
    { key: 'en_proceso',  label: 'En proceso', color: 'text-orange-400' },
    { key: 'resuelto',    label: 'Resueltos', color: 'text-green-400' },
    { key: 'rechazado',   label: 'Rechazados', color: 'text-red-400' },
  ].map((p) => ({
    ...p,
    dot: ESTADO_REPORTE_DOT_CLASS[p.key],
    count: filtered.filter((r) => getEstadoSeguimientoReporte(r) === p.key).length,
  }))
   .filter((p) => p.count > 0);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Trending real desde el backend (/reportes/trending) ──────────────────
  const [trending,        setTrending]        = useState(null);
  const [trendingLoading, setTrendingLoading] = useState(true);

  useEffect(() => {
    setTrendingLoading(true);
    getTrendingReportes({ limit: 10 })
      .then(({ data }) => {
        const all = data.data.reportes ?? [];
        // Separar en dos listas: top-5 por likes (votos_relevancia > 0) y top-5 por vistas
        const byLikes  = [...all]
          .filter((r) => Number(r.votos_relevancia) > 0)
          .sort((a, b) => Number(b.votos_relevancia) - Number(a.votos_relevancia))
          .slice(0, 5);
        const byVistas = [...all]
          .sort((a, b) => Number(b.vistas) - Number(a.vistas))
          .slice(0, 5);
        if (!byLikes.length && !byVistas.length) { setTrending(null); return; }
        setTrending({ likes: byLikes, vistas: byVistas });
      })
      .catch(() => setTrending(null))
      .finally(() => setTrendingLoading(false));
  }, []);

  const noData    = !loading && reports.length === 0 && !error;
  const noResults = !loading && reports.length > 0 && filtered.length === 0;

  const activeFilters = [
    search         && { key: 'search',   label: `"${search}"`,                        clear: () => setSearch('') },
    groupFilter    !== 'Todos' && { key: 'group',    label: GRUPOS.find(g => g.value === groupFilter)?.label ?? groupFilter, clear: () => setGroupFilter('Todos') },
    typeFilter     !== 'Todos' && { key: 'type',     label: getTypeLabel(typeFilter),  clear: () => setTypeFilter('Todos') },
    statusFilter   !== 'Todos' && { key: 'status',   label: ESTADO_SEGUIMIENTO_LABEL[statusFilter] ?? statusFilter, clear: () => setStatusFilter('Todos') },
    severityFilter !== 'Todos' && { key: 'severity', label: severityLabel[severityFilter] ?? severityFilter, clear: () => setSeverityFilter('Todos') },
  ].filter(Boolean);

  function clearAllFilters() {
    setSearch('');
    setGroupFilter('Todos');
    setTypeFilter('Todos');
    setStatusFilter('Todos');
    setSeverityFilter('Todos');
    setSortBy('newest');
  }

  const [likesMap, setLikesMap] = useState({});

  function getLikeState(r) {
    const ov = likesMap[r.id_reporte];
    return ov ?? { liked: !!r.liked_by_me, count: Number(r.votos_relevancia) || 0 };
  }

  async function handleLike(e, r) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    const id  = r.id_reporte;
    const cur = getLikeState(r);
    const next = { liked: !cur.liked, count: cur.liked ? Math.max(0, cur.count - 1) : cur.count + 1 };
    setLikesMap(prev => ({ ...prev, [id]: next }));
    try { await toggleLikeReporte(id); }
    catch { setLikesMap(prev => ({ ...prev, [id]: cur })); }
  }

  async function handleExport() {
    setExportLoading(true);
    try {
      const { data } = await exportReportes({});
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `greenalert_reportes_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* silent — server will respond with 403 if not admin/mod */
    } finally {
      setExportLoading(false);
    }
  }

  const selectCls = 'bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-green-500 transition-colors disabled:opacity-40';

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 space-y-6">

      {/* ── HEADER ── */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
              <Leaf className="w-4.5 h-4.5 text-green-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="text-white">Reportes </span>
              <span className="text-green-400">Ambientales</span>
            </h1>
          </div>
          <p className="text-gray-400 mt-1 text-sm pl-0.5">
            {loading
              ? 'Cargando...'
              : noData
                ? 'Sin reportes aún'
                : activeFilters.length > 0
                  ? <><span className="text-green-400 font-semibold">{sorted.length}</span> resultado{sorted.length !== 1 ? 's' : ''} filtrado{sorted.length !== 1 ? 's' : ''} de <span className="text-gray-300">{totalBackend}</span> totales</>
                  : <><span className="text-green-400 font-semibold">{totalBackend}</span> reporte{totalBackend !== 1 ? 's' : ''} registrado{totalBackend !== 1 ? 's' : ''}</>
            }
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {canExport && (
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-colors disabled:opacity-40"
              title="Exportar reportes a CSV"
            >
              <Download size={14} className={exportLoading ? 'animate-bounce' : ''} />
              {exportLoading ? 'Exportando…' : 'Excel'}
            </button>
          )}
          <Link to="/reports/new" className="btn-primary text-sm inline-flex items-center gap-2 shrink-0">
            <Plus size={15} /> Nuevo reporte
          </Link>
        </div>
      </motion.div>

      {/* ── TABS (solo usuarios autenticados) ── */}
      {user && (
        <motion.div
          className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={() => { setActiveTab('todos'); setPage(1); }}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'todos' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText size={13} /> Todos
          </button>
          <button
            onClick={() => { setActiveTab('mis'); setPage(1); }}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'mis' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <User size={13} /> Mis reportes
          </button>
        </motion.div>
      )}

      {/* ── BANNER ENTIDAD ── */}
      {isEntidad && activeTab === 'todos' && (
        <motion.div
          className="flex items-start gap-3 bg-blue-500/8 border border-blue-500/20 rounded-xl px-4 py-3 text-sm"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Building2 size={15} className="text-blue-400 shrink-0 mt-0.5" />
          <span className="text-blue-300">
            Estás viendo todos los reportes públicos.
            {' '}Para gestionar los reportes asignados a tu entidad, visita{' '}
            <Link to="/entidad" className="underline underline-offset-2 hover:text-white transition-colors">
              tu panel de entidad →
            </Link>
          </span>
        </motion.div>
      )}

      {/* ── PANEL DE FILTROS ── */}
      <motion.div
        className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 space-y-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        {/* ── Búsqueda ── */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar reportes..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-8 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading || noData}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              title="Limpiar búsqueda"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* ── Selects + Toggle (segunda fila) ── */}
        <div className="flex gap-2 items-center">
          <div className="flex gap-2 overflow-x-auto pb-0.5 flex-1">
            <select className={selectCls} value={groupFilter}    onChange={(e) => setGroupFilter(e.target.value)}    disabled={loading}>
              {GRUPOS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
            <select className={selectCls} value={typeFilter}     onChange={(e) => setTypeFilter(e.target.value)}     disabled={loading}>
              <option value="Todos">Todos los tipos</option>
              {typesForGroup(groupFilter).map((t) => <option key={t} value={t}>{getTypeLabel(t)}</option>)}
            </select>
            <select className={selectCls} value={statusFilter}   onChange={(e) => setStatusFilter(e.target.value)}   disabled={loading}>
              {STATUSES.map((s) => <option key={s} value={s}>{s === 'Todos' ? 'Todos los estados' : ESTADO_SEGUIMIENTO_LABEL[s]}</option>)}
            </select>
            <select className={selectCls} value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} disabled={loading}>
              {SEVERITIES.map((s) => <option key={s} value={s}>{s === 'Todos' ? 'Toda severidad' : severityLabel[s]}</option>)}
            </select>
            <select className={selectCls} value={sortBy} onChange={(e) => setSortBy(e.target.value)} disabled={loading}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Toggle grid/lista */}
          <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-lg p-1 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Vista grid"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Vista lista"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Badges filtros activos */}
        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div
              className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-800"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-xs text-gray-500">Filtros:</span>
              {activeFilters.map((f) => (
                <motion.button
                  key={f.key}
                  onClick={f.clear}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-green-900/40 border border-green-700/50 text-green-300 hover:bg-green-900/70 transition-colors"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.15 }}
                >
                  {f.label} <X size={11} className="shrink-0 opacity-70" />
                </motion.button>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors underline underline-offset-2 ml-1"
              >
                Limpiar todo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── PILLS DE STATS ── */}
      <AnimatePresence>
        {!loading && statsPills.length > 1 && (
          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
          >
            {statsPills.map((p) => (
              <button
                key={p.key}
                onClick={() => setStatusFilter(statusFilter === p.key ? 'Todos' : p.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border transition-all ${
                  statusFilter === p.key
                    ? 'bg-gray-700 border-gray-500 text-white'
                    : 'bg-gray-900/60 border-gray-700/60 text-gray-400 hover:border-gray-600 hover:text-gray-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.dot}`} />
                {p.label}
                <span className="font-bold tabular-nums">{p.count}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TRENDING ── */}
      {(trendingLoading || trending) && (
        <motion.section
          className="space-y-6"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.05 }}
        >
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-rose-500/15 border border-rose-500/25 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
            </span>
            <span className="text-xs font-bold text-gray-200 uppercase tracking-[0.14em]">En tendencia</span>
            <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-[10px] text-gray-400">
              Top de la semana
            </span>
          </div>

          {/* Skeleton de carga del trending */}
          {trendingLoading && !trending && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-900 border border-gray-800 rounded-xl h-36" />
              ))}
            </div>
          )}

          {trending && (<>
          {/* Top likes — ancho completo */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 pl-1">
              <Heart size={11} className="text-rose-400 fill-current" />
              <span className="text-[11px] text-rose-300 font-semibold uppercase tracking-wide">Más populares</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {trending.likes.map((r, i) => (
                <TrendCard key={`l-${r.id_reporte}`} r={r} rank={i + 1} metric="likes" />
              ))}
            </div>
          </div>

          {/* Top vistas — ancho completo */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 pl-1">
              <Eye size={11} className="text-blue-400" />
              <span className="text-[11px] text-blue-300 font-semibold uppercase tracking-wide">Más vistos</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {trending.vistas.map((r, i) => (
                <TrendCard key={`v-${r.id_reporte}`} r={r} rank={i + 1} metric="vistas" />
              ))}
            </div>
          </div>
          </>)}
        </motion.section>
      )}

      {/* ── SKELETON ── */}
      {loading && (
        <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-3'}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} list={viewMode === 'list'} />)}
        </div>
      )}

      {/* ── ERROR ── */}
      {error && !loading && (
        <div className="card text-center py-12 text-red-400">
          <p>{error}</p>
        </div>
      )}

      {/* ── EMPTY: sin datos ── */}
      {noData && (
        <motion.div
          className="card text-center py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-green-500" />
          </div>
          <p className="font-semibold text-gray-300 text-lg">Aún no hay reportes</p>
          <p className="text-sm mt-2 text-gray-500">Sé el primero en reportar un problema ambiental en tu zona.</p>
          <Link to="/reports/new" className="btn-primary inline-flex items-center gap-2 mt-6">
            <Plus size={15} /> Crear primer reporte
          </Link>
        </motion.div>
      )}

      {/* ── EMPTY: sin resultados con filtros ── */}
      {noResults && (
        <motion.div
          className="card text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 text-gray-500" />
          </div>
          <p className="font-semibold text-gray-200">Sin resultados</p>
          <p className="text-sm text-gray-500 mt-1">
            {typeFilter !== 'Todos'
              ? `No hay reportes de tipo "${getTypeLabel(typeFilter)}"${severityFilter !== 'Todos' ? ` con severidad ${severityLabel[severityFilter]}` : ''}.`
              : severityFilter !== 'Todos'
                ? `No hay reportes con severidad "${severityLabel[severityFilter]}".`
                : statusFilter !== 'Todos'
                  ? `No hay reportes en estado "${ESTADO_SEGUIMIENTO_LABEL[statusFilter]}".`
                  : 'No hay reportes que coincidan con los filtros aplicados.'}
          </p>
          <button
            onClick={clearAllFilters}
            className="mt-4 text-sm text-green-400 hover:text-green-300 transition-colors underline underline-offset-2"
          >
            Limpiar filtros
          </button>
        </motion.div>
      )}

      {/* ── REPORTES ── */}
      {!loading && !error && !noData && !noResults && (
        <>
          {/* Vista GRID */}
          {viewMode === 'grid' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map((r, i) => {
                const Icon         = typeIcons[r.tipo_contaminacion] ?? Leaf;
                const color        = getCategoryColor(r.tipo_contaminacion);
                const lugar        = [r.municipio, r.departamento].filter(Boolean).join(', ') || r.direccion || '—';
                const fecha        = r.created_at ? new Date(r.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
                const estadoSeguimiento = getEstadoSeguimientoReporte(r);
                const sinConfirmar = estadoSeguimiento === 'pendiente';
                const isCritico    = r.nivel_severidad === 'critico';
                const isAlto       = r.nivel_severidad === 'alto';
                const likeState    = getLikeState(r);

                return (
                  <motion.div
                    key={r.id_reporte}
                    onClick={() => navigate(`/reports/${r.id_reporte}`)}
                    className={[
                      'relative cursor-pointer group flex flex-col overflow-hidden rounded-xl',
                      'bg-white/[0.03] backdrop-blur-sm border transition-all duration-200',
                      isCritico
                        ? 'border-rose-500/40 shadow-[0_0_0_1px_rgba(244,63,94,0.15),0_4px_20px_rgba(244,63,94,0.08)]'
                        : isAlto
                          ? 'border-red-500/25 shadow-[0_2px_12px_rgba(0,0,0,0.35)]'
                          : 'border-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.3)]',
                      'hover:border-green-600/60 hover:shadow-[0_4px_24px_rgba(74,222,128,0.08)]',
                    ].join(' ')}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.35 }}
                    whileHover={{ y: -4 }}
                  >
                    {/* Pulso crítico */}
                    {isCritico && (
                      <span className="absolute top-3 right-3 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400" />
                      </span>
                    )}

                    {/* Franja color */}
                    <div className="h-1 w-full shrink-0" style={{ background: color }} />

                    <div className="p-4 flex flex-col gap-3 flex-1">
                      {/* Ícono + tipo + severidad */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${color}20` }}
                        >
                          <Icon className="w-5 h-5 shrink-0" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color }}>
                            {getTypeLabel(r.tipo_contaminacion)}
                          </p>
                          <p className="text-[10px] text-gray-600 flex items-center gap-1 mt-0.5">
                            <Clock size={9} className="shrink-0" />
                            {timeAgo(r.created_at)}
                          </p>
                        </div>
                        <span className={`badge shrink-0 ${severityClass[r.nivel_severidad]}`}>
                          {severityLabel[r.nivel_severidad] ?? r.nivel_severidad}
                        </span>
                      </div>

                      {/* Título */}
                      <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors leading-snug line-clamp-2">
                        {r.titulo}
                      </h3>

                      {/* Descripción */}
                      {r.descripcion && (
                        <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{r.descripcion}</p>
                      )}

                      {/* Ubicación */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-auto">
                        <MapPin size={11} className="shrink-0 text-gray-600" />
                        <span className="truncate">{lugar}</span>
                      </div>

                      {/* Métricas: likes + vistas */}
                      <div className="flex items-center gap-3 text-[11px] text-gray-500">
                        <motion.button
                          onClick={(e) => handleLike(e, r)}
                          className={`inline-flex items-center gap-1 transition-colors ${likeState.liked ? 'text-rose-400' : 'text-gray-500 hover:text-rose-400'}`}
                          whileTap={{ scale: 0.78 }}
                          title={`${likeState.count} ${likeState.count === 1 ? 'like' : 'likes'}${!user ? ' — inicia sesión para votar' : ''}`}
                        >
                          <Heart size={11} className={likeState.liked ? 'fill-current' : ''} />
                          <span className="tabular-nums">{likeState.count}</span>
                        </motion.button>
                        <span className="inline-flex items-center gap-1" title={`${Number(r.vistas) || 0} vistas`}>
                          <Eye size={11} />
                          <span className="tabular-nums">{Number(r.vistas) || 0}</span>
                        </span>
                      </div>

                      <div className="border-t border-gray-800/80" />

                      {/* Estado + fecha */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`badge ${ESTADO_REPORTE_BADGE_CLASS[estadoSeguimiento]}`}>
                            {ESTADO_SEGUIMIENTO_LABEL[estadoSeguimiento]}
                          </span>
                          {sinConfirmar && (
                            <span
                              className="badge bg-gray-700/50 text-gray-500 border border-gray-700/50 cursor-help text-[10px]"
                              title="Este reporte aún no ha sido validado por un moderador"
                            >
                              Sin confirmar
                            </span>
                          )}
                        </div>
                        {fecha && (
                          <span className="flex items-center gap-1 text-[10px] text-gray-600 shrink-0">
                            <CalendarDays size={10} />
                            {fecha}
                          </span>
                        )}
                      </div>

                      {/* Autor */}
                      {(r.autor_nombre || r.autor_apellido) && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <User size={11} className="shrink-0" />
                          <span className="truncate">{[r.autor_nombre, r.autor_apellido].filter(Boolean).join(' ')}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Vista LISTA */}
          {viewMode === 'list' && (
            <div className="flex flex-col gap-2">
              {paginated.map((r, i) => {
                const Icon         = typeIcons[r.tipo_contaminacion] ?? Leaf;
                const color        = getCategoryColor(r.tipo_contaminacion);
                const lugar        = [r.municipio, r.departamento].filter(Boolean).join(', ') || r.direccion || '—';
                const estadoSeguimiento = getEstadoSeguimientoReporte(r);
                const sinConfirmar = estadoSeguimiento === 'pendiente';
                const isCritico    = r.nivel_severidad === 'critico';
                const likeState    = getLikeState(r);
                return (
                  <motion.div
                    key={r.id_reporte}
                    onClick={() => navigate(`/reports/${r.id_reporte}`)}
                    className={[
                      'relative cursor-pointer group flex items-center gap-3 py-2.5 px-4 rounded-xl',
                      'bg-white/[0.02] border transition-all duration-200',
                      isCritico ? 'border-rose-500/30' : 'border-gray-800',
                      'hover:border-green-600/50 hover:bg-white/[0.04]',
                    ].join(' ')}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.3 }}
                    whileHover={{ x: 4 }}
                  >
                    {/* Columna 1 — Ícono (40 px fijo) */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
                      <Icon className="w-5 h-5 shrink-0" style={{ color }} />
                    </div>

                    {/* Columna 2 — Título + ubicación (crece) */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white group-hover:text-green-400 transition-colors truncate">
                        {r.titulo}
                      </p>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={9} className="shrink-0" />
                        <span className="truncate">{lugar}</span>
                        <span className="text-gray-700 shrink-0 mx-0.5">·</span>
                        <Clock size={9} className="shrink-0" />
                        <span className="shrink-0">{timeAgo(r.created_at)}</span>
                      </div>
                    </div>

                    {/* Columna 3 — Severidad (72 px fijo, centrado) */}
                    <div className="hidden sm:flex w-[72px] justify-center shrink-0">
                      <span className={`badge ${severityClass[r.nivel_severidad]}`}>
                        {severityLabel[r.nivel_severidad] ?? r.nivel_severidad}
                      </span>
                    </div>

                    {/* Columna 4 — Métricas (84 px fijo, alineado a la derecha) */}
                    <div className="hidden sm:flex items-center justify-end gap-2.5 w-[84px] shrink-0 text-[11px] text-gray-500">
                      <motion.button
                        onClick={(e) => handleLike(e, r)}
                        className={`inline-flex items-center gap-1 transition-colors ${likeState.liked ? 'text-rose-400' : 'text-gray-500 hover:text-rose-400'}`}
                        whileTap={{ scale: 0.78 }}
                        title={`${likeState.count} ${likeState.count === 1 ? 'like' : 'likes'}${!user ? ' — inicia sesión para votar' : ''}`}
                      >
                        <Heart size={10} className={likeState.liked ? 'fill-current' : ''} />
                        <span className="tabular-nums">{likeState.count}</span>
                      </motion.button>
                      <span className="inline-flex items-center gap-1">
                        <Eye size={10} />
                        <span className="tabular-nums">{Number(r.vistas) || 0}</span>
                      </span>
                    </div>

                    {/* Columna 5 — Estado + icono confirmación (116 px fijo, alineado a la derecha) */}
                    <div className="flex items-center justify-end gap-1.5 w-[116px] shrink-0">
                      <span className={`badge ${ESTADO_REPORTE_BADGE_CLASS[estadoSeguimiento]}`}>
                        {ESTADO_SEGUIMIENTO_LABEL[estadoSeguimiento]}
                      </span>
                      {sinConfirmar && (
                        <AlertCircle
                          size={13}
                          className="text-amber-400/70 shrink-0"
                          title="Sin confirmar por moderador"
                        />
                      )}
                    </div>

                    {/* Columna 6 — Indicador crítico (8 px fijo, siempre reservado) */}
                    <div className="w-2 shrink-0 flex items-center justify-center">
                      {isCritico && (
                        <span className="flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-rose-400 opacity-60" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400" />
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ── PAGINACIÓN ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 gap-4">
              <p className="text-xs text-gray-500">
                Página <span className="text-gray-300 font-medium">{page}</span> de{' '}
                <span className="text-gray-300 font-medium">{totalPages}</span>
                {' · '}{Math.min(PAGE_SIZE, sorted.length - (page - 1) * PAGE_SIZE)} de {sorted.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border border-gray-700 text-gray-300 hover:border-green-600 hover:text-green-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} /> Anterior
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                    .reduce((acc, n, idx, arr) => {
                      if (idx > 0 && arr[idx - 1] !== n - 1) acc.push('…');
                      acc.push(n);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === '…' ? (
                        <span key={`e-${idx}`} className="px-1 text-gray-600 text-sm select-none">…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(item)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            page === item
                              ? 'bg-green-600 text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border border-gray-700 text-gray-300 hover:border-green-600 hover:text-green-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Siguiente <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
