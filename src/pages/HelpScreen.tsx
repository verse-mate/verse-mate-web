import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronDown } from 'lucide-react';
import ScreenHeader from '@/components/ScreenHeader';
import { vmTokens } from '@/styles/themeStyles';
import { useApp } from '@/contexts/AppContext';
import { postSupportConversation } from '@/lib/support';

type HelpState = 'form' | 'submitting' | 'success' | 'error';

const TOPICS = [
  'Report an App problem',
  'Login/Password',
  'Suggestions and ideas',
  'Other',
];

export default function HelpScreen() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [formState, setFormState] = useState<HelpState>('form');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [showTopicPicker, setShowTopicPicker] = useState(false);

  if (!state.isSignedIn) {
    const returnTo = encodeURIComponent('/menu/help');
    navigate(`/login?returnTo=${returnTo}`, { replace: true });
    return null;
  }

  const canSubmit = topic && message.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setFormState('submitting');
    try {
      await postSupportConversation(message.trim(), topic);
      setFormState('success');
    } catch {
      setFormState('error');
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: vmTokens.commentaryBg }}>
      <ScreenHeader title="Help & Feedback" onBack={() => navigate('/menu')} />

      <div className="sub-screen-body flex-1 px-5 pb-8" style={{ backgroundColor: vmTokens.commentaryBg }}>
        {(formState === 'form' || formState === 'error') && (
          <>
            <h2 className="text-[22px] font-bold mt-2" style={{ color: vmTokens.textPrimary }}>How can we help?</h2>
            <p className="text-[14px] mt-2 leading-relaxed" style={{ color: vmTokens.textTertiary }}>
              Select a topic and tell us what happened. We read every message.
            </p>

            {formState === 'error' && (
              <div className="mt-4 px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <p className="text-[14px]" style={{ color: '#ef4444' }}>
                  Something went wrong. Please try again.
                </p>
              </div>
            )}

            {/* Topic */}
            <div className="mt-6">
              <label className="text-[13px]" style={{ color: vmTokens.textTertiary }}>
                Topic<span className="text-red-400 ml-0.5">*</span>
              </label>
              <button
                onClick={() => setShowTopicPicker(v => !v)}
                className="mt-1.5 w-full h-[56px] px-4 rounded-xl flex items-center justify-between"
                style={{ backgroundColor: vmTokens.surfaceRaisedBg, border: `1px solid ${vmTokens.divider}` }}
              >
                <span className="text-[15px]" style={{ color: topic ? vmTokens.textPrimary : vmTokens.textMuted }}>
                  {topic || 'Select a topic'}
                </span>
                <ChevronDown size={18} style={{ color: vmTokens.textTertiary }} />
              </button>
              {showTopicPicker && (
                <div className="mt-2 rounded-xl overflow-hidden" style={{ backgroundColor: vmTokens.surfaceRaisedBg, border: `1px solid ${vmTokens.divider}` }}>
                  {TOPICS.map(t => (
                    <button
                      key={t}
                      onClick={() => {
                        setTopic(t);
                        setShowTopicPicker(false);
                      }}
                      className="w-full text-left px-4 py-3 text-[14px]"
                      style={{ color: vmTokens.textPrimary }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Message */}
            <div className="mt-5">
              <label className="text-[13px]" style={{ color: vmTokens.textTertiary }}>Your message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
                className="mt-1.5 w-full rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B09A6D] resize-none"
                style={{ backgroundColor: vmTokens.surfaceRaisedBg, border: `1px solid ${vmTokens.divider}`, color: vmTokens.textPrimary }}
                placeholder="Describe the issue..."
              />
            </div>
          </>
        )}

        {formState === 'submitting' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 pt-24">
            <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: vmTokens.gold, borderTopColor: 'transparent' }} />
            <p className="text-[14px] mt-3" style={{ color: vmTokens.textTertiary }}>Sending your feedback...</p>
          </div>
        )}

        {formState === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center pt-20 text-center">
            <CheckCircle size={72} style={{ color: vmTokens.gold }} strokeWidth={1.5} />
            <p className="text-[15px] mt-5" style={{ color: vmTokens.textPrimary }}>Message sent.</p>
            <p className="text-[14px] mt-2" style={{ color: vmTokens.textTertiary }}>
              Thanks for reaching out — we read every message and will get back to you if needed.
            </p>
          </div>
        )}
      </div>

      {formState !== 'submitting' && (
        <div className="shrink-0 px-5 pb-6 safe-bottom" style={{ backgroundColor: vmTokens.commentaryBg }}>
          {formState === 'success' ? (
            <button
              onClick={() => navigate('/menu')}
              className="w-full h-12 rounded-xl font-medium text-[15px]"
              style={{ backgroundColor: vmTokens.gold, color: vmTokens.goldOnLight }}
            >
              Done
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full h-12 rounded-xl font-medium text-[15px] disabled:opacity-40"
              style={{ backgroundColor: vmTokens.gold, color: vmTokens.goldOnLight }}
            >
              {formState === 'error' ? 'Try Again' : 'Send'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
