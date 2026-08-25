const StoreService = require('../services/storeService');

const createInquiry = async (req, res) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;
    const senderUserId = req.user ? req.user.userId : null;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Check if target property exists
    const property = await StoreService.getPropertyById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    const result = await StoreService.createInquiry({
      propertyId,
      name,
      email,
      phone,
      message,
      senderUserId,
      ipAddress
    });

    if (result.duplicate) {
      return res.status(429).json({
        success: false,
        message: 'You have already submitted an inquiry for this property recently. Please wait before submitting again.'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully! The property owner will contact you shortly.',
      data: result.data
    });
  } catch (error) {
    console.error('Create Inquiry Error:', error);
    return res.status(500).json({ success: false, message: 'Server error processing inquiry.' });
  }
};

const getMyReceivedInquiries = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page, limit } = req.query;
    const result = await StoreService.getUserInquiries(userId, { page, limit });

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get Received Inquiries Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving inquiries.' });
  }
};

module.exports = {
  createInquiry,
  getMyReceivedInquiries,
};
