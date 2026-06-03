import { describe, expect, it } from 'vitest';
import {
  canManageCitizenReport,
  getEstadoSeguimientoReporte,
  normalizeEstado,
} from './reporteEstado';
import { getValidIaAnalysis } from './reporteIA';

describe('reporteEstado', () => {
  it('normaliza estados con espacios y tildes', () => {
    expect(normalizeEstado(' En proceso ')).toBe('en_proceso');
    expect(normalizeEstado('En atención')).toBe('en_atencion');
  });

  it('muestra en proceso cuando una entidad atiende un reporte pendiente', () => {
    expect(getEstadoSeguimientoReporte({
      estado: 'pendiente',
      estado_atencion_responsable: 'en_atencion',
    })).toBe('en_proceso');
  });

  it('prioriza estados finales del reporte', () => {
    expect(getEstadoSeguimientoReporte({
      estado: 'resuelto',
      estado_atencion_responsable: 'en_atencion',
    })).toBe('resuelto');
  });

  it('solo permite gestionar reportes ciudadanos sin atencion iniciada', () => {
    expect(canManageCitizenReport({ estado: 'pendiente' })).toBe(true);
    expect(canManageCitizenReport({
      estado: 'pendiente',
      estado_atencion_responsable: 'en_atencion',
    })).toBe(false);
  });
});

describe('reporteIA', () => {
  it('oculta analisis IA sin confianza util', () => {
    expect(getValidIaAnalysis({
      ia_procesado: true,
      ia_confianza: 0,
      ia_etiquetas: ['agua'],
    })).toBeNull();
  });

  it('acepta etiquetas string si tienen confianza del reporte', () => {
    const analysis = getValidIaAnalysis({
      ia_procesado: true,
      ia_confianza: 87,
      ia_etiquetas: ['agua'],
    });

    expect(analysis.principal.label).toBe('agua');
    expect(analysis.principal.score).toBe(87);
  });
});

