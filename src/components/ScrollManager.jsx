import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PRODUCTION_ORIGIN = 'https://syncra-digital-agency.vercel.app';

const ROUTE_SEO = {
  '/': {
    title: 'Syncra Digital Agency | Digital Solutions That Grow Businesses',
    description:
      'Syncra Digital Agency helps businesses grow through professional website design, SEO, branding, graphic design, video editing, content creation and digital marketing.',
    canonical: `${PRODUCTION_ORIGIN}/`,
    robots: 'index, follow',
  },
  '/about': {
    title: 'About Us | Syncra Digital Agency',
    description:
      'Learn about Syncra Digital Agency, our creative philosophy, and leadership under Founder & CEO Godwin Bassey Bassey in Lagos, Nigeria. We craft distinctive digital experiences.',
    canonical: `${PRODUCTION_ORIGIN}/about`,
    robots: 'index, follow',
  },
  '/portfolio': {
    title: 'Selected Portfolio & Projects | Syncra Digital Agency',
    description:
      'Explore creative work and digital projects by Syncra Digital Agency. Web design, branding, and digital solutions crafted for ambitious brands.',
    canonical: `${PRODUCTION_ORIGIN}/portfolio`,
    robots: 'index, follow',
  },
  '/faq': {
    title: 'Frequently Asked Questions | Syncra Digital Agency',
    description:
      'Find answers to common questions about Syncra Digital Agency’s website design, development process, branding, pricing, timelines, and digital services.',
    canonical: `${PRODUCTION_ORIGIN}/faq`,
    robots: 'index, follow',
  },
  '/contact': {
    title: 'Contact Us | Syncra Digital Agency',
    description:
      'Get in touch with Syncra Digital Agency. Connect directly via WhatsApp or email to discuss your website design, branding, SEO, or digital marketing project.',
    canonical: `${PRODUCTION_ORIGIN}/contact`,
    robots: 'index, follow',
  },
  '/insights': {
    title: 'Insights & Articles | Syncra Digital Agency',
    description:
      'Read actionable perspectives, guides, and ideas on modern website design, SEO, branding, and digital growth from the Syncra Digital Agency editorial team.',
    canonical: `${PRODUCTION_ORIGIN}/insights`,
    robots: 'index, follow',
  },
  '/syncra-admin': {
    title: 'Admin Console | Syncra Digital Agency',
    description: 'Syncra Digital Agency Private Management Console.',
    canonical: `${PRODUCTION_ORIGIN}/syncra-admin`,
    robots: 'noindex, nofollow',
  },
};

function updateMetaTag(attribute, name, content) {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateLinkTag(rel, href) {
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const normalizedPath =
      pathname.endsWith('/') && pathname.length > 1
        ? pathname.slice(0, -1)
        : pathname;

    let seoConfig = ROUTE_SEO[normalizedPath];

    if (!seoConfig) {
      if (normalizedPath.startsWith('/syncra-admin')) {
        seoConfig = {
          title: 'Admin Console | Syncra Digital Agency',
          description: 'Syncra Digital Agency Private Management Console.',
          canonical: `${PRODUCTION_ORIGIN}/syncra-admin`,
          robots: 'noindex, nofollow',
        };
      } else if (normalizedPath.startsWith('/insights/')) {
        seoConfig = {
          title: 'Article | Syncra Digital Agency',
          description:
            'Article from Syncra Digital Agency on design, web development, and digital strategy.',
          canonical: `${PRODUCTION_ORIGIN}${normalizedPath}`,
          robots: 'index, follow',
        };
      } else {
        seoConfig = {
          title: 'Page Not Found | Syncra Digital Agency',
          description: 'The requested page could not be found.',
          canonical: `${PRODUCTION_ORIGIN}/`,
          robots: 'noindex, nofollow',
        };
      }
    }

    document.title = seoConfig.title;
    updateMetaTag('name', 'description', seoConfig.description);
    updateMetaTag('name', 'robots', seoConfig.robots);
    updateLinkTag('canonical', seoConfig.canonical);

    updateMetaTag('property', 'og:title', seoConfig.title);
    updateMetaTag('property', 'og:description', seoConfig.description);
    updateMetaTag('property', 'og:url', seoConfig.canonical);
    updateMetaTag(
      'property',
      'og:type',
      normalizedPath.startsWith('/insights/') && normalizedPath !== '/insights'
        ? 'article'
        : 'website'
    );

    updateMetaTag('name', 'twitter:title', seoConfig.title);
    updateMetaTag('name', 'twitter:description', seoConfig.description);
    updateMetaTag('name', 'twitter:url', seoConfig.canonical);
  }, [pathname]);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
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
