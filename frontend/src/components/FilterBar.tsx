'use client';

import React, { useState, useEffect } from 'react';
import { PropertyFilterParams } from '@/types/property';
import { Search, MapPin, SlidersHorizontal, RotateCcw, Building } from 'lucide-react';

interface FilterBarProps {
  filters: PropertyFilterParams;
  onFilterChange: (newFilters: PropertyFilterParams) => void;
  onReset: () => void;
}

const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Gurugram', 'Noida'];
const TYPES = [
  { label: 'All Types', value: '' },
  { label: 'Apartment', value: 'APARTMENT' },
  { label: 'Villa', value: 'VILLA' },
  { label: 'Plot', value: 'PLOT' },
  { label: 'Commercial', value: 'COMMERCIAL' },
  { label: 'Independent House', value: 'INDEPENDENT_HOUSE' },
];

const PRICE_RANGES = [
  { label: 'Any Budget', min: '', max: '' },
  { label: 'Under ₹ 50 Lakhs', min: '', max: '5000000' },
  { label: '₹ 50L - ₹ 1 Crore', min: '5000000', max: '10000000' },
  { label: '₹ 1 Cr - ₹ 2.5 Crores', min: '10000000', max: '25000000' },
  { label: 'Above ₹ 2.5 Crores', min: '25000000', max: '' },
];

const BHK_OPTIONS = ['1', '2', '3', '4', '5+'];

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, onReset }) => {
  const [localCity, setLocalCity] = useState(filters.city || '');
  const [localLocation, setLocalLocation] = useState(filters.location || '');
  const [localType, setLocalType] = useState(filters.propertyType || '');
  const [localBedrooms, setLocalBedrooms] = useState(filters.bedrooms || '');
  const [localSortBy, setLocalSortBy] = useState(filters.sortBy || 'newest');
  const [pricePreset, setPricePreset] = useState('');

  // Sync local state when incoming filters change (e.g., from URL navigation or reset)
  useEffect(() => {
    setLocalCity(filters.city || '');
    setLocalLocation(filters.location || '');
    setLocalType(filters.propertyType || '');
    setLocalBedrooms(filters.bedrooms || '');
    setLocalSortBy(filters.sortBy || 'newest');

    const matchedPreset = PRICE_RANGES.find(
      p => (p.min === (filters.minPrice || '')) && (p.max === (filters.maxPrice || ''))
    );
    setPricePreset(matchedPreset ? matchedPreset.label : '');
  }, [filters]);

  // Centralized filter dispatcher combining all active filter selections
  const emitCombinedFilters = (overrides: Partial<PropertyFilterParams & { pricePresetName?: string }> = {}) => {
    const updatedCity = overrides.city !== undefined ? overrides.city : localCity;
    const updatedLocation = overrides.location !== undefined ? overrides.location : localLocation;
    const updatedType = overrides.propertyType !== undefined ? overrides.propertyType : localType;
    const updatedBedrooms = overrides.bedrooms !== undefined ? overrides.bedrooms : localBedrooms;
    const updatedSortBy = overrides.sortBy !== undefined ? overrides.sortBy : localSortBy;

    let minPrice = filters.minPrice || '';
    let maxPrice = filters.maxPrice || '';

    const presetName = overrides.pricePresetName !== undefined ? overrides.pricePresetName : pricePreset;
    if (presetName !== undefined) {
      const selected = PRICE_RANGES.find(p => p.label === presetName);
      if (selected) {
        minPrice = selected.min;
        maxPrice = selected.max;
      }
    }

    if (overrides.minPrice !== undefined) minPrice = overrides.minPrice;
    if (overrides.maxPrice !== undefined) maxPrice = overrides.maxPrice;

    onFilterChange({
      city: updatedCity,
      location: updatedLocation,
      propertyType: updatedType,
      bedrooms: updatedBedrooms,
      minPrice,
      maxPrice,
      sortBy: updatedSortBy,
      page: 1,
      limit: filters.limit || 12,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    emitCombinedFilters();
  };

  const handleCityChange = (cityVal: string) => {
    setLocalCity(cityVal);
    emitCombinedFilters({ city: cityVal });
  };

  const handleTypeChange = (typeVal: string) => {
    setLocalType(typeVal);
    emitCombinedFilters({ propertyType: typeVal });
  };

  const handlePriceRangeChange = (presetLabel: string) => {
    setPricePreset(presetLabel);
    emitCombinedFilters({ pricePresetName: presetLabel });
  };

  const handleBhkSelect = (bhk: string) => {
    const val = localBedrooms === bhk ? '' : bhk;
    setLocalBedrooms(val);
    emitCombinedFilters({ bedrooms: val });
  };

  const handleSortChange = (sortVal: string) => {
    setLocalSortBy(sortVal);
    emitCombinedFilters({ sortBy: sortVal });
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-5">
      
      {/* Primary Search Form */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        
        {/* City Selector */}
        <div className="relative">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">City</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-brand-400 absolute left-3 top-3 pointer-events-none" />
            <select
              value={localCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full bg-slate-900 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-800 focus:border-brand-500 focus:outline-none appearance-none"
            >
              <option value="">All Indian Cities</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Location Search Input */}
        <div className="relative">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Location / Locality</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="e.g. Bandra, Koramangala..."
              value={localLocation}
              onChange={(e) => setLocalLocation(e.target.value)}
              onBlur={() => emitCombinedFilters({ location: localLocation })}
              className="w-full bg-slate-900 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-800 focus:border-brand-500 focus:outline-none placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Property Type Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Property Type</label>
          <div className="relative">
            <Building className="w-4 h-4 text-brand-400 absolute left-3 top-3 pointer-events-none" />
            <select
              value={localType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full bg-slate-900 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-800 focus:border-brand-500 focus:outline-none appearance-none"
            >
              {TYPES.map(t => <option key={t.label} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        {/* Budget Preset */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Budget Range</label>
          <select
            value={pricePreset}
            onChange={(e) => handlePriceRangeChange(e.target.value)}
            className="w-full bg-slate-900 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-800 focus:border-brand-500 focus:outline-none appearance-none"
          >
            {PRICE_RANGES.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
          </select>
        </div>

        {/* Search Action Button */}
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 transition-all hover:scale-102"
          >
            <Search className="w-4 h-4" /> Apply Filters
          </button>
        </div>
      </form>

      {/* Secondary Quick Filters (BHK Pills, Sorting & Reset) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80 text-xs">
        
        {/* BHK Filter Pills */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold text-[11px] mr-1">Bedrooms:</span>
          {BHK_OPTIONS.map(bhk => (
            <button
              key={bhk}
              type="button"
              onClick={() => handleBhkSelect(bhk)}
              className={`px-3 py-1 rounded-lg border transition-all ${
                localBedrooms === bhk
                  ? 'bg-brand-600 border-brand-500 text-white font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {bhk} BHK
            </button>
          ))}
        </div>

        {/* Sorting & Reset */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={localSortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-slate-900 text-slate-300 text-xs rounded-lg px-2.5 py-1 border border-slate-800 focus:border-brand-500 focus:outline-none"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

    </div>
  );
};
