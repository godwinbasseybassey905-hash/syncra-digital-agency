import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useScrollReveal } from '../hooks/useScrollReveal';
import HeroSection from '../components/home/HeroSection';
import AboutIntroSection from '../components/home/AboutIntroSection';
import ServicesSection from '../components/home/ServicesSection';
import WorkProcessSection from '../components/home/WorkProcessSection';
import WhyWebsiteSection from '../components/home/WhyWebsiteSection';
import PortfolioSection from '../components/home/PortfolioSection';
import ContactSection from '../components/home/ContactSection';
import TestimonialsSection from '../TestimonialsSection';
import InsightsSection from '../InsightsSection';

export default function HomePage() {
  const [publicProjects, setPublicProjects] = useState([]);
  const [publicServices, setPublicServices] = useState([]);
  const [homepageContent, setHomepageContent] = useState(null);
  const [aboutContent, setAboutContent] = useState(null);
  const [valuesContent, setValuesContent] = useState(null);
  const [portfolioContent, setPortfolioContent] = useState(null);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const pageRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function loadSiteContent() {
      const { data, error } = await supabase
        .from('site_content')
        .select('id, content')
        .in('id', ['homepage', 'about', 'values', 'portfolio']);

      if (!mounted) return;

      if (error) {
        console.error('Could not load site content:', error.message);
        return;
      }

      const contentMap = {};
      (data || []).forEach((row) => {
        contentMap[row.id] = row.content || null;
      });

      setHomepageContent(contentMap.homepage || null);
      setAboutContent(contentMap.about || null);
      setValuesContent(contentMap.values || null);
      setPortfolioContent(contentMap.portfolio || null);
    }

    async function loadProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (!mounted) return;
      if (error) console.error('Could not load portfolio projects:', error.message);
      else setPublicProjects(data || []);
      setProjectsLoading(false);
    }

    async function loadServices() {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!mounted) return;
      if (error) console.error('Could not load services:', error.message);
      else setPublicServices(data || []);
      setServicesLoading(false);
    }

    loadSiteContent();
    loadProjects();
    loadServices();

    return () => {
      mounted = false;
    };
  }, []);

  useScrollReveal(pageRef, [
    projectsLoading,
    servicesLoading,
    publicProjects.length,
    publicServices.length,
  ]);

  return (
    <div className="syncra-homepage" ref={pageRef}>
      <HeroSection
        homepageContent={homepageContent}
        publishedProjectCount={publicProjects.length}
      />

      <section className="home-intro-strip reveal" aria-label="Core agency pillars">
        <div className="home-intro-strip__inner">
          <span>CREATIVITY</span>
          <i aria-hidden="true">✦</i>
          <span>TECHNOLOGY</span>
          <i aria-hidden="true">✦</i>
          <span>STRATEGY</span>
          <i aria-hidden="true">✦</i>
          <span>GROWTH</span>
        </div>
      </section>

      <AboutIntroSection
        aboutContent={aboutContent}
        valuesContent={valuesContent}
      />

      <ServicesSection
        services={publicServices}
        loading={servicesLoading}
      />

      <WorkProcessSection />

      <WhyWebsiteSection />

      <PortfolioSection
        projects={publicProjects}
        portfolioContent={portfolioContent}
        loading={projectsLoading}
      />

      <TestimonialsSection />

      <InsightsSection limit={3} />

      <ContactSection />
    </div>
  );
}
