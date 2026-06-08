import { withAlpha } from '@/contants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();
  const theme = useAppTheme();

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      tintColor={theme.primary}
      backgroundColor={theme.card}
      indicatorColor={withAlpha(theme.primary, 0.18)}
      shadowColor={withAlpha('#000', theme.mode === 'dark' ? 0.4 : 0.08)}
      rippleColor={withAlpha(theme.primary, 0.12)}
      labelVisibilityMode="labeled"
      labelStyle={{
        selected: { fontSize: 12, fontWeight: '600' },
        default: { fontSize: 11, fontWeight: '400' },
      }}
      iconColor={{
        default: withAlpha(theme.primaryText, 0.4),
        selected: theme.primary,
      }}
    >
      <NativeTabs.Trigger name="Dashboard">
        <NativeTabs.Trigger.Icon sf={{ default: 'rectangle.grid.2x2', selected: 'rectangle.grid.2x2.fill' }} md="grid_view" />
        <NativeTabs.Trigger.Label>{t('dashboard')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="Transactions">
        <NativeTabs.Trigger.Icon sf={{ default: 'arrow.left.arrow.right', selected: 'arrow.left.arrow.right' }} md="swap_horiz" />
        <NativeTabs.Trigger.Label>{t('transactions')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="Goals">
        <NativeTabs.Trigger.Icon sf={{ default: 'target', selected: 'target' }} md="flag" />
        <NativeTabs.Trigger.Label>{t('myGoals')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="Reports">
        <NativeTabs.Trigger.Icon sf={{ default: 'chart.pie', selected: 'chart.pie.fill' }} md="pie_chart" />
        <NativeTabs.Trigger.Label>{t('reports')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="Settings">
        <NativeTabs.Trigger.Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} md="settings" />
        <NativeTabs.Trigger.Label>{t('settings')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
