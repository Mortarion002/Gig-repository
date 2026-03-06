import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import MapScreen from './src/screens/MapScreen';

export default function App() {
  return (
    // AuthProvider MUST wrap the components inside it
    <AuthProvider>
      <MapScreen />
    </AuthProvider>
  );
}