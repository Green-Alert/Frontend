import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoSrc from '../assets/GreenAlert - logo principal.png';
import { CONFIGURACION_CATEGORIAS } from '../constants/categorias';

// â”€â”€ Paleta â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const C = {
  verde:      [21, 128, 61],
  verdeClaro: [220, 252, 231],
  verdeBorde: [187, 247, 208],
  oscuro:     [17, 24, 39],
  medio:      [55, 65, 81],
  claro:      [107, 114, 128],
  filaAlt:    [248, 250, 251],
  filaNorm:   [255, 255, 255],
  borde:      [229, 231, 235],
  rojo:       [220, 38, 38],
  ambar:      [217, 119, 6],
  azul:       [37, 99, 235],
};

// â”€â”€ Labels â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ESTADO_LABELS = {
  pendiente:   'Pendiente',
  en_proceso:  'En proceso',
  resuelto:    'Resuelto',
  rechazado:   'Rechazado',
  verificado:  'Verificado',
  en_revision: 'En revision',
};

const ESTADO_COLORS = {
  pendiente:   [156, 163, 175],
  en_proceso:  [217, 119, 6],
  resuelto:    [22, 163, 74],
  rechazado:   [220, 38, 38],
  verificado:  [37, 99, 235],
  en_revision: [124, 58, 237],
};

const NIVEL_LABELS = { bajo: 'Bajo', medio: 'Medio', alto: 'Alto', critico: 'Critico' };

const NIVEL_COLORS = {
  bajo:    [34, 197, 94],
  medio:   [234, 179, 8],
  alto:    [249, 115, 22],
  critico: [220, 38, 38],
};

// â”€â”€ Utils â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const fmtFecha = (v) => {
  if (!v) return '-';
  try {
    return new Date(v).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return String(v);
  }
};

const categoriaNombre = (clave) =>
  CONFIGURACION_CATEGORIAS[clave]?.nombre ?? (clave ? String(clave).replace(/_/g, ' ') : null);

function cargarImagen(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// â”€â”€ Calcula KPIs directamente de los reportes filtrados â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function computeStats(reportes) {
  const porEstado     = {};
  const porSeveridad  = {};
  const municipiosSet = new Set();

  for (const r of reportes) {
    const est = r.estado ?? 'pendiente';
    porEstado[est] = (porEstado[est] || 0) + 1;
    const sev = r.nivel_severidad ?? 'bajo';
    porSeveridad[sev] = (porSeveridad[sev] || 0) + 1;
    if (r.municipio) municipiosSet.add(r.municipio);
  }

  const total           = reportes.length;
  const resueltos       = porEstado['resuelto'] || 0;
  const resolucionPct   = total > 0 ? Math.round((resueltos / total) * 100) : 0;

  return { porEstado, porSeveridad, municipiosSet, total, resueltos, resolucionPct };
}

/**
 * Genera un PDF estilizado con la lista de reportes filtrados y un resumen de KPIs.
 * @param {Object} opts
 * @param {Array}  opts.reportes  Lista de reportes ya filtrada
 * @param {Object} opts.filtros   Filtros aplicados { categoria, estado, dateFrom, dateTo }
 * @param {String} opts.usuario   Nombre del usuario que exporta
 */
