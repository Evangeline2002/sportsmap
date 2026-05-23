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
      <div className="p-4 md:p-5 border-b border-slate-200 bg-white sticky top-0 z-10 space-y-4 shadow-sm">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search venue or address..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border-2 border-transparent rounded-2xl text-sm focus:bg-white focus:border-primary-500/20 focus:ring-4 focus:ring-primary-500/5 transition-all font-medium placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setDisplayLimit(50);
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <select
              className="w-full pl-3 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-bold uppercase tracking-wider appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 cursor-pointer shadow-sm"
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
            <Filter size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              className="w-full pl-3 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-bold uppercase tracking-wider appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 cursor-pointer shadow-sm"
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
            <Filter size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-black uppercase tracking-widest px-1">
          <span>{filteredItems.length} Venues Found</span>
          {(selectedDistrict || selectedCategory || searchTerm) && (
            <button
              onClick={() => { setSelectedDistrict(''); setSelectedCategory(''); setSearchTerm(''); setDisplayLimit(50); }}
              className="text-primary-600 hover:text-primary-700 flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              Reset Filters <X size={10} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>

      {/* Data List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 custom-scrollbar pb-24 md:pb-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-inner">
              <Search size={32} />
            </div>
            <h3 className="text-slate-800 font-black text-lg mb-2">No results found</h3>
            <p className="text-slate-500 text-xs leading-relaxed max-w-[200px] mx-auto">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        ) : (
          <>
            {visibleItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={item.id}
                className={`group p-5 rounded-[2rem] border-2 transition-all duration-300 ${completedItems.includes(item.id)
                    ? 'bg-green-50/40 border-green-100/50'
                    : 'bg-white border-slate-100 hover:border-primary-100 hover:shadow-xl hover:shadow-primary-500/5'
                  }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                    {item.Category}
                  </span>
                  <div className={`w-3 h-3 rounded-full ${completedItems.includes(item.id) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-slate-200 animate-pulse'}`} />
                </div>

                <h3 className="font-black text-slate-800 text-base mb-3 leading-tight group-hover:text-primary-600 transition-colors">
                  {item.Name}
                </h3>

                <div className="space-y-2.5 mb-5">
                  <div className="flex items-start gap-3 text-xs text-slate-500 font-medium leading-relaxed">
                    <div className="bg-slate-100 p-1.5 rounded-lg text-slate-400">
                      <MapPin size={14} />
                    </div>
                    <span>{item.Address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-bold">
                    <div className="bg-slate-100 p-1.5 rounded-lg text-slate-400">
                      <Phone size={14} />
                    </div>
                    <a href={`tel:${item.Phone}`} className="hover:text-primary-600 transition-colors text-slate-700">
                      {item.Phone}
                    </a>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onViewOnMap(item)}
                    className="flex-[1.5] flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.97] shadow-lg shadow-slate-200"
                  >
                    <MapPin size={14} strokeWidth={3} />
                    Locate
                  </button>
                  <button
                    onClick={() => toggleComplete(item.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-black transition-all active:scale-[0.97] ${completedItems.includes(item.id)
                        ? 'bg-green-600 text-white shadow-lg shadow-green-100'
                        : 'bg-white border-2 border-slate-100 text-slate-400 hover:border-primary-100 hover:text-primary-500'
                      }`}
                  >
                    <CheckCircle2 size={16} strokeWidth={3} />
                  </button>
                </div>
              </motion.div>
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
