const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().optional(),
  role: z.enum(['USER', 'AGENT', 'ADMIN']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  propertyType: z.enum(['APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL', 'INDEPENDENT_HOUSE']),
  listingType: z.enum(['SELL', 'RENT']).optional().default('SELL'),
  price: z.number().positive('Price must be greater than 0'),
  city: z.string().min(2, 'City is required'),
  location: z.string().min(2, 'Location is required'),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  bedrooms: z.number().int().min(0, 'Bedrooms must be non-negative'),
  bathrooms: z.number().int().min(0, 'Bathrooms must be non-negative').optional().default(1),
  areaSqFt: z.number().positive('Area in SqFt must be greater than 0'),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

const inquirySchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email address format'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  message: z.string().min(5, 'Message must be at least 5 characters long'),
});

const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors
      });
    }
    return res.status(400).json({ success: false, message: 'Invalid input payload' });
  }
};

module.exports = {
  validateRegister: validateBody(registerSchema),
  validateLogin: validateBody(loginSchema),
  validateProperty: validateBody(propertySchema),
  validateInquiry: validateBody(inquirySchema),
};
