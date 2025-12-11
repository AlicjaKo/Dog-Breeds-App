import React from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme, IconButton } from 'react-native-paper';

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
    outline: '#b08bd9',
  },
};

function HomeStack() {
  const { settings } = useApp();
  const theme = settings.darkMode ? darkPinkTheme : pinkTheme;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Breeds" component={BreedListScreen} />
      <Stack.Screen name="BreedDetail" component={BreedDetailScreen} options={{ title: 'Breed Detail' }} />
    </Stack.Navigator>
  );
}

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
          headerShown: false,
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

  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle={settings.darkMode ? 'light-content' : 'dark-content'} />
      {/* Map paper theme to react-navigation theme so navigation components follow colors */}
      <NavigationContainer
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

      {/* Floating dark mode toggle */}
      <View style={styles.toggleContainer} pointerEvents="box-none">
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

const styles = StyleSheet.create({
  toggleContainer: {
    position: 'absolute',
    top: 44,
    right: 12,
    zIndex: 1000,
  },
  toggleButton: {
    backgroundColor: 'transparent',
  },
});
