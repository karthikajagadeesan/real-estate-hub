'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, CheckCircle, Code, Copy, ExternalLink, ShieldCheck, 
  Send, Terminal, Check, Play, Key, Server, Database, ArrowLeft, 
  Sparkles, Search, ChevronRight, RefreshCw, Zap, Sliders, Globe, Activity, AlertCircle
} from 'lucide-react';

export interface EndpointSpec {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  tag: string;
  summary: string;
  description: string;
  protected: boolean;
  params?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    example: string;
  }>;
  requestBody?: Record<string, any>;
  responses: Record<number, {
    description: string;
    example: any;
  }>;
}

const openApiSpec: {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
    contact: { name: string; email: string };
  };
  servers: Array<{ url: string; description: string }>;
  endpoints: EndpointSpec[];
} = {
  openapi: '3.0.0',
  info: {
    title: 'IndiaDits Real Estate Listing API',
    version: '1.0.0',
    description: 'Production-ready REST API for IndiaDits Real Estate Platform inspired by 99acres and NoBroker.',
    contact: {
      name: 'IndiaDits Engineering Team',
      email: 'support@indiadits.com'
    }
  },
  servers: [
    { url: '/api/v1', description: 'Production / Development REST API' }
  ],
  endpoints: [
    {
      id: 'auth-register',
      path: '/api/v1/auth/register',
      method: 'POST',
      tag: 'Authentication',
      summary: 'Register a new user account',
      description: 'Creates a user account (USER or AGENT) with hashed passwords using bcryptjs and returns JWT access tokens.',
      protected: false,
      requestBody: {
        name: 'Rajesh Sharma',
        email: 'rajesh@example.com',
        password: 'Password123!',
        phone: '+91 9876543210',
        role: 'USER'
      },
      responses: {
        201: {
          description: 'User registered successfully with JWT tokens generated.',
          example: {
            success: true,
            message: 'User registered successfully.',
            data: {
              user: {
                id: 'user-demo-101',
                name: 'Rajesh Sharma',
                email: 'rajesh@example.com',
                phone: '+91 9876543210',
                role: 'USER',
                createdAt: '2026-08-14T19:30:00.000Z'
              },
              tokens: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xMDEiLCJyb2xlIjoiVVNFUiJ9...',
                refreshToken: 'rt-demo-9923847293847'
              }
            }
          }
        },
        400: {
          description: 'Bad Request - Validation Error or Duplicate Email.',
          example: {
            success: false,
            message: 'Validation failed: Email already registered.',
            errors: [
              { field: 'email', message: 'User with this email already exists' }
            ]
          }
        },
        500: {
          description: 'Internal Server Error.',
          example: {
            success: false,
            message: 'An unexpected database error occurred. Please try again later.'
          }
        }
      }
    },
    {
      id: 'auth-login',
      path: '/api/v1/auth/login',
      method: 'POST',
      tag: 'Authentication',
      summary: 'User Login & Token Generation',
      description: 'Authenticates credentials and returns JWT Bearer Access Token & Refresh Token.',
      protected: false,
      requestBody: {
        email: 'demo@indiadits.com',
        password: 'Password123!'
      },
      responses: {
        200: {
          description: 'Authentication successful.',
          example: {
            success: true,
            message: 'Authentication successful.',
            data: {
              user: {
                id: 'user-demo-1',
                name: 'Rajesh Sharma',
                email: 'demo@indiadits.com',
                role: 'USER'
              },
              tokens: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZGVtby0xIiwicm9sZSI6IlVTRVIifQ...',
                refreshToken: 'rt-demo-123456789'
              }
            }
          }
        },
        401: {
          description: 'Invalid credentials supplied.',
          example: {
            success: false,
            message: 'Invalid email or password provided.'
          }
        }
      }
    },
    {
      id: 'auth-me',
      path: '/api/v1/auth/me',
      method: 'GET',
      tag: 'Authentication',
      summary: 'Get Current Authenticated User Profile',
      description: 'Returns profile details for the currently logged-in user authenticated via JWT Bearer header.',
      protected: true,
      responses: {
        200: {
          description: 'User profile fetched successfully.',
          example: {
            success: true,
            data: {
              id: 'user-demo-1',
              name: 'Rajesh Sharma',
              email: 'demo@indiadits.com',
              phone: '+91 9876543210',
              role: 'USER',
              postedListingsCount: 4,
              receivedLeadsCount: 12
            }
          }
        },
        401: {
          description: 'Unauthorized - Missing or invalid Bearer token.',
          example: {
            success: false,
            message: 'Access denied. No authentication token provided.'
          }
        }
      }
    },
    {
      id: 'properties-list',
      path: '/api/v1/properties',
      method: 'GET',
      tag: 'Properties',
      summary: 'Search & Filter Properties (50,000+ Scalable)',
      description: 'Queries properties with optional filters: city, location, propertyType, minPrice, maxPrice, bedrooms, sortBy, page, limit.',
      protected: false,
      params: [
        { name: 'city', type: 'string', required: false, description: 'Filter by city name', example: 'Mumbai' },
        { name: 'location', type: 'string', required: false, description: 'Filter by neighborhood/locality', example: 'Bandra West' },
        { name: 'propertyType', type: 'string', required: false, description: 'APARTMENT, VILLA, COMMERCIAL, LAND', example: 'APARTMENT' },
        { name: 'minPrice', type: 'number', required: false, description: 'Minimum price filter (INR)', example: '5000000' },
        { name: 'maxPrice', type: 'number', required: false, description: 'Maximum price filter (INR)', example: '25000000' },
        { name: 'bedrooms', type: 'number', required: false, description: 'Number of bedrooms (BHK)', example: '2' },
        { name: 'sortBy', type: 'string', required: false, description: 'Sort by newest, price_asc, price_desc', example: 'newest' },
        { name: 'page', type: 'number', required: false, description: 'Page number for pagination', example: '1' },
        { name: 'limit', type: 'number', required: false, description: 'Records per page', example: '12' }
      ],
      responses: {
        200: {
          description: 'Properties retrieved successfully.',
          example: {
            success: true,
            message: 'Properties retrieved successfully',
            data: [
              {
                id: 'prop-1',
                title: '2 BHK Luxury Apartment in Bandra West',
                propertyType: 'APARTMENT',
                listingType: 'SELL',
                price: 18500000,
                formattedPrice: '₹1.85 Cr',
                city: 'Mumbai',
                location: 'Bandra West',
                bedrooms: 2,
                bathrooms: 2,
                areaSqFt: 1100,
                images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'],
                viewsCount: 145,
                createdAt: '2026-08-14T10:00:00.000Z'
              },
              {
                id: 'prop-2',
                title: '3 BHK Modern Flat in Hiranandani Powai',
                propertyType: 'APARTMENT',
                listingType: 'SELL',
                price: 24000000,
                formattedPrice: '₹2.40 Cr',
                city: 'Mumbai',
                location: 'Powai',
                bedrooms: 3,
                bathrooms: 3,
                areaSqFt: 1450,
                images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
                viewsCount: 230,
                createdAt: '2026-08-13T14:20:00.000Z'
              }
            ],
            pagination: {
              total: 150,
              page: 1,
              limit: 12,
              totalPages: 13,
              hasNextPage: true,
              hasPrevPage: false
            }
          }
        },
        400: {
          description: 'Invalid parameter types or filters.',
          example: {
            success: false,
            message: 'Invalid minPrice parameter provided. Must be a valid positive number.'
          }
        }
      }
    },
    {
      id: 'properties-create',
      path: '/api/v1/properties',
      method: 'POST',
      tag: 'Properties',
      summary: 'Post New Property Listing',
      description: 'Posts a new real estate listing to the platform. Requires authenticated user session.',
      protected: true,
      requestBody: {
        title: '3 BHK Sea View Apartment in Worli',
        description: 'Luxurious sea-facing apartment with premium fittings, Italian marble flooring, and 2 designated car parking spaces.',
        propertyType: 'APARTMENT',
        listingType: 'SELL',
        price: 32000000,
        city: 'Mumbai',
        location: 'Worli',
        address: '402, Horizon Towers, Worli Sea Face',
        bedrooms: 3,
        bathrooms: 3,
        areaSqFt: 1650,
        amenities: ['Power Backup', 'Car Parking', '24x7 Security', 'Swimming Pool', 'Gymnasium'],
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80']
      },
      responses: {
        201: {
          description: 'Property listing created successfully.',
          example: {
            success: true,
            message: 'Property created successfully.',
            data: {
              id: 'prop-new-889',
              title: '3 BHK Sea View Apartment in Worli',
              propertyType: 'APARTMENT',
              listingType: 'SELL',
              price: 32000000,
              city: 'Mumbai',
              location: 'Worli',
              status: 'APPROVED',
              createdAt: '2026-08-14T21:40:00.000Z'
            }
          }
        },
        401: {
          description: 'Unauthorized access token.',
          example: {
            success: false,
            message: 'Authentication token is invalid or expired.'
          }
        }
      }
    },
    {
      id: 'properties-detail',
      path: '/api/v1/properties/:id',
      method: 'GET',
      tag: 'Properties',
      summary: 'Get Property Detail by ID',
      description: 'Fetches complete property details including images, amenities, and owner contact details.',
      protected: false,
      params: [
        { name: 'id', type: 'string', required: true, description: 'Property ID or UUID', example: 'prop-1' }
      ],
      responses: {
        200: {
          description: 'Property details retrieved successfully.',
          example: {
            success: true,
            data: {
              id: 'prop-1',
              title: '2 BHK Luxury Apartment in Bandra West',
              description: 'Spacious apartment featuring premium finishes, modular kitchen, and panoramic city views.',
              propertyType: 'APARTMENT',
              listingType: 'SELL',
              price: 18500000,
              formattedPrice: '₹1.85 Cr',
              city: 'Mumbai',
              location: 'Bandra West',
              address: '101, Tower 1, Bandra West, Mumbai',
              bedrooms: 2,
              bathrooms: 2,
              areaSqFt: 1100,
              amenities: ['Power Backup', 'Car Parking', '24x7 Security', 'Clubhouse'],
              images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'],
              viewsCount: 145,
              user: {
                id: 'user-demo-1',
                name: 'Rajesh Sharma',
                email: 'demo@indiadits.com',
                phone: '+91 9876543210'
              }
            }
          }
        },
        404: {
          description: 'Property not found.',
          example: {
            success: false,
            message: 'Property with ID prop-999 not found.'
          }
        }
      }
    },
    {
      id: 'properties-similar',
      path: '/api/v1/properties/:id/similar',
      method: 'GET',
      tag: 'Properties',
      summary: 'AI Similar Property Recommendations',
      description: 'Calculates vector similarity scores based on location, property type, price band, and bedroom count.',
      protected: false,
      params: [
        { name: 'id', type: 'string', required: true, description: 'Target property ID', example: 'prop-1' }
      ],
      responses: {
        200: {
          description: 'AI recommendation list fetched.',
          example: {
            success: true,
            data: [
              {
                id: 'prop-2',
                title: '2 BHK Luxury Apartment in Juhu',
                price: 19500000,
                location: 'Juhu',
                similarityScore: 94.5,
                matchReason: 'Matching city, bedroom count, and price range'
              },
              {
                id: 'prop-3',
                title: '2.5 BHK Flat in Khar West',
                price: 17800000,
                location: 'Khar West',
                similarityScore: 89.2,
                matchReason: 'Adjacent locality and similar square footage'
              }
            ]
          }
        }
      }
    },
    {
      id: 'inquiries-create',
      path: '/api/v1/inquiries',
      method: 'POST',
      tag: 'Inquiries',
      summary: 'Submit Lead Inquiry to Property Owner',
      description: 'Submits user contact request to property owner with built-in spam protection and rate limiting.',
      protected: false,
      requestBody: {
        propertyId: 'prop-1',
        name: 'Ankit Verma',
        email: 'ankit@example.com',
        phone: '+91 9876543210',
        message: 'I am interested in scheduling a site visit for this property this weekend.'
      },
      responses: {
        201: {
          description: 'Inquiry submitted successfully.',
          example: {
            success: true,
            message: 'Inquiry submitted successfully! The owner will get back to you shortly.',
            data: {
              id: 'inq-101',
              propertyId: 'prop-1',
              createdAt: '2026-08-14T21:42:00.000Z'
            }
          }
        },
        400: {
          description: 'Invalid input fields or missing contact info.',
          example: {
            success: false,
            message: 'Please provide a valid 10-digit Indian phone number.'
          }
        }
      }
    }
  ]
};

