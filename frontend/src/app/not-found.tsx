import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F9F9] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-12 rounded-3xl shadow-sm border border-brand-gray-light/30 max-w-lg w-full text-center">
        <div className="text-[120px] leading-none font-display font-bold text-brand-primary/20 mb-4 select-none">
          404
        </div>
        <h2 className="text-3xl font-display font-bold text-brand-secondary mb-3">Page Not Found</h2>
        <p className="text-brand-gray-dark mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-8 py-3.5 bg-brand-primary hover:bg-[#5a9361] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-brand-primary/20"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
