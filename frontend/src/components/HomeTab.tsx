import React, { useState } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { newsAPI } from '../services/api';
import { NewsResponse, NewsQuery } from '../types';
import { useLocation } from '../hooks/useLocation';
import NewsCard from './NewsCard';

const HomeTab: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<NewsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { location } = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const queryData: NewsQuery = {
        query: query.trim(),
        limit: 10,
      };

      if (location) {
        queryData.latitude = location.latitude;
        queryData.longitude = location.longitude;
        queryData.radius = 100;
      }

      const result = await newsAPI.queryNews(queryData);
      setResponse(result);
    } catch (err) {
      setError('Failed to fetch news. Please try again.');
      console.error('Query error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exampleQueries = [
    "Show me the latest technology news",
    "What's happening in politics today?",
    "Business updates from my area",
    "Sports highlights this week",
    "Entertainment news near me"
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 text-primary-600">
          <Sparkles className="h-8 w-8" />
          <h1 className="text-3xl font-bold">AI-Powered News Discovery</h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Ask for news in natural language. Our AI understands context and location to find the most relevant articles for you.
        </p>
      </div>

      {/* Query Form */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask for news in natural language..."
              className="input-field pr-12 text-lg"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Example Queries */}
      <div className="max-w-2xl mx-auto">
        <p className="text-sm text-gray-500 mb-3">Try these examples:</p>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => setQuery(example)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {response && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Results for "{response.search_query || query}"
            </h2>
            <p className="text-gray-600">
              Found {response.total_results} articles
            </p>
          </div>

          {response.total_results > 0 ? (
            <div className="space-y-6">
              {response.articles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📰</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any news articles matching your query.
              </p>
              <p className="text-sm text-gray-500">
                Try different keywords or check back later for new content.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Analyzing your query and finding relevant news...</p>
        </div>
      )}
    </div>
  );
};

export default HomeTab;
