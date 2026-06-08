import { Language } from '@/contants/storageKeys';
import { radius, shadow, spacing, typography, withAlpha } from '@/contants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';
import i18n from '@/i18n';
import {
    clearAllData,
    getCurrency,
    getLanguage,
    setCurrency as saveCurrency,
    setLanguage as saveLanguage,
} from '@/storage';
import {
    cancelDailyReminder,
    isDailyReminderScheduled,
    requestNotificationPermission,
    scheduleDailyReminder,
} from '@/utils/notifications';
import { exportData, importData, ImportMode } from '@/utils/dataExchange';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Updates from 'expo-updates';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    I18nManager,
    Pressable,
    ScrollView,
    Switch,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'EN' },
  { code: 'ar', label: 'العربية', native: 'ع' },
];

const CURRENCIES: { code: string; symbol: string; i18nKey: string }[] = [
  { code: 'USD', symbol: '$',  i18nKey: 'currencyUSD' },
  { code: 'EUR', symbol: '€',  i18nKey: 'currencyEUR' },
  { code: 'SAR', symbol: '﷼', i18nKey: 'currencySAR' },
  { code: 'EGP', symbol: 'E£', i18nKey: 'currencyEGP' },
  { code: 'BHD', symbol: 'BD', i18nKey: 'currencyBHD' },
];

// ─── Coloured icon badge ─────────────────────────────────────────────────────
function IconBadge({ name, color }: { name: keyof typeof MaterialIcons.glyphMap; color: string }) {
  return (
    <View
      style={{
        width: 34,
        height: 34,
        borderRadius: radius.sm,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MaterialIcons name={name} size={19} color="#fff" />
    </View>
  );
}

// ─── Row inside a group card ─────────────────────────────────────────────────
function SettingsRow({
  icon,
  iconColor,
  label,
  subtitle,
  trailing,
  onPress,
  divider = true,
  destructive = false,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  label: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  divider?: boolean;
  destructive?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: withAlpha(theme.primaryText, 0.06) }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.md,
        backgroundColor: pressed ? withAlpha(theme.primaryText, 0.03) : 'transparent',
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: withAlpha(theme.primaryText, 0.07),
      })}
    >
      <IconBadge name={icon} color={destructive ? '#FF3B30' : iconColor} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: destructive ? '#FF3B30' : theme.primaryText, ...typography.body }}>
          {label}
        </Text>
        {subtitle ? (
          <Text style={{ color: withAlpha(theme.primaryText, 0.45), ...typography.caption, marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ?? (
        onPress ? <MaterialIcons name="chevron-right" size={20} color={withAlpha(theme.primaryText, 0.3)} /> : null
      )}
    </Pressable>
  );
}

// ─── Card wrapper ────────────────────────────────────────────────────────────
function SettingsCard({ children }: { children: React.ReactNode }) {
  const theme = useAppTheme();
  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: radius.lg,
        overflow: 'hidden',
        marginBottom: spacing.md,
        ...shadow.sm,
      }}
    >
      {children}
    </View>
  );
}

