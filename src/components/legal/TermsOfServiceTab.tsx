import React from 'react';
import { 
  Scale, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  ArrowLeft, 
  CheckCircle2,
  ExternalLink,
  BookOpen,
  DollarSign
} from 'lucide-react';

interface TermsOfServiceTabProps {
  onBack?: () => void;
}

export const TermsOfServiceTab: React.FC<TermsOfServiceTabProps> = ({ onBack }) => {
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
            id="termsBackBtn"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--accent)]" />
            <span>Return to Workspace</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
            <Scale className="w-4 h-4 text-emerald-400" />
            <span>Terms of Service &bull; Last Updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Title Hero */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            Legal Terms & Conditions
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Terms of Service
          </h1>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed">
            Please read these Terms of Service carefully before utilizing <strong className="text-[var(--text-primary)]">manageme</strong>. By accessing or using our application, simulated financial terminals, or Google OAuth authentication, you agree to be bound by these terms.
          </p>
        </div>

        {/* Highlight Banner: Educational & Simulation Disclaimer */}
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-xl space-y-3 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-amber-200">
                Financial Simulation & Non-Advisory Notice
              </h2>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                manageme provides paper trading, portfolio simulation, and career analytics solely for educational and organizational purposes. We do not provide licensed financial, investment, tax, or legal advice. Simulated trades do not represent actual capital transactions.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">

          {/* Section 1 */}
          <section className="space-y-3 p-6 rounded-3xl bg-[var(--surface-solid)] border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)]">01</span>
              Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or registering an account on manageme (whether directly, via Google OAuth, or through Guest Mode), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 p-6 rounded-3xl bg-[var(--surface-solid)] border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)]">02</span>
              User Accounts & Authentication
            </h2>
            <p>
              When creating an account via Google OAuth or other supported single-sign-on providers:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-[var(--text-secondary)]">
              <li>You agree to provide accurate and authentic credentials through your authorized Google Account.</li>
              <li>You are responsible for maintaining the confidentiality of your credentials and device security.</li>
              <li>You must notify us immediately upon suspecting any unauthorized access to your account.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 p-6 rounded-3xl bg-[var(--surface-solid)] border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)]">03</span>
              Permitted Use & Prohibited Conduct
            </h2>
            <p>
              You agree to use manageme only for lawful personal, academic, and executive career purposes. You agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[var(--text-secondary)]">
              <li>Attempt to reverse-engineer, decompile, or compromise the platform's security mechanisms.</li>
              <li>Scrape or extract proprietary course content or simulated financial models without authorization.</li>
              <li>Transmit harmful, malicious, or automated bot traffic through API routes or sync bridges.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 p-6 rounded-3xl bg-[var(--surface-solid)] border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)]">04</span>
              Intellectual Property Rights
            </h2>
            <p>
              The manageme platform, interfaces, design systems, algorithms, and documentation are the exclusive property of manageme. All user-generated notes, study documents, timesheets, and uploaded resumes remain the sole intellectual property of the respective user.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 p-6 rounded-3xl bg-[var(--surface-solid)] border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)]">05</span>
              Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, manageme and its developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or inability to access the service, including data loss or simulated market fluctuations.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 p-6 rounded-3xl bg-[var(--surface-solid)] border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)]">06</span>
              Modifications & Contact
            </h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Continued use of the platform following any modifications constitutes acceptance of the revised terms.
            </p>
            <div className="p-4 rounded-2xl bg-black/20 border border-[var(--border)] space-y-1 font-mono text-xs">
              <div className="text-[var(--text-primary)] font-bold">manageme Legal Operations</div>
              <div>Email: <a href="mailto:legal@manageme.io" className="text-blue-400 hover:underline">legal@manageme.io</a></div>
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
                if (typeof window !== 'undefined') window.location.hash = '#privacy';
              }} 
              className="hover:text-[var(--text-primary)] hover:underline cursor-pointer"
            >
              Privacy Policy
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

export default TermsOfServiceTab;
