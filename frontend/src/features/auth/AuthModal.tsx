import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { MaximalistBadge } from '../../components/MaximalistBadge';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        // Local guest session when Supabase keys are not provided yet in .env
        const localUser = {
          id: 'local-guest-user-id',
          email: email || 'citizen@nammaseve.local',
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('nammaseve_user', JSON.stringify(localUser));
        onAuthSuccess(localUser);
        onClose();
        return;
      }

      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          setInfoMsg('Account created successfully! Check your email to confirm registration or sign in.');
          setMode('signin');
        }
      } else if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          onAuthSuccess(data.user);
          onClose();
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setInfoMsg('Password reset instructions sent to your email.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = () => {
    const guestUser = {
      id: 'guest-session',
      email: 'guest@nammaseve.local',
      is_guest: true,
    };
    onAuthSuccess(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border-4 border-dark-text shadow-neo-xl rounded-2xl w-full max-w-md p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg border-2 border-dark-text hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-dark-text" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <MaximalistBadge variant="saffron" size="sm">
            Citizen Auth
          </MaximalistBadge>
          <MaximalistBadge variant="green" size="sm">
            Supabase Protected
          </MaximalistBadge>
        </div>

        <h3 className="text-2xl sm:text-3xl font-heading font-black text-dark-text mb-1">
          {mode === 'signup'
            ? t('auth.btn_register', 'Create Account')
            : mode === 'forgot'
            ? t('auth.btn_reset', 'Reset Password')
            : t('auth.modal_title', 'Sign In to NammaSeve')}
        </h3>

        <p className="text-xs sm:text-sm text-muted-text mb-6">
          {t('auth.modal_subtitle', 'Save schemes, sync your citizen profile across devices, and receive scheme updates.')}
        </p>

        {!isSupabaseConfigured && (
          <div className="mb-4 p-3 bg-amber-50 border-2 border-amber-400 rounded-xl text-xs text-amber-900 font-medium">
            Supabase credentials not yet set in <code className="bg-amber-100 px-1 rounded">frontend/.env</code>. Local demo mode is active. You can sign in with any email to test.
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-500 rounded-xl text-xs text-red-800 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="mb-4 p-3 bg-indian-green-50 border-2 border-indian-green rounded-xl text-xs text-indian-green-900 font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indian-green shrink-0" />
            <span>{infoMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-dark-text uppercase tracking-wider mb-1.5">
              {t('auth.email_label', 'Email Address')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-text absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="neo-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-dark-text uppercase tracking-wider">
                  {t('auth.password_label', 'Password')}
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs font-bold text-saffron-700 hover:underline cursor-pointer"
                  >
                    {t('auth.btn_reset', 'Forgot?')}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-text absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="neo-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="neo-button-primary w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'signup'
                    ? t('auth.btn_register', 'Create Account')
                    : mode === 'forgot'
                    ? 'Send Reset Link'
                    : t('auth.btn_login', 'Sign In')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t-2 border-gray-200 text-center space-y-2">
          {mode === 'signin' ? (
            <button
              onClick={() => { setMode('signup'); setErrorMsg(null); }}
              className="text-xs font-bold text-saffron-700 hover:underline block mx-auto cursor-pointer"
            >
              {t('auth.toggle_to_register', "Don't have an account? Register here")}
            </button>
          ) : (
            <button
              onClick={() => { setMode('signin'); setErrorMsg(null); }}
              className="text-xs font-bold text-saffron-700 hover:underline block mx-auto cursor-pointer"
            >
              {t('auth.toggle_to_login', 'Already have an account? Sign in here')}
            </button>
          )}

          <button
            onClick={handleGuestContinue}
            className="text-xs font-bold text-muted-text hover:text-dark-text underline block mx-auto cursor-pointer pt-1"
          >
            {t('auth.guest_mode', 'Continue as Guest (No account needed)')}
          </button>
        </div>
      </div>
    </div>
  );
};
