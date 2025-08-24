import React, { useState, useEffect } from 'react';
import { ExternalLink, MapPin, Star, Calendar, Globe, TrendingUp } from 'lucide-react';
import { NewsArticle } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  article: NewsArticle;
  showLocation?: boolean;
  showScore?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ 
  article, 
  showLocation = false, 
  showScore = true 
}) => {
  const [cityName, setCityName] = useState<string>('');

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown date';
    }
  };

  const formatScore = (score: number) => {
    return (score * 100).toFixed(0);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'politics': 'from-red-500 to-red-600',
      'technology': 'from-blue-500 to-blue-600',
      'business': 'from-green-500 to-green-600',
      'sports': 'from-orange-500 to-orange-600',
      'entertainment': 'from-purple-500 to-purple-600',
      'science': 'from-indigo-500 to-indigo-600',
      'national': 'from-gray-500 to-gray-600',
      'world': 'from-cyan-500 to-cyan-600'
    };
    return colors[category.toLowerCase()] || 'from-gray-500 to-gray-600';
  };

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
    if (showLocation && article.latitude && article.longitude) {
      getCityFromCoordinates(article.latitude, article.longitude)
        .then(setCityName);
    }
  }, [showLocation, article.latitude, article.longitude]);

  return (
    <div className="group bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 hover:bg-white hover:border-blue-200/50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl shadow-lg">
      <div className="space-y-5">
        {/* Header with enhanced title */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
            {article.title}
          </h3>
          
          <p className="text-gray-600 text-base line-clamp-3 leading-relaxed">
            {article.description}
          </p>
        </div>

        {/* Enhanced Meta Information */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-full">
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{formatDate(article.publication_date)}</span>
            </div>
            
            <div className="flex items-center space-x-2 bg-blue-100 px-3 py-2 rounded-full">
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">{article.source_name}</span>
            </div>
          </div>

          {showScore && (
            <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-2 rounded-full border border-yellow-200">
              <Star className="h-4 w-4 text-yellow-600 fill-current" />
              <span className="text-sm font-bold text-yellow-800">{formatScore(article.relevance_score)}%</span>
            </div>
          )}
        </div>

        {/* Enhanced Categories */}
        {article.category && article.category.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.category.map((cat, index) => (
              <span
                key={index}
                className={`px-3 py-1.5 bg-gradient-to-r ${getCategoryColor(cat)} text-white text-xs rounded-full font-semibold shadow-sm`}
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Enhanced Location */}
        {showLocation && article.latitude && article.longitude && (
          <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-xl border border-green-200/50">
            <MapPin className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              {cityName || 'Getting location...'}
            </span>
          </div>
        )}

        {/* Enhanced AI Summary */}
        {article.llm_summary && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <span className="text-sm font-semibold text-blue-800">AI Summary</span>
            </div>
            <p className="text-sm text-blue-700 leading-relaxed">
              {article.llm_summary}
            </p>
          </div>
        )}

        {/* Enhanced Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg shadow-md flex items-center space-x-2"
          >
            <ExternalLink className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
            <span>Read Full Article</span>
          </a>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <TrendingUp className="h-3 w-3" />
            <span>Relevance: {formatScore(article.relevance_score)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
