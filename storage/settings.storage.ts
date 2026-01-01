import { Language, STORAGE_KEYS } from '@/contants/storageKeys';
import { getRealm } from '@/realm';
import { SettingsSchema } from '@/realm/schemas';
import Realm from 'realm';

export async function getLanguage(): Promise<Language> {
  const realm = await getRealm();
  const setting = realm
    .objects<SettingsSchema>('Settings')
    .filtered('key == $0', STORAGE_KEYS.LANGUAGE)[0];

  return (setting?.value as Language) ?? 'en';
}

export async function setLanguage(language: Language): Promise<void> {
  const realm = await getRealm();
  const existing = realm
    .objects<SettingsSchema>('Settings')
    .filtered('key == $0', STORAGE_KEYS.LANGUAGE)[0];

  realm.write(() => {
    if (existing) {
      existing.value = language;
    } else {
      realm.create('Settings', {
        _id: new Realm.BSON.ObjectId(),
        key: STORAGE_KEYS.LANGUAGE,
        value: language,
      });
    }
  });
}

export async function clearAllData(): Promise<void> {
  const realm = await getRealm();
  realm.write(() => realm.deleteAll());
}
