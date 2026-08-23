// Component: Cold Email & Recruiter CRM Suite

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Mail, 
  Send, 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  Copy, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Building2, 
  Linkedin, 
  GraduationCap, 
  Award, 
  BookOpen, 
  ArrowRight,
  ShieldCheck,
  Check,
  Loader2,
  X
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import { toast } from '../../ui/Toast';

export type ContactStatus = 'Not Contacted' | 'Sent' | 'Followed Up' | 'Replied';
export type EmailTemplateType = 'networking' | 'application' | 'thankyou';

export interface RecruiterContact {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  linkedin?: string;
  status: ContactStatus;
  notes: string;
  dateAdded: string;
  lastContacted?: string;
}

const STORAGE_KEY = 'manageme_recruiter_crm';

const DEFAULT_CANDIDATE_PROFILE = {
  name: 'Meet Bansal',
  university: 'Durham University',
  degree: 'MSc Finance & Investment',
  certifications: 'ACCA Affiliate, CFA Level 1 Candidate',
  skills: 'IFRS, Xero Accounting, DCF Valuation, LBO Modeling, SQL, Python',
  experience: 'CA Firm IFRS Accounting Trainee & Valuation Analyst'
};

const DEFAULT_CONTACTS: RecruiterContact[] = [
  {
    id: 'rec_1',
    name: 'Sarah Jenkins',
    company: 'Goldman Sachs',
    role: 'Campus Recruiting Lead - Investment Banking',
    email: 'sarah.jenkins@gs.com',
    linkedin: 'https://linkedin.com/in/sarah-jenkins-recruiter',
    status: 'Sent',
    notes: 'Reached out regarding 2027 Full-Time Analyst Class.',
    dateAdded: '2026-08-15',
    lastContacted: '2026-08-18'
  },
  {
    id: 'rec_2',
    name: 'Michael Chang',
    company: 'Morgan Stanley',
    role: 'VP, Global Capital Markets',
    email: 'm.chang@morganstanley.com',
    linkedin: 'https://linkedin.com/in/michael-chang-gcm',
    status: 'Not Contacted',
    notes: 'Durham Alum. Receptive to coffee chats.',
    dateAdded: '2026-08-20'
  },
  {
    id: 'rec_3',
    name: 'Elena Rostova',
    company: 'BlackRock',
    role: 'Senior Talent Acquisition Specialist',
    email: 'elena.rostova@blackrock.com',
    linkedin: 'https://linkedin.com/in/elena-rostova-talent',
    status: 'Replied',
    notes: 'Agreed to a 15-minute introductory call next Tuesday.',
    dateAdded: '2026-08-10',
    lastContacted: '2026-08-21'
  }
];

