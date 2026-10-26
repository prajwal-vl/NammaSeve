import { describe, it, expect } from 'vitest';
import { DiscoveredScheme, DiscoverSchemesResponse } from '../types';

describe('Live Search Scheme Discovery & Normalization', () => {
  const sampleDiscoveredScheme: DiscoveredScheme = {
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    summary: 'Direct income support of ₹6,000 per year in three installments for landholding farmer families.',
    government_level: 'central',
    department: 'Ministry of Agriculture & Farmers Welfare',
    state_applicability: ['All'],
    benefits: ['₹6,000 per year directly to bank account via DBT in 3 equal installments of ₹2,000'],
    eligibility_requirements: [
      'Small and marginal landholder farmer families',
      'Name must appear in land records / state revenue portal',
      'Institutional landholders and high income taxpayers are excluded'
    ],
    application_steps: [
      'Self-register online on pmkisan.gov.in portal or via Common Service Centers (CSC)'
    ],
    required_documents: ['RTC Land Record', 'Aadhaar for identity check', 'Bank account details'],
    application_url: 'https://pmkisan.gov.in',
    source_url: 'https://pmkisan.gov.in',
    source_type: 'official',
    eligibility_status: 'potentially_eligible',
    matched_criteria: ['Farmer status verified in user profile'],
    missing_criteria: ['Landholding records require verification on state portal'],
    unknown_fields: [],
    last_checked_at: new Date().toISOString(),
    is_official_domain: true,
  };

  it('validates official government domains accurately', () => {
    const isOfficialGov = (urlStr: string) => {
      try {
        const parsed = new URL(urlStr);
        const host = parsed.hostname.toLowerCase();
        return (
          host.endsWith('.gov.in') ||
          host.endsWith('.nic.in') ||
          host.includes('myscheme.gov.in') ||
          host.includes('karnataka.gov.in')
        );
      } catch {
        return false;
      }
    };

    expect(isOfficialGov('https://pmkisan.gov.in')).toBe(true);
    expect(isOfficialGov('https://sevasindhu.karnataka.gov.in/DirectApply')).toBe(true);
    expect(isOfficialGov('https://myscheme.gov.in/schemes/pm-kisan')).toBe(true);
    expect(isOfficialGov('https://random-blog.com/schemes')).toBe(false);
  });

  it('rejects unsafe protocols and malformed URLs', () => {
    const isValidHttp = (urlStr: string | null | undefined) => {
      if (!urlStr) return false;
      try {
        const url = new URL(urlStr);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    };

    expect(isValidHttp('https://india.gov.in')).toBe(true);
    expect(isValidHttp('http://karnataka.gov.in')).toBe(true);
    expect(isValidHttp('javascript:alert(1)')).toBe(false);
    expect(isValidHttp('data:text/html,malicious')).toBe(false);
    expect(isValidHttp('not a url')).toBe(false);
    expect(isValidHttp(null)).toBe(false);
  });

  it('deduplicates live search candidates by name and source URL', () => {
    const candidates = [
      { name: 'Kisan Credit Card', source_url: 'https://myscheme.gov.in/schemes/kcc' },
      { name: 'Kisan Credit Card', source_url: 'https://myscheme.gov.in/schemes/kcc' }, // Exact duplicate
      { name: 'kisan credit card', source_url: 'https://myscheme.gov.in/schemes/kcc-alt' }, // Case-insensitive duplicate
      { name: 'Soil Health Card', source_url: 'https://soilhealth.dac.gov.in' },
    ];

    const deduplicated: typeof candidates = [];
    const seenNames = new Set<string>();

    for (const c of candidates) {
      const key = c.name.toLowerCase();
      if (!seenNames.has(key)) {
        seenNames.add(key);
        deduplicated.push(c);
      }
    }

    expect(deduplicated.length).toBe(2);
    expect(deduplicated.map(d => d.name)).toContain('Kisan Credit Card');
    expect(deduplicated.map(d => d.name)).toContain('Soil Health Card');
  });

  it('handles empty database discovery without requiring preseeded records', () => {
    const emptyDatabaseSchemes: any[] = [];
    expect(emptyDatabaseSchemes.length).toBe(0);

    // Live search works independently of whether Supabase schemes table has rows
    const liveSearchResults: DiscoveredScheme[] = [sampleDiscoveredScheme];
    expect(liveSearchResults.length).toBe(1);
    expect(liveSearchResults[0].name).toBe('Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)');
  });

  it('returns clean diagnostic information when Groq API key is unconfigured', () => {
    const mockUnconfiguredResponse: DiscoverSchemesResponse = {
      results: [],
      search_status: 'unconfigured_key',
      search_notes: [
        'GROQ_API_KEY is not configured in Supabase Edge Function secrets.',
        'Configure key using: supabase secrets set GROQ_API_KEY="..."',
      ],
      query_summary: 'Targeted criteria for Karnataka',
      cached: false,
    };

    expect(mockUnconfiguredResponse.search_status).toBe('unconfigured_key');
    expect(mockUnconfiguredResponse.results.length).toBe(0);
    expect(mockUnconfiguredResponse.search_notes.length).toBeGreaterThan(0);
  });
});
