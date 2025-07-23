import api from '../config/gnews.config';
import type { GNewsArticle, GNewsResponse } from '../types/gnews';

interface SearchParams {
  q: string;
  lang?: string;
  from?: string;
  to?: string;
  max?: number;
  in?: string; // title, description, content
  nullable?: string; // image, description
  sortby?: string; // publishedAt, relevance
}

interface HeadlineParams {
  q?: string;
  lang?: string;
  country?: string;
  category?: string;
  max?: number;
  nullable?: string;
  in?: string;
  sortby?: string;
}

export async function searchArticles(
  params: SearchParams
): Promise<GNewsResponse<GNewsArticle>> {
  if (!params.q) {
    throw new Error('Parameter "q" (query) is required.');
  }

  try {
    const searchParams = {
      ...params,
      max: params.max || 10,
      lang: params.lang || 'en',
      sortby: params.sortby || 'publishedAt',
      nullable: params.nullable || 'description,image' // Allow articles without images/descriptions
    };

    const res = await api.get<GNewsResponse<GNewsArticle>>('/search', {
      params: searchParams,
      timeout: 10000 // 10 second timeout
    });

    return res.data;
  } catch (error: any) {
    console.error('GNews Search Error:', error.message);
    throw new Error(`GNews search failed: ${error.message}`);
  }
}

export async function topHeadlines(
  params: HeadlineParams = {}
): Promise<GNewsResponse<GNewsArticle>> {
  try {
    const headlineParams = {
      ...params,
      max: params.max || 10,
      lang: params.lang || 'en',
      sortby: params.sortby || 'publishedAt',
      nullable: params.nullable || 'description,image'
    };

    const res = await api.get<GNewsResponse<GNewsArticle>>(
      '/top-headlines',
      {
        params: headlineParams,
        timeout: 10000 // 10 second timeout
      }
    );

    return res.data;
  } catch (error: any) {
    console.error('GNews Headlines Error:', error.message);
    throw new Error(`GNews headlines failed: ${error.message}`);
  }
}

export async function getSources(
  lang?: string
): Promise<GNewsResponse<unknown>> {
  try {
    const res = await api.get<GNewsResponse<unknown>>('/sources', {
      params: { lang: lang || 'en' },
      timeout: 10000
    });

    return res.data;
  } catch (error: any) {
    console.error('GNews Sources Error:', error.message);
    throw new Error(`GNews sources failed: ${error.message}`);
  }
}

// New comprehensive function to get various types of news
export async function getComprehensiveNews(
  params: { lang?: string; max?: number; country?: string } = {}
): Promise<{
  headlines: GNewsArticle[];
  general: GNewsArticle[];
  technology: GNewsArticle[];
  business: GNewsArticle[];
  totalCount: number;
}> {
  try {
    const { lang = 'en', max = 20, country } = params;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [headlines, general, technology, business] = await Promise.all([
      topHeadlines({
        lang,
        country,
        max,
        sortby: 'publishedAt'
      }).catch(() => ({ articles: [] })),
      
      searchArticles({
        q: 'latest news',
        lang,
        from: yesterday,
        to: today,
        max,
        sortby: 'publishedAt'
      }).catch(() => ({ articles: [] })),
      
      topHeadlines({
        category: 'technology',
        lang,
        max: Math.floor(max / 2),
        sortby: 'publishedAt'
      }).catch(() => ({ articles: [] })),
      
      topHeadlines({
        category: 'business',
        lang,
        max: Math.floor(max / 2),
        sortby: 'publishedAt'
      }).catch(() => ({ articles: [] }))
    ]);

    return {
      headlines: headlines.articles || [],
      general: general.articles || [],
      technology: technology.articles || [],
      business: business.articles || [],
      totalCount: (headlines.articles?.length || 0) + 
                 (general.articles?.length || 0) + 
                 (technology.articles?.length || 0) + 
                 (business.articles?.length || 0)
    };
  } catch (error: any) {
    console.error('GNews Comprehensive Error:', error.message);
    throw new Error(`GNews comprehensive fetch failed: ${error.message}`);
  }
}