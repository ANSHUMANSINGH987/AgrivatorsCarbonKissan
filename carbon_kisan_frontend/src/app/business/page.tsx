'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BusinessDashboard() {
  const [activePage, setActivePage] = useState('carbon');
  const [farmerSearch, setFarmerSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  // Sample farmer data
  const farmers = [
    {
      id: 'F001',
      name: 'Rajesh Kumar',
      region: 'Nashik, MH',
      area: 12,
      crop: 'Sugarcane',
      carbon: 8.4,
      score: 92,
      grade: 'A+',
      credits: 24,
      practices: 'Organic',
      status: 'Verified',
    },
    {
      id: 'F002',
      name: 'Priya Sharma',
      region: 'Pune, MH',
      area: 8.5,
      crop: 'Wheat',
      carbon: 6.2,
      score: 88,
      grade: 'A',
      credits: 18,
      practices: 'No-Till',
      status: 'Verified',
    },
    {
      id: 'F003',
      name: 'Amitabh Singh',
      region: 'Agra, UP',
      area: 9,
      crop: 'Maize',
      carbon: 7.1,
      score: 85,
      grade: 'A',
      credits: 20,
      practices: 'Drip',
      status: 'Verified',
    },
    {
      id: 'F004',
      name: 'Deepa Desai',
      region: 'Nashik, MH',
      area: 11,
      crop: 'Cotton',
      carbon: 7.8,
      score: 90,
      grade: 'A+',
      credits: 22,
      practices: 'Organic',
      status: 'Verified',
    },
    {
      id: 'F005',
      name: 'Vikram Patel',
      region: 'Sinnar, MH',
      area: 7.5,
      crop: 'Groundnut',
      carbon: 5.2,
      score: 82,
      grade: 'B+',
      credits: 15,
      practices: 'Cover Crop',
      status: 'Verified',
    },
  ];

  const filteredFarmers = farmers.filter(
    (f) =>
      (f.name.toLowerCase().includes(farmerSearch.toLowerCase()) ||
        f.region.toLowerCase().includes(farmerSearch.toLowerCase())) &&
      (regionFilter === '' || f.region === regionFilter)
  );

  const getGradeBg = (grade: string) => {
    const gradeBgs: { [key: string]: string } = {
      'A+': 'bg-teal-50 text-teal-700 border-teal-300',
      'A': 'bg-teal-50 text-teal-700 border-teal-300',
      'B+': 'bg-amber-100 text-amber-600 border-amber-300',
      'B': 'bg-amber-100 text-amber-600 border-amber-300',
    };
    return gradeBgs[grade] || 'bg-slate-100 text-slate-600 border-slate-300';
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 fixed left-0 top-0 h-screen flex flex-col overflow-y-auto">
        {/* Brand */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
              🌍
            </div>
            <div>
              <div className="text-white font-bold text-sm">Carbon Kissan</div>
              <div className="text-teal-400 text-10px font-semibold">Business Portal</div>
            </div>
          </div>
          <div className="inline-flex items-center gap-1 bg-teal-600/20 border border-teal-500/30 rounded-full px-2.5 py-1 text-teal-300 text-10px font-semibold mt-2">
            ⬆ Business Account
          </div>
        </div>

        {/* Organization */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            TCS
          </div>
          <div>
            <div className="text-white font-semibold text-sm">TCS Green Initiative</div>
            <div className="text-slate-400 text-11px">ESG Procurement · Mumbai</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <div className="text-10px uppercase text-slate-500 px-5 py-2 font-semibold">Analytics</div>
          <button
            onClick={() => setActivePage('carbon')}
            className={`w-full px-5 py-2.5 text-left text-sm font-medium transition-all ${
              activePage === 'carbon'
                ? 'bg-teal-600/15 text-teal-300 border-l-3 border-teal-500'
                : 'text-white/55 hover:text-white/90 hover:bg-white/5'
            }`}
          >
            <span className="mr-2">🌱</span>Carbon Overview
          </button>
          <button
            onClick={() => setActivePage('docs')}
            className={`w-full px-5 py-2.5 text-left text-sm font-medium transition-all ${
              activePage === 'docs'
                ? 'bg-teal-600/15 text-teal-300 border-l-3 border-teal-500'
                : 'text-white/55 hover:text-white/90 hover:bg-white/5'
            }`}
          >
            <span className="mr-2">📂</span>Documents & Records
          </button>
        </nav>

        {/* Credits Used */}
        <div className="p-4 bg-white/5 border-t border-white/10">
          <div className="text-teal-400 text-10px uppercase font-semibold">Credits Purchased</div>
          <div className="text-white font-mono font-bold text-2xl mt-1">312</div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-teal-500 w-3/5"></div>
          </div>
          <div className="text-slate-400 text-11px mt-1">62% of annual target · 188 remaining</div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ml-64 flex-1 flex flex-col">
        {/* TOPBAR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-7 sticky top-0 z-40">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {activePage === 'carbon' ? 'Carbon Overview' : 'Documents & Records'}
            </h2>
            <p className="text-11px text-slate-400 mt-0.5">
              {activePage === 'carbon' ? 'Live view of all farmer carbon data — Maharashtra & UP clusters' : 'Certificate and verification records'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-11px font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-400">
              ✅ 312 Credits Verified
            </span>
            <span className="text-11px font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-300">
              Kharif Season 2025
            </span>
            <button className="w-9 h-9 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 text-base">
              📤
            </button>
            <button className="w-9 h-9 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50 text-base relative">
              🔔
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-7">
          {activePage === 'carbon' && (
            <div>
              {/* Stat Cards */}
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Total CO₂ Sequestered', value: '84.6 t', sub: '↑ 12.4t this season', icon: '🌿', color: 'teal' },
                  { label: 'Active Farmers', value: '18', sub: '↑ 4 new this quarter', icon: '👨‍🌾', color: 'emerald' },
                  { label: 'Total Farm Area', value: '142 ac', sub: 'Across 3 states', icon: '🌾', color: 'sky' },
                  { label: 'Credits Purchased', value: '312', sub: '↑ 48 this month', icon: '💎', color: 'violet' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 relative overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 right-0 h-0.5 ${
                        stat.color === 'teal' ? 'bg-teal-500' : stat.color === 'emerald' ? 'bg-emerald-500' : stat.color === 'sky' ? 'bg-sky-500' : 'bg-violet-500'
                      }`}
                    ></div>
                    <div className={`text-2xl mb-3`}>{stat.icon}</div>
                    <div className="text-10px uppercase text-slate-400 font-semibold">{ stat.label}</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{stat.value}</div>
                    <div className={`text-11px mt-1 ${stat.color === 'emerald' ? 'text-emerald-600' : 'text-emerald-600'}`}>{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Heat Grid - Regional Stats */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5">
                <div className="text-11px font-semibold uppercase text-slate-500 mb-3">Carbon Intensity by Region</div>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { region: 'Nashik, MH', value: '32.4t', sub: '8 farmers · 54 ac', bg: 'bg-teal-50', color: 'teal' },
                    { region: 'Pune, MH', value: '18.2t', sub: '4 farmers · 32 ac', bg: 'bg-teal-50', color: 'teal' },
                    { region: 'Agra, UP', value: '14.8t', sub: '3 farmers · 28 ac', bg: 'bg-amber-100', color: 'amber' },
                    { region: 'Sinnar, MH', value: '11.6t', sub: '2 farmers · 18 ac', bg: 'bg-emerald-50', color: 'emerald' },
                    { region: 'Latur, MH', value: '7.6t', sub: '1 farmer · 10 ac', bg: 'bg-slate-100', color: 'slate' },
                  ].map((item, i) => (
                    <div key={i} className={`${item.bg} border ${item.color === 'teal' ? 'border-teal-200' : item.color === 'amber' ? 'border-amber-300' : item.color === 'emerald' ? 'border-emerald-400' : 'border-slate-200'} rounded-lg p-3 text-center`}>
                      <div className={`text-sm font-semibold ${item.color === 'teal' ? 'text-teal-800' : item.color === 'amber' ? 'text-amber-700' : item.color === 'emerald' ? 'text-emerald-700' : 'text-slate-600'}`}>
                        📍 {item.region}
                      </div>
                      <div className={`text-lg font-bold font-mono mt-1 ${item.color === 'teal' ? 'text-teal-700' : item.color === 'amber' ? 'text-amber-700' : item.color === 'emerald' ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {item.value}
                      </div>
                      <div className={`text-10px mt-1 ${item.color === 'teal' ? 'text-teal-600' : item.color === 'amber' ? 'text-amber-600' : item.color === 'emerald' ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {item.sub}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Farmer Table */}
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-11px font-semibold uppercase text-slate-500">Farmer Carbon Details</div>
                    <div className="text-11px text-slate-400 mt-1">Click any row to expand</div>
                  </div>
                </div>

                <div className="flex gap-2 mb-4 flex-wrap">
                  <input
                    type="text"
                    placeholder="🔍 Search farmer or region..."
                    value={farmerSearch}
                    onChange={(e) => setFarmerSearch(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 min-w-60"
                  />
                  <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400 cursor-pointer"
                  >
                    <option value="">All Regions</option>
                    <option>Nashik, MH</option>
                    <option>Pune, MH</option>
                    <option>Agra, UP</option>
                    <option>Sinnar, MH</option>
                    <option>Latur, MH</option>
                  </select>
                  <button
                    onClick={() => {
                      setFarmerSearch('');
                      setRegionFilter('');
                    }}
                    className="bg-white text-slate-600 border border-slate-200 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                  >
                    Reset
                  </button>
                  <button className="bg-teal-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-teal-700">
                    ↓ Export CSV
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left px-4 py-2 text-10px font-semibold text-slate-400 uppercase">Farmer</th>
                        <th className="text-left px-4 py-2 text-10px font-semibold text-slate-400 uppercase">Region</th>
                        <th className="text-left px-4 py-2 text-10px font-semibold text-slate-400 uppercase">Area</th>
                        <th className="text-left px-4 py-2 text-10px font-semibold text-slate-400 uppercase">Crop</th>
                        <th className="text-left px-4 py-2 text-10px font-semibold text-slate-400 uppercase">CO₂</th>
                        <th className="text-left px-4 py-2 text-10px font-semibold text-slate-400 uppercase">Score</th>
                        <th className="text-left px-4 py-2 text-10px font-semibold text-slate-400 uppercase">Grade</th>
                        <th className="text-left px-4 py-2 text-10px font-semibold text-slate-400 uppercase">Credits</th>
                        <th className="text-left px-4 py-2 text-10px font-semibold text-slate-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFarmers.map((farmer) => (
                        <tr key={farmer.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{farmer.name}</div>
                            <div className="text-10px text-slate-400 font-mono">{farmer.id}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-900">{farmer.region}</td>
                          <td className="px-4 py-3 text-slate-900">{farmer.area} ac</td>
                          <td className="px-4 py-3 text-slate-900">{farmer.crop}</td>
                          <td className="px-4 py-3 font-mono font-semibold text-slate-900">{farmer.carbon} t</td>
                          <td className="px-4 py-3 font-mono font-semibold text-slate-900">{farmer.score}</td>
                          <td className="px-4 py-3">
                            <span className={`text-11px font-semibold px-2.5 py-1 rounded-full border inline-block ${getGradeBg(farmer.grade)}`}>
                              {farmer.grade}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold text-slate-900">{farmer.credits}</td>
                          <td className="px-4 py-3">
                            <span className="text-11px font-semibold px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-400 inline-block">
                              ✅ {farmer.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activePage === 'docs' && (
            <div>
              <div className="grid grid-cols-3 gap-4 mb-5">
                {[
                  { label: 'Total Land Documented', value: '142 ac', sub: 'Across 18 verified farmers' },
                  { label: 'Total Carbon Credits', value: '312', sub: '84.6 tonnes CO₂ offset' },
                  { label: 'Total Paid to Farmers', value: '₹2.18L', sub: 'Avg ₹12,130 per farmer' },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-900 rounded-xl p-5 relative overflow-hidden">
                    <div className="absolute -top-5 -right-5 w-20 h-20 bg-teal-500/10 rounded-full"></div>
                    <div className="text-teal-300 text-10px uppercase font-semibold">{stat.label}</div>
                    <div className="text-3xl font-bold text-white mt-1 font-mono">{stat.value}</div>
                    <div className="text-teal-400 text-sm mt-1">{stat.sub}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-11px font-semibold uppercase text-slate-500">All-Farmer Summary Table</div>
                  <button className="bg-teal-600 text-white rounded-lg px-3 py-1 text-11px font-semibold hover:bg-teal-700">
                    ↓ Download Report
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left px-4 py-2 text-10px font-semibold text-slate-400 uppercase">#</th>
                        <th className="text-left px-4 py-2 text-10px font-semibold text-slate-400 uppercase">Farmer Name</th>
                        <th className="text-left px-4 py-2 text-10px font-semibold text-slate-400 uppercase">ID</th>
                        <th className="text-left px-4 py-2 text-10px font-semibold text-slate-400 uppercase">Region</th>
                        <th className="text-left px-4 py-2 text-10px font-semibold text-slate-400 uppercase">Carbon Sequestered</th>
                        <th className="text-left px-4 py-2 text-10px font-semibold text-slate-400 uppercase">Credits</th>
                        <th className="text-left px-4 py-2 text-10px font-semibold text-slate-400 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFarmers.map((farmer, idx) => (
                        <tr key={farmer.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-600">{idx + 1}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{farmer.name}</td>
                          <td className="px-4 py-3 text-slate-400 font-mono text-10px">{farmer.id}</td>
                          <td className="px-4 py-3 text-slate-900">{farmer.region}</td>
                          <td className="px-4 py-3 font-mono font-semibold text-slate-900">{farmer.carbon} t</td>
                          <td className="px-4 py-3 font-mono font-semibold text-slate-900">{farmer.credits}</td>
                          <td className="px-4 py-3 font-mono font-semibold text-emerald-600">₹{farmer.credits * 700}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
