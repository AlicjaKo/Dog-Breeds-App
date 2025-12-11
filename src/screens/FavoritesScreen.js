import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import BreedCard from '../components/BreedCard';
import { useApp } from '../context/AppContext';

export default function FavoritesScreen({ navigation }) {
  const { breeds, favorites, toggleFavorite } = useApp();
  const { colors } = useTheme();

  const data = useMemo(() => {
    if (!breeds || breeds.length === 0) return [];
    const favSet = new Set(favorites);
    return breeds.filter((b) => favSet.has(String(b.id)));
  }, [breeds, favorites]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <FlatList
        data={data}
        contentContainerStyle={
          data.length === 0 ? [styles.flatEmptyContainer, styles.listContent] : styles.listContent
        }
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={() => (
          <Text>No favorites yet. Tap the heart on a breed to add it here.</Text>
        )}
        renderItem={({ item }) => (
          <BreedCard
            breed={item}
            onPress={() => navigation.navigate('Home', { screen: 'BreedDetail', params: { breed: item } })}
            isFavorite={favorites.includes(String(item.id))}
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
  flatEmptyContainer: { flex: 1 },
  listContent: { paddingVertical: 8 },
});
