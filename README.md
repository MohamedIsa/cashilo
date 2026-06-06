# Cashilo 💰

Cashilo is a personal-finance app for tracking **income, expenses, and savings goals**. Log your salary and spending, set savings targets with a time period, and watch your monthly progress with charts and reports. Supports **English & Arabic** and **light/dark** themes.

> This is the **Expo (React Native + TypeScript)** codebase — the actively maintained version of Cashilo. A legacy Flutter version exists in `../cashilo-flutter` but is superseded by this one.

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | [Expo](https://expo.dev) SDK 55 (React Native 0.83, New Architecture) |
| Routing | `expo-router` (file-based, in `app/`) |
| Local database | [Realm](https://www.mongodb.com/docs/realm/sdk/react-native/) (`realm/`, `storage/`) |
| Theme / onboarding flags | `@react-native-async-storage/async-storage` |
| i18n | `i18next` + `react-i18next` (`i18n/`, EN + AR) |
| Charts | `react-native-chart-kit` (+ `react-native-svg`) |
| UI bits | `react-native-paper`, `@expo/vector-icons` |
| Language | TypeScript |

---

## ⚠️ Important: Realm needs a custom dev client

This app uses **Realm**, which contains native code. That means **it will NOT run in the standard Expo Go app**. You must build a **custom development client** once, then use it like Expo Go for day-to-day work.

You'll need the standard React Native native toolchain set up first:
- **Android:** Android Studio + an emulator or a physical device with USB debugging.
- **iOS (macOS only):** Xcode + CocoaPods.

See the Expo guide: <https://docs.expo.dev/develop/development-builds/introduction/>.

---

## Getting started (first run)

### 1. Prerequisites
- **Node.js** 18+ and npm
- A configured **Android** emulator/device and/or **iOS** simulator (see note above)

### 2. Install dependencies
```bash
npm install
```

### 3. Build & install the custom dev client (one time)
Pick your platform — this compiles native code, so the first build takes a few minutes:

```bash
# Android
npx expo run:android

# iOS (macOS only)
npx expo run:ios
```

This installs the **Cashilo dev client** on your emulator/device.

### 4. Start the dev server
After the dev client is installed, day-to-day you just run:
```bash
npx expo start
```
Then press `a` (Android) or `i` (iOS), or open the dev client app on your device and scan the QR code.

> **Tip:** You only need step 3 again when you add/upgrade a native dependency. The rest of the time, `npx expo start` is enough.

---

## Available scripts
```bash
npm run start      # expo start (dev server)
npm run android    # expo run:android (build + run)
npm run ios        # expo run:ios (build + run, macOS only)
npm run web        # expo start --web (limited; Realm has no web support)
npm run lint       # expo lint
```

---

## Project structure
```
app/                      # Screens & routes (expo-router, file-based)
  index.tsx               # Entry — gates onboarding vs. dashboard
  onboarding.tsx          # First-launch walkthrough
  (tabs)/                 # Bottom-tab screens
    Dashboard.tsx
    Transactions.tsx
    Goals.tsx
    Reports.tsx
    Settings.tsx
  (notification)/         # Notifications screen
components/               # Reusable UI (cards, tiles) + modals/
contexts/                 # ThemeContext (light/dark)
contants/                 # theme.ts (design tokens), storageKeys.ts, static.ts
realm/                    # Realm setup (index.ts) + schemas.ts
storage/                  # Data access layer (transactions, goals, settings)
model/                    # Plain TS types (Transaction, Goal)
utils/                    # categories, goal math
i18n/                     # en.json, ar.json, init
assets/                   # images, icons
```

### Data model (quick mental map)
- **Transaction** — `type` (Income/Expense), `amount`, `category`, `date`, `note`.
- **Goal** — a savings target with `targetAmount`, `savedAmount`, a start/end period, and a `stopped` flag.
- **Settings** — key/value rows in Realm (currency, language). Theme & onboarding flags live in AsyncStorage.

---

## Android build patch — foojay / Gradle 9 fix

`@react-native/gradle-plugin` (all 0.83.x and 0.85.x releases) hardcodes
**foojay-resolver-convention 0.5.0**, which references `JvmVendorSpec.IBM_SEMERU` —
a field removed in Gradle 9.0. This causes the build to crash immediately when the
Gradle cache is cold (fresh clone, `npm install`, or manual cache wipe):

```
Class org.gradle.jvm.toolchain.JvmVendorSpec does not have member field
'org.gradle.jvm.toolchain.JvmVendorSpec IBM_SEMERU'
```

We fix this with **patch-package**: `patches/@react-native+gradle-plugin+0.83.6.patch`
bumps foojay to 1.0.0, which drops the broken reference. The patch is applied
automatically on every `npm install` via the `postinstall` script — no manual step
needed. Tracked upstream at [react-native#55781](https://github.com/facebook/react-native/issues/55781).

### When upgrading Expo / React Native

For regular devs — **nothing changes**. `npm install` always applies the patch automatically.

The patch only needs to be **re-created** when someone upgrades the Expo/RN SDK and
`@react-native/gradle-plugin` ships a new version. The patch filename encodes the
version (`+0.83.6.patch`), so if the package version changes, patch-package will warn
that the patch no longer applies and skip it. The person doing the upgrade needs to
create a new patch (one-time, then committed for everyone else):

```bash
# 1. Upgrade packages as normal (e.g. npx expo install --check)
npm install

# 2. Delete the old patch
rm patches/@react-native+gradle-plugin+0.83.6.patch

# 3. In node_modules/@react-native/gradle-plugin/settings.gradle.kts
#    change the foojay version from 0.5.0 to 1.0.0, then snapshot it:
npx patch-package @react-native/gradle-plugin

# 4. Commit — all other devs get the fix automatically on their next npm install
git add patches/
git commit -m "chore: update foojay patch for @react-native/gradle-plugin vX.Y.Z"
```

> **When to stop doing this:** once `npx expo install --check` shows
> `@react-native/gradle-plugin` at a version that ships foojay 1.0.0 natively,
> delete the patch file entirely and remove `patch-package` from devDependencies.
> Check by running:
> ```bash
> grep foojay node_modules/@react-native/gradle-plugin/settings.gradle.kts
> ```
> If it already shows `version("1.0.0")` after a clean `npm install`, the patch is
> no longer needed.

---

## Notes & known limitations
- **Web target** is limited: Realm has no web implementation, so the web build won't persist data.
- **Notifications** screen is currently UI/mock only — no real scheduled reminders yet.
- The app defaults to **English** and the device color scheme on first launch; both are changeable in **Settings**.
