import React, { useState, useEffect } from 'react';
import { Newspaper, MapPin } from 'lucide-react';
import { useLocation } from '../hooks/useLocation';

interface HeaderProps {
  onSetLocation: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSetLocation }) => {
  const { location, loading } = useLocation();
  const [cityName, setCityName] = useState<string>('');

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

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-blue-900/5">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-75"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <Newspaper className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Contextual News
              </h1>
              <p className="text-sm text-gray-500 -mt-1">AI-Powered News Discovery</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {loading ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-sm">Loading location...</span>
              </div>
            ) : location ? (
              <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-200/50">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {cityName || 'Getting city...'}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-gray-500 text-sm">
                <MapPin className="h-4 w-4" />
                <span>Location not set</span>
              </div>
            )}
            
            <button
              onClick={onSetLocation}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-full font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg shadow-md"
            >
              <MapPin className="h-4 w-4 inline mr-2" />
              Set Location
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
