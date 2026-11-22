import { Link } from 'react-router-dom';

export default function BrandMark({ className = '', onClick }) {
  return (
    <Link
      to="/"
      className={`brand ${className}`.trim()}
      aria-label="Syncra Digital Agency home"
      onClick={onClick}
    >
      <span className="brand-icon" aria-hidden="true">
        S
      </span>
      <span className="brand-wordmark">
        SYNC<span className="blue">RA</span>
        <small>DIGITAL AGENCY</small>
      </span>
    </Link>
  );
}
