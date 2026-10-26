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

  const isEligible = status === 'eligible' || status === 'eligible_based_on_available_information';
  const isNotEligible = status === 'not_eligible' || status === 'not_eligible_based_on_known_criteria';
  const isPotentially = status === 'potentially_eligible';
  const isInsufficient = status === 'insufficient_information';

  let config = {
    label: t('eligibility.eligible', 'Eligible based on available information'),
    bg: 'bg-indian-green-50',
    text: 'text-indian-green-900',
    border: 'border-indian-green-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-indian-green" />,
  };

  if (isPotentially) {
    config = {
      label: t('eligibility.potentially_eligible', 'Potentially eligible — verification required'),
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      border: 'border-amber-200',
      icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />,
    };
  } else if (isInsufficient) {
    config = {
      label: t('eligibility.insufficient_information', 'Insufficient information'),
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      border: 'border-blue-200',
      icon: <HelpCircle className="w-3.5 h-3.5 text-blue-600" />,
    };
  } else if (isNotEligible) {
    config = {
      label: t('eligibility.not_eligible', 'Not eligible based on documented criteria'),
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
      icon: <XCircle className="w-3.5 h-3.5 text-gray-500" />,
    };
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs sm:text-sm font-semibold tracking-normal ${config.bg} ${config.text} ${config.border} shadow-2xs ${className}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
};
