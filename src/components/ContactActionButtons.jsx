import { ContactIcon } from './Icons';
import { OFFICIAL_CONTACTS } from '../data/officialContacts';

export default function ContactActionButtons({
  className = '',
  includeSecondary = false,
  size = 'md',
}) {
  return (
    <div
      className={`contact-icon-group contact-icon-group--${size} ${className}`.trim()}
      role="group"
      aria-label="Direct contact channels"
    >
      <a
        href={OFFICIAL_CONTACTS.email}
        className="contact-icon-btn contact-icon-btn--email"
        aria-label="Send email to Syncra Digital Agency"
        title="Email Syncra"
      >
        <ContactIcon type="email" />
      </a>

      <a
        href={OFFICIAL_CONTACTS.whatsappPrimary}
        target="_blank"
        rel="noopener noreferrer"
        className="contact-icon-btn contact-icon-btn--whatsapp"
        aria-label="Chat with Syncra on WhatsApp"
        title="WhatsApp Syncra"
      >
        <ContactIcon type="whatsapp" />
      </a>

      <a
        href={OFFICIAL_CONTACTS.phonePrimary}
        className="contact-icon-btn contact-icon-btn--phone"
        aria-label="Call Syncra Digital Agency"
        title="Call Syncra"
      >
        <ContactIcon type="phone" />
      </a>

      {includeSecondary && (
        <>
          <a
            href={OFFICIAL_CONTACTS.whatsappSecondary}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-icon-btn contact-icon-btn--whatsapp"
            aria-label="Chat with Syncra on Secondary WhatsApp"
            title="Secondary WhatsApp"
          >
            <ContactIcon type="whatsapp" />
          </a>

          <a
            href={OFFICIAL_CONTACTS.phoneSecondary}
            className="contact-icon-btn contact-icon-btn--phone"
            aria-label="Call Syncra on Secondary Line"
            title="Secondary Phone"
          >
            <ContactIcon type="phone" />
          </a>
        </>
      )}
    </div>
  );
}
