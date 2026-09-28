import { ChatMessage, StatutoryCitation, DiscussedSection } from './types';

export interface StatutoryProvisionMeta {
  section: string;
  act: string;
  shortDescription: string;
  fullSnippet?: string;
  url?: string;
  jurisdiction: 'IN' | 'INTL';
}

export const KNOWN_STATUTORY_PROVISIONS: Record<string, StatutoryProvisionMeta> = {
  'section 3(p)': {
    section: 'Section 3(p)',
    act: 'The Patents Act, 1970',
    shortDescription: 'Absolute statutory bar against patenting traditional knowledge or aggregations/duplications of known properties of traditional components.',
    fullSnippet: 'An invention which in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components is not an invention.',
    url: 'https://ipindia.gov.in',
    jurisdiction: 'IN',
  },
  'section 3(e)': {
    section: 'Section 3(e)',
    act: 'The Patents Act, 1970',
    shortDescription: 'Mere admixture hurdle; requires empirical pharmacological synergy data proving super-additive interaction over individual botanical components.',
    fullSnippet: 'A substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof or a process for producing such substance is not patentable.',
    url: 'https://ipindia.gov.in',
    jurisdiction: 'IN',
  },
  'section 3(d)': {
    section: 'Section 3(d)',
    act: 'The Patents Act, 1970',
    shortDescription: 'Enhanced therapeutic efficacy threshold for new forms, polymorphs, derivatives, or extracts of known substances.',
    fullSnippet: 'The mere discovery of a new form of a known substance which does not result in the enhancement of the known efficacy of that substance is barred from patentability.',
    url: 'https://ipindia.gov.in',
    jurisdiction: 'IN',
  },
  'section 3(i)': {
    section: 'Section 3(i)',
    act: 'The Patents Act, 1970',
    shortDescription: 'Statutory bar prohibiting patents on methods of medical, surgical, curative, prophylactic, diagnostic, or therapeutic treatment of human beings or animals.',
    fullSnippet: 'Any process for the medicinal, surgical, curative, prophylactic, diagnostic, therapeutic or other treatment of human beings or any process for a similar treatment of animals to render them free of disease or to increase their economic value is not patentable.',
    url: 'https://ipindia.gov.in',
    jurisdiction: 'IN',
  },
  'section 3(j)': {
    section: 'Section 3(j)',
    act: 'The Patents Act, 1970',
    shortDescription: 'Bar on patents for plants and animals in whole or part (including seeds, varieties, species) and essentially biological processes.',
    fullSnippet: 'Plants and animals in whole or any part thereof other than micro-organisms; but including seeds, varieties and species and essentially biological processes for production or propagation of plants and animals.',
    url: 'https://ipindia.gov.in',
    jurisdiction: 'IN',
  },
  'section 3(h)': {
    section: 'Section 3(h)',
    act: 'The Patents Act, 1970',
    shortDescription: 'Methods of agriculture or horticulture barred from patentability.',
    fullSnippet: 'A method of agriculture or horticulture is not an invention within the meaning of the Patents Act.',
    url: 'https://ipindia.gov.in',
    jurisdiction: 'IN',
  },
  'section 2(1)(j)': {
    section: 'Section 2(1)(j)',
    act: 'The Patents Act, 1970',
    shortDescription: 'Fundamental definition of patentable invention: a new product or process involving an inventive step and capable of industrial application.',
    fullSnippet: "'Invention' means a new product or process involving an inventive step and capable of industrial application.",
    url: 'https://ipindia.gov.in',
    jurisdiction: 'IN',
  },
  'section 6': {
    section: 'Section 6',
    act: 'Biological Diversity Act, 2002 (as amended 2023)',
    shortDescription: 'Mandatory prior approval from National Biodiversity Authority (NBA) before filing or obtaining patent grant for inventions using Indian bio-resources.',
    fullSnippet: 'No person shall apply for any intellectual property right based on biological resources or associated knowledge obtained from India without previous approval of the National Biodiversity Authority.',
    url: 'http://nbaindia.org/',
    jurisdiction: 'IN',
  },
  'section 7': {
    section: 'Section 7',
    act: 'Biological Diversity Act, 2002 (as amended 2023)',
    shortDescription: 'Prior intimation to State Biodiversity Boards (SBB) for commercial utilization, with statutory exemptions for registered AYUSH practitioners and codified traditional healers.',
    fullSnippet: 'Commercial utilization requires intimation to SBB, but exempts registered Vaidyas, Hakims, and codified traditional healers.',
    url: 'http://nbaindia.org/',
    jurisdiction: 'IN',
  },
  'section 3': {
    section: 'Section 3 (BDA)',
    act: 'Biological Diversity Act, 2002 (as amended 2023)',
    shortDescription: 'Regulation of access to biological resources and associated knowledge for foreign entities, non-residents, and multinational corporations.',
    fullSnippet: 'Certain persons not to undertake biodiversity-related activities without approval of National Biodiversity Authority.',
    url: 'http://nbaindia.org/',
    jurisdiction: 'IN',
  },
  'rule 158-b': {
    section: 'Rule 158-B',
    act: 'Drugs and Cosmetics Rules, 1945',
    shortDescription: 'Regulatory licensing pathway requiring proof of classical textual authority from First Schedule authoritative texts vs Patent & Proprietary (P&P) clinical trial standards.',
    fullSnippet: 'Guidelines for issue of license with respect to Ayurveda, Siddha or Unani drugs based on authoritative texts or pharmacological evidence.',
    url: 'https://cdsco.gov.in',
    jurisdiction: 'IN',
  },
  'rule 122-e': {
    section: 'Rule 122-E',
    act: 'Drugs and Cosmetics Rules, 1945',
    shortDescription: 'Regulatory framework for Phytopharmaceutical drugs (purified and standardized botanical fractions with ≥4 bioactive chemical markers).',
    fullSnippet: 'A phytopharmaceutical drug includes purified and standardized fraction with defined minimum four bioactive or phytochemical compounds of an extract of a medicinal plant.',
    url: 'https://cdsco.gov.in',
    jurisdiction: 'IN',
  },
  'rule 157': {
    section: 'Rule 157',
    act: 'Drugs and Cosmetics Rules, 1945',
    shortDescription: 'Standards for manufacture and packaging of Ayurvedic, Siddha or Unani drugs under Schedule T Good Manufacturing Practices (GMP).',
    fullSnippet: 'Prescribes statutory conditions and factory requirements for manufacturing Ayurvedic medicines.',
    url: 'https://cdsco.gov.in',
    jurisdiction: 'IN',
  },
  'first schedule': {
    section: 'First Schedule',
    act: 'Drugs and Cosmetics Act, 1940',
    shortDescription: 'Official list of 54 classical authoritative texts of Ayurveda, Siddha, and Unani recognized by the Government of India for classical licensing.',
    fullSnippet: 'Authoritative books of Ayurvedic, Siddha and Unani Tibb systems specifying recognized classical formulations.',
    url: 'https://cdsco.gov.in',
    jurisdiction: 'IN',
  },
};

