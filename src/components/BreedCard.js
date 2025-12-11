import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Card, Paragraph, Title, Button } from 'react-native-paper';

export default function BreedCard({ breed, onPress, onFavoritePress, isFavorite }) {
  const imageUrl = breed.image?.url;
  return (
    <Card style={styles.card} onPress={onPress}>
      {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} /> : null}
      <Card.Content>
        <Title>{breed.name}</Title>
        <Paragraph numberOfLines={2}>{breed.temperament}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button onPress={onFavoritePress}>{isFavorite ? 'Unfavorite' : 'Favorite'}</Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { margin: 8 },
  image: { width: '100%', height: 180 },
});
