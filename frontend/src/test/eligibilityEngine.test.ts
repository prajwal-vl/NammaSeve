import { describe, it, expect } from 'vitest';
import { evaluateSchemeEligibility, calculateProfileCompletion } from '../lib/eligibilityEngine';
import { UserProfile, Scheme, EligibilityRule } from '../types';

describe('Deterministic Eligibility Engine', () => {
  const dummyScheme: Scheme = {
    id: 'test-scheme-1',
    slug: 'karnataka-farmer-aid',
    name: 'Karnataka Raitha Sanjeevini',
    description: 'Direct cash subsidy and insurance for Karnataka farmers',
    scheme_level: 'state',
    state_code: 'KA',
    department: 'Dept of Agriculture',
    category: 'Agriculture',
    benefits: ['₹10,000 subsidy per acre', 'Accidental insurance coverage'],
    eligibility_summary: 'Must be an active farmer residing in Karnataka',
    application_steps: ['Apply online on Seva Sindhu or visit Raitha Samparka Kendra'],
    documents_required: ['RTC Pahani', 'Aadhaar copy for identity verification at kiosk', 'Bank passbook'],
    official_application_url: 'https://sevasindhu.karnataka.gov.in',
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

  it('correctly marks citizen as eligible when all documented criteria match', () => {
    const profile: UserProfile = {
      preferred_language: 'en',
      state: 'Karnataka',
      is_farmer: true,
      age: 35,
    };

    const result = evaluateSchemeEligibility(profile, dummyScheme, sampleRules);
    expect(
      result.status === 'eligible_based_on_available_information' || result.status === 'eligible'
    ).toBe(true);
    expect(result.matched_reasons.length).toBe(2);
    expect(result.unmatched_reasons.length).toBe(0);
    expect(result.missing_fields.length).toBe(0);
  });

  it('correctly marks citizen as not_eligible when a mandatory statutory rule fails', () => {
    const profile: UserProfile = {
      preferred_language: 'en',
      state: 'Maharashtra', // State mismatch
      is_farmer: true,
    };

    const result = evaluateSchemeEligibility(profile, dummyScheme, sampleRules);
    expect(
      result.status === 'not_eligible_based_on_known_criteria' || result.status === 'not_eligible'
    ).toBe(true);
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

  it('evaluates open public welfare schemes with no restrictive rules as potentially_eligible', () => {
    const profile: UserProfile = {
      preferred_language: 'en',
      state: 'Karnataka',
    };

    const result = evaluateSchemeEligibility(profile, dummyScheme, []);
    expect(result.status).toBe('potentially_eligible');
  });

  it('evaluates age limits accurately against min_age and max_age rules', () => {
    const youthRules: EligibilityRule[] = [
      {
        scheme_id: 'test-scheme-1',
        rule_type: 'min_age',
        required_attribute: 'age',
        operator: 'gte',
        rule_value: '18',
      },
      {
        scheme_id: 'test-scheme-1',
        rule_type: 'max_age',
        required_attribute: 'age',
        operator: 'lte',
        rule_value: '30',
      },
    ];

    const youngProfile: UserProfile = { preferred_language: 'en', age: 24 };
    const youngResult = evaluateSchemeEligibility(youngProfile, dummyScheme, youthRules);
    expect(['eligible', 'eligible_based_on_available_information']).toContain(youngResult.status);

    const seniorProfile: UserProfile = { preferred_language: 'en', age: 45 };
    const seniorResult = evaluateSchemeEligibility(seniorProfile, dummyScheme, youthRules);
    expect(['not_eligible', 'not_eligible_based_on_known_criteria']).toContain(seniorResult.status);
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
