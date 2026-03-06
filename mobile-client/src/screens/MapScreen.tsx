import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview'; // We import WebView instead of MapView
import { useLocation } from '../hooks/useLocation';
import { useSocket } from '../hooks/useSocket';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/client';

export default function MapScreen() {
    const { location, errorMsg, isTracking } = useLocation();
    const { socket, isConnected } = useSocket();
    const auth = useContext(AuthContext);

    const [activeGig, setActiveGig] = useState<any>(null);

    const fetchActiveGig = async () => {
        try {
            const response = await apiClient.get('/tasks/my-gigs');
            if (response.data.tasks && response.data.tasks.length > 0) {
                setActiveGig(response.data.tasks[0]);
            } else {
                setActiveGig(null);
            }
        } catch (error) {
            console.error("Failed to fetch active gigs", error);
        }
    };

    useEffect(() => {
        fetchActiveGig();
    }, []);

    useEffect(() => {
        if (!isConnected) return;

        const claimGig = async (taskId: string) => {
            try {
                await apiClient.put(`/tasks/${taskId}/accept`);
                setTimeout(() => {
                    Alert.alert('🎉 Success!', 'You claimed the gig. Head to the location!');
                    fetchActiveGig(); 
                }, 500);
            } catch (error: any) {
                setTimeout(() => {
                    Alert.alert('Gig Unavailable', error.response?.data?.error || 'Failed to claim gig');
                }, 500);
            }
        };

        const handleNewTask = (taskData: any) => {
            Alert.alert(
                '🚀 New Gig Available!',
                `${taskData.title}\nPrice: $${taskData.price}`,
                [
                    { text: 'Decline', style: 'cancel' },
                    { text: 'Accept Gig', onPress: () => claimGig(taskData.taskId) }
                ]
            );
        };

        socket.on('new_task_available', handleNewTask);
        return () => {
            socket.off('new_task_available', handleNewTask);
        };
    }, [isConnected]);

    const handleCompleteGig = async () => {
        if (!activeGig) return;
        try {
            await apiClient.put(`/tasks/${activeGig.id}/complete`);
            Alert.alert('✅ Job Done!', 'Payment has been processed.');
            setActiveGig(null); 
        } catch (error) {
            Alert.alert('Error', 'Could not complete task.');
        }
    };

    if (!location) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>{errorMsg || 'Acquiring GPS...'}</Text>
            </View>
        );
    }

    // This dynamically generates the HTML for Leaflet based on your state
    const mapHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
              body { padding: 0; margin: 0; }
              html, body, #map { height: 100%; width: 100vw; }
          </style>
      </head>
      <body>
          <div id="map"></div>
          <script>
              var map = L.map('map', { zoomControl: false }).setView([${location.coords.latitude}, ${location.coords.longitude}], 14);
              
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  maxZoom: 19,
                  attribution: '© OpenStreetMap'
              }).addTo(map);

              // Blue Pin for Provider (You)
              var providerIcon = L.icon({
                  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
              });
              L.marker([${location.coords.latitude}, ${location.coords.longitude}], {icon: providerIcon}).addTo(map).bindPopup('You are here');

              ${activeGig ? `
              // Green Pin for the Gig
              var gigIcon = L.icon({
                  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
              });
              L.marker([${activeGig.latitude}, ${activeGig.longitude}], {icon: gigIcon}).addTo(map).bindPopup('${activeGig.title}');
              ` : ''}
          </script>
      </body>
      </html>
    `;

    return (
        <View style={styles.container}>
            {/* The WebView renders our Leaflet HTML string! */}
            <WebView
                style={styles.map}
                originWhitelist={['*']}
                source={{ html: mapHtml }}
                scrollEnabled={false}
                bounces={false}
            />

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

            {activeGig && (
                <View style={styles.activeGigCard}>
                    <View style={styles.gigHeader}>
                        <Text style={styles.gigTitle}>{activeGig.title}</Text>
                        <Text style={styles.gigPrice}>${activeGig.price}</Text>
                    </View>
                    <Text style={styles.gigAddress}>📍 {activeGig.address || 'Location provided upon arrival'}</Text>
                    {activeGig.client?.firstName && (
                        <Text style={styles.gigClient}>👤 Client: {activeGig.client.firstName}</Text>
                    )}
                    
                    <TouchableOpacity style={styles.completeButton} onPress={handleCompleteGig}>
                        <Text style={styles.completeButtonText}>Mark as Completed</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    map: { width: '100%', height: '100%' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 16 },
    statusOverlay: {
        position: 'absolute', top: 50, left: 20, right: 20, backgroundColor: 'white',
        padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10,
    },
    infoColumn: { flex: 1 },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    statusText: { fontSize: 13, fontWeight: '600', color: '#444' },
    logoutButton: { backgroundColor: '#fee2e2', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
    logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 12 },
    activeGigCard: {
        position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: 'white',
        padding: 20, borderRadius: 16, elevation: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10,
    },
    gigHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    gigTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', flex: 1 },
    gigPrice: { fontSize: 20, fontWeight: 'bold', color: '#10b981' },
    gigAddress: { fontSize: 14, color: '#555', marginBottom: 5 },
    gigClient: { fontSize: 14, color: '#555', marginBottom: 15, fontStyle: 'italic' },
    completeButton: { backgroundColor: '#2563eb', padding: 15, borderRadius: 10, alignItems: 'center' },
    completeButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});