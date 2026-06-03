import { useEffect, useState } from 'react';
import { Brain, Sparkles, TrendingUp, Gauge, ChevronDown } from 'lucide-react';
import BarChart from '../charts/BarChart.jsx';
import LineChart from '../charts/LineChart.jsx';
import { getStatsIA } from '../../services/api';
import { helpers } from '../../constants/categorias';

/**
 * FE-27 · Sección "Tendencias IA" del dashboard (admin/moderador).
 * Muestra agregados de la clasificación IA: KPIs, top etiquetas, distribución
 * de confianza y evolución temporal (procesados vs aceptados).
 */
const Section = ({ title, children, hint }) => (
  <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {hint && <p className="text-[11px] text-gray-500">{hint}</p>}
    </div>
    {children}
  </div>
);

const EmptyIA = () => (
  <div className="card p-8 flex flex-col items-center text-center gap-2">
    <Sparkles size={28} className="text-violet-400" />
    <h2 className="font-semibold text-white">Tendencias IA</h2>
    <p className="text-sm text-gray-500 max-w-md">
      Aún no hay reportes procesados por IA. Cuando los ciudadanos suban evidencia y la
      clasificación automática esté disponible, verás aquí las tendencias y patrones detectados.
    </p>
  </div>
);

export default function TendenciasIACard() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(false);
    getStatsIA({ dias: 30 })
      .then(({ data }) => { if (alive) setData(data?.data?.data ?? null); })
      .catch(() => { if (alive) setError(true); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={16} className="text-violet-400" />
          <h2 className="font-semibold text-white">Tendencias IA</h2>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-gray-800/40 animate-pulse" />
          ))}
        </div>
        <div className="h-40 rounded-xl bg-gray-800/40 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-2">
          <Brain size={16} className="text-violet-400" />
          <h2 className="font-semibold text-white">Tendencias IA</h2>
        </div>
        <p className="text-sm text-red-400">No se pudieron cargar las tendencias IA.</p>
      </div>
    );
  }

  if (!data || data.total_procesados === 0) return <EmptyIA />;

  const { total_procesados, accuracy, confianza, top_etiquetas, timeline } = data;

  const topData = (top_etiquetas ?? []).slice(0, 6).map((e) => ({
    label: e.nombre || helpers.obtenerNombre?.(e.label) || e.label,
    value: e.count,
    color: '#a78bfa',
  }));

  const confData = [
    { label: 'Baja (0-49)',    value: confianza?.distribucion?.baja  ?? 0, color: '#ef4444' },
    { label: 'Media (50-74)',  value: confianza?.distribucion?.media ?? 0, color: '#f59e0b' },
    { label: 'Alta (75-100)',  value: confianza?.distribucion?.alta  ?? 0, color: '#22c55e' },
  ];

  const tlData = (timeline ?? []).map((d) => ({
    periodo: d.fecha,
    total: d.procesados,
  }));

  return (
    <div className="card p-5">
      {/* ── Header siempre visible ── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-2 group"
      >
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-violet-400" />
          <h2 className="font-semibold text-white">Tendencias IA</h2>
          <span className="text-[11px] text-gray-500 ml-1">· últimos 30 días</span>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-500 group-hover:text-gray-300 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* ── KPIs compactos — siempre visibles ── */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-3 flex items-center gap-3">
          <Sparkles size={14} className="text-violet-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 truncate">Procesados</p>
            <p className="text-lg font-bold text-white tabular-nums">{total_procesados}</p>
          </div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-3 flex items-center gap-3">
          <TrendingUp size={14} className="text-green-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 truncate">Aceptación</p>
            <p className="text-lg font-bold text-white tabular-nums">{accuracy?.porcentaje ?? 0}%</p>
          </div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-3 flex items-center gap-3">
          <Gauge size={14} className="text-amber-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 truncate">Confianza</p>
            <p className="text-lg font-bold text-white tabular-nums">{confianza?.promedio ?? 0}%</p>
          </div>
        </div>
      </div>

      {/* ── Detalle expandible ── */}
      {expanded && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Section title="Top etiquetas detectadas" hint="Etiqueta principal sugerida por la IA">
              <BarChart data={topData} maxBars={6} />
            </Section>
            <Section title="Distribución de confianza" hint="Por nivel del score top-1">
              <BarChart data={confData} maxBars={3} />
            </Section>
          </div>
          <Section title="Procesados por día (30 d)" hint="Volumen de reportes pasados por la IA">
            {tlData.length > 0 ? (
              <LineChart data={tlData} bucket="month" color="#a78bfa" />
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">Sin datos en este rango.</p>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}
