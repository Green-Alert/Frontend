import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Camera, Users, CheckCircle2, BarChart2, Bell,
  FileText, ArrowDown, ArrowUp, ChevronRight, ArrowRight,
  Leaf, Shield, Mail, Github, AlertTriangle, Globe, Eye,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Reveal, CountUp } from '../utils/animations.jsx';
import { useAuth } from '../context/AuthContext';
import { getStats } from '../services/api';
import SectionNav from '../components/SectionNav.jsx';

const FEATURES = [
  {
    Icon: MapPin,
    title: 'Geolocalización precisa',
    desc: 'Ubica cada incidencia en el mapa con coordenadas exactas. Permite que autoridades y comunidades identifiquen el punto exacto del problema.',
    color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',
    glow: 'rgba(16,185,129,0.14)',
  },
  {
    Icon: Camera,
    title: 'Evidencia multimedia',
    desc: 'Adjunta fotos como respaldo visual del reporte. Cada imagen queda vinculada al caso para facilitar la verificación institucional.',
    color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20',
    glow: 'rgba(14,165,233,0.14)',
  },
  {
    Icon: CheckCircle2,
    title: 'Moderación y trazabilidad',
    desc: 'Cada reporte es revisado, clasificado por nivel de severidad y sigue un flujo de estado hasta su resolución. Nunca se pierde un caso.',
    color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20',
    glow: 'rgba(34,197,94,0.14)',
  },
  {
    Icon: BarChart2,
    title: 'Mapa de alertas en tiempo real',
    desc: 'Visualiza el estado ambiental de tu región en un mapa interactivo. Identifica zonas críticas y patrones de contaminación.',
    color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20',
    glow: 'rgba(245,158,11,0.14)',
  },
  {
    Icon: Users,
    title: 'Red ciudadana',
    desc: 'Reportes respaldados por la comunidad. Más votos de relevancia = mayor prioridad para intervención. La acción colectiva escala el impacto.',
    color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20',
    glow: 'rgba(139,92,246,0.14)',
  },
  {
    Icon: Bell,
    title: 'Categorías especializadas',
    desc: 'Desde contaminación del agua hasta incendios forestales y deslizamientos. Once categorías cubren el espectro completo de riesgos ambientales.',
    color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20',
    glow: 'rgba(244,63,94,0.14)',
  },
];

const STEPS = [
  {
    Icon: FileText, num: '01', title: 'Crea el reporte',
    desc: 'Selecciona la categoría, describe el problema, marca la ubicación y adjunta evidencia fotográfica. Menos de 2 minutos.',
    color: 'text-green-400', accent: '#22c55e',
  },
  {
    Icon: Shield, num: '02', title: 'Se verifica',
    desc: 'Moderadores revisan cada caso, asignan nivel de severidad y lo clasifican para derivarlo a las entidades competentes.',
    color: 'text-blue-400', accent: '#3b82f6',
  },
  {
    Icon: CheckCircle2, num: '03', title: 'Se resuelve',
    desc: 'Las autoridades reciben el caso estructurado. La comunidad hace seguimiento al estado hasta el cierre del reporte.',
    color: 'text-emerald-400', accent: '#10b981',
  },
];

const PROBLEM_ITEMS = [
  { icon: AlertTriangle, text: 'Vertimientos de residuos en fuentes hídricas sin denuncia formal', color: 'text-red-400', accent: '#f87171' },
  { icon: Globe, text: 'Deforestación y pérdida de cobertura vegetal sin registro ciudadano', color: 'text-amber-400', accent: '#fbbf24' },
  { icon: Eye, text: 'Reportes que llegan a las autoridades sin evidencia ni geolocalización', color: 'text-orange-400', accent: '#fb923c' },
];

