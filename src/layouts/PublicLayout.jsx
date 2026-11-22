import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingUtilities from '../components/FloatingUtilities';

export default function PublicLayout() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <div className="site-shell">
        <div className="ambient-background" aria-hidden="true">
          <div className="ambient-glow ambient-glow-one" />
          <div className="ambient-glow ambient-glow-two" />
          <div className="ambient-grid" />
        </div>

        <Header />

        <main className="site-main" id="main-content">
          <Outlet />
        </main>

        <Footer />
        <FloatingUtilities />
      </div>
    </>
  );
}
