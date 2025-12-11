import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView } from 'react-native';
import { ActivityIndicator, Searchbar, Text, Button, useTheme, Chip } from 'react-native-paper';
import Title from '../components/Title';
import { fetchBreeds } from '../api/dogApi';
import BreedCard from '../components/BreedCard';
import { useApp } from '../context/AppContext';

export default function BreedListScreen({ navigation }) {
  const { breeds, setBreeds, favorites, toggleFavorite } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
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
    let list = breeds || [];
    if (selectedGroup && selectedGroup !== 'All') {
      list = list.filter((b) => {
        // API uses `breed_group` for group; fall back to `group` if present
        const g = b.breed_group || b.group || '';
        return String(g).toLowerCase() === String(selectedGroup).toLowerCase();
      });
    }
    if (favoritesOnly) {
      list = list.filter((b) => favorites.includes(String(b.id)));
    }
    if (!query) return list;
    return list.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()));
  }, [breeds, query, selectedGroup, favoritesOnly, favorites]);

  const groups = useMemo(() => {
    const s = new Set();
    (breeds || []).forEach((b) => {
      const g = b.breed_group || b.group;
      if (g) s.add(g);
    });
    return ['All', ...Array.from(s).sort()];
  }, [breeds]);

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
      <View style={styles.headerRow}>
        <Title variant="large" style={styles.headerTitle}>Breeds</Title>
      </View>
      <Searchbar style={styles.search} placeholder="Search breeds" value={query} onChangeText={setQuery} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={styles.chipsContainer}
      >
        {groups.map((g) => (
          <Chip
            key={g}
            style={[styles.chip, selectedGroup === g ? { borderColor: colors.primary } : undefined]}
            mode={selectedGroup === g ? 'flat' : 'outlined'}
            onPress={() => setSelectedGroup(g)}
          >
            {g}
          </Chip>
        ))}
        <Chip
          style={[styles.chip, favoritesOnly ? { borderColor: colors.primary } : undefined]}
          icon={favoritesOnly ? 'heart' : 'heart-outline'}
          mode={favoritesOnly ? 'flat' : 'outlined'}
          onPress={() => setFavoritesOnly((v) => !v)}
        >
          Favorites
        </Chip>
      </ScrollView>

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
      {/* Help dialog moved to global floating HelpButton in App.js */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 12 },
  headerTitle: { marginLeft: 6, textAlign: 'left' },
  search: { marginHorizontal: 12, marginTop: 8, marginBottom: 6 },
  chipsContainer: { height: 56 },
  chipsRow: { paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' },
  chip: { marginRight: 8, minHeight: 40, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  flatEmptyContainer: { flex: 1 },
});
