import React, { useState } from 'react';
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Card, Paragraph, Title, useTheme } from 'react-native-paper';
import { useApp } from '../context/AppContext';
import ImageViewing from 'react-native-image-viewing';

export default function GalleryScreen() {
  const { photos } = useApp();
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const showImage = (index) => {
    setCurrentIndex(index);
    setModalVisible(true);
  };

  const images = photos.map((p) => ({ uri: p.uri }));
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {photos.length === 0 ? (
        <View style={[styles.center, { backgroundColor: colors.background }]}><Paragraph>No photos saved yet.</Paragraph></View>
      ) : (
        <View>
          <FlatList
            data={photos}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => showImage(index)} style={styles.thumbWrap}>
                <Image source={{ uri: item.uri }} style={[styles.thumb, { backgroundColor: colors.surface }]} />
              </TouchableOpacity>
            )}
            style={styles.thumbList}
          />

          <FlatList
            data={photos}
            contentContainerStyle={photos.length === 0 ? styles.flatEmptyContainer : undefined}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <Image source={{ uri: item.uri }} style={styles.image} />
                <Card.Content>
                  <Title>{new Date(item.createdAt).toLocaleString()}</Title>
                  <Paragraph>{item.note}</Paragraph>
                </Card.Content>
              </Card>
            )}
          />

          <ImageViewing
            images={images}
            imageIndex={currentIndex}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
            onImageIndexChange={(index) => setCurrentIndex(index ?? 0)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { margin: 8 },
  image: { width: '100%', height: 300 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  flatEmptyContainer: { flex: 1 },
  thumbList: { maxHeight: 170, paddingVertical: 8 },
  thumbWrap: { paddingHorizontal: 8 },
  thumb: { width: 140, height: 140, borderRadius: 8, backgroundColor: '#eee' },
  modalContainer: { flex: 1 },
});
