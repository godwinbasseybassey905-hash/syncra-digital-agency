import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ContactIcon } from '../components/Icons';
import ContactForm from '../ContactForm';
import SocialLinks from '../components/SocialLinks';
import { OFFICIAL_CONTACTS } from '../data/officialContacts';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function ContactPage() {
  const pageRef = useRef(null);
  useScrollReveal(pageRef, []);

  return (
    <div className="subpage-shell" ref={pageRef}>
      <section className="subpage-hero">
        <div className="subpage-container">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Contact</span>
          </nav>

          <div className="subpage-hero__grid">
            <div>
              <div className="pill-eyebrow">
                <span className="pill-eyebrow__dot" aria-hidden="true" />
                <span>START A CONVERSATION</span>
              </div>

              <h1>
                Let&apos;s discuss your <span>next digital project.</span>
              </h1>

              <p className="subpage-hero__lead">
                Whether you need a new website, brand identity, graphics, video
                editing, SEO, social media management, or AI automation—share
                your goals below and let&apos;s explore how Syncra can help.
              </p>
            </div>

            <div className="subpage-hero__aside">
              <div className="subpage-meta-card">
                <span>LOCATION &amp; AVAILABILITY</span>
                <strong>Lagos State, Nigeria</strong>
                <p>
                  Working directly with clients across Nigeria and remotely
                  worldwide via email, WhatsApp, and online consultations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="subpage-band contact-section">
        <div className="subpage-container">
          <div className="contact-page-grid">
            <div className="reveal-left">
              <div className="home-contact__channels">
                <div className="home-contact-card">
                  <span className="home-contact-card__num">01 / EMAIL</span>
                  <div>
                    <strong>Direct Email</strong>
                    <p>Project consultations &amp; official briefs</p>
                  </div>
                  <a
                    href={OFFICIAL_CONTACTS.email}
                    className="home-contact-card__icon-btn"
                    aria-label="Send email to Syncra Digital Agency"
                    title="Email Syncra"
                  >
                    <ContactIcon type="email" />
                  </a>
                </div>

                <div className="home-contact-card">
                  <span className="home-contact-card__num">02 / PRIMARY LINE</span>
                  <div>
                    <strong>Primary Direct Channel</strong>
                    <p>Instant WhatsApp chat &amp; telephone line</p>
                  </div>
                  <div className="home-contact-card__actions">
                    <a
                      href={OFFICIAL_CONTACTS.whatsappPrimary}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="home-contact-card__icon-btn is-whatsapp"
                      aria-label="Chat with Syncra on WhatsApp"
                      title="WhatsApp"
                    >
                      <ContactIcon type="whatsapp" />
                    </a>
                    <a
                      href={OFFICIAL_CONTACTS.phonePrimary}
                      className="home-contact-card__icon-btn"
                      aria-label="Call Syncra on primary line"
                      title="Call"
                    >
                      <ContactIcon type="phone" />
                    </a>
                  </div>
                </div>

                <div className="home-contact-card">
                  <span className="home-contact-card__num">03 / SECONDARY LINE</span>
                  <div>
                    <strong>Secondary Support Line</strong>
                    <p>Alternative WhatsApp &amp; telephone line</p>
                  </div>
                  <div className="home-contact-card__actions">
                    <a
                      href={OFFICIAL_CONTACTS.whatsappSecondary}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="home-contact-card__icon-btn is-whatsapp"
                      aria-label="Chat with Syncra on secondary WhatsApp"
                      title="Secondary WhatsApp"
                    >
                      <ContactIcon type="whatsapp" />
                    </a>
                    <a
                      href={OFFICIAL_CONTACTS.phoneSecondary}
                      className="home-contact-card__icon-btn"
                      aria-label="Call Syncra on secondary line"
                      title="Secondary Call"
                    >
                      <ContactIcon type="phone" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="home-contact__social-wrap">
                <span className="home-contact__social-label">Follow Syncra</span>
                <SocialLinks />
              </div>

              <div className="contact-expectations-card">
                <span>WHAT HAPPENS NEXT</span>
                <h3>After you send an enquiry</h3>
                <ol className="contact-steps-list">
                  <li>
                    <strong>1</strong>
                    <span>
                      We review your project summary, selected service, and
                      preferred contact details.
                    </span>
                  </li>
                  <li>
                    <strong>2</strong>
                    <span>
                      A member of our team reaches out to clarify your goals,
                      scope, and any questions you have.
                    </span>
                  </li>
                  <li>
                    <strong>3</strong>
                    <span>
                      We share a clear proposal, timeline, and recommended next
                      steps tailored to your business.
                    </span>
                  </li>
                </ol>
              </div>
            </div>

            <div className="reveal-right">
              <div className="home-contact__form-panel">
                <div className="home-contact__form-header">
                  <span>ONLINE INQUIRY</span>
                  <h3>Send a project brief</h3>
                  <p>
                    Share your requirements and we&apos;ll be in touch to discuss
                    your project details.
                  </p>
                </div>
                <ContactForm />
              </div>
            </div>
          </div>

          <div className="home-inline-cta reveal">
            <div>
              <span className="home-inline-cta__eyebrow">LOOKING FOR QUICK ANSWERS?</span>
              <p>
                Explore our FAQ page to learn how we handle web design, project
                scope, collaboration, and post-launch support.
              </p>
            </div>
            <Link to="/faq" className="btn-ghost-pill">
              <span>Read FAQ</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
