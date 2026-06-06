import { useAppTheme } from '@/contexts/ThemeContext';
import { Transaction } from '@/model/Transaction';
import { EXPENSE_CATEGORIES_EN, INCOME_CATEGORIES_EN } from '@/utils/categories';
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
  onClose: () => void;
  onAdd: (tx: Omit<Transaction, 'id'>) => void;
};

const AddTransactionModal: React.FC<Props> = ({ visible, onClose, onAdd }) => {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const incomeCategories: string[] = t('incomeCategories', { returnObjects: true }) as string[];
  const expenseCategories: string[] = t('expenseCategories', { returnObjects: true }) as string[];

  const [type, setType] = useState<'Income' | 'Expense'>('Income');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const displayCategories = type === 'Income' ? incomeCategories : expenseCategories;
  const englishCategories = type === 'Income' ? INCOME_CATEGORIES_EN : EXPENSE_CATEGORIES_EN;

  const handleAdd = () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('', t('enterValidAmount'));
      return;
    }
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      Alert.alert('', 'Please enter a valid date (YYYY-MM-DD).');
      return;
    }
    onAdd({
      type,
      amount: parsedAmount,
      category: englishCategories[categoryIndex] ?? displayCategories[categoryIndex] ?? '',
      date: parsedDate,
      note,
    });
    setAmount('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setType('Income');
    setCategoryIndex(0);
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
            maxHeight: '85%',
          }}
          onPress={() => {}}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Icon + Title */}
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <MaterialIcons
                name={type === 'Income' ? 'attach-money' : 'money-off'}
                size={40}
                color={type === 'Income' ? theme.secondary : theme.error}
              />
              <Text style={{ color: theme.headline, fontWeight: 'bold', fontSize: 18, marginTop: 8 }}>
                {t('addTransaction')}
              </Text>
            </View>

            {/* Type Selector */}
            <Text style={labelStyle(theme)}>{t('type')}</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
              {(['Income', 'Expense'] as const).map((tp) => (
                <TouchableOpacity
                  key={tp}
                  onPress={() => { setType(tp); setCategoryIndex(0); }}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: type === tp ? theme.primary : `${theme.primaryText}33`,
                    backgroundColor: type === tp ? `${theme.primary}1A` : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: type === tp ? theme.primary : theme.primaryText, fontWeight: '600' }}>
                    {tp === 'Income' ? t('income') : t('expense')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category */}
            <Text style={labelStyle(theme)}>{t('category')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 14 }}
              contentContainerStyle={{ gap: 8 }}
            >
              {displayCategories.map((cat, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setCategoryIndex(idx)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: categoryIndex === idx ? theme.primary : `${theme.primaryText}33`,
                    backgroundColor: categoryIndex === idx ? `${theme.primary}1A` : 'transparent',
                  }}
                >
                  <Text style={{ color: categoryIndex === idx ? theme.primary : theme.primaryText, fontSize: 13 }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Amount */}
            <Text style={labelStyle(theme)}>{t('amount')}</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={`${theme.primaryText}66`}
              style={inputStyle(theme)}
            />

            {/* Date */}
            <Text style={labelStyle(theme)}>{t('pickDate')}</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={`${theme.primaryText}66`}
              style={inputStyle(theme)}
            />

            {/* Note */}
            <Text style={labelStyle(theme)}>Note</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Optional note..."
              placeholderTextColor={`${theme.primaryText}66`}
              style={[inputStyle(theme), { marginBottom: 20 }]}
            />

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
          </ScrollView>
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
  backgroundColor: `${theme.card}`,
  fontSize: 15,
  marginBottom: 14,
});

export default AddTransactionModal;
