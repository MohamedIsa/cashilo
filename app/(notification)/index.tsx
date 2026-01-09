import ListTile from '@/components/ListTile';
import { useAppTheme } from '@/contexts/ThemeContext';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Badge } from 'react-native-paper';

export default function NotificationScreen() {
  //Mock Notification List
  interface Notification {
    id: number;
    message: string;
    isRead: boolean;
  }
  const notifications: Notification[] = [
    { id: 1, message: 'Your transaction of $50 has been processed.', isRead: false },
    { id: 2, message: 'New login from unrecognized device.', isRead: true },
    { id: 3, message: 'Your account statement is ready to view.', isRead: false },
  ];
  const styles = useStyles();
  return (
    <View style={styles.container}>
      {notifications.map((notification) => (
        <View style={styles.view} key={notification.id}>
          <ListTile
            key={notification.id}
            title={notification.message}
            trailing={notification.isRead ? '' : <Badge />}
          />
        </View>
      ))}
    </View>
  );
}

const useStyles = () => {
  const theme = useAppTheme();
  const styles = useMemo(
    () => ({
      container: { flex: 1, backgroundColor: theme.background, padding: 16 },
      view: { paddingBottom: 8 },
    }),
    [theme],
  );
  return styles;
};
