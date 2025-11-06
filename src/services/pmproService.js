const axios = require('axios');
const config = require('../config');

// Simple in-memory cache with size limit to prevent memory leaks
const cache = new Map();
const CACHE_TTL = 300000; // 5 minutes
const MAX_CACHE_SIZE = 1000; // Maximum cache entries

// Cleanup old cache entries periodically
function cleanupCache() {
  const now = Date.now();
  let deleted = 0;
  
  for (const [key, item] of cache.entries()) {
    if ((now - item.timestamp) >= CACHE_TTL) {
      cache.delete(key);
      deleted++;
    }
  }
  
  // If still too large, remove oldest entries
  if (cache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toDelete = cache.size - MAX_CACHE_SIZE;
    for (let i = 0; i < toDelete; i++) {
      cache.delete(entries[i][0]);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupCache, 300000);

class PMProService {
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
   * Get PMPro member information (with caching)
   * @param {string} userId - WordPress user ID
   * @returns {Object|null} Member data or null
   */
  async getMemberInfo(userId) {
    const cacheKey = `pmpro_member_${userId}`;
    const cached = this._getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const axiosInstance = this._createAxiosInstance();
      const response = await axiosInstance.get(
        `${this.baseUrl}/wp-json/pmpro/v1/members/${userId}`
      );
      
      if (response.data) {
        this._setCache(cacheKey, response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('PMPro API Error:', error.message);
      return null;
    }
  }

  /**
   * Check if user has active membership
   * @param {string} userId - WordPress user ID
   * @returns {boolean} True if user has active membership
   */
  async hasActiveMembership(userId) {
    try {
      const memberInfo = await this.getMemberInfo(userId);
      return memberInfo && memberInfo.status === 'active';
    } catch (error) {
      console.error('PMPro membership check error:', error.message);
      return false;
    }
  }

  /**
   * Get user's membership level
   * @param {string} userId - WordPress user ID
   * @returns {Object|null} Membership level data or null
   */
  async getMembershipLevel(userId) {
    try {
      const memberInfo = await this.getMemberInfo(userId);
      return memberInfo ? memberInfo.membership_level : null;
    } catch (error) {
      console.error('PMPro level check error:', error.message);
      return null;
    }
  }

  /**
   * Validate user access to content
   * @param {string} userId - WordPress user ID
   * @param {string} contentLevel - Required membership level
   * @returns {boolean} True if user has access
   */
  async validateAccess(userId, contentLevel) {
    try {
      const membershipLevel = await this.getMembershipLevel(userId);
      if (!membershipLevel) return false;

      // Check if user's level meets or exceeds required level
      return membershipLevel.level >= contentLevel;
    } catch (error) {
      console.error('PMPro access validation error:', error.message);
      return false;
    }
  }

  /**
   * Get membership expiration date
   * @param {string} userId - WordPress user ID
   * @returns {Date|null} Expiration date or null
   */
  async getMembershipExpiration(userId) {
    try {
      const memberInfo = await this.getMemberInfo(userId);
      return memberInfo && memberInfo.enddate 
        ? new Date(memberInfo.enddate) 
        : null;
    } catch (error) {
      console.error('PMPro expiration check error:', error.message);
      return null;
    }
  }
}

module.exports = new PMProService();