export default function ApiDocsPage() {
  const [selectedId, setSelectedId] = useState<string>('auth-register');
  const [activeTag, setActiveTag] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatusCode, setSelectedStatusCode] = useState<number>(201);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [viewRawJson, setViewRawJson] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  // Interactive console state
  const [paramInputs, setParamInputs] = useState<Record<string, string>>({});
  const [requestBodyText, setRequestBodyText] = useState<string>('');
  const [liveResult, setLiveResult] = useState<{ status: number; time: string; data: any } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Find currently selected endpoint
  const currentEndpoint = openApiSpec.endpoints.find(e => e.id === selectedId) || openApiSpec.endpoints[0];

  // Update selected status code and request body whenever active endpoint changes
  useEffect(() => {
    if (currentEndpoint) {
      const availableCodes = Object.keys(currentEndpoint.responses).map(Number);
      setSelectedStatusCode(availableCodes[0] || 200);
      setRequestBodyText(
        currentEndpoint.requestBody ? JSON.stringify(currentEndpoint.requestBody, null, 2) : ''
      );
      
      // Initialize parameter inputs
      const initialParams: Record<string, string> = {};
      if (currentEndpoint.params) {
        currentEndpoint.params.forEach(p => {
          initialParams[p.name] = p.example || '';
        });
      }
      setParamInputs(initialParams);
      setLiveResult(null);
    }
  }, [selectedId]);

  // Check server health
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/health');
        if (res.ok) setServerStatus('online');
        else setServerStatus('offline');
      } catch (e) {
        setServerStatus('offline');
      }
    }
    checkHealth();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Filter endpoints by tag and search query
  const filteredEndpoints = openApiSpec.endpoints.filter(ep => {
    const matchesTag = activeTag === 'ALL' || ep.tag.toUpperCase() === activeTag.toUpperCase();
    const matchesSearch = searchQuery === '' || 
      ep.path.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ep.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.method.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'POST':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'PUT':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'DELETE':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    }
  };

  const executeLiveRequest = async () => {
    setIsExecuting(true);
    const startTime = performance.now();

    try {
      let targetUrl = currentEndpoint.path;
      
      // Replace path variables
      if (currentEndpoint.params) {
        currentEndpoint.params.forEach(p => {
          if (targetUrl.includes(`:${p.name}`)) {
            targetUrl = targetUrl.replace(`:${p.name}`, paramInputs[p.name] || p.example);
          }
        });
      }

      // Append query parameters for GET requests
      if (currentEndpoint.method === 'GET' && currentEndpoint.params) {
        const queryParams = new URLSearchParams();
        currentEndpoint.params.forEach(p => {
          if (!currentEndpoint.path.includes(`:${p.name}`) && paramInputs[p.name]) {
            queryParams.append(p.name, paramInputs[p.name]);
          }
        });
        const queryString = queryParams.toString();
        if (queryString) targetUrl += `?${queryString}`;
      }

      const options: RequestInit = {
        method: currentEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
          ...(currentEndpoint.protected ? { Authorization: 'Bearer mock-jwt-token-demo-123' } : {})
        }
      };

      if (['POST', 'PUT', 'PATCH'].includes(currentEndpoint.method) && requestBodyText) {
        options.body = requestBodyText;
      }

      const response = await fetch(targetUrl, options);
      const data = await response.json();
      const endTime = performance.now();
      const timeMs = Math.round(endTime - startTime);

      setLiveResult({
        status: response.status,
        time: `${timeMs}ms`,
        data
      });
    } catch (error) {
      const endTime = performance.now();
      const timeMs = Math.round(endTime - startTime);
      
      // Fallback simulation if backend is not running live
      const mockResponse = currentEndpoint.responses[200] || currentEndpoint.responses[201] || Object.values(currentEndpoint.responses)[0];
      setLiveResult({
        status: 200,
        time: `${timeMs > 0 ? timeMs : 18}ms (Mock Sandbox)`,
        data: mockResponse.example
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans pb-12">
      
      {/* Header Banner */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="p-2 rounded-xl glass-card text-slate-400 hover:text-white hover:border-brand-500/50 transition-all flex items-center justify-center"
                title="Back to Platform"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black font-outfit text-white tracking-tight flex items-center gap-2">
                    IndiaDits API Docs <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30">v1.0.0</span>
                  </h1>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block mt-0.5">
                  Interactive REST API Explorer, OpenAPI 3.0 Documentation & Mock Testing Sandbox
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
                serverStatus === 'online' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80' : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}>
                <span className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                {serverStatus === 'online' ? 'Backend Live (Port 5000)' : 'Mock Engine Online'}
              </div>

              <button
                onClick={() => setViewRawJson(!viewRawJson)}
                className="px-3.5 py-1.5 glass-card rounded-xl text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 border border-slate-700 hover:border-brand-500/50 transition-all"
              >
                <Code className="w-4 h-4 text-brand-400" />
                {viewRawJson ? 'Swagger Layout' : 'Raw OpenAPI JSON'}
              </button>

              <a
                href="/api-docs"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Express Swagger UI
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* Main Container */}
      {viewRawJson ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-brand-400" /> OpenAPI 3.0 JSON Specification
              </h3>
              <button
                onClick={() => handleCopy(JSON.stringify(openApiSpec, null, 2))}
                className="px-3 py-1.5 glass-card rounded-lg text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
              >
                {copiedText === JSON.stringify(openApiSpec, null, 2) ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedText === JSON.stringify(openApiSpec, null, 2) ? 'Copied' : 'Copy Full Spec'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 max-h-[700px]">
              {JSON.stringify(openApiSpec, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* 2-Column Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUMN 1: LEFT PANEL - ENDPOINT SELECTOR & NAVIGATION */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-1">
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search endpoints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>

              {/* Tag Categories Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {['ALL', 'Authentication', 'Properties', 'Inquiries'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 text-[11px] ${
                      activeTag === tag
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'bg-slate-900/70 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Endpoints List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1 uppercase tracking-wider">
                  <span>API Endpoints ({filteredEndpoints.length})</span>
                  <span>Select Endpoint</span>
                </div>

                {filteredEndpoints.map((ep) => {
                  const isSelected = ep.id === selectedId;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => setSelectedId(ep.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-2 group ${
                        isSelected 
                          ? 'bg-brand-950/40 border-brand-500/60 shadow-lg shadow-brand-500/10 text-white ring-1 ring-brand-500/30' 
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black border font-mono ${getMethodBadgeClass(ep.method)}`}>
                            {ep.method}
                          </span>
                          <span className="text-xs font-semibold text-white truncate group-hover:text-brand-300 transition-colors">
                            {ep.summary}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate">
                          {ep.path}
                        </div>
                      </div>

                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-brand-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'}`} />
                    </button>
                  );
                })}

                {filteredEndpoints.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                    No matching endpoints found.
                  </div>
                )}
              </div>

            </div>

            {/* COLUMN 2: RIGHT PANEL - UNIFIED ENDPOINT DETAILS & RESPONSE INSPECTOR */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-800/90 space-y-6 shadow-2xl">
                
                {/* Header */}
                <div className="space-y-3 pb-5 border-b border-slate-800">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-wider border font-mono ${getMethodBadgeClass(currentEndpoint.method)}`}>
                        {currentEndpoint.method}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800 text-xs font-medium">
                        {currentEndpoint.tag}
                      </span>
                      {currentEndpoint.protected && (
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-950/70 text-amber-300 border border-amber-800/80 text-xs font-medium flex items-center gap-1">
                          <Key className="w-3 h-3" /> Bearer Auth
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleCopy(typeof window !== 'undefined' ? `${window.location.origin}${currentEndpoint.path}` : currentEndpoint.path)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white glass-card rounded-xl flex items-center gap-1.5 border border-slate-800 hover:border-brand-500/30 transition-all"
                      title="Copy full endpoint URL"
                    >
                      {copiedText === (typeof window !== 'undefined' ? `${window.location.origin}${currentEndpoint.path}` : currentEndpoint.path) ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Path</span>
                    </button>
                  </div>

                  <div>
                    <h2 className="text-2xl font-extrabold font-outfit text-white">
                      {currentEndpoint.summary}
                    </h2>
                    <code className="text-xs font-mono text-brand-300 block mt-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      {typeof window !== 'undefined' ? window.location.origin : ''}{currentEndpoint.path}
                    </code>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentEndpoint.description}
                  </p>
                </div>

                {/* Content Grid: Request / Parameters on Left side of Right Panel, Response JSON on Right side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* REQUEST & PARAMETERS SUB-COLUMN */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                      <Sliders className="w-3.5 h-3.5 text-brand-400" /> Parameters & Request Input
                    </h3>

                    {/* Parameters if any */}
                    {currentEndpoint.params && currentEndpoint.params.length > 0 && (
                      <div className="space-y-2">
                        {currentEndpoint.params.map(p => (
                          <div key={p.name} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 font-mono text-xs">
                                <span className="text-brand-300 font-bold">{p.name}</span>
                                <span className="text-[11px] text-slate-500">({p.type})</span>
                              </div>
                              <span className="text-[10px] text-slate-400">e.g. {p.example}</span>
                            </div>
                            <input
                              type="text"
                              value={paramInputs[p.name] || ''}
                              onChange={(e) => setParamInputs({ ...paramInputs, [p.name]: e.target.value })}
                              placeholder={`Value for ${p.name}...`}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-emerald-400 font-mono focus:outline-none focus:border-brand-500"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Request Body JSON if any */}
                    {currentEndpoint.requestBody ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400">Request Body (JSON)</span>
                          <button
                            onClick={() => handleCopy(JSON.stringify(currentEndpoint.requestBody, null, 2))}
                            className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> Sample
                          </button>
                        </div>

                        <textarea
                          rows={8}
                          value={requestBodyText}
                          onChange={(e) => setRequestBodyText(e.target.value)}
                          className="w-full bg-slate-950 p-3 rounded-xl text-xs font-mono text-sky-300 border border-slate-800 focus:outline-none focus:border-brand-500 leading-relaxed resize-y"
                        />
                      </div>
                    ) : (
                      !currentEndpoint.params?.length && (
                        <div className="p-4 rounded-xl bg-slate-950/40 text-slate-500 text-xs italic border border-slate-800/60">
                          No query parameters or body required for this request.
                        </div>
                      )
                    )}

                    {/* Execute Request Button */}
                    <button
                      onClick={executeLiveRequest}
                      disabled={isExecuting}
                      className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 via-brand-500 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                    >
                      {isExecuting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" /> Executing Live API Request...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" /> Send Live Request / Test
                        </>
                      )}
                    </button>
                  </div>

                  {/* RESPONSE JSON SUB-COLUMN */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Response JSON
                      </h3>
                      <span className="text-[10px] font-mono text-slate-500">application/json</span>
                    </div>

                    {/* Live Result status pill or Status Code selector tabs */}
                    {liveResult ? (
                      <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-emerald-300">HTTP {liveResult.status} OK</span>
                        </div>
                        <span className="font-mono text-emerald-400/80 text-[11px]">{liveResult.time}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                          <span>HTTP Response Codes</span>
                          <span className="text-slate-500 font-normal">Click code to inspect</span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {Object.keys(currentEndpoint.responses).map(codeStr => {
                            const code = Number(codeStr);
                            const isSelected = selectedStatusCode === code;
                            const isSuccess = code >= 200 && code < 300;
                            return (
                              <button
                                key={code}
                                onClick={() => setSelectedStatusCode(code)}
                                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                                  isSelected
                                    ? isSuccess 
                                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-md' 
                                      : 'bg-rose-950 text-rose-300 border-rose-500 shadow-md'
                                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                                }`}
                              >
                                {code} {isSuccess ? 'OK' : 'Error'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Status Description */}
                    {!liveResult && currentEndpoint.responses[selectedStatusCode] && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                        {currentEndpoint.responses[selectedStatusCode].description}
                      </p>
                    )}

                    {/* Response JSON Code Block */}
                    <div className="relative">
                      <div className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded-t-xl border border-b-0 border-slate-800 text-[11px]">
                        <span className="font-mono text-slate-400">Response Payload</span>
                        <button
                          onClick={() => handleCopy(
                            JSON.stringify(
                              liveResult ? liveResult.data : currentEndpoint.responses[selectedStatusCode]?.example,
                              null, 2
                            )
                          )}
                          className="text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedText ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <pre className="p-4 rounded-b-xl bg-[#090d16] text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800 max-h-[480px] leading-relaxed shadow-inner">
                        {JSON.stringify(
                          liveResult ? liveResult.data : currentEndpoint.responses[selectedStatusCode]?.example || { message: 'No example available' },
                          null, 2
                        )}
                      </pre>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
