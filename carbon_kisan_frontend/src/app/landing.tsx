"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sprout, TrendingUp, ChevronRight, Leaf, Users, BarChart3 } from 'lucide-react';

export default function Landing() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-emerald-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-6 px-6 md:px-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between max-w-7xl mx-auto"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center">
              <Sprout size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-green-900">Carbon Kissan</h1>
          </div>
          <p className="text-sm text-green-600 font-medium">Empowering Farmers, Sustaining Earth</p>
        </motion.div>
      </header>

      {/* Hero Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24"
      >
        {/* Main Hero */}
        <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Turn Your Farm into a
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"> Carbon Asset</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Carbon Kissan democratizes the voluntary carbon market for Indian farmers. Measure your farm's carbon potential, get verified, and earn real rupees — all powered by satellites and AI.
          </p>
        </motion.div>

        {/* Stats Banner */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20"
        >
          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-green-100 shadow-sm">
            <div className="text-3xl font-bold text-green-600 mb-2">50K+</div>
            <div className="text-sm text-gray-600">Farmers Verified</div>
          </div>
          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-green-100 shadow-sm">
            <div className="text-3xl font-bold text-green-600 mb-2">₹2.4Cr</div>
            <div className="text-sm text-gray-600">Payouts Distributed</div>
          </div>
          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-green-100 shadow-sm">
            <div className="text-3xl font-bold text-green-600 mb-2">100K+</div>
            <div className="text-sm text-gray-600">Tonnes Verified</div>
          </div>
        </motion.div>

        {/* CTA Buttons Section */}
        <motion.div variants={itemVariants} className="mb-20">
          <h3 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">I am a</h3>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Farmers Button */}
            <motion.button
              onClick={() => router.push('/dashboard')}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden rounded-3xl shadow-xl"
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-700 group-hover:from-green-700 group-hover:to-emerald-800 transition-all duration-300"></div>
              
              {/* Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300"></div>
              
              <div className="relative px-8 py-12 md:py-16 text-white text-left">
                <div className="flex items-start justify-between mb-6">
                  <div className="text-5xl">🌾</div>
                  <ChevronRight size={28} className="group-hover:translate-x-2 transition-transform" />
                </div>
                
                <h4 className="text-3xl md:text-4xl font-bold mb-3">Farmer</h4>
                <p className="text-green-100 text-lg mb-6 leading-relaxed">
                  Map your land, measure carbon, earn verified credits, and unlock the voluntary carbon market.
                </p>
                
                <div className="space-y-2 text-sm text-green-50">
                  <div className="flex items-center gap-2">
                    <Leaf size={16} />
                    <span>Satellite MRV Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} />
                    <span>Real-time Carbon Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>Direct Buyer Connection</span>
                  </div>
                </div>

                <button className="mt-8 w-full bg-white text-green-700 px-6 py-3 rounded-xl font-bold group-hover:bg-green-50 transition-all duration-300">
                  Enter Dashboard
                </button>
              </div>
            </motion.button>

            {/* Business Button */}
            <motion.button
              onClick={() => alert('Business Portal Coming Soon! We\'ll notify you when it\'s ready.')}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl cursor-pointer"
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-700 group-hover:from-blue-700 group-hover:to-cyan-800 transition-all duration-300"></div>
              
              {/* Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300"></div>
              
              <div className="relative px-8 py-12 md:py-16 text-white text-left">
                <div className="flex items-start justify-between mb-6">
                  <div className="text-5xl">🏢</div>
                  <ChevronRight size={28} className="group-hover:translate-x-2 transition-transform" />
                </div>
                
                <h4 className="text-3xl md:text-4xl font-bold mb-3">Business</h4>
                <p className="text-blue-100 text-lg mb-6 leading-relaxed">
                  Access verified carbon credits, build ESG portfolios, and support sustainable agriculture.
                </p>
                
                <div className="space-y-2 text-sm text-blue-50">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={16} />
                    <span>Verified Credit Marketplace</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Leaf size={16} />
                    <span>Transparent Supply Chain</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>Direct Farmer Partnerships</span>
                  </div>
                </div>

                <button className="mt-8 w-full bg-white text-blue-700 px-6 py-3 rounded-xl font-bold group-hover:bg-blue-50 transition-all duration-300 cursor-pointer">
                  Coming Soon
                </button>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sprout size={32} className="text-green-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Satellite Verified</h4>
            <p className="text-gray-600 text-sm">Using Google Earth Engine & Sentinel-2 for 100% transparent carbon calculation.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={32} className="text-green-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Real-time Updates</h4>
            <p className="text-gray-600 text-sm">Your carbon score and earnings update automatically with satellite data.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-green-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Direct Connection</h4>
            <p className="text-gray-600 text-sm">Connect with corporate buyers without intermediaries. Earn more, keep more.</p>
          </div>
        </motion.div>

        {/* Trust Banner */}
        <motion.div variants={itemVariants} className="text-center bg-white rounded-2xl border border-gray-200 px-8 py-8">
          <p className="text-gray-600 mb-6">Trusted by leading organizations across India:</p>
          <div className="flex justify-center items-center gap-6 flex-wrap text-gray-400 text-sm font-semibold">
            <span>Google Earth Engine</span>
            <span className="text-gray-300">•</span>
            <span>Firebase</span>
            <span className="text-gray-300">•</span>
            <span>Gemini AI</span>
            <span className="text-gray-300">•</span>
            <span>Certified MRV Protocol</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-green-100 bg-white/50 backdrop-blur-sm mt-20 py-8">
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <p className="text-gray-600 text-sm">© 2026 Carbon Kissan. Democratizing the carbon market for farmers.</p>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-green-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-green-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-green-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
