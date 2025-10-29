const axios = require('axios');
const config = require('../config');

class BunnyService {
  constructor() {
    this.readKey = config.bunny.readKey;
    this.libraryName = config.bunny.libraryName;
    this.zoneName = config.bunny.zoneName;
    this.baseUrl = `https://video.bunnycdn.com/library/${this.libraryName}`;
  }

  /**
   * Get video information by ID
   * @param {string} videoId - Bunny CDN video ID
   * @returns {Object|null} Video data or null
   */
  async getVideo(videoId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/videos/${videoId}`,
        {
          headers: {
            'AccessKey': this.readKey
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Bunny CDN API Error:', error.message);
      return null;
    }
  }

  /**
   * Get video streaming URL
   * @param {string} videoId - Bunny CDN video ID
   * @returns {string|null} Streaming URL or null
   */
  async getVideoStreamUrl(videoId) {
    try {
      const video = await this.getVideo(videoId);
      if (!video) return null;

      // Return the streaming URL based on zone configuration
      return `https://${this.zoneName}.b-cdn.net/${videoId}/play_720p.mp4`;
    } catch (error) {
      console.error('Bunny stream URL error:', error.message);
      return null;
    }
  }

  /**
   * Get video thumbnail URL
   * @param {string} videoId - Bunny CDN video ID
   * @returns {string|null} Thumbnail URL or null
   */
  async getVideoThumbnail(videoId) {
    try {
      const video = await this.getVideo(videoId);
      if (!video) return null;

      return `https://${this.zoneName}.b-cdn.net/${videoId}/thumbnail.jpg`;
    } catch (error) {
      console.error('Bunny thumbnail error:', error.message);
      return null;
    }
  }

  /**
   * List videos in library
   * @param {Object} options - Query options (page, perPage, etc.)
   * @returns {Object|null} Videos list or null
   */
  async listVideos(options = {}) {
    try {
      const params = {
        page: options.page || 1,
        itemsPerPage: options.perPage || 20,
        ...options
      };

      const response = await axios.get(
        `${this.baseUrl}/videos`,
        {
          headers: {
            'AccessKey': this.readKey
          },
          params
        }
      );
      return response.data;
    } catch (error) {
      console.error('Bunny list videos error:', error.message);
      return null;
    }
  }

  /**
   * Search videos by title or tags
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Object|null} Search results or null
   */
  async searchVideos(query, options = {}) {
    try {
      const params = {
        search: query,
        page: options.page || 1,
        itemsPerPage: options.perPage || 20,
        ...options
      };

      const response = await axios.get(
        `${this.baseUrl}/videos`,
        {
          headers: {
            'AccessKey': this.readKey
          },
          params
        }
      );
      return response.data;
    } catch (error) {
      console.error('Bunny search videos error:', error.message);
      return null;
    }
  }

  /**
   * Get video analytics data
   * @param {string} videoId - Bunny CDN video ID
   * @param {string} dateFrom - Start date (YYYY-MM-DD)
   * @param {string} dateTo - End date (YYYY-MM-DD)
   * @returns {Object|null} Analytics data or null
   */
  async getVideoAnalytics(videoId, dateFrom, dateTo) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/videos/${videoId}/statistics`,
        {
          headers: {
            'AccessKey': this.readKey
          },
          params: {
            dateFrom,
            dateTo
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Bunny analytics error:', error.message);
      return null;
    }
  }
}

module.exports = new BunnyService();
