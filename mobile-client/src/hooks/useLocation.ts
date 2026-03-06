import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import apiClient from '../api/client';

export const useLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);

  useEffect(() => {
    let subscriber: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      try {
        // 1. Request permissions from the OS
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied. Please enable it in settings.');
          return;
        }

        setIsTracking(true);

        // 2. Watch the provider's position continuously
        subscriber = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 10000, // Update every 10 seconds
            distanceInterval: 50, // OR every 50 meters
          },
          async (newLocation) => {
            setLocation(newLocation);
            
            // 3. Sync with your Redis backend
            try {
              // The apiClient automatically attaches the JWT from Phase 5.1!
              await apiClient.put('/users/location', {
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
              });
              console.log('Location synced to Redis backend via Express');
            } catch (apiError) {
              console.error('Failed to sync location to backend:', apiError);
            }
          }
        );
      } catch (err) {
        setErrorMsg('An error occurred while initializing location tracking.');
        console.error(err);
      }
    };

    startTracking();

    // 4. Cleanup: Stop tracking if the component unmounts (e.g., they log out)
    return () => {
      if (subscriber) {
        subscriber.remove();
      }
      setIsTracking(false);
    };
  }, []);

  return { location, errorMsg, isTracking };
};