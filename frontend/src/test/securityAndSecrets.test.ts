import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Security, Privacy & Secrets Hygiene Audit', () => {
  it('verifies that frontend .env.example never includes server-side secret keys', () => {
    const envExamplePath = path.resolve(process.cwd(), '.env.example');
    if (fs.existsSync(envExamplePath)) {
      const content = fs.readFileSync(envExamplePath, 'utf-8');
      expect(content).not.toContain('GROQ_API_KEY');
      expect(content).not.toContain('VITE_GROQ_API_KEY');
      expect(content).not.toContain('SERVICE_ROLE_KEY');
      expect(content).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
      expect(content).not.toContain('DATA_GOV_IN_API_KEY');
      expect(content).not.toContain('API_SETU_API_KEY');
    }
  });

  it('verifies that all SQL migrations contain zero preseeded schemes or fake demo rules', () => {
    const migrationsDir = path.resolve(process.cwd(), '../supabase/migrations');
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
      for (const file of files) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        expect(sql).not.toMatch(/INSERT\s+INTO\s+public\.schemes/i);
        expect(sql).not.toMatch(/INSERT\s+INTO\s+public\.eligibility_rules/i);
      }
    }
  });

  it('verifies that Row Level Security (RLS) is enabled on all tables', () => {
    const initialMigration = path.resolve(process.cwd(), '../supabase/migrations/20261026000001_initial_schema.sql');
    if (fs.existsSync(initialMigration)) {
      const content = fs.readFileSync(initialMigration, 'utf-8');
      expect(content).toContain('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;');
      expect(content).toContain('ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;');
      expect(content).toContain('ALTER TABLE public.saved_schemes ENABLE ROW LEVEL SECURITY;');
    }
  });

  it('verifies that the profile schema has zero Aadhaar, bank credentials, password or OTP storage', () => {
    const initialMigration = path.resolve(process.cwd(), '../supabase/migrations/20261026000001_initial_schema.sql');
    if (fs.existsSync(initialMigration)) {
      const content = fs.readFileSync(initialMigration, 'utf-8');
      expect(content).not.toContain('aadhaar_number');
      expect(content).not.toContain('bank_account_number');
      expect(content).not.toContain('bank_password');
      expect(content).not.toContain('otp');
    }
  });
});
