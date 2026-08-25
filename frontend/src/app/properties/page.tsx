'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Property, Pagination, PropertyFilterParams } from '@/types/property';
import { PropertyCard } from '@/components/PropertyCard';
import { FilterBar } from '@/components/FilterBar';
import { api } from '@/lib/api';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, Loader2, Frown } from 'lucide-react';

function PropertyListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [retryCount, setRetryCount] = useState(0);

  // Extract initial filters from URL params
  const [filters, setFilters] = useState<PropertyFilterParams>({
    city: searchParams.get('city') || '',
    location: searchParams.get('location') || '',
    propertyType: searchParams.get('propertyType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    page: parseInt(searchParams.get('page') || '1'),
    limit: 12,
  });

  // Keep filters state synchronized with URL search parameters
  useEffect(() => {
    setFilters({
      city: searchParams.get('city') || '',
      location: searchParams.get('location') || '',
      propertyType: searchParams.get('propertyType') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      bedrooms: searchParams.get('bedrooms') || '',
      sortBy: searchParams.get('sortBy') || 'newest',
      page: parseInt(searchParams.get('page') || '1'),
      limit: 12,
    });
  }, [searchParams]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    async function fetchProperties() {
      setLoading(true);
      setApiError(null);
      try {
        const queryParams = new URLSearchParams();
        if (filters.city) queryParams.set('city', filters.city);
        if (filters.location) queryParams.set('location', filters.location);
        if (filters.propertyType) queryParams.set('propertyType', filters.propertyType);
        if (filters.minPrice) queryParams.set('minPrice', filters.minPrice);
        if (filters.maxPrice) queryParams.set('maxPrice', filters.maxPrice);
        if (filters.bedrooms) queryParams.set('bedrooms', filters.bedrooms);
        if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);
        if (filters.page) queryParams.set('page', filters.page.toString());
        if (filters.limit) queryParams.set('limit', filters.limit.toString());

        const res = await api.get(`/properties?${queryParams.toString()}`);
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setProperties(res.data.data);
          setPagination(res.data.pagination);
        }
      } catch (err: any) {
        console.error('API load failed:', err);
        setApiError('Unable to connect to the backend server on port 5000. Auto-retrying connection in 3 seconds...');
        timer = setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 3000);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [filters, retryCount]);

  const handleFilterChange = (newFilters: PropertyFilterParams) => {
    setFilters(newFilters);
    const queryParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) queryParams.set(key, val.toString());
    });
    router.push(`/properties?${queryParams.toString()}`, { scroll: false });
  };

  const handleResetFilters = () => {
    const reset = {
      city: '',
      location: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      sortBy: 'newest',
      page: 1,
      limit: 12,
    };
    setFilters(reset);
    router.push('/properties');
  };

  const handlePageChange = (newPage: number) => {
    handleFilterChange({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Title */}
      <div>
        <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Search Engine</span>
        <h1 className="text-3xl font-extrabold font-outfit text-white">
          Property Listings in India
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Showing verified residential and commercial spaces matching your criteria.
        </p>
      </div>

      {/* Filter Bar Component */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
        <span>
          Found <strong className="text-white font-bold">{pagination.total}</strong> properties
        </span>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
      </div>

      {/* Property Cards Grid / Loading / Error State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400">Searching across 50,000+ indexed property records...</p>
        </div>
      ) : apiError ? (
        <div className="glass-panel p-12 rounded-2xl border border-amber-800/60 bg-amber-950/20 text-center space-y-4">
          <Loader2 className="w-10 h-10 text-amber-400 mx-auto animate-spin" />
          <h3 className="text-lg font-bold text-white">Connecting to Backend API Server...</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">{apiError}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setRetryCount(prev => prev + 1)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl"
            >
              Retry Connection Now
            </button>
          </div>
        </div>
      ) : properties.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
          <Frown className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Matching Properties Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            We couldn't find any listings matching your specific search filters. Try adjusting your city, budget range, or bedroom preferences.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl"
          >
            Clear All Search Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(prop => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevPage}
            className="px-3.5 py-2 glass-card rounded-xl text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-1 text-xs">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (pagination.page > 3 && pagination.totalPages > 5) {
                pageNum = pagination.page - 2 + i;
              }
              if (pageNum > pagination.totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-xl font-bold transition-colors ${
                    pagination.page === pageNum
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNextPage}
            className="px-3.5 py-2 glass-card rounded-xl text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    }>
      <PropertyListContent />
    </Suspense>
  );
}
