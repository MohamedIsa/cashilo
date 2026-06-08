import AddToSavingModal from '@/components/modals/AddToSavingModal';
import AddTransactionModal from '@/components/modals/AddTransactionModal';
import WithdrawFromSavingModal from '@/components/modals/WithdrawFromSavingModal';
import TransactionTile from '@/components/TransactionTile';
import { radius, shadow, spacing, typography, withAlpha } from '@/contants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Goal } from '@/model/Goal';
import { Transaction } from '@/model/Transaction';
import {
    addTransaction,
    getCurrency,
    getGoals,
    getTransactions,
    updateGoal,
} from '@/storage';
import { calculateGoalSavings, getTotalPeriodSavingGoal } from '@/utils/goalUtils';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Octicons from '@expo/vector-icons/Octicons';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Dashboard() {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currency, setCurrencySymbol] = useState('$');
  const [showAll, setShowAll] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [addTxVisible, setAddTxVisible] = useState(false);
  const [addSavingVisible, setAddSavingVisible] = useState(false);
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const alertShownRef = useRef(false);

  const loadData = useCallback(async () => {
    const [txs, gs, cur] = await Promise.all([
      getTransactions(),
      getGoals(),
      getCurrency(),
    ]);
    setTransactions(txs);
    setGoals(gs);
    const symbols: Record<string, string> = { USD: '$', EUR: '€', SAR: '﷼', EGP: 'E£', BHD: 'BD' };
    setCurrencySymbol(symbols[cur] ?? '$');
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Today's transactions
  const today = new Date();
  const todayTxs = transactions.filter((tx) => {
    const d = new Date(tx.date);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  });

  const totalIncome = todayTxs
    .filter((tx) => tx.type === 'Income')
    .reduce((s, tx) => s + tx.amount, 0);
  const totalExpenses = todayTxs
    .filter((tx) => tx.type === 'Expense')
    .reduce((s, tx) => s + tx.amount, 0);
  const savings =
    todayTxs.filter((tx) => tx.category === 'Saving').reduce((s, tx) => s + tx.amount, 0) -
    todayTxs.filter((tx) => tx.category === 'From Saving').reduce((s, tx) => s + tx.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Monthly saving goal
  const savingGoal = getTotalPeriodSavingGoal(goals);
  const savingProgress = savingGoal === 0 ? 0 : Math.min(savings / savingGoal, 1);
  const remainingToCover = Math.max(savingGoal - savings, 0);
  const monthlyGoalReached = remainingToCover === 0 && savingGoal > 0;

  const activeGoals = goals.filter(
    (g) => !g.stopped && g.savedAmount < g.targetAmount && g.startDate && g.endDate,
  );
  const goalsWithSavings = goals.filter((g) => g.savedAmount > 0 && !g.stopped);

  // Monthly saving goal alert
  useEffect(() => {
    if (
      !alertDismissed &&
      !alertShownRef.current &&
      !monthlyGoalReached &&
      balance >= remainingToCover &&
      remainingToCover > 0
    ) {
      alertShownRef.current = true;
      Alert.alert(
        t('monthlySavingGoal'),
        t('savingGoalAlert', {
          balance: `${currency}${balance.toFixed(2)}`,
          goal: `${currency}${remainingToCover.toFixed(2)}`,
        }),
        [
          { text: t('cancel'), onPress: () => setAlertDismissed(true) },
          {
            text: t('approve'),
            onPress: async () => {
              setAlertDismissed(true);
              await calculateGoalSavings(activeGoals, remainingToCover);
              loadData();
            },
          },
        ],
      );
    }
  }, [balance, remainingToCover, monthlyGoalReached, alertDismissed]);

  const sortedTodayTxs = [...todayTxs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const displayedTxs = showAll ? sortedTodayTxs : sortedTodayTxs.slice(0, 3);
  const monthYear = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handleAddTransaction = async (tx: Omit<Transaction, 'id'>) => {
    await addTransaction({ ...tx, id: Date.now().toString() });
    loadData();
  };

  const handleAddToSaving = async (
    txs: Omit<Transaction, 'id'>[],
    updatedGoals: Goal[],
  ) => {
    for (const tx of txs) {
      await addTransaction({ ...tx, id: (Date.now() * Math.random()).toString() });
    }
    for (const g of updatedGoals) await updateGoal(g);
    loadData();
  };

  const handleWithdraw = async (txs: Omit<Transaction, 'id'>[], updatedGoals: Goal[]) => {
    for (const tx of txs) {
      await addTransaction({ ...tx, id: (Date.now() * Math.random()).toString() });
    }
    for (const g of updatedGoals) await updateGoal(g);
    loadData();
  };

  // ── Small presentational helper for the inline hero stats ──
  const HeroStat = ({
    icon,
    label,
    amount,
  }: {
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    amount: number;
  }) => (
    <View style={{ flex: 1, gap: spacing.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
        <MaterialIcons name={icon} size={15} color={withAlpha('#FFFFFF', 0.85)} />
        <Text style={{ color: withAlpha('#FFFFFF', 0.85), ...typography.caption }}>{label}</Text>
      </View>
      <Text style={{ color: '#FFFFFF', ...typography.heading }} numberOfLines={1}>
        {currency}{amount.toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, paddingTop: insets.top + spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.xl }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.primaryText, ...typography.body, opacity: 0.6 }}>
              {t('welcomeBack')}
            </Text>
            <Text style={{ color: theme.headline, ...typography.display }}>{t('dashboard')}</Text>
            <Text style={{ color: theme.primaryText, ...typography.label, opacity: 0.7, marginTop: spacing.xs }}>
              {monthYear}
            </Text>
          </View>
          {isLiquidGlassAvailable() ? (
            <GlassView
              isInteractive
              style={{ width: 44, height: 44, borderRadius: radius.pill, overflow: 'hidden' }}
            >
              <TouchableOpacity
                onPress={() => router.navigate('/(notification)')}
                hitSlop={10}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              >
                <Octicons name="bell" size={20} color={theme.primary} />
              </TouchableOpacity>
            </GlassView>
          ) : (
            <TouchableOpacity
              onPress={() => router.navigate('/(notification)')}
              hitSlop={10}
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.pill,
                backgroundColor: theme.card,
                alignItems: 'center',
                justifyContent: 'center',
                ...shadow.sm,
              }}
            >
              <Octicons name="bell" size={20} color={theme.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Hero balance card */}
        <View
          style={{
            backgroundColor: theme.primary,
            borderRadius: radius.xl,
            padding: spacing.xxl,
            marginBottom: spacing.xl,
            boxShadow: '0 8px 24px rgba(0, 184, 217, 0.35)',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
            <MaterialIcons name="account-balance-wallet" size={18} color={withAlpha('#FFFFFF', 0.9)} />
            <Text style={{ color: withAlpha('#FFFFFF', 0.9), ...typography.label }}>{t('balance')}</Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 38, fontWeight: '800', letterSpacing: 0.5, marginBottom: spacing.xl }}>
            {currency}{balance.toFixed(2)}
          </Text>
          {isLiquidGlassAvailable() ? (
            <GlassView
              style={{
                borderRadius: radius.md,
                overflow: 'hidden',
                flexDirection: 'row',
                padding: spacing.lg,
                gap: spacing.md,
              }}
            >
              <HeroStat icon="attach-money" label={t('income')} amount={totalIncome} />
              <View style={{ width: 1, backgroundColor: withAlpha('#FFFFFF', 0.35) }} />
              <HeroStat icon="money-off" label={t('expense')} amount={totalExpenses} />
              <View style={{ width: 1, backgroundColor: withAlpha('#FFFFFF', 0.35) }} />
              <HeroStat icon="savings" label={t('saving')} amount={savings} />
            </GlassView>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: withAlpha('#FFFFFF', 0.15),
                borderRadius: radius.md,
                padding: spacing.lg,
                gap: spacing.md,
              }}
            >
              <HeroStat icon="attach-money" label={t('income')} amount={totalIncome} />
              <View style={{ width: 1, backgroundColor: withAlpha('#FFFFFF', 0.25) }} />
              <HeroStat icon="money-off" label={t('expense')} amount={totalExpenses} />
              <View style={{ width: 1, backgroundColor: withAlpha('#FFFFFF', 0.25) }} />
              <HeroStat icon="savings" label={t('saving')} amount={savings} />
            </View>
          )}
        </View>

        {/* Monthly Saving Goal Progress */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: radius.lg,
            padding: spacing.xl,
            marginBottom: spacing.xl,
            ...shadow.sm,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: radius.pill,
                backgroundColor: withAlpha(theme.primary, 0.13),
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.md,
              }}
            >
              <MaterialIcons name="savings" size={22} color={theme.primary} />
            </View>
            <Text style={{ color: theme.headline, ...typography.heading, flex: 1 }}>
              {t('monthlySavingGoalProgress')}
            </Text>
            <Text style={{ color: theme.primary, ...typography.heading }}>
              {(savingProgress * 100).toFixed(0)}%
            </Text>
          </View>
          <View style={{ height: 12, backgroundColor: withAlpha(theme.primary, 0.13), borderRadius: radius.pill, overflow: 'hidden', marginBottom: spacing.md }}>
            <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${savingProgress * 100}%`, backgroundColor: theme.primary, borderRadius: radius.pill }} />
          </View>
          <Text style={{ color: monthlyGoalReached ? theme.secondary : theme.primaryText, ...typography.body, opacity: monthlyGoalReached ? 1 : 0.75 }}>
            {monthlyGoalReached
              ? t('congratulationsMessage', { goal: `${currency}${savingGoal.toFixed(2)}` })
              : t('savingGoalAlert', { balance: `${currency}${balance.toFixed(2)}`, goal: `${currency}${remainingToCover.toFixed(2)}` })}
          </Text>
        </View>

        {/* Recent Transactions */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
          <Text style={{ color: theme.headline, ...typography.heading }}>{t('recentTransactions')}</Text>
          <TouchableOpacity onPress={() => setShowAll(!showAll)} hitSlop={8}>
            <Text style={{ color: theme.primary, ...typography.label }}>
              {showAll ? t('showLess') : t('seeAll')}
            </Text>
          </TouchableOpacity>
        </View>
        {displayedTxs.length === 0 ? (
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: radius.lg,
              paddingVertical: spacing.xxxl,
              alignItems: 'center',
              gap: spacing.sm,
              ...shadow.sm,
            }}
          >
            <MaterialIcons name="receipt-long" size={32} color={withAlpha(theme.primaryText, 0.3)} />
            <Text style={{ color: theme.primaryText, ...typography.body, opacity: 0.6 }}>{t('noTransactionsToday')}</Text>
          </View>
        ) : (
          displayedTxs.map((tx) => <TransactionTile key={tx.id} transaction={tx} currency={currency} />)
        )}

        {/* Add / Withdraw Saving Buttons */}
        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}>
          <TouchableOpacity
            onPress={() => setAddSavingVisible(true)}
            activeOpacity={0.85}
            style={{
              flex: 1, backgroundColor: theme.primary, borderRadius: radius.lg, paddingVertical: spacing.lg,
              alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: spacing.sm,
              boxShadow: '0 4px 12px rgba(0, 184, 217, 0.30)',
            }}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={{ color: '#fff', ...typography.heading }}>{t('addToSaving')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setWithdrawVisible(true)}
            activeOpacity={0.85}
            style={{
              flex: 1, backgroundColor: theme.card, borderRadius: radius.lg, paddingVertical: spacing.lg,
              alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: spacing.sm,
              borderWidth: 1.5, borderColor: theme.primary,
            }}
          >
            <MaterialIcons name="remove" size={20} color={theme.primary} />
            <Text style={{ color: theme.primary, ...typography.heading }}>{t('withdraw')}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setAddTxVisible(true)}
        activeOpacity={0.85}
        style={{
          position: 'absolute', bottom: 24, right: 24,
          width: 56, height: 56, borderRadius: radius.pill, backgroundColor: theme.primary,
          justifyContent: 'center', alignItems: 'center',
          boxShadow: '0 6px 20px rgba(0, 184, 217, 0.35)',
        }}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <AddTransactionModal visible={addTxVisible} onClose={() => setAddTxVisible(false)} onAdd={handleAddTransaction} />
      <AddToSavingModal visible={addSavingVisible} balance={balance} activeGoals={activeGoals} onClose={() => setAddSavingVisible(false)} onSave={handleAddToSaving} currency={currency} />
      <WithdrawFromSavingModal visible={withdrawVisible} goalsWithSavings={goalsWithSavings} onClose={() => setWithdrawVisible(false)} onSave={handleWithdraw} currency={currency} />
    </View>
  );
}

export default Dashboard;
