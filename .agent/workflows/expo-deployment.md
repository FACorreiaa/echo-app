---
description: How to deploy the Expo app to App Store and Google Play
---

# Expo Deployment Workflow

## Prerequisites

1. EAS CLI installed: `npm install -g eas-cli`
2. Logged into EAS: `eas login`
3. Project configured with `eas.json`

## Build Profiles

### Development Build
For local testing with dev client:
// turbo
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && eas build --profile development --platform ios
```

### Preview Build
For TestFlight/Internal testing:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && eas build --profile preview --platform all
```

### Production Build
For App Store/Google Play submission:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && eas build --profile production --platform all
```

## Submitting to Stores

### Submit to App Store
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && eas submit --platform ios
```

### Submit to Google Play
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && eas submit --platform android
```

### Submit Both Platforms
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && eas submit --platform all
```

## Over-the-Air (OTA) Updates

### Publish Update
For instant updates without app store review:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && eas update --branch production --message "Description of changes"
```

### Preview Channel Update
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && eas update --branch preview --message "Testing new feature"
```

## Pre-Deployment Checklist

### Code Quality
// turbo
1. Run TypeScript check:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx tsc --noEmit
```

// turbo
2. Run linting:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npx oxlint .
```

// turbo
3. Run tests:
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && npm test
```

### Version Bump
4. Update version in `app.json`:
   - Increment `expo.version` for user-facing version
   - Increment `expo.ios.buildNumber` and `expo.android.versionCode`

### Environment
5. Verify environment variables are set for production

## Troubleshooting

### Clear Build Cache
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && eas build --clear-cache --profile production --platform ios
```

### Check Build Status
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && eas build:list
```

### View Build Logs
```bash
cd /Users/fernando_idwell/Projects/FinanceTrackerEcho/EchoApp && eas build:view
```
