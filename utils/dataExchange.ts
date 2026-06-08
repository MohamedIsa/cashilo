import { Goal } from '@/model/Goal';
import { Transaction } from '@/model/Transaction';
import { getRealm } from '@/realm';
import { GoalSchema, TransactionSchema } from '@/realm/schemas';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Realm from 'realm';

const BACKUP_VERSION = 1;

interface BackupFile {
  version: number;
  exportedAt: string;
  transactions: Array<Omit<Transaction, 'date'> & { date: string }>;
  goals: Array<Omit<Goal, 'startDate' | 'endDate'> & { startDate: string; endDate: string }>;
}

// ─── Export ──────────────────────────────────────────────────────────────────

export async function exportData(): Promise<void> {
  const realm = await getRealm();

  const transactions = realm.objects<TransactionSchema>('Transaction').map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    category: t.category,
    date: new Date(t.date).toISOString(),
    note: t.note,
  }));

  const goals = realm.objects<GoalSchema>('Goal').map((g) => ({
    id: g.id,
    name: g.name,
    targetAmount: g.targetAmount,
    savedAmount: g.savedAmount,
    startDate: (g.startDate ?? new Date(0)).toISOString(),
    endDate: (g.endDate ?? new Date(0)).toISOString(),
    stopped: g.stopped,
  }));

  const backup: BackupFile = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    transactions,
    goals,
  };

  const filename = `cashilo-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const file = new File(Paths.cache, filename);
  if (file.exists) file.delete();
  file.create();
  file.write(JSON.stringify(backup, null, 2));

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error('Sharing is not available on this device.');

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Export Cashilo Data',
    UTI: 'public.json',
  });
}

// ─── Import ───────────────────────────────────────────────────────────────────

export type ImportMode = 'merge' | 'replace';

export interface ImportResult {
  transactions: number;
  goals: number;
}

export async function importData(mode: ImportMode): Promise<ImportResult> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
  });

  if (result.canceled) throw new Error('cancelled');

  const asset = result.assets[0];
  const raw = await new File(asset.uri).text();

  let backup: BackupFile;
  try {
    backup = JSON.parse(raw);
  } catch {
    throw new Error('invalid_json');
  }

  if (!backup.version || !Array.isArray(backup.transactions) || !Array.isArray(backup.goals)) {
    throw new Error('invalid_format');
  }

  const realm = await getRealm();

  realm.write(() => {
    if (mode === 'replace') {
      realm.delete(realm.objects('Transaction'));
      realm.delete(realm.objects('Goal'));
    }

    for (const t of backup.transactions) {
      if (mode === 'merge') {
        const exists = realm.objects<TransactionSchema>('Transaction').filtered('id == $0', t.id)[0];
        if (exists) continue;
      }
      realm.create('Transaction', {
        _id: new Realm.BSON.ObjectId(),
        id: t.id,
        type: t.type,
        amount: t.amount,
        category: t.category,
        date: new Date(t.date),
        note: t.note ?? '',
      });
    }

    for (const g of backup.goals) {
      if (mode === 'merge') {
        const exists = realm.objects<GoalSchema>('Goal').filtered('id == $0', g.id)[0];
        if (exists) continue;
      }
      realm.create('Goal', {
        _id: new Realm.BSON.ObjectId(),
        id: g.id,
        name: g.name,
        targetAmount: g.targetAmount,
        savedAmount: g.savedAmount,
        startDate: new Date(g.startDate),
        endDate: new Date(g.endDate),
        stopped: g.stopped ?? false,
      });
    }
  });

  return {
    transactions: backup.transactions.length,
    goals: backup.goals.length,
  };
}
