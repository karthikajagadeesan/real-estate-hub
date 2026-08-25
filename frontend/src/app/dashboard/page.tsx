'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { Property } from '@/types/property';
import { api } from '@/lib/api';
import { formatPrice } from '@/components/PropertyCard';
import { 
  Plus, Edit, Trash2, Building2, Mail, Phone, Eye, 
  MapPin, Loader2, CheckCircle2, AlertCircle, X, ShieldAlert,
  ChevronLeft, ChevronRight
} from 'lucide-react';

function DashboardContent() {
  const { user, token, loading: authLoading, loginAt } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<'listings' | 'create' | 'inquiries'>('listings');
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [propsPage, setPropsPage] = useState(1);
  const [propsPagination, setPropsPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [inqPage, setInqPage] = useState(1);
  const [inqPagination, setInqPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Property Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'APARTMENT',
    listingType: 'SELL',
    price: '',
    city: 'Mumbai',
    location: '',
    address: '',
    zipCode: '',
    bedrooms: '2',
    bathrooms: '2',
    areaSqFt: '',
    amenities: '24x7 Security, Power Backup, Car Parking',
    images: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'create' || tabParam === 'inquiries' || tabParam === 'listings') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadDashboardData() {
      // Wait until auth is fully resolved before attempting any fetch
      if (authLoading) return;
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      let fetchedProps: Property[] = [];
      let fetchedInqs: any[] = [];

      try {
        const [propsRes, inqRes] = await Promise.all([
          api.get(`/properties/my-listings?page=${propsPage}&limit=12`).catch(() => null),
          api.get(`/inquiries/received?page=${inqPage}&limit=12`).catch(() => null)
        ]);

        if (propsRes?.data?.success && Array.isArray(propsRes.data.data)) {
          fetchedProps = propsRes.data.data;
          if (propsRes.data.pagination) {
            setPropsPagination(propsRes.data.pagination);
          }
        }
        if (inqRes?.data?.success && Array.isArray(inqRes.data.data)) {
          fetchedInqs = inqRes.data.data;
          if (inqRes.data.pagination) {
            setInqPagination(inqRes.data.pagination);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data from API:', err);
      }

      setMyProperties(fetchedProps);
      setInquiries(fetchedInqs);
      setLoading(false);
    }
    loadDashboardData();
  }, [authLoading, user, loginAt, propsPage, inqPage]);

  const handleEditClick = (prop: Property) => {
    setEditingId(prop.id);
    setFormData({
      title: prop.title,
      description: prop.description,
      propertyType: prop.propertyType,
      listingType: prop.listingType,
      price: prop.price.toString(),
      city: prop.city,
      location: prop.location,
      address: prop.address || '',
      zipCode: prop.zipCode || '',
      bedrooms: prop.bedrooms.toString(),
      bathrooms: prop.bathrooms.toString(),
      areaSqFt: prop.areaSqFt.toString(),
      amenities: prop.amenities ? prop.amenities.join(', ') : '',
      images: prop.images && prop.images.length > 0 ? prop.images.join(', ') : '',
    });
    setActiveTab('create');
    setFormStatus(null);
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property listing?')) return;
    try {
      const res = await api.delete(`/properties/${id}`);
      if (res.data.success) {
        setMyProperties(prev => prev.filter(p => p.id !== id));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete property listing.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormStatus(null);

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      areaSqFt: parseFloat(formData.areaSqFt),
      amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean),
      images: formData.images.split(',').map(i => i.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        // Edit existing listing
        const res = await api.put(`/properties/${editingId}`, payload);
        if (res.data.success) {
          setFormStatus({ success: true, message: 'Listing updated successfully!' });
          setMyProperties(prev => prev.map(p => p.id === editingId ? res.data.data : p));
          setTimeout(() => {
            setEditingId(null);
            setActiveTab('listings');
          }, 1500);
        }
      } else {
        // Create new listing
        const res = await api.post('/properties', payload);
        if (res.data.success) {
          setFormStatus({ success: true, message: 'New property listing created successfully!' });
          setMyProperties(prev => [res.data.data, ...prev]);
          setTimeout(() => {
            setActiveTab('listings');
          }, 1500);
        }
      }
    } catch (err: any) {
      let errMsg = 'Error processing request.';
      if (err.response?.data) {
        const data = err.response.data;
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          errMsg = data.errors.map((e: any) => e.message || String(e)).join('. ');
        } else if (typeof data.message === 'string') {
          errMsg = data.message;
        } else if (typeof data === 'string') {
          errMsg = data;
        }
      }
      setFormStatus({
        success: false,
        message: errMsg
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Property Owner Management</span>
          <h1 className="text-2xl font-bold font-outfit text-white">Welcome back, {user?.name}</h1>
          <p className="text-xs text-slate-400 mt-1">Manage your active listings and view inquiries received from prospective buyers.</p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              title: '',
              description: '',
              propertyType: 'APARTMENT',
              listingType: 'SELL',
              price: '',
              city: 'Mumbai',
              location: '',
              address: '',
              zipCode: '',
              bedrooms: '2',
              bathrooms: '2',
              areaSqFt: '',
              amenities: '24x7 Security, Power Backup, Car Parking',
              images: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
            });
            setActiveTab('create');
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Property Listing
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'listings' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          My Posted Listings ({propsPagination.total > 0 ? propsPagination.total.toLocaleString() : myProperties.length})
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'inquiries' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Leads Received ({inqPagination.total > 0 ? inqPagination.total.toLocaleString() : inquiries.length})
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'create' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {editingId ? 'Edit Property Listing' : '+ Post Property Form'}
        </button>
      </div>

      {/* TAB CONTENT: MY LISTINGS */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
            </div>
          ) : myProperties.length === 0 ? (
            <div className="glass-panel p-10 rounded-2xl text-center space-y-3">
              <Building2 className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No active listings posted yet</h3>
              <p className="text-xs text-slate-400">Post your first property listing to start receiving direct buyer inquiries.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProperties.map(prop => (
                  <div key={prop.id} className="glass-card rounded-2xl p-5 space-y-4 relative flex flex-col justify-between">
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-brand-600 text-white rounded">
                          FOR {prop.listingType}
                        </span>
                        <span className="text-xs font-bold text-white">{formatPrice(prop.price)}</span>
                      </div>

                      <h3 className="font-bold text-white text-sm line-clamp-1">{prop.title}</h3>
                      
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{prop.location}, {prop.city}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <a 
                        href={`/properties/${prop.id}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-brand-400 hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Public Page
                      </a>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(prop)}
                          className="p-1.5 bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                          title="Edit Listing"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteProperty(prop.id)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Listings Pagination Controls */}
              {propsPagination.totalPages > 1 && (
                <div className="flex flex-col items-center gap-3 pt-8">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setPropsPage(prev => Math.max(1, prev - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={!propsPagination.hasPrevPage}
                      className="px-3.5 py-2 glass-card rounded-xl text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    <div className="flex items-center gap-1 text-xs">
                      {Array.from({ length: Math.min(5, propsPagination.totalPages) }, (_, i) => {
                        let pageNum = i + 1;
                        if (propsPagination.page > 3 && propsPagination.totalPages > 5) {
                          pageNum = propsPagination.page - 2 + i;
                        }
                        if (pageNum > propsPagination.totalPages) return null;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => {
                              setPropsPage(pageNum);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`w-8 h-8 rounded-xl font-bold transition-colors ${
                              propsPagination.page === pageNum
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
                      onClick={() => {
                        setPropsPage(prev => prev + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={!propsPagination.hasNextPage}
                      className="px-3.5 py-2 glass-card rounded-xl text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Remaining listings count */}
                  {(() => {
                    const shown = Math.min(propsPagination.page * propsPagination.limit, propsPagination.total);
                    const remaining = propsPagination.total - shown;
                    return remaining > 0 ? (
                      <p className="text-[11px] text-slate-500">
                        Showing <span className="text-slate-400 font-semibold">{shown}</span> of{' '}
                        <span className="text-slate-400 font-semibold">{propsPagination.total.toLocaleString()}</span> listings
                        {' '}— <span className="text-brand-400 font-semibold">({remaining.toLocaleString()} remaining)</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500">
                        All <span className="text-emerald-400 font-semibold">{propsPagination.total.toLocaleString()}</span> listings shown
                      </p>
                    );
                  })()}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB CONTENT: INQUIRIES RECEIVED */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="glass-panel p-10 rounded-2xl text-center space-y-3">
              <Mail className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No Lead Inquiries Received Yet</h3>
              <p className="text-xs text-slate-400">When prospective buyers inquire on your property listings, their details will appear here.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {inquiries.map((inq: any) => (
                  <div key={inq.id} className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-brand-400">
                        <Building2 className="w-4 h-4" />
                        <span className="font-semibold">{inq.property?.title || 'Property Listing'}</span>
                      </div>
                      <div className="text-sm font-bold text-white">{inq.name}</div>
                      <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                        "{inq.message}"
                      </p>
                    </div>

                    <div className="sm:text-right space-y-1 text-xs shrink-0">
                      <div className="text-slate-400 flex items-center sm:justify-end gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {inq.email}
                      </div>
                      <div className="text-emerald-400 font-bold flex items-center sm:justify-end gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> {inq.phone}
                      </div>
                      <div className="text-[10px] text-slate-500 pt-2">
                        Received: {new Date(inq.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inquiries Pagination Controls */}
              {inqPagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                  <button
                    onClick={() => {
                      setInqPage(prev => Math.max(1, prev - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={!inqPagination.hasPrevPage}
                    className="px-3.5 py-2 glass-card rounded-xl text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <div className="flex items-center gap-1 text-xs">
                    {Array.from({ length: Math.min(5, inqPagination.totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (inqPagination.page > 3 && inqPagination.totalPages > 5) {
                        pageNum = inqPagination.page - 2 + i;
                      }
                      if (pageNum > inqPagination.totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setInqPage(pageNum);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-8 h-8 rounded-xl font-bold transition-colors ${
                            inqPagination.page === pageNum
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
                    onClick={() => {
                      setInqPage(prev => prev + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={!inqPagination.hasNextPage}
                    className="px-3.5 py-2 glass-card rounded-xl text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB CONTENT: CREATE / EDIT PROPERTY FORM */}
      {activeTab === 'create' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 max-w-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white">
              {editingId ? 'Edit Property Listing' : 'Post New Property Listing'}
            </h3>
            {editingId && (
              <button onClick={() => { setEditingId(null); setActiveTab('listings'); }} className="text-xs text-slate-400 hover:text-white">
                Cancel Editing
              </button>
            )}
          </div>

          {formStatus && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
              formStatus.success ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}>
              {formStatus.success ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" /> : <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />}
              <span>{formStatus.message}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-5 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Property Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. 3 BHK Luxury Apartment in Bandra West"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Property Type *</label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-brand-500 focus:outline-none"
                >
                  <option value="APARTMENT">Apartment</option>
                  <option value="VILLA">Villa</option>
                  <option value="PLOT">Plot / Land</option>
                  <option value="COMMERCIAL">Commercial Space</option>
                  <option value="INDEPENDENT_HOUSE">Independent House</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Listing Purpose *</label>
                <select
                  value={formData.listingType}
                  onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-brand-500 focus:outline-none"
                >
                  <option value="SELL">For Sale</option>
                  <option value="RENT">For Rent</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Price (₹ INR) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 12500000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai, Bengaluru..."
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Location / Locality *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bandra West, Whitefield..."
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Bedrooms (BHK) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Bathrooms</label>
                <input
                  type="number"
                  min="1"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Area (Sq. Ft.) *</label>
                <input
                  type="number"
                  required
                  placeholder="1250"
                  value={formData.areaSqFt}
                  onChange={(e) => setFormData({ ...formData, areaSqFt: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Detailed Description *</label>
              <textarea
                rows={4}
                required
                placeholder="Describe key property highlights, floor plan, orientation, natural lighting, and proximity to hubs..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Amenities (comma-separated)</label>
              <input
                type="text"
                placeholder="Power Backup, Gym, Swimming Pool, Clubhouse, 24x7 Security"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Image URLs (comma-separated URLs)</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={formSubmitting}
              className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              {formSubmitting ? 'Submitting...' : editingId ? 'Update Listing' : 'Publish Property Listing'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
