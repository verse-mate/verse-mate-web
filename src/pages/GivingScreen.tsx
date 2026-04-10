import ScreenHeader from '@/components/ScreenHeader';

/**
 * GivingScreen — full dark. Figma: 5588:5080.
 * "SUPPORT VERSEMATE" small caps caption, bold serif headline, body paragraphs.
 * No CTA button in the Figma.
 */
export default function GivingScreen() {
  return (
    <div className="flex flex-col h-full bg-white text-[#1B1B1B]">
      <ScreenHeader title="Giving" />

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <div className="pt-4">
          <p className="text-[12px] font-semibold tracking-[0.14em] text-[#1B1B1B] uppercase">
            SUPPORT VERSEMATE
          </p>
          <div className="h-[2px] bg-gold/80 w-32 mt-2" />
        </div>

        <h1 className="text-[26px] font-bold text-[#1B1B1B] mt-6 leading-[1.15]">
          Help People<br />
          Everywhere Engage<br />
          with God's Word
        </h1>

        <p className="text-[14px] text-[#818990] mt-5 leading-relaxed">
          Your generosity helps us create resources and tools that make Scripture clear and
          accessible to people worldwide. Every gift you give makes a direct impact — whether
          it's supporting the translation of content, improving our technology, or helping us
          reach new communities with the truth of God's Word.
        </p>
        <p className="text-[14px] text-[#818990] mt-4 leading-relaxed">
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
