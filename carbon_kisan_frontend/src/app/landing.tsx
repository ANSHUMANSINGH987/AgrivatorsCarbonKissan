'use client';

import Hero from '@/components/Hero';
import Cards from '@/components/Cards';
import Footer from '@/components/Footer';

export default function Landing() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Fullscreen Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/VID_20260404_101916.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-10"></div>

      {/* Main Content */}
      <div className="relative z-20 w-full">
        <Hero />
        <Cards />
        <Footer />
      </div>
    </div>
  );
}