export const ColdEmailSuite: React.FC = () => {
  // CRM Contacts State
  const [contacts, setContacts] = useState<RecruiterContact[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_CONTACTS;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    } catch {}
  }, [contacts]);

  // UI state
  const [activeTab, setActiveTab] = useState<'crm' | 'generator'>('crm');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<RecruiterContact | null>(null);

  // Form State for Contact
  const [contactForm, setContactForm] = useState<Partial<RecruiterContact>>({
    name: '',
    company: '',
    role: '',
    email: '',
    linkedin: '',
    status: 'Not Contacted',
    notes: ''
  });

  // AI Email Generator State
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [templateType, setTemplateType] = useState<EmailTemplateType>('networking');
  const [targetName, setTargetName] = useState('Sarah Jenkins');
  const [targetCompany, setTargetCompany] = useState('Goldman Sachs');
  const [targetRole, setTargetRole] = useState('Investment Banking Analyst');
  const [tone, setTone] = useState<'professional' | 'direct' | 'enthusiastic'>('professional');
  const [customAngle, setCustomAngle] = useState('Durham University MSc Finance background & ACCA affiliate experience');

  // Sync AI generator inputs when a contact is selected
  const handleSelectContactForEmail = (c: RecruiterContact) => {
    setSelectedContactId(c.id);
    setTargetName(c.name);
    setTargetCompany(c.company);
    setTargetRole(c.role || 'Investment Banking Division');
    setActiveTab('generator');
    toast.info(`Loaded contact details for ${c.name}`);
  };

  // Filtered Contacts
  const filteredContacts = useMemo(() => {
    return (contacts || []).filter(c => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.company && c.company.toLowerCase().includes(q)) ||
          (c.role && c.role.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [contacts, statusFilter, searchQuery]);

  // Contact CRUD Handlers
  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.company) {
      toast.error('Please provide at least a contact name and company.');
      return;
    }

    if (editingContact) {
      const updated = contacts.map(c => c.id === editingContact.id ? {
        ...editingContact,
        ...contactForm,
        name: contactForm.name || '',
        company: contactForm.company || '',
        role: contactForm.role || '',
        email: contactForm.email || '',
        linkedin: contactForm.linkedin || '',
        status: (contactForm.status as ContactStatus) || 'Not Contacted',
        notes: contactForm.notes || ''
      } : c);
      setContacts(updated);
      toast.success(`Updated contact: ${contactForm.name}`);
    } else {
      const newContact: RecruiterContact = {
        id: `rec_${Date.now()}`,
        name: contactForm.name || '',
        company: contactForm.company || '',
        role: contactForm.role || 'Recruiter',
        email: contactForm.email || '',
        linkedin: contactForm.linkedin || '',
        status: (contactForm.status as ContactStatus) || 'Not Contacted',
        notes: contactForm.notes || '',
        dateAdded: new Date().toISOString().split('T')[0]
      };
      setContacts([newContact, ...contacts]);
      toast.success(`Added ${newContact.name} to Recruiter CRM`);
    }

    setContactForm({
      name: '',
      company: '',
      role: '',
      email: '',
      linkedin: '',
      status: 'Not Contacted',
      notes: ''
    });
    setEditingContact(null);
    setIsAddModalOpen(false);
  };

  const handleDeleteContact = (id: string, name: string) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    toast.info(`Removed ${name} from CRM`);
  };

  const handleUpdateStatus = (id: string, status: ContactStatus) => {
    const updated = contacts.map(c => c.id === id ? {
      ...c,
      status,
      lastContacted: status !== 'Not Contacted' ? new Date().toISOString().split('T')[0] : c.lastContacted
    } : c);
    setContacts(updated);
    toast.success(`Status updated to "${status}"`);
  };

  // Generate Email Content
  const generatedEmail = useMemo(() => {
    const name = targetName.trim() || 'Hiring Team';
    const firstName = name.split(' ')[0] || name;
    const company = targetCompany.trim() || 'your firm';
    const role = targetRole.trim() || 'Analyst Program';

    if (templateType === 'networking') {
      return {
        subject: `Durham MSc Finance Student - Coffee Chat & ${company} Career Inquiry`,
        body: `Dear ${firstName},

I hope this email finds you well.

My name is ${DEFAULT_CANDIDATE_PROFILE.name}, currently pursuing an MSc in Finance & Investment at Durham University and an ACCA Affiliate with practical experience in IFRS accounting, financial reporting, and DCF/LBO valuation modeling.

I have been following ${company}'s impressive deal flow and sector focus in ${role}. Given your leadership and trajectory at the firm, I would be immensely grateful for the opportunity to learn from your career journey.

If your schedule permits over the coming fortnight, would you have 10-15 minutes for a brief introductory phone call or virtual coffee chat? I would be delighted to hear your perspectives on thriving at ${company}.

Thank you very much for your time and consideration.

Warm regards,

${DEFAULT_CANDIDATE_PROFILE.name}
Durham University | MSc Finance & Investment
ACCA Affiliate | CFA Level 1 Candidate
Email: candidate@durham.ac.uk`
      };
    } else if (templateType === 'application') {
      return {
        subject: `Application: ${role} - ${DEFAULT_CANDIDATE_PROFILE.name} (Durham MSc Finance / ACCA Affiliate)`,
        body: `Dear ${firstName},

I am writing to formally express my strong interest in the ${role} position at ${company}.

Currently completing my MSc in Finance & Investment at Durham University alongside holding ACCA Affiliate status, I bring hands-on experience in IFRS financial statement analysis, Xero accounting automation, and DCF valuation modeling. Through rigorous coursework and practical accounting trainee experience, I have developed deep commercial acumen and precision under tight deliverables.

Key highlights I would bring to ${company}:
• Rigorous Financial Modeling: Built robust DCF, comparable company, and integrated 3-statement financial models.
• Accounting Mastery (ACCA): Solid foundation in GAAP/IFRS standards, working capital reconciliations, and audit preparation.
• Technical & Analytical Toolkit: Fluent with Excel modeling, Python data analysis, and SQL query scripting.

I have attached my standard ATS resume for your review. I would welcome the opportunity to discuss how my analytical rigor and dedication can contribute to ${company}'s continued success.

Sincerely,

${DEFAULT_CANDIDATE_PROFILE.name}
Durham University | MSc Finance & Investment
ACCA Affiliate
LinkedIn: linkedin.com/in/msc-finance-durham`
      };
    } else {
      // Thank you email
      return {
        subject: `Thank You - Interview for ${role} with ${company}`,
        body: `Dear ${firstName},

Thank you very much for taking the time to speak with me today regarding the ${role} opportunity at ${company}.

I truly enjoyed our discussion regarding the team's strategic direction and valuation methodologies. Our conversation further reinforced my strong enthusiasm for joining ${company}, and I am confident that my background in Durham's MSc Finance curriculum and ACCA accounting training aligns seamlessly with the high analytical standards of your division.

Please let me know if you require any additional work samples or references from my side. I look forward to hearing about next steps in the process.

Best regards,

${DEFAULT_CANDIDATE_PROFILE.name}
MSc Finance & Investment, Durham University
ACCA Affiliate`
      };
    }
  }, [targetName, targetCompany, targetRole, templateType, tone, customAngle]);

  // Pre-Send Human-in-the-Loop Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewTo, setReviewTo] = useState('');
  const [reviewSubject, setReviewSubject] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const handleCopyEmail = () => {
    const fullText = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    navigator.clipboard.writeText(fullText);
    toast.success('Subject & Email body copied to clipboard!');
  };

  const handleOpenReviewModal = (recipientEmail?: string) => {
    const targetEmail = recipientEmail || contacts.find(c => c.id === selectedContactId)?.email || 'sarah.jenkins@gs.com';
    setReviewTo(targetEmail);
    setReviewSubject(generatedEmail.subject);
    setReviewBody(generatedEmail.body);
    setIsReviewModalOpen(true);
  };

  const handleSaveToGmailDrafts = async () => {
    if (!reviewTo.trim()) {
      toast.error('Please enter a recipient email address.');
      return;
    }
    setIsSavingDraft(true);
    try {
      const res = await fetch('/api/email/create-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: reviewTo,
          subject: reviewSubject,
          body: reviewBody
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Draft successfully saved to Gmail! (ID: ${data.draftId})`);
        setIsReviewModalOpen(false);
      } else {
        toast.error(data.error || 'Failed to create Gmail draft.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Network error saving draft.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleCopyReviewText = () => {
    const full = `Subject: ${reviewSubject}\n\n${reviewBody}`;
    navigator.clipboard.writeText(full);
    toast.success('Subject and email body copied to clipboard!');
  };

  const handleOpenMailto = () => {
    const target = reviewTo || contacts.find(c => c.id === selectedContactId)?.email || '';
    const mailto = `mailto:${encodeURIComponent(target)}?subject=${encodeURIComponent(reviewSubject || generatedEmail.subject)}&body=${encodeURIComponent(reviewBody || generatedEmail.body)}`;
    window.open(mailto, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-400" />
            <span>Recruiter CRM & Cold Outreach Suite</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track hiring contacts, automate tailored networking outreach, and accelerate interview pipelines.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'crm' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 inline mr-1.5" />
            Recruiter Contacts ({contacts.length})
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'generator' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 inline mr-1.5 text-amber-300" />
            AI Email Generator
          </button>
        </div>
      </div>

      {/* Candidate Background Context Card */}
      <Card variant="glass" padding="sm" className="border border-blue-500/20 bg-blue-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">Durham University MSc Finance & ACCA Affiliate</span>
              <span className="text-[11px] text-slate-400">Integrated Credentials: IFRS Reporting • Xero Accounting • DCF/LBO Financial Modeling</span>
            </div>
          </div>
          <span className="text-[10px] text-blue-300 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20 shrink-0">
            Auto-Populated in Outreach
          </span>
        </div>
      </Card>

      {/* VIEW 1: RECRUITER CRM TABLE */}
      {activeTab === 'crm' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search recruiters or firms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL" className="bg-slate-900">All Statuses</option>
                <option value="Not Contacted" className="bg-slate-900">Not Contacted</option>
                <option value="Sent" className="bg-slate-900">Sent</option>
                <option value="Followed Up" className="bg-slate-900">Followed Up</option>
                <option value="Replied" className="bg-slate-900">Replied</option>
              </select>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingContact(null);
                setContactForm({
                  name: '',
                  company: '',
                  role: '',
                  email: '',
                  linkedin: '',
                  status: 'Not Contacted',
                  notes: ''
                });
                setIsAddModalOpen(true);
              }}
              className="w-full sm:w-auto"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Recruiter Contact
            </Button>
          </div>

          {/* CRM Contacts Table */}
          <Card variant="glass" padding="none" className="border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Recruiter / Contact</th>
                    <th className="py-3 px-4">Firm & Role</th>
                    <th className="py-3 px-4">Direct Email</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{contact.name}</span>
                          {contact.linkedin && (
                            <a
                              href={contact.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:text-blue-300 p-0.5"
                              title="Open LinkedIn profile"
                            >
                              <Linkedin className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">Added {contact.dateAdded}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">{contact.company}</span>
                        <span className="text-[11px] text-slate-400">{contact.role}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-300 select-all">{contact.email || '—'}</span>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={contact.status}
                          onChange={(e) => handleUpdateStatus(contact.id, e.target.value as ContactStatus)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase focus:outline-none cursor-pointer border ${
                            contact.status === 'Replied'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : contact.status === 'Sent'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : contact.status === 'Followed Up'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-700/40 text-slate-400 border-slate-600/40'
                          }`}
                        >
                          <option value="Not Contacted" className="bg-slate-900 text-white">Not Contacted</option>
                          <option value="Sent" className="bg-slate-900 text-white">Sent</option>
                          <option value="Followed Up" className="bg-slate-900 text-white">Followed Up</option>
                          <option value="Replied" className="bg-slate-900 text-white">Replied</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 max-w-[200px] truncate text-slate-400" title={contact.notes}>
                        {contact.notes || '—'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSelectContactForEmail(contact)}
                            className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                            title="Generate outreach email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingContact(contact);
                              setContactForm(contact);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Edit Contact"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteContact(contact.id, contact.name)}
                            className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredContacts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No recruiter contacts found. Click "+ Add Recruiter Contact" to build your network.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* VIEW 2: AI EMAIL GENERATOR */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Configuration Panel */}
          <div className="lg:col-span-5 space-y-4">
            <Card variant="glass" padding="md" className="border border-white/10 space-y-4">
              <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Outreach Parameters</span>
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Select Outreach Template</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTemplateType('networking')}
                      className={`p-2 rounded-xl text-center border text-[11px] font-bold transition-all ${
                        templateType === 'networking'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      Networking / Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplateType('application')}
                      className={`p-2 rounded-xl text-center border text-[11px] font-bold transition-all ${
                        templateType === 'application'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      Direct Application
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplateType('thankyou')}
                      className={`p-2 rounded-xl text-center border text-[11px] font-bold transition-all ${
                        templateType === 'thankyou'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      Post-Interview
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Target Contact Name</label>
                  <Input
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Target Firm</label>
                    <Input
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      placeholder="e.g. Goldman Sachs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Target Role</label>
                    <Input
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. M&A Analyst"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Tone & Communication Style</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="professional" className="bg-slate-900">Professional & Balanced</option>
                    <option value="direct" className="bg-slate-900">Direct & High-Impact</option>
                    <option value="enthusiastic" className="bg-slate-900">Enthusiastic & High Energy</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Live Draft Panel */}
          <div className="lg:col-span-7 space-y-4">
            <Card variant="glass" padding="md" className="border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>Draft Output</span>
                </h3>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenReviewModal()}
                    className="text-xs font-bold shadow-md shadow-blue-500/20"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Send / Create Draft
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyEmail}
                    className="text-xs"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenMailto}
                    className="text-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    Mail Client
                  </Button>
                </div>
              </div>

              {/* Subject Line Bar */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 font-mono text-xs">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Subject:</span>
                <span className="text-white font-bold mt-0.5 block">{generatedEmail.subject}</span>
              </div>

              {/* Body Textarea */}
              <div className="relative">
                <textarea
                  readOnly
                  value={generatedEmail.body}
                  rows={14}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 font-mono text-xs text-slate-200 leading-relaxed focus:outline-none resize-none custom-scrollbar"
                />
              </div>

              {/* Bottom Quick Trigger */}
              <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs font-mono text-slate-400">
                <span>Candidate Profile: Meet Bansal (MSc Finance / ACCA)</span>
                <button
                  onClick={() => handleOpenReviewModal()}
                  className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Review Draft Before Dispatch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* OUTREACH REVIEW & CONFIRMATION MODAL (Human-in-the-Loop) */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <Card variant="glass" padding="lg" className="w-full max-w-2xl border border-white/20 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                    Outreach Review & Confirmation
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    Human-in-the-loop verification before creating Gmail draft or dispatching.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Candidate Identity Attribution Banner */}
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2 text-xs font-mono text-blue-300">
              <GraduationCap className="w-4 h-4 shrink-0 text-blue-400" />
              <span>Sent on behalf of Meet Bansal (MSc Finance / ACCA Affiliate)</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Recruiter Email (To:)</label>
                <Input
                  type="email"
                  placeholder="recruiter@company.com"
                  value={reviewTo}
                  onChange={(e) => setReviewTo(e.target.value)}
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Subject Line (Editable)</label>
                <Input
                  value={reviewSubject}
                  onChange={(e) => setReviewSubject(e.target.value)}
                  placeholder="Subject line..."
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Email Body (Editable Preview)</label>
                <textarea
                  rows={10}
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 resize-none leading-relaxed custom-scrollbar"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="text-xs font-mono text-slate-400 hover:text-white px-3 py-2"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyReviewText}
                  className="text-xs"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy to Clipboard
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={isSavingDraft}
                  onClick={handleSaveToGmailDrafts}
                  className="text-xs font-bold"
                >
                  {isSavingDraft ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                      Saving to Gmail...
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5 mr-1" />
                      Save to Gmail Drafts
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ADD/EDIT CONTACT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <Card variant="glass" padding="lg" className="w-full max-w-md border border-white/20 shadow-2xl">
            <h3 className="text-base font-bold font-mono text-white uppercase mb-4">
              {editingContact ? 'Edit Recruiter Contact' : 'Add Recruiter Contact'}
            </h3>

            <form onSubmit={handleSaveContact} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Contact Name *</label>
                <Input
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Company / Bank *</label>
                  <Input
                    required
                    placeholder="e.g. Goldman Sachs"
                    value={contactForm.company}
                    onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Role / Title</label>
                  <Input
                    placeholder="e.g. Campus Recruiter"
                    value={contactForm.role}
                    onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Email Address</label>
                  <Input
                    type="email"
                    placeholder="sarah@gs.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Status</label>
                  <select
                    value={contactForm.status}
                    onChange={(e) => setContactForm({ ...contactForm, status: e.target.value as ContactStatus })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Not Contacted" className="bg-slate-900">Not Contacted</option>
                    <option value="Sent" className="bg-slate-900">Sent</option>
                    <option value="Followed Up" className="bg-slate-900">Followed Up</option>
                    <option value="Replied" className="bg-slate-900">Replied</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">LinkedIn Profile URL</label>
                <Input
                  placeholder="https://linkedin.com/in/..."
                  value={contactForm.linkedin}
                  onChange={(e) => setContactForm({ ...contactForm, linkedin: e.target.value })}
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Notes & Follow-up Details</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Met at Durham careers fair, interested in M&A..."
                  value={contactForm.notes}
                  onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingContact ? 'Save Changes' : 'Add Contact'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ColdEmailSuite;
