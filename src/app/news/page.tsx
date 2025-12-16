'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { NEWS_FETCH_INTERVAL, type NewsApiResponse } from '@/utils/news-config';
import { ExternalLink, Calendar, AlertCircle, RefreshCw } from 'lucide-react';

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch news data with React Query
  const { data, isLoading, isError, error, refetch } = useQuery<NewsApiResponse>({
    queryKey: ['news'],
    queryFn: async () => {
      const response = await fetch('/api/news');
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      return response.json();
    },
    refetchInterval: NEWS_FETCH_INTERVAL, // Auto-refetch based on config
    staleTime: NEWS_FETCH_INTERVAL - 10000, // Consider data stale 10s before refetch
  });

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <div className="h-12 w-64 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 w-96 bg-gray-200 rounded-lg mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load News</h2>
          <p className="text-gray-600 mb-6">
            {error instanceof Error ? error.message : 'An error occurred while fetching news'}
          </p>
          <button
            onClick={() => refetch()}
            className="bg-[#008C5A] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#006B47] transition-colors duration-300 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const articles = data?.articles || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Emergency News
            <span className="block text-lg md:text-xl font-normal text-gray-600 mt-2">
              Pakistan Disaster & Emergency Updates
            </span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Stay informed about emergencies and disasters in Pakistan
          </p>
        </div>

        {/* Articles Count */}
        <div className="mb-8 text-center">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-[#008C5A]">{articles.length}</span> recent articles
          </p>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No News Available</h3>
            <p className="text-gray-500">Check back later for updates</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <article
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 hover:border-[#008C5A]/20 flex flex-col"
              >
                {/* Article Image */}
                {article.image ? (
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <AlertCircle className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Article Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Source and Date */}
                  <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
                    <span className="font-semibold text-[#008C5A] truncate max-w-[60%]">
                      {article.source.name}
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Calendar className="w-3 h-3" />
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#008C5A] transition-colors">
                    {article.title}
                  </h2>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                    {article.description}
                  </p>

                  {/* Read More Link */}
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#008C5A] font-semibold text-sm hover:gap-3 transition-all duration-300 mt-auto"
                  >
                    Read Full Article
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Auto-refresh indicator */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-500">
            Updates automatically every {NEWS_FETCH_INTERVAL / 60000} minutes
          </p>
        </div>
      </div>
    </div>
  );
}
