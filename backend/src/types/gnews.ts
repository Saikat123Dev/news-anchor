export interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

export interface GNewsResponse<T> {
  totalArticles?: number;
  articles: T[];
  // for sources
  sources?: { name: string; url: string }[];
}
