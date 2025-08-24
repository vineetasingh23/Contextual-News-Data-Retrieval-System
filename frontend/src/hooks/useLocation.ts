import { useState, useEffect } from 'react';
import { LocationData } from '../types';

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        // Check if location is stored in localStorage
        const storedLocation = localStorage.getItem('userLocation');
        if (storedLocation) {
          const parsed = JSON.parse(storedLocation);
          setLocation(parsed);
          setLoading(false);
          return;
        }

        // Get current location from GPS
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const newLocation: LocationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              
              setLocation(newLocation);
              localStorage.setItem('userLocation', JSON.stringify(newLocation));
              setLoading(false);
            },
            (error) => {
              console.error('Geolocation error:', error);
              setError('Unable to get your location. Please set it manually.');
              setLoading(false);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000, // 5 minutes
            }
          );
        } else {
          setError('Geolocation is not supported by your browser.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Location error:', err);
        setError('Failed to get location.');
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  const updateLocation = (newLocation: LocationData) => {
    setLocation(newLocation);
    localStorage.setItem('userLocation', JSON.stringify(newLocation));
  };

  const clearLocation = () => {
    setLocation(null);
    localStorage.removeItem('userLocation');
  };

  return {
    location,
    loading,
    error,
    updateLocation,
    clearLocation,
  };
};
