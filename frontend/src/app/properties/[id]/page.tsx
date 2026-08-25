'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types/property';
import { PropertyCard, formatPrice } from '@/components/PropertyCard';
import { LeadModal } from '@/components/LeadModal';
import { SimilarProperties } from '@/components/SimilarProperties';
import { api } from '@/lib/api';
import { 
  MapPin, Bed, Bath, Maximize2, ShieldCheck, PhoneCall, 
  Mail, Calendar, Eye, Share2, Check, ArrowLeft, Loader2, Sparkles, Building2
} from 'lucide-react';

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchPropertyDetail() {
      if (!id) return;
      try {
        const res = await api.get(`/properties/${id}`);
        if (res.data && res.data.success && res.data.data) {
          setProperty(res.data.data);
          if (res.data.data.images && res.data.data.images.length > 0) {
            setSelectedImage(res.data.data.images[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch property details from API:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPropertyDetail();
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Property Not Found</h2>
        <p className="text-xs text-slate-400">The property listing you are searching for might have been sold or removed.</p>
        <Link href="/properties" className="inline-block px-4 py-2 bg-brand-600 text-white font-semibold rounded-xl text-xs">
          Return to Property Search
        </Link>
      </div>
    );
  }

  const defaultImages = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
  ];

  const galleryImages = property.images && property.images.length > 0 ? property.images : defaultImages;
  const currentCover = selectedImage || galleryImages[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <Link href="/properties" className="flex items-center gap-1.5 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Properties
        </Link>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 glass-card rounded-lg hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-brand-400" />}
          <span>{copied ? 'Link Copied!' : 'Share Listing'}</span>
        </button>
      </div>

      {/* Main Grid: Left Gallery & Overview, Right Owner Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Gallery & Details */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Cover Image Display */}
          <div className="space-y-3">
            <div className="relative h-96 sm:h-[450px] w-full rounded-2xl overflow-hidden glass-panel border border-slate-800">
              <Image
                src={currentCover}
                alt={property.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 66vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 bg-brand-600 text-white font-bold text-xs rounded-md shadow">
                  FOR {property.listingType}
                </span>
                <span className="px-3 py-1 bg-slate-900/80 text-slate-200 text-xs rounded-md border border-slate-700 backdrop-blur">
                  {property.propertyType.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Thumbnail Carousel */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      currentCover === imgUrl ? 'border-brand-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={imgUrl} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property Core Overview */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit text-white">
                  {property.title}
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{property.address ? `${property.address}, ` : ''}{property.location}, {property.city}</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-3xl font-extrabold text-white text-gradient">
                  {formatPrice(property.price)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  ₹ {Math.round(property.price / property.areaSqFt).toLocaleString('en-IN')} / sqft
                </div>
              </div>
            </div>

            {/* Highlights Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
              <div className="flex items-center gap-3">
                <Bed className="w-5 h-5 text-brand-400" />
                <div>
                  <div className="text-slate-400">Bedrooms</div>
                  <div className="font-bold text-white text-sm">{property.bedrooms} BHK</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Bath className="w-5 h-5 text-brand-400" />
                <div>
                  <div className="text-slate-400">Bathrooms</div>
                  <div className="font-bold text-white text-sm">{property.bathrooms} Baths</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Maximize2 className="w-5 h-5 text-brand-400" />
                <div>
                  <div className="text-slate-400">Super Area</div>
                  <div className="font-bold text-white text-sm">{property.areaSqFt} sqft</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-accent-400" />
                <div>
                  <div className="text-slate-400">Views</div>
                  <div className="font-bold text-white text-sm">{property.viewsCount || 1} views</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white">About this Property</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities Grid */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-lg font-bold text-white">Features & Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {property.amenities.map(amenity => (
                    <div key={amenity} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 text-slate-200 border border-slate-800">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column (4 cols): Owner Inquiry Panel */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="sticky top-24 glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
            
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider">Direct Property Contact</span>
              <h3 className="text-xl font-bold font-outfit text-white">Contact Property Owner</h3>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-sm">
                {(property.user?.name || 'Owner').charAt(0).toUpperCase()}
              </div>
              <div className="text-xs">
                <div className="font-bold text-white flex items-center gap-1">
                  {property.user?.name || 'Verified Owner'}
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-slate-400 mt-0.5">{property.user?.phone || '+91 9876543210'}</div>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" /> Zero Brokerage Charges
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" /> Guaranteed Owner Callback
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" /> Instant Site Visit Scheduling
              </div>
            </div>

            <button
              onClick={() => setLeadModalOpen(true)}
              className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-bold text-xs rounded-xl shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 transition-all hover:scale-102"
            >
              <PhoneCall className="w-4 h-4" /> Get Owner Contact & Schedule Visit
            </button>

            <div className="text-[11px] text-center text-slate-500">
              Response Rate: <span className="text-emerald-400 font-semibold">99.8% within 1 hour</span>
            </div>

          </div>

        </div>

      </div>

      {/* Similar Properties Component */}
      <SimilarProperties currentPropertyId={property.id} />

      {/* Lead Inquiry Modal */}
      <LeadModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        propertyId={property.id}
        propertyTitle={property.title}
        ownerName={property.user?.name}
        ownerPhone={property.user?.phone}
      />

    </div>
  );
}
