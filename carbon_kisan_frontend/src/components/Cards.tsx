'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Cards() {
  const router = useRouter();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 z-10 relative pb-20">
      {/* Farmer Card */}
      <div className="glass-panel rounded-3xl p-8 flex flex-col items-center text-center relative border-t border-white/80 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300">
        <div className="absolute top-4 left-4 text-green-700/20">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>

        {/* Farm Illustration */}
        <div className="w-40 h-32 mb-6 mt-4 relative overflow-hidden rounded-xl">
          <Image
            src="/farmer.png"
            alt="Farmer"
            fill
            className="object-cover"
          />
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">I'm a <span className="text-[#9ed28f]">Farmer</span></h2>
        <p className="text-white/80 mb-8 max-w-xs font-medium">Earn carbon credits from sustainable farming practices.</p>

        {/* Button */}
        <div className="mt-auto w-full">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-4 rounded-xl font-bold text-lg shadow-lg bg-[#9ed28f] text-gray-900 hover:bg-white transition-all duration-300 border border-white/40"
          >
            Get Started as Farmer
          </button>
        </div>
      </div>

      {/* Business Card */}
      <div className="glass-panel rounded-3xl p-8 flex flex-col items-center text-center relative border-t border-white/80 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300">
        <div className="absolute top-4 right-4 text-blue-700/20">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
            <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M16 10h.01M8 10h.01M8 14h.01M12 14h.01M16 14h.01" />
          </svg>
        </div>

        {/* City Illustration */}
        <div className="w-40 h-32 mb-6 mt-4 relative overflow-hidden rounded-xl">
          <Image
            src="/business.png"
            alt="Business"
            fill
            className="object-cover"
          />
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">I'm a <span className="text-blue-300">Business</span></h2>
        <p className="text-white/80 mb-8 max-w-xs font-medium">Purchase verified carbon credits to offset your emissions.</p>

        {/* Button */}
        <div className="mt-auto w-full">
          <button
            onClick={() => router.push('/business')}
            className="w-full py-4 rounded-xl font-bold text-lg shadow-lg bg-blue-400 text-gray-900 hover:bg-white transition-all duration-300 border border-white/40"
          >
            Get Started as Business
          </button>
        </div>
      </div>
    </div>
  );
}
