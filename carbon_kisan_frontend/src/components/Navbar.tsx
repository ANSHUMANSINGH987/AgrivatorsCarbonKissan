'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full flex items-center px-6 md:px-12 py-4 bg-black/20 backdrop-blur-md border-b border-white/10">
      {/* Left - Logo */}
      <div className="flex-1">
        <Link href="/" className="inline-block">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🌾</span>
            </div>
            <span className="text-white font-bold text-xl hidden md:inline">Carbon Kissan</span>
          </div>
        </Link>
      </div>

      {/* Center - Links */}
      <div className="hidden md:flex flex-none items-center justify-center gap-8">
        <Link href="/" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
          Home
        </Link>
        <Link href="/" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
          About
        </Link>
        <a href="#features" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
          Features
        </a>
      </div>

      {/* Right - CTA */}
      <div className="flex-1 flex justify-end">
        <Link href="/" className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors text-sm">
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
