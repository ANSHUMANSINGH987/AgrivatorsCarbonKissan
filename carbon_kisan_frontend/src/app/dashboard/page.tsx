"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Activity, Wind, IndianRupee, FileText, ChevronRight, AlertCircle, Loader, MapPin, Wallet, Award, MessageSquare, Settings, LogOut } from 'lucide-react';
import KisanSaathiChat from '@/components/chat/KisanSaathiChat';

// Dynamically import the map to avoid SSR issues with Leaflet
const FarmMap = dynamic(() => import('@/components/map/FarmMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-green-50 animate-pulse flex items-center justify-center text-green-700">नक्शा लोड हो रहा है (Loading Map)...</div>
});

const API_BASE = 'http://localhost:8000/api';

type LoadingStage = 'idle' | 'connecting' | 'calculating' | 'saving';
type TabType = 'dashboard' | 'my-farms' | 'earnings' | 'certificates' | 'messages' | 'settings';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [geoJson, setGeoJson] = useState<any>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('idle');
  const [mrvResults, setMrvResults] = useState<any>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [dailyInsights, setDailyInsights] = useState<string[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch(`${API_BASE}/ai/daily-insights`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ region: "Madhya Pradesh" }),
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const { data } = await response.json();
        if (data && typeof data === 'string') {
          const lines = data.split('\n').filter((l: string) => l?.trim?.().length > 5);
          setDailyInsights(lines);
        } else {
          setDailyInsights([]);
        }
      } catch (error) {
        console.error("Failed to fetch insights:", error);
        setDailyInsights([]);
      } finally {
        setIsLoadingInsights(false);
      }
    };
    fetchInsights();
  }, []);

  const handleMapClick = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`${API_BASE}/land/auto-boundary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data?.geojson) {
        setGeoJson(data.geojson);
        setMrvResults(null);
      } else {
        setErrorToast(data.detail || data.error || "Invalid boundary response");
        setTimeout(() => setErrorToast(null), 5000);
      }
    } catch (error: any) {
      console.error("Error detecting farm boundary:", error);
      const errorMsg = error?.message || "Could not detect farm boundary at this location.";
      setErrorToast(errorMsg);
      setTimeout(() => setErrorToast(null), 5000);
    }
  };

  const calculateCarbon = async () => {
    if (!geoJson) {
      setErrorToast("Please select a farm boundary on the map first");
      setTimeout(() => setErrorToast(null), 4000);
      return;
    }
    
    setIsAnalyzing(true);
    setLoadingStage('connecting');
    
    try {
      // Step 1: Connecting to satellite
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoadingStage('calculating');
      
      // Step 2: Call backend to analyze farm
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      
      const requestPayload = {
        farmer_id: "demo_farmer_001",
        location_name: locationName || "Selected Location",
        polygon: { coordinates: geoJson.coordinates } 
      };

      console.log("Sending MRV request:", requestPayload);

      const response = await fetch(`${API_BASE}/mrv/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log("MRV response:", data);

      // Validate response
      if (!data?.farm_area_hectares || !data?.certificate_id) {
        throw new Error("Invalid response: Missing required fields (farm_area_hectares or certificate_id)");
      }

      setLoadingStage('saving');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setMrvResults(data);
      setErrorToast(null);
      
    } catch (error: any) {
      let errorMsg = "Failed to analyze farm";

      if (error.name === 'AbortError') {
        errorMsg = "⏱️ Request timeout (>20s). Server may be busy. Please try again.";
      } else if (error instanceof TypeError) {
        if (error.message.includes('Failed to fetch')) {
          errorMsg = "🌐 Network error: Cannot reach server. Make sure backend is running on port 8000.";
        } else {
          errorMsg = `Network error: ${error.message}`;
        }
      } else if (error && typeof error.message === 'string') {
        if (error.message.includes('HTTP 400')) {
          errorMsg = "🌥️ Satellite data unavailable (clouds/obstruction). Try another location or date.";
        } else if (error.message.includes('HTTP 422')) {
          errorMsg = "Invalid location data. Please check your coordinates.";
        } else if (error.message.includes('HTTP 500')) {
          errorMsg = "❌ Server error. Please try again later.";
        } else {
          errorMsg = error.message;
        }
      } else if (typeof error === 'string') {
        errorMsg = error;
      }

      // Log safe error info to console
      if (error instanceof Error) {
        console.error("[MRV Analysis Error]", error.message, error.stack);
      } else {
        console.error("[MRV Analysis Error]", errorMsg);
      }

      setErrorToast(errorMsg);
      setTimeout(() => setErrorToast(null), 7000);
      
    } finally {
      setIsAnalyzing(false);
      setLoadingStage('idle');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Error Toast */}
      <AnimatePresence>
        {errorToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-[1100] bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-start gap-3 max-w-sm border border-red-700"
          >
            <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm mb-1">Error</p>
              <p className="text-xs leading-relaxed">{errorToast}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Sidebar */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-green-100 shadow-md sticky top-0 h-screen overflow-y-auto hidden md:flex flex-col">
          <div className="p-6 border-b border-green-100">
            <h1 className="text-2xl font-bold text-green-900">Carbon Kissan</h1>
            <p className="text-xs text-green-600 mt-1">Farmer Dashboard</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'my-farms', label: 'My Farms', icon: MapPin },
              { id: 'earnings', label: 'Earnings', icon: Wallet },
              { id: 'certificates', label: 'Certificates', icon: Award },
              { id: 'messages', label: 'Messages', icon: MessageSquare },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon as any;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                    activeTab === tab.id
                      ? 'bg-green-100 text-green-900 border-l-4 border-green-600'
                      : 'text-gray-600 hover:bg-green-50'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-green-100">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition font-medium">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Daily Insights Banner */}
          <div className="w-full bg-white shadow-sm border-b border-green-100 overflow-x-auto whitespace-nowrap scrollbar-hide p-3 flex gap-4 items-center min-h-[55px]">
            {isLoadingInsights ? (
               <div className="text-sm text-gray-500 animate-pulse px-4 border border-gray-100 rounded-full py-1.5 bg-gray-50">Loading AI Insights...</div>
            ) : dailyInsights.length > 0 ? (
              dailyInsights.map((insight, idx) => (
                <div key={idx} className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border ${idx % 3 === 0 ? 'bg-amber-50 text-amber-800 border-amber-200' : idx % 3 === 1 ? 'bg-green-50 text-green-800 border-green-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
                  ✨ {insight.replace(/^(\d+\.|-|\*)\s*/, '')}
                </div>
              ))
            ) : (
              <div className="inline-flex items-center gap-2 bg-gray-50 text-gray-500 rounded-full px-4 py-1.5 text-sm border border-gray-200">
                Unable to load insights today.
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto" suppressHydrationWarning>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-sm hover:shadow-md transition">
                    <Activity className="text-green-600 mb-2" size={24} />
                    <p className="text-sm text-gray-600">Total Farms</p>
                    <p className="text-3xl font-bold text-green-900">3</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-sm hover:shadow-md transition">
                    <Leaf className="text-green-600 mb-2" size={24} />
                    <p className="text-sm text-gray-600">Total Area</p>
                    <p className="text-3xl font-bold text-green-900">12.5 ha</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-sm hover:shadow-md transition">
                    <Wind className="text-blue-600 mb-2" size={24} />
                    <p className="text-sm text-gray-600">Est. Carbon</p>
                    <p className="text-3xl font-bold text-blue-900">45.2 T</p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-sm hover:shadow-md transition">
                    <IndianRupee className="text-green-700 mb-2" size={24} />
                    <p className="text-sm text-gray-600">Potential Value</p>
                    <p className="text-3xl font-bold text-green-800">₹2,25,000</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-md">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-sm text-gray-600">Last Analysis</p>
                      <p className="text-lg font-bold text-green-900">2 days ago</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-sm text-gray-600">Pending Approvals</p>
                      <p className="text-lg font-bold text-amber-900">1 Report</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* My Farms Tab - Map & MRV Functionality */}
            {activeTab === 'my-farms' && (
              <div className="space-y-6">
                {/* Location Form Card */}
                <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-md">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin size={24} className="text-green-600" />
                    Add Farm Location
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Location Name Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location / Village Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Sehore, MP"
                        value={locationName || ''}
                        onChange={(e) => setLocationName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>

                    {/* Pincode Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode
                      </label>
                      <input
                        type="number"
                        placeholder="e.g., 466001"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>

                    {/* Search Button */}
                    <div className="flex items-end">
                      <button 
                        className="w-full bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <MapPin size={18} />
                        View on Map
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    💡 Enter your village/city name and pincode, then click "View on Map" to see the area. You can then click on the map to select your farm boundaries.
                  </p>
                </div>

                {/* Map & Results Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Map */}
                  <section className="col-span-1 lg:col-span-2 relative h-[60vh] lg:h-[75vh] bg-white rounded-3xl shadow-lg border border-green-50 overflow-hidden">
                    {/* Smart Map Component */}
                    <FarmMap 
                      onMapClick={handleMapClick} 
                      geoJson={geoJson} 
                      setGeoJson={setGeoJson}
                      setLocationName={setLocationName}
                    />
                    
                    {/* Absolute overlay for prompts */}
                    {!geoJson && (
                      <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-green-100 z-[1000] text-center">
                        <h2 className="text-xl font-bold text-green-900 mb-1">खेत को चिन्हित करें (Detect Farm)</h2>
                        <p className="text-sm text-green-700">Tap anywhere on the map to auto-detect your farm boundaries.</p>
                      </div>
                    )}

                    {/* Floating Action Card (When polygon is drawn) */}
                    {geoJson && !mrvResults && !isAnalyzing && (
                      <div className="absolute bottom-6 left-6 right-6 lg:left-1/4 lg:right-1/4 bg-white p-5 rounded-2xl shadow-2xl border-2 border-green-600 z-[1000]"
                        >
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">Farm Boundary Detected</h3>
                              <p className="text-sm text-gray-500">Ready for satellite carbon analysis.</p>
                            </div>
                            <button 
                              onClick={calculateCarbon}
                              disabled={isAnalyzing}
                              className="w-full sm:w-auto bg-green-700 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                            >
                              {isAnalyzing ? (
                                <>
                                  <Loader size={18} className="animate-spin" />
                                  Analyzing...
                                </>
                              ) : (
                                <>
                                  Calculate Value <ChevronRight size={18} />
                                </>
                              )}
                            </button>
                          </div>
                      </div>
                    )}
                  </section>

                  {/* Right Column: Results & Loading */}
                  <section className="col-span-1">
                    {isAnalyzing && (
                      <div className="h-full bg-gradient-to-b from-green-50 to-white rounded-3xl shadow-lg border border-green-100 p-8 flex flex-col items-center justify-center text-center"
                      >
                        <div className="mb-8 relative">
                          <div className="w-20 h-20 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                          <Loader className="absolute inset-0 m-auto text-green-600 animate-pulse" size={24} />
                        </div>
                        
                        {/* Multi-Stage Loading Text */}
                        <div className="space-y-4">
                          <div className="text-lg font-semibold text-gray-900">
                            {loadingStage === 'connecting' && "Connecting to Satellite..."}
                            {loadingStage === 'calculating' && "Calculating Biomass & NDVI..."}
                            {loadingStage === 'saving' && "Generating Certificate..."}
                          </div>
                          
                          <p className="text-sm text-gray-500 max-w-xs">
                            {loadingStage === 'connecting' && "Fetching 12 months of Sentinel-2 imagery"}
                            {loadingStage === 'calculating' && "Analyzing vegetation indices with cloud masking"}
                            {loadingStage === 'saving' && "Saving verified data to blockchain records"}
                          </p>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full mt-8 bg-gray-200 rounded-full h-1">
                          <div 
                            style={{ 
                              width: loadingStage === 'connecting' ? "30%" : 
                                     loadingStage === 'calculating' ? "65%" : 
                                     loadingStage === 'saving' ? "95%" : "20%",
                              transition: "width 0.6s ease-in-out"
                            }}
                            className="bg-green-600 h-full rounded-full"
                          />
                        </div>
                      </div>
                    )}

                    {mrvResults && !isAnalyzing && (
                      <div className="bg-white rounded-3xl shadow-lg border-2 border-green-100 p-6 flex flex-col h-full"
                      >
                        <div className="mb-6">
                          <h2 className="text-2xl font-bold text-gray-900 mb-1">MRV Report</h2>
                          <p className="text-sm text-gray-500">Verified securely through Google Earth Engine</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                            <Activity className="text-green-600 mb-2" size={24} />
                            <p className="text-sm text-gray-600 mb-1">Total Area</p>
                            <p className="text-2xl font-bold text-green-900">
                              {typeof mrvResults.farm_area_hectares === 'number' 
                                ? mrvResults.farm_area_hectares 
                                : mrvResults.farm_area_hectares?.toFixed?.(2) || 'N/A'} 
                              <span className="text-sm font-normal">Hectares</span>
                            </p>
                          </div>
                          
                          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                            <Leaf className="text-orange-600 mb-2" size={24} />
                            <p className="text-sm text-gray-600 mb-1">Health (NDVI)</p>
                            <p className="text-2xl font-bold text-orange-900">
                              {typeof mrvResults.mean_ndvi_score === 'number' 
                                ? mrvResults.mean_ndvi_score?.toFixed(2) 
                                : 'N/A'} 
                              <span className="text-sm font-normal">Score</span>
                            </p>
                          </div>

                          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                            <Wind className="text-blue-600 mb-2" size={24} />
                            <p className="text-sm text-gray-600 mb-1">Est. Carbon</p>
                            <p className="text-2xl font-bold text-blue-900">
                              {typeof mrvResults.estimated_carbon_tonnes === 'number' 
                                ? mrvResults.estimated_carbon_tonnes 
                                : 'N/A'} 
                              <span className="text-sm font-normal">Tonnes</span>
                            </p>
                          </div>

                          <div className="bg-[#F4FDF4] rounded-2xl p-4 border border-green-200">
                            <IndianRupee className="text-green-700 mb-2" size={24} />
                            <p className="text-sm text-gray-600 mb-1">Est. Value</p>
                            <p className="text-2xl font-bold text-green-800">
                              ₹{typeof mrvResults.estimated_value_inr === 'number' 
                                ? mrvResults.estimated_value_inr 
                                : 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100">
                          <a 
                            href={`${API_BASE}/docs/certificate/${mrvResults.certificate_id}`}
                            target="_blank"
                            className="w-full bg-green-700 hover:bg-green-800 text-white p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                          >
                            <FileText size={20} />
                            Generate E-Certificate
                          </a>
                        </div>
                      </div>
                    )}

                    {!isAnalyzing && !mrvResults && (
                      <div className="h-full bg-white/50 border border-dashed border-green-200 rounded-3xl flex items-center justify-center p-8 text-center hidden lg:flex">
                        <p className="text-green-700 font-medium">Select your farm on the map to view the MRV report.</p>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            )}

            {/* Earnings Tab - Placeholder */}
            {activeTab === 'earnings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-8 border border-green-100 shadow-md text-center">
                  <Wallet className="mx-auto mb-4 text-green-600" size={48} />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Earnings</h2>
                  <p className="text-gray-600">Carbon credit earnings and payment history coming soon.</p>
                </div>
              </div>
            )}

            {/* Certificates Tab - Placeholder */}
            {activeTab === 'certificates' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-8 border border-green-100 shadow-md text-center">
                  <Award className="mx-auto mb-4 text-amber-600" size={48} />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificates</h2>
                  <p className="text-gray-600">Your generated e-certificates and verification records coming soon.</p>
                </div>
              </div>
            )}

            {/* Messages Tab - Placeholder */}
            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-8 border border-green-100 shadow-md text-center">
                  <MessageSquare className="mx-auto mb-4 text-blue-600" size={48} />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Messages</h2>
                  <p className="text-gray-600">Communication with support and program updates coming soon.</p>
                </div>
              </div>
            )}

            {/* Settings Tab - Placeholder */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-8 border border-green-100 shadow-md text-center">
                  <Settings className="mx-auto mb-4 text-gray-600" size={48} />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
                  <p className="text-gray-600">Profile and account settings coming soon.</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Kisan-Saathi Chatbot FAB */}
      <KisanSaathiChat farmContext={mrvResults} />
    </div>
  );
}
