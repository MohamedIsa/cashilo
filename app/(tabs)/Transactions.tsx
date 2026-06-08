import AddTransactionModal from '@/components/modals/AddTransactionModal';
import EditTransactionModal from '@/components/modals/EditTransactionModal';
import TransactionTile from '@/components/TransactionTile';
import { radius, spacing, typography, withAlpha } from '@/contants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Transaction } from '@/model/Transaction';
import {
    addTransaction,
    deleteTransaction,
    getCurrency,
    getTransactions,
    updateTransaction,
} from '@/storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    FlatList,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FILTER_TYPES = ['All', 'Income', 'Expense'] as const;
type FilterType = (typeof FILTER_TYPES)[number];

function Transactions() {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currency, setCurrencySymbol] = useState('$');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<FilterType>('All');
  const [addVisible, setAddVisible] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);

  const loadData = useCallback(async () => {
    const [txs, cur] = await Promise.all([getTransactions(), getCurrency()]);
    const symbols: Record<string, string> = { USD: '$', EUR: '€', SAR: '﷼', EGP: 'E£', BHD: 'BD' };
    setTransactions(txs);
    setCurrencySymbol(symbols[cur] ?? '$');
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = transactions
    .filter((tx) => {
      const matchType = selectedType === 'All' || tx.type === selectedType;
      const matchSearch =
        !searchQuery ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.note.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAdd = async (tx: Omit<Transaction, 'id'>) => {
    await addTransaction({ ...tx, id: Date.now().toString() });
    loadData();
  };

  const handleEdit = async (tx: Transaction) => {
    await updateTransaction(tx);
    setEditTransaction(null);
    loadData();
  };

  const handleDelete = (id: string) => {
    Alert.alert(t('deleteConfirmTitle'), t('deleteConfirmContent'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(id);
          loadData();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + 80,
          gap: 0,
        }}
        ListHeaderComponent={
          <View style={{ paddingTop: insets.top + spacing.md }}>
            {/* Page title */}
            <Text style={{ color: theme.headline, ...typography.display, marginBottom: spacing.xl }}>
              {t('transactions')}
            </Text>

            {/* Search bar */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.card,
                borderRadius: radius.md,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                marginBottom: spacing.sm,
              }}
            >
              <MaterialIcons name="search" size={20} color={withAlpha(theme.primaryText, 0.45)} style={{ marginRight: spacing.sm }} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t('searchTransaction')}
                placeholderTextColor={withAlpha(theme.primaryText, 0.4)}
                style={{ flex: 1, color: theme.primaryText, ...typography.body }}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
                  <MaterialIcons name="close" size={18} color={withAlpha(theme.primaryText, 0.45)} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Filter chips */}
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
              {FILTER_TYPES.map((tp) => {
                const active = selectedType === tp;
                return (
                  <Pressable
                    key={tp}
                    onPress={() => setSelectedType(tp)}
                    style={{
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.sm,
                      borderRadius: radius.pill,
                      backgroundColor: active ? theme.primary : theme.card,
                      borderWidth: 1.5,
                      borderColor: active ? theme.primary : withAlpha(theme.primaryText, 0.12),
                    }}
                  >
                    <Text style={{ color: active ? '#fff' : theme.primaryText, ...typography.label }}>
                      {tp === 'All' ? t('all') : tp === 'Income' ? t('income') : t('expense')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <MaterialIcons name="receipt-long" size={64} color={withAlpha(theme.primaryText, 0.2)} />
            <Text style={{ color: theme.primaryText, ...typography.body, marginTop: spacing.md, opacity: 0.6 }}>
              {t('noTransactions')}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View>
            <TransactionTile transaction={item} currency={currency} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginBottom: spacing.xs }}>
              <TouchableOpacity
                onPress={() => setEditTransaction(item)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}
              >
                <MaterialIcons name="edit" size={15} color={theme.primary} />
                <Text style={{ color: theme.primary, ...typography.caption, fontWeight: '600' }}>{t('editTransaction')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}
              >
                <MaterialIcons name="delete-outline" size={15} color={theme.error} />
                <Text style={{ color: theme.error, ...typography.caption, fontWeight: '600' }}>{t('delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setAddVisible(true)}
        activeOpacity={0.85}
        style={{
          position: 'absolute',
          bottom: insets.bottom + spacing.xl,
          right: spacing.xl,
          width: 56,
          height: 56,
          borderRadius: radius.pill,
          backgroundColor: theme.primary,
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 6px 20px rgba(0, 184, 217, 0.40)',
        }}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <AddTransactionModal visible={addVisible} onClose={() => setAddVisible(false)} onAdd={handleAdd} />
      <EditTransactionModal visible={!!editTransaction} transaction={editTransaction} onClose={() => setEditTransaction(null)} onSave={handleEdit} />
    </View>
  );
}

export default Transactions;
