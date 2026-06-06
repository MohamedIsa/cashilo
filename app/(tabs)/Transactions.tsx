import AddTransactionModal from '@/components/modals/AddTransactionModal';
import EditTransactionModal from '@/components/modals/EditTransactionModal';
import TransactionTile from '@/components/TransactionTile';
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
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const FILTER_TYPES = ['All', 'Income', 'Expense'] as const;
type FilterType = (typeof FILTER_TYPES)[number];

function Transactions() {
  const theme = useAppTheme();
  const { t } = useTranslation();

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
    Alert.alert(t('deleteConfirmTitle'), 'Are you sure you want to delete this transaction?', [
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
      {/* Title */}
      <Text style={{ color: theme.headline, fontWeight: 'bold', fontSize: 24, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        {t('transactions')}
      </Text>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: theme.card, borderRadius: 12,
          paddingHorizontal: 12, paddingVertical: 8,
        }}>
          <MaterialIcons name="search" size={20} color={`${theme.primaryText}66`} style={{ marginRight: 8 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('searchTransaction')}
            placeholderTextColor={`${theme.primaryText}66`}
            style={{ flex: 1, color: theme.primaryText, fontSize: 15 }}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={18} color={`${theme.primaryText}66`} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 }}>
        {FILTER_TYPES.map((tp) => (
          <TouchableOpacity
            key={tp}
            onPress={() => setSelectedType(tp)}
            style={{
              paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
              backgroundColor: selectedType === tp ? theme.primary : theme.card,
              borderWidth: 1.5,
              borderColor: selectedType === tp ? theme.primary : `${theme.primaryText}22`,
            }}
          >
            <Text style={{
              color: selectedType === tp ? '#fff' : theme.primaryText,
              fontWeight: '600', fontSize: 13,
            }}>
              {tp === 'All' ? t('all') : tp === 'Income' ? t('income') : t('expense')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <MaterialIcons name="receipt-long" size={64} color={`${theme.primaryText}33`} />
            <Text style={{ color: theme.primaryText, fontSize: 16, marginTop: 12 }}>
              {t('noTransactions')}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View>
            <TransactionTile transaction={item} currency={currency} />
            {/* Edit / Delete row */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 4 }}>
              <TouchableOpacity
                onPress={() => setEditTransaction(item)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 4 }}
              >
                <MaterialIcons name="edit" size={16} color={theme.primary} />
                <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '600' }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 4 }}
              >
                <MaterialIcons name="delete" size={16} color={theme.error} />
                <Text style={{ color: theme.error, fontSize: 12, fontWeight: '600' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setAddVisible(true)}
        style={{
          position: 'absolute', bottom: 24, right: 24,
          width: 56, height: 56, borderRadius: 28, backgroundColor: theme.primary,
          justifyContent: 'center', alignItems: 'center',
          shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
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
