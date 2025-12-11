import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { Button, TextInput, Text, useTheme } from 'react-native-paper';
import * as ExpoCamera from 'expo-camera';
// Use the legacy API to keep `moveAsync` available (new File/Directory classes exist in the
// modern API). This avoids runtime errors caused by the deprecated default export.
import * as FileSystem from 'expo-file-system/legacy';
import { useApp } from '../context/AppContext';
import { useFocusEffect } from '@react-navigation/native';

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef(null);
  const [photoUri, setPhotoUri] = useState(null);
  const [note, setNote] = useState('');
  const [taking, setTaking] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const { savePhoto } = useApp();
  const { colors } = useTheme();
  const CameraComponent = ExpoCamera.CameraView || ExpoCamera.default || ExpoCamera;
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
    if (!cameraReady) {
      Alert.alert('Camera not ready', "Please wait for the camera to initialize.");
      return;
    }
    setTaking(true);
    try {
      const runner = cameraRef.current.takePictureAsync || cameraRef.current.takePicture;
      if (typeof runner !== 'function') throw new Error('Camera API not available');
      const photo = await runner.call(cameraRef.current, { quality: 0.7 });
      const uri = photo?.uri || photo;
      if (!uri) throw new Error('No photo uri returned');
      setPhotoUri(uri);
      try {
        if (cameraRef.current.pausePreview) await cameraRef.current.pausePreview();
      } catch (_e) {
      }
    } catch (e) {
      console.warn('Failed to take picture', e);
      Alert.alert('Camera error', String(e.message || e));
    } finally {
      setTaking(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          if (mounted && hasPermission) {
            setTimeout(() => {
              setCameraActive(true);
            }, 50);
          }
        } catch (_err) {
        }
      })();

      return () => {
        mounted = false;
        try {
          if (cameraRef.current?.pausePreview) {
            cameraRef.current.pausePreview().catch(() => {});
          }
        } catch (_err) {
        }
        setCameraActive(false);
      };
    }, [hasPermission])
  );

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
    const fileName = `${FileSystem.documentDirectory}photo_${Date.now()}.jpg`;
    try {
      // Prefer moveAsync to avoid deprecated copyAsync warnings. Fall back to copyAsync or downloadAsync.
      if (typeof FileSystem.moveAsync === 'function') {
        await FileSystem.moveAsync({ from: photoUri, to: fileName });
      } else if (typeof FileSystem.copyAsync === 'function') {
        await FileSystem.copyAsync({ from: photoUri, to: fileName });
      } else if (typeof FileSystem.downloadAsync === 'function') {
        // downloadAsync will fetch the file and write it to the destination
        await FileSystem.downloadAsync(photoUri, fileName);
      } else {
        throw new Error('No suitable FileSystem method available to save the photo');
      }
      const obj = { id: String(Date.now()), uri: fileName, note, createdAt: Date.now() };
      savePhoto(obj);
      setPhotoUri(null);
      setNote('');
      try {
        if (cameraRef.current?.resumePreview) await cameraRef.current.resumePreview();
        } catch (_e) {
        }
      } catch (err) {
      console.warn('Failed to save photo', err);
      Alert.alert('Save error', String(err?.message || err));
      }
  };

  if (!cameraActive)
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}> 
        <Button mode="contained" onPress={requestCamera}>
          Open Camera
        </Button>
      </View>
    );

  if (hasPermission === false) return <View style={[styles.center, { backgroundColor: colors.background }]}><Text>No access to camera</Text></View>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {!photoUri ? (
        <View style={styles.cameraContainer}>
          <CameraComponent
            style={styles.cameraAbsolute}
            ref={cameraRef}
            ratio="16:9"
            onCameraReady={() => setCameraReady(true)}
            onMountError={() => setCameraReady(false)}
          />
          <View style={styles.cameraControlsOverlay} pointerEvents="box-none">
            <Button mode="contained" onPress={takePicture} disabled={!cameraReady || taking}>
              {taking ? 'Taking...' : 'Take Photo'}
            </Button>
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
              try {
                if (cameraRef.current?.resumePreview) await cameraRef.current.resumePreview();
              } catch (_err) {
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
