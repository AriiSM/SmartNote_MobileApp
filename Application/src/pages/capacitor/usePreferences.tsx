import { Preferences } from '@capacitor/preferences';

export const setPreference = async (key: string, value: string): Promise<void> => {
  await Preferences.set({ key, value });
};

export const getPreference = async (key: string): Promise<string | null> => {
  const { value } = await Preferences.get({ key });
  return value;
};

export const getAllKeys = async (): Promise<string[]> => {
  const { keys } = await Preferences.keys();
  return keys;
};

export const removePreference = async (key: string): Promise<void> => {
  await Preferences.remove({ key });
};

export const clearPreferences = async (): Promise<void> => {
  await Preferences.clear();
};
