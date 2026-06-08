import { radius, shadow, spacing, typography } from '@/contants/theme';
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
        borderRadius: radius.md,
        marginVertical: spacing.xs,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        ...shadow.sm,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.pill,
          backgroundColor: `${isIncome ? theme.secondary : theme.error}1A`,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: spacing.md,
        }}
      >
        <MaterialIcons
          name={isIncome ? 'arrow-downward' : 'arrow-upward'}
          size={20}
          color={isIncome ? theme.secondary : theme.error}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.primaryText, ...typography.label }} numberOfLines={1}>
          {localizedCategory}
        </Text>
        <Text style={{ color: theme.primaryText, ...typography.caption, marginTop: 2, opacity: 0.65 }} numberOfLines={2}>
          {formatDate(transaction.date)}
          {transaction.note ? ` • ${transaction.note}` : ''}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
        <Text style={{ color: amountColor, ...typography.heading, fontVariant: ['tabular-nums'] }} selectable>
          {prefix}{currency}{Math.abs(transaction.amount).toFixed(2)}
        </Text>
        <View style={{ backgroundColor: chipBg, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 3 }}>
          <Text style={{ color: chipText, ...typography.caption, fontWeight: '600' }}>
            {isIncome ? t('income') : t('expense')}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TransactionTile;
