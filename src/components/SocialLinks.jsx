import { useSocialLinks } from '../hooks/useSocialLinks';
import { SocialIcon } from './Icons';

export default function SocialLinks({ className = '', ariaLabel = 'Social media links' }) {
  const { enabledLinks, loading } = useSocialLinks();

  if (loading || enabledLinks.length === 0) {
    return null;
  }

  return (
    <div
      className={`social-links-bar ${className}`.trim()}
      role="group"
      aria-label={ariaLabel}
    >
      {enabledLinks.map(({ platform, label, url }) => (
        <a
          key={platform}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`social-icon-btn social-icon-btn--${platform}`}
          aria-label={`Visit Syncra on ${label} (opens in a new tab)`}
          title={`Syncra on ${label}`}
        >
          <SocialIcon platform={platform} />
        </a>
      ))}
    </div>
  );
}
