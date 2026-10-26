import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { AdminSchemeImporter } from '../features/schemes/AdminSchemeImporter';
import { Scheme } from '../types';

interface AdminImportPageProps {
  onImportComplete: (schemes: Scheme[]) => void;
  onNavigateHome: () => void;
}

export const AdminImportPage: React.FC<AdminImportPageProps> = ({
  onImportComplete,
  onNavigateHome,
}) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={onNavigateHome}
        className="neo-button-secondary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <AdminSchemeImporter onImportComplete={onImportComplete} />
    </div>
  );
};
