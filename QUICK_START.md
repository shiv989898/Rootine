# 🚀 Quick Start - Testing Social Features

## Ready to Test in 5 Minutes!

### Step 1: Run the App (1 min)
```bash
npx expo start
```
- Scan QR code with Expo Go on your phone
- Or press `a` for Android emulator
- Or press `i` for iOS simulator

### Step 2: Create Test Accounts (2 min)

#### Device 1 - Account A (Primary)
1. Open app → Tap "Sign Up"
2. Enter:
   - Name: Test User A
   - Email: `testa@example.com`
   - Password: `test123456`
3. Complete profile setup

#### Device 2 - Account B (Friend)
1. Open app → Tap "Sign Up"  
2. Enter:
   - Name: Test User B
   - Email: `testb@example.com`
   - Password: `test123456`
3. Complete profile setup

### Step 3: Test Friend Request (2 min)

**On Device 1 (Account A):**
1. Tap **Profile** tab (bottom right)
2. Tap **"Find Friends"** menu option
3. Type `testb@example.com` in search
4. Tap **"Add Friend"** button next to Test User B
5. ✅ Button changes to "Pending"

**On Device 2 (Account B):**
1. Tap **Profile** tab
2. Notice red badge (1) on **"Friends"** menu option
3. Tap **"Friends"**
4. Tap **"Pending"** tab (shows badge: 1)
5. See Test User A's friend request
6. Tap **green ✓ (Accept)** button
7. ✅ Request moves to "Friends" tab

**Verify:**
- Both accounts: Friend count increased
- Both can see each other in Friends tab

### Step 4: Test Posts (2 min)

**On Device 1 (Account A):**
1. Tap **Feed** tab
2. Tap **green + button** (bottom right)
3. Type: "Hello from Test User A! 👋"
4. Tap **"Post"**
5. ✅ Post appears at top of feed

**On Device 2 (Account B):**
1. Tap **Feed** tab
2. Pull down to refresh
3. ✅ See Test User A's post
4. Tap **❤️ (Like)** button
5. Tap **💬 (Comment)** button
6. Type: "Nice post!"
7. Tap **"Post"**

**On Device 1 (Account A):**
1. Pull to refresh feed
2. ✅ See like count: 1
3. ✅ See comment count: 1
4. Tap comment button
5. ✅ See Test User B's comment

### 🎉 Success!

You've tested:
- ✅ User search
- ✅ Friend requests
- ✅ Accepting friends
- ✅ Creating posts
- ✅ Liking posts
- ✅ Commenting on posts

---

## 🔍 What to Test Next

### 5. Test Remove Friend
1. **Account A:** Friends → Tap friend card → Tap "Remove" button
2. Confirm removal
3. **Account B:** Check friends list → Account A should be gone

### 6. Test Edit Post (< 5 min after posting)
1. **Account A:** Find your post → Tap **⋮** menu → "Edit"
2. Change text
3. Save
4. ✅ Post updates with "edited" indicator

### 7. Test Delete Post
1. **Account A:** Tap **⋮** menu → "Delete"
2. Confirm
3. ✅ Post disappears from feed

### 8. Test Friends-Only Filter
1. **Account A:** Feed → Tap filter icon (top right)
2. Toggle "Friends Only"
3. ✅ Only see posts from friends + yourself

---

## 📋 Full Testing Checklist

See `TESTING_GUIDE.md` for comprehensive testing (9 phases, 80+ tests)

---

## 🐛 Common Issues

### Issue: Can't find user in search
**Solution:** 
- Check spelling of email/name
- Must type at least 2 characters
- User must exist in database
- You can't search for yourself

### Issue: Friend request not showing
**Solution:**
- Pull to refresh on Friends screen
- Check "Pending" tab
- Verify friend request was sent (check sender's app)

### Issue: Posts not appearing
**Solution:**
- Pull to refresh
- Check Friends-Only filter is OFF
- Verify post was created (check poster's feed)
- Check internet connection

### Issue: App crashes
**Solution:**
- Check console for errors
- Verify Firebase connection
- Restart Expo server
- Clear app cache

---

## 📱 Navigation Map

```
Bottom Tabs:
├── Home - Dashboard with habits
├── Habits - Habit tracking
├── Feed - Social feed (posts)
├── Diet - Meal planning
└── Profile - Your profile
    ├── Friends → FriendsListScreen
    │   ├── Friends tab
    │   └── Pending tab
    └── Find Friends → SearchUsersScreen
```

---

## 🎯 Key Features to Test

### Must Test:
- [x] Search users
- [x] Send friend request
- [x] Accept friend request
- [x] Create post
- [x] Like post
- [x] Comment on post

### Should Test:
- [ ] Reject friend request
- [ ] Remove friend
- [ ] Edit post
- [ ] Delete post
- [ ] Edit comment
- [ ] Delete comment
- [ ] Friends-only filter
- [ ] Pull to refresh
- [ ] View friend's profile

### Nice to Test:
- [ ] Long posts (>500 chars blocked)
- [ ] Rapid like/unlike
- [ ] Multiple comments
- [ ] Search by partial name
- [ ] Empty states (no posts, no friends)
- [ ] Network errors (turn off WiFi)

---

## 💡 Testing Tips

1. **Use Real Devices:** Better than emulator for testing
2. **Side by Side:** Test with devices next to each other
3. **Pull to Refresh:** Always refresh to see updates
4. **Check Console:** Keep an eye on error logs
5. **Test Edge Cases:** Try to break it!

---

## 📞 Need Help?

1. Check error logs in console
2. Review `TESTING_GUIDE.md`
3. Check `SOCIAL_FEATURES_SUMMARY.md`
4. Verify Firebase is connected
5. Restart app and try again

---

## 🎊 Ready to Build?

Once testing is successful, you can:
1. Fix any bugs found
2. Build APK for distribution
3. Share with friends to test
4. Continue to next features

---

**Happy Testing! 🚀**

Remember: This is a test environment. Don't be afraid to break things!
