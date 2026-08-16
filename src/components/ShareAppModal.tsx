import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  X, 
  Smartphone, 
  Mail, 
  ExternalLink,
  MessageCircle,
  Linkedin,
  Twitter,
  QrCode,
  Globe
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRODUCTION_APP_URL = 'https://manageme-three.vercel.app';
const APP_TITLE = 'manageme — Executive Career & Academic Spatial OS';
const SHARE_MESSAGE = 'Check out manageme — an intelligent spatial workspace for financial markets, academic intelligence, and graduate careers!';

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(PRODUCTION_APP_URL);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = PRODUCTION_APP_URL;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      showToast('Production link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
      showToast('Could not copy link. Please copy manually.', 'warning');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: APP_TITLE,
          text: SHARE_MESSAGE,
          url: PRODUCTION_APP_URL
        });
        showToast('Shared successfully!', 'success');
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Native share error:', err);
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSendEmailInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      showToast('Please enter a valid email address.', 'warning');
      return;
    }

    setIsSendingInvite(true);

    const subject = encodeURIComponent(`${inviteName.trim() ? inviteName.trim() + ' invited you to ' : 'Invitation to join '}manageme Executive OS`);
    const body = encodeURIComponent(
      `Hey${inviteName.trim() ? ' ' + inviteName.trim() : ''}!\n\nI wanted to invite you to check out manageme — an intelligent spatial workspace engineered for university scholars, career operators, and finance professionals.\n\nExplore live market impact feeds, AI study tools, and graduate scheme pipelines here:\n${PRODUCTION_APP_URL}\n\nNo app install required — works instantly in any web browser.`
    );

    // Trigger user's native email client
    const mailtoUrl = `mailto:${encodeURIComponent(inviteEmail.trim())}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');

    setTimeout(() => {
      setIsSendingInvite(false);
      setInviteSent(true);
      showToast(`Invitation prepared for ${inviteEmail}!`, 'sparkle', 3500);
      setTimeout(() => {
        setInviteEmail('');
        setInviteName('');
        setInviteSent(false);
      }, 3000);
    }, 600);
  };

  const socialChannels = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25',
      getUrl: () => `https://api.whatsapp.com/send?text=${encodeURIComponent(`${SHARE_MESSAGE} 👉 ${PRODUCTION_APP_URL}`)}`
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30 hover:bg-sky-500/25',
      getUrl: () => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(PRODUCTION_APP_URL)}`
    },
    {
      name: 'X / Twitter',
      icon: Twitter,
      color: 'bg-slate-500/15 text-slate-800 dark:text-neutral-200 border-slate-500/30 hover:bg-slate-500/25',
      getUrl: () => `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_MESSAGE)}&url=${encodeURIComponent(PRODUCTION_APP_URL)}`
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/25',
      getUrl: () => `mailto:?subject=${encodeURIComponent(APP_TITLE)}&body=${encodeURIComponent(`${SHARE_MESSAGE}\n\nAccess the live platform here:\n${PRODUCTION_APP_URL}`)}`
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-white/85 dark:bg-slate-950/90 backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-blue-500/10 overflow-hidden z-10 text-slate-900 dark:text-white max-h-[92vh] overflow-y-auto custom-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >

          {/* Top Decorative Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          
          {/* Ambient Corner Glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Header */}
          <div className="flex items-start gap-3.5 mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-inner">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Share App & Invite Friends</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 font-mono font-bold border border-blue-500/30">
                  Live Link
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-neutral-400 mt-1 leading-relaxed">
                Invite fellow university scholars, consulting peers, and finance operators to explore the manageme workspace.
              </p>
            </div>
          </div>

          <div className="space-y-5 relative z-10">

            {/* 1. Primary One-Click Copy Link Box */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300">
                Official Production Web Link
              </label>
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-neutral-900/80 border border-slate-200/80 dark:border-neutral-800 backdrop-blur-md">
                <div className="flex items-center gap-2 pl-3 flex-1 min-w-0">
                  <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-xs font-mono font-semibold text-slate-800 dark:text-neutral-200 truncate select-all">
                    {PRODUCTION_APP_URL}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm ${
                    copied 
                      ? 'bg-emerald-600 text-white shadow-emerald-500/25' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* 2. Native Web Share API & Quick Action Channels */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-neutral-300">
                <span>Instant Sharing</span>
                {typeof navigator !== 'undefined' && (
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-normal">
                    Mobile & Desktop Ready
                  </span>
                )}
              </div>

              {/* Prominent Native Share Button */}
              <motion.button
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNativeShare}
                className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 hover:from-blue-500/20 hover:via-indigo-500/20 hover:to-purple-500/20 border border-blue-500/30 text-blue-800 dark:text-blue-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Open Device Share Sheet (WhatsApp, AirDrop, Messages)</span>
              </motion.button>

              {/* Social Channels Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {socialChannels.map((channel) => {
                  const ChannelIcon = channel.icon;
                  return (
                    <motion.a
                      key={channel.name}
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      href={channel.getUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${channel.color}`}
                    >
                      <ChannelIcon className="w-3.5 h-3.5" />
                      <span>{channel.name}</span>
                    </motion.a>
                  );
                })}
              </div>
            </div>

            {/* 3. Direct Email Invite Section */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-neutral-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Invite Peer by Email</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowQrCode(!showQrCode)}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{showQrCode ? 'Hide QR' : 'Show QR Code'}</span>
                </button>
              </div>

              {/* Collapsible QR Code Preview */}
              <AnimatePresence>
                {showQrCode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-center space-y-2 overflow-hidden shadow-inner"
                  >
                    <div className="inline-block p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(PRODUCTION_APP_URL)}&color=0f172a`} 
                        alt="manageme QR Code"
                        className="w-36 h-36 mx-auto rounded-lg"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-neutral-400 font-mono">
                      Scan with iPhone / Android camera for instant workspace launch.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Form */}
              <form onSubmit={handleSendEmailInvite} className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Friend's Name (Optional)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-900/90 border border-slate-200 dark:border-neutral-700/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 backdrop-blur-sm transition-colors"
                  />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@university.edu"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-900/90 border border-slate-200 dark:border-neutral-700/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 backdrop-blur-sm transition-colors"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSendingInvite || inviteSent}
                  className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-purple-500/20 disabled:opacity-60"
                >
                  {inviteSent ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Invite Created & Dispatched!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSendingInvite ? 'Composing Invitation...' : 'Send Direct Email Invitation'}</span>
                    </>
                  )}
                </motion.button>
              </form>
            </div>

          </div>

          {/* Footer Highlights */}
          <div className="mt-5 pt-3.5 border-t border-slate-200/80 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-500">
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-mono">
              <Sparkles className="w-3.5 h-3.5" /> Zero Installation Required
            </span>
            <span className="font-semibold text-slate-600 dark:text-neutral-400">manageme • Executive Suite</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShareAppModal;
