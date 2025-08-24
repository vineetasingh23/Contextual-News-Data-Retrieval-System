import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, Loader2, MapPin, AlertCircle } from 'lucide-react';
import { newsAPI } from '../services/api';
import { TrendingResponse } from '../types';
import { useLocation } from '../hooks/useLocation';
import NewsCard from './NewsCard';

const TrendingTab: React.FC = () => {
  const [response, setResponse] = useState<TrendingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forceRefresh, setForceRefresh] = useState(false);
  const { location, loading: locationLoading } = useLocation();

  const fetchTrendingNews = async (force: boolean = false) => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      const result = await newsAPI.getTrendingNews(
        location.latitude,
        location.longitude,
        15,
        force
      );
      setResponse(result);
    } catch (err) {
      setError('Failed to fetch trending news. Please try again.');
      console.error('Trending news error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location && !loading) {
      fetchTrendingNews();
    }
  }, [location]);

  const handleRefresh = () => {
    setForceRefresh(true);
    fetchTrendingNews(true);
    setTimeout(() => setForceRefresh(false), 1000);
  };

  if (locationLoading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Getting your location...</p>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Location Required
        </h2>
        <p className="text-gray-600 mb-4">
          We need your location to show trending news in your area.
        </p>
        <p className="text-sm text-gray-500">
          Please allow location access or set your location manually.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Trending News</h1>
          <p className="text-gray-600">
            Top stories trending in your area
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${forceRefresh ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Location Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-blue-800">
          <MapPin className="h-5 w-5" />
          <span className="font-medium">
            Trending near: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {response && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Trending Stories
            </h2>
            <p className="text-gray-600">
              Found {response.total_results} trending articles
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Algorithm: {response.calculation_method}
            </p>
          </div>

          <div className="space-y-6">
            {response.articles.map((article, index) => (
              <div key={article.id} className="relative">
                {/* Trending Badge */}
                <div className="absolute -top-2 -left-2 z-10">
                  <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    #{index + 1}
                  </div>
                </div>

                <NewsCard
                  article={article}
                  showScore={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Finding trending news in your area...</p>
        </div>
      )}

      {/* No Results */}
      {!loading && !response && !error && (
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No trending news found for your location.</p>
        </div>
      )}
    </div>
  );
};

export default TrendingTab;
