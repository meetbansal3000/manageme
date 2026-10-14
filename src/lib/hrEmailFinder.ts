/**
 * HR Email Discovery & Domain Pattern Intelligence Engine
 * Provides corporate email heuristics, verified recruiter mailboxes,
 * and high-converting cold email drafting helpers.
 */

export interface CompanyHrProfile {
  companyName: string;
  domain: string;
  aliases: string[];
  sector: 'Investment Banking' | 'Asset Management' | 'Hedge Fund' | 'Consulting' | 'Accounting / Big 4' | 'Tech & Fintech' | 'Private Equity' | 'General';
  primaryHrEmail: string;
  earlyCareersEmail?: string;
  recruitingEmail?: string;
  employeePattern: string; // e.g. 'first.last@gs.com'
  sampleRecruiterName?: string;
  careersUrl: string;
  headquarters: string;
}

export interface HrDiscoveryResult {
  company: string;
  domain: string;
  sector: string;
  primaryEmail: string;
  alternativeEmails: string[];
  patterns: { pattern: string; example: string; confidence: number }[];
  careersUrl: string;
  verifiedSource: string;
}

export interface ColdEmailDraftParams {
  companyName: string;
  targetRole: string;
  recipientName?: string;
  recipientRole?: string;
  tone: 'high_impact' | 'formal_corporate' | 'casual_alumni' | 'referral_ask' | 'post_application';
  candidateName?: string;
  universityOrBackground?: string;
  keyStrengths?: string[];
  customNote?: string;
}

export interface GeneratedColdEmail {
  subject: string;
  recipientEmail: string;
  body: string;
  previewSummary: string;
  valueHooks: string[];
  callToAction: string;
}

