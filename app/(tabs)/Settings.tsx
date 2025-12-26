import useAppTheme from '@/hooks/useAppTheme';
import { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

function Settings() {
  const theme = useAppTheme();

  const styles = useMemo(
    () => ({
      container: { flex: 1, backgroundColor: theme.background, padding: 16 },
      text: { color: theme.primaryText, fontSize: 16 },
      button: { backgroundColor: theme.primary, padding: 12, borderRadius: 8, marginTop: 16 },
      buttonText: { color: theme.background, textAlign: 'center' as const },
    }),
    [theme],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Current theme: {theme.mode}</Text>
      <TouchableOpacity style={styles.button} onPress={theme.toggleTheme}>
        <Text style={styles.buttonText}>Toggle Theme</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Settings;
