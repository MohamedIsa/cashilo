import { spacing, typography, withAlpha } from '@/contants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotificationScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: insets.top + spacing.md }}>
      <Text style={{ color: theme.headline, ...typography.display, paddingHorizontal: spacing.lg, marginBottom: spacing.xl }}>
        {t('notifications')}
      </Text>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingBottom: insets.bottom + 80 }}>
        <MaterialIcons name="notifications-none" size={56} color={withAlpha(theme.primaryText, 0.2)} />
        <Text style={{ color: withAlpha(theme.primaryText, 0.45), ...typography.body }}>
          {t('noNotificationsYet')}
        </Text>
      </View>
    </View>
  );
}
