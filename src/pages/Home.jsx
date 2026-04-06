import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Camera, Users, CheckCircle2, BarChart2, Bell,
  FileText, Search, ArrowDown, ChevronRight,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Reveal, CountUp } from '../utils/animations.jsx';
import { useAuth } from '../context/AuthContext';
import { getStats } from '../services/api';

/* ---------- datos ---------- */

const features = [
  { Icon: MapPin,       title: 'Geolocalización',         desc: 'Ubica y mapea problemáticas ambientales con precisión geográfica en tu territorio.',         color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { Icon: Camera,       title: 'Evidencia Multimedia',    desc: 'Adjunta fotos, videos o documentos a cada reporte para respaldarlo con pruebas.',             color: 'text-sky-400',     bg: 'bg-sky-500/10' },
  { Icon: Users,        title: 'Participación Colectiva', desc: 'La comunidad puede reportar, apoyar y comentar incidencias ambientales de su entorno.',       color: 'text-violet-400',  bg: 'bg-violet-500/10' },
  { Icon: CheckCircle2, title: 'Validación de Reportes',  desc: 'Sistema de gestión para verificar y dar seguimiento institucional a cada caso reportado.',    color: 'text-green-400',   bg: 'bg-green-500/10' },
  { Icon: BarChart2,    title: 'Visualización',           desc: 'Mapa interactivo e indicadores del estado ambiental de tu región en tiempo real.',            color: 'text-amber-400',   bg: 'bg-amber-500/10' },
  { Icon: Bell,         title: 'Alertas Tempranas',       desc: 'Recibe notificaciones cuando surjan problemas ambientales cerca de tu zona habitual.',        color: 'text-rose-400',    bg: 'bg-rose-500/10' },
];

const steps = [
  { Icon: FileText,    number: '01', title: 'Reporta',    desc: 'Describe el problema ambiental, adjunta fotos y ubícalo en el mapa.' },
  { Icon: Search,      number: '02', title: 'Se verifica', desc: 'Nuestra red comunitaria y moderadores validan y clasifican el reporte.' },
  { Icon: CheckCircle2,number: '03', title: 'Se resuelve', desc: 'Las autoridades reciben el caso y se genera seguimiento hasta su cierre.' },
];

/* ---------- componentes auxiliares ---------- */



/* ---------- página ---------- */

export default function Home() {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
    getStats()
      .then(({ data }) => setStatsData(data.data.stats))
      .catch(() => {});
  }, []);

  const statsDisplay = [
    { label: 'Reportes registrados',   value: statsData?.total_reportes },
    { label: 'Municipios reportados',  value: statsData?.municipios_activos },
    { label: 'Casos con seguimiento',  value: statsData?.con_seguimiento },
    { label: 'Ciudadanos activos',     value: statsData?.total_usuarios },
  ];

  return (
    <div className="flex flex-col">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden py-28 px-4 sm:px-6 text-center">
        {/* glows */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[500px] bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute left-1/4 bottom-0 w-[300px] h-[300px] bg-emerald-600/5 rounded-full blur-2xl" />
          <div className="absolute right-1/4 top-1/3 w-[200px] h-[200px] bg-green-400/5 rounded-full blur-2xl" />
        </div>

        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* badge */}
          <motion.span
            className="inline-flex items-center gap-2 badge bg-green-500/10 text-green-400 border border-green-500/30 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Plataforma de monitoreo ambiental ciudadano
          </motion.span>

          <h1 className="mt-4 text-5xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Cuida tu entorno.<br />
            <span className="text-green-400">Actúa juntos.</span>
          </h1>

          <motion.p
            className="mt-6 text-lg text-gray-400 max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            GreenAlert conecta a tu comunidad para reportar, mapear y dar seguimiento a
            problemas ambientales. Cada reporte cuenta.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
          >
            {user ? (
              <>
                <Link to="/dashboard" className="btn-primary text-base inline-flex items-center gap-2 justify-center">
                  Ir a mi panel <ChevronRight size={16} />
                </Link>
                <Link to="/reports" className="btn-secondary text-base">
                  Ver reportes
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base inline-flex items-center gap-2 justify-center">
                  Empezar gratis <ChevronRight size={16} />
                </Link>
                <Link to="/reports" className="btn-secondary text-base">
                  Ver reportes
                </Link>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* scroll indicator */}
        <motion.div
          className="mt-16 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          >
            <ArrowDown size={18} className="text-gray-600" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="py-14 px-4 sm:px-6 border-y border-gray-800 bg-gray-900/40">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {statsDisplay.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.07}>
              <div className="text-4xl font-extrabold text-green-400">
                <CountUp target={s.value} />
              </div>
              <div className="text-sm text-gray-400 mt-2">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white">¿Qué puedes hacer con GreenAlert?</h2>
            <p className="mt-3 text-gray-400">Una plataforma completa para la acción ambiental colectiva.</p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.07}>
                <motion.div
                  className="card h-full hover:border-green-800 transition-colors duration-200 group cursor-default"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-4`}>
                    <f.Icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="py-24 px-4 sm:px-6 bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">¿Cómo funciona?</h2>
            <p className="mt-3 text-gray-400">Tres pasos para convertir una problemática en acción.</p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* línea conectora (solo desktop) */}
            <div className="hidden md:block absolute top-8 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-transparent via-green-700/50 to-transparent" />

            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.12}>
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center group-hover:border-green-700 transition-colors">
                      <s.Icon className="w-7 h-7 text-green-400" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 text-gray-950 text-[10px] font-black flex items-center justify-center">
                      {s.number.slice(1)}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-lg">{s.title}</h3>
                  <p className="mt-2 text-sm text-gray-400 leading-relaxed max-w-[200px]">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-20 px-4 sm:px-6 text-center">
        <Reveal>
          <div className="max-w-2xl mx-auto card border-green-900/60 bg-gradient-to-b from-green-950/40 to-gray-900">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              {user ? '¿Listo para tu próximo reporte?' : '¿Ves un problema ambiental cerca de ti?'}
            </h2>
            <p className="mt-3 text-gray-400">
              {user
                ? 'Cada reporte suma. Contribuye a mantener tu entorno limpio y saludable.'
                : 'No lo ignores. Repórtalo en segundos y activa a tu comunidad.'}
            </p>
            {user ? (
              <Link to="/reports/new" className="btn-primary inline-block mt-6">
                + Nuevo reporte
              </Link>
            ) : (
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register" className="btn-primary">
                  Crear cuenta gratis
                </Link>
                <Link to="/login" className="btn-secondary">
                  Ya tengo cuenta
                </Link>
              </div>
            )}
          </div>
        </Reveal>
      </section>

    </div>
  );
}
