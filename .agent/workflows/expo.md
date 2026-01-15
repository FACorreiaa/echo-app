---
description: How to run and develop the Expo React Native app
---

# Expo Development Workflow

## Start Development Server
// turbo
1. Start the Expo development server:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx expo start
```

## Run on Specific Platforms

### iOS Simulator
// turbo
2. Run on iOS simulator:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx expo run:ios
```

### Android Emulator
// turbo
3. Run on Android emulator:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx expo run:android
```

### Web Browser
// turbo
4. Run in web browser:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx expo start --web
```

## Build Commands

### Development Build (EAS)
5. Create a development build:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx eas build --profile development --platform ios
```

### Preview Build
6. Create a preview build for testing:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx eas build --profile preview --platform all
```

### Production Build
7. Create a production build:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx eas build --profile production --platform all
```

## Common Tasks

### Install Dependencies
// turbo
8. Install new package:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx expo install <package-name>
```

### Prebuild Native Directories
9. Generate native iOS/Android directories:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx expo prebuild
```

### Clear Cache
// turbo
10. Clear Expo cache and restart:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx expo start --clear
```

### Run TypeScript Check
// turbo
11. Check TypeScript errors:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx tsc --noEmit
```

### Run Tests
// turbo
12. Run Jest tests:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npm test
```

### Run Linting
// turbo
13. Run ESLint/oxlint:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx oxlint .
```

## Debugging

### View Logs
14. View device logs:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx react-native log-ios
```

### Doctor Check
// turbo
15. Run Expo doctor to check for issues:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx expo-doctor
```
