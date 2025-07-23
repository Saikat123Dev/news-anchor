import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GNEWS_BASE = 'https://gnews.io/api/v4';

const api = axios.create({
  baseURL: GNEWS_BASE,
  params: {
    token: process.env.GNEWS_API_KEY
  },
  timeout: 5000
});

export default api;
