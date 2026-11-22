import { ContactIcon } from '../Icons';
import ContactForm from '../../ContactForm';
import SocialLinks from '../SocialLinks';
import { OFFICIAL_CONTACTS } from '../../data/officialContacts';

export default function ContactSection() {
  return (
    <section className="home-band home-contact contact-section" id="contact">
      <div className="contact-orb contact-orb-one" aria-hidden="true" />
      <div className="contact-orb contact-orb-two" aria-hidden="true" />

      <div className="home-container">
        <div className="home-contact__layout">
          <div className="home-contact__info reveal-left">
            <div className="pill-eyebrow">
              <span className="pill-eyebrow__dot" aria-hidden="true" />
              <span>START A CONVERSATION</span>
            </div>

            <h2 className="home-contact__title">
              Let&apos;s build something <span>remarkable.</span>
            </h2>

            <p className="home-contact__lead">
              Have a business idea, website project, brand refresh, or digital
              growth goal in mind? Reach out directly or send us your project
              details and our team will respond promptly.
            </p>

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
          </div>

          <div className="home-contact__form-panel reveal-right">
            <div className="home-contact__form-header">
              <span>PROJECT ENQUIRY</span>
              <h3>Tell us about your project</h3>
              <p>Fill out the form below and we&apos;ll get back to you.</p>
            </div>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
