# 🔥 Fix Firestore Index Error

## Problem
You're getting an error: "The query requires an index"

This happens when Firestore needs a composite index for queries that filter/sort by multiple fields.

## Quick Fix: Click the Link

The error message contains a direct link to create the index. Click this link:

**https://console.firebase.google.com/v1/r/project/rootine-d5bef/firestore/indexes?create_composite=Ckxwcm9qZWN0cy9yb290aW5lLWQ1YmVmL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9oYWJpdHMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg**

### Steps:
1. Click the link above (it will open Firebase Console)
2. You'll see a page that says "Create Index"
3. The fields will be pre-filled:
   - Collection: `habits`
   - Fields: `userId` (Ascending), `createdAt` (Descending)
4. Click **"Create Index"** button
5. Wait 2-5 minutes for the index to build
6. Refresh your app and try creating a habit again ✅

---

## Alternative: Deploy All Indexes at Once

If you want to deploy all the indexes we created earlier:

```bash
firebase deploy --only firestore:indexes --project rootine-d5bef
```

This will deploy all 13 indexes from `firestore.indexes.json` at once.

---

## What Was Fixed

I also fixed the **duplicate keys warning** by:
- Removing duplicate colors from the `HABIT_COLORS` array
- Now using unique color values only
- Added better key generation with `color-${index}-${colorOption}`

---

## Test Again

After the index is created:
1. Go back to your app
2. Try creating a habit
3. Should work without errors! 🎉
