import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ProgressProvider } from './src/state/ProgressContext';
import { theme } from './src/theme/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        <ProgressProvider>
          <AppNavigator />
        </ProgressProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
});