const IMPACT_STATS = [
  {
    value: '11',
    unit: 'categorías de riesgo',
    label: 'Desde contaminación hídrica hasta incendios forestales y deslizamientos. Cobertura ambiental completa.',
    color: 'text-green-400',
    accent: 'rgba(34,197,94,0.07)',
    border: 'rgba(34,197,94,0.20)',
  },
  {
    value: '< 2',
    unit: 'minutos',
    label: 'Es todo lo que tardas en crear un reporte con ubicación exacta, evidencia fotográfica y descripción.',
    color: 'text-emerald-400',
    accent: 'rgba(16,185,129,0.07)',
    border: 'rgba(16,185,129,0.20)',
  },
  {
    value: '100%',
    unit: 'verificados',
    label: 'Cada reporte es revisado por moderadores antes de publicarse. Datos confiables para las autoridades.',
    color: 'text-teal-400',
    accent: 'rgba(20,184,166,0.07)',
    border: 'rgba(20,184,166,0.20)',
  },
];

const MISSION_CARDS = [
  {
    icon: Leaf, color: '#22c55e', title: 'Medio ambiente primero',
    desc: 'Cada ciudadano tiene el poder de proteger su entorno. GreenAlert convierte la preocupación ambiental en acción concreta y documentada.',
  },
  {
    icon: Shield, color: '#3b82f6', title: 'Datos confiables',
    desc: 'Cada reporte pasa por verificación. La transparencia y la precisión son la base de nuestra plataforma y de su credibilidad institucional.',
  },
  {
    icon: Users, color: '#a78bfa', title: 'Red nacional',
    desc: 'Colombia cuenta con más de 1.100 municipios. GreenAlert conecta a sus habitantes para construir una red de vigilancia ambiental colaborativa.',
  },
];

