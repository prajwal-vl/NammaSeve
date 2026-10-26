import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, EyeOff, UserX, X } from 'lucide-react';
import { MaximalistBadge } from './MaximalistBadge';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border-4 border-dark-text shadow-neo-xl rounded-2xl w-full max-w-2xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg border-2 border-dark-text hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-dark-text" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <MaximalistBadge variant="green" icon={<ShieldCheck className="w-4 h-4" />}>
            Civic Data Protection
          </MaximalistBadge>
        </div>

        <h3 className="text-2xl md:text-3xl font-heading font-black text-dark-text mb-3">
          {t('privacy.title', 'Citizen Privacy Pledge')}
        </h3>
        <p className="text-muted-text mb-6 text-sm md:text-base leading-relaxed">
          NammaSeve is built by civic technologists committed to digital public goods. We respect the fundamental right to privacy under the Indian Constitution.
        </p>

        <div className="space-y-4 mb-8">
          <div className="p-4 bg-indian-green-50 border-2 border-indian-green rounded-xl flex items-start gap-3">
            <Lock className="w-6 h-6 text-indian-green shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-dark-text text-base">No Sensitive Credentials Ever</h4>
              <p className="text-sm text-muted-text">
                We never request Aadhaar numbers, biometric data, bank credentials, passphrases, or OTPs. Scheme discovery only requires general eligibility indicators (like age, district, or occupation).
              </p>
            </div>
          </div>

          <div className="p-4 bg-saffron-50 border-2 border-saffron rounded-xl flex items-start gap-3">
            <EyeOff className="w-6 h-6 text-saffron shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-dark-text text-base">Voluntary Informed Consent</h4>
              <p className="text-sm text-muted-text">
                Community, educational qualification, and income attributes are 100% voluntary. You may skip any question or revoke consent anytime.
              </p>
            </div>
          </div>

          <div className="p-4 bg-warm-white border-2 border-dark-text rounded-xl flex items-start gap-3">
            <UserX className="w-6 h-6 text-dark-text shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-dark-text text-base">Right to Erasure</h4>
              <p className="text-sm text-muted-text">
                You can delete your stored profile data from your device and Supabase at any time with a single click.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t-2 border-gray-200">
          {onClearProfile ? (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your stored profile data?')) {
                  onClearProfile();
                  onClose();
                }
              }}
              className="text-red-600 hover:text-red-800 text-sm font-bold underline cursor-pointer"
            >
              Delete My Profile Data
            </button>
          ) : <div />}

          <button
            onClick={onClose}
            className="neo-button-primary px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer ml-auto"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