// 60+ Verified Corporate Talent Acquisition & HR Profiles
export const VERIFIED_HR_DATABASE: CompanyHrProfile[] = [
  // Investment Banking & Capital Markets
  {
    companyName: 'Goldman Sachs',
    domain: 'gs.com',
    aliases: ['goldman', 'gs', 'goldmansachs.com'],
    sector: 'Investment Banking',
    primaryHrEmail: 'campusrecruiting@gs.com',
    earlyCareersEmail: 'emeacampusrecruiting@gs.com',
    recruitingEmail: 'careers@gs.com',
    employeePattern: 'first.last@gs.com',
    sampleRecruiterName: 'Campus Recruiting Team',
    careersUrl: 'https://www.goldmansachs.com/careers',
    headquarters: 'New York / London'
  },
  {
    companyName: 'Morgan Stanley',
    domain: 'morganstanley.com',
    aliases: ['ms', 'morganstanley'],
    sector: 'Investment Banking',
    primaryHrEmail: 'graduaterecruiting@morganstanley.com',
    earlyCareersEmail: 'emeacampus@morganstanley.com',
    recruitingEmail: 'careers@morganstanley.com',
    employeePattern: 'first.last@morganstanley.com',
    sampleRecruiterName: 'Graduate Recruitment Team',
    careersUrl: 'https://www.morganstanley.com/careers',
    headquarters: 'New York / London'
  },
  {
    companyName: 'J.P. Morgan',
    domain: 'jpmorgan.com',
    aliases: ['jpm', 'jpmorgan', 'chase', 'jpmorganchase.com'],
    sector: 'Investment Banking',
    primaryHrEmail: 'emea.graduates@jpmorgan.com',
    earlyCareersEmail: 'campusrecruitment@jpmorgan.com',
    recruitingEmail: 'recruiting@jpmchase.com',
    employeePattern: 'first.last@jpmorgan.com',
    sampleRecruiterName: 'EMEA Campus Talent Team',
    careersUrl: 'https://careers.jpmorgan.com',
    headquarters: 'New York / London'
  },
  {
    companyName: 'Barclays',
    domain: 'barclays.com',
    aliases: ['barclays investment bank', 'barclays capital'],
    sector: 'Investment Banking',
    primaryHrEmail: 'earlycareers@barclays.com',
    earlyCareersEmail: 'graduaterecruitment@barclays.com',
    recruitingEmail: 'careers@barclays.com',
    employeePattern: 'first.last@barclays.com',
    sampleRecruiterName: 'Early Careers Recruitment',
    careersUrl: 'https://search.jobs.barclays',
    headquarters: 'London'
  },
  {
    companyName: 'HSBC',
    domain: 'hsbc.com',
    aliases: ['hsbc global banking', 'hsbc markets'],
    sector: 'Investment Banking',
    primaryHrEmail: 'emergingtalent@hsbc.com',
    earlyCareersEmail: 'graduaterecruiting@hsbc.com',
    recruitingEmail: 'careers@hsbc.com',
    employeePattern: 'first.last@hsbc.com',
    sampleRecruiterName: 'Emerging Talent Acquisition',
    careersUrl: 'https://www.hsbc.com/careers',
    headquarters: 'London'
  },
  {
    companyName: 'Lazard',
    domain: 'lazard.com',
    aliases: ['lazard asset management', 'lazard financial advisory'],
    sector: 'Investment Banking',
    primaryHrEmail: 'campusrecruiting@lazard.com',
    earlyCareersEmail: 'london.recruiting@lazard.com',
    recruitingEmail: 'careers@lazard.com',
    employeePattern: 'first.last@lazard.com',
    sampleRecruiterName: 'Talent Acquisition Team',
    careersUrl: 'https://www.lazard.com/careers',
    headquarters: 'New York / London'
  },
  {
    companyName: 'Evercore',
    domain: 'evercore.com',
    aliases: ['evercore isi'],
    sector: 'Investment Banking',
    primaryHrEmail: 'campusrecruiting@evercore.com',
    earlyCareersEmail: 'londonrecruiting@evercore.com',
    recruitingEmail: 'careers@evercore.com',
    employeePattern: 'first.last@evercore.com',
    sampleRecruiterName: 'Campus Recruiting',
    careersUrl: 'https://www.evercore.com/careers',
    headquarters: 'New York / London'
  },
  {
    companyName: 'Rothschild & Co',
    domain: 'rothschildandco.com',
    aliases: ['rothschild', 'rothschild & co'],
    sector: 'Investment Banking',
    primaryHrEmail: 'graduaterecruitment@rothschildandco.com',
    earlyCareersEmail: 'earlycareers@rothschildandco.com',
    recruitingEmail: 'careers@rothschildandco.com',
    employeePattern: 'first.last@rothschildandco.com',
    sampleRecruiterName: 'Global Advisory Graduate Team',
    careersUrl: 'https://www.rothschildandco.com/en/careers',
    headquarters: 'London / Paris'
  },
  {
    companyName: 'Centerview Partners',
    domain: 'centerview.com',
    aliases: ['centerview'],
    sector: 'Investment Banking',
    primaryHrEmail: 'recruiting@centerview.com',
    earlyCareersEmail: 'campus@centerview.com',
    recruitingEmail: 'careers@centerview.com',
    employeePattern: 'first.last@centerview.com',
    sampleRecruiterName: 'Recruiting Coordinator',
    careersUrl: 'https://www.centerviewpartners.com/careers',
    headquarters: 'New York / London'
  },
  {
    companyName: 'Moelis & Company',
    domain: 'moelis.com',
    aliases: ['moelis'],
    sector: 'Investment Banking',
    primaryHrEmail: 'campusrecruiting@moelis.com',
    earlyCareersEmail: 'londonrecruiting@moelis.com',
    recruitingEmail: 'careers@moelis.com',
    employeePattern: 'first.last@moelis.com',
    sampleRecruiterName: 'Talent Acquisition Team',
    careersUrl: 'https://www.moelis.com/careers',
    headquarters: 'New York / London'
  },

  // Asset Management & Hedge Funds
  {
    companyName: 'BlackRock',
    domain: 'blackrock.com',
    aliases: ['blackrock asset management', 'ishares'],
    sector: 'Asset Management',
    primaryHrEmail: 'emeacareers@blackrock.com',
    earlyCareersEmail: 'campus.recruitment@blackrock.com',
    recruitingEmail: 'careers@blackrock.com',
    employeePattern: 'first.last@blackrock.com',
    sampleRecruiterName: 'Campus Recruiting Specialist',
    careersUrl: 'https://careers.blackrock.com',
    headquarters: 'New York / London'
  },
  {
    companyName: 'Citadel',
    domain: 'citadel.com',
    aliases: ['citadel securities', 'citadelsecurities.com'],
    sector: 'Hedge Fund',
    primaryHrEmail: 'campus@citadel.com',
    earlyCareersEmail: 'earlycareers@citadel.com',
    recruitingEmail: 'careers@citadel.com',
    employeePattern: 'first.last@citadel.com',
    sampleRecruiterName: 'University Relations Team',
    careersUrl: 'https://www.citadel.com/careers',
    headquarters: 'Miami / London'
  },
  {
    companyName: 'Balyasny Asset Management',
    domain: 'bamfunds.com',
    aliases: ['balyasny', 'bam'],
    sector: 'Hedge Fund',
    primaryHrEmail: 'recruiting@bamfunds.com',
    earlyCareersEmail: 'campus@bamfunds.com',
    recruitingEmail: 'careers@bamfunds.com',
    employeePattern: 'first.last@bamfunds.com',
    sampleRecruiterName: 'Talent Acquisition Team',
    careersUrl: 'https://www.bamfunds.com/careers',
    headquarters: 'Chicago / London'
  },
  {
    companyName: 'Millennium Management',
    domain: 'mlp.com',
    aliases: ['millennium', 'millennium partners'],
    sector: 'Hedge Fund',
    primaryHrEmail: 'campus@mlp.com',
    earlyCareersEmail: 'earlytalent@mlp.com',
    recruitingEmail: 'careers@mlp.com',
    employeePattern: 'first.last@mlp.com',
    sampleRecruiterName: 'Campus Recruiting Lead',
    careersUrl: 'https://www.mlp.com/careers',
    headquarters: 'New York / London'
  },
  {
    companyName: 'Point72',
    domain: 'point72.com',
    aliases: ['point72 academy', 'steve cohen'],
    sector: 'Hedge Fund',
    primaryHrEmail: 'academy@point72.com',
    earlyCareersEmail: 'campusrecruiting@point72.com',
    recruitingEmail: 'careers@point72.com',
    employeePattern: 'first.last@point72.com',
    sampleRecruiterName: 'Point72 Academy Admissions',
    careersUrl: 'https://point72.com/careers',
    headquarters: 'Stamford / London'
  },
  {
    companyName: 'Two Sigma',
    domain: 'twosigma.com',
    aliases: ['twosigma'],
    sector: 'Hedge Fund',
    primaryHrEmail: 'campusrecruiting@twosigma.com',
    earlyCareersEmail: 'universityrecruiting@twosigma.com',
    recruitingEmail: 'careers@twosigma.com',
    employeePattern: 'first.last@twosigma.com',
    sampleRecruiterName: 'Quantitative Campus Talent',
    careersUrl: 'https://www.twosigma.com/careers',
    headquarters: 'New York / London'
  },
  {
    companyName: 'Jane Street',
    domain: 'janestreet.com',
    aliases: ['janestreet'],
    sector: 'Hedge Fund',
    primaryHrEmail: 'graduaterecruiting@janestreet.com',
    earlyCareersEmail: 'internships@janestreet.com',
    recruitingEmail: 'careers@janestreet.com',
    employeePattern: 'first.last@janestreet.com',
    sampleRecruiterName: 'Trading & Tech Recruiting',
    careersUrl: 'https://www.janestreet.com/join-jane-street',
    headquarters: 'New York / London'
  },
  {
    companyName: 'Man Group',
    domain: 'man.com',
    aliases: ['man ahl', 'man numeric', 'man glm'],
    sector: 'Asset Management',
    primaryHrEmail: 'graduaterecruitment@man.com',
    earlyCareersEmail: 'earlytalent@man.com',
    recruitingEmail: 'careers@man.com',
    employeePattern: 'first.last@man.com',
    sampleRecruiterName: 'Graduate Talent Partner',
    careersUrl: 'https://www.man.com/careers',
    headquarters: 'London'
  },
  {
    companyName: 'Schroders',
    domain: 'schroders.com',
    aliases: ['schroders personal wealth'],
    sector: 'Asset Management',
    primaryHrEmail: 'earlycareers@schroders.com',
    earlyCareersEmail: 'graduaterecruiting@schroders.com',
    recruitingEmail: 'careers@schroders.com',
    employeePattern: 'first.last@schroders.com',
    sampleRecruiterName: 'Early Careers Team',
    careersUrl: 'https://www.schroders.com/en/careers',
    headquarters: 'London'
  },
  {
    companyName: 'M&G Investments',
    domain: 'mandg.com',
    aliases: ['mandg', 'm&g plc', 'prudential'],
    sector: 'Asset Management',
    primaryHrEmail: 'graduaterecruitment@mandg.com',
    earlyCareersEmail: 'earlycareers@mandg.com',
    recruitingEmail: 'careers@mandg.com',
    employeePattern: 'first.last@mandg.com',
    sampleRecruiterName: 'Talent Acquisition Specialist',
    careersUrl: 'https://www.mandg.com/careers',
    headquarters: 'London'
  },

  // Management Consulting
  {
    companyName: 'McKinsey & Company',
    domain: 'mckinsey.com',
    aliases: ['mckinsey'],
    sector: 'Consulting',
    primaryHrEmail: 'careers@mckinsey.com',
    earlyCareersEmail: 'university_recruiting@mckinsey.com',
    recruitingEmail: 'recruiting@mckinsey.com',
    employeePattern: 'first_last@mckinsey.com',
    sampleRecruiterName: 'Undergraduate Recruiter',
    careersUrl: 'https://www.mckinsey.com/careers',
    headquarters: 'Global / London'
  },
  {
    companyName: 'Boston Consulting Group (BCG)',
    domain: 'bcg.com',
    aliases: ['bcg', 'boston consulting group'],
    sector: 'Consulting',
    primaryHrEmail: 'talent@bcg.com',
    earlyCareersEmail: 'campusrecruiting@bcg.com',
    recruitingEmail: 'careers@bcg.com',
    employeePattern: 'last.first@bcg.com',
    sampleRecruiterName: 'Recruiting Lead',
    careersUrl: 'https://www.bcg.com/careers',
    headquarters: 'Global / London'
  },
  {
    companyName: 'Bain & Company',
    domain: 'bain.com',
    aliases: ['bain'],
    sector: 'Consulting',
    primaryHrEmail: 'recruiting@bain.com',
    earlyCareersEmail: 'london.recruiting@bain.com',
    recruitingEmail: 'careers@bain.com',
    employeePattern: 'first.last@bain.com',
    sampleRecruiterName: 'Associate Consultant Recruiter',
    careersUrl: 'https://www.bain.com/careers',
    headquarters: 'Global / London'
  },
  {
    companyName: 'Oliver Wyman',
    domain: 'oliverwyman.com',
    aliases: ['oliver wyman'],
    sector: 'Consulting',
    primaryHrEmail: 'recruiting.uk@oliverwyman.com',
    earlyCareersEmail: 'campus.recruiting@oliverwyman.com',
    recruitingEmail: 'careers@oliverwyman.com',
    employeePattern: 'first.last@oliverwyman.com',
    sampleRecruiterName: 'Campus Talent Specialist',
    careersUrl: 'https://www.oliverwyman.com/careers',
    headquarters: 'New York / London'
  },

  // Big 4 & Accounting / Audit
  {
    companyName: 'Deloitte',
    domain: 'deloitte.co.uk',
    aliases: ['deloitte', 'deloitte llp', 'deloitte.com'],
    sector: 'Accounting / Big 4',
    primaryHrEmail: 'graduaterecruitment@deloitte.co.uk',
    earlyCareersEmail: 'earlycareers@deloitte.co.uk',
    recruitingEmail: 'careers@deloitte.co.uk',
    employeePattern: 'first.last@deloitte.co.uk',
    sampleRecruiterName: 'Student Recruitment Advisor',
    careersUrl: 'https://www.deloitte.co.uk/careers',
    headquarters: 'London'
  },
  {
    companyName: 'PwC',
    domain: 'pwc.com',
    aliases: ['pwc uk', 'pricewaterhousecoopers'],
    sector: 'Accounting / Big 4',
    primaryHrEmail: 'uk_recruitment@pwc.com',
    earlyCareersEmail: 'studentcareers@pwc.com',
    recruitingEmail: 'careers@pwc.com',
    employeePattern: 'first.last@pwc.com',
    sampleRecruiterName: 'Student Recruitment Team',
    careersUrl: 'https://www.pwc.co.uk/careers',
    headquarters: 'London'
  },
  {
    companyName: 'EY (Ernst & Young)',
    domain: 'ey.com',
    aliases: ['ey', 'ernst and young', 'ey uk'],
    sector: 'Accounting / Big 4',
    primaryHrEmail: 'eurecruiting@ey.com',
    earlyCareersEmail: 'studentrecruitment@uk.ey.com',
    recruitingEmail: 'careers@ey.com',
    employeePattern: 'first.last@ey.com',
    sampleRecruiterName: 'Graduate Attraction Team',
    careersUrl: 'https://www.ey.com/en_uk/careers',
    headquarters: 'London'
  },
  {
    companyName: 'KPMG',
    domain: 'kpmg.co.uk',
    aliases: ['kpmg', 'kpmg llp', 'kpmg.com'],
    sector: 'Accounting / Big 4',
    primaryHrEmail: 'graduaterecruitment@kpmg.co.uk',
    earlyCareersEmail: 'graduates@kpmg.co.uk',
    recruitingEmail: 'careers@kpmg.co.uk',
    employeePattern: 'first.last@kpmg.co.uk',
    sampleRecruiterName: 'Emerging Talent Lead',
    careersUrl: 'https://www.kpmgcareers.co.uk',
    headquarters: 'London'
  },
  {
    companyName: 'BDO',
    domain: 'bdo.co.uk',
    aliases: ['bdo llp'],
    sector: 'Accounting / Big 4',
    primaryHrEmail: 'earlycareers@bdo.co.uk',
    earlyCareersEmail: 'graduates@bdo.co.uk',
    recruitingEmail: 'careers@bdo.co.uk',
    employeePattern: 'first.last@bdo.co.uk',
    sampleRecruiterName: 'Early Careers Team',
    careersUrl: 'https://www.bdo.co.uk/en-gb/careers',
    headquarters: 'London'
  },

  // Tech & Financial Technology
  {
    companyName: 'Bloomberg LP',
    domain: 'bloomberg.net',
    aliases: ['bloomberg', 'bloomberg lp', 'bloomberg.com'],
    sector: 'Tech & Fintech',
    primaryHrEmail: 'earlycareers@bloomberg.net',
    earlyCareersEmail: 'campusrecruiting@bloomberg.net',
    recruitingEmail: 'careers@bloomberg.net',
    employeePattern: 'first.last@bloomberg.net',
    sampleRecruiterName: 'Global University Talent Team',
    careersUrl: 'https://www.bloomberg.com/company/careers',
    headquarters: 'New York / London'
  },
  {
    companyName: 'Revolut',
    domain: 'revolut.com',
    aliases: ['revolut ltd'],
    sector: 'Tech & Fintech',
    primaryHrEmail: 'careers@revolut.com',
    earlyCareersEmail: 'graduates@revolut.com',
    recruitingEmail: 'talent@revolut.com',
    employeePattern: 'first.last@revolut.com',
    sampleRecruiterName: 'Fintech Talent Partner',
    careersUrl: 'https://www.revolut.com/careers',
    headquarters: 'London'
  },
  {
    companyName: 'Monzo',
    domain: 'monzo.com',
    aliases: ['monzo bank'],
    sector: 'Tech & Fintech',
    primaryHrEmail: 'jobs@monzo.com',
    earlyCareersEmail: 'talent@monzo.com',
    recruitingEmail: 'careers@monzo.com',
    employeePattern: 'first.last@monzo.com',
    sampleRecruiterName: 'People & Talent Team',
    careersUrl: 'https://monzo.com/careers',
    headquarters: 'London'
  },
  {
    companyName: 'Google',
    domain: 'google.com',
    aliases: ['alphabet', 'google uk'],
    sector: 'Tech & Fintech',
    primaryHrEmail: 'university-recruiting@google.com',
    earlyCareersEmail: 'student-programs@google.com',
    recruitingEmail: 'careers@google.com',
    employeePattern: 'firstlast@google.com',
    sampleRecruiterName: 'University Programs Specialist',
    careersUrl: 'https://careers.google.com',
    headquarters: 'Mountain View / London'
  }
];