export async function generarReportesPDF({ reportes = [], filtros = {}, usuario = '' }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W   = doc.internal.pageSize.getWidth();
  const H   = doc.internal.pageSize.getHeight();
  let y     = 0;

  const logoBase64 = await cargarImagen(logoSrc);
  const stats      = computeStats(reportes);

  // â”€â”€ Helpers internos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const marcaDeAgua = () => {
    if (!logoBase64) return;
    doc.setGState(new doc.GState({ opacity: 0.035 }));
    doc.addImage(logoBase64, 'PNG', (W - 120) / 2, (H - 120) / 2, 120, 120);
    doc.setGState(new doc.GState({ opacity: 1 }));
  };

  const cabeceraRepetida = () => {
    doc.setFillColor(249, 250, 251);
    doc.rect(0, 0, W, 13, 'F');
    doc.setFillColor(...C.verde);
    doc.rect(0, 0, W, 1.0, 'F');
    if (logoBase64) doc.addImage(logoBase64, 'PNG', 8, 2.5, 8, 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...C.verde);
    doc.text('GreenAlert', 19, 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.claro);
    doc.text('Reporte de Actividad Ambiental', 44, 8);
    doc.setDrawColor(...C.borde);
    doc.setLineWidth(0.25);
    doc.line(0, 13, W, 13);
  };

  const seccionTitulo = (titulo) => {
    if (y > H - 35) { doc.addPage(); cabeceraRepetida(); marcaDeAgua(); y = 20; }
    doc.setFillColor(...C.verde);
    doc.roundedRect(14, y - 5, W - 28, 10, 1.2, 1.2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text(titulo, 20, y + 1);
    y += 12;
  };

  // â”€â”€ PAGINA 1 â€” HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  marcaDeAgua();

  doc.setFillColor(...C.verde);
  doc.rect(0, 0, W, 1.5, 'F');
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 1.5, W, 40, 'F');

  if (logoBase64) doc.addImage(logoBase64, 'PNG', 14, 7, 22, 22);
  const textX = logoBase64 ? 40 : 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...C.verde);
  doc.text('GreenAlert', textX, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.medio);
  doc.text('Monitoreo Ambiental Ciudadano', textX, 25);

  doc.setFontSize(7.5);
  doc.setTextColor(...C.claro);
  const ahora = new Date().toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' });
  doc.text(`Generado: ${ahora}`, W - 14, 18, { align: 'right' });
  if (usuario) doc.text(`Por: ${usuario}`, W - 14, 24, { align: 'right' });

  doc.setDrawColor(...C.verdeBorde);
  doc.setLineWidth(0.4);
  doc.line(14, 35, W - 14, 35);

  // Titulo del documento
  y = 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...C.oscuro);
  doc.text('Reporte de Actividad Ambiental', 14, y);
  y += 6;

  // Subtitulo â€” resumen de filtros en una sola linea
  const partesFiltro = [];
  if (filtros.categoria) partesFiltro.push(categoriaNombre(filtros.categoria) ?? filtros.categoria);
  if (filtros.estado)    partesFiltro.push(ESTADO_LABELS[filtros.estado] ?? filtros.estado);
  if (filtros.dateFrom || filtros.dateTo) {
    const d = filtros.dateFrom ? fmtFecha(filtros.dateFrom) : 'inicio';
    const h = filtros.dateTo   ? fmtFecha(filtros.dateTo)   : 'hoy';
    partesFiltro.push(`${d} - ${h}`);
  }
  const subtitulo = partesFiltro.length > 0
    ? `${stats.total} reporte${stats.total !== 1 ? 's' : ''} \u00b7 ${partesFiltro.join(' \u00b7 ')}`
    : `${stats.total} reporte${stats.total !== 1 ? 's' : ''} del total de la plataforma`;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.claro);
  doc.text(subtitulo, 14, y);
  y += 12;

  // â”€â”€ FILTROS APLICADOS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  seccionTitulo('Filtros aplicados');

  const catLabel  = filtros.categoria ? (categoriaNombre(filtros.categoria) ?? filtros.categoria) : 'Todas las categorias';
  const estLabel  = filtros.estado    ? (ESTADO_LABELS[filtros.estado] ?? filtros.estado)         : 'Todos los estados';
  const desdeLabel = filtros.dateFrom ? fmtFecha(filtros.dateFrom) : '-';
  const hastaLabel = filtros.dateTo   ? fmtFecha(filtros.dateTo)   : '-';
  const periodoLabel = (filtros.dateFrom || filtros.dateTo)
    ? `${desdeLabel} al ${hastaLabel}`
    : 'Todo el historial';

  const filtrosFilas = [
    ['Categoria',  catLabel],
    ['Estado',     estLabel],
    ['Periodo',    periodoLabel],
  ];

  autoTable(doc, {
    startY: y,
    body:   filtrosFilas,
    theme:  'plain',
    margin: { left: 14, right: W / 2 + 10 },
    styles: {
      font: 'helvetica', fontSize: 9, textColor: C.oscuro,
      cellPadding: { top: 3, bottom: 3, left: 5, right: 5 },
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: C.verde, cellWidth: 30 },
      1: { cellWidth: 90 },
    },
    willDrawCell: (data) => {
      doc.setFillColor(...(data.row.index % 2 === 0 ? C.filaNorm : C.filaAlt));
    },
  });
  y = doc.lastAutoTable.finalY + 10;

  // â”€â”€ RESUMEN DEL REPORTE (calculado de los datos filtrados) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  seccionTitulo('Resumen del reporte filtrado');

  const kpis = [
    { label: 'Total incluidos', value: stats.total,                           color: C.verde },
    { label: 'Pendientes',      value: stats.porEstado['pendiente']  ?? 0,    color: C.rojo  },
    { label: 'En proceso',      value: stats.porEstado['en_proceso'] ?? 0,    color: C.ambar },
    { label: 'Resueltos',       value: stats.porEstado['resuelto']   ?? 0,    color: C.verde },
    { label: 'Rechazados',      value: stats.porEstado['rechazado']  ?? 0,    color: C.claro },
    { label: '% Resolucion',    value: `${stats.resolucionPct}%`,             color: C.verde },
    { label: 'Municipios',      value: stats.municipiosSet.size,              color: C.azul  },
  ];

  const cardW = (W - 28 - (kpis.length - 1) * 2.5) / kpis.length;
  const cardH = 17;

  kpis.forEach((k, i) => {
    const x = 14 + i * (cardW + 2.5);
    doc.setFillColor(...C.filaAlt);
    doc.setDrawColor(...C.borde);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, y, cardW, cardH, 1.2, 1.2, 'FD');
    doc.setFillColor(...k.color);
    doc.roundedRect(x, y, cardW, 1.0, 0.4, 0.4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...k.color);
    doc.text(String(k.value), x + cardW / 2, y + 9.5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.claro);
    doc.text(k.label, x + cardW / 2, y + 14.5, { align: 'center' });
  });
  y += cardH + 8;

  // â”€â”€ TABLA DE REPORTES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (reportes.length === 0) {
    if (y > H - 25) { doc.addPage(); cabeceraRepetida(); marcaDeAgua(); y = 20; }
    doc.setFillColor(...C.filaAlt);
    doc.setDrawColor(...C.borde);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, y, W - 28, 18, 2, 2, 'FD');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...C.claro);
    doc.text('No hay reportes que coincidan con los filtros aplicados.', W / 2, y + 11, { align: 'center' });
    y += 22;
  } else {
    if (y > H - 40) { doc.addPage(); cabeceraRepetida(); marcaDeAgua(); y = 20; }
    seccionTitulo(`Listado de reportes (${reportes.length})`);

    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [['#', 'Titulo', 'Categoria', 'Severidad', 'Estado', 'Municipio', 'Autor', 'Fecha']],
      body: reportes.map((r, i) => [
        i + 1,
        r.titulo ?? '-',
        categoriaNombre(r.tipo_contaminacion) ?? '-',
        NIVEL_LABELS[r.nivel_severidad] ?? r.nivel_severidad ?? '-',
        ESTADO_LABELS[r.estado] ?? r.estado ?? '-',
        [r.municipio, r.departamento].filter(Boolean).join(', ') || '-',
        [r.autor_nombre, r.autor_apellido].filter(Boolean).join(' ') || '-',
        fmtFecha(r.created_at),
      ]),
      theme: 'grid',
      styles: {
        font: 'helvetica', fontSize: 7.5, textColor: C.oscuro,
        cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
        lineColor: C.borde, lineWidth: 0.2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: C.verde, textColor: [255, 255, 255],
        fontStyle: 'bold', fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 9,  halign: 'center' },
        1: { cellWidth: 58 },
        2: { cellWidth: 40 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 40 },
        6: { cellWidth: 38 },
        7: { cellWidth: 26, halign: 'center' },
      },
      alternateRowStyles: { fillColor: C.filaAlt },
      didParseCell: (data) => {
        if (data.section !== 'body') return;
        const r = reportes[data.row.index];
        if (data.column.index === 4) {
          const c = ESTADO_COLORS[r?.estado];
          if (c) data.cell.styles.textColor = c;
        }
        if (data.column.index === 3) {
          const c = NIVEL_COLORS[r?.nivel_severidad];
          if (c) data.cell.styles.textColor = c;
        }
      },
      didDrawPage: (data) => {
        if (data.pageNumber > 1) { cabeceraRepetida(); marcaDeAgua(); }
      },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // â”€â”€ AVISO FINAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (y > H - 22) { doc.addPage(); cabeceraRepetida(); marcaDeAgua(); y = 20; }
  doc.setFillColor(...C.verdeClaro);
  doc.setDrawColor(...C.verdeBorde);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, y, W - 28, 13, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.verde);
  doc.text(
    'Documento generado automaticamente desde el panel de administracion de GreenAlert.',
    W / 2, y + 5, { align: 'center' },
  );
  doc.text(
    'La informacion refleja el estado de la plataforma al momento de la exportacion.',
    W / 2, y + 9.5, { align: 'center' },
  );

  // â”€â”€ FOOTER en todas las paginas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const totalPags = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPags; i++) {
    doc.setPage(i);
    const pH = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...C.borde);
    doc.setLineWidth(0.3);
    doc.line(14, pH - 12, W - 14, pH - 12);
    doc.setFillColor(...C.verde);
    doc.rect(0, pH - 1.2, W, 1.2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.claro);
    doc.text('GreenAlert (c) 2026 - Monitoreo Ambiental Ciudadano', 14, pH - 5);
    doc.text(`Pagina ${i} de ${totalPags}`, W - 14, pH - 5, { align: 'right' });
    if (logoBase64) {
      doc.setGState(new doc.GState({ opacity: 0.25 }));
      doc.addImage(logoBase64, 'PNG', W / 2 - 3.5, pH - 10.5, 7, 7);
      doc.setGState(new doc.GState({ opacity: 1 }));
    }
  }

  // â”€â”€ Nombre del archivo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const partes = ['GreenAlert', 'Reportes'];
  if (filtros.categoria) partes.push((categoriaNombre(filtros.categoria) ?? filtros.categoria).replace(/\s+/g, '_'));
  if (filtros.estado)    partes.push((ESTADO_LABELS[filtros.estado] ?? filtros.estado).replace(/\s+/g, '_'));
  partes.push(new Date().toISOString().slice(0, 10));
  const nombreArchivo = `${partes.join('_')}.pdf`;

  doc.save(nombreArchivo);
  return nombreArchivo;
}
