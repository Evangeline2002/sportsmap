import React, { useState } from 'react';
import { Search, Filter, Phone, MapPin, Target, Star, X, Upload } from 'lucide-react';
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
    <div className="flex flex-col h-full overflow-hidden bg-[#F8FAFC]">
      {/* Search & Filters */}
      <div className="p-4 md:p-6 border-b border-slate-200 bg-white sticky top-0 z-20 space-y-4 shadow-sm backdrop-blur-md bg-white/90">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search shops or address..."
            className="w-full pl-12 pr-4 py-3 bg-slate-100/50 border-2 border-transparent rounded-2xl text-sm focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all font-medium placeholder:text-slate-400"
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
              className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
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
            <Filter size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
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
            <Filter size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider px-1">
          <span>{filteredItems.length} Locations</span>
          {(selectedDistrict || selectedCategory || searchTerm) && (
            <button
              onClick={() => { setSelectedDistrict(''); setSelectedCategory(''); setSearchTerm(''); setDisplayLimit(50); }}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              Reset <X size={12} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>

      {/* Data List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 custom-scrollbar pb-24 md:pb-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-inner">
              <Search size={32} />
            </div>
            <h3 className="text-slate-800 font-bold text-lg mb-2">No results found</h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-[240px] mx-auto">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        ) : (
          <>
            {visibleItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                key={item.id}
                className={`flex flex-col p-5 rounded-2xl border bg-white transition-all duration-300 shadow-sm hover:shadow-md ${completedItems.includes(item.id)
                  ? 'border-green-100 bg-green-50/10'
                  : 'border-slate-100 hover:border-blue-100'
                  }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-white bg-blue-600 px-3 py-1.5 rounded-md shadow-sm">
                    {item.Category || 'GENERAL'}
                  </span>
                  <span className={`text-[11px] font-black uppercase tracking-wider ${completedItems.includes(item.id) ? 'text-green-600' : 'text-red-500'}`}>
                    {completedItems.includes(item.id) ? 'COMPLETED' : 'PENDING'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-xl mb-4 leading-tight">
                  {item.Name}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3.5 text-sm text-slate-600 font-medium leading-relaxed">
                    <MapPin size={18} className="shrink-0 text-red-500/80 mt-0.5" />
                    <span className="text-slate-500">{item.Address}</span>
                  </div>
                  <div className="flex items-center gap-3.5 text-sm text-slate-600 font-medium">
                    <Phone size={18} className="shrink-0 text-green-500/80" />
                    <span className="text-slate-500">{item.Phone || 'Not Available'}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => onViewOnMap(item)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#1E293B] text-white py-3.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm"
                  >
                    <Target size={18} strokeWidth={2.5} />
                    Locate
                  </button>
                  <button
                    onClick={() => toggleComplete(item.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold border transition-all active:scale-[0.98] ${completedItems.includes(item.id)
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    <Star size={18} strokeWidth={2.5} className={completedItems.includes(item.id) ? 'fill-white' : ''} />
                    {completedItems.includes(item.id) ? 'Marked' : 'Mark'}
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