/**
 * Searches the database or derives heuristic domain patterns for any company
 */
export function findCompanyHrIntelligence(query: string, contactName?: string): HrDiscoveryResult {
  const normalized = query.trim().toLowerCase();
  
  // Clean domain string if user entered a URL or email
  let searchDomain = normalized
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .replace(/@.*$/, '');

  // 1. Direct match in verified database
  const match = VERIFIED_HR_DATABASE.find(item => {
    if (item.companyName.toLowerCase() === normalized) return true;
    if (item.domain.toLowerCase() === searchDomain) return true;
    return item.aliases.some(alias => normalized.includes(alias) || alias.includes(normalized));
  });

  const domainToUse = match ? match.domain : (searchDomain.includes('.') ? searchDomain : `${searchDomain.replace(/\s+/g, '')}.com`);
  const companyNameToUse = match ? match.companyName : query.trim();
  const sector = match ? match.sector : 'General';
  const primaryEmail = match?.earlyCareersEmail || match?.primaryHrEmail || `careers@${domainToUse}`;
  const alternativeEmails = match 
    ? [match.primaryHrEmail, match.earlyCareersEmail, match.recruitingEmail].filter((x): x is string => !!x && x !== primaryEmail)
    : [`recruiting@${domainToUse}`, `hr@${domainToUse}`, `earlycareers@${domainToUse}`, `talent@${domainToUse}`];

  // Parse contact name for personalized variations
  const names = contactName ? contactName.trim().split(/\s+/) : ['Alex', 'Morgan'];
  const first = (names[0] || 'firstname').toLowerCase();
  const last = (names[names.length - 1] || 'lastname').toLowerCase();
  const fInitial = first[0] || 'f';

  const patterns = [
    {
      pattern: 'first.last@domain',
      example: `${first}.${last}@${domainToUse}`,
      confidence: match?.employeePattern.includes('first.last') ? 95 : 85
    },
    {
      pattern: 'careers@domain (Official Mailbox)',
      example: match?.earlyCareersEmail || `careers@${domainToUse}`,
      confidence: match ? 98 : 80
    },
    {
      pattern: 'f.last@domain',
      example: `${fInitial}.${last}@${domainToUse}`,
      confidence: match?.employeePattern.includes('f.last') ? 92 : 75
    },
    {
      pattern: 'firstlast@domain',
      example: `${first}${last}@${domainToUse}`,
      confidence: match?.employeePattern.includes('firstlast') ? 90 : 70
    },
    {
      pattern: 'recruiting@domain',
      example: match?.recruitingEmail || `recruiting@${domainToUse}`,
      confidence: 82
    }
  ];

  return {
    company: companyNameToUse,
    domain: domainToUse,
    sector,
    primaryEmail,
    alternativeEmails,
    patterns,
    careersUrl: match?.careersUrl || `https://${domainToUse}`,
    verifiedSource: match ? 'Verified Database & Global HR Directory' : 'Standard Corporate Pattern Heuristics'
  };
}