export default function Home() {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
    getStats()
      .then(({ data }) => setStatsData(data.data.stats))
      .catch(() => {});
  }, []);

  const heroRef = useRef(null);
  const orb1 = useRef(null);
  const orb2 = useRef(null);
  const orb3 = useRef(null);
  const orb4 = useRef(null);
  const orb5 = useRef(null);
  const orb6 = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const mouse = { x: 0, y: 0 };
    const cur   = { x: 0, y: 0 };
    let raf;

    // [ref, multiplierX, multiplierY] — negativos = sentido contrario al cursor
    const LAYERS = [
      [orb1,  22,  16],
      [orb2, -52, -40],
      [orb3,  42,  35],
      [orb4,  28,  22],
      [orb5, -68, -55],
      [orb6,  58,  48],
    ];

    const onMove = (e) => {
      const r = hero.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width  - 0.5;
      mouse.y = (e.clientY - r.top)  / r.height - 0.5;
    };

    const tick = () => {
      cur.x += (mouse.x - cur.x) * 0.055;
      cur.y += (mouse.y - cur.y) * 0.055;
      for (const [ref, mx, my] of LAYERS) {
        if (ref.current)
          ref.current.style.transform = `translate(${cur.x * mx}px, ${cur.y * my}px)`;
      }
      raf = requestAnimationFrame(tick);
    };

    hero.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      hero.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const statsDisplay = [
    { label: 'Reportes registrados',  value: statsData?.total_reportes,    suffix: '+' },
    { label: 'Municipios reportados', value: statsData?.municipios_activos, suffix: '' },
    { label: 'Casos con seguimiento', value: statsData?.con_seguimiento,    suffix: '+' },
    { label: 'Ciudadanos activos',    value: statsData?.total_usuarios,     suffix: '+' },
  ];

  return (
    <div className="flex flex-col">

      <SectionNav />

      {/* HERO */}
      <section id="inicio" ref={heroRef} className="relative overflow-hidden pt-12 pb-24 sm:pt-16 sm:pb-32 lg:min-h-screen lg:flex lg:flex-col lg:justify-center px-4 sm:px-6 text-center">
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          {/* Grain texture */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04] mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
            <filter id="ga-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#ga-grain)" />
          </svg>

          {/* Blob 1 — masa central principal, sube lento */}
          <div ref={orb1} className="absolute rounded-full" style={{
            left: 'calc(50% - 420px)', bottom: '-10%',
            width: '840px', height: '680px',
            background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.20) 0%, rgba(16,185,129,0.09) 50%, transparent 72%)',
            filter: 'blur(70px)',
            animation: 'lava-rise-1 18s ease-in-out infinite',
            willChange: 'transform',
          }} />

          {/* Blob 2 — masa izquierda esmeralda, sube desplazada */}
          <div ref={orb2} className="absolute rounded-full" style={{
            left: '-8%', bottom: '-15%',
            width: '580px', height: '500px',
            background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.17) 0%, rgba(34,197,94,0.07) 58%, transparent 75%)',
            filter: 'blur(60px)',
            animation: 'lava-rise-2 23s ease-in-out infinite',
            animationDelay: '-7s',
            willChange: 'transform',
          }} />

          {/* Blob 3 — masa derecha teal */}
          <div ref={orb3} className="absolute rounded-full" style={{
            right: '-6%', bottom: '-12%',
            width: '520px', height: '460px',
            background: 'radial-gradient(ellipse at center, rgba(20,184,166,0.15) 0%, rgba(34,197,94,0.06) 55%, transparent 74%)',
            filter: 'blur(58px)',
            animation: 'lava-rise-3 20s ease-in-out infinite',
            animationDelay: '-12s',
            willChange: 'transform',
          }} />

          {/* Blob 4 — núcleo pequeño central, el más brillante */}
          <div ref={orb4} className="absolute rounded-full" style={{
            left: 'calc(50% - 160px)', bottom: '-5%',
            width: '320px', height: '260px',
            background: 'radial-gradient(ellipse at center, rgba(74,222,128,0.21) 0%, transparent 68%)',
            filter: 'blur(36px)',
            animation: 'lava-rise-1 14s ease-in-out infinite',
            animationDelay: '-5s',
            willChange: 'transform',
          }} />

          {/* Blob 5 — gota pequeña izquierda */}
          <div ref={orb5} className="absolute rounded-full" style={{
            left: '22%', bottom: '-8%',
            width: '220px', height: '200px',
            background: 'radial-gradient(ellipse, rgba(34,197,94,0.17) 0%, transparent 72%)',
            filter: 'blur(30px)',
            animation: 'lava-rise-2 16s ease-in-out infinite',
            animationDelay: '-3s',
            willChange: 'transform',
          }} />

          {/* Blob 6 — gota pequeña derecha */}
          <div ref={orb6} className="absolute rounded-full" style={{
            right: '20%', bottom: '-6%',
            width: '190px', height: '170px',
            background: 'radial-gradient(ellipse, rgba(20,184,166,0.15) 0%, transparent 72%)',
            filter: 'blur(28px)',
            animation: 'lava-rise-3 19s ease-in-out infinite',
            animationDelay: '-9s',
            willChange: 'transform',
          }} />
        </div>

        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Plataforma activa de monitoreo ambiental ciudadano
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            El medio ambiente<br />
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              necesita tu voz.
            </span>
          </h1>

          <motion.p
            className="mt-7 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            GreenAlert es la plataforma que convierte la preocupación ambiental en datos estructurados.
            Reporta, mapea y da seguimiento a problemas ambientales en tu municipio —
            y haz que lleguen a quienes pueden actuar.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {user ? (
              <>
                <Link to="/dashboard" className="btn-primary text-base inline-flex items-center gap-2 justify-center px-6 py-3">
                  Ir a mi panel <ChevronRight size={16} />
                </Link>
                <Link to="/reports" className="btn-secondary text-base px-6 py-3 inline-flex items-center gap-2 justify-center">
                  Ver mapa de reportes <ArrowRight size={15} />
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base inline-flex items-center gap-2 justify-center px-6 py-3">
                  Crear cuenta gratis <ChevronRight size={16} />
                </Link>
                <Link to="/reports" className="btn-secondary text-base px-6 py-3 inline-flex items-center gap-2 justify-center">
                  Ver reportes públicos <ArrowRight size={15} />
                </Link>
              </>
            )}
          </motion.div>

          {!user && (
            <motion.p
              className="mt-5 text-xs text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Gratuito · Verificado por moderadores · Con seguimiento hasta la resolución
            </motion.p>
          )}
        </motion.div>

        <motion.div
          className="mt-20 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="text-[11px] text-gray-700 tracking-widest uppercase">Conoce la plataforma</span>
          <button
            aria-label="Ver más sobre GreenAlert"
            onClick={() => document.getElementById('contexto')?.scrollIntoView({ behavior: 'smooth' })}
            className="p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer group"
          >
            <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}>
              <ArrowDown size={17} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
            </motion.div>
          </button>
        </motion.div>
      </section>

      {/* EL CONTEXTO — el problema que existe */}
      <section id="contexto" className="py-20 lg:min-h-screen lg:flex lg:flex-col lg:justify-center px-4 sm:px-6 border-t border-gray-800/40 bg-gray-950/60">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-12">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-amber-500/80 mb-3">El contexto</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-snug">
              Los problemas ambientales existen.<br />
              <span className="text-gray-400 font-normal">Lo que falta es documentarlos y escalarlos.</span>
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-5">
            {PROBLEM_ITEMS.map(({ icon: Icon, text, color, accent }, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div
                  className="flex flex-col gap-4 p-5 rounded-xl border border-gray-800/60 bg-gray-900/50 h-full"
                  style={{ borderLeft: `3px solid ${accent}55` }}
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-800/80 flex items-center justify-center shrink-0">
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <div className="mt-8 p-6 rounded-xl border border-green-900/40 bg-green-950/20 flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/25 flex items-center justify-center shrink-0 mt-0.5">
                <Leaf className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-gray-300 leading-relaxed">
                <span className="text-green-400 font-semibold">GreenAlert resuelve esto.</span>{' '}
                Centraliza los reportes ciudadanos, los estructura con geolocalización y evidencia,
                y los entrega a los actores institucionales con la trazabilidad necesaria para actuar.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* IMPACTO — evidencia en números */}
      <section id="impacto" className="py-20 lg:min-h-screen lg:flex lg:flex-col lg:justify-center px-4 sm:px-6 border-t border-gray-800/40">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-12">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-green-500/60 mb-2">Por qué GreenAlert</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Diseñado para tener impacto real</h2>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-5">
            {IMPACT_STATS.map((s, i) => (
              <Reveal key={s.unit} delay={i * 0.1}>
                <div
                  className="relative rounded-2xl p-8 flex flex-col gap-2 text-center h-full transition-all duration-300 hover:scale-[1.02]"
                  style={{ background: s.accent, border: `1px solid ${s.border}` }}
                >
                  <div className={`text-6xl sm:text-7xl font-extrabold ${s.color} leading-none tabular-nums`}>{s.value}</div>
                  <div className="text-[11px] font-semibold tracking-widest uppercase text-gray-500 mt-1">{s.unit}</div>
                  <p className="text-sm text-gray-400 leading-relaxed mt-1">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* STATS — solo se muestra cuando hay datos significativos */}
      {statsData && statsData.total_reportes >= 20 && (
      <section className="py-14 px-4 sm:px-6 border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {statsDisplay.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.07}>
              <div className="text-4xl sm:text-5xl font-extrabold text-green-400 tabular-nums">
                <CountUp target={s.value} />{s.suffix}
              </div>
              <div className="text-sm text-gray-500 mt-2 leading-snug">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>
      )}

      {/* CAPACIDADES */}
      <section id="capacidades" className="py-24 lg:min-h-screen lg:flex lg:flex-col lg:justify-center px-4 sm:px-6 border-t border-gray-800/60 bg-gray-900/30">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-green-500/70 mb-3">Capacidades</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Todo lo que necesitas para reportar</h2>
            <p className="mt-3 text-gray-400 max-w-xl mx-auto">
              Una plataforma diseñada para que cada reporte tenga el mayor impacto posible.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.07}>
                <motion.div
                  className={`h-full rounded-xl border ${f.border} bg-gray-900/80 p-5 flex flex-col gap-3 cursor-default`}
                  whileHover={{ y: -4, boxShadow: `0 14px 36px ${f.glow}` }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`w-11 h-11 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center`}>
                    <f.Icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <h3 className="font-semibold text-white">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* EL PROCESO */}
      <section id="proceso" className="py-24 lg:min-h-screen lg:flex lg:flex-col lg:justify-center px-4 sm:px-6 border-t border-gray-800/60">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-16">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-green-500/70 mb-3">El proceso</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">De la observación a la resolución</h2>
            <p className="mt-3 text-gray-400 max-w-lg mx-auto">
              Tres pasos claros que transforman un problema ambiental en un caso gestionado.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-10 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-px"
              style={{ background: 'linear-gradient(to right, transparent, #16a34a55, transparent)' }}
            />
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.12}>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="relative">
                    <div
                      className="w-24 h-24 rounded-2xl flex items-center justify-center border relative overflow-hidden"
                      style={{ background: s.accent + '12', borderColor: s.accent + '35' }}
                    >
                      <span className="absolute text-8xl font-black opacity-[0.06] text-white select-none pointer-events-none">{s.num.slice(1)}</span>
                      <s.Icon className={`w-10 h-10 ${s.color} relative`} />
                    </div>
                    <span
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center text-gray-950"
                      style={{ background: s.accent }}
                    >
                      {s.num.slice(1)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{s.title}</h3>
                    <p className="mt-1.5 text-sm text-gray-400 leading-relaxed max-w-[210px]">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SOBRE NOSOTROS — anchor: #nosotros */}
      <section id="nosotros" className="py-24 lg:min-h-screen lg:flex lg:flex-col lg:justify-center px-4 sm:px-6 border-t border-gray-800/60 bg-gray-900/25">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/25 text-green-400 text-sm font-medium mb-4">
              <Leaf className="w-4 h-4" />
              Sobre GreenAlert
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Nuestra misión</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Democratizar el acceso a la información ambiental y empoderar a cada colombiano
              para actuar frente al deterioro ecológico.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-6">
            {MISSION_CARDS.map(({ icon: Icon, color, title, desc }, i) => (
              <Reveal key={title} delay={i * 0.1}>
                <div className="card h-full flex flex-col gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: color + '18', border: `1.5px solid ${color}40` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1.5">{title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTO — anchor: #contacto */}
      <section id="contacto" className="relative py-24 lg:min-h-screen lg:flex lg:flex-col lg:justify-center px-4 sm:px-6 border-t border-gray-800/60 overflow-hidden">
        {/* Fondo atmosférico */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/25 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-green-500/4 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[200px] bg-emerald-600/4 rounded-full blur-3xl" />
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <Reveal>
            {/* Ícono destacado */}
            <div className="inline-flex w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/25 items-center justify-center mb-7">
              <Mail className="w-7 h-7 text-green-400" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-snug">
              ¿Tienes dudas o quieres<br />colaborar con el proyecto?
            </h2>
            <p className="text-gray-400 max-w-md mx-auto leading-relaxed mb-10">
              GreenAlert es código abierto y construido en comunidad.
              Tu feedback, ideas y contribuciones hacen esta plataforma mejor para todos.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:greenalert.webcompany@gmail.com"
                className="btn-primary flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Escríbenos
              </a>
              <a
                href="https://github.com/Prueba-DD"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Github className="w-4 h-4" />
                Ver en GitHub
              </a>
            </div>
          </Reveal>

          {/* Info cards en fila */}
          <Reveal delay={0.15}>
            <div className="mt-14 pt-10 border-t border-gray-800/60 grid sm:grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-3 p-5 rounded-xl bg-gray-900/50 border border-gray-800/60">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Correo</p>
                  <p className="text-sm text-white font-medium break-all">greenalert.webcompany@gmail.com</p>
                  <p className="text-xs text-gray-600 mt-1">Respondemos en menos de 48 h</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 p-5 rounded-xl bg-gray-900/50 border border-gray-800/60">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Github className="w-5 h-5 text-violet-400" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Repositorio</p>
                  <p className="text-sm text-white font-medium">github.com/Green-Alert</p>
                  <p className="text-xs text-gray-600 mt-1">Peticiones y discusiones abiertas</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 p-5 rounded-xl bg-gray-900/50 border border-gray-800/60">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Licencia</p>
                  <p className="text-sm text-white font-medium">MIT — Código abierto</p>
                  <p className="text-xs text-gray-600 mt-1">Libre para usar y modificar</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Volver al inicio */}
          <div className="mt-14 flex justify-center">
            <button
              onClick={() => document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' })}
              aria-label="Volver al inicio"
              className="flex flex-col items-center gap-1.5 text-gray-700 hover:text-gray-500 transition-colors group"
            >
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}>
                <ArrowUp size={15} />
              </motion.div>
              <span className="text-[10px] tracking-widest uppercase">Volver al inicio</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
