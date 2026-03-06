// backend/src/services/redis.service.ts
import { createClient } from 'redis';
import 'dotenv/config';

// 1. Initialize the client using the URL from your docker setup
export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

export const connectRedis = async (): Promise<void> => {
  await redisClient.connect();
  console.log('📦 Connected to Redis successfully');
};

// 2. Function for Providers to update their live location
export const updateProviderLocation = async (providerId: string, latitude: number, longitude: number): Promise<void> => {
  // GEOADD key longitude latitude member
  await redisClient.geoAdd('provider_locations', {
    longitude, // Longitude MUST come first in Redis
    latitude,
    member: providerId
  });
};

// 3. Function to find Providers within a certain radius of a Task
export const findNearbyProviders = async (latitude: number, longitude: number, radiusKm: number): Promise<string[]> => {
  // GEOSEARCH key FROM LONLAT BYRADIUS km
  const nearbyProviders = await redisClient.geoSearch(
    'provider_locations',
    { longitude, latitude },
    { radius: radiusKm, unit: 'km' }
  );
  
  // Returns an array of provider string IDs
  return nearbyProviders; 
};