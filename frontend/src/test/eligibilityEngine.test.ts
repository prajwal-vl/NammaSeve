import { describe, it, expect } from 'vitest';
import { evaluateSchemeEligibility, calculateProfileCompletion } from '../lib/eligibilityEngine';
import { UserProfile, Scheme, EligibilityRule } from '../types';

describe('Deterministic Eligibility Engine', () => {
  const dummyScheme: Scheme = {
    id: 'test-scheme-1',
    slug: 'karnataka-farmer-aid',
    name: 'Karnataka Farmer Aid',
    description: 'Direct cash subsidy for Karnataka farmers',
    scheme_level: 'state',
    state_code: 'KA',
    department: 'Dept of Agriculture',
    category: 'Agriculture',
    benefits: ['₹10,000 subsidy'],
    eligibility_summary: 'Must be a farmer residing in Karnataka',
    application_steps: ['Apply online'],
    documents_required: ['Pahani'],
    official_application_url: 'https://example.gov.in',
    status: 'published',
  };

  const sampleRules: EligibilityRule[] = [
    {
      scheme_id: 'test-scheme-1',
      rule_type: 'state',
      required_attribute: 'state',
      operator: 'eq',
      rule_value: 'Karnataka',
      source_reference: 'Govt Order Clause 1',
    },
    {
      scheme_id: 'test-scheme-1',
      rule_type: 'is_farmer',
      required_attribute: 'is_farmer',
      operator: 'eq',
      rule_value: 'true',
      source_reference: 'Govt Order Clause 2',
    },
  ];

  it('correctly marks citizen as eligible when all criteria match', () => {
    const profile: UserProfile = {
      preferred_language: 'en',
      state: 'Karnataka',
      is_farmer: true,
      age: 35,
    };

    const result = evaluateSchemeEligibility(profile, dummyScheme, sampleRules);
    expect(result.status).toBe('eligible');
    expect(result.matched_reasons.length).toBe(2);
    expect(result.unmatched_reasons.length).toBe(0);
    expect(result.missing_fields.length).toBe(0);
  });

  it('correctly marks citizen as not_eligible when a mandatory rule fails', () => {
    const profile: UserProfile = {
      preferred_language: 'en',
      state: 'Maharashtra', // State mismatch
      is_farmer: true,
    };

    const result = evaluateSchemeEligibility(profile, dummyScheme, sampleRules);
    expect(result.status).toBe('not_eligible');
    expect(result.unmatched_reasons.length).toBeGreaterThan(0);
  });

  it('marks as insufficient_information or potentially_eligible when voluntary fields are omitted', () => {
    const profile: UserProfile = {
      preferred_language: 'en',
      state: 'Karnataka',
      // is_farmer is missing
    };

    const result = evaluateSchemeEligibility(profile, dummyScheme, sampleRules);
    expect(['potentially_eligible', 'insufficient_information']).toContain(result.status);
    expect(result.missing_fields).toContain('is_farmer');
  });

  it('evaluates universal public schemes with no restrictive rules as potentially_eligible', () => {
    const profile: UserProfile = {
      preferred_language: 'en',
      state: 'Karnataka',
    };

    const result = evaluateSchemeEligibility(profile, dummyScheme, []);
    expect(result.status).toBe('potentially_eligible');
  });

  it('calculates profile completion percentage accurately', () => {
    const emptyProfile: UserProfile = { preferred_language: 'en' };
    expect(calculateProfileCompletion(emptyProfile)).toBe(0);

    const halfProfile: UserProfile = {
      preferred_language: 'en',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      age: 28,
      gender: 'female',
    };
    expect(calculateProfileCompletion(halfProfile)).toBe(50);
  });
});
