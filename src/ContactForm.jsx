import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { DEFAULT_SERVICES } from './data/homepageDefaults';

function ContactForm() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', message: '', website: '' });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    let mounted = true;
    async function loadServices() {
      const { data, error } = await supabase
        .from('services')
        .select('title')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (!error && mounted) setServices(data || []);
    }
    loadServices();
    return () => {
      mounted = false;
    };
  }, []);

  const serviceOptions = services.length > 0 ? services : DEFAULT_SERVICES;

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    if (feedback.message) setFeedback({ type: '', message: '' });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.website.trim()) {
      setFeedback({ type: 'success', message: 'Your enquiry has been received successfully.' });
      setForm({ name: '', email: '', phone: '', service: '', message: '', website: '' });
      return;
    }

    setLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const { error } = await supabase.from('enquiries').insert([
        {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          service: form.service,
          message: form.message.trim(),
          status: 'new',
        },
      ]);
      if (error) throw error;
      setFeedback({ type: 'success', message: 'Your enquiry has been received successfully.' });
      setForm({ name: '', email: '', phone: '', service: '', message: '', website: '' });
    } catch (error) {
      console.error('Enquiry submission failed:', error.message);
      setFeedback({
        type: 'error',
        message:
          'We couldn’t send your message just now. Please try again, or connect with us directly using our contact buttons below.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="syncra-contact-form" noValidate={false}>
      {feedback.type === 'success' && (
        <div className="contact-feedback contact-feedback-success" role="status" aria-live="polite">
          <span className="contact-feedback-icon" aria-hidden="true">✓</span>
          <div>
            <strong>Thank you for reaching out to Syncra!</strong>
            <p>
              Your enquiry has been received successfully. Our team will review your request and a
              member of our team will contact you shortly. We appreciate your interest in working
              with us.
            </p>
            <small>We look forward to speaking with you.</small>
          </div>
        </div>
      )}

      {feedback.type === 'error' && (
        <div className="contact-feedback contact-feedback-error" role="alert">
          <strong>Message not sent</strong>
          <p>{feedback.message}</p>
        </div>
      )}

      <div className="contact-honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={handleChange}
        />
      </div>

      <div className="contact-form-row">
        <div className="contact-field-group">
          <label htmlFor="contact-name">Full name *</label>
          <input
            id="contact-name"
            type="text"
            name="name"
            placeholder="Your full name"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="contact-field-group">
          <label htmlFor="contact-email">Email address *</label>
          <input
            id="contact-email"
            type="email"
            name="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="contact-form-row">
        <div className="contact-field-group">
          <label htmlFor="contact-phone">Phone / WhatsApp number</label>
          <input
            id="contact-phone"
            type="tel"
            name="phone"
            placeholder="e.g. +234 800 000 0000"
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        <div className="contact-field-group">
          <label htmlFor="contact-service">Service needed *</label>
          <select
            id="contact-service"
            name="service"
            value={form.service}
            onChange={handleChange}
            required
          >
            <option value="">Select a service</option>
            {serviceOptions.map((service) => (
              <option key={service.title} value={service.title}>
                {service.title}
              </option>
            ))}
            <option value="Other">Other / Not sure yet</option>
          </select>
        </div>
      </div>

      <div className="contact-field-group">
        <label htmlFor="contact-message">Project details *</label>
        <textarea
          id="contact-message"
          name="message"
          placeholder="Tell us about your project, timeline, and goals..."
          value={form.message}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" className="primary-button contact-submit-button" disabled={loading}>
        {loading ? 'Sending your enquiry...' : 'Send Enquiry ↗'}
      </button>
    </form>
  );
}

export default ContactForm;
