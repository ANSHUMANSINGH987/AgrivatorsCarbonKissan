export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-6 pt-28 pb-16 z-20">
      <div className="w-full max-w-7xl text-center relative">

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-white tracking-tight leading-[1.05] mb-8 drop-shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
          Convert{" "}
          <span className="font-bold text-[#9ed28f]">
            Sustainable Farming
          </span>
          <br />
          into{" "}
          <span className="font-bold text-white">
            Carbon Income
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-4xl mx-auto font-medium leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
          Empowering farmers and enabling businesses to invest in verified carbon credits
          <br className="hidden md:block" />
          through data-driven agriculture.
        </p>

        {/* Floating Satellite Icon */}
        <div className="absolute top-[-60px] right-4 md:right-10 lg:right-16 hidden md:block opacity-95 animate-bounce">
          <div className="relative bg-white/90 backdrop-blur-md p-4 rounded-full shadow-2xl border border-white/60">
            <svg
              className="w-10 h-10 text-gray-800"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M13 7 9 3 5 7l4 4" />
              <path d="m17 11 4 4-4 4-4-4" />
              <path d="m8 12 4 4 6-6-4-4Z" />
              <path d="m16 8 3-3" />
              <path d="M9 21a6 6 0 0 0-6-6" />
            </svg>
            <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
          </div>
        </div>

      </div>
    </section>
  );
}