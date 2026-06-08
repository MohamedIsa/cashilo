import { useAppTheme } from '@/contexts/ThemeContext';
import { calculateEndDate } from '@/utils/goalUtils';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, targetAmount: number, startDate: Date, endDate: Date) => void;
};

const PERIODS: { key: string; i18nKey: string }[] = [
  { key: '1 Month',   i18nKey: 'period1Month'  },
  { key: '3 Months',  i18nKey: 'period3Months' },
  { key: '6 Months',  i18nKey: 'period6Months' },
  { key: '1 Year',    i18nKey: 'period1Year'   },
];

const AddGoalModal: React.FC<Props> = ({ visible, onClose, onAdd }) => {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [period, setPeriod] = useState(PERIODS[0].key);

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert('', t('enterGoalName'));
      return;
    }
    const parsed = parseFloat(targetAmount);
    if (!parsed || parsed <= 0) {
      Alert.alert('', t('enterValidAmount'));
      return;
    }
    const startDate = new Date();
    const endDate = calculateEndDate(period);
    onAdd(name.trim(), parsed, startDate, endDate);
    setName('');
    setTargetAmount('');
    setPeriod(PERIODS[0].key);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'center', alignItems: 'center' }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: theme.background,
            borderRadius: 18,
            padding: 24,
            width: '90%',
          }}
          onPress={() => {}}
        >
          <Text style={{ color: theme.headline, fontWeight: 'bold', fontSize: 20, marginBottom: 20 }}>
            {t('addGoal')}
          </Text>

          {/* Goal Name */}
          <Text style={labelStyle(theme)}>{t('goalName')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('goalNamePlaceholder')}
            placeholderTextColor={`${theme.primaryText}66`}
            style={inputStyle(theme)}
          />

          {/* Target Amount */}
          <Text style={labelStyle(theme)}>{t('targetAmount')}</Text>
          <TextInput
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={`${theme.primaryText}66`}
            style={inputStyle(theme)}
          />

          {/* Period */}
          <Text style={labelStyle(theme)}>{t('period')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {PERIODS.map((p) => (
              <TouchableOpacity
                key={p.key}
                onPress={() => setPeriod(p.key)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: period === p.key ? theme.primary : `${theme.primaryText}33`,
                  backgroundColor: period === p.key ? `${theme.primary}1A` : theme.card,
                }}
              >
                <Text style={{ color: period === p.key ? theme.primary : theme.primaryText, fontSize: 13, fontWeight: '600' }}>
                  {t(p.i18nKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Actions */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 16 }}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAdd}
              style={{
                backgroundColor: theme.primary,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{t('add')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const labelStyle = (theme: any) => ({
  color: theme.primaryText,
  fontSize: 13,
  fontWeight: '600' as const,
  marginBottom: 6,
});

const inputStyle = (theme: any) => ({
  borderWidth: 1.5,
  borderColor: `${theme.primary}55`,
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  color: theme.primaryText,
  backgroundColor: theme.card,
  fontSize: 15,
  marginBottom: 14,
});

export default AddGoalModal;
