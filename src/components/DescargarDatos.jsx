import { useState, useEffect, useCallback } from 'react';
import {
  Download, X, Check, Loader2, Lock,
  User, ClipboardList, ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getPerfil, getMisReportes } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoSrc from '../assets/GreenAlert - logo principal.png';

// ── Secciones disponibles ─────────────────────────────────────────────────────
const SECCIONES = [
  { id: 'perfil',   label: 'Perfil y datos personales', icon: '👤', desc: 'Nombre, correo, teléfono, rol y fecha de registro.' },
  { id: 'reportes', label: 'Mis reportes ambientales',  icon: '📋', desc: 'Todos los reportes que has creado en la plataforma.' },
  { id: 'cuenta',   label: 'Información de cuenta',     icon: '🔐', desc: 'Estado de verificación, rol asignado y actividad.' },
];

// ── Paleta de colores para PDF (fondo blanco, texto oscuro) ───────────────────
const C = {
  verde:      [21, 128, 61],    // #15803d  — titulos de sección
  verdeClaro: [220, 252, 231],  // #dcfce7  — fondo accent suave
  verdeBorde: [187, 247, 208],  // #bbf7d0  — bordes accent
  oscuro:     [30, 41, 59],     // #1e293b  — texto principal
  medio:      [71, 85, 105],    // #475569  — texto secundario
  claro:      [148, 163, 184],  // #94a3b8  — texto terciario
  filaAlt:    [248, 250, 252],  // #f8fafc  — fila alternada
  filaNorm:   [255, 255, 255],  // blanco
  borde:      [226, 232, 240],  // #e2e8f0  — líneas
  headerBg:   [21, 128, 61],    // verde oscuro para headers de tabla
};

// ── Formateo de fecha ─────────────────────────────────────────────────────────
const fmtFecha = (v) => {
  if (!v) return '—';
  try { return new Date(v).toLocaleDateString('es-CO', { dateStyle: 'medium' }); }
  catch { return String(v); }
};

const ESTADO_LABELS = {
  pendiente:   'Pendiente',
  en_revision: 'En revisión',
  verificado:  'Verificado',
  en_proceso:  'En proceso',
  resuelto:    'Resuelto',
  rechazado:   'Rechazado',
};

const SEVERIDAD_LABELS = {
  bajo:     'Bajo',
  medio:    'Medio',
  alto:     'Alto',
  critico:  'Crítico',
};