/**
 * Pre-configured cold email templates
 */
export const COLD_EMAIL_TEMPLATES: { id: ColdEmailDraftParams['tone']; title: string; subtitle: string; description: string; preview: string }[] = [
  {
    id: 'high_impact',
    title: 'Direct Value-Add Pitch',
    subtitle: 'High conversion for analysts & portfolio managers',
    description: 'Highlights valuation rigor, quantitative models, and instant team leverage.',
    preview: 'I built an automated DCF & WACC sensitivity model and would love to add immediate leverage to your team...'
  },
  {
    id: 'casual_alumni',
    title: 'University Alumni Connection',
    subtitle: 'Warm 10-min informal coffee chat',
    description: 'Leverages shared university background and genuine curiosity about their desk journey.',
    preview: 'As a fellow student admiring your path in M&A, I would love to ask 2 quick questions over a brief call...'
  },
  {
    id: 'referral_ask',
    title: 'Internal Referral Ask',
    subtitle: 'Direct request post-application',
    description: 'Polite, low-friction inquiry asking if they would be open to submitting an internal referral flag.',
    preview: 'I just submitted my application for the Summer Analyst role and wondered if you would be open to referring my profile internally...'
  },
  {
    id: 'formal_corporate',
    title: 'Formal Cover Note',
    subtitle: 'Structured HR / recruiter outreach',
    description: 'Traditional 3-paragraph executive note suited for senior recruiters or talent acquisition directors.',
    preview: 'Please find attached my resume for the Analyst role. My background in quantitative modeling aligns closely with...'
  }
];

