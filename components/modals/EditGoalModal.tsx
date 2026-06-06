import { useAppTheme } from '@/contexts/ThemeContext';
import { Goal } from '@/model/Goal';
import { calculateEndDate } from '@/utils/goalUtils';
import React, { useEffect, useState } from 'react';
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
  goal: Goal | null;
  onClose: () => void;
  onSave: (updated: Goal) => void;
};

const PERIODS = ['1 Month', '3 Months', '6 Months', '1 Year'];

const EditGoalModal: React.FC<Props> = ({ visible, goal, onClose, onSave }) => {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [period, setPeriod] = useState('1 Month');

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(goal.targetAmount.toString());
    }
  }, [goal]);

  const handleSave = () => {
    if (!goal) return;
    if (!name.trim()) {
      Alert.alert('', 'Please enter a goal name.');
      return;
    }
    const parsed = parseFloat(targetAmount);
    if (!parsed || parsed <= 0) {
      Alert.alert('', t('enterValidAmount'));
      return;
    }
    const startDate = goal.startDate ?? new Date();
    const endDate = calculateEndDate(period);
    onSave({ ...goal, name: name.trim(), targetAmount: parsed, startDate, endDate });
    onClose();
  };

  if (!goal) return null;

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
            {t('editGoal')}
          </Text>

          {/* Goal Name */}
          <Text style={labelStyle(theme)}>{t('goalName')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholderTextColor={`${theme.primaryText}66`}
            style={inputStyle(theme)}
          />

          {/* Target Amount */}
          <Text style={labelStyle(theme)}>{t('targetAmount')}</Text>
          <TextInput
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="decimal-pad"
            placeholderTextColor={`${theme.primaryText}66`}
            style={inputStyle(theme)}
          />

          {/* Period */}
          <Text style={labelStyle(theme)}>{t('period')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {PERIODS.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: period === p ? theme.primary : `${theme.primaryText}33`,
                  backgroundColor: period === p ? `${theme.primary}1A` : theme.card,
                }}
              >
                <Text style={{ color: period === p ? theme.primary : theme.primaryText, fontSize: 13, fontWeight: '600' }}>
                  {p}
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
              onPress={handleSave}
              style={{
                backgroundColor: theme.primary,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{t('saveButton')}</Text>
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

export default EditGoalModal;
