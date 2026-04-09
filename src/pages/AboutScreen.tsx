import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function AboutScreen() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <button onClick={() => navigate('/menu')} className="p-2 -ml-2 rounded-full hover:bg-secondary">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-foreground">About</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <h2 className="text-2xl font-serif font-semibold text-foreground">VerseMate</h2>
        <p className="text-muted-foreground leading-relaxed">
          VerseMate is a mobile-first Bible reading companion designed to help you engage deeply with Scripture. Read, annotate, highlight, and explore God's Word with a clean, reverent interface.
        </p>
        <p className="text-sm text-muted-foreground">Version 1.0.0</p>
      </div>
    </div>
  );
}
