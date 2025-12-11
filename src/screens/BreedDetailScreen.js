import React from 'react';
import { ScrollView, Image, StyleSheet, View } from 'react-native';
import { Title, Paragraph, Button, Card } from 'react-native-paper';
import { useApp } from '../context/AppContext';

export default function BreedDetailScreen({ route }) {
  const { breed } = route.params;
  const { favorites, toggleFavorite } = useApp();
  const isFavorite = favorites.includes(breed.id);
  return (
    <ScrollView>
      <Card>
        {breed.image?.url ? <Image source={{ uri: breed.image.url }} style={styles.image} /> : null}
        <Card.Content>
          <Title>{breed.name}</Title>
          <Paragraph>{breed.breed_group ? `Group: ${breed.breed_group}` : ''}</Paragraph>
          <Paragraph>{breed.temperament}</Paragraph>
          <Paragraph>{breed.life_span ? `Life span: ${breed.life_span}` : ''}</Paragraph>
          <Paragraph>{breed.weight ? `Weight: ${breed.weight.metric} kg` : ''}</Paragraph>
          <Paragraph>{breed.height ? `Height: ${breed.height.metric} cm` : ''}</Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => toggleFavorite(breed.id)}>{isFavorite ? 'Unfavorite' : 'Add to favorites'}</Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 300 },
});
