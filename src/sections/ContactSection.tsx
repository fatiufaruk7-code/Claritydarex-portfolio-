import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Github,
  Linkedin,
  Twitter,
  Dribbble,
  Info,
} from 'lucide-react';
import { COMPANY_INFO } from '../data/company';
import { submitContactForm } from '../services/submissionService';
import { checkFirebaseConfig } from '../firebase/config';

interface ContactSectionProps {
  selectedProjectType?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ selectedProjectType }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectType: selectedProjectType || 'Website Development',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number | null>(null);

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

    // Prevent duplicate accidental submissions within 10 seconds
    const now = Date.now();
    if (lastSubmissionTime && now - lastSubmissionTime < 10000) {
      setErrorMessage('Please wait a moment before sending another message.');
      return;
    }

    // Client-side quick checks
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMessage('Please provide your name (at least 2 characters).');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailPattern.test(formData.email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setErrorMessage('Please provide a message with at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await submitContactForm(formData);
      setSubmittedSuccess(true);
      setLastSubmissionTime(now);
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        projectType: 'Website Development',
        message: '',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit form. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const firebaseCheck = checkFirebaseConfig();

  return (
    <section id="contact" className="py-24 bg-[#090a0f] border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-xs font-mono text-blue-400 mb-4">
            <span>GET IN TOUCH</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Start Your Next Digital Initiative with Darex.
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg">
            Tell us about your organization and project vision. Our team responds promptly with technical insights and next steps.
          </p>
        </div>

        {/* Configuration Notice if Firebase env keys aren't set yet */}
        {!firebaseCheck.isConfigured && (
          <div className="mb-10 p-5 rounded-2xl bg-blue-950/40 border border-blue-800/60 text-slate-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <div className="font-semibold text-white">Firebase Environment Notice:</div>
                <p className="text-slate-300">
                  Firebase Firestore backend integration is fully coded. To persist real submissions to your Firebase project, provide the following environment variables in your <code className="text-blue-300 font-mono bg-blue-950/80 px-1.5 py-0.5 rounded">.env</code> or deployment dashboard:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {firebaseCheck.missingKeys.map((k) => (
                    <span key={k} className="px-2 py-0.5 rounded text-xs font-mono bg-blue-900/60 text-blue-200 border border-blue-700/50">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Contact Information */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">
                Direct Contact Channels
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Whether you need a full enterprise rebuild or a specialized digital solution, we are ready to collaborate.
              </p>
            </div>

            {/* Information Cards */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0e121a] border border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Inquiries & Proposals
                  </div>
                  <a
                    href={`mailto:${COMPANY_INFO.email}`}
                    className="text-sm font-semibold text-white hover:text-blue-400 transition-colors mt-0.5 block"
                  >
                    {COMPANY_INFO.email}
                  </a>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Official company inbox
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0e121a] border border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Direct Phone Line
                  </div>
                  <a
                    href={`tel:${COMPANY_INFO.phone}`}
                    className="text-sm font-semibold text-white hover:text-blue-400 transition-colors font-mono mt-0.5 block"
                  >
                    {COMPANY_INFO.phoneFormatted} ({COMPANY_INFO.phone})
                  </a>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Monday – Friday, 9am – 6pm WAT
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0e121a] border border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Headquarters & Reach
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    {COMPANY_INFO.location}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Serving enterprise partners globally
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-4 border-t border-slate-800">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
                Connect on Social Networks
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={COMPANY_INFO.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Darex on GitHub"
                  className="w-10 h-10 rounded-xl bg-[#0e121a] border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href={COMPANY_INFO.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Darex on LinkedIn"
                  className="w-10 h-10 rounded-xl bg-[#0e121a] border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href={COMPANY_INFO.socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Darex on X/Twitter"
                  className="w-10 h-10 rounded-xl bg-[#0e121a] border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href={COMPANY_INFO.socialLinks.dribbble}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Darex on Dribbble"
                  className="w-10 h-10 rounded-xl bg-[#0e121a] border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <Dribbble className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#0e121a] border border-slate-800 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl relative">
              
              {/* Submission success card */}
              {submittedSuccess ? (
                <div className="py-12 px-4 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Inquiry Received Successfully</h3>
                  <p className="text-slate-300 max-w-md mx-auto text-sm leading-relaxed">
                    Thank you for reaching out to Darex. Your project submission has been securely logged to our systems. An executive will review your requirements and respond within 24 hours.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => setSubmittedSuccess(false)}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6" id="darex-contact-form">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <h3 className="text-lg font-bold text-white">Project Inquiry Form</h3>
                    <span className="text-xs font-mono text-slate-400">* Required fields</span>
                  </div>

                  {/* Error Notification */}
                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-start gap-3 text-rose-200 text-sm">
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-semibold text-white">Submission Error</div>
                        <p className="text-xs text-rose-300 mt-0.5">{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Two column Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Full Name *
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
                        Email Address *
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
                        Phone Number
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
                        Company / Organization
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

                  {/* Project Type Select */}
                  <div>
                    <label htmlFor="contact-project-type" className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Service / Project Type
                    </label>
                    <select
                      id="contact-project-type"
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors"
                    >
                      <option value="Website Development">Website Development</option>
                      <option value="Web Design">Web Design</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Business Website Solutions">Business Website Solutions</option>
                      <option value="E-commerce Development">E-commerce Development</option>
                      <option value="Website Maintenance">Website Maintenance</option>
                      <option value="Digital Solutions">Digital Solutions</option>
                      <option value="Other Custom Inquiry">Other Custom Inquiry</option>
                    </select>
                  </div>

                  {/* Message textarea */}
                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Project Details & Goals *
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Briefly describe your goals, required timeline, and any specific technical or design considerations..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors leading-relaxed"
                    />
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      id="contact-submit-btn"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Submitting Inquiries to Firestore...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Project Request</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
