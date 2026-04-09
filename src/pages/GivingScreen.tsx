import ScreenHeader from '@/components/ScreenHeader';
import { Heart } from 'lucide-react';

/**
 * GivingScreen — hero + copy + gold CTA.
 * Figma reference: frame 5588:5080 (Mobile App section)
 */
export default function GivingScreen() {
  return (
    <div className="flex flex-col h-full bg-dark-surface text-dark-fg">
      <ScreenHeader title="Giving" />

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <div className="rounded-2xl overflow-hidden bg-dark-raised mt-2 aspect-[4/5] flex items-center justify-center">
          <Heart size={72} className="text-gold" strokeWidth={1} />
        </div>

        <h1 className="text-[22px] font-bold text-dark-fg mt-6 leading-tight">
          Support the Mission
        </h1>
        <p className="text-[14px] text-dark-muted mt-4 leading-relaxed">
          VerseMate is free to use. Your generous giving helps us keep building features, growing
          our content library, and reaching more readers around the world with God's Word.
        </p>
        <p className="text-[14px] text-dark-muted mt-3 leading-relaxed">
          Every contribution — large or small — makes a direct difference.
        </p>
      </div>

      <div className="shrink-0 px-5 pb-6 safe-bottom">
        <button className="w-full h-12 rounded-xl bg-gold text-[#1A1A1A] font-medium text-[15px]">
          Give Now
        </button>
      </div>
    </div>
  );
}
