const dotenv = require('dotenv');
const NewsApi = require('newsapi');

dotenv.config();

const newsapi = new NewsApi(process.env.NEWS_API_KEY);

module.exports = newsapi;
