import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'motion/react';

/**
 * Reveal — fade+slide bidireccional al entrar/salir del viewport.
 * Al bajar: elementos entran desde abajo (y:20→0).
 * Al subir: elementos entran desde arriba (y:-16→0).
 */
export function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [state, setState] = useState('below'); // 'visible' | 'above' | 'below'

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('visible');
        } else {
          // Determinar si el elemento salió por arriba o por abajo
          setState(entry.boundingClientRect.top < 0 ? 'above' : 'below');
        }
      },
      // Top: 0px → el exit superior dispara justo al salir (invisible)
      // Bottom: -10% → entry desde abajo dispara cuando el elemento lleva 10% adentro
      { rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      animate={
        state === 'visible'
          ? { opacity: 1, y: 0 }
          : state === 'above'
          ? { opacity: 0, y: -16 }
          : { opacity: 0, y: 20 }
      }
      transition={{ duration: 0.46, delay: state === 'visible' ? delay : 0, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

/**
 * CountUp — contador animado que se repite cada vez que entra al viewport
 */
export function CountUp({ target, className }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: false, margin: '0px 0px -10% 0px' });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView || target == null) return;
    setVal(0);
    const duration = 1200;
    const start    = performance.now();
    let raf;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(ease * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  return (
    <span ref={ref} className={className}>
      {target == null
        ? <span className="inline-block w-10 h-7 bg-gray-800 rounded animate-pulse" />
        : val}
    </span>
  );
}
