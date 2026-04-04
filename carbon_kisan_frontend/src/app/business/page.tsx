'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE = 'http://localhost:8000/api';

export default function BusinessDashboard() {
  const [activePage, setActivePage] = useState('carbon');
  const [farmerSearch, setFarmerSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [businessData, setBusinessData] = useState<any>(null);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);

  // Download report as CSV
  const downloadReport = () => {
    if (farmers.length === 0) return;
    
    const headers = ['#', 'Farmer Name', 'ID', 'Region', 'Carbon (t)', 'Area (ha)', 'Certificates', 'Earnings (₹)'];
    const rows = filteredFarmers.map((farmer, idx) => [
      idx + 1,
      farmer.farmer_name,
      farmer.farmer_id,
      farmer.region,
      farmer.carbon.toFixed(2),
      farmer.area.toFixed(1),
      farmer.certificates_count,
      farmer.value.toFixed(0)
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `carbon-kissan-farmers-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Fetch business data
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/docs/all-certificates`);
        if (response.ok) {
          const data = await response.json();
          setBusinessData(data.summary);
          setFarmers(data.farmers || []);
          setRegions(data.regions || []);
        }
      } catch (error) {
        console.error('Failed to fetch business data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, []);

  const filteredFarmers = farmers.filter(
    (f) =>
      (f.farmer_name?.toLowerCase().includes(farmerSearch.toLowerCase()) ||
        f.region?.toLowerCase().includes(farmerSearch.toLowerCase())) &&
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
          <div className="text-teal-400 text-10px uppercase font-semibold">Total Credits Available</div>
          <div className="text-white font-mono font-bold text-2xl mt-1">{businessData ? Math.round(businessData.total_farmers * 17) : 0}</div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-teal-500 w-3/5"></div>
          </div>
          <div className="text-slate-400 text-11px mt-1">{businessData ? Math.round(businessData.total_carbon_tonnes) : 0}t CO₂ sequestered · {businessData?.total_farmers || 0} farmers</div>
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
              {activePage === 'carbon' ? 'Farmer carbon sequestration data' : 'Certificate and verification records'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-11px font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-400">
              ✅ {businessData ? Math.round(businessData.total_farmers * 17) : 0} Credits Verified
            </span>
            <span className="text-11px font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-300">
              Kharif Season 2025
            </span>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-7">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-teal-600 rounded-full mb-4"></div>
                <p className="text-slate-600">Loading business dashboard...</p>
              </div>
            </div>
          ) : (
          <>
          {activePage === 'carbon' && (
            <div>
              {/* Stat Cards */}
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Total CO₂ Sequestered', value: `${businessData?.total_carbon_tonnes || 0} t`, sub: `↑ ${Math.round((businessData?.total_carbon_tonnes || 0) * 0.15)}t this season`, icon: '🌿', color: 'teal' },
                  { label: 'Active Farmers', value: businessData?.total_farmers || 0, sub: `↑ ${Math.max(1, Math.round((businessData?.total_farmers || 0) * 0.22))} new this quarter`, icon: '👨‍🌾', color: 'emerald' },
                  { label: 'Total Farm Area', value: `${businessData?.total_area_hectares || 0} ha`, sub: `Across ${businessData?.total_regions || 0} regions`, icon: '🌾', color: 'sky' },
                  { label: 'Credits Purchased', value: businessData?.total_farmers ? Math.round((businessData.total_farmers * 17)) : 0, sub: `↑ ${Math.max(1, Math.round((businessData?.total_farmers || 0) * 2.7))} this month`, icon: '💎', color: 'violet' },
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
                  {regions.slice(0, 5).map((item, i) => (
                    <div key={i} className={`bg-teal-50 border border-teal-200 rounded-lg p-3 text-center`}>
                      <div className={`text-sm font-semibold text-teal-800`}>
                        📍 {item.region}
                      </div>
                      <div className={`text-lg font-bold font-mono mt-1 text-teal-700`}>
                        {item.carbon.toFixed(1)}t
                      </div>
                      <div className={`text-10px mt-1 text-teal-600`}>
                        {item.farmers} farmers · {item.area.toFixed(0)} ha
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
                    {regions.map((region) => (
                      <option key={region.region} value={region.region}>
                        {region.region}
                      </option>
                    ))}
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
                        <th className="text-left px-4 py-2 text-10px font-semibold text-slate-400 uppercase">Certs</th>
                        <th className="text-left px-4 py-2 text-10px font-semibold text-slate-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFarmers.map((farmer) => (
                        <tr key={farmer.farmer_id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{farmer.farmer_name}</div>
                            <div className="text-10px text-slate-400 font-mono">{farmer.farmer_id}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-900">{farmer.region}</td>
                          <td className="px-4 py-3 text-slate-900">{farmer.area.toFixed(1)} ha</td>
                          <td className="px-4 py-3 text-slate-900">-</td>
                          <td className="px-4 py-3 font-mono font-semibold text-slate-900">{farmer.carbon.toFixed(2)} t</td>
                          <td className="px-4 py-3 font-mono font-semibold text-slate-900">{farmer.score}</td>
                          <td className="px-4 py-3">
                            <span className={`text-11px font-semibold px-2.5 py-1 rounded-full border inline-block ${getGradeBg(farmer.grade)}`}>
                              {farmer.grade}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold text-slate-900">{farmer.certificates_count}</td>
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
                  { label: 'Total Land Documented', value: `${businessData?.total_area_hectares || 0} ha`, sub: `Across ${businessData?.total_farmers || 0} verified farmers` },
                  { label: 'Total Carbon Credits', value: businessData?.total_farmers ? Math.round(businessData.total_farmers * 17) : 0, sub: `${businessData?.total_carbon_tonnes || 0} tonnes CO₂ offset` },
                  { label: 'Total Paid to Farmers', value: `₹${(businessData?.total_value_inr || 0).toFixed(0)}`, sub: `Avg ₹${businessData?.total_farmers ? Math.round((businessData.total_value_inr || 0) / businessData.total_farmers) : 0} per farmer` },
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
                  <button onClick={downloadReport} className="bg-teal-600 text-white rounded-lg px-3 py-1 text-11px font-semibold hover:bg-teal-700">
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
                        <tr key={farmer.farmer_id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-600">{idx + 1}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{farmer.farmer_name}</td>
                          <td className="px-4 py-3 text-slate-400 font-mono text-10px">{farmer.farmer_id}</td>
                          <td className="px-4 py-3 text-slate-900">{farmer.region}</td>
                          <td className="px-4 py-3 font-mono font-semibold text-slate-900">{farmer.carbon.toFixed(2)} t</td>
                          <td className="px-4 py-3 font-mono font-semibold text-slate-900">{farmer.certificates_count}</td>
                          <td className="px-4 py-3 font-mono font-semibold text-emerald-600">₹{farmer.value.toFixed(0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          </>
          )}
        </div>
      </div>
    </div>
  );
}
