import { NextResponse } from 'next/server';
import { GNEWS_API_BASE_URL, NEWS_SEARCH_PARAMS } from '@/utils/news-config';

export async function GET(request: Request) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GNEWS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Build query parameters
    const params = new URLSearchParams({
      q: NEWS_SEARCH_PARAMS.q,
      country: NEWS_SEARCH_PARAMS.country,
      lang: NEWS_SEARCH_PARAMS.lang,
      max: NEWS_SEARCH_PARAMS.max.toString(),
      sortby: NEWS_SEARCH_PARAMS.sortby,
      token: apiKey,
    });

    // Fetch from GNews API using search endpoint
    const response = await fetch(
      `${GNEWS_API_BASE_URL}/search?${params.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes (matches NEWS_FETCH_INTERVAL)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to fetch news', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('News API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
