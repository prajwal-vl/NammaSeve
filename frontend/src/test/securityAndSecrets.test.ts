import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Security & Secrets Hygiene Audit', () => {
  it('verifies that frontend .env.example never includes secret keys', () => {
    const envExamplePath = path.resolve(process.cwd(), '.env.example');
    if (fs.existsSync(envExamplePath)) {
      const content = fs.readFileSync(envExamplePath, 'utf-8');
      expect(content).not.toContain('GROQ_API_KEY');
      expect(content).not.toContain('SERVICE_ROLE_KEY');
      expect(content).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
    }
  });

  it('verifies that initial migration contains zero preseeded schemes or fake data', () => {
    const migrationPath = path.resolve(process.cwd(), '../supabase/migrations/20261026000001_initial_schema.sql');
    if (fs.existsSync(migrationPath)) {
      const content = fs.readFileSync(migrationPath, 'utf-8');
      // Must not contain any INSERT INTO public.schemes
      expect(content).not.toMatch(/INSERT\s+INTO\s+public\.schemes/i);
      expect(content).not.toMatch(/INSERT\s+INTO\s+public\.eligibility_rules/i);
    }
  });
});
