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
import { useAuth } from '../../../context/AuthContext';
import { MailStudio } from './MailStudio';

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
  name: '[Your Name]',
  university: '[Your University]',
  degree: '[Your Degree/Major]',
  certifications: '[Your Key Specializations / Certifications]',
  skills: 'Financial Modeling, Valuations, Financial Analysis, Accounting',
  experience: 'Finance Trainee / Analyst'
};

const DEFAULT_CONTACTS: RecruiterContact[] = [
  {
    id: 'rec_1',
    name: '[Target Recruiter Name]',
    company: '[Company Name]',
    role: '[Target Role / Division]',
    email: 'recruiter@example.com',
    linkedin: 'https://linkedin.com/in/recruiter-profile',
    status: 'Not Contacted',
    notes: 'Initial recruiter outreach contact.',
    dateAdded: '2026-08-15'
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
  const [activeTab, setActiveTab] = useState<'crm' | 'generator' | 'studio'>('crm');
  const [studioInitialTo, setStudioInitialTo] = useState<string>('');
  const [studioInitialSubject, setStudioInitialSubject] = useState<string>('');
  const [studioInitialBody, setStudioInitialBody] = useState<string>('');
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
  const { user } = useAuth();
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Workspace User';

  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [templateType, setTemplateType] = useState<EmailTemplateType>('networking');
  const [targetName, setTargetName] = useState('[Target Recruiter Name]');
  const [targetCompany, setTargetCompany] = useState('[Company Name]');
  const [targetRole, setTargetRole] = useState('[Target Role / Division]');
  const [tone, setTone] = useState<'professional' | 'direct' | 'enthusiastic'>('professional');
  const [customAngle, setCustomAngle] = useState('Career inquiry and professional networking');

  // Sync AI generator inputs when a contact is selected
  const handleSelectContactForEmail = (c: RecruiterContact) => {
    setSelectedContactId(c.id);
    setTargetName(c.name);
    setTargetCompany(c.company);
    setTargetRole(c.role || '[Target Role / Division]');
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
    const name = targetName.trim() || '[Target Recruiter Name]';
    const recruiterSalutation = (name === '[Target Recruiter Name]' || name === '[Recruiter Name]')
      ? '[Recruiter Name]'
      : (name.split(' ')[0] || name);
    const company = targetCompany.trim() || '[Company Name]';
    const role = targetRole.trim() || '[Target Role / Division]';

    if (templateType === 'networking') {
      const companyName = company === '[Company Name]' ? '[Company Name]' : company;
      const firmSector = role === '[Target Role / Division]' ? '[Industry/Sector]' : company;
      return {
        subject: `[Your Degree/Title] - Career Inquiry & Coffee Chat - ${companyName}`,
        body: `Dear ${recruiterSalutation},

I hope this email finds you well.

My name is ${DEFAULT_CANDIDATE_PROFILE.name}, currently pursuing a ${DEFAULT_CANDIDATE_PROFILE.degree} at ${DEFAULT_CANDIDATE_PROFILE.university} with a background in ${DEFAULT_CANDIDATE_PROFILE.certifications}.

I have been closely following ${companyName}'s recent work in ${firmSector}, and I would be grateful for the opportunity to learn more about your team's focus.

Would you have 10–15 minutes for a brief introductory conversation in the coming weeks?

Best regards,

${DEFAULT_CANDIDATE_PROFILE.name}
[Your Phone] | [Your LinkedIn URL]`
      };
    } else if (templateType === 'application') {
      return {
        subject: `Application: ${role} - ${DEFAULT_CANDIDATE_PROFILE.name}`,
        body: `Dear ${recruiterSalutation},

I am writing to formally express my strong interest in the ${role} position at ${company}.

My name is ${DEFAULT_CANDIDATE_PROFILE.name}, currently pursuing a ${DEFAULT_CANDIDATE_PROFILE.degree} at ${DEFAULT_CANDIDATE_PROFILE.university} with a background in ${DEFAULT_CANDIDATE_PROFILE.certifications}.

I have attached my CV for your review and would welcome the opportunity to discuss how my skill set aligns with ${company}'s current initiatives.

Sincerely,

${DEFAULT_CANDIDATE_PROFILE.name}
[Your Phone] | [Your LinkedIn URL]`
      };
    } else {
      // Thank you email
      return {
        subject: `Thank You - Conversation regarding ${role} at ${company}`,
        body: `Dear ${recruiterSalutation},

Thank you very much for taking the time to speak with me regarding the ${role} opportunity at ${company}.

I truly enjoyed learning more about the team's ongoing projects and strategic goals.

Best regards,

${DEFAULT_CANDIDATE_PROFILE.name}
[Your Phone] | [Your LinkedIn URL]`
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
    const targetEmail = recipientEmail || contacts.find(c => c.id === selectedContactId)?.email || 'recruiter@example.com';
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

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to create draft');
        toast.success('Draft created in Gmail');
        setIsReviewModalOpen(false);
      } else {
        // Fallback if backend API is offline or returns plain text
        toast.info('Draft copied to clipboard (Gmail API offline)');
        navigator.clipboard.writeText(`Subject: ${reviewSubject}\n\n${reviewBody}`);
        setIsReviewModalOpen(false);
      }
    } catch (err: any) {
      // Fallback: Copy to clipboard and notify user
      navigator.clipboard.writeText(`Subject: ${reviewSubject}\n\n${reviewBody}`);
      toast.info('Copied email to clipboard');
      setIsReviewModalOpen(false);
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

  const handleEmailSentFromStudio = (to: string, subject: string, body: string) => {
    const existingIndex = contacts.findIndex(c => c.email.toLowerCase() === to.toLowerCase());
    const today = new Date().toISOString().split('T')[0];

    if (existingIndex >= 0) {
      const updated = [...contacts];
      updated[existingIndex] = {
        ...updated[existingIndex],
        status: 'Sent',
        lastContacted: today,
        notes: `Sent outreach via Mail Studio: "${subject}". Follow-up due in 3 days.`
      };
      setContacts(updated);
    } else {
      const newContact: RecruiterContact = {
        id: `rec_${Date.now()}`,
        name: to.split('@')[0] || 'Recruiter',
        company: 'Target Firm',
        role: 'Recruiter',
        email: to,
        status: 'Sent',
        notes: `Sent outreach via Mail Studio: "${subject}". Follow-up due in 3 days.`,
        dateAdded: today,
        lastContacted: today
      };
      setContacts([newContact, ...contacts]);
    }
    toast.success(`Logged email dispatch for ${to} in Outreach CRM (Follow-up due in 3 days).`);
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
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'studio' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5 inline mr-1.5 text-sky-300" />
            Mail Studio & Drafts
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
              <span className="font-bold text-white block">[Your Degree/Major] Candidate</span>
              <span className="text-[11px] text-slate-400">Integrated Credentials: [Your Key Specializations / Certifications]</span>
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
                    placeholder="e.g. Recruiter Name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Target Firm</label>
                    <Input
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      placeholder="e.g. Target Company"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Target Role</label>
                    <Input
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Financial Analyst / Software Engineer"
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

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const targetEmail = contacts.find(c => c.id === selectedContactId)?.email || 'recruiter@example.com';
                      setStudioInitialTo(targetEmail);
                      setStudioInitialSubject(generatedEmail.subject);
                      setStudioInitialBody(generatedEmail.body);
                      setActiveTab('studio');
                      toast.success('Loaded template into Mail Studio live draft editor!');
                    }}
                    className="text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    Open in In-App Editor
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenReviewModal()}
                    className="text-xs font-bold"
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
                <span>Candidate Profile: {userName}</span>
                <button
                  onClick={() => {
                    const targetEmail = contacts.find(c => c.id === selectedContactId)?.email || 'recruiter@example.com';
                    setStudioInitialTo(targetEmail);
                    setStudioInitialSubject(generatedEmail.subject);
                    setStudioInitialBody(generatedEmail.body);
                    setActiveTab('studio');
                  }}
                  className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Edit in Mail Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* VIEW 3: IN-APP MAIL STUDIO & LIVE DRAFTS */}
      {activeTab === 'studio' && (
        <MailStudio
          initialTo={studioInitialTo}
          initialSubject={studioInitialSubject}
          initialBody={studioInitialBody}
          onEmailSent={handleEmailSentFromStudio}
        />
      )}

      {/* OUTREACH REVIEW & CONFIRMATION MODAL (Human-in-the-Loop) */}
      {isReviewModalOpen && (
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden overscroll-contain">
          <Card variant="glass" padding="lg" className="w-full max-w-2xl border border-white/20 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto overscroll-contain custom-scrollbar">
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
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Candidate Identity Attribution Banner */}
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2 text-xs font-mono text-blue-300">
              <GraduationCap className="w-4 h-4 shrink-0 text-blue-400" />
              <span>Sent on behalf of {userName}</span>
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
                  placeholder="Career Inquiry - [Target Role] - [Company Name]"
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
                className="text-xs font-mono text-slate-400 hover:text-white px-3 py-2 cursor-pointer"
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
        <div data-lenis-prevent="true" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden overscroll-contain">
          <Card variant="glass" padding="lg" className="w-full max-w-md border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto overscroll-contain custom-scrollbar">
            <h3 className="text-base font-bold font-mono text-white uppercase mb-4">
              {editingContact ? 'Edit Recruiter Contact' : 'Add Recruiter Contact'}
            </h3>

            <form onSubmit={handleSaveContact} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Contact Name *</label>
                <Input
                  required
                  placeholder="e.g. Recruiter Name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Company / Organization *</label>
                  <Input
                    required
                    placeholder="e.g. Target Company"
                    value={contactForm.company}
                    onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Role / Title</label>
                  <Input
                    placeholder="e.g. Talent Acquisition / Recruiter"
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
                    placeholder="recruiter@company.com"
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
                  placeholder="e.g. Met at university careers fair, interested in M&A..."
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
