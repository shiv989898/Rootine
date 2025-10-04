# Firestore Security Rules for Rootine App

## Overview
These security rules protect your Firestore database by ensuring users can only access and modify their own data.

## Collections Covered

### 1. **users** - User Profiles
- ✅ Users can read/update their own profile
- ✅ Users can create their profile once
- ❌ Users cannot delete profiles (handled by Cloud Functions)
- ❌ Users cannot change email or createdAt

### 2. **habits** - Habit Tracking
- ✅ Users can CRUD their own habits
- ✅ Validates habit name length (1-100 chars)
- ✅ Validates frequency type (daily/weekly/custom)
- ❌ Users cannot access other users' habits

### 3. **habitCompletions** - Habit Check-ins
- ✅ Users can CRUD their own completions
- ✅ Validates timestamps
- ❌ Users cannot modify other users' completions

### 4. **dietPlans** - AI-Generated Meal Plans
- ✅ Users can CRUD their own diet plans
- ✅ Validates calories > 0
- ❌ Users cannot access other users' plans

### 5. **posts** - Social Feed
- ✅ All authenticated users can read posts
- ✅ Users can create/update/delete their own posts
- ✅ Content length: 1-1000 characters
- ✅ New posts start with 0 likes/comments
- ❌ Cannot transfer post ownership

### 6. **postLikes** - Post Reactions
- ✅ All authenticated users can read likes
- ✅ Users can like/unlike posts
- ❌ Cannot update likes (only create/delete)

### 7. **comments** - Post Comments
- ✅ All authenticated users can read comments
- ✅ Users can create/delete their own comments
- ✅ Users can edit comments within 5 minutes
- ✅ Content length: 1-500 characters

### 8. **friendships** - Social Connections
- ✅ Users can read friendships they're part of
- ✅ Users can send friend requests (status: pending)
- ✅ Recipients can accept/reject requests
- ✅ Either party can delete friendship

### 9. **challenges** - Gamification
- ✅ All users can read public challenges
- ✅ Creators can create/update/delete challenges
- ✅ Validates start date < end date
- ✅ Name: 1-100 chars, Description: 1-500 chars

### 10. **userChallenges** - Challenge Participation
- ✅ Users can join/leave challenges
- ✅ Users can update their own progress
- ❌ Cannot modify other users' progress

### 11. **userPoints** - Gamification Points
- ✅ Users can read their own points
- ✅ New users start with 0 points, level 1
- ❌ Only Cloud Functions can update points
- ❌ No manual updates or deletions

### 12. **badges** - Achievement Badges
- ✅ All users can read badges
- ❌ Only Cloud Functions can create badges

### 13. **userBadges** - User Achievements
- ✅ Users can read their own badges
- ❌ Only Cloud Functions can award badges

### 14. **shoppingLists** - Grocery Lists
- ✅ Users can CRUD their own shopping lists
- ❌ Cannot access other users' lists

### 15. **notifications** - User Notifications
- ✅ Users can read/update/delete their own notifications
- ✅ System can create notifications
- ✅ Users can mark as read

## Security Features

### Authentication
- All operations require authentication (`request.auth != null`)
- No anonymous access to any data

### Ownership Validation
- Users can only access/modify their own data
- `userId` field must match `request.auth.uid`

### Data Validation
- String length validation (prevents spam/abuse)
- Timestamp validation (ensures valid dates)
- Type checking (numbers, strings, timestamps)
- Immutable fields (createdAt, email, userId)

### Rate Limiting
- Comment edits limited to 5 minutes after creation
- Prevents abuse and maintains data integrity

### Default Deny
- All unlisted paths are denied by default
- Principle of least privilege

## How to Deploy

### Option 1: Firebase Console (Manual)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `rootine-d5bef`
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules`
5. Paste into the rules editor
6. Click **Publish**

### Option 2: Firebase CLI (Recommended)
```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# When prompted:
# - Select your project: rootine-d5bef
# - Use default firestore.rules location
# - Use default firestore.indexes.json location

# Deploy rules
firebase deploy --only firestore:rules
```

### Option 3: Using firebase.json
If you have `firebase.json` configured:
```bash
firebase deploy --only firestore:rules
```

## Testing Rules

### Test in Firebase Console
1. Go to **Firestore Database** → **Rules**
2. Click **Rules Playground** tab
3. Test different scenarios:
   - User reading their own data (should pass)
   - User reading another user's data (should fail)
   - Unauthenticated access (should fail)

### Test with Firebase Emulator
```bash
# Install emulator
firebase emulators:start --only firestore

# Run your app against emulator
# Set in .env:
# EXPO_PUBLIC_USE_FIRESTORE_EMULATOR=true
```

### Example Test Cases
```javascript
// ✅ Should PASS - User reads own habit
match /habits/habit123
  auth.uid = "user123"
  resource.data.userId = "user123"

// ❌ Should FAIL - User reads another's habit
match /habits/habit456
  auth.uid = "user123"
  resource.data.userId = "user456"

// ❌ Should FAIL - Unauthenticated access
match /posts/post123
  auth = null
```

## Common Issues

### Issue: "Missing or insufficient permissions"
**Cause:** User trying to access data they don't own
**Solution:** Ensure `userId` in document matches `request.auth.uid`

### Issue: "Invalid data"
**Cause:** Data doesn't meet validation rules
**Solution:** Check string lengths, required fields, and data types

### Issue: "Cannot update immutable field"
**Cause:** Trying to modify createdAt, email, or userId
**Solution:** Remove these fields from update payload

## Security Best Practices

1. **Never expose API keys in client code** ✅ (Already using env vars)
2. **Always validate user input** ✅ (String length, types checked)
3. **Use server-side logic for sensitive operations** ✅ (Points, badges via Cloud Functions)
4. **Log security events** 📝 (Consider adding Cloud Functions logging)
5. **Regular security audits** 🔍 (Review rules periodically)

## Next Steps

1. **Deploy these rules** to your Firebase project
2. **Test thoroughly** using the Firebase Console playground
3. **Monitor security** in Firebase Console → Firestore → Rules metrics
4. **Set up Cloud Functions** for points and badge awarding
5. **Add indexes** for common queries (see `firestore.indexes.json`)

## Need Help?

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Security Rules Reference](https://firebase.google.com/docs/rules/rules-language)
- [Common Security Rules Patterns](https://firebase.google.com/docs/firestore/security/rules-conditions)

---

**Last Updated:** October 4, 2025  
**Project:** Rootine  
**Firebase Project ID:** rootine-d5bef
