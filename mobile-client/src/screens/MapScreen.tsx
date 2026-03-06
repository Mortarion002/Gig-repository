import React, { useEffect } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useLocation } from '../hooks/useLocation';
import { useSocket } from '../hooks/useSocket';

export default function MapScreen() {
  const { location, errorMsg, isTracking } = useLocation();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!isConnected) return;

    // Listen for the specific event emitted by your Node.js backend
    const handleNewTask = (taskData: any) => {
      // You can trigger a local notification here, or an in-app Alert
      Alert.alert(
        'New Gig Available! 🚀',
        `Title: ${taskData.title}\nPrice: $${taskData.price}`,
        [
          { text: 'Ignore', style: 'cancel' },
          { text: 'View Details', onPress: () => console.log('Navigate to task details', taskData.id) }
        ]
      );
    };

    socket.on('new_task_available', handleNewTask);

    return () => {
      socket.off('new_task_available', handleNewTask);
    };
  }, [isConnected]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Provider Dashboard</Text>
      
      {/* Network Status */}
      <View style={styles.statusBox}>
        <Text>Backend: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</Text>
        <Text>GPS: {isTracking ? '🟢 Tracking' : '🔴 Stopped'}</Text>
      </View>

      {/* Location Status */}
      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : location ? (
        <Text style={styles.locationText}>
          Lat: {location.coords.latitude.toFixed(4)}{'\n'}
          Lon: {location.coords.longitude.toFixed(4)}
        </Text>
      ) : (
        <Text>Pinpointing your location...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  statusBox: { padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 20, width: '100%' },
  errorText: { color: 'red', textAlign: 'center' },
  locationText: { textAlign: 'center', fontSize: 16, marginTop: 10 },
});