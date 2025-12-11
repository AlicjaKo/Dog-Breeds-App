import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, DefaultTheme, DarkTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { AppProvider, useApp } from './src/context/AppContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import BreedListScreen from './src/screens/BreedListScreen';
import BreedDetailScreen from './src/screens/BreedDetailScreen';
import CameraScreen from './src/screens/CameraScreen';
import GalleryScreen from './src/screens/GalleryScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const pinkTheme = {
  ...DefaultTheme,
  colors: {
    ...(DefaultTheme?.colors || {}),
    primary: '#ff6fb5', 
    accent: '#7B2FF7', 
    background: '#fff7fb',
    surface: '#fff0f8',
    text: '#3b0b3b',
    placeholder: '#c287b6',
  },
};

const darkPinkTheme = {
  ...DarkTheme,
  colors: {
    ...(DarkTheme?.colors || {}),
    primary: '#ff6fb5',
    accent: '#7B2FF7',
    background: '#230022',
    surface: '#2b0b2f',
    text: '#ffdff6',
    placeholder: '#b08bd9',
  },
};

function HomeStack() {
  return (
    <Stack.Navigator>
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
      screenOptions={{ headerShown: false, tabBarActiveTintColor: theme.colors.primary, lazy: true }}
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
          tabBarIcon: ({ color, size }) => <Icon name="image-multiple" color={color} size={size} />,
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
      <NavigationContainer>
        <Tabs />
      </NavigationContainer>
    </PaperProvider>
  );
}
