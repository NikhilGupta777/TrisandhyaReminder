import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Text, View } from 'react-native';

export default function App() {
  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Open this app in Expo Go to view your website</Text>
      </View>
    );
  }

  return <WebView source={{ uri: 'https://yourwebsite.com' }} />;
}