// ── Cargar imagen como base64 ─────────────────────────────────────────────────
function cargarImagen(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// ── Generador de PDF ──────────────────────────────────────────────────────────
async function generarPDF(perfil, reportes, seleccion) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  let y = 0;

  // Cargar logo
  const logoBase64 = await cargarImagen(logoSrc);

  // ── Marca de agua en una página ──
  const marcaDeAgua = (pageH) => {
    if (!logoBase64) return;
    const wSize = 90;
    const hSize = 90;
    const gfx = doc.saveGraphicsState;
    doc.setGState(new doc.GState({ opacity: 0.04 }));
    doc.addImage(logoBase64, 'PNG', (W - wSize) / 2, (pageH - hSize) / 2, wSize, hSize);
    doc.setGState(new doc.GState({ opacity: 1 }));
  };

  // ── Encabezado en páginas secundarias ──
  const cabeceraRepetida = () => {
    // Franja superior
    doc.setFillColor(250, 250, 250);
    doc.rect(0, 0, W, 14, 'F');
    doc.setFillColor(...C.verde);
    doc.rect(0, 0, W, 0.8, 'F');

    if (logoBase64) doc.addImage(logoBase64, 'PNG', 8, 2.5, 9, 9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...C.verde);
    doc.text('GreenAlert', 19, 8.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.claro);
    doc.text('Exportación de Datos', 43, 8.5);

    doc.setDrawColor(...C.borde);
    doc.setLineWidth(0.3);
    doc.line(0, 14, W, 14);
  };

  // ── Título de sección ──
  const seccionTitulo = (titulo) => {
    if (y > H - 35) { doc.addPage(); cabeceraRepetida(); marcaDeAgua(H); y = 22; }
    doc.setFillColor(...C.verde);
    doc.roundedRect(14, y - 5.5, W - 28, 11, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(titulo, 20, y + 1.5);
    y += 13;
  };

  // ═════════════════════════════════════════════════════════════════════════
  // PÁGINA 1 — ENCABEZADO PRINCIPAL
  // ═════════════════════════════════════════════════════════════════════════

  // Marca de agua
  marcaDeAgua(H);

  // Barra verde superior
  doc.setFillColor(...C.verde);
  doc.rect(0, 0, W, 1.2, 'F');

  // Franja del header
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 1.2, W, 42, 'F');

  // Logo al lado del título
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 14, 6, 22, 22);
  }

  const textX = logoBase64 ? 40 : 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...C.verde);
  doc.text('GreenAlert', textX, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.medio);
  doc.text('Monitoreo Ambiental Ciudadano', textX, 25);

  // Fecha de generación
  doc.setFontSize(8);
  doc.setTextColor(...C.claro);
  const ahora = new Date().toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' });
  doc.text(`Generado: ${ahora}`, W - 14, 18, { align: 'right' });

  // Línea divisora
  doc.setDrawColor(...C.verdeBorde);
  doc.setLineWidth(0.5);
  doc.line(14, 35, W - 14, 35);

  // Título del documento
  y = 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...C.oscuro);
  doc.text('Exportación de Datos del Usuario', 14, y);
  y += 8;

  // Nombre del usuario
  const nombre = `${perfil?.nombre ?? ''} ${perfil?.apellido ?? ''}`.trim();
  if (nombre) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...C.medio);
    doc.text(`Usuario: ${nombre}`, 14, y);
    y += 4;
    doc.setTextColor(...C.claro);
    doc.setFontSize(8);
    doc.text(perfil.email ?? '', 14, y + 4);
    y += 12;
  }

  // ── PERFIL ──
  if (seleccion.perfil && perfil) {
    seccionTitulo('Perfil / Datos Personales');
    const filas = [
      ['Nombre completo', `${perfil.nombre ?? ''} ${perfil.apellido ?? ''}`.trim() || '—'],
      ['Correo electrónico', perfil.email ?? '—'],
      ['Teléfono', perfil.telefono ?? 'No registrado'],
      ['Rol', (perfil.rol ?? '—').charAt(0).toUpperCase() + (perfil.rol ?? '').slice(1)],
      ['Fecha de registro', fmtFecha(perfil.created_at)],
    ];
    autoTable(doc, {
      startY: y,
      body: filas,
      theme: 'plain',
      margin: { left: 14, right: 14 },
      styles: { font: 'helvetica', fontSize: 9, textColor: C.oscuro, cellPadding: { top: 3.5, bottom: 3.5, left: 5, right: 5 } },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: C.verde, cellWidth: 55 },
      },
      willDrawCell: (data) => {
        doc.setFillColor(...(data.row.index % 2 === 0 ? C.filaNorm : C.filaAlt));
      },
      didDrawPage: () => {},
    });
    y = doc.lastAutoTable.finalY + 12;
  }

  // ── REPORTES ──
  if (seleccion.reportes && reportes.length > 0) {
    if (y > H - 45) { doc.addPage(); cabeceraRepetida(); marcaDeAgua(H); y = 22; }
    seccionTitulo(`Mis Reportes Ambientales (${reportes.length})`);
    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [['#', 'Título', 'Tipo', 'Severidad', 'Estado', 'Municipio', 'Fecha']],
      body: reportes.map((r, i) => [
        i + 1,
        r.titulo ?? '—',
        (r.tipo_contaminacion ?? '').replace(/_/g, ' '),
        SEVERIDAD_LABELS[r.nivel_severidad] ?? r.nivel_severidad ?? '—',
        ESTADO_LABELS[r.estado] ?? r.estado ?? '—',
        r.municipio ?? '—',
        fmtFecha(r.created_at),
      ]),
      theme: 'grid',
      styles: {
        font: 'helvetica', fontSize: 7.5, textColor: C.oscuro,
        cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
        lineColor: C.borde, lineWidth: 0.2,
      },
      headStyles: {
        fillColor: C.headerBg, textColor: [255, 255, 255],
        fontStyle: 'bold', fontSize: 8,
      },
      columnStyles: { 0: { cellWidth: 8, halign: 'center' } },
      alternateRowStyles: { fillColor: C.filaAlt },
      didDrawPage: (data) => {
        if (data.pageNumber > 1) { cabeceraRepetida(); marcaDeAgua(H); }
      },
    });
    y = doc.lastAutoTable.finalY + 12;
  }

  // ── CUENTA ──
  if (seleccion.cuenta && perfil) {
    if (y > H - 45) { doc.addPage(); cabeceraRepetida(); marcaDeAgua(H); y = 22; }
    seccionTitulo('Información de Cuenta');
    const filas = [
      ['Email verificado', perfil.email_verificado ? 'Sí ✓' : 'No'],
      ['Rol asignado', (perfil.rol ?? '—').charAt(0).toUpperCase() + (perfil.rol ?? '').slice(1)],
      ['Cuenta activa', perfil.activo !== undefined ? (perfil.activo ? 'Sí ✓' : 'No') : '—'],
      ['Último acceso', fmtFecha(perfil.ultimo_acceso)],
      ['Total de reportes', String(reportes.length)],
    ];
    autoTable(doc, {
      startY: y,
      body: filas,
      theme: 'plain',
      margin: { left: 14, right: 14 },
      styles: { font: 'helvetica', fontSize: 9, textColor: C.oscuro, cellPadding: { top: 3.5, bottom: 3.5, left: 5, right: 5 } },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: C.verde, cellWidth: 55 },
      },
      willDrawCell: (data) => {
        doc.setFillColor(...(data.row.index % 2 === 0 ? C.filaNorm : C.filaAlt));
      },
    });
    y = doc.lastAutoTable.finalY + 12;
  }

  // ── Aviso de confidencialidad ──
  if (y > H - 30) { doc.addPage(); cabeceraRepetida(); marcaDeAgua(H); y = 22; }
  doc.setFillColor(...C.verdeClaro);
  doc.setDrawColor(...C.verdeBorde);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, y, W - 28, 14, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.verde);
  doc.text('Este documento contiene información personal y confidencial. Fue generado a solicitud del titular de los datos.', W / 2, y + 5.5, { align: 'center' });
  doc.text('GreenAlert — Plataforma de Monitoreo Ambiental Ciudadano', W / 2, y + 10, { align: 'center' });

  // ═════════════════════════════════════════════════════════════════════════
  // PIE DE PÁGINA — todas las páginas
  // ═════════════════════════════════════════════════════════════════════════
  const totalPags = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPags; i++) {
    doc.setPage(i);
    const pH = doc.internal.pageSize.getHeight();

    // Línea
    doc.setDrawColor(...C.borde);
    doc.setLineWidth(0.3);
    doc.line(14, pH - 14, W - 14, pH - 14);

    // Barra verde inferior
    doc.setFillColor(...C.verde);
    doc.rect(0, pH - 1.2, W, 1.2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.claro);
    doc.text('GreenAlert © 2026 — Monitoreo Ambiental Ciudadano', 14, pH - 6);
    doc.text(`Página ${i} de ${totalPags}`, W - 14, pH - 6, { align: 'right' });

    // Logo mini en el footer
    if (logoBase64) {
      doc.setGState(new doc.GState({ opacity: 0.3 }));
      doc.addImage(logoBase64, 'PNG', W / 2 - 3, pH - 12, 6, 6);
      doc.setGState(new doc.GState({ opacity: 1 }));
    }
  }

  const nombreArchivo = `GreenAlert_MisDatos_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(nombreArchivo);
  return nombreArchivo;
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function DescargarDatos({ open, onClose }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [seleccion, setSeleccion] = useState({ perfil: true, reportes: true, cuenta: true });
  const [generando, setGenerando] = useState(false);
  const [listo, setListo] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Datos cargados
  const [perfil, setPerfil] = useState(null);
  const [reportes, setReportes] = useState([]);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [perfilRes, reportesRes] = await Promise.all([
        getPerfil().catch(() => null),
        getMisReportes({ limit: 100, offset: 0 }).catch(() => null),
      ]);

      if (perfilRes?.data?.data?.user) {
        setPerfil(perfilRes.data.data.user);
      } else if (user) {
        setPerfil(user);
      }

      if (reportesRes?.data?.data?.reportes) {
        setReportes(reportesRes.data.data.reportes);
      }
    } catch {
      // fallback al user del contexto
      if (user) setPerfil(user);
    } finally {
      setCargando(false);
    }
  }, [user]);

  useEffect(() => {
    if (open) {
      cargarDatos();
      setListo(false);
    }
  }, [open, cargarDatos]);

  const toggleSeccion = (id) => {
    setSeleccion((prev) => ({ ...prev, [id]: !prev[id] }));
    setListo(false);
  };

  const algunaSeleccionada = SECCIONES.some((s) => seleccion[s.id]);
  const todasSeleccionadas = SECCIONES.every((s) => seleccion[s.id]);
  const conteo = SECCIONES.filter((s) => seleccion[s.id]).length;

  const seleccionarTodas = () => {
    const nuevo = {};
    SECCIONES.forEach((s) => (nuevo[s.id] = !todasSeleccionadas));
    setSeleccion(nuevo);
    setListo(false);
  };

  const handleDescargar = async () => {
    if (!algunaSeleccionada || generando) return;
    setGenerando(true);
    setListo(false);
    try {
      const nombre = await generarPDF(perfil, reportes, seleccion);
      setListo(true);
      showToast(`PDF descargado: ${nombre}`, 'success');
    } catch (err) {
      showToast('Error al generar el PDF.', 'error');
    } finally {
      setGenerando(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center">
                <Download size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Descargar mis datos</h2>
                <p className="text-xs text-gray-500">Selecciona qué incluir en tu PDF</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">

            {/* Cargando datos */}
            {cargando && (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
                <Loader2 size={16} className="animate-spin" /> Cargando tus datos...
              </div>
            )}

            {!cargando && (
              <>
                {/* Control seleccionar / deseleccionar todas */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-green-400">
                    {conteo} de {SECCIONES.length} sección{conteo !== 1 ? 'es' : ''} seleccionada{conteo !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={seleccionarTodas}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors border border-gray-800 rounded-md px-2.5 py-1"
                  >
                    {todasSeleccionadas ? 'Deseleccionar todas' : 'Seleccionar todas'}
                  </button>
                </div>

                {/* Lista de secciones */}
                <div className="space-y-2">
                  {SECCIONES.map((sec) => {
                    const activo = seleccion[sec.id];
                    return (
                      <label
                        key={sec.id}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all
                          ${activo
                            ? 'border-green-500/40 bg-green-500/5'
                            : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'}`}
                      >
                        <input
                          type="checkbox"
                          checked={activo}
                          onChange={() => toggleSeccion(sec.id)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors
                          ${activo ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}>
                          {activo && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-lg">{sec.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-200">{sec.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{sec.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Resumen de datos */}
                {perfil && (
                  <div className="flex items-center gap-4 text-xs text-gray-500 px-1">
                    <span className="flex items-center gap-1">
                      <User size={11} /> {perfil.nombre} {perfil.apellido}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClipboardList size={11} /> {reportes.length} reporte{reportes.length !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={11} /> {perfil.email_verificado ? 'Verificado' : 'Sin verificar'}
                    </span>
                  </div>
                )}

                {/* Aviso de privacidad */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/5 border border-green-500/15 text-xs text-gray-400">
                  <Lock size={13} className="text-green-500 shrink-0 mt-0.5" />
                  <span>
                    El PDF se genera <span className="text-gray-300 font-medium">localmente en tu dispositivo</span>.
                    Ningún dato es enviado a servidores externos.
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {!cargando && (
            <div className="p-5 pt-0">
              <button
                onClick={handleDescargar}
                disabled={!algunaSeleccionada || generando}
                className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold transition-all
                  ${!algunaSeleccionada || generando
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : listo
                      ? 'bg-green-600 text-white'
                      : 'bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-400 active:scale-[0.98]'}`}
              >
                {generando ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Generando PDF...
                  </>
                ) : listo ? (
                  <>
                    <Check size={15} />
                    ¡PDF descargado!
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    Descargar PDF
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
