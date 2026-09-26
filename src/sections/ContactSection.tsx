import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Github,
  Twitter,
  Instagram,
  MessageCircle,
  Globe,
  Clock,
  MessageSquare,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { COMPANY_INFO } from '../data/company';
import { SERVICES_DATA } from '../data/services';
import {
  submitContactInquiry,
  buildWhatsAppInquiryUrl,
  buildMailtoInquiryUrl,
} from '../services/contactService';
import { ClassicIcon } from '../components/ClassicIcon';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface ContactSectionProps {
  selectedProjectType?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ selectedProjectType }) => {
  const { settings } = useSiteSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectType: selectedProjectType || 'Website Development',
    budget: 'Flexible / Discussion',
    timeline: 'Standard (3-4 weeks)',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    email: string;
    projectType: string;
    message: string;
    phone: string;
    company: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number | null>(null);

  const availableServices = [
    ...SERVICES_DATA.map((s) => s.title),
    'Other Custom Inquiry',
  ];

  // Update selectedProjectType if parent changes it
  React.useEffect(() => {
    if (selectedProjectType) {
      setFormData((prev) => ({ ...prev, projectType: selectedProjectType }));
    }
  }, [selectedProjectType]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate accidental rapid clicks
    const now = Date.now();
    if (lastSubmissionTime && now - lastSubmissionTime < 4000) {
      setErrorMessage('Your submission is being processed. Please wait a moment.');
      return;
    }

    // Client-side validation
    const trimmedName = formData.name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Please provide your name (at least 2 characters).');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail || !emailPattern.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const trimmedMsg = formData.message.trim();
    if (!trimmedMsg || trimmedMsg.length < 8) {
      setErrorMessage('Please provide a brief description of your project goals (at least 8 characters).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await submitContactInquiry(formData);
      setSubmittedData({
        name: trimmedName,
        email: trimmedEmail,
        projectType: formData.projectType,
        message: trimmedMsg,
        phone: formData.phone.trim(),
        company: formData.company.trim(),
      });
      setSubmittedSuccess(true);
      setLastSubmissionTime(now);

      // Reset form input state
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        projectType: 'Website Development',
        budget: 'Flexible / Discussion',
        timeline: 'Standard (3-4 weeks)',
        message: '',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const instagramLink =
    settings.socialMedia?.instagram?.trim() ||
    'https://www.instagram.com/farukfatiu?stkn=OW03andjamthMDd5';

  const whatsappDirectUrl = buildWhatsAppInquiryUrl();

  return (
    <section id="contact" className="py-24 bg-[#090a0f] border-t border-slate-800/80 relative overflow-hidden">
      {/* Subtle radial ambient light */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-xs font-mono text-blue-400 mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>PROJECT INITIATION & CONSULTATION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Start Your Next Digital Initiative with Darex.
            </h2>
            <p className="mt-4 text-slate-300 text-base sm:text-lg leading-relaxed">
              Tell us about your organization and project vision. Our team responds promptly with technical feasibility, architecture recommendations, and exact cost projections.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-700/50 transition-all shadow-sm hover:shadow-emerald-900/20"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Chat via WhatsApp</span>
            </a>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: Direct Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 space-y-8"
          >
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Direct Communication Channels
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Whether you need a custom web application, enterprise corporate redesign, or high-conversion commerce infrastructure, we are available for immediate consultation.
              </p>
            </div>

            {/* Information Cards */}
            <div className="space-y-4">
              {/* Email Card */}
              <div className="group p-5 rounded-2xl bg-[#0e121a] border border-slate-800/90 hover:border-slate-700 transition-all shadow-md hover:shadow-xl hover:shadow-black/50">
                <div className="flex items-start gap-4">
                  <ClassicIcon icon={Mail} size="md" variant="sapphire" strokeWidth={1.35} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Executive Inbox
                    </div>
                    <a
                      href={`mailto:${settings.contact?.email || COMPANY_INFO.email}`}
                      className="text-sm sm:text-base font-semibold text-white group-hover:text-blue-400 transition-colors mt-0.5 block truncate"
                    >
                      {settings.contact?.email || COMPANY_INFO.email}
                    </a>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                      <span>Monitored 7 days a week</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone / WhatsApp Card */}
              <div className="group p-5 rounded-2xl bg-[#0e121a] border border-slate-800/90 hover:border-slate-700 transition-all shadow-md hover:shadow-xl hover:shadow-black/50">
                <div className="flex items-start gap-4">
                  <ClassicIcon icon={Phone} size="md" variant="platinum" strokeWidth={1.35} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Direct Telephone & WhatsApp
                    </div>
                    <a
                      href={`tel:${settings.contact?.phone || COMPANY_INFO.phone}`}
                      className="text-sm sm:text-base font-semibold text-white group-hover:text-blue-400 transition-colors font-mono mt-0.5 block"
                    >
                      {settings.contact?.phone || COMPANY_INFO.phoneFormatted}
                    </a>
                    <div className="mt-2 flex items-center gap-3">
                      <a
                        href={whatsappDirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                      >
                        <span>WhatsApp Quick Chat</span>
                        <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="group p-5 rounded-2xl bg-[#0e121a] border border-slate-800/90 hover:border-slate-700 transition-all shadow-md hover:shadow-xl hover:shadow-black/50">
                <div className="flex items-start gap-4">
                  <ClassicIcon icon={MapPin} size="md" variant="emerald" strokeWidth={1.35} />
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Location & Availability
                    </div>
                    <div className="text-sm sm:text-base font-semibold text-white mt-0.5">
                      {settings.general?.location || COMPANY_INFO.location}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {settings.general?.businessHours ? (
                        <span className="flex items-center gap-1 text-slate-300 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{settings.general.businessHours}</span>
                        </span>
                      ) : (
                        'Based in Lagos, Nigeria. Available for local and remote projects worldwide.'
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Official Darex Website Card */}
              <div className="group p-5 rounded-2xl bg-[#0e121a] border border-slate-800/90 hover:border-slate-700 transition-all shadow-md hover:shadow-xl hover:shadow-black/50">
                <div className="flex items-start gap-4">
                  <ClassicIcon icon={Globe} size="md" variant="sapphire" strokeWidth={1.35} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Official Web Platform
                    </div>
                    <a
                      href={COMPANY_INFO.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-white group-hover:text-blue-400 transition-colors mt-0.5"
                    >
                      <span>Visit Darex</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-70" strokeWidth={1.5} />
                    </a>
                    <div className="text-xs text-slate-400 mt-1">
                      claritydarex.vercel.app &mdash; Live corporate deployment and portfolio
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Response Guarantee */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1.5 shadow-sm">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
                <span>Direct Response Standard</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Inquiries are reviewed directly by lead developer Faruk Fatiu. You will receive an actionable response and project consultation within 24 business hours.
              </p>
            </div>

            {/* Social Media Links */}
            <div className="pt-2">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
                Corporate Social Presence
              </div>
              <div className="flex items-center gap-3">
                {settings.socialMedia?.github?.trim() && (
                  <a
                    href={settings.socialMedia.github.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Darex on GitHub"
                    className="w-10 h-10 rounded-xl bg-gradient-to-b from-slate-800/80 via-[#10141e] to-[#080a0f] border border-slate-700/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center text-slate-300 hover:text-blue-300 hover:border-blue-400/50 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_6px_18px_rgba(59,130,246,0.2)] transition-all duration-300 hover:scale-105"
                  >
                    <Github className="w-4 h-4" strokeWidth={1.4} />
                  </a>
                )}
                {settings.socialMedia?.twitter?.trim() && (
                  <a
                    href={settings.socialMedia.twitter.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Darex on X/Twitter"
                    className="w-10 h-10 rounded-xl bg-gradient-to-b from-slate-800/80 via-[#10141e] to-[#080a0f] border border-slate-700/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center text-slate-300 hover:text-blue-300 hover:border-blue-400/50 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_6px_18px_rgba(59,130,246,0.2)] transition-all duration-300 hover:scale-105"
                  >
                    <Twitter className="w-4 h-4" strokeWidth={1.4} />
                  </a>
                )}
                <a
                  href={instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Faruk Fatiu on Instagram"
                  title="Instagram Profile"
                  className="w-10 h-10 rounded-xl bg-gradient-to-b from-slate-800/80 via-[#10141e] to-[#080a0f] border border-slate-700/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center text-slate-300 hover:text-pink-400 hover:border-pink-500/50 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_6px_18px_rgba(236,72,153,0.2)] transition-all duration-300 hover:scale-105"
                >
                  <Instagram className="w-4 h-4" strokeWidth={1.4} />
                </a>
                <a
                  href={whatsappDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Darex on WhatsApp"
                  className="w-10 h-10 rounded-xl bg-gradient-to-b from-slate-800/80 via-[#10141e] to-[#080a0f] border border-slate-700/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_6px_18px_rgba(16,185,129,0.2)] transition-all duration-300 hover:scale-105"
                >
                  <MessageCircle className="w-4 h-4" strokeWidth={1.4} />
                </a>
              </div>
              <div className="mt-3">
                <a
                  href={COMPANY_INFO.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Darex Website</span>
                  <span className="text-slate-500 text-[11px]">&mdash; claritydarex.vercel.app</span>
                  <ExternalLink className="w-3 h-3 opacity-70" strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7"
          >
            <div className="bg-[#0e121a] border border-slate-800 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl relative">
              
              {/* Submission Success State */}
              {submittedSuccess && submittedData ? (
                <div className="py-8 px-2 text-center space-y-6 animate-fadeIn">
                  <ClassicIcon
                    icon={CheckCircle2}
                    size="lg"
                    variant="emerald"
                    strokeWidth={1.4}
                    className="mx-auto"
                  />
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Inquiry Successfully Registered!</h3>
                    <p className="text-slate-300 max-w-lg mx-auto text-sm leading-relaxed">
                      Thank you, <span className="text-white font-semibold">{submittedData.name}</span>. Your project inquiry has been received. Our lead engineer (<span className="text-blue-400 font-mono">fatiufaruk7@gmail.com</span>) will review your specifications and contact you directly.
                    </p>
                  </div>

                  {/* Immediate 1-Click Action Options */}
                  <div className="pt-2 pb-2">
                    <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
                      Need Immediate Priority Attention?
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                      <a
                        href={buildWhatsAppInquiryUrl(submittedData)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/30"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Send to WhatsApp Now</span>
                      </a>

                      <a
                        href={buildMailtoInquiryUrl(submittedData)}
                        className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
                      >
                        <Mail className="w-4 h-4 text-blue-400" />
                        <span>Open in Mail App</span>
                      </a>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        setSubmittedSuccess(false);
                        setSubmittedData(null);
                      }}
                      className="px-6 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
                    >
                      Submit Another Project Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6" id="darex-contact-form">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div>
                      <h3 className="text-lg font-bold text-white">Project Inquiry Form</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Please provide project details to receive an exact estimate</p>
                    </div>
                    <span className="text-xs font-mono text-blue-400 font-semibold">* Required fields</span>
                  </div>

                  {/* Error Notification */}
                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-start gap-3 text-rose-200 text-sm">
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-semibold text-white">Please check your entries</div>
                        <p className="text-xs text-rose-300 mt-0.5">{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Two column Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        id="contact-name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Adeyemi Adeleke"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Business Email Address *
                      </label>
                      <input
                        type="email"
                        id="contact-email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. adeyemi@company.com"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors"
                      />
                    </div>
                  </div>

                  {/* Two column Phone & Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-phone" className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Phone / WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        id="contact-phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. 08137941486"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors font-mono"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-company" className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Company or Brand Name
                      </label>
                      <input
                        type="text"
                        id="contact-company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="e.g. Apex Global Logistics"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors"
                      />
                    </div>
                  </div>

                  {/* Service & Budget Two Columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-project-type" className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Service Category *
                      </label>
                      <select
                        id="contact-project-type"
                        name="projectType"
                        value={formData.projectType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors cursor-pointer"
                      >
                        {availableServices.map((serviceName) => (
                          <option key={serviceName} value={serviceName}>
                            {serviceName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="contact-budget" className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Estimated Budget Range
                      </label>
                      <select
                        id="contact-budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors cursor-pointer"
                      >
                        <option value="Flexible / Discussion">Flexible / Open for discussion</option>
                        <option value="₦350,000 – ₦800,000 ($250 – $600)">₦350,000 – ₦800,000 ($250 – $600)</option>
                        <option value="₦800,000 – ₦2,500,000 ($600 – $1,800)">₦800,000 – ₦2,500,000 ($600 – $1,800)</option>
                        <option value="₦2,500,000 – ₦6,000,000 ($1,800 – $4,500)">₦2,500,000 – ₦6,000,000 ($1,800 – $4,500)</option>
                        <option value="₦6,000,000+ ($4,500+ Enterprise)">₦6,000,000+ ($4,500+ Enterprise Tier)</option>
                      </select>
                    </div>
                  </div>

                  {/* Message textarea */}
                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Project Goals & Requirements *
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please outline your objectives, any reference websites, expected features, or target milestones..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors leading-relaxed"
                    />
                  </div>

                  {/* Submit Button & WhatsApp Alternative */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      id="contact-submit-btn"
                      className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Registering Your Project Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Project Request</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="text-center text-xs text-slate-400">
                      Or connect instantly via WhatsApp:{' '}
                      <a
                        href={whatsappDirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline font-medium inline-flex items-center gap-1"
                      >
                        <span>+234 813 794 1486</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </form>
              )}

            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
