import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronDown } from 'lucide-react';
import ScreenHeader from '@/components/ScreenHeader';

type HelpState = 'form' | 'submitting' | 'success';

const TOPICS = ['Bug report', 'Feature request', 'Content correction', 'Account / sign-in', 'Other'];

/**
 * HelpScreen — Help & Feedback three states.
 * Figma references: frames 5588:5180 (form), 5588:15822 (submitting), 5588:5280 (success).
 */
export default function HelpScreen() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<HelpState>('form');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [showTopicPicker, setShowTopicPicker] = useState(false);

  const canSubmit = topic && message.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setFormState('submitting');
    setTimeout(() => setFormState('success'), 1500);
  };

  return (
    <div className="flex flex-col h-full bg-dark-surface text-dark-fg">
      <ScreenHeader title="Help & Feedback" />

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {formState === 'form' && (
          <>
            <h2 className="text-[22px] font-bold text-dark-fg mt-2">How can we help?</h2>
            <p className="text-[14px] text-dark-muted mt-2 leading-relaxed">
              Select a topic and tell us what happened. We read every message.
            </p>

            {/* Topic */}
            <div className="mt-6">
              <label className="text-[13px] text-dark-muted">
                Topic<span className="text-red-400 ml-0.5">*</span>
              </label>
              <button
                onClick={() => setShowTopicPicker(v => !v)}
                className="mt-1.5 w-full h-[56px] px-4 rounded-xl bg-dark-raised border border-dark flex items-center justify-between"
              >
                <span className={topic ? 'text-dark-fg text-[15px]' : 'text-dark-muted text-[15px]'}>
                  {topic || 'Select a topic'}
                </span>
                <ChevronDown size={18} className="text-dark-muted" />
              </button>
              {showTopicPicker && (
                <div className="mt-2 rounded-xl bg-dark-raised border border-dark overflow-hidden">
                  {TOPICS.map(t => (
                    <button
                      key={t}
                      onClick={() => {
                        setTopic(t);
                        setShowTopicPicker(false);
                      }}
                      className="w-full text-left px-4 py-3 text-[14px] text-dark-fg hover:bg-dark-surface"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Message */}
            <div className="mt-5">
              <label className="text-[13px] text-dark-muted">Your message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
                className="mt-1.5 w-full rounded-xl bg-dark-raised border border-dark px-4 py-3 text-[14px] text-dark-fg placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] resize-none"
              />
            </div>
          </>
        )}

        {formState === 'submitting' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 pt-24">
            <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <p className="text-[14px] text-dark-muted mt-3">Sending your feedback…</p>
          </div>
        )}

        {formState === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center pt-20 text-center">
            <CheckCircle size={72} className="text-gold" strokeWidth={1.5} />
            <p className="text-[15px] text-dark-fg mt-5">Message sent.</p>
            <p className="text-[15px] text-dark-fg">
              Thanks for helping us improve VerseMate!
            </p>
          </div>
        )}
      </div>

      {/* Bottom CTA — only visible on form + success */}
      {formState !== 'submitting' && (
        <div className="shrink-0 px-5 pb-6 safe-bottom">
          {formState === 'form' ? (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full h-12 rounded-xl bg-gold text-[#1A1A1A] font-medium text-[15px] disabled:opacity-40"
            >
              Submit
            </button>
          ) : (
            <button
              onClick={() => navigate('/menu')}
              className="w-full h-12 rounded-xl bg-gold text-[#1A1A1A] font-medium text-[15px]"
            >
              Done
            </button>
          )}
        </div>
      )}
    </div>
  );
}
