import { motion } from 'motion/react';

/**
 * BarChart SVG — barras horizontales animadas, ordenadas por valor desc.
 * Sin librerías externas, mantiene el bundle ligero (FE-20).
 *
 * @param {Array<{ label, value, color }>} data
 * @param {number} maxBars  Top-N a mostrar (default 8)
 */
export default function BarChart({ data = [], maxBars = 8 }) {
  const normalizedData = data
    .map((item, index) => {
      const label = typeof item?.label === 'string' && item.label.trim()
        ? item.label.trim()
        : `Sin etiqueta ${index + 1}`;
      const numericValue = Number(item?.value);

      return {
        ...item,
        label,
        value: Number.isFinite(numericValue) ? numericValue : 0,
        color: item?.color ?? '#22c55e',
        key: `${label}-${index}`,
      };
    })
    .filter((item) => item.value > 0);

  if (!normalizedData.length) {
    return (
      <div className="flex-1 flex items-center justify-center py-10 text-sm text-gray-600">
        Sin datos suficientes
      </div>
    );
  }

  const top = [...normalizedData]
    .sort((a, b) => b.value - a.value)
    .slice(0, maxBars);
  const max = Math.max(...top.map(d => d.value), 1);

  return (
    <div className="space-y-2.5 w-full" role="img" aria-label="Gráfico de barras por categoría">
      {top.map((d, i) => {
        const pct = Math.round((d.value / max) * 100);
        const color = d.color;
        return (
          <div key={d.key} className="flex items-center gap-3">
            <span className="text-[11px] text-gray-400 w-28 sm:w-32 truncate" title={d.label}>
              {d.label}
            </span>
            <div className="flex-1 h-5 bg-gray-800/60 rounded-md overflow-hidden relative">
              <motion.div
                className="h-full rounded-md"
                style={{ background: color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: 'easeOut' }}
              />
            </div>
            <span
              className="text-xs font-bold tabular-nums w-10 text-right shrink-0"
              style={{ color }}
            >
              {d.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
