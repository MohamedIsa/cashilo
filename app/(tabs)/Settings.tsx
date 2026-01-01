import ListTile from '@/components/ListTile';
import { useAppTheme } from '@/contexts/ThemeContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import Octicons from '@expo/vector-icons/Octicons';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Switch } from 'react-native-paper';

function Settings() {
  const theme = useAppTheme();
  const styles = useStyles();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(theme.mode === 'dark');
  const currentTheme = theme.mode === 'dark' ? 'Light' : 'Dark';
  const toggleTheme = () => {
    if (isDarkModeEnabled) {
      setIsDarkModeEnabled(false);
    } else {
      setIsDarkModeEnabled(true);
    }
    theme.toggleTheme();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Current theme: {theme.mode}</Text>
      {/* <TouchableOpacity style={styles.button} onPress={theme.toggleTheme}>
        <Text style={styles.buttonText}>Toggle Theme</Text>
      </TouchableOpacity> */}
      <ListTile
        title="Enable Notifications"
        leading={<Octicons name="bell" size={24} color={styles.color} />}
        trailing={
          <Switch
            color={theme.primary}
            value={isNotificationsEnabled}
            onValueChange={setIsNotificationsEnabled}
          />
        }
      />
      <ListTile
        title={`Enable ${currentTheme} Mode`}
        leading={<AntDesign name="moon" size={24} color={styles.color} />}
        trailing={
          <Switch color={theme.primary} value={isDarkModeEnabled} onValueChange={toggleTheme} />
        }
      />
    </View>
  );
}

export default Settings;

const useStyles = () => {
  const theme = useAppTheme();
  const styles = useMemo(
    () => ({
      color: theme.primaryText,
      container: { flex: 1, backgroundColor: theme.background, padding: 16 },
      text: { color: theme.primaryText, fontSize: 16 },
      button: { backgroundColor: theme.primary, padding: 12, borderRadius: 8, marginTop: 16 },
      buttonText: { color: theme.background, textAlign: 'center' as const },
    }),
    [theme],
  );
  return styles;
};
