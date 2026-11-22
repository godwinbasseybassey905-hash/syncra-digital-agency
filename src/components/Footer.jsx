import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';
import ContactActionButtons from './ContactActionButtons';
import SocialLinks from './SocialLinks';
import { PRIMARY_NAV_ITEMS } from './navItems';

const FOOTER_SERVICES = [
  'Website Design & Development',
  'SEO',
  'Video Editing',
  'Graphic Design',
  'Content Writing',
  'Social Media Strategy',
  'Digital Marketing',
  'Branding',
  'AI Automation',
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <div className="site-footer__brand-col">
            <BrandMark className="footer-brand" />
            <p className="site-footer__desc">
              Your one-stop solution for digital excellence — crafting stunning
              websites, captivating visuals, engaging videos, and strategic
              digital growth from Lagos State, Nigeria.
            </p>
            <div className="site-footer__location">
              <span className="site-footer__dot" aria-hidden="true" />
              <span>Lagos State, Nigeria</span>
            </div>
            <SocialLinks className="footer-social-wrap" />
          </div>

          <div className="site-footer__col">
            <h3 className="site-footer__heading">Navigation</h3>
            <ul className="site-footer__list">
              {PRIMARY_NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer__col">
            <h3 className="site-footer__heading">Services</h3>
            <ul className="site-footer__list site-footer__list--services">
              {FOOTER_SERVICES.map((service) => (
                <li key={service}>
                  <Link to="/#services">{service}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer__col">
            <h3 className="site-footer__heading">Get in Touch</h3>
            <p className="site-footer__contact-note">
              Ready to discuss your next website, brand identity, or digital
              campaign?
            </p>
            <ContactActionButtons className="footer-contact-actions" />
            <Link to="/contact" className="site-footer__cta">
              Start a Project <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© {year} Syncra Digital Agency. All rights reserved.</p>
          <span>Creativity · Technology · Strategy · Growth</span>
        </div>
      </div>
    </footer>
  );
}
