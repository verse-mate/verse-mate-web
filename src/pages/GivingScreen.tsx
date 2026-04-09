import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart } from 'lucide-react';

export default function GivingScreen() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <button onClick={() => navigate('/menu')} className="p-2 -ml-2 rounded-full hover:bg-secondary">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Giving</h1>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
          <Heart size={28} className="text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-serif font-semibold text-foreground mb-2">Support VerseMate</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            VerseMate is free to use. Your generous support helps us keep developing features and providing Bible content to readers worldwide.
          </p>
        </div>
        <button className="w-full max-w-xs py-3 rounded-lg bg-accent text-accent-foreground font-medium text-sm hover:opacity-90 transition-opacity">
          Give Now
        </button>
      </div>
    </div>
  );
}
