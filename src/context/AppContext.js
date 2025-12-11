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
    // load persisted state
    (async () => {
      try {
        const fav = await AsyncStorage.getItem(FAVORITES_KEY);
        const ph = await AsyncStorage.getItem(PHOTOS_KEY);
        const st = await AsyncStorage.getItem(SETTINGS_KEY);
        if (fav) setFavorites(JSON.parse(fav));
        if (ph) setPhotos(JSON.parse(ph));
        if (st) setSettings(JSON.parse(st));
      } catch (e) {
        console.warn('Failed to load persisted state', e);
      }
    })();
  }, []);

  // persisters
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
      if (prev.includes(breedId)) return prev.filter((id) => id !== breedId);
      return [...prev, breedId];
    });
  }, []);

  const savePhoto = useCallback((photo) => {
    // photo: { id, uri, note, createdAt }
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
