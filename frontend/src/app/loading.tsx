import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F7F9F9] flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
      <p className="mt-4 text-brand-gray-dark font-medium animate-pulse">Loading...</p>
    </div>
  );
}
