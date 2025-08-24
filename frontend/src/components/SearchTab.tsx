import React, { useState, useEffect } from 'react';
import { Search, Loader2, Filter, MapPin, Zap, Globe, TrendingUp, Star } from 'lucide-react';
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
  const [cityName, setCityName] = useState<string>('');
  const { location } = useLocation();

  // Function to convert coordinates to city name
  const getCityFromCoordinates = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.address) {
        // Try to get city name from various address fields
        const city = data.address.city || 
                    data.address.town || 
                    data.address.village || 
                    data.address.county ||
                    data.address.state ||
                    'Unknown Location';
        return city;
      }
      return 'Unknown Location';
    } catch (error) {
      console.error('Error getting city name:', error);
      return 'Unknown Location';
    }
  };

  useEffect(() => {
    if (useLocationFilter && location) {
      getCityFromCoordinates(location.latitude, location.longitude)
        .then(setCityName);
    }
  }, [useLocationFilter, location]);

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
    } catch (err: any) {
      // Check if it's a 404 error (no articles found)
      if (err?.response?.status === 404 || err?.status === 404) {
        setError(`No articles found for "${searchQuery.trim()}". Try different keywords or adjust your filters.`);
      } else {
        setError('Unable to search for news at the moment. Please try again later.');
      }
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
    { text: 'technology', icon: Zap, color: 'from-blue-500 to-blue-600' },
    { text: 'politics', icon: Globe, color: 'from-red-500 to-red-600' },
    { text: 'business', icon: TrendingUp, color: 'from-green-500 to-green-600' },
    { text: 'sports', icon: Star, color: 'from-orange-500 to-orange-600' },
    { text: 'entertainment', icon: Zap, color: 'from-purple-500 to-purple-600' },
    { text: 'climate change', icon: Globe, color: 'from-emerald-500 to-emerald-600' },
    { text: 'artificial intelligence', icon: Zap, color: 'from-indigo-500 to-indigo-600' },
    { text: 'cricket', icon: Star, color: 'from-yellow-500 to-yellow-600' }
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="text-center space-y-6 py-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-3xl"></div>
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full w-20 h-20 mx-auto mb-6">
            <Search className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Search News
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Find specific news articles using keywords and intelligent filters
          </p>
        </div>
      </div>

      {/* Enhanced Search Form */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="flex">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for news articles..."
                    className="w-full pl-12 pr-4 py-6 text-lg bg-transparent border-none outline-none placeholder-gray-400"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !searchQuery.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    'Search'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-semibold text-gray-800 text-lg">Search Filters</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={useLocationFilter}
                      onChange={(e) => setUseLocationFilter(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 ${
                      useLocationFilter 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-transparent' 
                        : 'border-gray-300 group-hover:border-blue-400'
                    }`}>
                      {useLocationFilter && (
                        <svg className="w-4 h-4 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-700 font-medium">Use location filter</span>
                </label>

                {useLocationFilter && location && (
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-full border border-green-200/50">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      {cityName || 'Getting city...'}
                    </span>
                  </div>
                )}
              </div>

              {useLocationFilter && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Search Radius: <span className="text-blue-600 font-bold">{radius} km</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="10"
                      max="500"
                      step="10"
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>10km</span>
                      <span>250km</span>
                      <span>500km</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Enhanced Example Searches */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Popular searches</p>
          <h3 className="text-lg font-semibold text-gray-800">Quick start with trending topics</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {examples.map((example, index) => {
            const Icon = example.icon;
            return (
              <button
                key={index}
                onClick={() => handleExampleClick(example.text)}
                className="group p-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl hover:bg-white hover:border-blue-200 transition-all duration-200 transform hover:scale-105 hover:shadow-lg text-center"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${example.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{example.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Enhanced Error */}
      {error && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-amber-600 text-xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-amber-800 mb-2">No Articles Found</h3>
            <p className="text-amber-700 mb-4">{error}</p>
            <button
              onClick={() => setError(null)}
              className="bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 transition-colors"
            >
              Try a New Search
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Results */}
      {response && (
        <div className="space-y-8">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200/30">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Search Results
              </h2>
              <p className="text-gray-600 text-lg mb-2">
                Found {response.total_results} articles for "{response.search_query}"
              </p>
              {useLocationFilter && location && (
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>Filtered by location: {cityName || 'Unknown city'} (radius: {radius} km)</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {response.total_results > 0 ? (
              response.articles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-gray-400 text-4xl">🔍</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">No search results</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  No articles found matching your search criteria. Try different keywords or adjust your filters.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Try a new search
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Loading State */}
      {loading && (
        <div className="text-center py-16">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-full w-24 h-24 mx-auto mb-6">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Searching for news...</h3>
          <p className="text-gray-600">Finding the most relevant articles for your query</p>
        </div>
      )}
    </div>
  );
};

export default SearchTab;
