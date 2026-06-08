import GoalCard from '@/components/GoalCard';
import AddGoalModal from '@/components/modals/AddGoalModal';
import EditGoalModal from '@/components/modals/EditGoalModal';
import { radius, spacing, typography, withAlpha } from '@/contants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Goal } from '@/model/Goal';
import { addGoal, addTransaction, deleteGoal, getCurrency, getGoals, updateGoal } from '@/storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    FlatList,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabType = 'active' | 'done';

export default function Goals() {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [currency, setCurrencySymbol] = useState('$');
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [addGoalVisible, setAddGoalVisible] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);

  const loadData = useCallback(async () => {
    const [gs, cur] = await Promise.all([getGoals(), getCurrency()]);
    const symbols: Record<string, string> = { USD: '$', EUR: '€', SAR: '﷼', EGP: 'E£', BHD: 'BD' };
    setGoals(gs);
    setCurrencySymbol(symbols[cur] ?? '$');
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const activeGoals = goals.filter((g) => !g.stopped && g.savedAmount < g.targetAmount);
  const doneOrStoppedGoals = goals.filter((g) => g.stopped || g.savedAmount >= g.targetAmount);

  const handleAddGoal = async (name: string, targetAmount: number, startDate: Date, endDate: Date) => {
    await addGoal({ id: Date.now().toString(), name, targetAmount, savedAmount: 0, startDate, endDate, stopped: false });
    loadData();
  };

  const handleEditGoal = async (updated: Goal) => {
    await updateGoal(updated);
    setEditGoal(null);
    loadData();
  };

  const handleDeleteGoal = (goal: Goal) => {
    Alert.alert(t('deleteConfirmTitle'), `${t('delete')} "${goal.name}"?`, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          if (goal.savedAmount > 0) {
            await addTransaction({ id: Date.now().toString(), type: 'Income', amount: goal.savedAmount, category: 'From Saving', date: new Date(), note: `Goal deleted: ${goal.name}` });
          }
          await deleteGoal(goal.id);
          loadData();
        },
      },
    ]);
  };

  const handleStopGoal = async (goal: Goal, stopped: boolean) => {
    if (stopped && !goal.stopped) {
      if (goal.savedAmount > 0) {
        await addTransaction({ id: Date.now().toString(), type: 'Income', amount: goal.savedAmount, category: 'From Saving', date: new Date(), note: `Stopped goal: ${goal.name}` });
      }
      await updateGoal({ ...goal, stopped: true, savedAmount: 0 });
    } else if (!stopped && goal.stopped) {
      await updateGoal({ ...goal, stopped: false, savedAmount: 0 });
    }
    loadData();
  };

  const handleReactivate = async (goal: Goal) => {
    await updateGoal({ ...goal, stopped: false, savedAmount: 0 });
    loadData();
  };

  const displayedGoals = activeTab === 'active' ? activeGoals : doneOrStoppedGoals;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={displayedGoals}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + 80,
        }}
        ListHeaderComponent={
          <View style={{ paddingTop: insets.top + spacing.md }}>
            <Text style={{ color: theme.headline, ...typography.display, marginBottom: spacing.xl }}>
              {t('myGoals')}
            </Text>

            {/* Segmented tab */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: theme.card,
                borderRadius: radius.lg,
                padding: spacing.xs,
                marginBottom: spacing.lg,
              }}
            >
              {(['active', 'done'] as const).map((tab) => {
                const active = activeTab === tab;
                return (
                  <Pressable
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={{
                      flex: 1,
                      paddingVertical: spacing.sm,
                      alignItems: 'center',
                      borderRadius: radius.md,
                      backgroundColor: active ? theme.background : 'transparent',
                      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : undefined,
                    }}
                  >
                    <Text style={{
                      color: active ? theme.primary : withAlpha(theme.primaryText, 0.55),
                      ...typography.label,
                    }}>
                      {tab === 'active' ? t('activeGoals') : t('doneOrStoppedGoals')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          goals.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <MaterialIcons name="flag" size={64} color={withAlpha(theme.primaryText, 0.2)} />
              <Text style={{ color: theme.primaryText, ...typography.body, marginTop: spacing.md, opacity: 0.6, textAlign: 'center', paddingHorizontal: spacing.xxxl }}>
                {t('noGoalsYet')}
              </Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ color: withAlpha(theme.primaryText, 0.55), ...typography.body }}>
                {activeTab === 'active' ? t('noGoalsYet') : t('completedGoals')}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <GoalCard
            goal={item}
            completed={item.savedAmount >= item.targetAmount}
            currency={currency}
            onEdit={() => setEditGoal(item)}
            onDelete={() => handleDeleteGoal(item)}
            onStopChanged={activeTab === 'active' ? (stopped) => handleStopGoal(item, stopped) : undefined}
            onReactivate={
              activeTab === 'done' && item.stopped && item.savedAmount < item.targetAmount
                ? () => handleReactivate(item)
                : undefined
            }
          />
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setAddGoalVisible(true)}
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

      <AddGoalModal visible={addGoalVisible} onClose={() => setAddGoalVisible(false)} onAdd={handleAddGoal} />
      <EditGoalModal visible={!!editGoal} goal={editGoal} onClose={() => setEditGoal(null)} onSave={handleEditGoal} />
    </View>
  );
}
