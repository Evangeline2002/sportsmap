import React, { useState } from 'react';
import { Search, Filter, Phone, MapPin, CheckCircle2, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ 
  data, 
  districts, 
  categories, 
  selectedDistrict, 
  setSelectedDistrict, 
  selectedCategory, 
  setSelectedCategory,
  toggleComplete,
  completedItems,
  onViewOnMap
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayLimit, setDisplayLimit] = useState(50);

  const filteredItems = data.filter(item => 
    (item.Name?.toString().toLowerCase().includes(searchTerm.toLowerCase()) || 
     item.Address?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const visibleItems = filteredItems.slice(0, displayLimit);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search & Filters */}
      <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10 space-y-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search name or address..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setDisplayLimit(50);
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <select 
              className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-tight appearance-none focus:outline-none focus:border-primary-500 cursor-pointer"
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setDisplayLimit(50);
              }}
            >
              <option value="">All Districts</option>
              {districts.sort().map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-tight appearance-none focus:outline-none focus:border-primary-500 cursor-pointer"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setDisplayLimit(50);
              }}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          <span>Results: {filteredItems.length}</span>
          { (selectedDistrict || selectedCategory || searchTerm) && (
            <button 
              onClick={() => { setSelectedDistrict(''); setSelectedCategory(''); setSearchTerm(''); setDisplayLimit(50); }}
              className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Reset <X size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Data List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Upload size={28} />
            </div>
            <h3 className="text-slate-800 font-bold text-base mb-1">Waiting for Data</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Connect to backend or upload Excel to see records.
            </p>
          </div>
        ) : (
          <>
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className={`group p-4 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md ${
                  completedItems.includes(item.id) 
                    ? 'bg-green-50/30 border-green-100' 
                    : 'bg-white border-slate-100 hover:border-primary-100'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
                    {item.Category}
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest ${
                    completedItems.includes(item.id) 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {completedItems.includes(item.id) ? 'Completed' : 'Pending'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 group-hover:text-primary-700 transition-colors text-sm line-clamp-1">
                  {item.Name}
                </h3>
                
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-start gap-2 text-[11px] text-slate-500 leading-snug">
                    <MapPin size={12} className="mt-0.5 flex-shrink-0 text-slate-300" />
                    <span className="line-clamp-2">{item.Address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Phone size={12} className="flex-shrink-0 text-slate-300" />
                    <a href={`tel:${item.Phone}`} className="hover:text-primary-600 transition-colors font-bold text-slate-700">
                      {item.Phone}
                    </a>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => onViewOnMap(item)}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-2 rounded-xl text-[11px] font-bold hover:bg-slate-800 transition-colors active:scale-95 shadow-md"
                  >
                    <MapPin size={12} />
                    Locate
                  </button>
                  <button 
                    onClick={() => toggleComplete(item.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-bold transition-all active:scale-95 shadow-sm ${
                      completedItems.includes(item.id)
                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-100'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    {completedItems.includes(item.id) ? 'Done' : 'Mark'}
                  </button>
                </div>
              </div>
            ))}
            {filteredItems.length > displayLimit && (
              <button 
                onClick={() => setDisplayLimit(prev => prev + 50)}
                className="w-full py-3 text-sm font-bold text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
              >
                Load More ({filteredItems.length - displayLimit} remaining)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};


export default Sidebar;
