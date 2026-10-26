import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, MapPin, GraduationCap, Briefcase, Edit3, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../../types';
import { MaximalistBadge } from '../../components/MaximalistBadge';
import { calculateProfileCompletion } from '../../lib/eligibilityEngine';

interface ProfileSummaryCardProps {
  profile: UserProfile;
  onEdit: () => void;
}

export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({ profile, onEdit }) => {
  const { t } = useTranslation();
  const completion = calculateProfileCompletion(profile);

  return (
    <div className="neo-box p-6 rounded-2xl bg-white relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MaximalistBadge variant="green" size="sm">
              Citizen Discovery Profile
            </MaximalistBadge>
            <span className="text-xs font-bold text-indian-green bg-indian-green-100 px-2 py-0.5 rounded border border-indian-green">
              {completion}% Complete
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-heading font-black text-dark-text">
            Profile Attributes
          </h3>
        </div>

        <button
          onClick={onEdit}
          className="neo-button-primary px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 self-start cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div className="p-3 bg-warm-white border-2 border-dark-text rounded-xl">
          <div className="flex items-center gap-1 text-xs text-muted-text font-bold mb-1">
            <MapPin className="w-3.5 h-3.5 text-saffron" />
            Location
          </div>
          <div className="font-black text-dark-text truncate">
            {profile.district ? `${profile.district}, ${profile.state}` : (profile.state || 'Not specified')}
          </div>
        </div>

        <div className="p-3 bg-warm-white border-2 border-dark-text rounded-xl">
          <div className="flex items-center gap-1 text-xs text-muted-text font-bold mb-1">
            <User className="w-3.5 h-3.5 text-indian-green" />
            Demographics
          </div>
          <div className="font-black text-dark-text truncate">
            {profile.age ? `${profile.age} yrs` : 'Age unset'} • {profile.gender || 'Any'}
          </div>
        </div>

        <div className="p-3 bg-warm-white border-2 border-dark-text rounded-xl">
          <div className="flex items-center gap-1 text-xs text-muted-text font-bold mb-1">
            <GraduationCap className="w-3.5 h-3.5 text-saffron" />
            Education
          </div>
          <div className="font-black text-dark-text truncate">
            {profile.highest_qualification ? profile.highest_qualification.replace(/_/g, ' ') : 'Not specified'}
          </div>
        </div>

        <div className="p-3 bg-warm-white border-2 border-dark-text rounded-xl">
          <div className="flex items-center gap-1 text-xs text-muted-text font-bold mb-1">
            <Briefcase className="w-3.5 h-3.5 text-indian-green" />
            Occupation
          </div>
          <div className="font-black text-dark-text truncate">
            {profile.occupation || (profile.is_farmer ? 'Farmer' : (profile.is_student ? 'Student' : 'Not specified'))}
          </div>
        </div>
      </div>

      {profile.community_consent_granted && profile.community_category && (
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2 text-xs text-muted-text font-semibold">
          <ShieldCheck className="w-4 h-4 text-indian-green" />
          <span>Voluntary Community Category: <strong className="text-dark-text uppercase">{profile.community_category}</strong></span>
        </div>
      )}
    </div>
  );
};
