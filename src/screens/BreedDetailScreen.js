import { ScrollView, Image, StyleSheet, View, FlatList, Modal, TouchableOpacity } from 'react-native';
import { Paragraph, Card, IconButton, useTheme, ActivityIndicator } from 'react-native-paper';
import Title from '../components/Title';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useEffect, useState } from 'react';
import { fetchBreedImages } from '../api/dogApi';

export default function BreedDetailScreen({ route }) {
  const { breed } = route.params;
  const { favorites, toggleFavorite } = useApp();
  const isFavorite = favorites.includes(String(breed.id));
  const { colors } = useTheme();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  const openImage = (uri) => {
    if (!uri) return;
    setModalImage(uri);
    setModalVisible(true);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const imgs = await fetchBreedImages({ breedId: breed.id, limit: 8, timeout: 10000 });
        if (!mounted) return;
        const urls = imgs
          .map((i) => i.url)
          .filter(Boolean)
          .filter((u, idx, arr) => arr.indexOf(u) === idx)
          .filter((u) => u !== breed.image?.url);
        setImages(urls);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || 'Failed to load images');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [breed.id, breed.image?.url]);

  return (
    <ScrollView style={{ backgroundColor: colors.background }}>
      <Card>
        {breed.image?.url ? (
          <TouchableOpacity activeOpacity={0.9} onPress={() => openImage(breed.image.url)}>
            <Image source={{ uri: breed.image.url }} style={styles.image} />
          </TouchableOpacity>
        ) : null}
        <Card.Content>
          <Title variant="large">{breed.name}</Title>
          <Paragraph>{breed.breed_group ? `Group: ${breed.breed_group}` : ''}</Paragraph>
          <Paragraph>{breed.temperament}</Paragraph>
          <Paragraph>{breed.life_span ? `Life span: ${breed.life_span}` : ''}</Paragraph>
          <Paragraph>{breed.weight ? `Weight: ${breed.weight.metric} kg` : ''}</Paragraph>
          <Paragraph>{breed.height ? `Height: ${breed.height.metric} cm` : ''}</Paragraph>
        </Card.Content>
        <Card.Actions>
          <IconButton
            icon={() => (
              <Icon
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={30}
                color={isFavorite ? (colors?.primary || '#ff6fb5') : '#9e9e9e'}
              />
            )}
            size={30}
            onPress={(e) => {
              if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
              toggleFavorite(breed.id);
            }}
            accessibilityLabel={isFavorite ? 'Unfavorite' : 'Add to favorites'}
            style={[
              styles.iconButton,
              { borderColor: isFavorite ? (colors?.primary || '#ff6fb5') : '#9e9e9e' },
            ]}
          />
        </Card.Actions>
      </Card>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <Image source={{ uri: modalImage }} style={styles.modalImage} resizeMode="contain" />
        </TouchableOpacity>
      </Modal>

      <View style={styles.extraImagesContainer}>
        <Title variant="medium" style={styles.sectionTitle}>Photos</Title>
        {loading ? (
          <ActivityIndicator animating size={36} />
        ) : error ? (
          <Paragraph>{error}</Paragraph>
        ) : images.length === 0 ? (
          <Paragraph>No additional photos available.</Paragraph>
        ) : (
          <FlatList
            data={images}
            horizontal
            keyExtractor={(item) => `${breed.id}-img-${item}`}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity activeOpacity={0.85} onPress={() => openImage(item)}>
                <Image source={{ uri: item }} style={styles.thumb} />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
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
  extraImagesContainer: { padding: 12 },
  sectionTitle: { marginBottom: 8 },
  thumb: { width: 150, height: 120, marginRight: 8, borderRadius: 6 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: '100%', height: '80%' },
});
