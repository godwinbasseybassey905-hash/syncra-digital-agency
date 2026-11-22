import { useEffect } from 'react';

export function useScrollReveal(containerRef, deps = []) {
  useEffect(() => {
    const root = containerRef?.current || document;
    const elements = Array.from(
      root.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
    );

    if (elements.length === 0) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || !('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const revealIfInView = (el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.96) {
        el.classList.add('is-visible');
        return true;
      }
      return false;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px',
      }
    );

    elements.forEach((el) => {
      if (!el.classList.contains('is-visible') && !revealIfInView(el)) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
