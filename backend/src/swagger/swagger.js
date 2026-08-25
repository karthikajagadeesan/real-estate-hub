const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
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
      {
        url: '/api/v1',
        description: 'Current Domain REST API'
      },
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT Access Token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['USER', 'AGENT', 'ADMIN'] }
          }
        },
        Property: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            propertyType: { type: 'string', enum: ['APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'INDEPENDENT_HOUSE'] },
            listingType: { type: 'string', enum: ['SELL', 'RENT'] },
            price: { type: 'number' },
            city: { type: 'string' },
            location: { type: 'string' },
            bedrooms: { type: 'integer' },
            bathrooms: { type: 'integer' },
            areaSqFt: { type: 'number' },
            amenities: { type: 'array', items: { type: 'string' } },
            images: { type: 'array', items: { type: 'string' } },
            viewsCount: { type: 'integer' },
            userId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Inquiry: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            propertyId: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            message: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    paths: {
      '/auth/register': {
        post: {
          summary: 'Register a new user',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'Rajesh Kumar' },
                    email: { type: 'string', example: 'rajesh@example.com' },
                    password: { type: 'string', example: 'Password123!' },
                    phone: { type: 'string', example: '+91 9876543210' },
                    role: { type: 'string', enum: ['USER', 'AGENT'], example: 'USER' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'User registered successfully' },
            400: { description: 'Validation failed' },
            409: { description: 'User email already exists' }
          }
        }
      },
      '/auth/login': {
        post: {
          summary: 'User Login',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'demo@indiadits.com' },
                    password: { type: 'string', example: 'Password123!' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Login successful' },
            401: { description: 'Invalid credentials' }
          }
        }
      },
      '/auth/refresh-token': {
        post: {
          summary: 'Refresh Access Token',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['refreshToken'],
                  properties: {
                    refreshToken: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'New Access Token generated' },
            401: { description: 'Invalid refresh token' }
          }
        }
      },
      '/properties': {
        get: {
          summary: 'Search & filter properties with pagination',
          tags: ['Properties'],
          parameters: [
            { in: 'query', name: 'city', schema: { type: 'string' }, description: 'Filter by city (e.g. Mumbai, Bengaluru)' },
            { in: 'query', name: 'location', schema: { type: 'string' }, description: 'Search by location/locality' },
            { in: 'query', name: 'propertyType', schema: { type: 'string' }, description: 'APARTMENT, VILLA, PLOT, COMMERCIAL, INDEPENDENT_HOUSE' },
            { in: 'query', name: 'minPrice', schema: { type: 'number' }, description: 'Minimum budget price' },
            { in: 'query', name: 'maxPrice', schema: { type: 'number' }, description: 'Maximum budget price' },
            { in: 'query', name: 'bedrooms', schema: { type: 'integer' }, description: 'Number of bedrooms (1, 2, 3, 4)' },
            { in: 'query', name: 'sortBy', schema: { type: 'string', enum: ['newest', 'price_asc', 'price_desc', 'popular'] } },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 12 } }
          ],
          responses: {
            200: { description: 'List of matching properties with pagination metadata' }
          }
        },
        post: {
          summary: 'Create a new property listing (Protected)',
          tags: ['Properties'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Property' }
              }
            }
          },
          responses: {
            201: { description: 'Property created' },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/properties/{id}': {
        get: {
          summary: 'Get property detail by ID',
          tags: ['Properties'],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Property details' },
            404: { description: 'Property not found' }
          }
        },
        put: {
          summary: 'Edit own property listing (Protected)',
          tags: ['Properties'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Property updated' },
            403: { description: 'Forbidden (Not listing owner)' }
          }
        },
        delete: {
          summary: 'Delete own property listing (Protected)',
          tags: ['Properties'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Property deleted' },
            403: { description: 'Forbidden (Not listing owner)' }
          }
        }
      },
      '/properties/{id}/similar': {
        get: {
          summary: 'Get similar properties recommendations',
          tags: ['Properties'],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Top recommended similar properties' }
          }
        }
      },
      '/inquiries': {
        post: {
          summary: 'Submit lead / contact inquiry to owner (Rate Limited & Spam Guard)',
          tags: ['Inquiries'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['propertyId', 'name', 'email', 'phone', 'message'],
                  properties: {
                    propertyId: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    phone: { type: 'string' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Inquiry submitted' },
            429: { description: 'Duplicate submission or rate limit reached' }
          }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
