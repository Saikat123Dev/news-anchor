import { NextFunction, Request, Response, Router } from 'express';
import { searchArticles as getGNewsSearch, topHeadlines as getGNewsTop } from '../services/gnews.service';
// @ts-ignore
import { getTopHeadlines as getNewsApiHeadlines, getEverything as getNewsApiTop } from '../services/newsapi.service';

export const newsRouter = Router();

/**
 * GET /api/news/latest-news
 * - Fetches top headlines from both NewsAPI and GNews
 * - Sorts by most recent publishedAt
 * - Returns structured JSON: { source: string, title, description, url, publishedAt, image? }[]
 */
newsRouter.get(
  '/latest-news',
  async (_req: Request, res: Response, next: NextFunction) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      // Fetch in parallel with better parameters
      const [newsApiEverything, newsApiHeadlines, gnewsTop, gnewsSearch] = await Promise.all([
        // NewsAPI Everything - for comprehensive news
        getNewsApiTop({
          q: 'NOT "removed" NOT "deleted"', // Exclude removed articles
          from: yesterday,
          to: today,
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: 50, // Increased for more articles
          page: 1
        }).catch(err => {
          console.warn('NewsAPI Everything failed:', err.message);
          return { articles: [] };
        }),

        // NewsAPI Top Headlines - for breaking news
        getNewsApiHeadlines({
          language: 'en',
          pageSize: 30,
          page: 1
        }).catch(err => {
          console.warn('NewsAPI Headlines failed:', err.message);
          return { articles: [] };
        }),

        // GNews Top Headlines
        getGNewsTop({
          lang: 'en',
          max: 30,
          country: undefined,
          category: undefined,
          q: undefined
        }).catch(err => {
          console.warn('GNews Top Headlines failed:', err.message);
          return { articles: [] };
        }),

        // GNews Search for latest news
        getGNewsSearch({
          q: 'latest news',
          lang: 'en',
          from: yesterday,
          to: today,
          max: 30
        }).catch(err => {
          console.warn('GNews Search failed:', err.message);
          return { articles: [] };
        })
      ]);

      
      const newsApiArticles = [
        ...(newsApiEverything.articles || []),
        ...(newsApiHeadlines.articles || [])
      ]
        .filter((a: any) => 
          a && 
          a.title && 
          a.title !== '[Removed]' &&
          a.description &&
          a.description !== '[Removed]' &&
          a.url &&
          a.publishedAt &&
          !a.title.toLowerCase().includes('removed') &&
          !a.description.toLowerCase().includes('removed')
        )
        .map((a: any) => ({
          source: a.source?.name || 'Unknown Source',
          title: a.title,
          description: a.description,
          url: a.url,
          publishedAt: a.publishedAt,
          image: a.urlToImage,
          provider: 'NewsAPI'
        }));

      
      const gnewsArticles = [
        ...(gnewsTop.articles || []),
        ...(gnewsSearch.articles || [])
      ]
        .filter((a: any) => 
          a && 
          a.title && 
          a.description && 
          a.url && 
          a.publishedAt
        )
        .map((a: any) => ({
          source: a.source?.name || 'Unknown Source',
          title: a.title,
          description: a.description,
          url: a.url,
          publishedAt: a.publishedAt,
          image: a.image,
          provider: 'GNews'
        }));

     
      const allArticles = [...newsApiArticles, ...gnewsArticles];
      const uniqueArticles = allArticles.filter((article, index, self) => {
        return index === self.findIndex(a => 
          a.url === article.url || 
          (a.title.toLowerCase().trim() === article.title.toLowerCase().trim() && 
           a.source === article.source)
        );
      });

      
      const sortedArticles = uniqueArticles.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      );

      
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentArticles = sortedArticles.filter(article => 
        new Date(article.publishedAt) >= sevenDaysAgo
      );

      res.json({
        count: recentArticles.length,
        articles: recentArticles.slice(0, 100), // Limit to 100 most recent
        sources: {
          newsApi: newsApiArticles.length,
          gnews: gnewsArticles.length,
          duplicatesRemoved: allArticles.length - uniqueArticles.length
        },
        lastUpdated: new Date().toISOString()
      });

    } catch (err: any) {
      console.error('News router error:', err);
      next(err);
    }
  }
);