import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  RefreshCw,
  Radio,
  Check,
} from 'lucide-react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { DEFAULT_SITE_SETTINGS } from '../../services/siteSettingsService';
import type { SiteSettings } from '../../types';

interface SiteSettingsPanelProps {
  onClose?: () => void;
  currentAdminEmail?: string;
}

type TabType = 'general' | 'contact' | 'social' | 'hero' | 'footer' | 'seo';

export const SiteSettingsPanel: React.FC<SiteSettingsPanelProps> = ({
  currentAdminEmail,
}) => {
  const {
    settings,
    updateSettings,
    isLoading,
    isRealtimeConnected,
    lastRemoteUpdate,
    clearRemoteUpdateAlert,
    refreshSettings,
  } = useSiteSettings();

  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isJustSaved, setIsJustSaved] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Synchronize incoming Firestore updates instantly across active sessions
  useEffect(() => {
    if (settings) {
      if (!isDirty) {
        setFormData(settings);
      }
    }
  }, [settings, isDirty]);

  const handleGeneralChange = (field: keyof SiteSettings['general'], value: string) => {
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      general: { ...prev.general, [field]: value },
    }));
  };

  const handleContactChange = (field: keyof SiteSettings['contact'], value: string) => {
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value },
    }));
  };

  const handleSocialChange = (field: keyof SiteSettings['socialMedia'], value: string) => {
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [field]: value },
    }));
  };

  const handleHeroChange = (field: keyof SiteSettings['hero'], value: string) => {
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value },
    }));
  };

  const handleFooterChange = (field: keyof SiteSettings['footer'], value: string) => {
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      footer: { ...prev.footer, [field]: value },
    }));
  };

  const handleSeoChange = (field: keyof SiteSettings['seo'], value: string) => {
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      seo: { ...prev.seo, [field]: value },
    }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSaving) return;

    setStatusMessage(null);
    setIsSaving(true);
    try {
      const res = await updateSettings(formData, currentAdminEmail);
      if (res.success) {
        setIsDirty(false);
        setIsJustSaved(true);
        setStatusMessage({
          type: 'success',
          text: 'Site settings have been successfully saved to Firestore (collection: siteSettings, document: main) and updated live on the website!',
        });
        clearRemoteUpdateAlert();
        setTimeout(() => setIsJustSaved(false), 3000);
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

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSettings();
      setIsDirty(false);
      clearRemoteUpdateAlert();
      setStatusMessage({
        type: 'success',
        text: 'Successfully refreshed latest site settings directly from Firestore.',
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.warn('Manual refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Reset form fields to default Darex corporate settings? Unsaved changes will be replaced.'
      )
    ) {
      setFormData(DEFAULT_SITE_SETTINGS);
      setIsDirty(true);
    }
  };

  const handleApplyRemoteChanges = () => {
    setFormData(settings);
    setIsDirty(false);
    clearRemoteUpdateAlert();
    setStatusMessage({
      type: 'success',
      text: 'Synchronized with the latest remote changes.',
    });
    setTimeout(() => setStatusMessage(null), 3000);
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[10px] font-semibold">
              FIRESTORE: siteSettings/main
            </span>

            {/* Real-time Connection Indicator */}
            {isRealtimeConnected ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                REALTIME SYNC (onSnapshot)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                CONNECTING
              </span>
            )}

            {formData.updatedAt && (
              <span className="text-xs text-slate-500 font-mono">
                Updated:{' '}
                {new Date(formData.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                {formData.updatedBy && <span className="text-slate-400">({formData.updatedBy})</span>}
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Site Settings Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-admin configuration for company profile, contact channels, Instagram URL, and SEO meta tags.
          </p>
        </div>

        {/* Header Action Controls with instant save & loading states */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing || isSaving}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors disabled:opacity-50"
            title="Refresh latest from Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving || isLoading}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-1.5 shadow-md ${
              isJustSaved
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span>Saving...</span>
              </>
            ) : isJustSaved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 shrink-0" />
                <span>Save{isDirty ? ' *' : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Remote update notification banner */}
      <AnimatePresence>
        {lastRemoteUpdate && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-xl bg-blue-950/70 border border-blue-800/80 text-blue-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Live Remote Update Received via onSnapshot</span>
                <p className="text-slate-300 mt-0.5">
                  Settings were just modified in Firestore by <span className="text-blue-300 font-mono font-semibold">{lastRemoteUpdate.updatedBy}</span> at {lastRemoteUpdate.receivedAt}.
                  {isDirty
                    ? ' You have unsaved local edits in this form.'
                    : ' Your form has been automatically updated.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isDirty && (
                <button
                  type="button"
                  onClick={handleApplyRemoteChanges}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow"
                >
                  Apply Remote
                </button>
              )}
              <button
                type="button"
                onClick={clearRemoteUpdateAlert}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs transition-colors border border-slate-800"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
            <span>
              {isDirty
                ? 'You have unsaved changes in this form.'
                : 'Form is in sync with Firestore & local resilient cache.'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="submit"
              disabled={isSaving || isLoading}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
                isJustSaved
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Saving to Firestore...</span>
                </>
              ) : isJustSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Site Settings Saved &amp; Live!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 shrink-0" />
                  <span>Save Site Settings{isDirty ? ' *' : ''}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
