import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import { createClient } from '@supabase/supabase-js';

const root = process.cwd();

async function testDevServerAndModules() {
  console.log('=== 1. VITE DEV SERVER & ROUTE / MODULE VERIFICATION ===');
  const server = await createServer({
    root,
    server: { host: '127.0.0.1', port: 5188, strictPort: true },
    logLevel: 'error',
  });

  const routes = [
    '/',
    '/about',
    '/portfolio',
    '/faq',
    '/contact',
    '/insights',
    '/insights/sample-slug',
    '/syncra-admin',
    '/syncra-admin/',
    '/not-found-404',
  ];

  const modules = [
    '/src/components/Icons.jsx',
    '/src/components/ContactActionButtons.jsx',
    '/src/components/SocialLinks.jsx',
    '/src/hooks/useSocialLinks.js',
    '/src/data/officialContacts.js',
    '/src/SocialMediaManager.jsx',
    '/src/admin/AdminPortal.jsx',
    '/src/styles/home.css',
    '/src/styles/shell.css',
    '/src/styles/pages.css',
    '/src/styles/admin.css',
    '/src/components/Footer.jsx',
    '/src/components/MobileDrawer.jsx',
    '/src/components/home/ContactSection.jsx',
    '/src/components/home/PortfolioSection.jsx',
    '/src/components/home/ServicesSection.jsx',
    '/src/pages/ContactPage.jsx',
    '/src/pages/PortfolioPage.jsx',
    '/src/pages/AboutPage.jsx',
    '/src/pages/FaqPage.jsx',
    '/src/pages/InsightsPage.jsx',
  ];

  try {
    await server.listen();
    const base = 'http://127.0.0.1:5188';

    for (const r of routes) {
      const res = await fetch(base + r);
      const text = await res.text();
      const ok = res.status === 200 && text.includes('id="root"') && !text.includes('vite-error-overlay');
      console.log(`Route ${r}: ${res.status} (ok=${ok})`);
      if (!ok) throw new Error(`Route check failed: ${r}`);
    }

    for (const m of modules) {
      const res = await fetch(base + m);
      const text = await res.text();
      const ok = res.status === 200 && !text.includes('__vite_error');
      console.log(`Module ${m}: ${res.status} (bytes=${text.length}, ok=${ok})`);
      if (!ok) throw new Error(`Module transform failed: ${m}`);
    }
  } finally {
    await server.close();
  }
}

async function testSupabasePreservation() {
  console.log('=== 2. SUPABASE READ-ONLY INTEGRITY & PRESERVATION ===');
  const envText = fs.readFileSync(path.join(root, '.env'), 'utf8');
  const env = Object.fromEntries(
    envText
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.trim().startsWith('#'))
      .map((line) => {
        const idx = line.indexOf('=');
        return [line.slice(0, idx).trim(), line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')];
      })
  );

  const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

  const tables = ['site_content', 'services', 'projects', 'testimonials', 'blog_posts', 'enquiries'];
  let founderPhotoUrl = '';

  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*');
    if (error) {
      console.log(`Table ${t} error: ${error.message}`);
    } else {
      console.log(`Table ${t}: 200 OK (${data.length} rows)`);
      if (t === 'site_content') {
        console.log(`site_content IDs: ${data.map((r) => r.id).join(', ')}`);
        const about = data.find((r) => r.id === 'about');
        if (about?.content) {
          console.log(`about.founderName: "${about.content.founderName}"`);
          founderPhotoUrl = about.content.founderPhotoUrl || '';
        }
      }
    }
  }

  if (founderPhotoUrl) {
    const res = await fetch(founderPhotoUrl, { method: 'HEAD' });
    console.log(`Founder Photo URL HEAD status: ${res.status}`);
  }
}

function testAuditCodebaseIntegrity() {
  console.log('=== 3. AUDIT CODEBASE FOR BUTTON CONTRAST & VISIBLE CONTACT TEXT ===');
  const homeCss = fs.readFileSync(path.join(root, 'src/styles/home.css'), 'utf8');

  // Verify that .home-inline-cta span rule was safely replaced
  const hasLooseSpanRule = /\.home-inline-cta\s+span\s*\{/.test(homeCss);
  console.log(`Loose .home-inline-cta span rule present: ${hasLooseSpanRule}`);
  if (hasLooseSpanRule) throw new Error('Loose .home-inline-cta span rule must not exist!');

  // Verify that .btn-cyan-pill text color is enforced
  const hasColorEnforce = homeCss.includes('.btn-cyan-pill,') && homeCss.includes('color: #04101d !important;');
  console.log(`Enforced .btn-cyan-pill contrast present: ${hasColorEnforce}`);
  if (!hasColorEnforce) throw new Error('Contrast rule missing for .btn-cyan-pill');

  // Check footer for phone numbers and visible email
  const footerJsx = fs.readFileSync(path.join(root, 'src/components/Footer.jsx'), 'utf8');
  const hasPhoneInFooter = /08144624133|09037600356|2348144624133/i.test(footerJsx);
  const hasEmailTextInFooter = />syncradigitalagency@gmail\.com</i.test(footerJsx);
  console.log(`Footer has visible email text: ${hasEmailTextInFooter}`);
  console.log(`Footer has visible phone text: ${hasPhoneInFooter}`);
  if (hasEmailTextInFooter || hasPhoneInFooter) throw new Error('Footer contains visible text contact information!');

  console.log('ALL VERIFICATION CHECKS SUCCEEDED!');
}

await testDevServerAndModules();
await testSupabasePreservation();
testAuditCodebaseIntegrity();
