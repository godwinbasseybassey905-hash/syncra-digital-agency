import { useEffect, useState } from 'react';
import { ArrowUpIcon, WhatsAppIcon } from './Icons';

export default function FloatingUtilities() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setShowTop(window.scrollY > 360);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function scrollToTop() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
  }

  return (
    <div className="floating-utilities" aria-label="Quick actions">
      <button
        type="button"
        className={`floating-scroll-top ${showTop ? 'is-visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll back to top"
        title="Back to top"
        tabIndex={showTop ? 0 : -1}
      >
        <ArrowUpIcon />
      </button>

      <a
        className="floating-whatsapp-btn"
        href="https://wa.me/2348144624133?text=Hello%20Syncra%20Digital%20Agency"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Syncra on WhatsApp"
        title="Chat with Syncra on WhatsApp"
      >
        <WhatsAppIcon />
        <span className="floating-whatsapp-btn__tooltip">Chat with us</span>
      </a>
    </div>
  );
}
