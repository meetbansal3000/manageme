import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Server, 
  UserCheck, 
  FileText, 
  ArrowLeft, 
  ExternalLink,
  CheckCircle2,
  Mail,
  Scale
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PrivacyPolicyTabProps {
  onBack?: () => void;
}

export const PrivacyPolicyTab: React.FC<PrivacyPolicyTabProps> = ({ onBack }) => {
  const lastUpdated = 'August 20, 2026';

  const handleReturn = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined') {
      window.location.hash = '#landing';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-sans antialiased py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-5">
          <button
            onClick={handleReturn}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-solid)] hover:bg-[rgba(255,255,255,0.08)] border border-[var(--border)] text-sm font-semibold text-[var(--text-primary)] transition-all cursor-pointer shadow-xs active:scale-95"
            id="privacyBackBtn"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--accent)]" />
            <span>Return to Workspace</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official Policy &bull; Last Updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Title Hero */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
            Legal & Compliance
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Privacy Policy
          </h1>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed">
            Welcome to <strong className="text-[var(--text-primary)]">manageme</strong>. This Privacy Policy outlines our principles, practices, and commitments regarding the collection, storage, encryption, and protection of your personal and career data when accessing our platform, financial hubs, and Google OAuth services.
          </p>
        </div>

        {/* Core Highlight: Google OAuth Compliance Card */}
        <div className="p-6 rounded-3xl bg-blue-950/20 border border-blue-500/30 backdrop-blur-xl space-y-4 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Google OAuth 2.0 & User Data Protection
              </h2>
              <p className="text-xs text-blue-200/80 leading-relaxed">
                manageme complies strictly with the <strong className="text-white">Google API Services User Data Policy</strong>, including the Limited Use requirements.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Data Collected via Google Sign-In
              </span>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                Only basic profile scope (<code className="text-blue-300">email</code>, <code className="text-blue-300">profile.name</code>, and <code className="text-blue-300">picture</code>) is requested solely to establish your unique workspace identity.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Limited Use & No Third-Party Sales
              </span>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                Your data is never sold, leased, or shared with third-party advertisers or data brokers. Google account data is never used to train generalized external AI models.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Policy Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">

          {/* Section 1 */}
          <section className="space-y-3 p-6 rounded-3xl bg-[var(--surface-solid)] border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)]">01</span>
              Information We Collect
            </h2>
            <p>
              When you use manageme, we collect information in the following categories:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-[var(--text-secondary)]">
              <li><strong className="text-[var(--text-primary)]">Account Information:</strong> When signing in via Google OAuth or email, we receive your verified email address, full name, profile avatar URL, and an encrypted authentication identifier.</li>
              <li><strong className="text-[var(--text-primary)]">User Workspace Content:</strong> All financial entries, expense logs, timesheets, academic modules, study documents, paper trading simulations, and job tracker items you voluntarily input into your personal workspace.</li>
              <li><strong className="text-[var(--text-primary)]">Technical & Device Telemetry:</strong> Anonymized crash logs, browser type, operating system version, and session timestamps used solely for security verification and service stability.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 p-6 rounded-3xl bg-[var(--surface-solid)] border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)]">02</span>
              How We Use Your Information
            </h2>
            <p>
              The information collected is used exclusively for the following operational purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-[var(--text-secondary)]">
              <li>To provide, maintain, and personalize your executive dashboard, study intelligence modules, and career trackers.</li>
              <li>To synchronize your personal records across authorized devices using secure Supabase/Firebase database instances with Row-Level Security (RLS).</li>
              <li>To calculate student visa hourly limits, budget forecasts, and portfolio performance in real time.</li>
              <li>To protect against unauthorized access, fraudulent activities, and maintain enterprise-grade security.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 p-6 rounded-3xl bg-[var(--surface-solid)] border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)]">03</span>
              Google API Services Limited Use Disclosure
            </h2>
            <p>
              manageme's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline font-medium">Google API Services User Data Policy</a>, including the Limited Use requirements.
            </p>
            <p className="text-xs">
              Specifically:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[var(--text-secondary)]">
              <li>We do not transfer user data to third parties unless necessary to provide or improve user-facing features.</li>
              <li>We do not use or transfer user data for serving advertisements, including retargeting, personalized, or interest-based advertising.</li>
              <li>We do not allow humans to read user data unless we have obtained your affirmative agreement for specific messages, it is necessary for security purposes, or to comply with applicable law.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 p-6 rounded-3xl bg-[var(--surface-solid)] border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)]">04</span>
              Data Storage, Encryption & Security
            </h2>
            <p>
              All network transmissions are secured using Transport Layer Security (TLS 1.3). User database records are stored in encrypted form using AES-256 encryption at rest. Access to database tables is enforced strictly by user-specific cryptographic session tokens.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 p-6 rounded-3xl bg-[var(--surface-solid)] border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)]">05</span>
              Data Retention, Account Deletion & Revocation
            </h2>
            <p>
              You maintain full control over your personal information:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-[var(--text-secondary)]">
              <li><strong className="text-[var(--text-primary)]">Revoke Google OAuth Permissions:</strong> You can disconnect manageme's Google OAuth access at any time directly through your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline font-medium">Google Account Security Settings</a>.</li>
              <li><strong className="text-[var(--text-primary)]">Data Deletion Requests:</strong> You can export or permanently delete your entire workspace data and cloud database records via the in-app Settings panel or by submitting a deletion request to <code className="text-blue-400">privacy@manageme.io</code>.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 p-6 rounded-3xl bg-[var(--surface-solid)] border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)]">06</span>
              Contact & Data Protection Officer
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact our privacy team:
            </p>
            <div className="p-4 rounded-2xl bg-black/20 border border-[var(--border)] space-y-1 font-mono text-xs">
              <div className="text-[var(--text-primary)] font-bold">manageme Privacy & Compliance Office</div>
              <div>Email: <a href="mailto:privacy@manageme.io" className="text-blue-400 hover:underline">privacy@manageme.io</a></div>
              <div>Support: <a href="mailto:support@manageme.io" className="text-blue-400 hover:underline">support@manageme.io</a></div>
            </div>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-secondary)]">
          <div>&copy; {new Date().getFullYear()} manageme. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                if (typeof window !== 'undefined') window.location.hash = '#terms';
              }} 
              className="hover:text-[var(--text-primary)] hover:underline cursor-pointer"
            >
              Terms of Service
            </button>
            <span>&bull;</span>
            <button onClick={handleReturn} className="hover:text-[var(--text-primary)] hover:underline cursor-pointer">
              Launch Workspace
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicyTab;
