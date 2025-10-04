# Firebase Deployment Guide

## Quick Start

### Prerequisites
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login
```

### Initialize Firebase (First Time Only)
```bash
# Run from project root (C:\Rootine)
firebase init

# Select:
# - Firestore
# - Storage

# When prompted:
# - Choose existing project: rootine-d5bef
# - Use existing firestore.rules
# - Use existing firestore.indexes.json
# - Use existing storage.rules
```

### Deploy Everything
```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Deploy Storage rules
firebase deploy --only storage

# Or deploy everything at once
firebase deploy
```

## What Gets Deployed

### Firestore Rules (`firestore.rules`)
- Security rules for all 15 collections
- User authentication checks
- Data validation
- Ownership verification

### Firestore Indexes (`firestore.indexes.json`)
- Composite indexes for complex queries
- Optimizes query performance
- Required for:
  - Habit completion history by user + date
  - Posts sorted by creation date
  - Friend requests by status
  - Challenge participation tracking

### Storage Rules (`storage.rules`)
- Profile photo uploads (max 5MB)
- Post images (max 10MB)
- Progress photos (max 10MB)
- Recipe images (max 5MB)
- Challenge images (max 5MB)

## Verify Deployment

### Check Firestore Rules
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `rootine-d5bef`
3. Navigate to **Firestore Database** → **Rules**
4. Verify rules are active (check timestamp)

### Check Storage Rules
1. In Firebase Console
2. Navigate to **Storage** → **Rules**
3. Verify rules are active

### Test Rules
```bash
# Test with emulator
firebase emulators:start --only firestore,storage

# Your app will connect to:
# - Firestore: localhost:8080
# - Storage: localhost:9199
```

## Troubleshooting

### Error: "No project active"
```bash
# Set active project
firebase use rootine-d5bef
```

### Error: "Permission denied"
```bash
# Re-authenticate
firebase login --reauth
```

### Error: "Invalid rules"
```bash
# Validate rules locally
firebase deploy --only firestore:rules --debug
```

### Error: "Index required"
When you get this error in your app:
1. Click the provided link in the error message
2. Or manually add the index to `firestore.indexes.json`
3. Deploy: `firebase deploy --only firestore:indexes`

## Best Practices

1. **Always test locally first**
   ```bash
   firebase emulators:start
   ```

2. **Review changes before deploying**
   ```bash
   firebase deploy --only firestore:rules --dry-run
   ```

3. **Keep rules updated**
   - Update rules when adding new features
   - Remove unused collection rules
   - Test thoroughly after changes

4. **Monitor usage**
   - Check Firebase Console for rule violations
   - Monitor read/write patterns
   - Adjust indexes based on slow queries

## Commands Reference

```bash
# Deploy specific components
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage

# Deploy everything
firebase deploy

# Test locally
firebase emulators:start

# Check active project
firebase projects:list
firebase use

# Switch projects
firebase use rootine-d5bef

# View logs
firebase functions:log
```

## Next Steps

1. ✅ Deploy rules: `firebase deploy --only firestore`
2. ✅ Deploy storage: `firebase deploy --only storage`
3. ✅ Test in Firebase Console playground
4. ✅ Monitor for errors in app
5. ✅ Add more indexes as needed

---

**Need Help?**
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Deploy Firestore Rules](https://firebase.google.com/docs/firestore/security/get-started#deploy_rules)
