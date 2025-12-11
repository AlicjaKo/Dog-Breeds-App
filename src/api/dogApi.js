import AsyncStorage from '@react-native-async-storage/async-storage';

const BREEDS_URL = 'https://api.thedogapi.com/v1/breeds';
const BREEDS_CACHE_KEY = '@DBE_breeds_cache';

export async function fetchBreeds({ useCache = true, timeout = 10000 } = {}) {
  if (useCache) {
    try {
      const cached = await AsyncStorage.getItem(BREEDS_CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch (e) {
    }
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  let res;
  try {
    res = await fetch(BREEDS_URL, { signal: controller.signal });
  } catch (e) {
    clearTimeout(id);
    if (useCache) {
      try {
        const cached = await AsyncStorage.getItem(BREEDS_CACHE_KEY);
        if (cached) return JSON.parse(cached);
        } catch (_err) {
      }
    }
      throw new Error(e.name === 'AbortError' ? 'Request timed out' : 'Network request failed');
  } finally {
    clearTimeout(id);
  }

  if (!res.ok) throw new Error('Failed to fetch breeds');
  const json = await res.json();
  try {
    await AsyncStorage.setItem(BREEDS_CACHE_KEY, JSON.stringify(json));
  } catch (e) {
  }
  return json;
}
