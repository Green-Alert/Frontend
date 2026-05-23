// Navegación flotante lateral para la landing page.
// Muestra puntos (dots) por cada sección; el punto activo se resalta en verde.
// Solo visible en desktop (lg+).
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

const SECTIONS = [
  { id: 'inicio',      label: 'Inicio' },
  { id: 'contexto',    label: 'Contexto' },
  { id: 'impacto',     label: 'Impacto' },
  { id: 'capacidades', label: 'Capacidades' },
  { id: 'proceso',     label: 'Cómo funciona' },
  { id: 'nosotros',    label: 'Nosotros' },
  { id: 'contacto',    label: 'Contacto' },
];

export default function SectionNav() {
  const [active, setActive]   = useState('inicio');
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const observers = [];

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: '-35% 0px -35% 0px', threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3">
      {SECTIONS.map(({ id, label }) => (
        <div key={id} className="relative flex items-center">
          {/* Tooltip label */}
          <AnimatePresence>
            {hovered === id && (
              <motion.span
                key="tip"
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-6 whitespace-nowrap text-[11px] text-gray-300 bg-gray-900/90 border border-gray-700/60 px-2 py-0.5 rounded-md pointer-events-none"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Dot */}
          <button
            onClick={() => scrollTo(id)}
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
            aria-label={`Ir a ${label}`}
            className="w-5 h-5 flex items-center justify-center"
          >
            <motion.span
              animate={
                active === id
                  ? { width: 10, height: 10, backgroundColor: '#4ade80' }
                  : { width: 6,  height: 6,  backgroundColor: '#4b5563' }
              }
              transition={{ duration: 0.25 }}
              className="block rounded-full"
              style={active === id ? { boxShadow: '0 0 6px rgba(74,222,128,0.45)' } : {}}
            />
          </button>
        </div>
      ))}
    </div>
  );
}
