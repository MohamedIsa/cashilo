import GoalCard from '@/components/GoalCard';
import AddGoalModal from '@/components/modals/AddGoalModal';
import EditGoalModal from '@/components/modals/EditGoalModal';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Goal } from '@/model/Goal';
import { addGoal, addTransaction, deleteGoal, getCurrency, getGoals, updateGoal } from '@/storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    FlatList,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

type TabType = 'active' | 'done';

export default function Goals() {
  const theme = useAppTheme();
  const { t } = useTranslation();

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
    await addGoal({
      id: Date.now().toString(),
      name,
      targetAmount,
      savedAmount: 0,
      startDate,
      endDate,
      stopped: false,
    });
    loadData();
  };

  const handleEditGoal = async (updated: Goal) => {
    await updateGoal(updated);
    setEditGoal(null);
    loadData();
  };

  const handleDeleteGoal = (goal: Goal) => {
    Alert.alert(t('deleteConfirmTitle'), `Delete goal "${goal.name}"?`, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          // Return saved amount as income if any
          if (goal.savedAmount > 0) {
            await addTransaction({
              id: Date.now().toString(),
              type: 'Income',
              amount: goal.savedAmount,
              category: 'From Saving',
              date: new Date(),
              note: `Goal deleted: ${goal.name}`,
            });
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
        await addTransaction({
          id: Date.now().toString(),
          type: 'Income',
          amount: goal.savedAmount,
          category: 'From Saving',
          date: new Date(),
          note: `Stopped goal: ${goal.name}`,
        });
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
      {/* Title */}
      <Text style={{ color: theme.headline, fontWeight: 'bold', fontSize: 24, paddingHorizontal: 16, paddingTop: 16 }}>
        {t('myGoal')}
      </Text>

      {/* Tab Bar */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 4 }}>
        {(['active', 'done'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1, paddingVertical: 10, alignItems: 'center',
              borderBottomWidth: activeTab === tab ? 3 : 1,
              borderBottomColor: activeTab === tab ? theme.primary : `${theme.primaryText}33`,
            }}
          >
            <Text style={{
              color: activeTab === tab ? theme.primary : theme.primaryText,
              fontWeight: activeTab === tab ? 'bold' : '400',
              fontSize: 14,
            }}>
              {tab === 'active' ? t('activeGoals') : t('doneOrStoppedGoals')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {goals.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name="flag" size={60} color={`${theme.primaryText}33`} />
          <Text style={{ color: theme.primaryText, fontSize: 16, fontWeight: '500', marginTop: 16, textAlign: 'center', paddingHorizontal: 32 }}>
            {t('noGoalsYet')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedGoals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ color: theme.primaryText, fontSize: 15 }}>
                {activeTab === 'active' ? t('noGoalsYet') : 'No completed or stopped goals.'}
              </Text>
            </View>
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
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setAddGoalVisible(true)}
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

      <AddGoalModal visible={addGoalVisible} onClose={() => setAddGoalVisible(false)} onAdd={handleAddGoal} />
      <EditGoalModal visible={!!editGoal} goal={editGoal} onClose={() => setEditGoal(null)} onSave={handleEditGoal} />
    </View>
  );
}
