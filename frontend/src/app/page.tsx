'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Property } from '@/types/property';
import { PropertyCard } from '@/components/PropertyCard';
import { api } from '@/lib/api';
import { 
  Building2, Search, MapPin, Sparkles, ShieldCheck, 
  TrendingUp, ArrowRight, Zap, Layers, FileText, CheckCircle
} from 'lucide-react';

const POPULAR_CITIES = [
  { name: 'Mumbai', count: '14,250+ properties', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Bengaluru', count: '12,800+ properties', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80' },
  { name: 'Delhi NCR', count: '11,400+ properties', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80' },
  { name: 'Hyderabad', count: '8,900+ properties', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80' },
];

const CATEGORIES = [
  { title: 'Apartments', type: 'APARTMENT', icon: Building2, desc: 'Flats & Luxury Condos' },
  { title: 'Villas & Bungalows', type: 'VILLA', icon: Sparkles, desc: 'Private Gated Homes' },
  { title: 'Plots & Land', type: 'PLOT', icon: Layers, desc: 'Residential & Commercial' },
  { title: 'Commercial', type: 'COMMERCIAL', icon: TrendingUp, desc: 'Offices & Retail Spaces' },
];

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [featured, setFeatured] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function loadFeatured() {
      try {
        const res = await api.get('/properties?limit=6&sortBy=popular');
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setFeatured(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load featured properties from API:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 bg-hero-gradient overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-brand-500/30 text-xs font-semibold text-brand-300">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>High-Performance Platform Engine | 50,000+ Record Querying</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold font-outfit text-white tracking-tight leading-tight">
            Discover Verified Real Estate <br />
            <span className="text-gradient">Across India’s Premier Metros</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Direct owner contact, zero brokerage friction, and real-time similarity recommendations for luxury homes, plots, and offices.
          </p>

          {/* Quick Search Card */}
          <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-700/80 shadow-2xl max-w-3xl mx-auto">
            <form action="/properties" method="GET" className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              
              <div className="sm:col-span-4 relative">
                <MapPin className="w-4 h-4 text-brand-400 absolute left-3.5 top-3.5" />
                <select
                  name="city"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-900 text-slate-200 text-xs font-medium rounded-xl pl-10 pr-4 py-3 border border-slate-800 focus:border-brand-500 focus:outline-none appearance-none"
                >
                  <option value="">Select City (All India)</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Delhi">Delhi NCR</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>

              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="location"
                  placeholder="Enter locality (e.g. Bandra, HSR Layout)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 text-slate-200 text-xs rounded-xl pl-10 pr-4 py-3 border border-slate-800 focus:border-brand-500 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full h-full py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition-all hover:scale-102"
                >
                  <Search className="w-4 h-4" /> Search
                </button>
              </div>

            </form>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-slate-400 border-t border-slate-800/60 pt-3">
              <span className="font-semibold text-slate-300">Popular:</span>
              <Link href="/properties?city=Mumbai" className="hover:text-brand-400">Mumbai Apartments</Link>
              <span>•</span>
              <Link href="/properties?city=Bengaluru" className="hover:text-brand-400">Bengaluru Villas</Link>
              <span>•</span>
              <Link href="/properties?city=Hyderabad" className="hover:text-brand-400">Hyderabad Gachibowli</Link>
            </div>
          </div>

        </div>
      </section>

      {/* STATS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 glass-panel p-8 rounded-2xl border border-slate-800 text-center">
          <div>
            <div className="text-3xl font-extrabold text-white font-outfit">50,000+</div>
            <div className="text-xs text-slate-400 mt-1">Indexed Property Listings</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-brand-400 font-outfit">&lt; 15ms</div>
            <div className="text-xs text-slate-400 mt-1">Average Search Response Time</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-400 font-outfit">100%</div>
            <div className="text-xs text-slate-400 mt-1">Direct Owner Verification</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-accent-400 font-outfit">10 Metros</div>
            <div className="text-xs text-slate-400 mt-1">Active Coverage Cities</div>
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Curated Collections</span>
            <h2 className="text-3xl font-bold font-outfit text-white">Trending Properties</h2>
          </div>
          <Link
            href="/properties"
            className="flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
          >
            View All 50,000+ Listings <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="h-80 bg-slate-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(prop => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </section>

      {/* PROPERTY CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Explore Options</span>
          <h2 className="text-3xl font-bold font-outfit text-white">Browse By Property Type</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.title}
                href={`/properties?propertyType=${cat.type}`}
                className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-brand-500/50 group transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors">{cat.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{cat.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* TOP CITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Prime Locations</span>
          <h2 className="text-3xl font-bold font-outfit text-white">Explore Top Real Estate Hubs</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {POPULAR_CITIES.map(city => (
            <Link
              key={city.name}
              href={`/properties?city=${city.name}`}
              className="relative h-64 rounded-2xl overflow-hidden group glass-card border border-slate-800"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                style={{ backgroundImage: `url(${city.img})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-bold text-white">{city.name}</h3>
                <p className="text-xs text-brand-300 mt-0.5">{city.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* OPEN API DOCS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-brand-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-brand-950 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
              <CheckCircle className="w-3.5 h-3.5" /> Swagger OpenAPI 3.0 Enabled
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-outfit text-white">
              Full API Specs & Backend Documentation
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Inspect protected routes, JWT token authentication, property search queries, and lead inquiry spam guards via `/api-docs`.
            </p>
          </div>
          <Link
            href="/api-docs"
            className="px-6 py-3.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-bold text-xs rounded-xl shadow-xl flex items-center gap-2 shrink-0 transition-all hover:scale-105"
          >
            <FileText className="w-4 h-4" /> Open Swagger API Docs
          </Link>
        </div>
      </section>

    </div>
  );
}
