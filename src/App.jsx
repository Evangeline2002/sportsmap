import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Map as MapIcon, Upload, CheckCircle2, Loader2, BarChart3, ChevronDown, ChevronUp, List, Settings } from 'lucide-react';
import { TN_DISTRICTS, CATEGORIES } from './utils/tnDistricts';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import localData from './data/records.json';

const API_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5500/api'
  : 'https://api.example.com/api'; // Placeholder

// Hook for reactive window size
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
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
  const [isLoading, setIsLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  const getDistrictCenter = (district) => {
    return TN_DISTRICTS.find(d =>
      d.name.toLowerCase() === district?.toLowerCase()
    )?.center || [11.1271, 78.6569];
  };

  const useFallbackData = () => {
    try {
      const source = Array.isArray(localData) ? localData : [];
      const processed = source.map((item, index) => {
        const center = getDistrictCenter(item.District || item.district);
        return {
          ...item,
          id: item.id ? `local-${item.District}-${item.id}` : `local-${index}`,
          lat: parseFloat(item.lat) || (center[0] + (Math.random() - 0.5) * 0.1),
          lng: parseFloat(item.lng) || (center[1] + (Math.random() - 0.5) * 0.1),
          completed: !!item.completed
        };
      });
      setData(processed);
      setFilteredData(processed);
    } catch (e) {
      console.error("Critical fallback failure:", e);
      setData([]);
    }
  };

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/records`, { timeout: 4000 });
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const processed = response.data.map(item => {
          const center = getDistrictCenter(item.District || item.district);
          return {
            ...item,
            id: item._id || item.id,
            lat: parseFloat(item.lat) || center[0],
            lng: parseFloat(item.lng) || center[1],
            completed: !!item.completed
          };
        });
        setData(processed);
        setFilteredData(processed);
      } else {
        useFallbackData();
      }
    } catch (error) {
      console.warn("Backend unreachable, using local store");
      useFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (!Array.isArray(data)) return;
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
      // Ignore fail in local mode
    }
  };

  const districtSummary = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const summary = {};
    data.forEach(item => {
      const d = item.District || item.district || 'Unknown';
      if (!summary[d]) summary[d] = { total: 0, completed: 0 };
      summary[d].total++;
      if (item.completed) summary[d].completed++;
    });
    return Object.entries(summary).sort((a, b) => b[1].total - a[1].total);
  }, [data]);

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
      alert(`Imported ${response.data.count} records!`);
      fetchRecords();
    } catch (error) {
      alert("Import failed. Local mode does not support uploads.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOnMap = (item) => {
    setSelectedItem(item);
    if (isMobile) setActiveTab('map');
  };

  if (!data && !isLoading) {
    return <div className="h-screen flex items-center justify-center font-bold">Data Loading Error. Refresh.</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans select-none">
      <header className="h-14 md:h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-2">
          <div className="bg-primary-600 p-2 rounded-xl text-white shadow-lg">
            <MapIcon size={isMobile ? 18 : 22} />
          </div>
          <div>
            <h1 className="text-sm md:text-lg font-black tracking-tight text-slate-800">TN Sports GIS</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isLoading && <Loader2 className="animate-spin text-primary-600" size={18} />}
          <label className="bg-slate-900 text-white p-2 md:px-4 md:py-2 rounded-full cursor-pointer transition-all shadow-xl active:scale-95">
            <Upload size={16} />
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
          </label>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className={`flex-1 relative ${isMobile && activeTab !== 'map' ? 'hidden' : 'block h-full'}`}>
          <MapView
            items={filteredData || []}
            selectedItem={selectedItem}
            onItemClick={setSelectedItem}
            completedItems={(data || []).filter(i => i.completed).map(i => i.id)}
            selectedDistrict={selectedDistrict}
            allDistricts={TN_DISTRICTS}
          />
        </div>

        <div className={`w-full md:w-[400px] lg:w-[450px] bg-white border-l border-slate-200 z-10 flex flex-col ${isMobile && activeTab === 'map' ? 'hidden' : 'flex h-full'}`}>
          {(activeTab === 'list' || !isMobile) && (
            <Sidebar
              data={filteredData || []}
              districts={[...new Set((data || []).map(item => item.District || item.district))].filter(Boolean)}
              categories={CATEGORIES}
              selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              toggleComplete={toggleComplete}
              completedItems={(data || []).filter(i => i.completed).map(i => i.id)}
              onViewOnMap={handleViewOnMap}
            />
          )}

          {(activeTab === 'stats' && isMobile) && (
            <div className="flex-1 overflow-y-auto p-5 bg-white pb-32">
              <h2 className="text-xl font-black mb-6">Analytics</h2>
              <div className="space-y-3">
                {districtSummary.map(([name, stats]) => (
                  <div key={name} className="bg-slate-50 p-4 rounded-3xl flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{name}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">RECORDS: {stats.total}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-black text-primary-600">{stats.completed}/{stats.total}</span>
                      <div className="w-20 h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-primary-500" style={{ width: `${(stats.completed / stats.total) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 h-20 flex items-center justify-around z-[100] px-4 pb-safe">
        <button onClick={() => setActiveTab('list')} className={`flex flex-col items-center gap-1 ${activeTab === 'list' ? 'text-primary-600' : 'text-slate-400'}`}>
          <List size={20} />
          <span className="text-[10px] font-black uppercase">List</span>
        </button>
        <button onClick={() => setActiveTab('map')} className={`flex flex-col items-center gap-1 ${activeTab === 'map' ? 'text-primary-600' : 'text-slate-400'}`}>
          <MapIcon size={20} />
          <span className="text-[10px] font-black uppercase">Map</span>
        </button>
        <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center gap-1 ${activeTab === 'stats' ? 'text-primary-600' : 'text-slate-400'}`}>
          <BarChart3 size={20} />
          <span className="text-[10px] font-black uppercase">Stats</span>
        </button>
      </div>
    </div>
  );
}

export default App;
