import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'motion/react';

/**
 * Reveal — fade+slide al entrar al viewport (scroll-reveal)
 * Props: children, delay (segundos), className
 */
export function Reveal({ children, delay = 0, className = '' }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-70px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

/**
 * CountUp — contador animado desde 0 hasta `target` al entrar al viewport
 * Props: target (número | null), className
 */
export function CountUp({ target, className }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView || target == null) return;
    const duration = 1200;
    const start    = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return (
    <span ref={ref} className={className}>
      {target == null
        ? <span className="inline-block w-10 h-7 bg-gray-800 rounded animate-pulse" />
        : val}
    </span>
  );
}
