import ListTile from '@/components/ListTile';
import { useAppTheme } from '@/contexts/ThemeContext';
import i18n from '@/i18n';
import {
    clearAllData,
    getCurrency,
    getLanguage,
    setCurrency as saveCurrency,
    setLanguage as saveLanguage,
} from '@/storage';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Octicons from '@expo/vector-icons/Octicons';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Switch } from 'react-native-paper';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD – US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR – Euro' },
  { code: 'SAR', symbol: '﷼', label: 'SAR – Saudi Riyal' },
  { code: 'EGP', symbol: 'E£', label: 'EGP – Egyptian Pound' },
  { code: 'BHD', symbol: 'BD', label: 'BHD – Bahraini Dinar' },
];

function Settings() {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(theme.mode === 'dark');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const loadPrefs = useCallback(async () => {
    const [lang, cur] = await Promise.all([getLanguage(), getCurrency()]);
    setSelectedLanguage(lang ?? 'en');
    setSelectedCurrency(cur ?? 'USD');
  }, []);

  useEffect(() => { loadPrefs(); }, [loadPrefs]);

  const handleToggleTheme = () => {
    setIsDarkModeEnabled((v) => !v);
    theme.toggleTheme();
  };

  const handleLanguageChange = async (code: string) => {
    setSelectedLanguage(code);
    await saveLanguage(code);
    i18n.changeLanguage(code);
  };

  const handleCurrencyChange = async (code: string) => {
    setSelectedCurrency(code);
    await saveCurrency(code);
  };

  const handleClearData = () => {
    Alert.alert(
      t('deleteConfirmTitle'),
      t('deleteConfirmContent'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('', t('allDataCleared'));
          },
        },
      ],
    );
  };

  const cardStyle = {
    backgroundColor: theme.card,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden' as const,
  };

  const sectionTitle = { color: theme.primaryText, fontSize: 13, fontWeight: '600' as const, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6, opacity: 0.6 };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={{ color: theme.headline, fontWeight: 'bold', fontSize: 24, marginBottom: 20 }}>
        {t('settings')}
      </Text>

      {/* APPEARANCE */}
      <Text style={sectionTitle}>{t('appearance')}</Text>
      <View style={cardStyle}>
        <ListTile
          title={t('enableDarkMode')}
          leading={<AntDesign name="moon" size={22} color={theme.primaryText} />}
          trailing={<Switch color={theme.primary} value={isDarkModeEnabled} onValueChange={handleToggleTheme} />}
        />
      </View>

      {/* NOTIFICATIONS */}
      <Text style={sectionTitle}>{t('notifications')}</Text>
      <View style={cardStyle}>
        <ListTile
          title={t('enableNotifications')}
          leading={<Octicons name="bell" size={22} color={theme.primaryText} />}
          trailing={<Switch color={theme.primary} value={isNotificationsEnabled} onValueChange={setIsNotificationsEnabled} />}
        />
      </View>

      {/* LANGUAGE */}
      <Text style={sectionTitle}>{t('language')}</Text>
      <View style={cardStyle}>
        {LANGUAGES.map((lang, i) => (
          <TouchableOpacity
            key={lang.code}
            onPress={() => handleLanguageChange(lang.code)}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: 16, paddingVertical: 14,
              borderTopWidth: i > 0 ? 1 : 0,
              borderTopColor: `${theme.primaryText}15`,
            }}
          >
            <Text style={{ color: theme.primaryText, fontSize: 15 }}>{lang.label}</Text>
            {selectedLanguage === lang.code && (
              <MaterialIcons name="check-circle" size={22} color={theme.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* CURRENCY */}
      <Text style={sectionTitle}>{t('currency')}</Text>
      <View style={cardStyle}>
        {CURRENCIES.map((cur, i) => (
          <TouchableOpacity
            key={cur.code}
            onPress={() => handleCurrencyChange(cur.code)}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: 16, paddingVertical: 14,
              borderTopWidth: i > 0 ? 1 : 0,
              borderTopColor: `${theme.primaryText}15`,
            }}
          >
            <Text style={{ color: theme.primaryText, fontSize: 15 }}>{cur.label}</Text>
            {selectedCurrency === cur.code && (
              <MaterialIcons name="check-circle" size={22} color={theme.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* DATA */}
      <Text style={sectionTitle}>{t('data')}</Text>
      <View style={cardStyle}>
        <TouchableOpacity
          onPress={handleClearData}
          style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14 }}
        >
          <MaterialIcons name="delete-outline" size={22} color={theme.error} />
          <Text style={{ color: theme.error, fontSize: 15, fontWeight: '500' }}>{t('clearAllData')}</Text>
        </TouchableOpacity>
      </View>

      {/* ABOUT */}
      <Text style={sectionTitle}>{t('about')}</Text>
      <View style={cardStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14 }}>
          <MaterialIcons name="info-outline" size={22} color={theme.primary} />
          <Text style={{ color: theme.primaryText, fontSize: 14, flex: 1, lineHeight: 20 }}>
            {t('aboutDescription')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

export default Settings;
