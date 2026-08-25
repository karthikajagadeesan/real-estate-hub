require('dotenv').config();
const { prisma, pool } = require('../src/config/db');
const bcrypt = require('bcryptjs');


const CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 
  'Pune', 'Kolkata', 'Ahmedabad', 'Gurugram', 'Noida',
  'Jaipur', 'Surat', 'Chandigarh', 'Lucknow', 'Kochi'
];

const LOCATIONS = {
  'Mumbai': ['Bandra West', 'Andheri East', 'Powai', 'Worli', 'Juhu', 'Thane West', 'Lower Parel', 'Malad West', 'Navi Mumbai'],
  'Delhi': ['Vasant Kunj', 'Dwarka Sector 10', 'Greater Kailash', 'Saket', 'Connaught Place', 'Janakpuri', 'Rohini Sector 13'],
  'Bengaluru': ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Electronic City', 'Yelahanka', 'Bellandur', 'Marathahalli'],
  'Hyderabad': ['Gachibowli', 'HITECH City', 'Jubilee Hills', 'Banjara Hills', 'Kondapur', 'Madhapur', 'Kukatpally', 'Tellapur'],
  'Chennai': ['Adyar', 'Velachery', 'Anna Nagar', 'OMR', 'ECR', 'T. Nagar', 'Porur', 'Sholinganallur'],
  'Pune': ['Hinjewadi', 'Koregaon Park', 'Wakad', 'Viman Nagar', 'Baner', 'Kharadi', 'Hadapsar', 'Aundh'],
  'Kolkata': ['Salt Lake', 'New Town', 'Ballygunge', 'Rajarhat', 'Park Street', 'Behala', 'Howrah'],
  'Ahmedabad': ['SG Highway', 'Bodakdev', 'Prahlad Nagar', 'Satellite', 'Vastrapur', 'Bopal', 'Thaltej'],
  'Gurugram': ['Golf Course Road', 'DLF Phase 5', 'Sector 56', 'Cyber City', 'Sohna Road', 'Sector 82', 'Nirvana Country'],
  'Noida': ['Sector 62', 'Sector 150', 'Greater Noida West', 'Sector 76', 'Sector 128', 'Sector 137', 'Jaypee Wish Town'],
  'Jaipur': ['Malviya Nagar', 'Vaishali Nagar', 'C-Scheme', 'Jagatpura', 'Mansarovar'],
  'Surat': ['Vesu', 'Adajan', 'Piplod', 'Palanpur', 'VIP Road'],
  'Chandigarh': ['Sector 17', 'Sector 35', 'Sector 8', 'Mohali Phase 7', 'Zirakpur'],
  'Lucknow': ['Gomti Nagar', 'Hazratganj', 'Alambagh', 'Indira Nagar', 'Mahanagar'],
  'Kochi': ['Marine Drive', 'Kakkanad', 'Edappally', 'Panampilly Nagar', 'Vyttila']
};

const DEVELOPERS = [
  'Prestige Group', 'DLF Limited', 'Godrej Properties', 'Sobha Developers',
  'Lodha Group', 'Hiranandani Developers', 'Brigade Group', 'Shapoorji Pallonji',
  'Oberoi Realty', 'Kolte-Patil', 'Mahindra Lifespaces', 'Tata Housing'
];

const TYPES = ['APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'INDEPENDENT_HOUSE'];

const AMENITIES_POOL = [
  'Power Backup', '24x7 Security', 'Car Parking', 'Gymnasium', 'Swimming Pool',
  'Clubhouse', "Children's Play Area", 'Intercom', 'EV Charging Station',
  'Jogging Track', 'Tennis Court', 'Solar Water Heating', 'CCTV Surveillance'
];

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
];

