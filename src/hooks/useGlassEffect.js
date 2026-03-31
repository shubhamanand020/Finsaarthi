import { useCallback } from 'react';

/**
 * Attaches mouse-move tracking to any element ref.
 * Sets --x / --y (percentage) for glass-btn spotlight,
 * and --cx / --cy (px) for card-level cursor glow.
 *
 * Usage:
 *   const { trackBtn, trackCard } = useGlassEffect();
 *   <button ref={trackBtn} className="glass-btn" ...>
 *   <div ref={trackCard} className="cursor-glow" ...>
 */
export const useGlassEffect = () => {
  const trackBtn = useCallback((node) => {
    if (!node) return;
    const onMove = (e) => {
      const rect = node.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      node.style.setProperty('--x', `${x}%`);
      node.style.setProperty('--y', `${y}%`);
    };
    node.addEventListener('mousemove', onMove);
    return () => node.removeEventListener('mousemove', onMove);
  }, []);

  const trackCard = useCallback((node) => {
    if (!node) return;
    const onMove = (e) => {
      const rect = node.getBoundingClientRect();
      node.style.setProperty('--cx', `${e.clientX - rect.left}px`);
      node.style.setProperty('--cy', `${e.clientY - rect.top}px`);
    };
    node.addEventListener('mousemove', onMove);
    return () => node.removeEventListener('mousemove', onMove);
  }, []);

  return { trackBtn, trackCard };
};
