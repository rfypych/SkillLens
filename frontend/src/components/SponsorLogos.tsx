'use client';

export default function SponsorLogos() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-6 border-t border-brand-gray-light/30 mt-auto px-2">
      <img src="/sponsors/jhic.png" alt="JHIC" className="h-16 md:h-20 scale-125 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 object-contain mx-2" />
      <img src="/sponsors/jagoanhosting.png" alt="Jagoan Hosting" className="h-5 md:h-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 object-contain" />
      <img src="/sponsors/komdigi.png" alt="Komdigi" className="h-5 md:h-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 object-contain" />
      <img src="/sponsors/garudaspark.png" alt="Garuda Spark" className="h-5 md:h-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 object-contain" />
      <img src="/sponsors/ngalup.png" alt="Ngalup" className="h-5 md:h-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 object-contain" />
    </div>
  );
}
