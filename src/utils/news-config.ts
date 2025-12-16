// News Configuration
// Configurable fetch interval for rate limiting (100 requests/day limit)
// Default: 5 minutes (300000ms) - adjust based on traffic needs
export const NEWS_FETCH_INTERVAL = 300000; // 5 minutes in milliseconds

// GNews API Configuration
export const GNEWS_API_BASE_URL = 'https://gnews.io/api/v4';

// Search parameters for Pakistan emergency news
export const NEWS_SEARCH_PARAMS = {
  q: 'Pakistan AND (flood OR earthquake OR fire OR "medical emergency" OR accident OR rescue OR "relief supplies" OR "natural disaster" OR evacuation OR casualties)',
  country: 'pk', // Pakistan
  lang: 'en',
  max: 20, // Number of articles to fetch
  sortby: 'publishedAt', // Sort by most recent
};

// TypeScript Interfaces for GNews API Response
export interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

export interface NewsApiResponse {
  totalArticles: number;
  articles: NewsArticle[];
}

export interface NewsApiError {
  errors: string[];
}
