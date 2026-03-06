import React, { useContext, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import MapScreen from './src/screens/MapScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

function NavigationWrapper() {
  const auth = useContext(AuthContext);
  // State to toggle between Login and Register views
  const [isLoginView, setIsLoginView] = useState(true);

  // Show a splash/loading screen while checking SecureStore for an existing token
  if (auth?.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Conditional Rendering: If user exists, show Map. Otherwise, show Login.
  if (auth?.user) {
    return <MapScreen />;
  }

  // If NOT logged in, show either Login or Register based on state
  return isLoginView ? (
    <LoginScreen switchToRegister={() => setIsLoginView(false)} />
  ) : (
    <RegisterScreen switchToLogin={() => setIsLoginView(true)} />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationWrapper />
    </AuthProvider>
  );
}