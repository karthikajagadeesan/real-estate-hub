const { prisma } = require('../config/db');

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
];

const StoreService = {
  // Database Connection Health Check
  async checkConnection() {
    if (!prisma) return false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (err) {
      console.error('PostgreSQL Connection Check Error:', err.message);
      return false;
    }
  },

  // User Operations (Stored & Retrieved from PostgreSQL)
  async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
  },

  async createUser(userData) {
    return await prisma.user.create({
      data: {
        email: userData.email.toLowerCase().trim(),
        passwordHash: userData.passwordHash,
        name: userData.name,
        phone: userData.phone || null,
        role: userData.role || 'USER',
      }
    });
  },

  async findUserById(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  // Refresh Token Operations
  async saveRefreshToken(userId, token, expiresAt) {
    return await prisma.refreshToken.create({
      data: { userId, token, expiresAt }
    });
  },

  async findRefreshToken(token) {
    return await prisma.refreshToken.findUnique({
      where: { token }
    });
  },

  async revokeRefreshToken(token) {
    return await prisma.refreshToken.update({
      where: { token },
      data: { revoked: true }
    });
  },

  // Property Search & Filtering (Indexed queries in PostgreSQL)
  async getProperties({ city, location, propertyType, minPrice, maxPrice, bedrooms, sortBy = 'newest', page = 1, limit = 12 }) {
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(100, Math.max(1, parseInt(limit) || 12));
    const skip = (page - 1) * limit;

    const where = {};
    if (city && city.trim()) {
      const cleanCity = city.replace(/ ncr/gi, '').trim();
      where.city = { contains: cleanCity, mode: 'insensitive' };
    }
    if (location && location.trim()) {
      const cleanLoc = location.trim();
      where.OR = [
        { location: { contains: cleanLoc, mode: 'insensitive' } },
        { city: { contains: cleanLoc, mode: 'insensitive' } },
        { title: { contains: cleanLoc, mode: 'insensitive' } },
        { description: { contains: cleanLoc, mode: 'insensitive' } },
        { address: { contains: cleanLoc, mode: 'insensitive' } }
      ];
    }
    if (propertyType && propertyType.trim()) {
      where.propertyType = propertyType.trim();
    }
    if (bedrooms) {
      const bhkStr = bedrooms.toString().trim();
      if (bhkStr.endsWith('+')) {
        const num = parseInt(bhkStr.replace('+', ''), 10);
        if (!isNaN(num)) {
          where.bedrooms = { gte: num };
        }
      } else {
        const num = parseInt(bhkStr, 10);
        if (!isNaN(num)) {
          where.bedrooms = num;
        }
      }
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice && !isNaN(parseFloat(minPrice))) where.price.gte = parseFloat(minPrice);
      if (maxPrice && !isNaN(parseFloat(maxPrice))) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    if (sortBy === 'price_desc') orderBy = { price: 'desc' };
    if (sortBy === 'popular') orderBy = { viewsCount: 'desc' };

    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true, phone: true } } }
      }),
      prisma.property.count({ where })
    ]);

    return {
      data: properties,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1
      }
    };
  },

  async getPropertyById(id) {
    // Increment view count in PostgreSQL
    await prisma.property.update({
      where: { id },
      data: { viewsCount: { increment: 1 } }
    }).catch(() => {});

    return await prisma.property.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } }
    });
  },

  // Similar Properties Engine (PostgreSQL powered)
  async getSimilarProperties(propertyId, limit = 4) {
    const target = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!target) return [];

    const minP = target.price * 0.7;
    const maxP = target.price * 1.3;

    const candidates = await prisma.property.findMany({
      where: {
        id: { not: propertyId },
        city: target.city,
        price: { gte: minP, lte: maxP }
      },
      take: limit * 2,
      include: { user: { select: { id: true, name: true, email: true, phone: true } } }
    });

    return candidates
      .map(p => {
        let score = 0;
        if (p.propertyType === target.propertyType) score += 40;
        if (p.bedrooms === target.bedrooms) score += 30;
        const priceDiffRatio = Math.abs(p.price - target.price) / target.price;
        score += Math.max(0, (1 - priceDiffRatio) * 30);
        return { property: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.property);
  },

  // Create Property Listing in PostgreSQL
  async createProperty(userId, data) {
    return await prisma.property.create({
      data: {
        title: data.title,
        description: data.description,
        propertyType: data.propertyType,
        listingType: data.listingType || 'SELL',
        price: parseFloat(data.price),
        city: data.city,
        location: data.location,
        address: data.address || '',
        zipCode: data.zipCode || '',
        bedrooms: parseInt(data.bedrooms),
        bathrooms: parseInt(data.bathrooms || 1),
        areaSqFt: parseFloat(data.areaSqFt),
        amenities: Array.isArray(data.amenities) ? data.amenities : ['Power Backup', 'Car Parking', '24x7 Security'],
        images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [SAMPLE_IMAGES[0], SAMPLE_IMAGES[1]],
        status: 'AVAILABLE',
        userId
      },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } }
    });
  },

  // Update Property Listing in PostgreSQL
  async updateProperty(id, userId, data) {
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return { error: 'PROPERTY_NOT_FOUND' };
    if (existing.userId !== userId) return { error: 'UNAUTHORIZED_OWNER' };

    const updated = await prisma.property.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : undefined,
        description: data.description !== undefined ? data.description : undefined,
        propertyType: data.propertyType !== undefined ? data.propertyType : undefined,
        listingType: data.listingType !== undefined ? data.listingType : undefined,
        price: data.price !== undefined ? parseFloat(data.price) : undefined,
        city: data.city !== undefined ? data.city : undefined,
        location: data.location !== undefined ? data.location : undefined,
        address: data.address !== undefined ? data.address : undefined,
        zipCode: data.zipCode !== undefined ? data.zipCode : undefined,
        bedrooms: data.bedrooms !== undefined ? parseInt(data.bedrooms) : undefined,
        bathrooms: data.bathrooms !== undefined ? parseInt(data.bathrooms) : undefined,
        areaSqFt: data.areaSqFt !== undefined ? parseFloat(data.areaSqFt) : undefined,
        amenities: data.amenities !== undefined ? data.amenities : undefined,
        images: data.images !== undefined ? data.images : undefined,
      },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } }
    });

    return { data: updated };
  },

  // Delete Property Listing from PostgreSQL
  async deleteProperty(id, userId) {
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return { error: 'PROPERTY_NOT_FOUND' };
    if (existing.userId !== userId) return { error: 'UNAUTHORIZED_OWNER' };

    await prisma.property.delete({ where: { id } });
    return { success: true };
  },

  // Get user's posted listings from PostgreSQL (Paginated)
  async getUserProperties(userId, { page = 1, limit = 12 } = {}) {
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(100, Math.max(1, parseInt(limit) || 12));
    const skip = (page - 1) * limit;

    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true, phone: true } } }
      }),
      prisma.property.count({ where: { userId } })
    ]);

    return {
      data: properties,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1
      }
    };
  },

  // Lead / Inquiry Handling in PostgreSQL (Duplicate Guard)
  async createInquiry(data) {
    const { propertyId, email, name, phone, message, senderUserId, ipAddress } = data;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const duplicate = await prisma.inquiry.findFirst({
      where: {
        propertyId,
        email: email.toLowerCase().trim(),
        createdAt: { gte: oneHourAgo }
      }
    });

    if (duplicate) {
      return { duplicate: true };
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId,
        email: email.toLowerCase().trim(),
        name,
        phone,
        message,
        senderUserId: senderUserId || null,
        ipAddress: ipAddress || null
      }
    });

    return { data: inquiry };
  },

  // Get leads received for user's properties from PostgreSQL (Paginated & Relational Filter)
  async getUserInquiries(userId, { page = 1, limit = 12 } = {}) {
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(100, Math.max(1, parseInt(limit) || 12));
    const skip = (page - 1) * limit;

    const where = { property: { userId } };

    const [inquiries, totalCount] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        skip,
        take: limit,
        include: { property: { select: { id: true, title: true, city: true, location: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.inquiry.count({ where })
    ]);

    return {
      data: inquiries,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1
      }
    };
  }
};

module.exports = StoreService;
