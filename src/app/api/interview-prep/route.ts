// API Route: AI Interview Prep Copilot & Answer Grader (Gemini API)

import { GoogleGenAI, Type } from '@google/genai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      mode = 'generate',
      jobTitle = 'Graduate Analyst',
      company = 'Target Firm',
      sector = 'Investment Banking / Corporate Finance',
      jobDescription = '',
      question = '',
      answer = '',
      candidateBackground = body.background || body.candidateBackground || 'General Graduate / Professional Candidate'
    } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    // --- MODE 1: REVIEW & GRADE USER'S ANSWER ---
    if (mode === 'review') {
      if (!apiKey) {
        // Fallback review heuristics
        const wordCount = (answer || '').trim().split(/\s+/).filter(Boolean).length;
        return new Response(JSON.stringify({
          score: Math.min(95, Math.max(65, 70 + Math.min(20, Math.floor(wordCount / 10)))),
          clarityVerdict: wordCount > 50 ? 'Strong structure with relevant contextual detail.' : 'Concise but would benefit from more concrete metric quantification.',
          strengths: [
            'Clear articulation of core concept and professional tone.',
            'Direct alignment with role requirements and commercial context.'
          ],
          improvements: [
            'Incorporate specific numerical metrics or percentage impacts to solidify your outcome.',
            'Explicitly structure using Situation-Task-Action-Result (STAR) flow.'
          ],
          missingKeywords: ['DCF Sensitivity', 'EBITDA Multiple', 'Accounting Standards / Working Capital', 'Synergy Valuation']
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a Senior Managing Director & Lead Interviewer in ${sector} at ${company}.
Review and grade this candidate's interview answer for the role of ${jobTitle}.
Candidate Background: ${candidateBackground}

QUESTION:
${question}

CANDIDATE'S ANSWER:
${answer}

Evaluate rigorously:
1. score: Overall grade from 1 to 100.
2. clarityVerdict: A concise 1-sentence verdict on communication clarity.
3. strengths: 2-3 specific elements done well.
4. improvements: 2-3 actionable ways to refine the response.
5. missingKeywords: 3-4 advanced technical or industry keywords they should have mentioned.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              clarityVerdict: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['score', 'clarityVerdict', 'strengths', 'improvements', 'missingKeywords']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return new Response(JSON.stringify(parsed), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // --- MODE 2: GENERATE QUESTIONS ---
    if (!apiKey) {
      // High-quality fallback questions tailored to finance & corporate roles
      return new Response(JSON.stringify({
        technicalQuestions: [
          {
            id: 't1',
            topic: 'Valuation & Modeling',
            question: `Walk me through a Discounted Cash Flow (DCF) model and explain how an increase in working capital impacts Unlevered Free Cash Flow.`,
            keyTalkingPoints: [
              'Start with EBIT(1 - t) to get EBIAT / NOPAT.',
              'Add back Depreciation & Amortization (non-cash charge).',
              'Subtract Capital Expenditures (CapEx) and subtract Increase in Net Working Capital (NWC).',
              'An increase in NWC means cash is tied up in receivables/inventory, which directly reduces Unlevered Free Cash Flow.'
            ]
          },
          {
            id: 't2',
            topic: 'Financial Statement Analysis & IFRS',
            question: `If a company purchases £100m of equipment using 50% debt and 50% cash, how do the three financial statements change at year 0 and year 1 (assuming 10% straight-line depreciation, 5% interest rate, and 20% tax rate)?`,
            keyTalkingPoints: [
              'Year 0: Income statement unchanged. Cash decreases by £50m, PP&E increases by £100m (Net Assets +£50m). Debt increases by £50m on Balance Sheet.',
              'Year 1: Depreciation is £10m; Interest expense is £2.5m (£50m * 5%). Pre-tax income down £12.5m. Net Income down £10m after 20% tax shield (£2.5m).',
              'Cash Flow Statement: Net Income down £10m, add back non-cash £10m D&A, net cash flow from ops is £0m (excluding interest paid in financing/ops depending on IFRS/GAAP).'
            ]
          },
          {
            id: 't3',
            topic: 'M&A & Strategic Rationale',
            question: `Why might a company choose to acquire another firm using equity stock rather than cash or debt, and what makes a deal immediately accretive vs dilutive?`,
            keyTalkingPoints: [
              'Stock is preferred during high market uncertainty, preserving liquidity buffer, or when the acquirer’s stock is trading at a premium valuation.',
              'In an all-stock deal, if the Acquirer P/E is higher than the Target P/E, the transaction is accretive to EPS.',
              'Cost of debt after-tax vs cost of equity (inverse of P/E) dictates accretion/dilution threshold.'
            ]
          }
        ],
        behavioralQuestions: [
          {
            id: 'b1',
            competency: 'Conflict Resolution & Client Delivery',
            question: `Describe a scenario at university or in a professional team where you encountered conflicting priorities under a tight deadline. How did you manage stakeholders and ensure delivery?`,
            starGuidance: 'Situation: Define the project context and conflicting stakeholder demands. Task: Quantify the deliverable requirement. Action: Detail how you prioritized tasks, communicated trade-offs, and executed. Result: Highlight on-time completion and measurable success.'
          },
          {
            id: 'b2',
            competency: 'Firm Fit & Commercial Awareness',
            question: `Why ${company} specifically over our peer competitors in the UK market, and what macro trend currently presents both an opportunity and a risk for our ${sector} practice?`,
            starGuidance: 'Highlight specific culture pillars or landmark transactions at ${company}. Connect an actual macro event (e.g. Bank of England rate policy, ESG disclosure mandates, or AI-driven underwriting) to the firm\'s strategic positioning.'
          }
        ]
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a Technical Interview Lead for ${company} interviewing candidates for the role: "${jobTitle}" in the sector: "${sector}".
Candidate Background: ${candidateBackground}
${jobDescription ? `Job Posting Context:\n${jobDescription}\n` : ''}

Generate structured interview preparation material:
1. technicalQuestions: 3 rigorous, role-specific technical questions (e.g. financial statement adjustments, valuation, LBO/M&A mechanics, risk ratios, or audit procedures) each with 3-4 bulleted keyTalkingPoints and a short topic tag.
2. behavioralQuestions: 2 company-specific competency questions with STAR Method Guidance (Situation, Task, Action, Result) and a competency tag.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            technicalQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  question: { type: Type.STRING },
                  keyTalkingPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['topic', 'question', 'keyTalkingPoints']
              }
            },
            behavioralQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  competency: { type: Type.STRING },
                  question: { type: Type.STRING },
                  starGuidance: { type: Type.STRING }
                },
                required: ['competency', 'question', 'starGuidance']
              }
            }
          },
          required: ['technicalQuestions', 'behavioralQuestions']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('[Interview Prep API Route Error]:', error);
    return new Response(JSON.stringify({ error: error.message || 'Interview prep generation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
