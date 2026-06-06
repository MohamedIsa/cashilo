import { useAppTheme } from '@/contexts/ThemeContext';
import { Goal } from '@/model/Goal';
import { Transaction } from '@/model/Transaction';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
  goalsWithSavings: Goal[];
  onClose: () => void;
  onSave: (transactions: Omit<Transaction, 'id'>[], updatedGoals: Goal[]) => void;
  currency?: string;
};

const WithdrawFromSavingModal: React.FC<Props> = ({
  visible,
  goalsWithSavings,
  onClose,
  onSave,
  currency = '$',
}) => {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const [withdrawFromAll, setWithdrawFromAll] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [amount, setAmount] = useState('');

  const totalSaved = goalsWithSavings.reduce((s, g) => s + g.savedAmount, 0);
  const selectedGoal = goalsWithSavings.find((g) => g.id === selectedGoalId);
  const maxAmount = withdrawFromAll ? totalSaved : (selectedGoal?.savedAmount ?? 0);

  const handleSave = () => {
    const value = parseFloat(amount);
    if (!value || value <= 0 || value > maxAmount) {
      Alert.alert('', `Amount must be between 0 and ${currency}${maxAmount.toFixed(2)}`);
      return;
    }

    const transactions: Omit<Transaction, 'id'>[] = [];
    const updatedGoals: Goal[] = [];
    const now = new Date();

    if (withdrawFromAll) {
      let remaining = value;
      const total = goalsWithSavings.reduce((s, g) => s + g.savedAmount, 0);
      for (const g of goalsWithSavings) {
        if (remaining <= 0) break;
        const portion = g.savedAmount / total;
        let take = Math.min(portion * value, g.savedAmount, remaining);
        if (take > 0) {
          transactions.push({
            type: 'Income',
            amount: take,
            category: 'From Saving',
            date: now,
            note: `Withdraw from saving for ${g.name}`,
          });
          updatedGoals.push({ ...g, savedAmount: g.savedAmount - take });
          remaining -= take;
        }
      }
    } else if (selectedGoal) {
      transactions.push({
        type: 'Income',
        amount: value,
        category: 'From Saving',
        date: now,
        note: `Withdraw from saving for ${selectedGoal.name}`,
      });
      updatedGoals.push({ ...selectedGoal, savedAmount: selectedGoal.savedAmount - value });
    } else {
      Alert.alert('', 'Please select a goal.');
      return;
    }

    onSave(transactions, updatedGoals);
    setAmount('');
    setWithdrawFromAll(false);
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
            {t('withDraw')}
          </Text>

          {/* Withdraw from all */}
          <TouchableOpacity
            onPress={() => setWithdrawFromAll(!withdrawFromAll)}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: theme.primary,
                backgroundColor: withdrawFromAll ? theme.primary : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}
            >
              {withdrawFromAll && <MaterialIcons name="check" size={14} color="#fff" />}
            </View>
            <Text style={{ color: theme.primaryText }}>{t('withdrawFromAll')}</Text>
          </TouchableOpacity>

          {/* Goal picker */}
          {!withdrawFromAll && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 14 }}
              contentContainerStyle={{ gap: 8 }}
            >
              {goalsWithSavings.map((g) => (
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
                    {g.name} ({currency}{g.savedAmount.toFixed(2)})
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
            placeholder={t('amountWithMax', { max: maxAmount.toFixed(2) })}
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
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{t('withdraw')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default WithdrawFromSavingModal;
