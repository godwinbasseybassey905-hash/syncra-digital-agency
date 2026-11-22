import { WORK_PROCESS_STEPS } from '../../data/homepageDefaults';

export default function WorkProcessSection() {
  return (
    <section className="home-band home-process" id="process">
      <div className="home-container">
        <div className="home-section-header reveal">
          <div>
            <div className="pill-eyebrow">
              <span className="pill-eyebrow__dot" aria-hidden="true" />
              <span>HOW WE WORK</span>
            </div>
            <h2 className="home-section-title">
              A clear, structured process from <span>idea to launch.</span>
            </h2>
          </div>

          <p className="home-section-subtitle">
            Great digital work is never guesswork. Our four-stage approach keeps
            communication transparent and every deliverable aligned with your
            business goals.
          </p>
        </div>

        <div className="home-process__timeline">
          <div className="home-process__connector" aria-hidden="true" />

          {WORK_PROCESS_STEPS.map((step, index) => (
            <article
              className="home-process-card reveal"
              key={step.number}
              style={{ '--reveal-delay': `${index * 90}ms` }}
            >
              <div className="home-process-card__head">
                <span className="home-process-card__badge">{step.number}</span>
                <span className="home-process-card__step-label">
                  STEP {step.number}
                </span>
              </div>

              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>

        <div className="home-process__cta reveal">
          <a href="#contact" className="btn-ghost-pill">
            <span>Start with Step 01: Book a Consultation</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
