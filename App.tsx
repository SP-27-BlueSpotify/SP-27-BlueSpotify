import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SpotifyAuthProvider } from './context/SpotifyAuthContext';
import AppNavigator from './navigation/AppNavigator';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const App: React.FC = () => {
  return (
      <SpotifyAuthProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </SpotifyAuthProvider>
  );
};

export default App;
