import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  ExternalLink,
  FileText,
  Filter,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  actualizarAtencionEntidad,
  getMiReporteEntidad,
  getMisAlertasEntidad,
  getMisAlertasNoLeidasCountEntidad,
  getMisReportesEntidad,
  marcarAlertaEntidadLeida,
  marcarTodasAlertasEntidadLeidas,
} from '../services/api';
import { useToast } from '../context/ToastContext';
import { helpers } from '../constants/categorias';

const PAGE_SIZE_OPTIONS = [8, 12, 20, 50];
const ALERTAS_LIMIT = 8;

const PRIORIDAD_LABEL = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Critica',
};

const PRIORIDAD_CLASS = {
  baja: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  media: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  alta: 'border-amber-500/35 bg-amber-500/10 text-amber-300',
  critica: 'border-rose-500/50 bg-rose-500/15 text-rose-200',
};

const TIPO_ASIGNACION_LABEL = {
  principal: 'Principal',
  apoyo: 'Apoyo',
};

const TIPO_ASIGNACION_CLASS = {
  principal: 'border-green-500/35 bg-green-500/10 text-green-300',
  apoyo: 'border-cyan-500/35 bg-cyan-500/10 text-cyan-300',
};

const ESTADO_ATENCION_LABEL = {
  pendiente: 'Pendiente',
  en_atencion: 'En atención',
  atendido: 'Atendido',
  cerrado: 'Cerrado',
};

const ESTADO_ATENCION_CLASS = {
  pendiente: 'border-slate-600 bg-slate-800/70 text-slate-300',
  en_atencion: 'border-amber-500/35 bg-amber-500/10 text-amber-300',
  atendido: 'border-green-500/35 bg-green-500/10 text-green-300',
  cerrado: 'border-zinc-600 bg-zinc-800/70 text-zinc-300',
};

const ESTADO_REPORTE_LABEL = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  resuelto: 'Resuelto',
  rechazado: 'Rechazado',
};

const ATENCION_OPTIONS = ['pendiente', 'en_atencion', 'atendido', 'cerrado'];

const formatDate = (iso) => (
  iso ? new Date(iso).toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : '-'
);

const formatCompactDate = (iso) => (
  iso ? new Date(iso).toLocaleDateString('es-CO', {
    month: 'short',
    day: 'numeric',
  }) : '-'
);

function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex h-6 items-center gap-1 rounded-full border px-2.5 text-[11px] font-semibold ${className}`}>
      {children}
    </span>
  );
}

function MetricCard({ label, value, helper, icon: Icon, className = '' }) {
  return (
    <div className="min-h-28 rounded-xl border border-gray-800 bg-gray-900/80 p-4 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg border ${className}`}>
          <Icon size={18} />
        </span>
      </div>
      {helper && <p className="mt-3 text-xs text-gray-500">{helper}</p>}
    </div>
  );
}

