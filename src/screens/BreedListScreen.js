import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { ActivityIndicator, Searchbar, Text, Button, useTheme } from 'react-native-paper';
import { fetchBreeds } from '../api/dogApi';
import BreedCard from '../components/BreedCard';
import { useApp } from '../context/AppContext';

export default function BreedListScreen({ navigation }) {
  const { breeds, setBreeds, favorites, toggleFavorite } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const { colors } = useTheme();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchBreeds({ useCache: true, timeout: 10000 });
        if (mounted) setBreeds(list);
      } catch (e) {
        setError(e.message || 'Failed to load breeds');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [setBreeds]);

  const data = useMemo(() => {
    if (!query) return breeds;
    return breeds.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()));
  }, [breeds, query]);

  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}> 
        <ActivityIndicator animating size={48} />
      </View>
    );

  if (error)
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}> 
        <Text>{error}</Text>
        <Button mode="contained" onPress={() => {
          setLoading(true);
          setError(null);
          (async () => {
            try {
              const list = await fetchBreeds({ useCache: false, timeout: 10000 });
              setBreeds(list);
            } catch (e) {
              setError(e.message || 'Failed to load breeds');
            } finally {
              setLoading(false);
            }
          })();
        }}>Retry</Button>
      </View>
    );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Searchbar placeholder="Search breeds" value={query} onChangeText={setQuery} />
      <FlatList
        data={data}
        contentContainerStyle={data.length === 0 ? styles.flatEmptyContainer : undefined}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <BreedCard
            breed={item}
            onPress={() => navigation.navigate('BreedDetail', { breed: item })}
            isFavorite={favorites.includes(String(item.id))}
            onFavoritePress={() => toggleFavorite(item.id)}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <Text>No breeds found.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  flatEmptyContainer: { flex: 1 },
});
