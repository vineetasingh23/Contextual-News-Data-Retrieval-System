import React, { useState, useEffect } from 'react';
import { Grid3X3, Loader2, MapPin, Filter, AlertCircle } from 'lucide-react';
import { newsAPI } from '../services/api';
import { CategoryResponse } from '../types';
import { useLocation } from '../hooks/useLocation';
import NewsCard from './NewsCard';

const CategoriesTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [response, setResponse] = useState<CategoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useLocationFilter, setUseLocationFilter] = useState(false);
  const [radius, setRadius] = useState(100);
  const { location } = useLocation();

  const categories = [
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { id: 'politics', label: 'Politics', icon: '🏛️' },
    { id: 'science', label: 'Science', icon: '🔬' },
    { id: 'health', label: 'Health', icon: '🏥' },
    { id: 'world', label: 'World', icon: '🌍' },
    { id: 'national', label: 'National', icon: '🇮🇳' },
    { id: 'startup', label: 'Startup', icon: '🚀' },
    { id: 'finance', label: 'Finance', icon: '💰' },
    { id: 'miscellaneous', label: 'Miscellaneous', icon: '📰' }
  ];

  const fetchCategoryNews = async (category: string) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await newsAPI.getNewsByCategory(
        category,
        useLocationFilter && location ? location.latitude : undefined,
        useLocationFilter && location ? location.longitude : undefined,
        radius,
        15
      );
      setResponse(result);
    } catch (err: any) {
      // Check if it's a 404 error (no articles found)
      if (err?.response?.status === 404 || err?.status === 404) {
        setError(`No articles found in the "${category}" category. Try a different category or check back later.`);
      } else {
        setError(`Unable to load ${category} news at the moment. Please try again later.`);
      }
      console.error('Category news error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    fetchCategoryNews(category);
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryNews(selectedCategory);
    }
  }, [useLocationFilter, radius]);

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="text-center space-y-6 py-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-3xl"></div>
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full w-20 h-20 mx-auto mb-6">
            <Grid3X3 className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            News Categories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Browse news by topic and category to discover content that interests you
          </p>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            <span className="font-semibold text-gray-800 text-lg">Location Filters</span>
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
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
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
      </div>

      {/* Enhanced Category Grid */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Browse by topic</p>
          <h3 className="text-lg font-semibold text-gray-800">Select a category to explore news</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`group p-6 rounded-xl border-2 transition-all duration-200 text-center hover:shadow-lg transform hover:scale-105 ${
                selectedCategory === category.id
                  ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-lg'
                  : 'border-gray-200 bg-white/60 backdrop-blur-sm text-gray-700 hover:border-blue-300 hover:bg-white'
              }`}
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{category.icon}</div>
              <div className="font-semibold">{category.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Error */}
      {error && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-amber-800 mb-2">No Articles Found</h3>
            <p className="text-amber-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-4 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Try Another Category
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
                {categories.find(c => c.id === response.category)?.label || response.category} News
              </h2>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{response.total_results} articles found</span>
                </div>
                {useLocationFilter && location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Filtered by location (radius: {radius} km)</span>
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
                <span className="text-gray-400 text-4xl">📂</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No articles in this category</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                No articles found for the "{response.category}" category. Try a different category or check back later for new content.
              </p>
              <button
                onClick={() => setSelectedCategory('')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Browse Other Categories
              </button>
            </div>
          )}
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading {selectedCategory} news...</h3>
          <p className="text-gray-600">Finding the latest articles in this category</p>
        </div>
      )}

      {/* Enhanced No Category Selected */}
      {!selectedCategory && !loading && !error && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Grid3X3 className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Select a Category</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Choose a category above to browse news articles by topic. Each category contains curated content relevant to that subject area.
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoriesTab;
