import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronDown } from 'lucide-react';
import ScreenHeader from '@/components/ScreenHeader';

type HelpState = 'form' | 'submitting' | 'success';

const TOPICS = ['Bug report', 'Feature request', 'Content correction', 'Account / sign-in', 'Other'];

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
    <div className="flex flex-col h-full" style={{ backgroundColor: '#ffffff' }}>
      <ScreenHeader title="Help & Feedback" onBack={() => navigate('/menu')} />

      <div className="flex-1 overflow-y-auto px-5 pb-8" style={{ backgroundColor: '#ffffff' }}>
        {formState === 'form' && (
          <>
            <h2 className="text-[22px] font-bold mt-2" style={{ color: '#1B1B1B' }}>How can we help?</h2>
            <p className="text-[14px] mt-2 leading-relaxed" style={{ color: '#818990' }}>
              Select a topic and tell us what happened. We read every message.
            </p>

            {/* Topic */}
            <div className="mt-6">
              <label className="text-[13px]" style={{ color: '#818990' }}>
                Topic<span className="text-red-400 ml-0.5">*</span>
              </label>
              <button
                onClick={() => setShowTopicPicker(v => !v)}
                className="mt-1.5 w-full h-[56px] px-4 rounded-xl flex items-center justify-between"
                style={{ backgroundColor: '#f8f9fa', border: '1px solid #dce0e380' }}
              >
                <span className="text-[15px]" style={{ color: topic ? '#1B1B1B' : '#818990' }}>
                  {topic || 'Select a topic'}
                </span>
                <ChevronDown size={18} style={{ color: '#818990' }} />
              </button>
              {showTopicPicker && (
                <div className="mt-2 rounded-xl overflow-hidden" style={{ backgroundColor: '#f8f9fa', border: '1px solid #dce0e380' }}>
                  {TOPICS.map(t => (
                    <button
                      key={t}
                      onClick={() => {
                        setTopic(t);
                        setShowTopicPicker(false);
                      }}
                      className="w-full text-left px-4 py-3 text-[14px]"
                      style={{ color: '#1B1B1B' }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Message */}
            <div className="mt-5">
              <label className="text-[13px]" style={{ color: '#818990' }}>Your message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
                className="mt-1.5 w-full rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#B09A6D] resize-none"
                style={{ backgroundColor: '#f8f9fa', border: '1px solid #dce0e380', color: '#1B1B1B' }}
                placeholder="Describe the issue..."
              />
            </div>
          </>
        )}

        {formState === 'submitting' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 pt-24">
            <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#b09a6d', borderTopColor: 'transparent' }} />
            <p className="text-[14px] mt-3" style={{ color: '#818990' }}>Sending your feedback...</p>
          </div>
        )}

        {formState === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center pt-20 text-center">
            <CheckCircle size={72} style={{ color: '#b09a6d' }} strokeWidth={1.5} />
            <p className="text-[15px] mt-5" style={{ color: '#1B1B1B' }}>Message sent.</p>
            <p className="text-[15px]" style={{ color: '#1B1B1B' }}>
              Thanks for helping us improve VerseMate!
            </p>
          </div>
        )}
      </div>

      {formState !== 'submitting' && (
        <div className="shrink-0 px-5 pb-6 safe-bottom">
          {formState === 'form' ? (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full h-12 rounded-xl font-medium text-[15px] disabled:opacity-40"
              style={{ backgroundColor: '#b09a6d', color: '#ffffff' }}
            >
              Submit
            </button>
          ) : (
            <button
              onClick={() => navigate('/menu')}
              className="w-full h-12 rounded-xl font-medium text-[15px]"
              style={{ backgroundColor: '#b09a6d', color: '#ffffff' }}
            >
              Done
            </button>
          )}
        </div>
      )}
    </div>
  );
}