/**
 * Normalizes a section string like "धारा 3(p)" or "sec 3p" or "Section 3(p)" into a consistent canonical key.
 */
export function normalizeSectionKey(raw: string): string {
  let s = raw.toLowerCase().trim();
  s = s.replace(/धारा/g, 'section');
  s = s.replace(/नियम/g, 'rule');
  s = s.replace(/sec\./g, 'section');
  s = s.replace(/sec\s+/g, 'section ');
  // Clean extra spaces
  s = s.replace(/\s+/g, ' ');
  return s;
}

/**
 * Format a display name for a section
 */
export function formatSectionTitle(raw: string): string {
  const normKey = normalizeSectionKey(raw);
  if (KNOWN_STATUTORY_PROVISIONS[normKey]) {
    return KNOWN_STATUTORY_PROVISIONS[normKey].section;
  }
  // Capitalize properly
  return raw
    .replace(/^sec(tion)?\s*/i, 'Section ')
    .replace(/^rule\s*/i, 'Rule ')
    .trim();
}

/**
 * Extracts all statutory sections referenced in a single assistant message or text.
 */
export function extractSectionsFromText(text: string, citations?: StatutoryCitation[]): string[] {
  const found = new Set<string>();

  // 1. From citations array
  if (citations && citations.length > 0) {
    citations.forEach((c) => {
      if (c.section) {
        found.add(formatSectionTitle(c.section));
      }
    });
  }

  // 2. From text regex
  if (text) {
    const regex = /(Section\s+[0-9]+(?:\([a-zA-Z0-9]+\))?|Rule\s+[0-9A-Za-z\-]+|Form\s+[0-9A-Za-z\-]+|धारा\s+[0-9]+(?:\([a-zA-Z0-9]+\))?|नियम\s+[0-9A-Za-z\-]+|First\s+Schedule)/gi;
    const matches = text.match(regex);
    if (matches) {
      matches.forEach((m) => {
        found.add(formatSectionTitle(m));
      });
    }
  }

  return Array.from(found);
}

