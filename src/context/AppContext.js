import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

const BREEDS_CACHE_KEY = '@DBE_breeds_cache';
const FAVORITES_KEY = '@DBE_favorites';
const PHOTOS_KEY = '@DBE_photos';
const SETTINGS_KEY = '@DBE_settings';

export const AppProvider = ({ children }) => {
  const [breeds, setBreeds] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [settings, setSettings] = useState({ darkMode: false });

  useEffect(() => {
    (async () => {
      try {
        const fav = await AsyncStorage.getItem(FAVORITES_KEY);
        const ph = await AsyncStorage.getItem(PHOTOS_KEY);
        const st = await AsyncStorage.getItem(SETTINGS_KEY);
        if (fav) {
          // Ensure favorite IDs are stored as strings for consistent comparisons
          const parsed = JSON.parse(fav) || [];
          setFavorites(parsed.map((id) => String(id)));
        }
        if (ph) setPhotos(JSON.parse(ph));
        if (st) setSettings(JSON.parse(st));
      } catch (e) {
        console.warn('Failed to load persisted state', e);
      }
    })();
  }, []);


  useEffect(() => {
    AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)).catch(() => {});
  }, [favorites]);

  useEffect(() => {
    AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(photos)).catch(() => {});
  }, [photos]);

  useEffect(() => {
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings]);

  const setBreedsCallback = useCallback(async (list) => {
    setBreeds(list);
    try {
      await AsyncStorage.setItem(BREEDS_CACHE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to cache breeds', e);
    }
  }, []);

  const toggleFavorite = useCallback((breedId) => {
    setFavorites((prev) => {
      const id = String(breedId);
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      return [...prev, id];
    });
  }, []);

  const savePhoto = useCallback((photo) => {
    setPhotos((prev) => [photo, ...prev]);
  }, []);

  const updatePhotoNote = useCallback((id, note) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, note } : p)));
  }, []);

  const setDarkMode = useCallback((value) => setSettings((s) => ({ ...s, darkMode: value })), []);

  const contextValue = useMemo(() => ({
    breeds,
    setBreeds: setBreedsCallback,
    favorites,
    toggleFavorite,
    photos,
    savePhoto,
    updatePhotoNote,
    settings,
    setDarkMode,
  }), [breeds, setBreedsCallback, favorites, toggleFavorite, photos, savePhoto, updatePhotoNote, settings, setDarkMode]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
