import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';
import { useSocket } from '../hooks/useSocket';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/client';

export default function MapScreen() {
    const { location, errorMsg, isTracking } = useLocation();
    const { socket, isConnected } = useSocket();
    const auth = useContext(AuthContext);

    // New State to hold the provider's current active gig
    const [activeGig, setActiveGig] = useState<any>(null);

    // Function to fetch the provider's accepted gigs
    const fetchActiveGig = async () => {
        try {
            const response = await apiClient.get('/tasks/my-gigs');
            // If they have tasks, just grab the first one for now
            if (response.data.tasks && response.data.tasks.length > 0) {
                setActiveGig(response.data.tasks[0]);
            } else {
                setActiveGig(null);
            }
        } catch (error) {
            console.error("Failed to fetch active gigs", error);
        }
    };

    // Fetch active gig when the map first loads
    useEffect(() => {
        fetchActiveGig();
    }, []);

    useEffect(() => {
        if (!isConnected) return;

        const claimGig = async (taskId: string) => {
            try {
                await apiClient.put(`/tasks/${taskId}/accept`);
                // Wait 500ms for Android Alert bug, then show success and refresh UI
                setTimeout(() => {
                    Alert.alert('🎉 Success!', 'You claimed the gig. Head to the location!');
                    fetchActiveGig(); // Instantly refresh the UI to show the new card
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

    // Function to finish the job
    const handleCompleteGig = async () => {
        if (!activeGig) return;
        try {
            await apiClient.put(`/tasks/${activeGig.id}/complete`);
            Alert.alert('✅ Job Done!', 'Payment has been processed.');
            setActiveGig(null); // Clear the card from the screen
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

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                showsUserLocation={true}
            >
                {/* If there is an active gig, drop a pin at its location! */}
                {activeGig && (
                    <Marker
                        coordinate={{
                            latitude: activeGig.latitude,
                            longitude: activeGig.longitude,
                        }}
                        title={activeGig.title}
                        description={activeGig.address || 'Target Location'}
                        pinColor="green"
                    />
                )}
            </MapView>

            {/* Status & Logout Overlay (Top) */}
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

            {/* Active Gig Card (Bottom) */}
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
    container: { flex: 1 },
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
    
    // New Styles for the Bottom Card
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