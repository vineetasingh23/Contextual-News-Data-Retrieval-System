import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2, AlertCircle, Globe } from 'lucide-react';
import { newsAPI } from '../services/api';
import { NearbyResponse, NewsArticle } from '../types';
import { useLocation } from '../hooks/useLocation';
import NewsCard from './NewsCard';

const NearbyTab: React.FC = () => {
  const [response, setResponse] = useState<NearbyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(100);
  const { location, loading: locationLoading } = useLocation();

  const fetchNearbyNews = async () => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      const result = await newsAPI.getNearbyNews(
        location.latitude,
        location.longitude,
        radius,
        15
      );
      setResponse(result);
    } catch (err) {
      setError('Failed to fetch nearby news. Please try again.');
      console.error('Nearby news error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location && !loading) {
      fetchNearbyNews();
    }
  }, [location, radius]);

  const getDistanceColor = (lat: number, lon: number) => {
    if (!location) return 'text-gray-600';
    
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      lat,
      lon
    );
    
    if (distance <= 10) return 'text-green-600';
    if (distance <= 50) return 'text-blue-600';
    if (distance <= 100) return 'text-orange-600';
    return 'text-red-600';
  };

  const getDistanceLabel = (lat: number, lon: number) => {
    if (!location) return 'Unknown';
    
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      lat,
      lon
    );
    
    if (distance <= 10) return `${distance.toFixed(1)} km`;
    if (distance <= 50) return `${distance.toFixed(0)} km`;
    if (distance <= 100) return `${distance.toFixed(0)} km`;
    return `${distance.toFixed(0)} km`;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
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
          We need your location to show news articles near you.
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
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Nearby News</h1>
        <p className="text-gray-600">
          Discover news articles close to your location
        </p>
      </div>

      {/* Location Controls */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-blue-800">
            <MapPin className="h-5 w-5" />
            <span className="font-medium">
              Your location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </span>
          </div>
          
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
              className="w-32"
            />
          </div>
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
              News Near You
            </h2>
            <p className="text-gray-600">
              Found {response.total_results} articles within {radius} km
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Location: {response.location.latitude.toFixed(4)}, {response.location.longitude.toFixed(4)}
            </p>
          </div>

          <div className="space-y-6">
            {response.articles.map((article: NewsArticle) => (
              <div key={article.id} className="relative">
                {/* Distance Badge */}
                {article.latitude && article.longitude && (
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-white border border-gray-200 rounded-full px-3 py-1 shadow-lg">
                      <div className={`text-xs font-bold ${getDistanceColor(article.latitude, article.longitude)}`}>
                        {getDistanceLabel(article.latitude, article.longitude)}
                      </div>
                    </div>
                  </div>
                )}

                <NewsCard
                  article={article}
                  showLocation={true}
                  showScore={false}
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
          <p className="text-gray-600">Finding news near your location...</p>
        </div>
      )}

      {/* No Results */}
      {!loading && !response && !error && (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No nearby news found for your location.</p>
        </div>
      )}
    </div>
  );
};

export default NearbyTab;
