---
description: How to upgrade Expo SDK and dependencies
---

# Upgrading Expo Workflow

## Before Upgrading

### 1. Check Current Version
// turbo
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx expo --version && cat package.json | grep '"expo"'
```

### 2. Check Available Updates
// turbo
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx expo-doctor
```

### 3. Review Breaking Changes
Read the Expo changelog for your target version:
- https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/
- https://expo.dev/changelog

## Upgrade Process

### Step 1: Upgrade Expo SDK
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx expo install expo@latest
```

Or to a specific version:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx expo install expo@52
```

### Step 2: Upgrade All Dependencies
// turbo
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx expo install --fix
```

### Step 3: Clear Caches
// turbo
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && rm -rf node_modules && rm -rf .expo && npm install
```

### Step 4: Regenerate Native Directories (if using prebuild)
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx expo prebuild --clean
```

## Post-Upgrade Verification

### 1. TypeScript Check
// turbo
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx tsc --noEmit
```

### 2. Run Tests
// turbo
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npm test
```

### 3. Start Dev Server
// turbo
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx expo start --clear
```

### 4. Test on Device
- Test on iOS Simulator
- Test on Android Emulator
- Test critical user flows

## Common Upgrade Issues

### Metro Bundler Issues
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx expo start --clear
```

### Native Module Compatibility
Check if native modules need updates:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx expo-doctor
```

### Tamagui Compatibility
If using Tamagui, check compatibility:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npm info tamagui versions | tail -5
```

## Rollback Plan

If upgrade fails:
1. `git checkout package.json package-lock.json`
2. `rm -rf node_modules`
3. `npm install`
4. `npx expo start --clear`
