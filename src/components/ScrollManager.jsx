import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ROUTE_TITLES = {
  '/': 'Syncra Digital Agency | Digital Solutions That Grow Businesses',
  '/about': 'About Us | Syncra Digital Agency',
  '/portfolio': 'Portfolio | Syncra Digital Agency',
  '/faq': 'FAQ | Syncra Digital Agency',
  '/contact': 'Contact Us | Syncra Digital Agency',
  '/insights': 'Insights & Articles | Syncra Digital Agency',
  '/syncra-admin': 'Admin Console | Syncra Digital Agency',
};

export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const normalizedPath = pathname.endsWith('/') && pathname.length > 1
      ? pathname.slice(0, -1)
      : pathname;

    if (ROUTE_TITLES[normalizedPath]) {
      document.title = ROUTE_TITLES[normalizedPath];
    } else if (normalizedPath.startsWith('/insights/')) {
      document.title = 'Article | Syncra Digital Agency';
    } else {
      document.title = 'Page Not Found | Syncra Digital Agency';
    }
  }, [pathname]);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = prefersReduced ? 'auto' : 'smooth';

    if (hash) {
      const targetId = hash.replace(/^#/, '');
      let attempts = 0;

      const tryScroll = () => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior, block: 'start' });
          return;
        }
        attempts += 1;
        if (attempts < 10) {
          window.setTimeout(tryScroll, 80);
        }
      };

      tryScroll();
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
}
