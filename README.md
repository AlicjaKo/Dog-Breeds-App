# Dog Breeds Explorer

Dog Breeds Explorer is a mobile app to discover and learn about dog breeds with photos, facts, and saved favorites. Built with React Native, Expo, and React Navigation.

## Version

- **Current:** v1.2.0

## Key Features

- **Browse:** Searchable, filterable list of breeds with thumbnail images.
- **Details:** Detailed breed pages that show temperament, lifespan, weight, height and multiple photos.
- **Favorites:** Save breeds to your favorites for quick access and limited offline viewing of recently opened breeds.
- **Add Photos:** Add photos from the Camera or select images from the Gallery; images are saved locally on the device.
- **Appearance:** Toggle Dark Mode; app uses accessibility-friendly colors and supports larger text sizes.

## Coming Soon

- Side-by-side breed comparisons.
- Exportable favorites and improved sharing options.
- Optional cloud sync (opt-in) for favorites and images.

## Privacy & Feedback

- **Local Storage:** Images you add remain on your device — nothing is uploaded without your explicit consent.
- **Feedback:** To report bugs or request features, open an issue in the project's GitHub repository or contact the maintainer.

## Built With

- React Native
- Expo
- React Navigation
- react-native-paper
- @expo/vector-icons

## Getting Started

### Prerequisites

- Node.js
- `npm` or `yarn`
- (Optional) `expo-cli`

### Install

Clone the project and install dependencies:

```bash
git clone <repository-url>
cd "final project"
npm install
# or
# yarn
```

### Run (development)

Start the app using Expo:

```bash
npx expo start --clear
# or
# expo start
```

Open the app with the Expo Go app or run it on a simulator/emulator.

### Troubleshooting

If dependencies cause issues, remove `node_modules` and reinstall:

```bash
rm -rf node_modules
npm install
npx expo start --clear
```

## Project Structure (high level)

- `App.js` — app entry and navigation setup
- `src/context/AppContext.js` — app-wide context (settings, favorites)
- `src/screens/` — screens: `BreedListScreen`, `BreedDetailScreen`, `CameraScreen`, `GalleryScreen`, `FavoritesScreen`
- `src/components/` — reusable components (e.g., `BreedCard`, `Title`, `ErrorBoundary`)
- `src/api/dogApi.js` — API helper for fetching breed data

## Contributing

Please open issues and pull requests. When reporting bugs, include reproduction steps and environment details (OS, Expo/React Native versions).

## License

MIT
