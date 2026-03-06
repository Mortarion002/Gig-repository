import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// NOTE: 10.0.2.2 is the localhost alias for Android Emulators. 
// If you are testing on a physical device, replace this with your computer's local IPv4 address (e.g., 192.168.1.x)
const API_URL = 'http://10.0.2.2:4000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically inject the JWT
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // SecureStore safely pulls the token from the device's encrypted storage
      const token = await SecureStore.getItemAsync('jwt');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from SecureStore:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;