// ─── Section label ───────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
  const theme = useAppTheme();
  return (
    <Text
      style={{
        color: withAlpha(theme.primaryText, 0.45),
        ...typography.caption,
        fontWeight: '600',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        paddingHorizontal: spacing.sm,
        paddingTop: spacing.xl,
        paddingBottom: spacing.sm,
      }}
    >
      {children}
    </Text>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
function Settings() {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(theme.mode === 'dark');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const loadPrefs = useCallback(async () => {
    const [lang, cur, notifActive] = await Promise.all([
      getLanguage(),
      getCurrency(),
      isDailyReminderScheduled(),
    ]);
    setSelectedLanguage(lang ?? 'en');
    setSelectedCurrency(cur ?? 'USD');
    setIsNotificationsEnabled(notifActive);
  }, []);

  useEffect(() => { loadPrefs(); }, [loadPrefs]);

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(t('notifications'), 'Please grant notification permission in your device settings.');
        return;
      }
      await scheduleDailyReminder('Cashilo 💰', "Don't forget to log your expenses today!");
    } else {
      await cancelDailyReminder();
    }
    setIsNotificationsEnabled(value);
  };

  const handleToggleTheme = () => {
    setIsDarkModeEnabled((v) => !v);
    theme.toggleTheme();
  };

  const handleLanguageChange = async (code: Language) => {
    setSelectedLanguage(code);
    await saveLanguage(code);
    i18n.changeLanguage(code);
    const shouldBeRTL = code === 'ar';
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.forceRTL(shouldBeRTL);
      try {
        await Updates.reloadAsync();
      } catch {
        Alert.alert(t('language'), t('restartForRTL'));
      }
    }
  };

  const handleCurrencyChange = async (code: string) => {
    setSelectedCurrency(code);
    await saveCurrency(code);
  };

  const handleClearData = () => {
    Alert.alert(t('deleteConfirmTitle'), t('deleteConfirmContent'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          await clearAllData();
          Alert.alert('', t('allDataCleared'));
        },
      },
    ]);
  };

  const handleExport = async () => {
    try {
      await exportData();
    } catch (e: any) {
      if (e?.message !== 'cancelled') {
        Alert.alert('', t('importError'));
      }
    }
  };

  const handleImport = () => {
    Alert.alert(t('importModeTitle'), '', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('importMerge'),
        onPress: () => runImport('merge'),
      },
      {
        text: t('importReplace'),
        style: 'destructive',
        onPress: () => runImport('replace'),
      },
    ]);
  };

  const runImport = async (mode: ImportMode) => {
    try {
      const result = await importData(mode);
      Alert.alert('', t('importSuccess', { transactions: result.transactions, goals: result.goals }));
    } catch (e: any) {
      if (e?.message !== 'cancelled') {
        Alert.alert('', t('importError'));
      }
    }
  };

  const selectedCurrencyObj = CURRENCIES.find((c) => c.code === selectedCurrency);
  const selectedLangObj = LANGUAGES.find((l) => l.code === selectedLanguage);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{
        paddingHorizontal: spacing.lg,
        paddingBottom: insets.bottom + spacing.xxxl,
      }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      {/* Page title */}
      <View style={{ paddingTop: insets.top + spacing.md, marginBottom: spacing.lg }}>
        <Text style={{ color: theme.headline, ...typography.display }}>
          {t('settings')}
        </Text>
      </View>

      {/* ── APPEARANCE ── */}
      <SectionLabel>{t('appearance')}</SectionLabel>
      <SettingsCard>
        <SettingsRow
          icon="dark-mode"
          iconColor="#5E5CE6"
          label={t('enableDarkMode')}
          subtitle={isDarkModeEnabled ? t('themeDark') : t('themeLight')}
          divider={false}
          trailing={
            <Switch
              value={isDarkModeEnabled}
              onValueChange={handleToggleTheme}
              trackColor={{ false: withAlpha(theme.primaryText, 0.15), true: theme.primary }}
              thumbColor="#fff"
            />
          }
        />
      </SettingsCard>

      {/* ── NOTIFICATIONS ── */}
      <SectionLabel>{t('notifications')}</SectionLabel>
      <SettingsCard>
        <SettingsRow
          icon="notifications"
          iconColor="#FF9500"
          label={t('enableNotifications')}
          subtitle={isNotificationsEnabled ? t('notifOn') : t('notifOff')}
          divider={false}
          trailing={
            <Switch
              value={isNotificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: withAlpha(theme.primaryText, 0.15), true: theme.primary }}
              thumbColor="#fff"
            />
          }
        />
      </SettingsCard>

      {/* ── LANGUAGE ── */}
      <SectionLabel>{t('language')}</SectionLabel>
      <SettingsCard>
        {LANGUAGES.map((lang, i) => (
          <SettingsRow
            key={lang.code}
            icon="language"
            iconColor="#007AFF"
            label={lang.label}
            divider={i < LANGUAGES.length - 1}
            onPress={() => handleLanguageChange(lang.code)}
            trailing={
              selectedLanguage === lang.code ? (
                <MaterialIcons name="check-circle" size={22} color={theme.primary} />
              ) : (
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: radius.pill,
                    borderWidth: 1.5,
                    borderColor: withAlpha(theme.primaryText, 0.2),
                  }}
                />
              )
            }
          />
        ))}
      </SettingsCard>

      {/* ── CURRENCY ── */}
      <SectionLabel>{t('currency')}</SectionLabel>
      <SettingsCard>
        {CURRENCIES.map((cur, i) => (
          <SettingsRow
            key={cur.code}
            icon="attach-money"
            iconColor="#34C759"
            label={t(cur.i18nKey)}
            subtitle={cur.code}
            divider={i < CURRENCIES.length - 1}
            onPress={() => handleCurrencyChange(cur.code)}
            trailing={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <View
                  style={{
                    backgroundColor: withAlpha(theme.primary, 0.1),
                    borderRadius: radius.sm,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 3,
                  }}
                >
                  <Text style={{ color: theme.primary, ...typography.label }}>{cur.symbol}</Text>
                </View>
                {selectedCurrency === cur.code
                  ? <MaterialIcons name="check-circle" size={22} color={theme.primary} />
                  : <View style={{ width: 22, height: 22, borderRadius: radius.pill, borderWidth: 1.5, borderColor: withAlpha(theme.primaryText, 0.2) }} />
                }
              </View>
            }
          />
        ))}
      </SettingsCard>

      {/* ── DATA ── */}
      <SectionLabel>{t('data')}</SectionLabel>
      <SettingsCard>
        <SettingsRow
          icon="upload"
          iconColor="#5856D6"
          label={t('exportData')}
          subtitle={t('exportSubtitle')}
          onPress={handleExport}
        />
        <SettingsRow
          icon="download"
          iconColor="#34AADC"
          label={t('importData')}
          subtitle={t('importSubtitle')}
          onPress={handleImport}
        />
        <SettingsRow
          icon="delete-outline"
          iconColor="#FF3B30"
          label={t('clearAllData')}
          subtitle={t('clearDataSubtitle')}
          divider={false}
          destructive
          onPress={handleClearData}
          trailing={<MaterialIcons name="chevron-right" size={20} color={withAlpha('#FF3B30', 0.5)} />}
        />
      </SettingsCard>

      {/* ── ABOUT ── */}
      <SectionLabel>{t('about')}</SectionLabel>
      <SettingsCard>
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.lg,
          }}
        >
          {/* App icon placeholder */}
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: radius.md,
              backgroundColor: theme.primary,
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 184, 217, 0.35)',
            }}
          >
            <MaterialIcons name="account-balance-wallet" size={28} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.headline, ...typography.heading }}>Cashilo</Text>
            <Text style={{ color: withAlpha(theme.primaryText, 0.5), ...typography.caption, marginTop: 2 }}>
              Version 1.0.0
            </Text>
            <Text style={{ color: withAlpha(theme.primaryText, 0.6), ...typography.caption, marginTop: spacing.sm, lineHeight: 17 }}>
              {t('aboutDescription')}
            </Text>
          </View>
        </View>
      </SettingsCard>
    </ScrollView>
  );
}

export default Settings;
