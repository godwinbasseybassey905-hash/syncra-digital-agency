import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export const SOCIAL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourbrand' },
  { id: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourbrand' },
  { id: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@yourbrand' },
  { id: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/yourbrand' },
  { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourbrand' },
  { id: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourbrand' },
];

export const DEFAULT_SOCIAL_SETTINGS = {
  instagram: { enabled: false, url: '' },
  facebook: { enabled: false, url: '' },
  tiktok: { enabled: false, url: '' },
  twitter: { enabled: false, url: '' },
  linkedin: { enabled: false, url: '' },
  youtube: { enabled: false, url: '' },
};

export function useSocialLinks() {
  const [socialSettings, setSocialSettings] = useState(DEFAULT_SOCIAL_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSocialLinks() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('content')
          .eq('id', 'social_media')
          .maybeSingle();

        if (!mounted) return;

        if (!error && data?.content) {
          setSocialSettings({
            ...DEFAULT_SOCIAL_SETTINGS,
            ...data.content,
          });
        }
      } catch (err) {
        console.error('Could not load social settings:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSocialLinks();

    return () => {
      mounted = false;
    };
  }, []);

  const enabledLinks = SOCIAL_PLATFORMS.map((platform) => {
    const entry = socialSettings[platform.id] || {};
    const url = typeof entry.url === 'string' ? entry.url.trim() : '';
    const enabled = Boolean(entry.enabled);
    return {
      platform: platform.id,
      label: platform.label,
      url,
      enabled: enabled && /^https?:\/\//i.test(url),
    };
  }).filter((item) => item.enabled);

  return {
    socialSettings,
    enabledLinks,
    loading,
  };
}
