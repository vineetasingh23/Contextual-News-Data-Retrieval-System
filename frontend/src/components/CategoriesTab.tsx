import React, { useState, useEffect } from 'react';
import { Grid3X3, Loader2, MapPin, Filter } from 'lucide-react';
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
    } catch (err) {
      setError('Failed to fetch category news. Please try again.');
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">News Categories</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Browse news by topic and category
        </p>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-700">Location Filters</span>
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
      </div>

      {/* Category Grid */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`p-6 rounded-lg border-2 transition-all duration-200 text-center hover:shadow-md ${
                selectedCategory === category.id
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <div className="font-medium">{category.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-4xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {response && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {categories.find(c => c.id === response.category)?.label || response.category} News
            </h2>
            <p className="text-gray-600">
              Found {response.total_results} articles
            </p>
            {useLocationFilter && location && (
              <p className="text-sm text-gray-500 mt-1">
                Filtered by location (radius: {radius} km)
              </p>
            )}
          </div>

          {response.total_results > 0 ? (
            <div className="space-y-6">
              {response.articles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📂</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No articles in this category</h3>
              <p className="text-gray-600 mb-4">
                No articles found for the "{response.category}" category.
              </p>
              <p className="text-sm text-gray-500">
                Try a different category or check back later for new content.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading {selectedCategory} news...</p>
        </div>
      )}

      {/* No Category Selected */}
      {!selectedCategory && !loading && (
        <div className="text-center py-12">
          <Grid3X3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Select a category to browse news</p>
        </div>
      )}
    </div>
  );
};

export default CategoriesTab;
