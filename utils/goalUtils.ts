import { Goal } from '@/model/Goal';
import { Transaction } from '@/model/Transaction';
import { addTransaction, updateGoal } from '@/storage';

/**
 * Calculates total monthly saving goal from all active incomplete goals.
 * Mirrors Flutter's getTotalPeriodSavingGoal().
 */
export function getTotalPeriodSavingGoal(goals: Goal[]): number {
  const activeGoals = goals.filter(
    (g) => g.savedAmount < g.targetAmount && !g.stopped,
  );
  let total = 0;
  for (const g of activeGoals) {
    if (g.startDate && g.endDate) {
      const days =
        (new Date(g.endDate).getTime() - new Date(g.startDate).getTime()) /
        (1000 * 60 * 60 * 24);
      let monthlyPortion = 0;
      if (days <= 8) {
        monthlyPortion = g.targetAmount * 4.345;
      } else if (days <= 32) {
        monthlyPortion = g.targetAmount;
      } else if (days <= 95) {
        monthlyPortion = g.targetAmount / 3.0;
      } else if (days <= 190) {
        monthlyPortion = g.targetAmount / 6.0;
      } else {
        monthlyPortion = g.targetAmount / 12.0;
      }
      total += monthlyPortion;
    } else {
      total += g.targetAmount;
    }
  }
  return total;
}

/**
 * Distributes monthlySavingGoal across active goals proportionally.
 * Mirrors Flutter's calculateGoalSavings().
 */
export async function calculateGoalSavings(
  activeGoals: Goal[],
  monthlySavingGoal: number,
): Promise<void> {
  const totalWeight = activeGoals.reduce(
    (sum, g) => sum + Math.max(g.targetAmount - g.savedAmount, 1),
    0,
  );
  let remainingSavings = monthlySavingGoal;
  const now = Date.now();

  for (const goal of activeGoals) {
    const weight = Math.max(goal.targetAmount - goal.savedAmount, 1);
    const allocation = (weight / totalWeight) * monthlySavingGoal;
    const toSave = Math.min(
      allocation,
      goal.targetAmount - goal.savedAmount,
      remainingSavings,
    );
    if (toSave > 0) {
      const tx: Transaction = {
        id: (now + Math.random()).toString(),
        type: 'Expense',
        amount: toSave,
        category: 'Saving',
        date: new Date(),
        note: `Auto-save for goal: ${goal.name}`,
      };
      await addTransaction(tx);
      await updateGoal({ ...goal, savedAmount: goal.savedAmount + toSave });
      remainingSavings -= toSave;
    }
  }

  // Remaining goes to first goal
  if (remainingSavings > 0 && activeGoals.length > 0) {
    const first = activeGoals[0];
    const toSave = Math.min(
      remainingSavings,
      first.targetAmount - first.savedAmount,
    );
    if (toSave > 0) {
      const tx: Transaction = {
        id: (now + 9999).toString(),
        type: 'Expense',
        amount: toSave,
        category: 'Saving',
        date: new Date(),
        note: `Auto-save for goal: ${first.name}`,
      };
      await addTransaction(tx);
      await updateGoal({ ...first, savedAmount: first.savedAmount + toSave });
    }
  }
}

/**
 * Calculate end date for a goal period string.
 */
export function calculateEndDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case '1 Month':
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    case '3 Months':
      return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
    case '6 Months':
      return new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
    case '1 Year':
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    default:
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }
}
