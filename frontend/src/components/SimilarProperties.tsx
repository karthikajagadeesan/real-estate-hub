'use client';

import React, { useEffect, useState } from 'react';
import { Property } from '@/types/property';
import { PropertyCard } from './PropertyCard';
import { api } from '@/lib/api';
import { Sparkles } from 'lucide-react';

interface SimilarPropertiesProps {
  currentPropertyId: string;
}

export const SimilarProperties: React.FC<SimilarPropertiesProps> = ({ currentPropertyId }) => {
  const [similar, setSimilar] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSimilar() {
      try {
        const res = await api.get(`/properties/${currentPropertyId}/similar?limit=3`);
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setSimilar(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch similar properties from API:', err);
      } finally {
        setLoading(false);
      }
    }
    if (currentPropertyId) {
      fetchSimilar();
    }
  }, [currentPropertyId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-400 animate-pulse" /> Similar Recommended Properties
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-80 bg-slate-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (similar.length === 0) return null;

  return (
    <section className="space-y-6 pt-10 border-t border-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-accent-400 uppercase tracking-wider">AI Powered Recommendation Engine</span>
          <h3 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent-500" /> Similar Properties You May Like
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {similar.map(prop => (
          <PropertyCard key={prop.id} property={prop} />
        ))}
      </div>
    </section>
  );
};
