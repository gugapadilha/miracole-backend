const axios = require('axios');
const config = require('../config');

// Simple in-memory cache (can be replaced with Redis in production)
const cache = new Map();
const CACHE_TTL = 300000; // 5 minutes

class WordPressService {
  constructor() {
    this.baseUrl = config.wordpress.baseUrl;
    this.apiKey = config.wordpress.apiKey;
    this.timeout = 5000; // 5 seconds timeout
  }
  
  /**
   * Get cached value or set it
   */
  _getCache(key) {
    const item = cache.get(key);
    if (item && (Date.now() - item.timestamp) < CACHE_TTL) {
      return item.value;
    }
    if (item) {
      cache.delete(key);
    }
    return null;
  }
  
  /**
   * Set cache value
   */
  _setCache(key, value) {
    cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  /**
   * Create axios instance with optimized settings
   */
  _createAxiosInstance() {
    return axios.create({
      timeout: this.timeout,
      headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
    });
  }

  /**
   * Get WordPress user by ID (with caching)
   * @param {string} userId - WordPress user ID
   * @returns {Object|null} User data or null
   */
  async getUser(userId) {
    const cacheKey = `user_${userId}`;
    const cached = this._getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const axiosInstance = this._createAxiosInstance();
      const response = await axiosInstance.get(
        `${this.baseUrl}/wp-json/wp/v2/users/${userId}`
      );
      
      if (response.data) {
        this._setCache(cacheKey, response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('WordPress API Error:', error.message);
      return null;
    }
  }

  /**
   * Authenticate user credentials
   * @param {string} username - Username or email
   * @param {string} password - User password
   * @returns {Object|null} User data or null
   */
  async authenticateUser(username, password) {
    try {
      const axiosInstance = this._createAxiosInstance();
      // Prefer JSON; some JWT plugins accept it. If it fails, we'll fall back.
      const response = await axiosInstance.post(
        `${this.baseUrl}/wp-json/jwt-auth/v1/token`,
        { username, password },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return response.data;
    } catch (error) {
      try {
        const axiosInstance = this._createAxiosInstance();
        // Fallback to x-www-form-urlencoded for plugins that require it
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);
        const response2 = await axiosInstance.post(
          `${this.baseUrl}/wp-json/jwt-auth/v1/token`,
          params,
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        return response2.data;
      } catch (e2) {
        console.error('WordPress authentication error:', error.response?.data || error.message);
        return null;
      }
    }
  }

  /**
   * Get user posts (with caching)
   * @param {string} userId - WordPress user ID
   * @param {Object} options - Query options
   * @returns {Array|null} Posts array or null
   */
  async getUserPosts(userId, options = {}) {
    const cacheKey = `posts_${userId}_${JSON.stringify(options)}`;
    const cached = this._getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const params = {
        author: userId,
        per_page: options.perPage || 10,
        page: options.page || 1,
        ...options
      };

      const axiosInstance = this._createAxiosInstance();
      const response = await axiosInstance.get(
        `${this.baseUrl}/wp-json/wp/v2/posts`,
        { params }
      );
      
      if (response.data) {
        this._setCache(cacheKey, response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('WordPress posts error:', error.message);
      return null;
    }
  }

  /**
   * Get user profile data (with caching)
   * @param {string} userId - WordPress user ID
   * @returns {Object|null} Profile data or null
   */
  async getUserProfile(userId) {
    const cacheKey = `profile_${userId}`;
    const cached = this._getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const user = await this.getUser(userId);
      if (!user) return null;

      const profile = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        displayName: user.display_name,
        avatar: user.avatar_urls,
        registeredDate: user.date,
        capabilities: user.capabilities,
        roles: user.roles
      };
      
      this._setCache(cacheKey, profile);
      return profile;
    } catch (error) {
      console.error('WordPress profile error:', error.message);
      return null;
    }
  }

  /**
   * Update user profile (invalidates cache)
   * @param {string} userId - WordPress user ID
   * @param {Object} profileData - Profile data to update
   * @returns {Object|null} Updated user data or null
   */
  async updateUserProfile(userId, profileData) {
    try {
      const axiosInstance = this._createAxiosInstance();
      const response = await axiosInstance.post(
        `${this.baseUrl}/wp-json/wp/v2/users/${userId}`,
        profileData
      );
      
      // Invalidate cache for this user
      cache.delete(`user_${userId}`);
      const userProfile = await this.getUserProfile(userId);
      if (userProfile) {
        cache.delete(`profile_${userId}`);
      }
      
      return response.data;
    } catch (error) {
      console.error('WordPress profile update error:', error.message);
      return null;
    }
  }

  /**
   * Validate JWT token with WordPress
   * @param {string} token - JWT token
   * @returns {Object|null} Token validation result or null
   */
  async validateToken(token) {
    try {
      const axiosInstance = this._createAxiosInstance();
      const response = await axiosInstance.post(
        `${this.baseUrl}/wp-json/jwt-auth/v1/token/validate`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('WordPress token validation error:', error.message);
      return null;
    }
  }

  /**
   * Get user info from WordPress JWT token
   * @param {string} token - WordPress JWT token
   * @returns {Object|null} User data or null
   */
  async getUserFromToken(token) {
    try {
      const axiosInstance = this._createAxiosInstance();
      const response = await axiosInstance.get(
        `${this.baseUrl}/wp-json/wp/v2/users/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('WordPress user info error:', error.message);
      return null;
    }
  }
}

module.exports = new WordPressService();
