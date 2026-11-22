import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import BrandMark from './BrandMark';
import HeaderClock from './HeaderClock';
import MobileDrawer from './MobileDrawer';
import { PRIMARY_NAV_ITEMS } from './navItems';

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const toggleButtonRef = useRef(null);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 18);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 1120 && drawerOpen) {
        setDrawerOpen(false);
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawerOpen]);

  return (
    <>
      <header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="site-header__inner">
          <BrandMark />

          <nav className="site-header__nav" aria-label="Primary navigation">
            {PRIMARY_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `site-header__link ${isActive ? 'is-active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="site-header__actions">
            <HeaderClock />

            <Link to="/contact" className="site-header__cta">
              <span>Book a Free Call</span>
              <span className="site-header__cta-arrow" aria-hidden="true">
                →
              </span>
            </Link>

            <button
              ref={toggleButtonRef}
              type="button"
              className={`site-menu-toggle ${drawerOpen ? 'is-open' : ''}`}
              onClick={() => setDrawerOpen((open) => !open)}
              aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={drawerOpen}
              aria-controls="syncra-mobile-drawer"
            >
              <span className="site-menu-toggle__bar" aria-hidden="true" />
              <span className="site-menu-toggle__bar" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        navItems={PRIMARY_NAV_ITEMS}
        toggleButtonRef={toggleButtonRef}
      />
    </>
  );
}
