import React from 'react';
import { View, FlatList, Image, StyleSheet } from 'react-native';
import { Card, Paragraph, Title } from 'react-native-paper';
import { useApp } from '../context/AppContext';

export default function GalleryScreen() {
  const { photos } = useApp();
  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
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
        ListEmptyComponent={() => (
          <View style={styles.center}><Paragraph>No photos saved yet.</Paragraph></View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { margin: 8 },
  image: { width: '100%', height: 300 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
