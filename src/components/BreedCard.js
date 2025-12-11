import { StyleSheet, Image } from 'react-native';
import { Card, Paragraph, IconButton, useTheme } from 'react-native-paper';
import Title from './Title';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

export default function BreedCard({ breed, onPress, onFavoritePress, isFavorite }) {
  const imageUrl = breed.image?.url;
  const { colors } = useTheme();
  const heartIcon = isFavorite ? 'heart' : 'heart-outline';
  const heartColor = isFavorite ? (colors?.primary || '#ff6fb5') : '#9e9e9e';
  // show a grey circular outline when NOT favorited, and the theme primary filled heart when favorited
  return (
    <Card style={styles.card} onPress={onPress}>
      {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} /> : null}
      <Card.Content>
        <Title variant="small">{breed.name}</Title>
        <Paragraph numberOfLines={2}>{breed.temperament}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <IconButton
          icon={() => <Icon name={heartIcon} size={26} color={heartColor} />}
          size={26}
          onPress={(e) => {
            if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
            if (typeof onFavoritePress === 'function') onFavoritePress();
          }}
          accessibilityLabel={isFavorite ? 'Unfavorite' : 'Favorite'}
          style={[
            styles.iconButton,
            { borderColor: isFavorite ? (colors?.primary || '#ff6fb5') : '#9e9e9e' },
          ]}
        />
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { margin: 8 },
  image: { width: '100%', height: 180 },
  iconButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 20,
    margin: 4,
  },
});
