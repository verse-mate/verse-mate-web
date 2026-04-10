import { useNavigate } from 'react-router-dom';
import ScreenHeader from '@/components/ScreenHeader';

export default function GivingScreen() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#1B1B1B' }}>
      <ScreenHeader title="Giving" onBack={() => navigate('/menu')} />

      <div className="flex-1 overflow-y-auto min-h-0 px-5 pb-8" style={{ backgroundColor: '#000000' }}>
        <div className="pt-4">
          <p className="text-[12px] font-semibold tracking-[0.14em] uppercase" style={{ color: '#E7E7E7' }}>
            SUPPORT VERSEMATE
          </p>
          <div className="h-[2px] w-32 mt-2" style={{ backgroundColor: '#B09A6D', opacity: 0.8 }} />
        </div>

        <h1 className="text-[26px] font-bold mt-6 leading-[1.15]" style={{ color: '#E7E7E7' }}>
          Help People<br />
          Everywhere Engage<br />
          with God's Word
        </h1>

        <p className="text-[14px] mt-5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Your generosity helps us create resources and tools that make Scripture clear and
          accessible to people worldwide. Every gift you give makes a direct impact — whether
          it's supporting the translation of content, improving our technology, or helping us
          reach new communities with the truth of God's Word.
        </p>
        <p className="text-[14px] mt-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Through your partnership, VerseMate can continue developing simple, powerful tools
          that guide people not only to read the Bible, but to truly understand and apply it in
          their daily lives. We believe that when people engage Scripture with clarity,
          transformation follows — families are encouraged, faith grows stronger, and entire
          communities can be renewed.
        </p>
      </div>
    </div>
  );
}
