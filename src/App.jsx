import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Map as MapIcon, Upload, CheckCircle2, Loader2, BarChart3, ChevronDown, ChevronUp, List, Settings } from 'lucide-react';
import { TN_DISTRICTS, CATEGORIES } from './utils/tnDistricts';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import localData from './data/records.json';

const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5500/api'
  : 'https://your-production-api.com/api'; // Placeholder, will fallback to local data if unavailable

// Hook for reactive window size
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

function App() {
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'map' | 'stats'

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      // Use a timeout to avoid waiting too long for a local server that might not be there
      const response = await axios.get(`${API_URL}/records`, { timeout: 3000 });
      if (response.data && response.data.length > 0) {
        const processed = response.data.map(item => {
          const center = getDistrictCenter(item.District || item.district);
          return {
            ...item,
            id: item._id || item.id,
            lat: parseFloat(item.lat) || center[0],
            lng: parseFloat(item.lng) || center[1]
          };
        });
        setData(processed);
        setFilteredData(processed);
      } else {
        useFallbackData();
      }
    } catch (error) {
      console.warn("Could not reach backend API, switching to secure local data mode.", error.message);
      useFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  const getDistrictCenter = (district) => {
    return TN_DISTRICTS.find(d =>
      d.name.toLowerCase() === district?.toLowerCase()
    )?.center || [11.1271, 78.6569];
  };

  const useFallbackData = () => {
    const processed = localData.map((item, index) => {
      const center = getDistrictCenter(item.District || item.district);
      return {
        ...item,
        id: item.id ? `local-${item.District}-${item.id}` : `local-${index}`,
        lat: parseFloat(item.lat) || (center[0] + (Math.random() - 0.5) * 0.1),
        lng: parseFloat(item.lng) || (center[1] + (Math.random() - 0.5) * 0.1)
      };
    });
    setData(processed);
    setFilteredData(processed);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`Successfully uploaded ${response.data.count} records!`);
      fetchRecords();
    } catch (error) {
      console.error("Error uploading excel:", error);
      alert("Upload failed. Check if server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = data;
    if (selectedDistrict) {
      result = result.filter(item =>
        (item.District || item.district)?.toString().toLowerCase() === selectedDistrict.toLowerCase()
      );
    }
    if (selectedCategory) {
      result = result.filter(item => (item.Category || item.category) === selectedCategory);
    }
    setFilteredData(result);
  }, [selectedDistrict, selectedCategory, data]);

  const toggleComplete = async (id) => {
    const item = data.find(i => i.id === id);
    if (!item) return;

    const newStatus = !item.completed;

    setData(prev => prev.map(i => i.id === id ? { ...i, completed: newStatus } : i));

    try {
      await axios.patch(`${API_URL}/records/${id}`, { completed: newStatus });
    } catch (error) {
      console.error("Error updating status on server:", error);
    }
  };

  const districtSummary = useMemo(() => {
    const summary = {};
    data.forEach(item => {
      const d = item.District || item.district || 'Unknown';
      if (!summary[d]) summary[d] = { total: 0, completed: 0 };
      summary[d].total++;
      if (item.completed) summary[d].completed++;
    });
    return Object.entries(summary).sort((a, b) => b[1].total - a[1].total);
  }, [data]);

  const handleViewOnMap = (item) => {
    setSelectedItem(item);
    if (isMobile) {
      setActiveTab('map');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <header className="h-14 md:h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-primary-600 p-1.5 md:p-2 rounded-lg md:rounded-xl text-white shadow-lg">
            <MapIcon size={isMobile ? 18 : 22} />
          </div>
          <div>
            <h1 className="text-sm md:text-lg font-black tracking-tight text-slate-800 leading-none">TN Sports GIS</h1>
            {isMobile && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Mobile View Active</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {isLoading && <Loader2 className="animate-spin text-primary-600" size={18} />}
          <label className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white p-2 md:px-5 md:py-2.5 rounded-full cursor-pointer transition-all shadow-xl active:scale-95 group">
            <Upload size={16} />
            {!isMobile && <span className="text-sm font-bold">Import Data</span>}
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
          </label>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative pb-16 md:pb-0">
        <div id="map-section" className={`flex-1 relative order-2 md:order-1 ${isMobile && activeTab !== 'map' ? 'hidden' : 'block h-full'}`}>
          <MapView
            items={filteredData}
            selectedItem={selectedItem}
            onItemClick={(item) => {
              setSelectedItem(item);
            }}
            completedItems={data.filter(i => i.completed).map(i => i.id)}
            selectedDistrict={selectedDistrict}
            allDistricts={TN_DISTRICTS}
          />
        </div>

        <div className={`w-full md:w-[400px] lg:w-[450px] bg-white border-l border-slate-200 shadow-2xl z-10 flex flex-col order-1 md:order-2 ${isMobile && activeTab === 'map' ? 'hidden' : 'flex h-full'}`}>
          {(activeTab === 'list' || !isMobile) && (
            <Sidebar
              data={filteredData}
              districts={[...new Set(data.map(item => item.District || item.district))].filter(Boolean)}
              categories={CATEGORIES}
              selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              toggleComplete={toggleComplete}
              completedItems={data.filter(i => i.completed).map(i => i.id)}
              onViewOnMap={handleViewOnMap}
            />
          )}

          {(activeTab === 'stats' && isMobile) && (
            <div className="flex-1 overflow-y-auto p-5 bg-white pb-24">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-50 p-2.5 rounded-2xl">
                    <BarChart3 size={24} className="text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Analytics</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">District Performance</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-lg">
                  <span className="text-[10px] font-black opacity-60 uppercase tracking-wider">Total Venues</span>
                  <div className="text-2xl font-black mt-1">{data.length}</div>
                </div>
                <div className="bg-primary-600 text-white p-4 rounded-3xl shadow-lg">
                  <span className="text-[10px] font-black opacity-60 uppercase tracking-wider">Completed</span>
                  <div className="text-2xl font-black mt-1">{data.filter(i => i.completed).length}</div>
                </div>
              </div>

              <div className="space-y-3">
                {districtSummary.map(([name, stats]) => (
                  <div key={name} className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm active:bg-slate-100 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{name}</span>
                      <span className="text-[10px] text-slate-500 font-bold">RECORDS: {stats.total}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-black text-primary-600">{stats.completed} / {stats.total}</span>
                      <div className="w-24 h-2 bg-slate-200 rounded-full mt-2 overflow-hidden shadow-inner">
                        <div className="h-full bg-primary-500 transition-all duration-700 ease-out" style={{ width: `${(stats.completed / stats.total) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="hidden md:flex bg-slate-50 border-t border-slate-200 p-4 flex-col shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button onClick={() => setShowSummary(!showSummary)} className="flex items-center justify-between w-full text-slate-600 mb-2">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                <BarChart3 size={16} className="text-primary-600" />
                District Analysis
              </div>
              {showSummary ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>

            {showSummary && (
              <div className="grid grid-cols-1 gap-2 mt-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {districtSummary.map(([name, stats]) => (
                  <div key={name} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{name}</span>
                      <span className="text-[10px] text-slate-400">Total: {stats.total}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-black text-primary-600">{stats.completed} / {stats.total}</span>
                      <div className="w-20 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-primary-500" style={{ width: `${(stats.completed / stats.total) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="bg-slate-900 text-white px-6 py-2 hidden md:flex justify-between items-center text-[10px] font-bold">
        <div className="flex gap-4">
          <span>SERVER RECORDS: {data.length}</span>
          <span>COMPLETED: {data.filter(i => i.completed).length}</span>
        </div>
        <div className="text-slate-400 uppercase tracking-widest">Tamil Nadu Sports Information System</div>
      </div>

      {/* Mobile Bottom Navigation - Enhanced */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 h-20 flex items-start justify-around z-[100] shadow-[0_-10px_25px_rgba(0,0,0,0.05)] px-4 pt-3 pb-safe">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'list' ? 'text-primary-600' : 'text-slate-400'}`}
        >
          <div className={`p-2 rounded-2xl transition-all duration-300 ${activeTab === 'list' ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 -translate-y-1' : ''}`}>
            <List size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest mt-1">Venues</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'map' ? 'text-primary-600' : 'text-slate-400'}`}
        >
          <div className={`p-2 rounded-2xl transition-all duration-300 ${activeTab === 'map' ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 -translate-y-1' : ''}`}>
            <MapIcon size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest mt-1">Map</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'stats' ? 'text-primary-600' : 'text-slate-400'}`}
        >
          <div className={`p-2 rounded-2xl transition-all duration-300 ${activeTab === 'stats' ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 -translate-y-1' : ''}`}>
            <BarChart3 size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest mt-1">Stats</span>
        </button>
      </div>
    </div>
  );
}

export default App;
