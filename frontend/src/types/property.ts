export type PropertyType = 'APARTMENT' | 'VILLA' | 'PLOT' | 'COMMERCIAL' | 'INDEPENDENT_HOUSE';
export type ListingType = 'SELL' | 'RENT';

export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  city: string;
  location: string;
  address?: string;
  zipCode?: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  amenities: string[];
  images: string[];
  status: 'AVAILABLE' | 'PENDING' | 'SOLD' | 'RENTED';
  viewsCount?: number;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PropertyFilterParams {
  city?: string;
  location?: string;
  propertyType?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}
