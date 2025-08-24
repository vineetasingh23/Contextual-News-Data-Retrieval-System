import React from 'react';
import { Newspaper, MapPin } from 'lucide-react';
import { useLocation } from '../hooks/useLocation';

interface HeaderProps {
  onSetLocation: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSetLocation }) => {
  const { location, loading } = useLocation();

  const formatCoordinates = (lat: number, lon: number) => {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Newspaper className="h-8 w-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Contextual News
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="text-gray-500">Loading location...</div>
          ) : location ? (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{formatCoordinates(location.latitude, location.longitude)}</span>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">Location not set</div>
          )}
          
          <button
            onClick={onSetLocation}
            className="btn-secondary text-sm"
          >
            Set Location
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
