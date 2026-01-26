import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

type LocationContextType = {
  userLocation: { latitude: number; longitude: number } | null;
  locationError: string | null;
  isLocationLoading: boolean;
  requestLocation: () => void;
  hasLocationPermission: boolean;
};

const LocationContext = createContext<LocationContextType | null>(null);

export const LocationProvider = ({ children }: PropsWithChildren) => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setIsLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setHasLocationPermission(true);
        setLocationError(null);
        setIsLocationLoading(false);
      },
      (error) => {
        let errorMessage = 'Failed to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services and refresh the page.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setLocationError(errorMessage);
        setHasLocationPermission(false);
        setIsLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Check if we already have permission and get location
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          setHasLocationPermission(true);
          requestLocation();
        }
      });
    }
  }, []);

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        locationError,
        isLocationLoading,
        requestLocation,
        hasLocationPermission,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};
