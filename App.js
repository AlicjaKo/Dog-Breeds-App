import React from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme, IconButton, Portal, Dialog, Button, Text } from 'react-native-paper';

import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

import { AppProvider, useApp } from './src/context/AppContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import BreedListScreen from './src/screens/BreedListScreen';
import BreedDetailScreen from './src/screens/BreedDetailScreen';
import CameraScreen from './src/screens/CameraScreen';
import GalleryScreen from './src/screens/GalleryScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const fallbackElevation = {
  level0: 0,
  level1: 1,
  level2: 2,
  level3: 3,
  level4: 4,
  level5: 5,
};

const pinkTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#ff6fb5',
    secondary: '#7B2FF7',
    background: '#fff7fb',
    surface: '#fff0f8',
    onSurface: '#3b0b3b',
    text: '#3b0b3b',
    outline: '#c287b6',
  },
};

const darkPinkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#ff6fb5',
    secondary: '#7B2FF7',
    background: '#230022',
    surface: '#2b0b2f',
    onSurface: '#ffdff6',
    text: '#ffdff6',
    outline: '#b08bd9',
  },
};

function HomeStack() {
  const { settings } = useApp();
  const theme = settings.darkMode ? darkPinkTheme : pinkTheme;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        contentStyle: { backgroundColor: theme.colors.background },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="Breeds" component={BreedListScreen} />
      <Stack.Screen name="BreedDetail" component={BreedDetailScreen} options={{ title: 'Breed Detail' }} />
    </Stack.Navigator>
  );
}

// navigation ref used for inspecting current route and going back from floating controls
const navRef = createNavigationContainerRef();

function Tabs() {
  const { settings } = useApp();
  const theme = settings.darkMode ? darkPinkTheme : pinkTheme;

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.placeholder || '#999',
        lazy: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="dog" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="heart" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="camera" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="image" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <RootApp />
      </ErrorBoundary>
    </AppProvider>
  );
}

function RootApp() {
  const { settings } = useApp();
  const theme = settings.darkMode ? darkPinkTheme : pinkTheme;
  const [currentRoute, setCurrentRoute] = React.useState(null);

  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle={settings.darkMode ? 'light-content' : 'dark-content'} />
      {/* Map paper theme to react-navigation theme so navigation components follow colors */}
      <NavigationContainer
        ref={navRef}
        onStateChange={() => setCurrentRoute(navRef.getCurrentRoute())}
        theme={{
          dark: settings.darkMode,
          colors: {
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.surface,
            text: theme.colors.onSurface,
            border: theme.colors.outline || theme.colors.surface,
            notification: theme.colors.secondary,
          },
        }}
      >
        <Tabs />
      </NavigationContainer>

      {/* Left/top back button (visible on BreedDetail) */}
      {currentRoute?.name === 'BreedDetail' && navRef.canGoBack() ? (
        <View style={styles.leftTopControls} pointerEvents="box-none">
          <IconButton
            icon="arrow-left"
            size={28}
            onPress={() => {
              if (navRef.canGoBack()) navRef.goBack();
            }}
            accessibilityLabel="Go back"
            style={styles.backButton}
          />
        </View>
      ) : null}
      {/* Floating controls: help + dark mode toggle */}
      <View style={styles.topRightControls} pointerEvents="box-none">
        <HelpButton />
        <ThemeToggle />
      </View>
    </PaperProvider>
  );
}

function ThemeToggle() {
  const { settings, setDarkMode } = useApp();
  return (
    <IconButton
      icon={settings.darkMode ? 'moon-waning-crescent' : 'white-balance-sunny'}
      size={28}
      color={settings.darkMode ? '#ffdff6' : '#3b0b3b'}
      onPress={() => setDarkMode(!settings.darkMode)}
      accessibilityLabel="Toggle dark mode"
      style={styles.toggleButton}
    />
  );
}

function HelpButton() {
  const [visible, setVisible] = React.useState(false);

  return (
    <>
      <IconButton
        icon="help-circle-outline"
        size={28}
        onPress={() => setVisible(true)}
        style={styles.helpButton}
        accessibilityLabel="About this app"
      />

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>About</Dialog.Title>
          <Dialog.Content>
              <Text style={{ marginBottom: 8 }}>Dog Breeds Explorer — discover and learn about dog breeds with photos, facts and saved favorites.</Text>
              <Text style={{ marginBottom: 6 }}>Version: v1.2.0</Text>

              <Text style={{ marginBottom: 6 }}>Key Features:</Text>
              <Text>- Browse a searchable, filterable list of breeds with thumbnail images.</Text>
              <Text>- View detailed breed pages with temperament, lifespan, weight, height and multiple photos.</Text>
              <Text>- Save breeds to your favorites for quick access and offline viewing of recently opened breeds.</Text>
              <Text>- Add new photos from the Camera or choose from the Gallery; save images locally to your device.</Text>
              <Text>- Toggle Dark Mode and use accessibility-friendly colors and larger text sizes.</Text>

              <Text style={{ marginTop: 8 }}>Built with React Native, React Navigation and Expo.</Text>
            </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  topRightControls: {
    position: 'absolute',
    top: 44,
    right: 12,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: 'transparent',
  },
  helpButton: {
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  leftTopControls: {
    position: 'absolute',
    top: 44,
    left: 12,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
  },
});
