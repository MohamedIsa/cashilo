import { useAppTheme } from '@/contexts/ThemeContext';
import { Transaction } from '@/model/Transaction';
import { getLocalizedCategory } from '@/utils/categories';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

type TransactionTileProps = {
  transaction: Transaction;
  currency?: string;
};

function formatDate(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const TransactionTile: React.FC<TransactionTileProps> = ({ transaction, currency = '$' }) => {
  const theme = useAppTheme();
  const { t } = useTranslation();

  const isIncome = transaction.type === 'Income';
  const amountColor = isIncome ? theme.secondary : theme.error;
  const chipBg = isIncome ? `${theme.secondary}1F` : `${theme.error}1F`;
  const chipText = isIncome ? theme.secondary : theme.error;
  const prefix = isIncome ? '+' : '-';

  const incomeCategories: string[] = t('incomeCategories', { returnObjects: true }) as string[];
  const expenseCategories: string[] = t('expenseCategories', { returnObjects: true }) as string[];
  const localizedCategory = getLocalizedCategory(transaction.category, incomeCategories, expenseCategories);

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 14,
        marginHorizontal: 0,
        marginVertical: 6,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Leading icon */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: `${theme.primary}1A`,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}
      >
        <MaterialIcons
          name={isIncome ? 'arrow-downward' : 'arrow-upward'}
          size={20}
          color={theme.primary}
        />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text
          style={{ color: theme.primaryText, fontWeight: '600', fontSize: 15 }}
          numberOfLines={1}
        >
          {localizedCategory}
        </Text>
        <Text
          style={{ color: theme.primaryText, fontSize: 12, marginTop: 2, opacity: 0.7 }}
          numberOfLines={2}
        >
          {formatDate(transaction.date)}
          {transaction.note ? ` • ${transaction.note}` : ''}
        </Text>
      </View>

      {/* Trailing */}
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={{ color: amountColor, fontWeight: 'bold', fontSize: 16 }}>
          {prefix}{currency}{Math.abs(transaction.amount).toFixed(2)}
        </Text>
        <View
          style={{
            backgroundColor: chipBg,
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        >
          <Text style={{ color: chipText, fontSize: 11, fontWeight: '600' }}>
            {isIncome ? t('income') : t('expense')}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TransactionTile;
