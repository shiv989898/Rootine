# 🔥 URGENT: Deploy Firestore Rules to Fix Signup Issue

## Problem
Your app is creating accounts in Firebase Authentication, but failing to create user profiles in Firestore because **Firestore security rules are blocking the writes**.

## Solution: Deploy Rules via Firebase Console

### Step 1: Open Firebase Console
1. Go to: **https://console.firebase.google.com/**
2. Click on your project: **Rootine** (rootine-d5bef)

### Step 2: Navigate to Firestore Rules
1. In the left sidebar, click **"Firestore Database"**
2. Click the **"Rules"** tab at the top

### Step 3: Copy the Rules
1. Open the file: `DEPLOY_THESE_RULES.txt` in this folder
2. **Select all** the text (Ctrl+A)
3. **Copy it** (Ctrl+C)

### Step 4: Paste and Publish
1. In the Firebase Console Rules editor, **select all existing rules** (Ctrl+A)
2. **Paste** the new rules (Ctrl+V)
3. Click the **"Publish"** button (blue button in the top right)
4. Wait for the success message

### Step 5: Test Signup
1. **Close your Expo app completely** and restart it
2. Try signing up with a **NEW email address** (not one you used before)
3. The signup should now work! ✅

---

## Alternative: Clean Up Old Accounts (Optional)

If you want to test with an email you already used:

1. Go to Firebase Console → **Authentication** → **Users**
2. Find the test accounts that failed to create profiles
3. Click the **three dots** (⋮) next to each account
4. Click **"Delete account"**
5. Now you can sign up with that email again

---

## Why This Happened

- Firebase Authentication creates accounts immediately
- But Firestore document creation was blocked by security rules
- This created "orphaned" accounts (Auth exists, but no Firestore profile)
- The code changes I made will now:
  - ✅ Show clear error messages
  - ✅ Automatically delete Auth accounts if Firestore fails
  - ✅ Prevent orphaned accounts in the future

---

## After Deployment

Once you publish the rules, you should be able to:
- ✅ Sign up new accounts successfully
- ✅ Sign in with those accounts
- ✅ Complete profile setup
- ✅ Use all app features (Habits, Diet, etc.)

---

## Need Help?

If you get stuck:
1. Take a screenshot of any error messages
2. Check the browser console in Firebase Console
3. Try restarting the Expo app after publishing rules

Let me know once you've published the rules and I'll help you test! 🚀
