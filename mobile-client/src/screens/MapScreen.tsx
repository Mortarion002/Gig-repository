import React, { useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';
import { useSocket } from '../hooks/useSocket';
import { AuthContext } from '../context/AuthContext';

export default function MapScreen() {
  const { location, errorMsg, isTracking } = useLocation();
  const { socket, isConnected } = useSocket();
  const auth = useContext(AuthContext); // Access logout function

  useEffect(() => {
    if (!isConnected) return;

    const handleNewTask = (taskData: any) => {
      Alert.alert(
        '🚀 New Gig Available!',
        `${taskData.title}\nPrice: $${taskData.price}`,
        [
          { text: 'Decline', style: 'cancel' },
          { text: 'Accept Gig', onPress: () => console.log('Accepted', taskData.id) }
        ]
      );
    };

    socket.on('new_task_available', handleNewTask);
    return () => {
      socket.off('new_task_available', handleNewTask);
    };
  }, [isConnected]);

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>{errorMsg || 'Acquiring GPS...'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
      >
        <Marker 
          coordinate={{
             latitude: location.coords.latitude,
             longitude: location.coords.longitude,
          }}
          title="My Location"
        />
      </MapView>

      {/* Status & Logout Overlay */}
      <View style={styles.statusOverlay}>
        <View style={styles.infoColumn}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4ade80' : '#ef4444' }]} />
            <Text style={styles.statusText}>{isConnected ? 'Online' : 'Offline'}</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: isTracking ? '#4ade80' : '#ef4444' }]} />
            <Text style={styles.statusText}>GPS {isTracking ? 'Active' : 'Error'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => auth?.logout()}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16 },
  statusOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  infoColumn: { flex: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 13, fontWeight: '600', color: '#444' },
  logoutButton: {
    backgroundColor: '#fee2e2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 12 },
});