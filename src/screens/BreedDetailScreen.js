import { ScrollView, Image, StyleSheet } from 'react-native';
import { Title, Paragraph, Card, IconButton, useTheme } from 'react-native-paper';
import { useApp } from '../context/AppContext';

export default function BreedDetailScreen({ route }) {
  const { breed } = route.params;
  const { favorites, toggleFavorite } = useApp();
  const isFavorite = favorites.includes(String(breed.id));
  const { colors } = useTheme();
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
          <IconButton
            icon={isFavorite ? 'heart' : 'heart-outline'}
            color={isFavorite ? (colors?.primary || '#ff6fb5') : '#9e9e9e'}
            size={30}
            onPress={() => toggleFavorite(breed.id)}
            accessibilityLabel={isFavorite ? 'Unfavorite' : 'Add to favorites'}
            style={[
              styles.iconButton,
              { borderColor: isFavorite ? (colors?.primary || '#ff6fb5') : '#9e9e9e' },
            ]}
          />
        </Card.Actions>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 300 },
  iconButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 24,
    margin: 6,
  },
});
