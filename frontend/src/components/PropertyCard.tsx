import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/types/property';
import { MapPin, Bed, Bath, Maximize2, Eye, ShieldCheck } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export const formatPrice = (price: number) => {
  if (price >= 10000000) {
    return `₹ ${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹ ${(price / 100000).toFixed(2)} Lakh`;
  }
  return `₹ ${price.toLocaleString('en-IN')}`;
};

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';
  const coverImage = property.images && property.images.length > 0 ? property.images[0] : defaultImage;

  return (
    <div className="glass-card rounded-2xl overflow-hidden group flex flex-col h-full hover:shadow-2xl transition-all duration-300">
      
      {/* Property Image Header */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-900">
        <Image
          src={coverImage}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
        
        {/* Listing Type & Status Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`px-2.5 py-1 text-[11px] font-bold tracking-wider rounded-md text-white shadow-md ${
            property.listingType === 'RENT' ? 'bg-amber-600' : 'bg-brand-600'
          }`}>
            FOR {property.listingType}
          </span>
          <span className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-slate-900/80 backdrop-blur text-slate-300 border border-slate-700">
            {property.propertyType.replace('_', ' ')}
          </span>
        </div>

        {/* View Count */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[11px] text-slate-300 bg-slate-950/70 backdrop-blur px-2 py-0.5 rounded-full border border-slate-800">
          <Eye className="w-3 h-3 text-brand-400" />
          <span>{property.viewsCount || 1} views</span>
        </div>

        {/* Price Overlay */}
        <div className="absolute bottom-3 left-3">
          <span className="text-xl font-extrabold text-white tracking-tight drop-shadow">
            {formatPrice(property.price)}
          </span>
          {property.listingType === 'RENT' && <span className="text-xs text-slate-300"> / mo</span>}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex flex-col flex-grow space-y-4">
        
        {/* Title & Location */}
        <div>
          <Link href={`/properties/${property.id}`} className="block">
            <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1">
              {property.title}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate">{property.location}, {property.city}</span>
          </div>
        </div>

        {/* Property Highlights Grid */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-brand-400" />
            <span>{property.bedrooms} BHK</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-brand-400" />
            <span>{property.bathrooms} Bath</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-brand-400" />
            <span>{property.areaSqFt} sqft</span>
          </div>
        </div>

        {/* Footer Details & Action Button */}
        <div className="flex items-center justify-between pt-1 mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="truncate max-w-[110px]">{property.user?.name || 'Owner'}</span>
          </div>

          <Link
            href={`/properties/${property.id}`}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-brand-600 rounded-lg transition-colors border border-slate-700 hover:border-brand-500"
          >
            View Details
          </Link>
        </div>

      </div>
    </div>
  );
};
