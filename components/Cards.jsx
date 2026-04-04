import { useNavigate } from 'react-router-dom';
import image1 from '../assets/images/image1.jpg';
import image2 from '../assets/images/image2.jpg';

export default function Cards() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 z-10 relative pb-20">

      {/* Farmer Card */}
      <div className="bg-[#FDF8EE] shadow-lg rounded-3xl p-8 flex flex-col items-center text-center relative border border-white/80">
        <div className="absolute top-4 left-4 text-green-700/20">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
        </div>

        <div className="w-32 h-32 mb-6 mt-4 relative overflow-hidden rounded-full shadow-inner border border-white">
          <img
            src={image2}
            alt="Farm Landscape"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">I'm a <span className="text-nature-600">Farmer</span></h2>
        <p className="text-gray-600 mb-8 max-w-xs font-medium">Earn carbon credits from sustainable farming practices.</p>

        <div className="mt-auto w-full">
          <button
            onClick={() => navigate('/farmer/auth')}
            className="glass-button w-full py-4 rounded-xl font-bold text-lg shadow-lg"
          >
            Get Started as Farmer
          </button>
        </div>
      </div>

      {/* Businessman Card */}
      <div className="bg-[#FDF8EE] shadow-lg rounded-3xl p-8 flex flex-col items-center text-center relative border border-white/80">
        <div className="absolute top-4 right-4 text-blue-700/20">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M16 10h.01M8 10h.01M8 14h.01M12 14h.01M16 14h.01" /></svg>
        </div>

        <div className="w-32 h-32 mb-6 mt-4 relative overflow-hidden rounded-full shadow-inner border border-white">
          <img
            src={image1}
            alt="City Skyline"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">I'm a <span className="text-slate-700">Businessman</span></h2>
        <p className="text-gray-600 mb-8 max-w-xs font-medium">Purchase verified carbon credits to offset your emissions.</p>

        <div className="mt-auto w-full">
          <button
            onClick={() => navigate('/business/auth')}
            className="glass-button-blue w-full py-4 rounded-xl font-bold text-lg shadow-lg"
          >
            Get Started as Businessman
          </button>
        </div>

      </div>

    </div>
  );
}