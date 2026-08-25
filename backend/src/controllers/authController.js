const bcrypt = require('bcryptjs');
const StoreService = require('../services/storeService');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwtUtils');

const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await StoreService.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await StoreService.createUser({
      name,
      email,
      passwordHash,
      phone,
      role: role || 'USER'
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await StoreService.saveRefreshToken(user.id, refreshToken, expiresAt);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await StoreService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await StoreService.saveRefreshToken(user.id, refreshToken, expiresAt);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token is required.' });
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }

    const storedToken = await StoreService.findRefreshToken(token);
    if (!storedToken || storedToken.revoked) {
      return res.status(401).json({ success: false, message: 'Refresh token has been revoked or invalid.' });
    }

    const user = await StoreService.findUserById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    console.error('Refresh Token Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during token refresh.' });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await StoreService.revokeRefreshToken(token);
    }
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during logout.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await StoreService.findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error fetching user details.' });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
};
