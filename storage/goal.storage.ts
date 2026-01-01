import { getRealm } from '@/realm';
import { GoalSchema } from '@/realm/schemas';
import Realm from 'realm';
import { Goal } from '../model/Goal';

export async function getGoals(): Promise<Goal[]> {
  try {
    const realm = await getRealm();
    return realm.objects<GoalSchema>('Goal').map((g) => ({
      id: g.id,
      name: g.name,
      targetAmount: g.targetAmount,
      savedAmount: g.savedAmount,
      //need to be resolved later
      startDate: g.startDate ?? new Date(0),
      endDate: g.endDate ?? new Date(0),
      stopped: g.stopped,
    }));
  } catch (e) {
    console.error('getGoals failed', e);
    return [];
  }
}

export async function getGoal(id: string): Promise<Goal | undefined> {
  const realm = await getRealm();
  const g = realm.objects<GoalSchema>('Goal').filtered('id == $0', id)[0];
  if (!g) return;

  return {
    id: g.id,
    name: g.name,
    targetAmount: g.targetAmount,
    savedAmount: g.savedAmount,
    //need to be resolved later
    startDate: g.startDate ?? new Date(0),
    endDate: g.endDate ?? new Date(0),
    stopped: g.stopped,
  };
}

export async function addGoal(goal: Goal): Promise<void> {
  const realm = await getRealm();
  realm.write(() => {
    realm.create('Goal', {
      _id: new Realm.BSON.ObjectId(),
      ...goal,
    });
  });
}

export async function updateGoal(goal: Goal): Promise<void> {
  const realm = await getRealm();
  const existing = realm.objects<GoalSchema>('Goal').filtered('id == $0', goal.id)[0];
  if (!existing) return;

  realm.write(() => {
    Object.assign(existing, goal);
  });
}

export async function deleteGoal(id: string): Promise<void> {
  const realm = await getRealm();
  const goal = realm.objects<GoalSchema>('Goal').filtered('id == $0', id)[0];
  if (!goal) return;

  realm.write(() => realm.delete(goal));
}
