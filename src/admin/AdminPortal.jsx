import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import AdminLogin from '../AdminLogin';
import HomepageManager from '../HomepageManager';
import AboutManager from '../AboutManager';
import ValuesManager from '../ValuesManager';
import PortfolioManager from '../PortfolioManager';
import ProjectsManager from '../ProjectsManager';
import ServicesManager from '../ServicesManager';
import TestimonialsManager from '../TestimonialsManager';
import BlogManager from '../BlogManager';
import EnquiriesManager from '../EnquiriesManager';
import SocialMediaManager from '../SocialMediaManager';
import '../styles/admin.css';

const adminSections = [
  { id: 'overview', label: 'Overview', group: 'WORKSPACE', icon: 'grid' },
  { id: 'homepage', label: 'Homepage editor', group: 'WEBSITE', icon: 'sparkles' },
  { id: 'about', label: 'About us & founder', group: 'WEBSITE', icon: 'quote' },
  { id: 'values', label: 'Our Values', group: 'WEBSITE', icon: 'sparkles' },
  { id: 'portfolio', label: 'Portfolio section', group: 'WEBSITE', icon: 'layers' },
  { id: 'projects', label: 'Portfolio projects', group: 'WEBSITE', icon: 'layers' },
  { id: 'services', label: 'Services', group: 'WEBSITE', icon: 'sparkles' },
  { id: 'testimonials', label: 'Testimonials', group: 'WEBSITE', icon: 'quote' },
  { id: 'social', label: 'Social media', group: 'WEBSITE', icon: 'share' },
  { id: 'blog', label: 'Blog & insights', group: 'CONTENT', icon: 'book' },
  { id: 'enquiries', label: 'Enquiries', group: 'COMMUNICATION', icon: 'inbox' },
];

const quickActions = [
  { label: '+ Add Project', section: 'projects' },
  { label: '+ Add Service', section: 'services' },
  { label: '+ Add Blog Post', section: 'blog' },
  { label: 'View Enquiries', section: 'enquiries' },
  { label: 'Manage Testimonials', section: 'testimonials' },
  { label: 'Social Media', section: 'social' },
  { label: 'Edit Homepage', section: 'homepage' },
];

function AdminIcon({ name }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  const paths = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" />
        <path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z" />
      </>
    ),
    quote: (
      <>
        <path d="M4 6h7v7H5v5H3v-7c0-3 1-5 4-7M15 6h7v7h-6v5h-2v-7c0-3 1-5 4-7" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" />
        <path d="M4 17a2.5 2.5 0 0 1 2.5-2.5H20M8 7h8M8 10h7" />
      </>
    ),
    inbox: (
      <>
        <path d="M4 4h16l2 11v5H2v-5L4 4Z" />
        <path d="M2 15h6l2 3h4l2-3h6" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
      </>
    ),
    external: (
      <>
        <path d="M14 3h7v7M21 3l-9 9" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </>
    ),
    share: (
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
      {paths[name] || paths.grid}
    </svg>
  );
}

function AdminDashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    projectsTotal: 0,
    projectsPublished: 0,
    servicesTotal: 0,
    servicesActive: 0,
    testimonialsTotal: 0,
    testimonialsPublished: 0,
    postsTotal: 0,
    postsPublished: 0,
    enquiriesTotal: 0,
    enquiriesNew: 0,
  });
  const [recent, setRecent] = useState({
    enquiries: [],
    projects: [],
    posts: [],
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [overviewError, setOverviewError] = useState('');

  useEffect(() => {
    if (!sidebarOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event) {
      if (event.key === 'Escape') setSidebarOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    let active = true;

    async function loadDashboardData() {
      const [
        projectsRes,
        servicesRes,
        testimonialsRes,
        postsRes,
        enquiriesRes,
      ] = await Promise.all([
        supabase
          .from('projects')
          .select('id, title, category, published, created_at')
          .order('created_at', { ascending: false }),
        supabase.from('services').select('id, is_active'),
        supabase.from('testimonials').select('id, published'),
        supabase
          .from('blog_posts')
          .select('id, title, published, published_at, created_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('enquiries')
          .select('id, name, service, status, created_at')
          .order('created_at', { ascending: false }),
      ]);

      if (!active) return;

      const failedTables = [];
      if (projectsRes.error) failedTables.push('projects');
      if (servicesRes.error) failedTables.push('services');
      if (testimonialsRes.error) failedTables.push('testimonials');
      if (postsRes.error) failedTables.push('blog_posts');
      if (enquiriesRes.error) failedTables.push('enquiries');

      setOverviewError(
        failedTables.length > 0
          ? `Some overview metrics could not be loaded (${failedTables.join(', ')}). Other sections remain available.`
          : ''
      );

      const projectsData = projectsRes.data || [];
      const servicesData = servicesRes.data || [];
      const testimonialsData = testimonialsRes.data || [];
      const postsData = postsRes.data || [];
      const enquiriesData = enquiriesRes.data || [];

      setStats({
        projectsTotal: projectsData.length,
        projectsPublished: projectsData.filter((item) => item.published).length,
        servicesTotal: servicesData.length,
        servicesActive: servicesData.filter((item) => item.is_active).length,
        testimonialsTotal: testimonialsData.length,
        testimonialsPublished: testimonialsData.filter((item) => item.published).length,
        postsTotal: postsData.length,
        postsPublished: postsData.filter((item) => item.published).length,
        enquiriesTotal: enquiriesData.length,
        enquiriesNew: enquiriesData.filter((item) => (item.status || 'new') === 'new').length,
      });

      setRecent({
        enquiries: enquiriesData.slice(0, 3),
        projects: projectsData.slice(0, 3),
        posts: postsData.slice(0, 3),
      });

      setStatsLoading(false);
    }

    loadDashboardData();
    return () => {
      active = false;
    };
  }, [activeSection]);

  const activeItem =
    adminSections.find((item) => item.id === activeSection) || adminSections[0];

  const statCards = [
    {
      label: 'Portfolio projects',
      value: stats.projectsTotal,
      sub: `${stats.projectsPublished} published`,
      icon: 'layers',
      section: 'projects',
      note: 'Manage portfolio work',
    },
    {
      label: 'Agency services',
      value: stats.servicesTotal,
      sub: `${stats.servicesActive} active publicly`,
      icon: 'sparkles',
      section: 'services',
      note: 'Edit service catalogue',
    },
    {
      label: 'Testimonials',
      value: stats.testimonialsTotal,
      sub: `${stats.testimonialsPublished} published`,
      icon: 'quote',
      section: 'testimonials',
      note: 'Client feedback',
    },
    {
      label: 'Blog & insights',
      value: stats.postsTotal,
      sub: `${stats.postsPublished} published`,
      icon: 'book',
      section: 'blog',
      note: 'Articles and drafts',
    },
  ];

  function navigateSection(section) {
    setActiveSection(section);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <main className="syncra-admin-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}
        aria-label="Admin navigation"
      >
        <Link className="admin-brand" to="/" aria-label="Syncra Digital Agency home">
          <span className="admin-brand-mark">S</span>
          <span>
            SYNC<span>RA</span>
            <small>DIGITAL AGENCY</small>
          </span>
        </Link>

        <div className="admin-workspace-label">MANAGEMENT CONSOLE</div>

        {['WORKSPACE', 'WEBSITE', 'CONTENT', 'COMMUNICATION'].map((group) => (
          <div className="admin-nav-group" key={group}>
            <p>{group}</p>
            {adminSections
              .filter((item) => item.group === group)
              .map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`admin-nav-link ${activeSection === item.id ? 'active' : ''}`}
                  aria-current={activeSection === item.id ? 'page' : undefined}
                  onClick={() => navigateSection(item.id)}
                >
                  <AdminIcon name={item.icon} />
                  <span>{item.label}</span>
                  {item.id === 'enquiries' && stats.enquiriesNew > 0 && (
                    <b aria-label={`${stats.enquiriesNew} new enquiries`}>
                      {stats.enquiriesNew}
                    </b>
                  )}
                </button>
              ))}
          </div>
        ))}

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-status">
            <span /> Connected to Syncra CMS
          </div>
          <button
            type="button"
            className="admin-sidebar-logout"
            onClick={onLogout}
          >
            <AdminIcon name="logout" />
            <span>Sign out</span>
          </button>
          <div className="admin-sidebar-version">
            SYNCra CONSOLE <span>·</span> PRIVATE
          </div>
        </div>
      </aside>

      <div className="admin-main-area">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-toggle"
            onClick={() => setSidebarOpen((value) => !value)}
            aria-label="Toggle admin navigation"
            aria-expanded={sidebarOpen}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className="admin-breadcrumb" aria-label="Admin breadcrumb">
            <button
              type="button"
              className="admin-breadcrumb-btn"
              onClick={() => navigateSection('overview')}
            >
              Workspace
            </button>
            <b aria-hidden="true">/</b>
            <strong>{activeItem.label}</strong>
          </nav>

          <div className="admin-topbar-right">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="admin-view-site"
            >
              <AdminIcon name="external" /> <span>View website</span>
            </a>
            <div className="admin-user-chip">
              <span className="admin-avatar" aria-hidden="true">
                {(user?.email || 'S').slice(0, 1).toUpperCase()}
              </span>
              <span>
                <strong>Administrator</strong>
                <small>{user?.email}</small>
              </span>
            </div>
          </div>
        </header>

        <section className="admin-page-content" key={activeSection}>
          <div className="admin-page-heading">
            <div>
              <span className="admin-eyebrow">SYNCRA CONTROL CENTRE</span>
              <h1>
                {activeSection === 'overview'
                  ? 'Agency Overview'
                  : activeItem.label}
              </h1>
              <p>
                {activeSection === 'overview'
                  ? 'Live overview of your website content, published work, and incoming client enquiries.'
                  : `Manage ${activeItem.label.toLowerCase()} stored in your Syncra database.`}
              </p>
            </div>
            <div className="admin-heading-date">
              <span className="admin-live-dot" /> LIVE WORKSPACE
            </div>
          </div>

          {activeSection === 'overview' && (
            <>
              {overviewError && (
                <p className="admin-overview-error" role="alert">
                  {overviewError}
                </p>
              )}

              <div className="admin-welcome-panel">
                <div>
                  <span>YOUR DIGITAL WORKSPACE</span>
                  <h2>
                    Build. Manage. <em>Grow.</em>
                  </h2>
                  <p>
                    Update public content, publish portfolio work and articles,
                    and respond to client enquiries from one console.
                  </p>
                </div>
                <div className="admin-welcome-orbit" aria-hidden="true">
                  <span>S</span>
                </div>
              </div>

              <div className="admin-quick-actions-bar">
                <span className="admin-quick-actions-label">QUICK ACTIONS</span>
                <div className="admin-quick-actions-list">
                  {quickActions.map((action) => (
                    <button
                      type="button"
                      key={action.label}
                      className="admin-quick-action-btn"
                      onClick={() => navigateSection(action.section)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="admin-stats-grid">
                {statCards.map((card) => (
                  <button
                    type="button"
                    key={card.section}
                    className="admin-stat-card"
                    onClick={() => navigateSection(card.section)}
                  >
                    <span className="admin-stat-icon">
                      <AdminIcon name={card.icon} />
                    </span>
                    <span className="admin-stat-label">{card.label}</span>
                    <strong>{statsLoading ? '—' : card.value}</strong>
                    <span className="admin-stat-sub">
                      {statsLoading ? 'Loading...' : card.sub}
                    </span>
                    <small>
                      {card.note}
                      <b aria-hidden="true">↗</b>
                    </small>
                  </button>
                ))}
              </div>

              <div className="admin-overview-lower">
                <section className="admin-overview-card admin-inbox-card">
                  <div className="admin-card-heading">
                    <div>
                      <span>CLIENT COMMUNICATION</span>
                      <h3>Enquiry inbox</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateSection('enquiries')}
                    >
                      Open inbox ↗
                    </button>
                  </div>
                  <div className="admin-inbox-summary">
                    <span className="admin-inbox-icon">
                      <AdminIcon name="inbox" />
                    </span>
                    <div>
                      <strong>{statsLoading ? '—' : stats.enquiriesNew}</strong>
                      <p>New enquiries awaiting review</p>
                    </div>
                  </div>
                  <div className="admin-inbox-footer">
                    <span>
                      <i />{' '}
                      {statsLoading
                        ? 'Checking inbox...'
                        : stats.enquiriesNew > 0
                          ? 'Follow up with new leads'
                          : 'No unread enquiries'}
                    </span>
                    <b>
                      {statsLoading
                        ? '…'
                        : `${stats.enquiriesTotal} total received`}
                    </b>
                  </div>
                </section>

                <section className="admin-overview-card admin-quick-card">
                  <div className="admin-card-heading">
                    <div>
                      <span>CONTENT SECTIONS</span>
                      <h3>Manage your website</h3>
                    </div>
                  </div>
                  {adminSections
                    .filter((item) => item.id !== 'overview')
                    .map((item) => (
                      <button
                        type="button"
                        className="admin-quick-link"
                        key={item.id}
                        onClick={() => navigateSection(item.id)}
                      >
                        <span>
                          <AdminIcon name={item.icon} />
                          {item.label}
                        </span>
                        <b aria-hidden="true">↗</b>
                      </button>
                    ))}
                </section>
              </div>

              <div className="admin-recent-grid">
                <section className="admin-recent-card">
                  <div className="admin-card-heading">
                    <div>
                      <span>RECENT ENQUIRIES</span>
                      <h3>Latest leads</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateSection('enquiries')}
                    >
                      View all ↗
                    </button>
                  </div>
                  {statsLoading ? (
                    <p className="admin-recent-empty">Loading enquiries...</p>
                  ) : recent.enquiries.length === 0 ? (
                    <p className="admin-recent-empty">
                      No client enquiries received yet.
                    </p>
                  ) : (
                    <ul className="admin-recent-list">
                      {recent.enquiries.map((item) => (
                        <li className="admin-recent-item" key={item.id}>
                          <div>
                            <strong>{item.name}</strong>
                            <small>
                              {item.service || 'General enquiry'}
                              {item.created_at
                                ? ` · ${new Date(item.created_at).toLocaleDateString()}`
                                : ''}
                            </small>
                          </div>
                          <span
                            className={`admin-pill-badge status-${item.status || 'new'}`}
                          >
                            {(item.status || 'new').replace('_', ' ')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="admin-recent-card">
                  <div className="admin-card-heading">
                    <div>
                      <span>RECENT PORTFOLIO</span>
                      <h3>Latest projects</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateSection('projects')}
                    >
                      Manage ↗
                    </button>
                  </div>
                  {statsLoading ? (
                    <p className="admin-recent-empty">Loading projects...</p>
                  ) : recent.projects.length === 0 ? (
                    <p className="admin-recent-empty">
                      No portfolio projects added yet.
                    </p>
                  ) : (
                    <ul className="admin-recent-list">
                      {recent.projects.map((item) => (
                        <li className="admin-recent-item" key={item.id}>
                          <div>
                            <strong>{item.title}</strong>
                            <small>{item.category || 'Uncategorised'}</small>
                          </div>
                          <span
                            className={`admin-pill-badge ${
                              item.published ? 'is-published' : 'is-draft'
                            }`}
                          >
                            {item.published ? 'Published' : 'Draft'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="admin-recent-card">
                  <div className="admin-card-heading">
                    <div>
                      <span>RECENT INSIGHTS</span>
                      <h3>Latest articles</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateSection('blog')}
                    >
                      Manage ↗
                    </button>
                  </div>
                  {statsLoading ? (
                    <p className="admin-recent-empty">Loading articles...</p>
                  ) : recent.posts.length === 0 ? (
                    <p className="admin-recent-empty">
                      No blog articles created yet.
                    </p>
                  ) : (
                    <ul className="admin-recent-list">
                      {recent.posts.map((item) => (
                        <li className="admin-recent-item" key={item.id}>
                          <div>
                            <strong>{item.title}</strong>
                            <small>
                              {item.published_at
                                ? new Date(item.published_at).toLocaleDateString()
                                : 'Draft'}
                            </small>
                          </div>
                          <span
                            className={`admin-pill-badge ${
                              item.published ? 'is-published' : 'is-draft'
                            }`}
                          >
                            {item.published ? 'Published' : 'Draft'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </>
          )}

          {activeSection === 'homepage' && (
            <div className="admin-manager-panel">
              <HomepageManager />
            </div>
          )}
          {activeSection === 'about' && (
            <div className="admin-manager-panel">
              <AboutManager />
            </div>
          )}
          {activeSection === 'values' && (
            <div className="admin-manager-panel">
              <ValuesManager />
            </div>
          )}
          {activeSection === 'portfolio' && (
            <div className="admin-manager-panel">
              <PortfolioManager />
            </div>
          )}
          {activeSection === 'projects' && (
            <div className="admin-manager-panel">
              <ProjectsManager />
            </div>
          )}
          {activeSection === 'services' && (
            <div className="admin-manager-panel">
              <ServicesManager />
            </div>
          )}
          {activeSection === 'testimonials' && (
            <div className="admin-manager-panel">
              <TestimonialsManager />
            </div>
          )}
          {activeSection === 'social' && (
            <div className="admin-manager-panel">
              <SocialMediaManager />
            </div>
          )}
          {activeSection === 'blog' && (
            <div className="admin-manager-panel">
              <BlogManager />
            </div>
          )}
          {activeSection === 'enquiries' && (
            <div className="admin-manager-panel">
              <EnquiriesManager />
            </div>
          )}

          <footer className="admin-footer">
            <span>© {new Date().getFullYear()} Syncra Digital Agency</span>
            <span className="admin-footer-tagline">
              Designed for clarity. Built for growth.
            </span>
            <button
              type="button"
              className="admin-footer-logout"
              onClick={onLogout}
            >
              <AdminIcon name="logout" />
              <span>Log out</span>
            </button>
          </footer>
        </section>
      </div>
    </main>
  );
}

export default function AdminPortal() {
  const [user, setUser] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [status, setStatus] = useState('checking');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      const { data, error } = await supabase.auth.getSession();

      if (mounted) {
        setUser(error ? null : data.session?.user ?? null);
        setSessionLoaded(true);
      }
    }

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function verifyAdmin() {
      if (!sessionLoaded) return;

      if (!user) {
        setStatus('public');
        return;
      }

      setStatus('checking');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!mounted) return;

      if (error || profile?.role !== 'admin') {
        await supabase.auth.signOut();

        if (mounted) {
          setUser(null);
          setStatus('public');
        }

        return;
      }

      setStatus('admin');
    }

    verifyAdmin();

    return () => {
      mounted = false;
    };
  }, [user, sessionLoaded]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setStatus('public');
    navigate('/');
  }

  if (status === 'checking') {
    return (
      <div className="admin-loading">
        <div className="loading-orb" />
        <p>Verifying administrator access...</p>
      </div>
    );
  }

  if (status === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="private-admin-entry">
      <Link className="admin-back-link" to="/">
        ← Back to website
      </Link>
      <AdminLogin onLogin={setUser} />
    </div>
  );
}
