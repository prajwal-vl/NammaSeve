import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { EmptyState } from '../components/EmptyState';

describe('EmptyState Component', () => {
  it('renders exact maximalist headline and supporting text required for zero-preseeded state', () => {
    const handleProfile = vi.fn();
    const handlePrivacy = vi.fn();
    const handleHow = vi.fn();
    const handleAdmin = vi.fn();

    render(
      <EmptyState
        onOpenProfile={handleProfile}
        onOpenPrivacy={handlePrivacy}
        onNavigateHowItWorks={handleHow}
        onNavigateAdminImport={handleAdmin}
      />
    );

    // Verify headline
    expect(
      screen.getByText(/Your profile is ready\. Let's find your opportunities\./i)
    ).toBeInTheDocument();

    // Verify supporting text
    expect(
      screen.getByText(/NammaSeve matches your profile with verified government schemes/i)
    ).toBeInTheDocument();

    // Verify action buttons
    expect(screen.getByText(/Complete or Update My Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Review Privacy Settings/i)).toBeInTheDocument();
    expect(screen.getByText(/Explore How NammaSeve Works/i)).toBeInTheDocument();
  });
});