function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-gray-500">
        Mostrando <span className="font-semibold text-gray-300">{start}-{end}</span> de{' '}
        <span className="font-semibold text-gray-300">{total}</span> reportes
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="h-9 rounded-lg border border-gray-700 bg-gray-950 px-2 text-xs text-gray-300 focus:border-green-500 focus:outline-none"
        >
          {PAGE_SIZE_OPTIONS.map((value) => (
            <option key={value} value={value}>{value} por vista</option>
          ))}
        </select>
        <div className="flex items-center overflow-hidden rounded-lg border border-gray-700">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="flex h-9 w-9 items-center justify-center bg-gray-950 text-gray-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Pagina anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="flex h-9 items-center border-x border-gray-700 bg-gray-900 px-3 text-xs font-medium text-gray-300">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex h-9 w-9 items-center justify-center bg-gray-950 text-gray-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Pagina siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ReporteEntidadCard({ reporte, onOpen, onUpdateAtencion, updating }) {
  const cfg = helpers.obtenerConfig(reporte.tipo_contaminacion);
  const color = cfg?.color ?? '#22c55e';
  const asignacion = reporte.asignacion ?? {};
  const tipoAsignacion = asignacion.tipo_asignacion ?? 'principal';
  const estadoAtencion = asignacion.estado_atencion ?? 'pendiente';

  return (
    <article className="group overflow-hidden rounded-xl border border-gray-800 bg-gray-900/75 shadow-lg shadow-black/10 transition-colors hover:border-gray-700">
      <div className="h-1" style={{ backgroundColor: color }} />
      <div className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge className="border-gray-700 bg-gray-950 text-gray-300">
                {cfg?.nombre ?? reporte.tipo_contaminacion}
              </Badge>
              <Badge className={PRIORIDAD_CLASS[asignacion.prioridad] ?? PRIORIDAD_CLASS.media}>
                {PRIORIDAD_LABEL[asignacion.prioridad] ?? asignacion.prioridad ?? 'Media'}
              </Badge>
              <Badge className={TIPO_ASIGNACION_CLASS[tipoAsignacion] ?? TIPO_ASIGNACION_CLASS.principal}>
                {TIPO_ASIGNACION_LABEL[tipoAsignacion] ?? TIPO_ASIGNACION_LABEL.principal}
              </Badge>
              <Badge className={ESTADO_ATENCION_CLASS[estadoAtencion] ?? ESTADO_ATENCION_CLASS.pendiente}>
                {ESTADO_ATENCION_LABEL[estadoAtencion] ?? estadoAtencion}
              </Badge>
            </div>

            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-white">{reporte.titulo}</h3>
            {reporte.descripcion && (
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-400">{reporte.descripcion}</p>
            )}

            <div className="mt-4 grid gap-2 text-xs text-gray-500 sm:grid-cols-3">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <MapPin size={13} className="shrink-0 text-gray-600" />
                <span className="truncate">{[reporte.municipio, reporte.departamento].filter(Boolean).join(', ') || 'Sin ubicacion'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={13} className="shrink-0 text-gray-600" />
                {formatDate(asignacion.asignado_at ?? reporte.created_at)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={13} className="shrink-0 text-gray-600" />
                {ESTADO_REPORTE_LABEL[reporte.estado] ?? reporte.estado}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:w-56 lg:flex-col">
            <button
              type="button"
              onClick={() => onOpen(reporte.id_reporte)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-950 px-3 text-sm font-medium text-gray-300 transition-colors hover:border-green-500/50 hover:text-green-300"
            >
              <Eye size={15} /> Ver detalle
            </button>
            <select
              value={estadoAtencion}
              disabled={updating === reporte.id_reporte}
              onChange={(event) => onUpdateAtencion(reporte, event.target.value)}
              className="h-10 rounded-lg border border-gray-700 bg-gray-950 px-3 text-sm text-gray-200 focus:border-green-500 focus:outline-none disabled:opacity-50"
            >
              {ATENCION_OPTIONS.map((estado) => (
                <option key={estado} value={estado}>{ESTADO_ATENCION_LABEL[estado]}</option>
              ))}
            </select>
            {updating === reporte.id_reporte && (
              <span className="inline-flex items-center justify-center gap-2 text-xs text-green-300">
                <Loader2 size={14} className="animate-spin" /> Actualizando
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function DetalleReporteModal({ detalle, loading, onClose }) {
  if (!detalle && !loading) return null;

  const reporte = detalle?.reporte;
  const evidencias = detalle?.evidencias ?? [];
  const categoria = helpers.obtenerConfig(reporte?.tipo_contaminacion);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-800 bg-gray-950/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Reporte asignado</p>
            <h2 className="text-sm font-semibold text-white">Detalle operativo</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-900 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          </div>
        ) : (
          <div className="space-y-6 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-green-400">
                {categoria?.nombre ?? reporte?.tipo_contaminacion}
              </p>
              <h3 className="mt-1 text-2xl font-bold leading-tight text-white">{reporte?.titulo}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-300">{reporte?.descripcion || 'Sin descripcion.'}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Estado reporte', ESTADO_REPORTE_LABEL[reporte?.estado] ?? reporte?.estado],
                ['Prioridad', PRIORIDAD_LABEL[reporte?.asignacion?.prioridad] ?? reporte?.asignacion?.prioridad],
                ['Asignacion', TIPO_ASIGNACION_LABEL[reporte?.asignacion?.tipo_asignacion] ?? TIPO_ASIGNACION_LABEL.principal],
                ['Ubicacion', [reporte?.municipio, reporte?.departamento].filter(Boolean).join(', ') || '-'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-200">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Evidencias</p>
                <span className="text-xs text-gray-600">{evidencias.length} archivo{evidencias.length !== 1 ? 's' : ''}</span>
              </div>
              {evidencias.length === 0 ? (
                <p className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-sm text-gray-500">Sin evidencias adjuntas.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {evidencias.map((ev) => (
                    ev.tipo_archivo === 'video' || ev.mime_type?.startsWith('video/') ? (
                      <video key={ev.id_evidencia} src={ev.url_archivo} controls className="aspect-video w-full rounded-xl border border-gray-800 bg-black object-contain" />
                    ) : (
                      <img key={ev.id_evidencia} src={ev.url_archivo} alt={ev.nombre_original ?? 'Evidencia'} className="aspect-video w-full rounded-xl border border-gray-800 object-cover" />
                    )
                  ))}
                </div>
              )}
            </div>

            <Link
              to={`/reports/${reporte?.id_reporte}`}
              className="inline-flex items-center gap-2 rounded-lg border border-green-500/35 bg-green-500/10 px-3 py-2 text-sm font-medium text-green-300 hover:bg-green-500/15"
            >
              Abrir vista publica <ExternalLink size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EntidadPanel() {
  const { showToast } = useToast();
  const [reportes, setReportes] = useState([]);
  const [reportesMeta, setReportesMeta] = useState({ total: 0, limit: 12, offset: 0 });
  const [alertas, setAlertas] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [alertasLoading, setAlertasLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({ prioridad: '', estado_atencion: '', tipo_asignacion: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [updating, setUpdating] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [detalleLoading, setDetalleLoading] = useState(false);

  const fetchReportes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      };
      if (filtros.prioridad) params.prioridad = filtros.prioridad;
      if (filtros.estado_atencion) params.estado_atencion = filtros.estado_atencion;
      if (filtros.tipo_asignacion) params.tipo_asignacion = filtros.tipo_asignacion;

      const { data } = await getMisReportesEntidad(params);
      const payload = data?.data ?? {};
      setReportes(payload.reportes ?? []);
      setReportesMeta({
        total: Number(payload.total) || 0,
        limit: Number(payload.limit) || pageSize,
        offset: Number(payload.offset) || 0,
      });
    } catch (err) {
      setError(err?.response?.data?.message ?? 'No se pudieron cargar tus reportes asignados.');
    } finally {
      setLoading(false);
    }
  }, [filtros, page, pageSize]);

  const fetchAlertas = useCallback(async () => {
    setAlertasLoading(true);
    try {
      const [lista, contador] = await Promise.all([
        getMisAlertasEntidad({ limit: ALERTAS_LIMIT, offset: 0 }),
        getMisAlertasNoLeidasCountEntidad(),
      ]);
      setAlertas(lista?.data?.data?.alertas ?? []);
      setNoLeidas(Number(contador?.data?.data?.no_leidas) || 0);
    } catch {
      setAlertas([]);
      setNoLeidas(0);
    } finally {
      setAlertasLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportes();
  }, [fetchReportes]);

  useEffect(() => {
    fetchAlertas();
  }, [fetchAlertas]);

  const resumen = useMemo(() => {
    const pendientesVista = reportes.filter((r) => r.asignacion?.estado_atencion === 'pendiente').length;
    const criticosVista = reportes.filter((r) => r.asignacion?.prioridad === 'critica').length;
    const altasVista = reportes.filter((r) => r.asignacion?.prioridad === 'alta').length;

    return {
      total: reportesMeta.total,
      visibles: reportes.length,
      pendientesVista,
      criticosVista,
      altasVista,
    };
  }, [reportes, reportesMeta.total]);

  const resetPageAndSetFilters = (patch) => {
    setPage(1);
    setFiltros((prev) => ({ ...prev, ...patch }));
  };

  const handlePageSizeChange = (nextPageSize) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const handleUpdateAtencion = async (reporte, estado_atencion) => {
    const comentario = estado_atencion === 'cerrado'
      ? 'Atencion cerrada desde panel de entidad.'
      : undefined;

    setUpdating(reporte.id_reporte);
    try {
      const { data } = await actualizarAtencionEntidad(reporte.id_reporte, { estado_atencion, comentario });
      const actualizado = data?.data?.reporte;
      setReportes((prev) => prev.map((item) => (
        item.id_reporte === reporte.id_reporte ? (actualizado ?? {
          ...item,
          asignacion: { ...item.asignacion, estado_atencion, comentario: comentario ?? item.asignacion?.comentario },
        }) : item
      )));
      setDetalle((prev) => {
        if (!prev?.reporte || prev.reporte.id_reporte !== reporte.id_reporte) return prev;
        return {
          ...prev,
          reporte: actualizado ?? {
            ...prev.reporte,
            asignacion: {
              ...prev.reporte.asignacion,
              estado_atencion,
              comentario: comentario ?? prev.reporte.asignacion?.comentario,
            },
          },
        };
      });
      showToast('Estado de atención actualizado.', 'success');
    } catch (err) {
      showToast(err?.response?.data?.message ?? 'No se pudo actualizar la atención.', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const handleOpenDetalle = async (idReporte) => {
    setDetalle(null);
    setDetalleLoading(true);
    try {
      const { data } = await getMiReporteEntidad(idReporte);
      setDetalle(data?.data ?? null);
    } catch (err) {
      showToast(err?.response?.data?.message ?? 'No se pudo cargar el detalle.', 'error');
    } finally {
      setDetalleLoading(false);
    }
  };

  const handleMarcarAlerta = async (idAlerta) => {
    try {
      await marcarAlertaEntidadLeida(idAlerta);
      setAlertas((prev) => prev.map((a) => (
        a.id_alerta_entidad === idAlerta ? { ...a, leida: true } : a
      )));
      setNoLeidas((value) => Math.max(0, value - 1));
    } catch (err) {
      showToast(err?.response?.data?.message ?? 'No se pudo marcar la alerta.', 'error');
    }
  };

  const handleMarcarTodas = async () => {
    try {
      await marcarTodasAlertasEntidadLeidas();
      setAlertas((prev) => prev.map((a) => ({ ...a, leida: true })));
      setNoLeidas(0);
      showToast('Alertas marcadas como leidas.', 'success');
    } catch (err) {
      showToast(err?.response?.data?.message ?? 'No se pudieron marcar las alertas.', 'error');
    }
  };

  const totalPages = Math.max(1, Math.ceil(reportesMeta.total / pageSize));

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
      <section className="mb-6 overflow-hidden rounded-2xl border border-gray-800 bg-gray-950">
        <div className="border-b border-gray-800 bg-gradient-to-r from-gray-900 via-gray-900 to-emerald-950/30 px-5 py-6 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-green-500/25 bg-green-500/10 text-green-300">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-400">Entidad responsable</p>
                <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Panel de atencion</h1>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-400">
                  Gestiona reportes asignados, prioriza la respuesta y mantén al dia las alertas operativas de tu entidad.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { fetchReportes(); fetchAlertas(); }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-green-500/40 bg-green-500/10 px-4 text-sm font-medium text-green-300 transition hover:bg-green-500/20"
            >
              <RefreshCw size={15} /> Actualizar
            </button>
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Reportes asignados"
            value={resumen.total}
            helper={`${resumen.visibles} visibles en esta vista`}
            icon={FileText}
            className="border-sky-500/25 bg-sky-500/10 text-sky-300"
          />
          <MetricCard
            label="Criticos en vista"
            value={resumen.criticosVista}
            helper="Requieren atencion prioritaria"
            icon={AlertTriangle}
            className="border-rose-500/30 bg-rose-500/10 text-rose-300"
          />
          <MetricCard
            label="Alta prioridad"
            value={resumen.altasVista}
            helper="Dentro del bloque actual"
            icon={Clock}
            className="border-amber-500/30 bg-amber-500/10 text-amber-300"
          />
          <MetricCard
            label="Alertas no leidas"
            value={noLeidas}
            helper="Pendientes de revision"
            icon={Bell}
            className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <main className="space-y-4">
          <div className="rounded-2xl border border-gray-800 bg-gray-950 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <Filter size={16} className="text-green-400" /> Filtros de trabajo
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <select
                value={filtros.prioridad}
                onChange={(event) => resetPageAndSetFilters({ prioridad: event.target.value })}
                className="h-10 rounded-lg border border-gray-700 bg-gray-900 px-3 text-sm text-gray-200 focus:border-green-500 focus:outline-none"
              >
                <option value="">Todas las prioridades</option>
                {Object.entries(PRIORIDAD_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <select
                value={filtros.estado_atencion}
                onChange={(event) => resetPageAndSetFilters({ estado_atencion: event.target.value })}
                className="h-10 rounded-lg border border-gray-700 bg-gray-900 px-3 text-sm text-gray-200 focus:border-green-500 focus:outline-none"
              >
                <option value="">Todos los estados de atencion</option>
                {ATENCION_OPTIONS.map((value) => (
                  <option key={value} value={value}>{ESTADO_ATENCION_LABEL[value]}</option>
                ))}
              </select>
              <select
                value={filtros.tipo_asignacion}
                onChange={(event) => resetPageAndSetFilters({ tipo_asignacion: event.target.value })}
                className="h-10 rounded-lg border border-gray-700 bg-gray-900 px-3 text-sm text-gray-200 focus:border-green-500 focus:outline-none"
              >
                <option value="">Principal y apoyo</option>
                {Object.entries(TIPO_ASIGNACION_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {!loading && !error && (
            <Pagination
              page={page}
              pageSize={pageSize}
              total={reportesMeta.total}
              onPageChange={(nextPage) => setPage(Math.min(Math.max(1, nextPage), totalPages))}
              onPageSizeChange={handlePageSizeChange}
            />
          )}

          {loading ? (
            <div className="flex min-h-80 items-center justify-center rounded-2xl border border-gray-800 bg-gray-950">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">{error}</div>
          ) : reportes.length === 0 ? (
            <div className="rounded-2xl border border-gray-800 bg-gray-950 p-12 text-center">
              <CheckCircle2 className="mx-auto mb-4 h-11 w-11 text-gray-700" />
              <p className="font-semibold text-gray-300">Sin reportes en esta vista</p>
              <p className="mt-1 text-sm text-gray-500">Ajusta los filtros o actualiza el panel para revisar nuevas asignaciones.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reportes.map((reporte) => (
                <ReporteEntidadCard
                  key={reporte.id_reporte}
                  reporte={reporte}
                  onOpen={handleOpenDetalle}
                  onUpdateAtencion={handleUpdateAtencion}
                  updating={updating}
                />
              ))}
            </div>
          )}

          {!loading && !error && reportes.length > 0 && (
            <Pagination
              page={page}
              pageSize={pageSize}
              total={reportesMeta.total}
              onPageChange={(nextPage) => setPage(Math.min(Math.max(1, nextPage), totalPages))}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </main>

        <aside className="space-y-4">
          <section className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-950">
            <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Bell size={16} className="text-yellow-300" /> Alertas recientes
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">{ALERTAS_LIMIT} ultimas alertas visibles</p>
              </div>
              {noLeidas > 0 && (
                <button type="button" onClick={handleMarcarTodas} className="rounded-lg px-2 py-1 text-xs font-medium text-green-400 hover:bg-green-500/10 hover:text-green-300">
                  Marcar todas
                </button>
              )}
            </div>

            {alertasLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-green-500" />
              </div>
            ) : alertas.length === 0 ? (
              <p className="p-5 text-sm text-gray-500">Sin alertas para tu entidad.</p>
            ) : (
              <ul className="divide-y divide-gray-800">
                {alertas.map((alerta) => (
                  <li key={alerta.id_alerta_entidad} className="p-4">
                    <div className="flex items-start gap-3">
                      <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${alerta.leida ? 'bg-gray-700' : 'bg-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.5)]'}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium leading-snug text-gray-100">{alerta.titulo}</p>
                          <span className="shrink-0 text-[11px] text-gray-600">{formatCompactDate(alerta.created_at)}</span>
                        </div>
                        <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-gray-500">{alerta.mensaje}</p>
                        {!alerta.leida && (
                          <button
                            type="button"
                            onClick={() => handleMarcarAlerta(alerta.id_alerta_entidad)}
                            className="mt-3 rounded-md text-xs font-medium text-green-400 hover:text-green-300"
                          >
                            Marcar como leida
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <DetalleReporteModal
        detalle={detalle}
        loading={detalleLoading}
        onClose={() => { setDetalle(null); setDetalleLoading(false); }}
      />
    </div>
  );
}