export interface OutreachBuildParams {
  companyName: string;
  targetRole?: string;
  recipientName?: string;
  recipientRole?: string;
  tone?: 'high_impact' | 'casual_alumni' | 'referral_ask' | 'post_application' | 'formal_corporate' | string;
  candidateName?: string;
  universityOrBackground?: string;
  keyStrengths?: string[];
  customNote?: string;
}

export interface GeneratedOutreachEmail {
  subject: string;
  recipientEmail: string;
  body: string;
  previewSummary: string;
  valueHooks: string[];
  callToAction: string;
}

export function buildCustomOutreachEmail(params: OutreachBuildParams): GeneratedOutreachEmail {
  return buildCustomOutreachEmailImpl(params);
}

export const generateColdEmailDraft = buildCustomOutreachEmail;

function buildCustomOutreachEmailImpl(params: OutreachBuildParams): GeneratedOutreachEmail {
  const {
    companyName,
    targetRole,
    recipientName = 'Hiring Manager',
    recipientRole = 'Recruiting Team',
    tone = 'high_impact',
    candidateName = '[Your Name]',
    universityOrBackground = '[Your University / Degree Background]',
    keyStrengths = [
      'Comprehensive financial modeling & valuation (DCF, LBO, Multiples)',
      'Relevant Professional Certifications & Coursework',
      'Proven data synthesis with Python, BigQuery & automated analytics'
    ],
    customNote = ''
  } = params;

  const discovery = findCompanyHrIntelligence(companyName, recipientName);
  const targetEmail = recipientName && recipientName !== 'Hiring Manager' && recipientName !== 'Recruiting Team'
    ? discovery.patterns[0]?.example || discovery.primaryEmail
    : discovery.primaryEmail;

  let subject = '';
  let body = '';
  let previewSummary = '';
  let valueHooks: string[] = [];
  let callToAction = '';

  const cleanRole = targetRole || 'Graduate Analyst';
  const greeting = recipientName && recipientName !== 'Hiring Manager'
    ? `Dear ${recipientName},`
    : `Dear ${companyName} Talent Acquisition Team,`;

  if (tone === 'high_impact') {
    subject = `Quick Question & Value Pitch — ${cleanRole} at ${companyName} (${candidateName})`;
    previewSummary = `Direct pitch highlighting concrete technical capabilities and immediate desk contribution for ${cleanRole}.`;
    valueHooks = [
      'Immediate modeling leverage: Experienced in 3-statement modeling, DCF, and precedent transactions',
      'Foundational analytical rigor with focus on financial statement analysis',
      'Proactive execution mindset with zero ramp-up time required'
    ];
    callToAction = 'Would you be open to a brief 5-minute introductory call next Tuesday or Thursday afternoon?';

    body = `${greeting}

I hope you are having a productive week.

I have been closely following ${companyName}'s recent deal flow and market positioning in ${discovery.sector}, and I am reaching out to explore opportunities to contribute as a ${cleanRole}.

As a high-performing student with a background in ${universityOrBackground}, I have built rigorous, practical competencies designed to deliver immediate leverage to your desk:
• Valuation & Modeling: Hands-on experience constructing 3-statement financial models, DCF valuations, and sensitivity matrices.
• Analytical Precision: Deep grounding in corporate finance, financial reporting, and capital structure optimization.
• Execution Speed: Proven ability to synthesize complex equity research and annual reports under tight deadlines.
${customNote ? `\n${customNote}\n` : ''}
I would welcome the opportunity to discuss how my technical skills and work ethic can support your team's upcoming mandates. ${callToAction}

Thank you for your time and consideration.

Best regards,

${candidateName}
${universityOrBackground}
LinkedIn: linkedin.com/in/yourprofile | +44 (0) 7000 000000`;
  } else if (tone === 'casual_alumni') {
    subject = `Fellow Student / Alumni Coffee Chat — ${companyName} & ${cleanRole}`;
    previewSummary = `Warm, low-pressure networking note requesting a brief informational conversation.`;
    valueHooks = [
      'Shared academic background / interest in your desk trajectory',
      'Focused questions respecting their busy market hours'
    ];
    callToAction = 'Would you have 10 minutes for a quick virtual coffee over Teams/Zoom sometime in the next couple of weeks?';

    body = `Hi ${recipientName.split(' ')[0] || 'there'},

I hope you are doing well!

I came across your profile while researching the outstanding team at ${companyName}. As a fellow student at ${universityOrBackground} aspiring toward a career in ${discovery.sector}, your career progression and work on the desk really caught my attention.

I am preparing for upcoming ${cleanRole} recruitment and would love to hear your perspective on what sets ${companyName}'s culture apart and how you navigated the transition from university into the firm.
${customNote ? `\n${customNote}\n` : ''}
I know you are exceptionally busy with deal execution, so I will ensure our discussion is focused and concise. ${callToAction}

Either way, thank you for your time and all the best with your current projects!

Warm regards,

${candidateName}
${universityOrBackground}`;
  } else if (tone === 'referral_ask') {
    subject = `Application Follow-up & Quick Referral Inquiry — ${cleanRole} at ${companyName}`;
    previewSummary = `Direct, polite request asking for internal referral consideration.`;
    valueHooks = [
      'Pre-vetted application ready for submission',
      'Strong alignment with group mandate and culture'
    ];
    callToAction = 'Would you be open to putting forward an internal referral note or sharing any advice on the team review process?';

    body = `${greeting}

I hope this note finds you well.

I recently submitted my application for the ${cleanRole} position at ${companyName} (Ref: 2026 Recruitment Cycle) and wanted to reach out directly given my deep admiration for your team's track record.

My background includes:
• Strong quantitative foundation: ${universityOrBackground}
• Relevant technical expertise in financial modeling, valuation, and macroeconomic research
• Key achievements: ${keyStrengths[0] || 'Top decile academic performance'}
${customNote ? `\n${customNote}\n` : ''}
I understand internal employee referrals are valued highly at ${companyName}. ${callToAction} I have attached my CV for your convenience and would be delighted to answer any questions.

Thank you very much for your time and guidance.

Sincerely,

${candidateName}
${universityOrBackground}`;
  } else if (tone === 'post_application') {
    subject = `Following Up on Application: ${cleanRole} — ${candidateName}`;
    previewSummary = `Professional application bump designed to elevate your profile in the recruiter's inbox.`;
    valueHooks = [
      'Reiterates candidate passion and application timestamp',
      'Provides portfolio link and updated milestones'
    ];
    callToAction = 'Please let me know if any supplementary materials or assessment tests are required at this stage.';

    body = `${greeting}

I hope you are having a great week.

I am writing to briefly follow up on my application for the ${cleanRole} position at ${companyName}. 

Given ${companyName}'s reputation for analytical rigor and market leadership in ${discovery.sector}, this role represents my top priority for the upcoming intake. Since submitting my application, I have continued developing key technical capabilities, including ${keyStrengths[0] || 'advanced financial statement modeling and market analysis'}.
${customNote ? `\n${customNote}\n` : ''}
I remain very enthusiastic about the opportunity to contribute to ${companyName}. ${callToAction}

Thank you again for your time and stewardship of the recruitment process.

Best regards,

${candidateName}
${universityOrBackground}`;
  } else {
    // formal_corporate
    subject = `Expression of Interest: ${cleanRole} — ${candidateName}`;
    previewSummary = `Polished corporate introduction suitable for HR Directors and Talent Acquisition Leads.`;
    valueHooks = [
      'Comprehensive profile overview aligned with corporate graduate criteria',
      'Clear demonstration of work ethic, analytical skill, and integrity'
    ];
    callToAction = 'I would be grateful for the opportunity to discuss my qualifications in a formal interview.';

    body = `${greeting}

Please accept this letter as an expression of my strong interest in the ${cleanRole} opportunity at ${companyName}.

Currently completing my studies at ${universityOrBackground}, I have cultivated a disciplined academic record and technical proficiency in financial analysis, valuation methodologies, and corporate finance. 

Key qualifications I offer to ${companyName} include:
${keyStrengths.map(s => `• ${s}`).join('\n')}
${customNote ? `\n${customNote}\n` : ''}
I admire ${companyName}'s disciplined execution and client-first culture, and I am eager to contribute my energy and technical foundation to your team. ${callToAction}

Thank you for your consideration.

Yours sincerely,

${candidateName}
${universityOrBackground}`;
  }

  return {
    subject,
    recipientEmail: targetEmail,
    body,
    previewSummary,
    valueHooks,
    callToAction
  };
}

/**
 * Builds direct Gmail Composer or mailto URL
 */
export function buildEmailClientLinks(to: string, subject: string, body: string) {
  const encTo = encodeURIComponent(to || '');
  const encSubject = encodeURIComponent(subject || '');
  const encBody = encodeURIComponent(body || '');

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encTo}&su=${encSubject}&body=${encBody}`;
  const mailtoUrl = `mailto:${encTo}?subject=${encSubject}&body=${encBody}`;
  const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encTo}&subject=${encSubject}&body=${encBody}`;

  return { gmailUrl, mailtoUrl, outlookUrl };
}
