import React, { useState, useEffect } from 'react';
import { Send, Loader2, Sparkles, Zap, Globe, MapPin, Clock } from 'lucide-react';
import { newsAPI } from '../services/api';
import { NewsResponse, NewsQuery } from '../types';
import { useLocation } from '../hooks/useLocation';
import NewsCard from './NewsCard';

const HomeTab: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<NewsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    if (location) {
      getCityFromCoordinates(location.latitude, location.longitude)
        .then(setCityName);
    }
  }, [location]);

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
    } catch (err: any) {
      // Check if it's a 404 error (no articles found)
      if (err?.response?.status === 404 || err?.status === 404) {
        setError(`No articles found for "${query.trim()}". Try different keywords or check back later for new content.`);
      } else {
        setError('Unable to process your query at the moment. Please try again later.');
      }
      console.error('Query error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exampleQueries = [
    { text: "Show me the latest technology news", icon: Zap },
    { text: "What's happening in politics today?", icon: Globe },
    { text: "Business updates from my area", icon: MapPin },
    { text: "Sports highlights this week", icon: Clock },
    { text: "Entertainment news near me", icon: Sparkles }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-3xl"></div>
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full w-20 h-20 mx-auto mb-6">
            <Sparkles className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            AI-Powered News Discovery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ask for news in natural language. Our AI understands context and location to find the most relevant articles for you.
          </p>
          
          {/* Location Display */}
          {location && cityName && (
            <div className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border border-blue-200/30 inline-flex">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Getting news for: {cityName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Query Form */}
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask for news in natural language..."
                className="w-full px-6 py-6 text-lg bg-transparent border-none outline-none placeholder-gray-400"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-3 top-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Example Queries */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Try these examples</p>
          <h3 className="text-lg font-semibold text-gray-800">Popular queries to get started</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exampleQueries.map((example, index) => {
            const Icon = example.icon;
            return (
              <button
                key={index}
                onClick={() => setQuery(example.text)}
                className="group p-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl hover:bg-white hover:border-blue-200 transition-all duration-200 transform hover:scale-105 hover:shadow-lg text-left"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Example {index + 1}</span>
                </div>
                <p className="text-sm text-gray-700 group-hover:text-gray-900">{example.text}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Enhanced Error */}
      {error && (
        <div className="max-w-2xl mx-auto">
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
              Try a New Query
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {response && (
        <div className="space-y-8">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200/30">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Results for "{response.search_query || query}"
              </h2>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{response.total_results} articles found</span>
                </div>
                {location && cityName && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Near {cityName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {response.total_results > 0 ? (
            <div className="space-y-6">
              {response.articles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-gray-400 text-4xl">📰</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No articles found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                We couldn't find any news articles matching your query. Try different keywords or check back later for new content.
              </p>
              <button
                onClick={() => setQuery('')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Try a new query
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-full w-24 h-24 mx-auto mb-6">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing your query...</h3>
          <p className="text-gray-600">Our AI is finding the most relevant news articles for you</p>
        </div>
      )}
    </div>
  );
};

export default HomeTab;
