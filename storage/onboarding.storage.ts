import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@app_onboarding_complete';

/** Whether the user has finished (or skipped) the first-launch walkthrough. */
export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ONBOARDING_KEY)) === 'true';
  } catch {
    // If storage is unavailable, don't trap the user on onboarding forever.
    return true;
  }
}

/** Mark the walkthrough as done so it never shows again. */
export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}

/** Reset the flag — useful for testing the onboarding flow again. */
export async function resetOnboarding(): Promise<void> {
  await AsyncStorage.removeItem(ONBOARDING_KEY);
}
