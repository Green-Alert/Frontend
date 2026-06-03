const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeScore = (value) => {
  const score = toNumber(value);
  if (score === null) return null;
  return Math.max(0, Math.min(100, score <= 1 ? score * 100 : score));
};

const normalizeEtiqueta = (item, fallbackScore = null) => {
  if (typeof item === 'string') {
    const label = item.trim();
    return label ? { label, nombre: label, score: fallbackScore } : null;
  }

  if (!item || typeof item !== 'object') {
    return null;
  }

  const label = String(
    item.label ?? item.etiqueta ?? item.categoria ?? item.nombre ?? ''
  ).trim();
  if (!label) return null;

  return {
    label,
    nombre: String(item.nombre ?? item.label ?? item.etiqueta ?? item.categoria ?? label).trim(),
    score: normalizeScore(item.score ?? item.confianza ?? item.probabilidad ?? fallbackScore),
  };
};

export const getValidIaAnalysis = (reporte) => {
  if (!reporte?.ia_procesado) return null;

  const confianza = normalizeScore(reporte.ia_confianza);
  if (!confianza || confianza <= 0) return null;

  const etiquetas = Array.isArray(reporte.ia_etiquetas)
    ? reporte.ia_etiquetas
      .map((item, index) => normalizeEtiqueta(item, index === 0 ? confianza : null))
      .filter(Boolean)
    : [];

  if (etiquetas.length === 0) return null;

  const principal = etiquetas[0];
  const hasUsefulScores = etiquetas.some((item) => Number(item.score) > 0);
  if (!principal?.label || !hasUsefulScores) return null;

  return {
    principal,
    etiquetas,
    confianza,
  };
};

