import React, { useState } from 'react';
import { Search, Loader2, Filter, MapPin } from 'lucide-react';
import { newsAPI } from '../services/api';
import { SearchResponse } from '../types';
import { useLocation } from '../hooks/useLocation';
import NewsCard from './NewsCard';

const SearchTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useLocationFilter, setUseLocationFilter] = useState(false);
  const [radius, setRadius] = useState(100);
  const { location } = useLocation();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await newsAPI.searchNews(
        searchQuery.trim(),
        useLocationFilter && location ? location.latitude : undefined,
        useLocationFilter && location ? location.longitude : undefined,
        radius,
        15
      );
      setResponse(result);
    } catch (err) {
      setError('Failed to search news. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setSearchQuery(example);
    handleSearch(new Event('submit') as any);
  };

  const examples = [
    'technology',
    'politics',
    'business',
    'sports',
    'entertainment',
    'climate change',
    'artificial intelligence',
    'cricket'
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Search News</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Find specific news articles using keywords and filters
        </p>
      </div>

      {/* Search Form */}
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for news articles..."
                className="input-field pl-10 text-lg"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="btn-primary px-8"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Search'
              )}
            </button>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700">Filters</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useLocationFilter}
                  onChange={(e) => setUseLocationFilter(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Use location filter</span>
              </label>

              {useLocationFilter && location && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </span>
                </div>
              )}
            </div>

            {useLocationFilter && (
              <div className="flex items-center space-x-4">
                <label className="text-sm text-gray-700">
                  Radius: {radius} km
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Example Searches */}
      <div className="max-w-3xl mx-auto">
        <p className="text-sm text-gray-500 mb-3">Popular searches:</p>
        <div className="flex flex-wrap gap-2">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-3xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {response && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Search Results
            </h2>
            <p className="text-gray-600">
              Found {response.total_results} articles for "{response.search_query}"
            </p>
            {useLocationFilter && location && (
              <p className="text-sm text-gray-500 mt-1">
                Filtered by location (radius: {radius} km)
              </p>
            )}
          </div>

          <div className="space-y-6">
                      {response.total_results > 0 ? (
            response.articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No search results</h3>
              <p className="text-gray-600 mb-4">
                No articles found matching your search criteria.
              </p>
              <p className="text-sm text-gray-500">
                Try different keywords or adjust your filters.
              </p>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Searching for news articles...</p>
        </div>
      )}
    </div>
  );
};

export default SearchTab;
