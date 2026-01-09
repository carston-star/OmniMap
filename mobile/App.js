import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import axios from 'axios';
import { API_KEY } from '@env';

export default function App() {
  // API_KEY is now loaded from .env using react-native-dotenv
  const BG_TASK_NAME = 'OMNIMAP_BACKGROUND_LOCATION_TASK';

  // Background task: will be invoked by the OS when location updates arrive.
  TaskManager.defineTask(BG_TASK_NAME, async ({ data, error }) => {
    if (error) {
      console.error('Background location task error:', error);
      return;
    }
    if (data) {
      const { locations } = data;
      if (locations && locations.length > 0) {
        const loc = locations[locations.length - 1];
        const payload = {
          userId: loc.userId || 'unknown',
          teamId: loc.teamId || undefined,
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          timestamp: loc.timestamp || Date.now()
        };
        try {
          await fetch('http://10.0.2.2:3000/api/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
            body: JSON.stringify(payload)
          });
        } catch (e) {
          console.warn('Failed to post background location', e);
        }
      }
    }
  });
  const [userId, setUserId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [sharing, setSharing] = useState(false);
  const [status, setStatus] = useState('Not sharing');
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      stopSharing();
    };
  }, []);

  async function fetchInterval() {
    try {
      const params = {};
      if (userId) params.userId = userId;
      if (teamId) params.teamId = teamId;
      const res = await axios.get('http://10.0.2.2:3000/api/location-update-interval', { params });
      return res.data.intervalMs || 300000;
    } catch (e) {
      console.warn('Could not fetch interval, using 5min', e);
      return 300000;
    }
  }

  async function sendLocation() {
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      await axios.post('http://10.0.2.2:3000/api/location', { userId, teamId, lat, lng, timestamp: Date.now() }, { headers: { 'x-api-key': API_KEY } });
      setStatus(`Sent ${new Date().toLocaleTimeString()}`);
    } catch (e) {
      console.warn('Failed to send location', e);
      setStatus('Failed to get/send location');
    }
  }

  async function startBackgroundLocation(userId, teamId, intervalMs) {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(BG_TASK_NAME);
      if (!hasStarted) {
        await Location.startLocationUpdatesAsync(BG_TASK_NAME, {
          accuracy: Location.Accuracy.High,
          timeInterval: intervalMs,
          distanceInterval: 0,
          showsBackgroundLocationIndicator: false,
          foregroundService: {
            notificationTitle: 'OmniMap',
            notificationBody: 'Sharing location in background',
            notificationColor: '#FF0000'
          }
        });
      }
      setStatus(s => `Background sharing every ${Math.round(intervalMs/60000)} min`);
    } catch (e) {
      console.warn('Could not start background updates', e);
      setStatus('Background start failed');
    }
  }

  async function stopBackgroundLocation() {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(BG_TASK_NAME);
      if (hasStarted) await Location.stopLocationUpdatesAsync(BG_TASK_NAME);
    } catch (e) {
      console.warn('Could not stop background updates', e);
    }
  }

  async function startSharing() {
    if (!userId) { setStatus('Enter user id'); return; }
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== 'granted') { setStatus('Foreground permission denied'); return; }

    // Background permission request (Android/iOS differences)
    if (Platform.OS === 'android') {
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus !== 'granted') {
        console.log('Background permission not granted — will use foreground updates while app active');
      }
    }

    const intervalMs = await fetchInterval();
    await sendLocation();
    // Try to start background updates (Android supported in managed workflow)
    if (Platform.OS === 'android') {
      await startBackgroundLocation(userId, teamId, intervalMs);
    }
    // Foreground interval as a fallback/while-app-active
    intervalRef.current = setInterval(sendLocation, intervalMs);
    setSharing(true);
    setStatus(`Sharing every ${Math.round(intervalMs/60000)} min`);
  }

  function stopSharing() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    // stop background updates if any
    stopBackgroundLocation();
    setSharing(false);
    setStatus('Not sharing');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OmniMap - Share Location</Text>
      <TextInput style={styles.input} placeholder="User id" onChangeText={setUserId} value={userId} />
      <TextInput style={styles.input} placeholder="Team id (optional)" onChangeText={setTeamId} value={teamId} />
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <View style={{ marginRight: 10 }}>
          <Button title={sharing ? 'Stop' : 'Start'} onPress={sharing ? stopSharing : startSharing} />
        </View>
        <View>
          <Button title="Send Now" onPress={sendLocation} />
        </View>
      </View>
      <Text style={{ marginTop: 20 }}>{status}</Text>
      <Text style={{ marginTop: 20, fontSize:12, color:'#666' }}>
        Note: This app sends location while the app runs. For robust background tracking you must build a production binary and configure background location tasks (see README).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 20
  },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 20 },
  input: { width: '100%', padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginTop: 10 }
});