/**
 * Extracts all unique statutory sections discussed across all chat messages in list form.
 */
export function extractDiscussedSections(messages: ChatMessage[]): DiscussedSection[] {
  const map = new Map<string, {
    section: string;
    act: string;
    description: string;
    snippet?: string;
    url?: string;
    count: number;
  }>();

  messages.forEach((msg) => {
    // Only assistant messages provide authoritative statutory analysis
    if (msg.sender !== 'assistant') return;

    // 1. Process explicit citations
    if (msg.citations && msg.citations.length > 0) {
      msg.citations.forEach((c) => {
        if (!c.section) return;
        const normKey = normalizeSectionKey(c.section);
        const existing = map.get(normKey);
        const known = KNOWN_STATUTORY_PROVISIONS[normKey];

        if (existing) {
          existing.count += 1;
          if (!existing.snippet && (c.snippet || known?.fullSnippet)) {
            existing.snippet = c.snippet || known?.fullSnippet;
          }
          if (!existing.description && (c.description || known?.shortDescription)) {
            existing.description = c.description || known?.shortDescription || '';
          }
        } else {
          map.set(normKey, {
            section: formatSectionTitle(c.section),
            act: c.act || known?.act || 'Indian Statutory Law',
            description: c.description || known?.shortDescription || 'Statutory reference cited during AI legal copilot consultation.',
            snippet: c.snippet || known?.fullSnippet,
            url: c.url || known?.url,
            count: 1,
          });
        }
      });
    }

    // 2. Also process textual references in message text
    if (msg.text) {
      const regex = /(Section\s+[0-9]+(?:\([a-zA-Z0-9]+\))?|Rule\s+[0-9A-Za-z\-]+|धारा\s+[0-9]+(?:\([a-zA-Z0-9]+\))?|नियम\s+[0-9A-Za-z\-]+|First\s+Schedule)/gi;
      const matches = msg.text.match(regex);
      if (matches) {
        matches.forEach((raw) => {
          const normKey = normalizeSectionKey(raw);
          const existing = map.get(normKey);
          const known = KNOWN_STATUTORY_PROVISIONS[normKey];

          if (existing) {
            existing.count += 1;
          } else {
            map.set(normKey, {
              section: formatSectionTitle(raw),
              act: known?.act || 'Indian Statutory Law',
              description: known?.shortDescription || 'Statutory provision referenced in legal advice reasoning.',
              snippet: known?.fullSnippet,
              url: known?.url,
              count: 1,
            });
          }
        });
      }
    }
  });

  return Array.from(map.entries()).map(([key, val], idx) => ({
    id: `sec_disc_${idx}_${key.replace(/[^a-zA-Z0-9]/g, '_')}`,
    ...val,
  }));
}
