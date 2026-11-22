import { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import BrandMark from './BrandMark';
import ContactActionButtons from './ContactActionButtons';
import SocialLinks from './SocialLinks';

export default function MobileDrawer({ isOpen, onClose, navItems, toggleButtonRef }) {
  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        toggleButtonRef?.current?.focus();
        return;
      }

      if (event.key === 'Tab' && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, toggleButtonRef]);

  function handleCloseClick() {
    onClose();
    toggleButtonRef?.current?.focus();
  }

  return (
    <div
      className={`mobile-drawer-layer ${isOpen ? 'is-open' : ''}`}
      aria-hidden={!isOpen}
    >
      <div
        className="mobile-drawer-backdrop"
        onClick={handleCloseClick}
        aria-hidden="true"
      />

      <aside
        ref={drawerRef}
        id="syncra-mobile-drawer"
        className="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="mobile-drawer__top">
          <BrandMark onClick={onClose} />
          <button
            ref={closeBtnRef}
            type="button"
            className="mobile-drawer__close"
            onClick={handleCloseClick}
            aria-label="Close navigation menu"
            tabIndex={isOpen ? 0 : -1}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>

        <nav className="mobile-drawer__nav" aria-label="Primary mobile navigation">
          <ul>
            {navItems.map((item, index) => (
              <li
                key={item.to}
                style={{ '--drawer-delay': `${0.08 + index * 0.045}s` }}
              >
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  tabIndex={isOpen ? 0 : -1}
                  className={({ isActive }) =>
                    `mobile-drawer__link ${isActive ? 'is-active' : ''}`
                  }
                >
                  <span className="mobile-drawer__index" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mobile-drawer__cta-wrap">
          <Link
            to="/contact"
            className="mobile-drawer__cta"
            onClick={onClose}
            tabIndex={isOpen ? 0 : -1}
          >
            <span>Book a Free Call</span>
            <span className="mobile-drawer__cta-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>

        <div className="mobile-drawer__footer">
          <span>Your one-stop solution for digital excellence.</span>
          <div className="mobile-drawer__channels">
            <ContactActionButtons size="sm" className="mobile-drawer__contacts" />
            <SocialLinks className="mobile-drawer__socials" />
          </div>
        </div>
      </aside>
    </div>
  );
}
