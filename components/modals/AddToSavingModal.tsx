import { useAppTheme } from '@/contexts/ThemeContext';
import { Goal } from '@/model/Goal';
import { Transaction } from '@/model/Transaction';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Props = {
  visible: boolean;
  balance: number;
  activeGoals: Goal[];
  onClose: () => void;
  onSave: (transactions: Omit<Transaction, 'id'>[], updatedGoals: Goal[]) => void;
  currency?: string;
};

const AddToSavingModal: React.FC<Props> = ({
  visible,
  balance,
  activeGoals,
  onClose,
  onSave,
  currency = '$',
}) => {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const [mode, setMode] = useState<'all' | 'single'>('all');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [amount, setAmount] = useState('');

  const handleSave = () => {
    const value = parseFloat(amount);
    if (!value || value <= 0 || value > balance) {
      Alert.alert('', `Amount must be between 0 and ${currency}${balance.toFixed(2)}`);
      return;
    }

    const transactions: Omit<Transaction, 'id'>[] = [];
    const updatedGoals: Goal[] = [];
    const now = new Date();

    if (mode === 'single') {
      const goal = activeGoals.find((g) => g.id === selectedGoalId);
      if (!goal) {
        Alert.alert('', 'Please select a goal.');
        return;
      }
      const remaining = goal.targetAmount - goal.savedAmount;
      const toSave = Math.min(value, remaining);
      if (toSave > 0) {
        transactions.push({
          type: 'Expense',
          amount: toSave,
          category: 'Saving',
          date: now,
          note: `Transfer to saving for ${goal.name}`,
        });
        updatedGoals.push({ ...goal, savedAmount: goal.savedAmount + toSave });
      }
    } else {
      // Distribute proportionally
      const portions: number[] = activeGoals.map((g) => {
        let p = g.targetAmount;
        if (g.startDate && g.endDate) {
          const days =
            (new Date(g.endDate).getTime() - new Date(g.startDate).getTime()) /
            (1000 * 60 * 60 * 24);
          if (days <= 8) p = g.targetAmount * 4.345;
          else if (days <= 32) p = g.targetAmount;
          else if (days <= 95) p = g.targetAmount / 3.0;
          else if (days <= 190) p = g.targetAmount / 6.0;
          else p = g.targetAmount / 12.0;
        }
        const remaining = g.targetAmount - g.savedAmount;
        return Math.min(p, remaining);
      });
      const totalPortion = portions.reduce((s, p) => s + p, 0);
      let remaining = value;
      activeGoals.forEach((g, i) => {
        if (portions[i] === 0 || totalPortion === 0) return;
        let alloc = (portions[i] / totalPortion) * value;
        alloc = Math.min(alloc, g.targetAmount - g.savedAmount, remaining);
        if (alloc > 0) {
          transactions.push({
            type: 'Expense',
            amount: alloc,
            category: 'Saving',
            date: now,
            note: `Transfer to saving for ${g.name}`,
          });
          updatedGoals.push({ ...g, savedAmount: g.savedAmount + alloc });
          remaining -= alloc;
        }
      });
    }

    onSave(transactions, updatedGoals);
    setAmount('');
    setMode('all');
    setSelectedGoalId('');
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
          <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 20, marginBottom: 16 }}>
            {t('addToSaving')}
          </Text>

          {/* Mode Selector */}
          <TouchableOpacity
            onPress={() => setMode('all')}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: theme.primary,
                backgroundColor: mode === 'all' ? theme.primary : 'transparent',
                marginRight: 10,
              }}
            />
            <Text style={{ color: theme.primaryText }}>{t('dGoals')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('single')}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: theme.primary,
                backgroundColor: mode === 'single' ? theme.primary : 'transparent',
                marginRight: 10,
              }}
            />
            <Text style={{ color: theme.primaryText }}>{t('sGoal')}</Text>
          </TouchableOpacity>

          {/* Goal picker */}
          {mode === 'single' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 14 }}
              contentContainerStyle={{ gap: 8 }}
            >
              {activeGoals.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => setSelectedGoalId(g.id)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: selectedGoalId === g.id ? theme.primary : `${theme.primaryText}33`,
                    backgroundColor: selectedGoalId === g.id ? `${theme.primary}1A` : theme.card,
                  }}
                >
                  <Text style={{ color: selectedGoalId === g.id ? theme.primary : theme.primaryText }}>
                    {g.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Amount */}
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder={t('amountWithMax', { max: balance.toFixed(2) })}
            placeholderTextColor={`${theme.primaryText}66`}
            style={{
              borderWidth: 1.5,
              borderColor: `${theme.primary}55`,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: Platform.OS === 'ios' ? 14 : 10,
              color: theme.primaryText,
              backgroundColor: theme.card,
              fontSize: 15,
              marginBottom: 20,
            }}
          />

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

export default AddToSavingModal;
