// End-to-End Annual Report Fetching, Storage & Grounding Pipeline

export interface AnnualReportDoc {
  id: string;
  name: string;
  size: string;
  type: string;
  company: string;
  year: string;
  ticker?: string;
  sourceUrl?: string;
  content: string;
  keyMetrics?: {
    revenue?: string;
    netIncome?: string;
    freeCashFlow?: string;
    grossMargin?: string;
    operatingMargin?: string;
    eps?: string;
  };
  fetchedAt?: string;
}

export interface AnalysisSuiteResult {
  title: string;
  actionType: 'balance_sheet' | 'ceo_letter' | 'risk_factors' | 'variance_analysis';
  summary: string;
  bulletPoints: string[];
  tables?: { headers: string[]; rows: string[][] }[];
  keyTakeaways?: string[];
  riskMatrix?: { factor: string; severity: 'High' | 'Medium' | 'Low'; impact: string }[];
}

/**
 * Detects whether a string query is a command to fetch an annual report
 */
export function isAnnualReportFetchCommand(query: string): { isMatch: boolean; company: string; year: string } {
  if (!query || typeof query !== 'string') return { isMatch: false, company: '', year: '' };

  const normalized = query.trim();

  // 1. Direct patterns like: download Tesla annual report / fetch Apple 2025 10-K / get Microsoft 2024 annual report
  const directPattern = /^(?:please\s+)?(?:download|fetch|get|pull|search|find|analyze|open|load)\s+(?:the\s+)?([a-zA-Z0-9\.\&\-\s]+?)(?:\s+(?:for\s+)?(\d{4}))?\s*(?:annual\s*report|10-?k|financial\s*statement|filing|10k)/i;
  const directMatch = normalized.match(directPattern);

  if (directMatch) {
    let company = (directMatch[1] || '').trim();
    // Clean company of trailing or leading keywords
    company = company.replace(/^(the|for)\s+/i, '').replace(/\s+(for|in|from)$/i, '').trim();
    const year = directMatch[2] || new Date().getFullYear().toString();
    if (company.length >= 2) {
      return { isMatch: true, company, year };
    }
  }

  // 2. Pattern with keywords anywhere: e.g. "Tesla 2025 annual report" or "Nvidia 10-K"
  const generalPattern = /([a-zA-Z0-9\.\&\-\s]+?)\s*(\d{4})?\s*(?:annual\s*report|10-?k|10k|financial\s*filing|financial\s*statement)/i;
  const generalMatch = normalized.match(generalPattern);

  if (generalMatch) {
    let company = (generalMatch[1] || '').trim();
    company = company.replace(/^(download|fetch|get|pull|search|find|analyze|open|load|the|for|please)\s+/gi, '').trim();
    company = company.replace(/\s+(for|in|from)$/i, '').trim();
    const year = generalMatch[2] || new Date().getFullYear().toString();
    if (company.length >= 2 && !/^(download|fetch|get|pull|annual|report)$/i.test(company)) {
      return { isMatch: true, company, year };
    }
  }

  // 3. Fallback check if query explicitly mentions both 'annual report' or '10k' and a company
  const containsKeywords = /(annual\s*report|10-?k|10k)/i.test(normalized);
  if (containsKeywords) {
    const parts = normalized.replace(/(download|fetch|get|pull|search|find|annual\s*report|10-?k|10k|financial\s*statement|filing|the|please|for)/gi, '').trim();
    const yearMatch = normalized.match(/\b(20\d{2})\b/);
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
    const company = parts.replace(/\b(20\d{2})\b/, '').trim() || 'Target Company';
    if (company.length >= 2) {
      return { isMatch: true, company, year };
    }
  }

  return { isMatch: false, company: '', year: '' };
}

/**
 * Fetches official 10-K / Annual Report from backend pipeline
 */
export async function fetchAnnualReport(company: string, year: string = '2025'): Promise<AnnualReportDoc> {
  const response = await fetch('/api/fetch-annual-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company, year })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch official Annual Report');
  }

  const data = await response.json();
  if (!data.success || !data.doc) {
    throw new Error('Invalid annual report data received from pipeline');
  }

  return data.doc;
}

/**
 * Executes a one-click financial analysis suite command on an Annual Report context
 */
export async function analyzeAnnualReportSuite(
  docContent: string,
  actionType: 'balance_sheet' | 'ceo_letter' | 'risk_factors' | 'variance_analysis'
): Promise<AnalysisSuiteResult> {
  const response = await fetch('/api/analyze-annual-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ docContent, actionType })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to execute financial analysis suite');
  }

  const data = await response.json();
  return data.result;
}

/**
 * Helper to link a newly fetched report into user data & local active grounding context
 */
export function saveAndGroundAnnualReport(
  doc: AnnualReportDoc,
  userData: any,
  updateData?: (data: any) => void
) {
  const existingDocs = userData?.studyDocs || [];
  // Check if doc already exists by id
  const alreadyExists = existingDocs.some((d: any) => d.id === doc.id);

  const updatedDocs = alreadyExists
    ? existingDocs.map((d: any) => (d.id === doc.id ? doc : d))
    : [doc, ...existingDocs];

  let updatedNotebooks = userData?.notebooks ? [...userData.notebooks] : [];
  if (updatedNotebooks.length > 0 && userData?.activeNotebookId) {
    updatedNotebooks = updatedNotebooks.map((nb: any) => {
      if (nb.id === userData.activeNotebookId && !nb.docIds.includes(doc.id)) {
        return { ...nb, docIds: [...nb.docIds, doc.id], updatedAt: Date.now() };
      }
      return nb;
    });
  }

  if (updateData) {
    updateData({
      studyDocs: updatedDocs,
      activeGroundingDocId: doc.id,
      ...(updatedNotebooks.length > 0 ? { notebooks: updatedNotebooks } : {})
    });
  }

  // Also persist active context in localStorage for instant component coupling
  try {
    localStorage.setItem('manageme_active_grounding_doc_id', doc.id);
    localStorage.setItem('manageme_active_grounding_doc', JSON.stringify(doc));
  } catch (e) {
    // ignore
  }
}
