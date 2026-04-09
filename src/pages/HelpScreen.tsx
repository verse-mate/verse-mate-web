import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, CheckCircle } from 'lucide-react';

type HelpState = 'form' | 'submitting' | 'success';

export default function HelpScreen() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<HelpState>('form');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!message.trim()) return;
    setFormState('submitting');
    setTimeout(() => setFormState('success'), 1500);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <button onClick={() => navigate('/menu')} className="p-2 -ml-2 rounded-full hover:bg-secondary">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Help & Feedback</h1>
      </header>
      <div className="flex-1 flex flex-col p-6">
        {formState === 'form' && (
          <>
            <p className="text-sm text-muted-foreground mb-4">Have a question or suggestion? We'd love to hear from you.</p>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={6}
              className="w-full rounded-lg border border-input bg-card text-foreground px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={!message.trim()}
              className="mt-4 flex items-center justify-center gap-2 py-3 rounded-lg bg-accent text-accent-foreground font-medium text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              <Send size={16} /> Send Feedback
            </button>
          </>
        )}
        {formState === 'submitting' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Sending your feedback...</p>
          </div>
        )}
        {formState === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <CheckCircle size={48} className="text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Thank you!</h2>
            <p className="text-sm text-muted-foreground">Your feedback has been received. We'll get back to you soon.</p>
            <button
              onClick={() => navigate('/menu')}
              className="mt-4 py-3 px-6 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Back to Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
