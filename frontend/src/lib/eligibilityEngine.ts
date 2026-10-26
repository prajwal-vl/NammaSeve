// Deterministic Dynamic Eligibility Engine for NammaSeve
// Evaluates citizen profile attributes against genuine verified scheme rules.
// Overrides: NEVER relies on LLM to invent eligibility. All outcomes are deterministic.

import { UserProfile, Scheme, EligibilityRule, EligibilityEvaluation, EligibilityStatus } from '../types';

export function evaluateSchemeEligibility(
  profile: UserProfile,
  scheme: Scheme,
  rules: EligibilityRule[] = []
): EligibilityEvaluation {
  const schemeRules = rules.length > 0 ? rules : (scheme.rules || []);
  const matched_reasons: string[] = [];
  const unmatched_reasons: string[] = [];
  const missing_fields: string[] = [];
  const source_references: string[] = [];

  let hardExclusion = false;

  if (schemeRules.length === 0) {
    return {
      scheme_id: scheme.id,
      scheme,
      status: 'potentially_eligible',
      matched_reasons: ['Universal citizen scheme with no specific restrictive exclusions recorded.'],
      unmatched_reasons: [],
      missing_fields: [],
      source_references: scheme.sources?.map(s => `${s.publisher}: ${s.source_url}`) || [],
    };
  }

  schemeRules.forEach(rule => {
    if (rule.source_reference) {
      source_references.push(rule.source_reference);
    }

    const attr = rule.required_attribute as keyof UserProfile;
    const profileValue = profile[attr];

    // Handle missing voluntary information
    if (profileValue === undefined || profileValue === null || profileValue === '') {
      missing_fields.push(rule.required_attribute);
      return;
    }

    const expected = String(rule.rule_value).trim().toLowerCase();
    const actual = String(profileValue).trim().toLowerCase();
    let passed = false;

    switch (rule.operator) {
      case 'eq':
        passed = actual === expected;
        break;
      case 'neq':
        passed = actual !== expected;
        break;
      case 'gte':
        passed = Number(actual) >= Number(expected);
        break;
      case 'lte':
        passed = Number(actual) <= Number(expected);
        break;
      case 'gt':
        passed = Number(actual) > Number(expected);
        break;
      case 'lt':
        passed = Number(actual) < Number(expected);
        break;
      case 'in': {
        const allowedList = expected.split(',').map(s => s.trim());
        passed = allowedList.includes(actual);
        break;
      }
      case 'not_in': {
        const disallowedList = expected.split(',').map(s => s.trim());
        passed = !disallowedList.includes(actual);
        break;
      }
      case 'contains':
        passed = actual.includes(expected);
        break;
      default:
        passed = false;
    }

    if (passed) {
      matched_reasons.push(formatMatchReason(rule.required_attribute, rule.operator, rule.rule_value));
    } else {
      hardExclusion = true;
      unmatched_reasons.push(formatUnmatchedReason(rule.required_attribute, String(profileValue), rule.rule_value));
    }
  });

  let status: EligibilityStatus = 'eligible';
  if (hardExclusion) {
    status = 'not_eligible';
  } else if (missing_fields.length > 0) {
    if (matched_reasons.length > 0) {
      status = 'potentially_eligible';
    } else {
      status = 'insufficient_information';
    }
  }

  return {
    scheme_id: scheme.id,
    scheme,
    status,
    matched_reasons,
    unmatched_reasons,
    missing_fields: [...new Set(missing_fields)],
    source_references: [...new Set(source_references)],
  };
}

function formatMatchReason(attribute: string, operator: string, value: string): string {
  const friendlyNames: Record<string, string> = {
    state: 'State of Residence',
    district: 'District',
    age: 'Age Requirement',
    min_age: 'Minimum Age',
    max_age: 'Maximum Age',
    gender: 'Gender Criterion',
    highest_qualification: 'Educational Qualification',
    education_status: 'Education Status',
    occupation: 'Occupation / Employment Status',
    is_farmer: 'Farmer Beneficiary Status',
    is_student: 'Student Beneficiary Status',
    is_woman_head_of_family: 'Woman Head of Family',
    ration_card_type: 'Ration Card Category',
    annual_income_max: 'Annual Income Ceiling',
    community_category: 'Community Category',
  };

  const name = friendlyNames[attribute] || attribute;
  return `Criteria matched for ${name} (${operator} ${value})`;
}

function formatUnmatchedReason(attribute: string, actual: string, required: string): string {
  return `Not satisfied: ${attribute} is '${actual}', required '${required}'`;
}

// Calculate profile completion percentage based on core discovery attributes
export function calculateProfileCompletion(profile: UserProfile): number {
  const keyFields: (keyof UserProfile)[] = [
    'state',
    'district',
    'age',
    'gender',
    'highest_qualification',
    'education_status',
    'occupation',
    'annual_income_range',
  ];

  let completed = 0;
  keyFields.forEach(field => {
    const val = profile[field];
    if (val !== undefined && val !== null && val !== '') {
      completed++;
    }
  });

  return Math.round((completed / keyFields.length) * 100);
}
