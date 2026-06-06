import { radius, shadow, spacing, typography, withAlpha } from '@/contants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';
import { setOnboardingComplete } from '@/storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_W } = Dimensions.get('window');

type Slide = {
  icon: keyof typeof MaterialIcons.glyphMap;
  titleKey: string;
  bodyKey: string;
};

const SLIDES: Slide[] = [
  { icon: 'account-balance-wallet', titleKey: 'onbTrackTitle', bodyKey: 'onbTrackBody' },
  { icon: 'savings', titleKey: 'onbGoalsTitle', bodyKey: 'onbGoalsBody' },
  { icon: 'bar-chart', titleKey: 'onbReportsTitle', bodyKey: 'onbReportsBody' },
];

export default function Onboarding() {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;

  const finish = async () => {
    await setOnboardingComplete();
    router.replace('/(tabs)/Dashboard');
  };

  const goNext = () => {
    if (isLast) {
      finish();
      return;
    }
    const next = index + 1;
    scrollRef.current?.scrollTo({ x: next * SCREEN_W, animated: true });
    setIndex(next);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (i !== index) setIndex(i);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Skip */}
      <View style={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.xl, alignItems: 'flex-end' }}>
        <TouchableOpacity onPress={finish} hitSlop={12}>
          <Text style={{ color: theme.primaryText, ...typography.label, opacity: 0.6 }}>{t('onbSkip')}</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide) => (
          <View
            key={slide.titleKey}
            style={{ width: SCREEN_W, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxxl }}
          >
            <View
              style={{
                width: 132,
                height: 132,
                borderRadius: radius.pill,
                backgroundColor: withAlpha(theme.primary, 0.12),
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.xxxl,
                ...shadow.md,
                shadowColor: theme.primary,
              }}
            >
              <MaterialIcons name={slide.icon} size={60} color={theme.primary} />
            </View>
            <Text
              style={{ color: theme.headline, ...typography.title, textAlign: 'center', marginBottom: spacing.md }}
            >
              {t(slide.titleKey)}
            </Text>
            <Text
              style={{ color: theme.primaryText, ...typography.body, textAlign: 'center', opacity: 0.75 }}
            >
              {t(slide.bodyKey)}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Footer: dots + CTA */}
      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + spacing.xl }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.xl }}>
          {SLIDES.map((s, i) => (
            <View
              key={s.titleKey}
              style={{
                height: 8,
                width: i === index ? 22 : 8,
                borderRadius: radius.pill,
                backgroundColor: i === index ? theme.primary : withAlpha(theme.primary, 0.25),
              }}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={goNext}
          activeOpacity={0.85}
          style={{
            backgroundColor: theme.primary,
            borderRadius: radius.lg,
            paddingVertical: spacing.lg,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: spacing.sm,
            ...shadow.md,
            shadowColor: theme.primary,
          }}
        >
          <Text style={{ color: '#fff', ...typography.heading }}>
            {isLast ? t('onbGetStarted') : t('onbNext')}
          </Text>
          <MaterialIcons name={isLast ? 'check' : 'arrow-forward'} size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
