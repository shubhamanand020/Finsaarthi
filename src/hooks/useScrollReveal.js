import { useEffect, useRef } from 'react';

/**
 * useScrollReveal
 *
 * Returns a ref to attach to a container element.
 * Any child elements inside with [data-reveal] will animate
 * whenever they enter OR leave the viewport (so scroll-up
 * also re-triggers the animation).
 *
 * Optional CSS var:  --reveal-delay  (e.g. "0.1s", "0.2s")
 * to stagger children manually.
 *
 * Usage:
 *   const ref = useScrollReveal();
 *   <div ref={ref}>
 *     <div data-reveal>...</div>
 *     <div data-reveal style={{ '--reveal-delay': '0.1s' }}>...</div>
 *   </div>
 */
export function useScrollReveal(threshold = 0.18) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const targets = container.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // entering viewport → play pop-in
            entry.target.classList.remove('reveal-hidden', 'reveal-exit');
            entry.target.classList.add('reveal-visible');
          } else {
            // leaving viewport → reset so it can re-animate
            entry.target.classList.remove('reveal-visible');
            entry.target.classList.add('reveal-hidden');
          }
        });
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => {
      el.classList.add('reveal-hidden');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
