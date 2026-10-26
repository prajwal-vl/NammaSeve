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
    <div className="minimal-card p-6 bg-white relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MaximalistBadge variant="green" size="sm">
              Citizen Discovery Profile
            </MaximalistBadge>
            <span className="text-xs font-semibold text-indian-green bg-indian-green-50 px-2 py-0.5 rounded-full border border-indian-green-200">
              {completion}% Complete
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-dark-text">
            Profile Attributes
          </h3>
        </div>

        <button
          onClick={onEdit}
          className="btn-primary px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-1 text-xs text-muted-text font-semibold mb-1">
            <MapPin className="w-3.5 h-3.5 text-saffron" />
            <span>Location</span>
          </div>
          <div className="font-bold text-dark-text truncate">
            {profile.district ? `${profile.district}, ${profile.state}` : (profile.state || 'Not specified')}
          </div>
        </div>

        <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-1 text-xs text-muted-text font-semibold mb-1">
            <User className="w-3.5 h-3.5 text-indian-green" />
            <span>Demographics</span>
          </div>
          <div className="font-bold text-dark-text truncate">
            {profile.age ? `${profile.age} yrs` : 'Age unset'} • {profile.gender || 'Any'}
          </div>
        </div>

        <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-1 text-xs text-muted-text font-semibold mb-1">
            <GraduationCap className="w-3.5 h-3.5 text-saffron" />
            <span>Education</span>
          </div>
          <div className="font-bold text-dark-text truncate">
            {profile.highest_qualification ? profile.highest_qualification.replace(/_/g, ' ') : 'Not specified'}
          </div>
        </div>

        <div className="p-3 bg-gray-50/70 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-1 text-xs text-muted-text font-semibold mb-1">
            <Briefcase className="w-3.5 h-3.5 text-indian-green" />
            <span>Occupation</span>
          </div>
          <div className="font-bold text-dark-text truncate">
            {profile.occupation || (profile.is_farmer ? 'Farmer' : (profile.is_student ? 'Student' : 'Not specified'))}
          </div>
        </div>
      </div>

      {profile.community_consent_granted && profile.community_category && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-muted-text font-medium">
          <ShieldCheck className="w-4 h-4 text-indian-green" />
          <span>Voluntary Community Category: <strong className="text-dark-text uppercase">{profile.community_category}</strong></span>
        </div>
      )}
    </div>
  );
};
