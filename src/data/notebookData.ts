import { VirtualNotebook } from '../types';

export const DEFAULT_NOTEBOOKS: VirtualNotebook[] = [
  {
    id: 'nb-cfa-1',
    title: 'CFA Level 1 - Corporate Finance & Valuation',
    description: 'Capital budgeting, WACC hurdle rates, CAPM beta, and DCF terminal value models.',
    emoji: '📈',
    color: 'indigo',
    docIds: ['doc-demo-1'],
    notes: `# CFA Level 1: Corporate Finance

## Key Equations & Rules
- **CAPM**: E(R) = Rf + Beta * (E(Rm) - Rf)
- **WACC**: (E/V * Re) + (D/V * Rd * (1 - Tc))
- **NPV Rule**: Accept all projects with positive Net Present Value.
- **Unlevered Beta**: Beta_U = Beta_L / [1 + (1 - T)*(D/E)]

*Grounded on FIN301 lecture materials.*`,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 1,
    studyGuide: {
      title: 'Comprehensive Study Guide: Corporate Finance & Valuation',
      generatedAt: Date.now() - 86400000 * 1,
      executiveSummary: 'This module covers core capital allocation frameworks, the Capital Asset Pricing Model (CAPM), cost of capital optimization (WACC), and discounted cash flow valuation principles.',
      timelineOrRoadmap: [
        {
          stage: 'Phase 1: Capital Budgeting & Cash Flow Estimation',
          periodOrConcept: 'NPV, IRR & Free Cash Flow to Firm (FCFF)',
          details: 'Focus on relevant cash flows, tax shields, and Net Working Capital changes. Ignore sunk costs.',
          citations: ['[Source 1: FIN301_Corporate_Finance_Lecture_4.pdf]']
        },
        {
          stage: 'Phase 2: Risk & Expected Returns',
          periodOrConcept: 'CAPM & Beta Estimation',
          details: 'Beta measures systematic risk. Pure play peer un-levering and re-levering using target capital structure.',
          citations: ['[Source 1: FIN301_Corporate_Finance_Lecture_4.pdf]']
        },
        {
          stage: 'Phase 3: Cost of Capital & WACC',
          periodOrConcept: 'Weighted Average Cost of Capital',
          details: 'Calculate cost of debt after-tax shield. Blended hurdle rate for firm valuation.',
          citations: ['[Source 1: FIN301_Corporate_Finance_Lecture_4.pdf]']
        }
      ],
      coreFormulasAndDefinitions: [
        {
          term: 'WACC',
          formulaOrDefinition: '(E/V * Re) + (D/V * Rd * (1 - Tc))',
          application: 'Discount rate for Enterprise Value and Free Cash Flow to Firm (FCFF)',
          citation: '[Source 1]'
        },
        {
          term: 'CAPM Cost of Equity',
          formulaOrDefinition: 'Re = Rf + Beta * (Rm - Rf)',
          application: 'Estimates return required by equity holders given systematic market risk',
          citation: '[Source 1]'
        },
        {
          term: 'FCFF',
          formulaOrDefinition: 'EBIT * (1 - T) + D&A - CapEx - Delta NWC',
          application: 'Cash flow available to all capital providers after operating and capital reinvestment needs',
          citation: '[Source 1]'
        }
      ],
      corePrinciples: [
        'Always evaluate capital allocation decisions using incremental post-tax cash flows [Source 1]',
        'Sunk costs must be ignored; opportunity costs and externalities must be included [Source 1]',
        'WACC represents the minimum hurdle rate; projects below WACC destroy shareholder value [Source 1]',
        'Debt financing creates an interest tax shield, reducing the effective cost of debt up to distress threshold [Source 1]'
      ],
      frequentlyTestedQuestions: [
        {
          question: 'Why can NPV and IRR give conflicting project rankings for mutually exclusive projects?',
          answer: 'Conflicting rankings arise due to differing project scales (size disparity) or differing cash flow timing (reinvestment rate assumption: NPV assumes reinvestment at WACC; IRR assumes reinvestment at IRR). NPV is always the superior metric.',
          citation: '[Source 1]'
        },
        {
          question: 'How do you unlever a peer beta when capital structures differ?',
          answer: 'Unlevered Beta = Levered Beta / [1 + (1 - Tax Rate) * (Debt / Equity)]. Then relever using the target firm\'s target D/E ratio.',
          citation: '[Source 1]'
        }
      ]
    },
    flashcards: [
      {
        id: 'cfa-fc-1',
        front: 'What does Beta measure in the CAPM model?',
        back: 'Beta measures sensitivity to non-diversifiable systematic market risk [Source 1].',
        tag: 'CAPM & Beta',
        citation: '[Source 1]'
      },
      {
        id: 'cfa-fc-2',
        front: 'Why is interest expense multiplied by (1 - Tc) in WACC?',
        back: 'Because corporate interest payments are tax-deductible, creating a cash tax shield [Source 1].',
        tag: 'Cost of Capital',
        citation: '[Source 1]'
      },
      {
        id: 'cfa-fc-3',
        front: 'What is the formula for Free Cash Flow to Firm (FCFF)?',
        back: 'FCFF = EBIT*(1-T) + D&A - CapEx - Change in Net Working Capital [Source 1].',
        tag: 'Valuation & DCF',
        citation: '[Source 1]'
      }
    ]
  },
  {
    id: 'nb-tech-val',
    title: 'Tech Venture Valuation & SaaS Metrics',
    description: 'Unit economics, Rule of 40, LTV/CAC ratios, and Magic Number multiples for venture capital.',
    emoji: '🚀',
    color: 'emerald',
    docIds: [],
    notes: `# Tech Venture Valuation & SaaS Metrics

## Core SaaS Unit Economics
- **LTV / CAC Ratio**: Target > 3.0x for healthy unit economics.
- **Rule of 40**: Revenue Growth Rate YoY (%) + Free Cash Flow Margin (%) >= 40%.
- **CAC Payback Period**: Months to recover acquisition cost: CAC / (ARPU * Gross Margin). Target < 12 months.
- **Net Dollar Retention (NDR)**: (Beginning ARR + Expansion - Churn - Contraction) / Beginning ARR. Best in class > 120%.`,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 1
  },
  {
    id: 'nb-msc-fin',
    title: 'Academic Finance - Asset Pricing & Fixed Income',
    description: 'Yield curves, duration, convexity, and multi-factor arbitrage pricing models.',
    emoji: '🏛️',
    color: 'purple',
    docIds: [],
    notes: `# Asset Pricing & Fixed Income

## Bond Math & Duration
- **Macaulay Duration**: Weighted average term-to-maturity of cash flows.
- **Modified Duration**: MacDur / (1 + YTM/m). Measures % price change per 100bp yield shift.
- **Convexity**: Second derivative of bond price with respect to yield. Higher convexity = superior price upside.`,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 1
  }
];
