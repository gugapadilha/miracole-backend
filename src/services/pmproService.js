const axios = require('axios');
const config = require('../config');

class PMProService {
  constructor() {
    this.baseUrl = config.wordpress.baseUrl;
    this.apiKey = config.wordpress.apiKey;
  }

  /**
   * Get PMPro member information
   * @param {string} userId - WordPress user ID
   * @returns {Object|null} Member data or null
   */
  async getMemberInfo(userId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/wp-json/pmpro/v1/members/${userId}`,
        {
          headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
        }
      );
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