async function main() {
  const targetCount = 50000;

  console.log(`🧹 Clearing existing inquiries & properties from database...`);
  await prisma.inquiry.deleteMany({});
  await prisma.property.deleteMany({});

  console.log(`🌱 Seeding database with ${targetCount.toLocaleString()} realistic property records...`);

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@indiadits.com' },
    update: {},
    create: {
      email: 'demo@indiadits.com',
      name: 'Rajesh Sharma',
      passwordHash,
      phone: '+91 9876543210',
      role: 'USER'
    }
  });

  const agentUser = await prisma.user.upsert({
    where: { email: 'agent@indiadits.com' },
    update: {},
    create: {
      email: 'agent@indiadits.com',
      name: 'Priya Verma',
      passwordHash,
      phone: '+91 9123456789',
      role: 'AGENT'
    }
  });

  const batchSize = 5000;
  let created = 0;
  const startTime = Date.now();

  while (created < targetCount) {
    const currentBatch = Math.min(batchSize, targetCount - created);
    const propertiesData = [];

    for (let i = 0; i < currentBatch; i++) {
      const idx = created + i + 1;
      const city = CITIES[idx % CITIES.length];
      const locList = LOCATIONS[city] || ['City Center'];
      const location = locList[idx % locList.length];
      const developer = DEVELOPERS[idx % DEVELOPERS.length];
      const propertyType = TYPES[idx % TYPES.length];
      const bedrooms = (idx % 5) + 1;
      const bathrooms = Math.min(bedrooms, (idx % 4) + 1);

      // Realistic area & pricing based on city tier
      const baseArea = 550 + (bedrooms * 320) + ((idx * 17) % 650);
      const isMetro = ['Mumbai', 'Delhi', 'Bengaluru', 'Gurugram'].includes(city);
      const pricePerSqFt = isMetro ? (6500 + ((idx * 13) % 18500)) : (3500 + ((idx * 11) % 8500));
      const calculatedPrice = Math.round((baseArea * pricePerSqFt) / 100000) * 100000;
      const finalPrice = Math.max(2500000, calculatedPrice);

      // Select 4-6 random amenities
      const numAmenities = 4 + (idx % 3);
      const amenities = [];
      for (let a = 0; a < numAmenities; a++) {
        const item = AMENITIES_POOL[(idx + a * 3) % AMENITIES_POOL.length];
        if (!amenities.includes(item)) amenities.push(item);
      }

      // Images array
      const img1 = SAMPLE_IMAGES[idx % SAMPLE_IMAGES.length];
      const img2 = SAMPLE_IMAGES[(idx + 2) % SAMPLE_IMAGES.length];

      propertiesData.push({
        title: `${bedrooms} BHK ${developer} ${propertyType.replace('_', ' ')} in ${location}`,
        description: `Premium ${bedrooms} BHK ${propertyType.toLowerCase().replace('_', ' ')} constructed by ${developer} located at ${location}, ${city}. Designed with open layouts, high-grade flooring, energy-efficient fixtures, and excellent connectivity to major IT hubs and commercial centers.`,
        propertyType,
        listingType: idx % 6 === 0 ? 'RENT' : 'SELL',
        price: idx % 6 === 0 ? Math.round(finalPrice / 300 / 1000) * 1000 : finalPrice,
        city,
        location,
        address: `${(idx % 450) + 1}, Tower ${String.fromCharCode(65 + (idx % 8))}, ${developer} Residency, ${location}`,
        zipCode: `${100 + (idx % 800)}0${(idx % 8) + 1}`,
        bedrooms,
        bathrooms,
        areaSqFt: baseArea,
        amenities,
        images: [img1, img2],
        status: 'AVAILABLE',
        userId: idx % 3 === 0 ? demoUser.id : agentUser.id
      });
    }

    await prisma.property.createMany({
      data: propertiesData
    });

    created += currentBatch;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⚡ Seeded ${created.toLocaleString()} / ${targetCount.toLocaleString()} properties (${elapsed}s)...`);
  }

  console.log(`🎉 Successfully populated database with ${targetCount.toLocaleString()} properties in ${((Date.now() - startTime) / 1000).toFixed(1)}s!`);
}

main()
  .catch((e) => {
    console.error('Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    if (pool) await pool.end();
  });

