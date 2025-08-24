import React from 'react';
import { ExternalLink, MapPin, Star, Calendar } from 'lucide-react';
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

  return (
    <div className="card hover:shadow-lg transition-all duration-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors">
            {article.title}
          </h3>
          
          <p className="text-gray-600 text-sm line-clamp-3">
            {article.description}
          </p>
        </div>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(article.publication_date)}</span>
            </div>
            
            <span className="text-gray-400">•</span>
            
            <span className="font-medium text-gray-700">
              {article.source_name}
            </span>
          </div>

          {showScore && (
            <div className="flex items-center space-x-1 text-yellow-600">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-medium">{formatScore(article.relevance_score)}%</span>
            </div>
          )}
        </div>

        {/* Categories */}
        {article.category && article.category.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.category.map((cat, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Location */}
        {showLocation && article.latitude && article.longitude && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>
              {article.latitude.toFixed(4)}, {article.longitude.toFixed(4)}
            </span>
          </div>
        )}

        {/* AI Summary */}
        {article.llm_summary && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm font-medium text-blue-800 mb-1">
              AI Summary
            </div>
            <p className="text-sm text-blue-700">
              {article.llm_summary}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Read Full Article
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
