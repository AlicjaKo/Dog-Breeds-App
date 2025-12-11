import React from 'react';
import { View, StyleSheet, ScrollView, Text, Button, DevSettings } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    console.error('Uncaught error:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    const { error, info } = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <ScrollView style={styles.stack}>
          <Text style={styles.errorText}>{String(error && error.toString())}</Text>
          <Text style={styles.infoText}>{info?.componentStack}</Text>
        </ScrollView>
        <View style={styles.actions}>
          <Button title="Reload app" onPress={() => DevSettings.reload()} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  stack: { flex: 1, marginBottom: 12 },
  errorText: { color: '#900', fontWeight: '700', marginBottom: 8 },
  infoText: { color: '#333' },
  actions: { marginBottom: 24 },
});
