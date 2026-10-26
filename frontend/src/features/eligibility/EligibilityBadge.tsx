import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertCircle, HelpCircle, XCircle } from 'lucide-react';
import { EligibilityStatus } from '../../types';

interface EligibilityBadgeProps {
  status: EligibilityStatus;
  showIcon?: boolean;
  className?: string;
}

export const EligibilityBadge: React.FC<EligibilityBadgeProps> = ({
  status,
  showIcon = true,
  className = '',
}) => {
  const { t } = useTranslation();

  const configs: Record<
    EligibilityStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    eligible: {
      label: t('eligibility.eligible', 'Eligible based on available information'),
      bg: 'bg-indian-green-100',
      text: 'text-indian-green-900',
      border: 'border-indian-green',
      icon: <CheckCircle2 className="w-4 h-4 text-indian-green" />,
    },
    potentially_eligible: {
      label: t('eligibility.potentially_eligible', 'Potentially eligible — verification required'),
      bg: 'bg-amber-100',
      text: 'text-amber-900',
      border: 'border-amber-500',
      icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
    },
    insufficient_information: {
      label: t('eligibility.insufficient_information', 'Insufficient information'),
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      border: 'border-blue-500',
      icon: <HelpCircle className="w-4 h-4 text-blue-600" />,
    },
    not_eligible: {
      label: t('eligibility.not_eligible', 'Not eligible based on documented criteria'),
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-500',
      icon: <XCircle className="w-4 h-4 text-gray-600" />,
    },
  };

  const config = configs[status] || configs.insufficient_information;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border-2 font-bold text-xs sm:text-sm tracking-wide ${config.bg} ${config.text} ${config.border} shadow-[2px_2px_0px_#20241F] ${className}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
};
