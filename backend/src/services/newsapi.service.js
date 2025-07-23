const newsapi = require('../config/newsApi.config.js');

const getTopHeadlines = async (params = {}) => {
  try {
    const response = await newsapi.v2.topHeadlines({
      sources: params.sources || undefined, // Don't set default sources to get from all
      q: params.q || undefined,
      language: params.language || 'en',
      country: params.country || 'us', // Add country for better results
      category: params.category || undefined,
      pageSize: params.pageSize || 20,
      page: params.page || 1
    });

    return response;
  } catch (error) {
    console.error('NewsAPI Top Headlines Error:', error.message);
    throw error;
  }
};

const getEverything = async (params = {}) => {
  try {
    // Ensure we have either q, sources, or domains
    if (!params.q && !params.sources && !params.domains) {
      params.q = 'news'; // Default search term
    }

    const response = await newsapi.v2.everything({
      q: params.q || undefined,
      sources: params.sources || undefined,
      domains: params.domains || undefined,
      excludeDomains: params.excludeDomains || undefined,
      from: params.from || undefined,
      to: params.to || undefined,
      language: params.language || 'en',
      sortBy: params.sortBy || 'publishedAt',
      pageSize: params.pageSize || 20,
      page: params.page || 1
    });

    return response;
  } catch (error) {
    console.error('NewsAPI Everything Error:', error.message);
    throw error;
  }
};

const getSources = async (params = {}) => {
  try {
    const response = await newsapi.v2.sources({
      category: params.category || undefined,
      language: params.language || 'en',
      country: params.country || 'us'
    });

    return response;
  } catch (error) {
    console.error('NewsAPI Sources Error:', error.message);
    throw error;
  }
};

// New function to get comprehensive news
const getComprehensiveNews = async (params = {}) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get both headlines and everything in parallel
    const [headlines, everything] = await Promise.all([
      getTopHeadlines({
        language: params.language || 'en',
        country: params.country || 'us',
        pageSize: 30
      }),
      getEverything({
        q: params.q || 'latest news',
        from: params.from || yesterday,
        to: params.to || today,
        language: params.language || 'en',
        sortBy: 'publishedAt',
        pageSize: 50
      })
    ]);

    return {
      headlines: headlines.articles || [],
      everything: everything.articles || [],
      totalResults: (headlines.totalResults || 0) + (everything.totalResults || 0)
    };
  } catch (error) {
    console.error('NewsAPI Comprehensive Error:', error.message);
    throw error;
  }
};

module.exports = {
  getTopHeadlines,
  getEverything,
  getSources,
  getComprehensiveNews
};