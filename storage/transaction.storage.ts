import { getRealm } from '@/realm';
import { TransactionSchema } from '@/realm/schemas';
import Realm from 'realm';
import { Transaction } from '../model/Transaction';

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const realm = await getRealm();
    return realm.objects<TransactionSchema>('Transaction').map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      category: t.category,
      date: t.date,
      note: t.note,
    }));
  } catch (e) {
    console.error('getTransactions failed', e);
    return [];
  }
}

export async function addTransaction(tx: Transaction): Promise<void> {
  const realm = await getRealm();
  realm.write(() => {
    realm.create('Transaction', {
      _id: new Realm.BSON.ObjectId(),
      ...tx,
    });
  });
}

export async function updateTransaction(tx: Transaction): Promise<void> {
  const realm = await getRealm();
  const existing = realm.objects<TransactionSchema>('Transaction').filtered('id == $0', tx.id)[0];

  if (!existing) return;

  realm.write(() => {
    Object.assign(existing, tx);
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  const realm = await getRealm();
  const tx = realm.objects<TransactionSchema>('Transaction').filtered('id == $0', id)[0];
  if (!tx) return;

  realm.write(() => realm.delete(tx));
}
