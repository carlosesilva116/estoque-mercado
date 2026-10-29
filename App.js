import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import EstoqueScreen from './src/screens/EstoqueScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <EstoqueScreen />
    </SafeAreaProvider>
  );
}
