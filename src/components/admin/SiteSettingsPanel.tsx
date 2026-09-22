import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Building,
  Phone,
  Share2,
  Sparkles,
  Layout,
  Search,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Instagram,
  Twitter,
  Github,
  MessageCircle,
} from 'lucide-react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { DEFAULT_SITE_SETTINGS } from '../../services/siteSettingsService';
import type { SiteSettings } from '../../types';

interface SiteSettingsPanelProps {
  onClose?: () => void;
}

type TabType = 'general' | 'contact' | 'social' | 'hero' | 'footer' | 'seo';

export const SiteSettingsPanel: React.FC<SiteSettingsPanelProps> = () => {
  const { settings, updateSettings, isLoading } = useSiteSettings();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleGeneralChange = (field: keyof SiteSettings['general'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      general: { ...prev.general, [field]: value },
    }));
  };

  const handleContactChange = (field: keyof SiteSettings['contact'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value },
    }));
  };

  const handleSocialChange = (field: keyof SiteSettings['socialMedia'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [field]: value },
    }));
  };

  const handleHeroChange = (field: keyof SiteSettings['hero'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value },
    }));
  };

  const handleFooterChange = (field: keyof SiteSettings['footer'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      footer: { ...prev.footer, [field]: value },
    }));
  };

  const handleSeoChange = (field: keyof SiteSettings['seo'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      seo: { ...prev.seo, [field]: value },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsSaving(true);
    try {
      const res = await updateSettings(formData);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: 'Site settings have been successfully saved to Firestore (collection: siteSettings, document: main) and updated live on the website!',
        });
        setTimeout(() => setStatusMessage(null), 5000);
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Failed to save settings to Firestore.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating settings.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Reset form fields to default Darex corporate settings? Unsaved changes will be replaced.'
      )
    ) {
      setFormData(DEFAULT_SITE_SETTINGS);
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <Building className="w-4 h-4" /> },
    { id: 'contact', label: 'Contact Details', icon: <Phone className="w-4 h-4" /> },
    { id: 'social', label: 'Social & WhatsApp', icon: <Share2 className="w-4 h-4" /> },
    { id: 'hero', label: 'Hero Section', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'footer', label: 'Footer', icon: <Layout className="w-4 h-4" /> },
    { id: 'seo', label: 'SEO & Metadata', icon: <Search className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-[#0e121a] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[10px] font-semibold">
              FIRESTORE: siteSettings/main
            </span>
            {formData.updatedAt && (
              <span className="text-xs text-slate-500 font-mono">
                Last updated:{' '}
                {new Date(formData.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Site Settings Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure live company identity, contact numbers, Instagram URL, copy, and SEO meta
            tags in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-200'
              : 'bg-rose-950/60 border border-rose-800/60 text-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-semibold text-white">
              {statusMessage.type === 'success' ? 'Saved Successfully' : 'Notice'}
            </div>
            <p className="mt-0.5">{statusMessage.text}</p>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6 pt-2">
        {/* GENERAL TAB */}
        {activeTab === 'general' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 max-w-3xl"
          >
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Company Name
              </label>
              <input
                type="text"
                required
                value={formData.general?.companyName || ''}
                onChange={(e) => handleGeneralChange('companyName', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#10141e] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Darex"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Company Description
              </label>
              <textarea
                rows={3}
                value={formData.general?.companyDescription || ''}
                onChange={(e) => handleGeneralChange('companyDescription', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#10141e] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Building Digital Solutions That Move Businesses Forward."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.general?.location || ''}
                  onChange={(e) => handleGeneralChange('location', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#10141e] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Lagos, Nigeria (Serving Clients Worldwide)"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                  Business Hours
                </label>
                <input
                  type="text"
                  value={formData.general?.businessHours || ''}
                  onChange={(e) => handleGeneralChange('businessHours', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#10141e] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Mon - Sat: 9:00 AM - 6:00 PM (WAT)"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* CONTACT TAB */}
        {activeTab === 'contact' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 max-w-3xl"
          >
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Official Contact Email
              </label>
              <input
                type="email"
                required
                value={formData.contact?.email || ''}
                onChange={(e) => handleContactChange('email', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#10141e] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="fatiufaruk7@gmail.com"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Displayed in the website contact section, footer, and mail links.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                  Primary Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.contact?.phone || ''}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#10141e] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="08137941486"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                  WhatsApp Direct Number
                </label>
                <input
                  type="tel"
                  value={formData.contact?.whatsappNumber || ''}
                  onChange={(e) => handleContactChange('whatsappNumber', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#10141e] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="+2348137941486"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* SOCIAL TAB */}
        {activeTab === 'social' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 max-w-3xl"
          >
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
                <span>Instagram Profile URL</span>
              </label>
              <input
                type="url"
                value={formData.socialMedia?.instagram || ''}
                onChange={(e) => handleSocialChange('instagram', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#10141e] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="https://www.instagram.com/farukfatiu?stkn=OW03andjamthMDd5"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Connected directly to social link buttons across the website and footer.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Click-to-Chat URL</span>
              </label>
              <input
                type="url"
                value={formData.socialMedia?.whatsapp || ''}
                onChange={(e) => handleSocialChange('whatsapp', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#10141e] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="https://wa.me/2348137941486"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold flex items-center gap-1.5">
                  <Twitter className="w-3.5 h-3.5 text-sky-400" />
                  <span>X / Twitter URL</span>
                </label>
                <input
                  type="url"
                  value={formData.socialMedia?.twitter || ''}
                  onChange={(e) => handleSocialChange('twitter', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#10141e] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="https://twitter.com/darexhq"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-slate-300" />
                  <span>GitHub URL</span>
                </label>
                <input
                  type="url"
                  value={formData.socialMedia?.github || ''}
                  onChange={(e) => handleSocialChange('github', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#10141e] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="https://github.com/darex"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* HERO TAB */}
        {activeTab === 'hero' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 max-w-3xl"
          >
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Hero Main Headline
              </label>
              <input
                type="text"
                value={formData.hero?.headline || ''}
                onChange={(e) => handleHeroChange('headline', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#10141e] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Building Digital Solutions That Move Businesses Forward."
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Hero Description / Supporting Copy
              </label>
              <textarea
                rows={3}
                value={formData.hero?.description || ''}
                onChange={(e) => handleHeroChange('description', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#10141e] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Darex provides modern digital solutions designed to help businesses grow..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                  Primary Button Label
                </label>
                <input
                  type="text"
                  value={formData.hero?.primaryButtonText || ''}
                  onChange={(e) => handleHeroChange('primaryButtonText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#10141e] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Get Started"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                  Primary Button Link URL
                </label>
                <input
                  type="text"
                  value={formData.hero?.primaryButtonUrl || ''}
                  onChange={(e) => handleHeroChange('primaryButtonUrl', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#10141e] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="#contact"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* FOOTER TAB */}
        {activeTab === 'footer' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 max-w-3xl"
          >
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Footer Brand Description
              </label>
              <textarea
                rows={3}
                value={formData.footer?.description || ''}
                onChange={(e) => handleFooterChange('description', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#10141e] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Building digital solutions that move businesses forward. Full-cycle engineering, modern design, and enterprise-grade web development."
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Copyright Text
              </label>
              <input
                type="text"
                value={formData.footer?.copyrightText || ''}
                onChange={(e) => handleFooterChange('copyrightText', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#10141e] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Darex. All rights reserved."
              />
            </div>
          </motion.div>
        )}

        {/* SEO TAB */}
        {activeTab === 'seo' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 max-w-3xl"
          >
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Page Title Tag
              </label>
              <input
                type="text"
                value={formData.seo?.title || ''}
                onChange={(e) => handleSeoChange('title', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#10141e] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Darex — Building Digital Solutions That Move Businesses Forward"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={formData.seo?.description || ''}
                onChange={(e) => handleSeoChange('description', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#10141e] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Darex provides modern digital solutions designed to help businesses grow..."
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Social Share Image (Open Graph) URL
              </label>
              <input
                type="text"
                value={formData.seo?.ogImageUrl || ''}
                onChange={(e) => handleSeoChange('ogImageUrl', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#10141e] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="/pwa-512x512.png"
              />
            </div>
          </motion.div>
        )}

        {/* Form Action Controls */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Changes persist directly to Firestore &amp; local resilient cache.
          </p>

          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Firestore...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Site Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
