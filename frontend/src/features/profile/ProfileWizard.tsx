import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  User, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Check
} from 'lucide-react';
import { UserProfile } from '../../types';
import { calculateProfileCompletion } from '../../lib/eligibilityEngine';
import { MaximalistBadge } from '../../components/MaximalistBadge';
import { TreeLogo } from '../../components/TreeLogo';

interface ProfileWizardProps {
  initialProfile?: UserProfile;
  onSave: (profile: UserProfile) => void;
  onClose?: () => void;
  isModal?: boolean;
}

const KARNATAKA_DISTRICTS = [
  'Bagalkote', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
  'Bidar', 'Chamarajanagara', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga',
  'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan',
  'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal',
  'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga',
  'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayanagara', 'Vijayapura', 'Yadgir'
];

export const ProfileWizard: React.FC<ProfileWizardProps> = ({
  initialProfile,
  onSave,
  onClose,
  isModal = false,
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<UserProfile>(() => ({
    preferred_language: initialProfile?.preferred_language || 'en',
    state: initialProfile?.state || 'Karnataka',
    district: initialProfile?.district || 'Bengaluru Urban',
    age: initialProfile?.age || undefined,
    gender: initialProfile?.gender || undefined,
    is_woman_head_of_family: initialProfile?.is_woman_head_of_family || false,
    community_consent_granted: initialProfile?.community_consent_granted || false,
    community_category: initialProfile?.community_category || undefined,
    highest_qualification: initialProfile?.highest_qualification || undefined,
    degree_stream: initialProfile?.degree_stream || '',
    education_status: initialProfile?.education_status || undefined,
    is_student: initialProfile?.is_student || false,
    occupation: initialProfile?.occupation || undefined,
    is_farmer: initialProfile?.is_farmer || false,
    landholding_acres: initialProfile?.landholding_acres || 0,
    annual_income_range: initialProfile?.annual_income_range || undefined,
    ration_card_type: initialProfile?.ration_card_type || undefined,
    is_tax_payer: initialProfile?.is_tax_payer || false,
    disability_status: initialProfile?.disability_status || false,
  }));

  const updateField = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'occupation') {
        if (value === 'farmer') updated.is_farmer = true;
        if (value === 'student') updated.is_student = true;
      }
      if (field === 'education_status' && value === 'studying') {
        updated.is_student = true;
      }

      return updated;
    });
  };

  const completionPercent = calculateProfileCompletion(formData);

  const handleFinish = () => {
    const finalProfile: UserProfile = {
      ...formData,
      profile_completion_percentage: completionPercent,
      updated_at: new Date().toISOString(),
    };
    onSave(finalProfile);
  };

  const steps = [
    { num: 1, title: t('profile.step_location', 'Location'), icon: <MapPin className="w-3.5 h-3.5" /> },
    { num: 2, title: t('profile.step_demographics', 'Demographics'), icon: <User className="w-3.5 h-3.5" /> },
    { num: 3, title: t('profile.step_education', 'Education'), icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { num: 4, title: t('profile.step_occupation', 'Occupation'), icon: <Briefcase className="w-3.5 h-3.5" /> },
    { num: 5, title: t('profile.step_vulnerability', 'Consent & Criteria'), icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  const content = (
    <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto">
      {/* Header & Completion Meter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MaximalistBadge variant="saffron" size="sm">
              Personal-Profile-First
            </MaximalistBadge>
            <span className="text-xs text-muted-text font-medium">Step {currentStep} of 5</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-dark-text">
            {t('profile.title', 'Your Citizen Profile')}
          </h2>
          <p className="text-xs sm:text-sm text-muted-text">
            {t('profile.subtitle', 'All fields are voluntary. Used strictly to calculate scheme eligibility.')}
          </p>
        </div>

        {/* Completion Gauge */}
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 shrink-0">
          <div className="flex flex-col text-right">
            <span className="text-[11px] font-medium text-muted-text">Strength</span>
            <span className="text-base font-bold text-indian-green">{completionPercent}%</span>
          </div>
          <div className="w-9 h-9 rounded-full border-3 border-gray-200 border-t-indian-green flex items-center justify-center font-bold text-xs text-dark-text">
            {completionPercent}%
          </div>
        </div>
      </div>

      {/* Step Tabs Navigation */}
      <div className="flex items-center justify-between gap-1 mb-8 overflow-x-auto pb-2 border-b border-gray-100">
        {steps.map(s => (
          <button
            key={s.num}
            onClick={() => setCurrentStep(s.num)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              currentStep === s.num
                ? 'bg-saffron text-white shadow-2xs'
                : s.num < currentStep
                ? 'bg-indian-green-50 text-indian-green-900 border border-indian-green-200'
                : 'text-muted-text hover:text-dark-text hover:bg-gray-50'
            }`}
          >
            {s.icon}
            <span>{s.title}</span>
          </button>
        ))}
      </div>

      {/* Step 1: Location */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div>
            <label className="block text-sm font-semibold text-dark-text mb-1.5">
              {t('profile.state_label', 'State of Residence')}
            </label>
            <select
              value={formData.state || 'Karnataka'}
              onChange={e => updateField('state', e.target.value)}
              className="minimal-input w-full p-2.5 text-sm font-medium"
            >
              <option value="Karnataka">Karnataka (ಕರ್ನಾಟಕ)</option>
              <option value="Central">All India / Central Resident</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Kerala">Kerala</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Telangana">Telangana</option>
            </select>
            <p className="text-xs text-muted-text mt-1">
              Determines whether you qualify for Karnataka State-specific schemes (like Seva Sindhu) or Central schemes.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark-text mb-1.5">
              {t('profile.district_label', 'District')}
            </label>
            <select
              value={formData.district || ''}
              onChange={e => updateField('district', e.target.value)}
              className="minimal-input w-full p-2.5 text-sm font-medium"
            >
              <option value="">Select your district...</option>
              {KARNATAKA_DISTRICTS.map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Step 2: Demographics */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark-text mb-1.5">
                {t('profile.age_label', 'Age (in years)')}
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={formData.age !== undefined ? formData.age : ''}
                onChange={e => updateField('age', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 24"
                className="minimal-input w-full p-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-text mb-1.5">
                {t('profile.gender_label', 'Gender')}
              </label>
              <select
                value={formData.gender || ''}
                onChange={e => updateField('gender', e.target.value as any)}
                className="minimal-input w-full p-2.5 text-sm font-medium"
              >
                <option value="">Select gender...</option>
                <option value="female">Female (ಮಹಿಳೆ)</option>
                <option value="male">Male (ಪುರುಷ)</option>
                <option value="transgender">Transgender (ಲಿಂಗತ್ವ ಅಲ್ಪಸಂಖ್ಯಾತರು)</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-saffron-50/60 border border-saffron-200 rounded-xl flex items-center justify-between gap-4">
            <div>
              <span className="font-semibold text-dark-text text-sm block">
                {t('profile.woman_head_label', 'Are you the woman head of your family?')}
              </span>
              <span className="text-xs text-muted-text">
                Relevant for schemes providing DBT to the female family head named on ration cards.
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.is_woman_head_of_family || false}
              onChange={e => updateField('is_woman_head_of_family', e.target.checked)}
              className="w-5 h-5 rounded accent-saffron cursor-pointer shrink-0"
            />
          </div>
        </div>
      )}

      {/* Step 3: Education */}
      {currentStep === 3 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div>
            <label className="block text-sm font-semibold text-dark-text mb-1.5">
              {t('profile.qualification_label', 'Highest Educational Qualification')}
            </label>
            <select
              value={formData.highest_qualification || ''}
              onChange={e => updateField('highest_qualification', e.target.value as any)}
              className="minimal-input w-full p-2.5 text-sm font-medium"
            >
              <option value="">Select qualification...</option>
              <option value="none">No Formal Schooling</option>
              <option value="primary">Primary School (Class 1-7)</option>
              <option value="secondary_10th">10th Standard / SSLC</option>
              <option value="higher_secondary_12th_puc">12th / PUC / Higher Secondary</option>
              <option value="diploma">Polytechnic Diploma</option>
              <option value="undergraduate">Undergraduate Degree (BA, BSc, BCom, BE, etc.)</option>
              <option value="postgraduate">Postgraduate Degree (MA, MSc, MTech, etc.)</option>
              <option value="doctorate">Doctorate / Ph.D.</option>
              <option value="vocational">Vocational / ITI Certification</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark-text mb-1.5">
              {t('profile.degree_label', 'Degree / Stream (Optional)')}
            </label>
            <input
              type="text"
              value={formData.degree_stream || ''}
              onChange={e => updateField('degree_stream', e.target.value)}
              placeholder="e.g. Mechanical Engineering, Arts, Commerce"
              className="minimal-input w-full p-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark-text mb-1.5">
              {t('profile.education_status_label', 'Current Education Status')}
            </label>
            <select
              value={formData.education_status || ''}
              onChange={e => updateField('education_status', e.target.value as any)}
              className="minimal-input w-full p-2.5 text-sm font-medium"
            >
              <option value="">Select current status...</option>
              <option value="studying">Currently Enrolled / Studying</option>
              <option value="graduated">Graduated (Completed Studies)</option>
              <option value="seeking_employment">Graduated & Seeking Employment</option>
              <option value="not_enrolled">Not Currently Enrolled</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 4: Occupation */}
      {currentStep === 4 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div>
            <label className="block text-sm font-semibold text-dark-text mb-1.5">
              {t('profile.occupation_label', 'Primary Occupation / Employment Status')}
            </label>
            <select
              value={formData.occupation || ''}
              onChange={e => updateField('occupation', e.target.value as any)}
              className="minimal-input w-full p-2.5 text-sm font-medium"
            >
              <option value="">Select occupation...</option>
              <option value="unemployed">Unemployed / Job Seeker</option>
              <option value="farmer">Farmer / Agricultural Cultivator</option>
              <option value="student">Student</option>
              <option value="homemaker">Homemaker</option>
              <option value="daily_wage">Daily Wage / Construction / Informal Worker</option>
              <option value="self_employed">Self-Employed / Small Business / Trader</option>
              <option value="salaried_private">Private Sector Employee</option>
              <option value="government_employee">Government / Public Sector Employee</option>
              <option value="retired">Retired / Senior</option>
            </select>
          </div>

          <div className="p-4 bg-indian-green-50/60 border border-indian-green-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-dark-text text-sm block">
                  {t('profile.farmer_status_label', 'Are you a farmer or landholder?')}
                </span>
                <span className="text-xs text-muted-text">
                  Matches you with PM-KISAN, crop insurance, and agricultural subsidies.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.is_farmer || false}
                onChange={e => updateField('is_farmer', e.target.checked)}
                className="w-5 h-5 rounded accent-indian-green cursor-pointer shrink-0"
              />
            </div>

            {formData.is_farmer && (
              <div className="pt-2 border-t border-indian-green-200">
                <label className="block text-xs font-semibold text-dark-text mb-1">
                  {t('profile.land_acres_label', 'Agricultural Landholding in Acres')}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.landholding_acres || ''}
                  onChange={e => updateField('landholding_acres', Number(e.target.value))}
                  placeholder="e.g. 2.5"
                  className="minimal-input w-full p-2 text-sm"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark-text mb-1.5">
                {t('profile.income_range_label', 'Annual Family Income Range')}
              </label>
              <select
                value={formData.annual_income_range || ''}
                onChange={e => updateField('annual_income_range', e.target.value as any)}
                className="minimal-input w-full p-2.5 text-sm font-medium"
              >
                <option value="">Select income range...</option>
                <option value="below_1_lakh">Below ₹1 Lakh / year</option>
                <option value="1_to_2.5_lakh">₹1 Lakh to ₹2.5 Lakhs</option>
                <option value="2.5_to_5_lakh">₹2.5 Lakhs to ₹5 Lakhs</option>
                <option value="5_to_8_lakh">₹5 Lakhs to ₹8 Lakhs</option>
                <option value="above_8_lakh">Above ₹8 Lakhs / year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-text mb-1.5">
                {t('profile.ration_card_label', 'Ration Card Category')}
              </label>
              <select
                value={formData.ration_card_type || ''}
                onChange={e => updateField('ration_card_type', e.target.value as any)}
                className="minimal-input w-full p-2.5 text-sm font-medium"
              >
                <option value="">Select ration card...</option>
                <option value="bpl">BPL (Below Poverty Line) Card</option>
                <option value="aay_antyodaya">Antyodaya Anna Yojana (AAY)</option>
                <option value="apl">APL (Above Poverty Line) Card</option>
                <option value="none">No Ration Card</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Community & Consent & Special Criteria */}
      {currentStep === 5 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indian-green shrink-0 mt-0.5" />
              <div>
                <h4 className="font-heading font-bold text-dark-text text-sm sm:text-base">
                  {t('profile.community_consent_title', 'Community & Caste Category (Optional)')}
                </h4>
                <p className="text-xs text-muted-text mt-0.5 leading-relaxed">
                  {t('profile.community_consent_desc', 'Certain government welfare programs require community classification. We request this with your explicit consent and never share it externally.')}
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2.5 p-2.5 bg-white border border-gray-200 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={formData.community_consent_granted || false}
                onChange={e => updateField('community_consent_granted', e.target.checked)}
                className="w-4 h-4 rounded accent-saffron cursor-pointer shrink-0"
              />
              <span className="text-xs font-semibold text-dark-text">
                {t('profile.community_consent_checkbox', 'I voluntarily consent to provide my community category to discover specialized schemes.')}
              </span>
            </label>

            {formData.community_consent_granted && (
              <div className="pt-2 animate-in fade-in duration-150">
                <label className="block text-xs font-semibold text-dark-text mb-1">
                  {t('profile.community_label', 'Social / Community Category')}
                </label>
                <select
                  value={formData.community_category || ''}
                  onChange={e => updateField('community_category', e.target.value as any)}
                  className="minimal-input w-full p-2 text-sm font-medium"
                >
                  <option value="">Select category...</option>
                  <option value="general">General / Unreserved</option>
                  <option value="obc">OBC (Other Backward Classes / Category 1, 2A, 2B, 3A, 3B)</option>
                  <option value="sc">Scheduled Caste (SC)</option>
                  <option value="st">Scheduled Tribe (ST)</option>
                  <option value="minority">Religious / Linguistic Minority</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-dark-text text-sm block">
                  {t('profile.disability_label', 'Person with Benchmark Disability (PwD)?')}
                </span>
                <span className="text-xs text-muted-text">
                  Helps identify assistive aid schemes, specialized quotas, and transport grants.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.disability_status || false}
                onChange={e => updateField('disability_status', e.target.checked)}
                className="w-5 h-5 rounded accent-dark-text cursor-pointer shrink-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-5 border-t border-gray-100">
        <div>
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="btn-secondary px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('profile.btn_prev', 'Previous')}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="btn-primary px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t('profile.btn_next', 'Next Step')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="btn-green px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>{t('profile.btn_save', 'Save Profile & Match Schemes')}</span>
            </button>
          )}

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="text-muted-text hover:text-dark-text text-xs font-semibold underline ml-2 cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
        <div className="w-full max-w-3xl my-8">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
