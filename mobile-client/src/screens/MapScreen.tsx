import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';
import { useSocket } from '../hooks/useSocket';

export default function MapScreen() {
  const { location, errorMsg, isTracking } = useLocation();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!isConnected) return;

    const handleNewTask = (taskData: any) => {
      Alert.alert(
        '🚀 New Gig Available Nearby!',
        `${taskData.title}\nPrice: $${taskData.price}`,
        [
          { text: 'Decline', style: 'cancel' },
          { text: 'Accept Gig', onPress: () => console.log('Accepted task', taskData.id) }
        ]
      );
    };

    socket.on('new_task_available', handleNewTask);

    return () => {
      socket.off('new_task_available', handleNewTask);
    };
  }, [isConnected]);

  // Show a loading spinner while waiting for the initial GPS lock
  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>
          {errorMsg ? errorMsg : 'Acquiring GPS Signal...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Full Screen Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01, // Controls the zoom level (smaller = closer)
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true} // Shows the default blue dot for the user
        followsUserLocation={true}
      >
        {/* We can add custom markers here for active tasks later */}
        <Marker 
          coordinate={{
             latitude: location.coords.latitude,
             longitude: location.coords.longitude,
          }}
          title="You"
          description="Ready for gigs"
        />
      </MapView>

      {/* Floating Status Bar Overlay */}
      <View style={styles.statusOverlay}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4ade80' : '#ef4444' }]} />
          <Text style={styles.statusText}>{isConnected ? 'Backend Connected' : 'Connecting...'}</Text>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: isTracking ? '#4ade80' : '#ef4444' }]} />
          <Text style={styles.statusText}>{isTracking ? 'GPS Active' : 'GPS Offline'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  statusOverlay: {
    position: 'absolute',
    top: 50, // Pushes it down below the iOS notch / Android status bar
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // For Android shadow
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});