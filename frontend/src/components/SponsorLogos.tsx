'use client';

export default function SponsorLogos() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-6 border-t border-brand-gray-light/30 mt-auto">
      <img src="/sponsors/jhic.png" alt="JHIC" className="h-10 md:h-14 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 object-contain" />
      <img src="/sponsors/jagoanhosting.png" alt="Jagoan Hosting" className="h-6 md:h-8 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 object-contain" />
      <img src="/sponsors/komdigi.png" alt="Komdigi" className="h-6 md:h-8 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 object-contain" />
      <img src="/sponsors/garudaspark.png" alt="Garuda Spark" className="h-6 md:h-8 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 object-contain" />
      <img src="/sponsors/ngalup.png" alt="Ngalup" className="h-6 md:h-8 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 object-contain" />
    </div>
  );
}
