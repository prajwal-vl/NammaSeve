import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, EyeOff, UserX, X } from 'lucide-react';
import { MaximalistBadge } from './MaximalistBadge';
import { TreeLogo } from './TreeLogo';

interface PrivacyNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearProfile?: () => void;
}

export const PrivacyNoticeModal: React.FC<PrivacyNoticeModalProps> = ({
  isOpen,
  onClose,
  onClearProfile,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl w-full max-w-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg border border-gray-200 text-muted-text hover:text-dark-text hover:bg-gray-50 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <TreeLogo size="sm" withText={false} />
          <MaximalistBadge variant="green" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Civic Data Protection
          </MaximalistBadge>
        </div>

        <h3 className="text-xl sm:text-2xl font-heading font-bold text-dark-text mb-2">
          {t('privacy.title', 'Citizen Privacy Pledge')}
        </h3>
        <p className="text-muted-text mb-6 text-sm leading-relaxed">
          NammaSeve is built by civic technologists committed to digital public goods. We respect the fundamental right to privacy under the Indian Constitution.
        </p>

        <div className="space-y-3 mb-6">
          <div className="p-4 bg-indian-green-50/60 border border-indian-green-200 rounded-xl flex items-start gap-3">
            <Lock className="w-5 h-5 text-indian-green shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-dark-text text-sm">No Sensitive Credentials Ever</h4>
              <p className="text-xs text-muted-text mt-0.5">
                We never request Aadhaar numbers, biometric data, bank credentials, passphrases, or OTPs. Scheme discovery only requires general eligibility indicators (like age, district, or occupation).
              </p>
            </div>
          </div>

          <div className="p-4 bg-saffron-50/60 border border-saffron-200 rounded-xl flex items-start gap-3">
            <EyeOff className="w-5 h-5 text-saffron shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-dark-text text-sm">Voluntary Informed Consent</h4>
              <p className="text-xs text-muted-text mt-0.5">
                Community, educational qualification, and income attributes are 100% voluntary. You may skip any question or revoke consent anytime.
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-3">
            <UserX className="w-5 h-5 text-dark-text shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-dark-text text-sm">Right to Erasure</h4>
              <p className="text-xs text-muted-text mt-0.5">
                You can delete your stored profile data from your device and Supabase at any time with a single click.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
          {onClearProfile ? (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your stored profile data?')) {
                  onClearProfile();
                  onClose();
                }
              }}
              className="text-red-600 hover:text-red-800 text-xs font-semibold underline cursor-pointer"
            >
              Delete My Profile Data
            </button>
          ) : <div />}

          <button
            onClick={onClose}
            className="btn-primary px-5 py-2 rounded-lg font-semibold text-xs sm:text-sm cursor-pointer ml-auto"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
