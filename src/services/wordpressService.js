const axios = require('axios');
const config = require('../config');

class WordPressService {
  constructor() {
    this.baseUrl = config.wordpress.baseUrl;
    this.apiKey = config.wordpress.apiKey;
  }

  /**
   * Get WordPress user by ID
   * @param {string} userId - WordPress user ID
   * @returns {Object|null} User data or null
   */
  async getUser(userId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/wp-json/wp/v2/users/${userId}`,
        {
          headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
        }
      );
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
      // Prefer JSON; some JWT plugins accept it. If it fails, we'll fall back.
      const response = await axios.post(
        `${this.baseUrl}/wp-json/jwt-auth/v1/token`,
        { username, password },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return response.data;
    } catch (error) {
      try {
        // Fallback to x-www-form-urlencoded for plugins that require it
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);
        const response2 = await axios.post(
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
   * Get user posts
   * @param {string} userId - WordPress user ID
   * @param {Object} options - Query options
   * @returns {Array|null} Posts array or null
   */
  async getUserPosts(userId, options = {}) {
    try {
      const params = {
        author: userId,
        per_page: options.perPage || 10,
        page: options.page || 1,
        ...options
      };

      const response = await axios.get(
        `${this.baseUrl}/wp-json/wp/v2/posts`,
        {
          headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {},
          params
        }
      );
      return response.data;
    } catch (error) {
      console.error('WordPress posts error:', error.message);
      return null;
    }
  }

  /**
   * Get user profile data
   * @param {string} userId - WordPress user ID
   * @returns {Object|null} Profile data or null
   */
  async getUserProfile(userId) {
    try {
      const user = await this.getUser(userId);
      if (!user) return null;

      return {
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
    } catch (error) {
      console.error('WordPress profile error:', error.message);
      return null;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - WordPress user ID
   * @param {Object} profileData - Profile data to update
   * @returns {Object|null} Updated user data or null
   */
  async updateUserProfile(userId, profileData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/wp-json/wp/v2/users/${userId}`,
        profileData,
        {
          headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
        }
      );
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
      const response = await axios.post(
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
      const response = await axios.get(
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
