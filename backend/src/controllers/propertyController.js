const StoreService = require('../services/storeService');

const getProperties = async (req, res) => {
  try {
    const { city, location, propertyType, minPrice, maxPrice, bedrooms, sortBy, page, limit } = req.query;

    const result = await StoreService.getProperties({
      city,
      location,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      sortBy,
      page,
      limit
    });

    return res.status(200).json({
      success: true,
      message: 'Properties retrieved successfully',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get Properties Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving properties.' });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await StoreService.getPropertyById(id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    return res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Get Property Detail Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving property detail.' });
  }
};

const getSimilarProperties = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = req.query.limit || 4;

    const recommendations = await StoreService.getSimilarProperties(id, limit);

    return res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Get Similar Properties Error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching similar properties.' });
  }
};

const createProperty = async (req, res) => {
  try {
    const userId = req.user.userId;
    const property = await StoreService.createProperty(userId, req.body);

    return res.status(201).json({
      success: true,
      message: 'Property listing created successfully.',
      data: property
    });
  } catch (error) {
    console.error('Create Property Error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating property listing.' });
  }
};

const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await StoreService.updateProperty(id, userId, req.body);

    if (result.error === 'PROPERTY_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }
    if (result.error === 'UNAUTHORIZED_OWNER') {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this property listing.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Property listing updated successfully.',
      data: result.data
    });
  } catch (error) {
    console.error('Update Property Error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating property listing.' });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await StoreService.deleteProperty(id, userId);

    if (result.error === 'PROPERTY_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }
    if (result.error === 'UNAUTHORIZED_OWNER') {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this property listing.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Property listing deleted successfully.'
    });
  } catch (error) {
    console.error('Delete Property Error:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting property listing.' });
  }
};

const getMyProperties = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page, limit } = req.query;
    const result = await StoreService.getUserProperties(userId, { page, limit });

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get My Properties Error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching user listings.' });
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  getSimilarProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties
};
