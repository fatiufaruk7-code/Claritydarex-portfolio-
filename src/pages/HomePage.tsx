import React, { useState } from 'react';
import { HeroSection } from '../sections/HeroSection';
import { AboutSection } from '../sections/AboutSection';
import { ServicesSection } from '../sections/ServicesSection';
import { ProjectsSection } from '../sections/ProjectsSection';
import { WhyChooseSection } from '../sections/WhyChooseSection';
import { ProcessSection } from '../sections/ProcessSection';
import { TestimonialsSection } from '../sections/TestimonialsSection';
import { FaqSection } from '../sections/FaqSection';
import { CtaSection } from '../sections/CtaSection';
import { ContactSection } from '../sections/ContactSection';
import { ProjectModal } from '../components/ProjectModal';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';
import type { ProjectItem } from '../types';

export const HomePage: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [selectedProjectType, setSelectedProjectType] = useState<string>('Website Development');

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectService = (serviceTitle: string) => {
    setSelectedProjectType(serviceTitle);
    scrollToSection('contact');
  };

  const handleStartSimilarProject = (projectName: string) => {
    setSelectedProjectType(`Project inquiry regarding: ${projectName}`);
    scrollToSection('contact');
  };

  return (
    <main id="main-content" className="w-full relative">
      {/* 1. Hero Section */}
      <HeroSection
        onGetStartedClick={() => scrollToSection('contact')}
        onViewWorkClick={() => scrollToSection('projects')}
      />

      {/* 2. About Darex */}
      <AboutSection />

      {/* 3. Services */}
      <ServicesSection onSelectService={handleSelectService} />

      {/* 4. Projects Showcase */}
      <ProjectsSection onSelectProject={(proj) => setSelectedProject(proj)} />

      {/* 5. Why Choose Darex */}
      <WhyChooseSection />

      {/* 6. 4-Step Process */}
      <ProcessSection />

      {/* 7. Testimonials */}
      <TestimonialsSection />

      {/* 8. Frequently Asked Questions */}
      <FaqSection onContactClick={() => scrollToSection('contact')} />

      {/* 9. Call To Action */}
      <CtaSection onStartProjectClick={() => scrollToSection('contact')} />

      {/* 10. Contact Section with Resilient Persistence */}
      <ContactSection selectedProjectType={selectedProjectType} />

      {/* Project Details Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onStartSimilarProject={handleStartSimilarProject}
      />

      {/* Floating Instant WhatsApp Lead Connect */}
      <FloatingWhatsApp />
    </main>
  );
};
