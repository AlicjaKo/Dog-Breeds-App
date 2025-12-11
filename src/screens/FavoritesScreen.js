import React, { useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import BreedCard from '../components/BreedCard';
import { useApp } from '../context/AppContext';

export default function FavoritesScreen({ navigation }) {
  const { breeds, favorites, toggleFavorite } = useApp();

  const data = useMemo(() => {
    if (!breeds || breeds.length === 0) return [];
    const favSet = new Set(favorites);
    return breeds.filter((b) => favSet.has(b.id));
  }, [breeds, favorites]);

  if (!data || data.length === 0)
    return (
      <View style={styles.center}>
        <Text>No favorites yet. Tap the heart on a breed to add it here.</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <BreedCard
            breed={item}
            onPress={() => navigation.navigate('Home', { screen: 'BreedDetail', params: { breed: item } })}
            isFavorite={favorites.includes(item.id)}
            onFavoritePress={() => toggleFavorite(item.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
});
