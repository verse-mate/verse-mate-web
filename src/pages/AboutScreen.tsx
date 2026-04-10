import { useNavigate } from 'react-router-dom';
import ScreenHeader from '@/components/ScreenHeader';

/**
 * AboutScreen — hero image + mission text, full dark.
 * Figma reference: frame 5588:4921 (Mobile App section)
 */
export default function AboutScreen() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-full text-white" style={{ backgroundColor: '#1B1B1B' }}>
      <ScreenHeader title="About" onBack={() => navigate('/menu')} />

      <div className="flex-1 overflow-y-auto px-5 pb-8" style={{ backgroundColor: '#000000' }}>
        <div className="rounded-2xl overflow-hidden mt-2 aspect-[4/5]" style={{ backgroundColor: '#323232' }}>
          <img
            src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&auto=format&fit=crop"
            alt="Bible on desk"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        <h1 className="text-[22px] font-bold mt-6 leading-tight" style={{ color: '#E7E7E7' }}>
          Built by Believers.<br />
          Guided by the Word.
        </h1>

        <p className="text-[14px] mt-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
          VerseMate is a nonprofit organization on a mission to make the Bible easier to
          understand, study, and love — for everyone, everywhere.
        </p>
        <p className="text-[14px] mt-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
          We are developers, translators, and believers from around the world, united by one
          calling: to help more people connect with God through His Word.
        </p>

      </div>
    </div>
  );
}
