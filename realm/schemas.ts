import Realm from 'realm';

/* =======================
   Goal Schema
======================= */
export class GoalSchema extends Realm.Object<GoalSchema> {
  _id!: Realm.BSON.ObjectId;
  id!: string;
  name!: string;
  targetAmount!: number;
  savedAmount!: number;
  startDate?: Date;
  endDate?: Date;
  stopped!: boolean;

  static schema: Realm.ObjectSchema = {
    name: 'Goal',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      id: 'string',
      name: 'string',
      targetAmount: 'double',
      savedAmount: 'double',
      startDate: 'date?',
      endDate: 'date?',
      stopped: { type: 'bool', default: false },
    },
  };
}

/* =======================
   Transaction Schema
======================= */
export class TransactionSchema extends Realm.Object<TransactionSchema> {
  _id!: Realm.BSON.ObjectId;
  id!: string;
  type!: 'Income' | 'Expense';
  amount!: number;
  category!: string;
  date!: Date;
  note!: string;

  static schema: Realm.ObjectSchema = {
    name: 'Transaction',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      id: 'string',
      type: 'string',
      amount: 'double',
      category: 'string',
      date: 'date',
      note: 'string',
    },
  };
}

/* =======================
   Settings Schema
======================= */
export class SettingsSchema extends Realm.Object<SettingsSchema> {
  _id!: Realm.BSON.ObjectId;
  key!: string;
  value!: string;

  static schema: Realm.ObjectSchema = {
    name: 'Settings',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      key: 'string',
      value: 'string',
    },
  };
}
