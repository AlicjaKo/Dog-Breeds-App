import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
import * as ExpoCamera from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import { useApp } from '../context/AppContext';
import { useFocusEffect } from '@react-navigation/native';

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef(null);
  const [photoUri, setPhotoUri] = useState(null);
  const [note, setNote] = useState('');
  const [taking, setTaking] = useState(false);
  const { savePhoto } = useApp();
  // Use the renderable CameraView component exported by expo-camera
  const CameraComponent = ExpoCamera.CameraView || ExpoCamera.default || ExpoCamera;
  // Camera will only be activated when the user explicitly requests it
  const [cameraActive, setCameraActive] = useState(false);

  const requestCamera = async () => {
    try {
      const fn = ExpoCamera.requestCameraPermissionsAsync || CameraComponent.requestCameraPermissionsAsync;
      if (typeof fn === 'function') {
        const { status } = await fn();
        if (status === 'granted') {
          setHasPermission(true);
          setCameraActive(true);
        } else {
          setHasPermission(false);
          Alert.alert('Permission required', 'Camera permission was denied.');
        }
      } else {
        // If permission API isn't available, try to activate anyway
        setHasPermission(true);
        setCameraActive(true);
      }
    } catch (e) {
      console.warn('Camera permission request failed', e);
      Alert.alert('Error', 'Failed to request camera permission');
      setHasPermission(false);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || taking) return;
    setTaking(true);
    try {
      const runner = cameraRef.current.takePictureAsync || cameraRef.current.takePicture;
      if (typeof runner !== 'function') throw new Error('Camera API not available');
      const photo = await runner.call(cameraRef.current, { quality: 0.7 });
      // some implementations return { uri } and some return { uri: ... }
      const uri = photo?.uri || photo;
      if (!uri) throw new Error('No photo uri returned');
      setPhotoUri(uri);
      // pause preview if camera exposes a method
      try {
        if (cameraRef.current.pausePreview) await cameraRef.current.pausePreview();
      } catch (_e) {
        // ignore
      }
    } catch (e) {
      console.warn('Failed to take picture', e);
      Alert.alert('Camera error', String(e.message || e));
    } finally {
      setTaking(false);
    }
  };

  // Pause/resume camera when tab loses/gains focus to avoid native crashes
  useFocusEffect(
    React.useCallback(() => {
      // on focus
      let mounted = true;
      (async () => {
        try {
          if (mounted && hasPermission) {
            // small delay to let native view mount
            setTimeout(() => {
              setCameraActive(true);
            }, 50);
          }
        } catch (_err) {
          // ignore
        }
      })();

      return () => {
        // on blur
        mounted = false;
        try {
          if (cameraRef.current?.pausePreview) {
            cameraRef.current.pausePreview().catch(() => {});
          }
        } catch (_err) {
          // ignore
        }
        setCameraActive(false);
      };
    }, [hasPermission])
  );

  // Cleanup cameraRef on unmount
  useEffect(() => {
    return () => {
      try {
        if (cameraRef.current?.pausePreview) cameraRef.current.pausePreview().catch(() => {});
      } catch (_err) {
        // ignore
      }
      cameraRef.current = null;
    };
  }, []);

  const persistPhoto = async () => {
    if (!photoUri) return;
    // Optionally copy to app data folder
    const fileName = `${FileSystem.documentDirectory}photo_${Date.now()}.jpg`;
    try {
      await FileSystem.copyAsync({ from: photoUri, to: fileName });
      const obj = { id: String(Date.now()), uri: fileName, note, createdAt: Date.now() };
      savePhoto(obj);
      setPhotoUri(null);
      setNote('');
      // resume preview after saving
      try {
        if (cameraRef.current?.resumePreview) await cameraRef.current.resumePreview();
        } catch (_e) {
          // ignore
        }
      } catch (err) {
        console.warn('Failed to save photo', err);
      }
  };

  if (!cameraActive)
    return (
      <View style={styles.center}>
        <Button mode="contained" onPress={requestCamera}>
          Open Camera
        </Button>
      </View>
    );

  if (hasPermission === false) return <View style={styles.center}><Text>No access to camera</Text></View>;

  return (
    <View style={styles.container}>
      {!photoUri ? (
        <View style={styles.cameraContainer}>
          <CameraComponent style={styles.cameraAbsolute} ref={cameraRef} ratio="16:9" />
          <View style={styles.cameraControlsOverlay} pointerEvents="box-none">
            <Button mode="contained" onPress={takePicture}>Take Photo</Button>
          </View>
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          <TextInput label="Note (optional)" value={note} onChangeText={setNote} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Button mode="contained" onPress={persistPhoto}>Save</Button>
            <Button onPress={async () => {
              setPhotoUri(null);
              setNote('');
              // try to resume preview when retaking
              try {
                if (cameraRef.current?.resumePreview) await cameraRef.current.resumePreview();
              } catch (_err) {
                // ignore
              }
            }}>Retake</Button>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraContainer: { flex: 1, position: 'relative' },
  cameraAbsolute: { ...StyleSheet.absoluteFillObject },
  cameraControlsOverlay: { position: 'absolute', left: 0, right: 0, bottom: 20, alignItems: 'center', padding: 16 },
  previewContainer: { flex: 1, padding: 12 },
  preview: { width: '100%', height: 400 },
});
