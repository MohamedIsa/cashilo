import Realm from 'realm';
import { GoalSchema, SettingsSchema, TransactionSchema } from './schemas';

let realmInstance: Realm | null = null;

export async function getRealm(): Promise<Realm> {
  if (realmInstance && !realmInstance.isClosed) {
    return realmInstance;
  }

  realmInstance = await Realm.open({
    schema: [GoalSchema, TransactionSchema, SettingsSchema],
    schemaVersion: 1,
  });

  return realmInstance;
}
