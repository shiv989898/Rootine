# Social Features Testing Guide

## 🎯 Overview
This guide will help you test all social features in the Rootine app with multiple accounts.

## 📋 Prerequisites

### 1. Create Test Accounts
You'll need at least 2-3 test accounts to properly test all features:
- **Account A** (Primary Tester)
- **Account B** (Friend 1)
- **Account C** (Friend 2) - Optional but recommended

### 2. Test Devices/Emulators
- Use Expo Go on multiple devices, OR
- Use multiple browser tabs with Expo web, OR
- Use one physical device + one emulator

## 🧪 Testing Checklist

### Phase 1: User Search & Friend Requests

#### Test 1.1: Search for Users
- [ ] Open SearchUsersScreen (need to add to navigation)
- [ ] Search for Account B by email or name
- [ ] Verify search results display correctly
- [ ] Verify own account is excluded from results

#### Test 1.2: Send Friend Request
**On Account A:**
- [ ] Find Account B in search
- [ ] Tap "Add Friend" button
- [ ] Verify button changes to "Pending"
- [ ] Verify request appears in "Sent Requests" (if implemented)

**On Account B:**
- [ ] Navigate to FriendsListScreen
- [ ] Go to "Pending" tab
- [ ] Verify Account A's request appears
- [ ] Verify badge shows count (1)

#### Test 1.3: Accept Friend Request
**On Account B:**
- [ ] Tap "Accept" button on Account A's request
- [ ] Verify request moves to "Friends" tab
- [ ] Verify friend count increases

**On Account A:**
- [ ] Navigate to FriendsListScreen
- [ ] Verify Account B appears in "Friends" tab
- [ ] Verify friend count increases
- [ ] Tap on friend card to view profile

#### Test 1.4: Reject Friend Request
**Setup:** Account C sends request to Account A

**On Account A:**
- [ ] Navigate to "Pending" tab
- [ ] Tap "Reject" on Account C's request
- [ ] Verify request disappears
- [ ] Verify friend count unchanged

### Phase 2: Posts & Feed

#### Test 2.1: Create Post
**On Account A:**
- [ ] Navigate to FeedScreen
- [ ] Tap "Create Post" button
- [ ] Enter text content (< 500 chars)
- [ ] Verify character counter updates
- [ ] Post the content
- [ ] Verify post appears at top of feed
- [ ] Verify timestamp shows "Just now"

#### Test 2.2: View Feed
**On Account B:**
- [ ] Navigate to FeedScreen
- [ ] Pull to refresh
- [ ] Verify Account A's post appears (if friends)
- [ ] Verify post shows correct user info
- [ ] Verify like/comment counts show 0

#### Test 2.3: Like Posts
**On Account B:**
- [ ] Tap like button on Account A's post
- [ ] Verify like count increases to 1
- [ ] Verify button turns red/filled
- [ ] Tap again to unlike
- [ ] Verify like count decreases to 0

**On Account A:**
- [ ] Refresh feed
- [ ] Verify like count shows correctly on your post

#### Test 2.4: Comment on Posts
**On Account B:**
- [ ] Tap comment button on Account A's post
- [ ] CommentModal opens
- [ ] Enter comment text
- [ ] Submit comment
- [ ] Verify comment appears in list
- [ ] Verify comment count increases

**On Account A:**
- [ ] View your post
- [ ] Tap comment button
- [ ] Verify Account B's comment appears
- [ ] Reply to the comment
- [ ] Verify your reply appears

#### Test 2.5: Edit Post
**On Account A:**
- [ ] Find your own post
- [ ] Tap "..." menu
- [ ] Select "Edit"
- [ ] Modify content
- [ ] Save changes
- [ ] Verify post updates
- [ ] Verify "edited" indicator shows

#### Test 2.6: Delete Post
**On Account A:**
- [ ] Create a test post
- [ ] Tap "..." menu
- [ ] Select "Delete"
- [ ] Confirm deletion
- [ ] Verify post disappears from feed

**On Account B:**
- [ ] Refresh feed
- [ ] Verify deleted post doesn't appear

### Phase 3: Comments Deep Dive

#### Test 3.1: Add Comment
**On Account B:**
- [ ] Open any post
- [ ] Add comment
- [ ] Verify comment appears immediately
- [ ] Verify comment count updates

#### Test 3.2: Edit Comment (Within 5 min)
**On Account B:**
- [ ] Tap "..." on your recent comment
- [ ] Select "Edit"
- [ ] Modify comment text
- [ ] Save changes
- [ ] Verify comment updates
- [ ] Verify "edited" indicator shows

#### Test 3.3: Edit Comment (After 5 min)
**Wait 5+ minutes, then:**
- [ ] Try to edit old comment
- [ ] Verify edit option is disabled/hidden
- [ ] Verify only delete option available

#### Test 3.4: Delete Comment
**On Account B:**
- [ ] Tap "..." on your comment
- [ ] Select "Delete"
- [ ] Confirm deletion
- [ ] Verify comment disappears
- [ ] Verify comment count decreases

### Phase 4: User Profiles

#### Test 4.1: View Own Profile
**On Account A:**
- [ ] Navigate to ProfileScreen
- [ ] Verify stats show:
  - Total points
  - Current streak
  - Friend count
  - Post count
- [ ] Verify "My Posts" section shows your posts
- [ ] Tap on a post to view details

#### Test 4.2: View Friend Profile
**On Account A:**
- [ ] Navigate to FriendsListScreen
- [ ] Tap on Account B's profile icon
- [ ] Verify UserProfileScreen opens
- [ ] Verify shows Account B's info:
  - Name
  - Stats (points, streak, friends)
  - Recent posts
- [ ] Verify "Remove Friend" button appears
- [ ] DON'T tap remove yet

#### Test 4.3: View Non-Friend Profile
**On Account A:**
- [ ] Search for Account C (not friends)
- [ ] View profile
- [ ] Verify "Add Friend" button appears
- [ ] Verify limited info shown (privacy)

#### Test 4.4: Remove Friend
**On Account A:**
- [ ] View Account B's profile
- [ ] Tap "Remove Friend"
- [ ] Confirm removal
- [ ] Verify returns to previous screen
- [ ] Verify friend count decreased

**On Account B:**
- [ ] Check friends list
- [ ] Verify Account A no longer appears
- [ ] Verify friend count decreased

### Phase 5: Leaderboard

#### Test 5.1: View Leaderboard
**On Account A:**
- [ ] Navigate to LeaderboardScreen
- [ ] Verify shows ranked list of users
- [ ] Verify ranking by total points
- [ ] Verify shows:
  - Rank number
  - User name
  - Points
  - Streak days
  - Level

#### Test 5.2: Leaderboard Filtering
- [ ] Check "Friends Only" filter
- [ ] Verify only shows friends
- [ ] Uncheck filter
- [ ] Verify shows all users
- [ ] Verify rankings update correctly

#### Test 5.3: Navigate from Leaderboard
- [ ] Tap on any user in leaderboard
- [ ] Verify navigates to their profile
- [ ] Verify correct user info displayed

### Phase 6: Feed Filters

#### Test 6.1: Friends-Only Filter
**On Account A:**
- [ ] Navigate to FeedScreen
- [ ] Enable "Friends Only" filter
- [ ] Verify only posts from friends show
- [ ] Verify own posts show
- [ ] Create a new post
- [ ] Verify it appears in filtered feed

#### Test 6.2: All Users Filter
- [ ] Disable "Friends Only" filter
- [ ] Verify posts from all users appear
- [ ] Verify posts from non-friends visible
- [ ] Pull to refresh
- [ ] Verify feed updates correctly

### Phase 7: Real-time Updates

#### Test 7.1: New Post Notification
**Setup:** Two devices side by side

**On Account A:**
- [ ] Have FeedScreen open

**On Account B:**
- [ ] Create a new post

**On Account A:**
- [ ] Pull to refresh
- [ ] Verify Account B's new post appears
- [ ] Verify timestamp is accurate

#### Test 7.2: Like Updates
**On Account A:**
- [ ] View a post with comment modal open

**On Account B:**
- [ ] Like the same post

**On Account A:**
- [ ] Refresh or navigate back
- [ ] Verify like count updated

#### Test 7.3: Comment Updates
**On Account A:**
- [ ] Open comment modal on a post

**On Account B:**
- [ ] Add a comment to same post

**On Account A:**
- [ ] Close and reopen comment modal
- [ ] Verify new comment appears

### Phase 8: Edge Cases & Error Handling

#### Test 8.1: Network Issues
- [ ] Turn off WiFi/data
- [ ] Try to create post
- [ ] Verify error message shows
- [ ] Turn on network
- [ ] Retry operation
- [ ] Verify succeeds

#### Test 8.2: Duplicate Friend Request
**On Account A:**
- [ ] Send friend request to Account B
- [ ] Try to send again
- [ ] Verify shows "Pending" instead
- [ ] Verify doesn't create duplicate

#### Test 8.3: Self-Friend Request
- [ ] Try to search for own account
- [ ] Verify excluded from results OR
- [ ] Verify "Add Friend" button disabled

#### Test 8.4: Long Content
- [ ] Create post with 500 characters
- [ ] Verify posts successfully
- [ ] Try to exceed 500 characters
- [ ] Verify blocked/truncated
- [ ] Verify character counter shows red

#### Test 8.5: Empty Content
- [ ] Try to post with empty text
- [ ] Verify submit button disabled
- [ ] Enter text then delete
- [ ] Verify submit disabled again

#### Test 8.6: Rapid Actions
- [ ] Quickly like/unlike multiple times
- [ ] Verify count updates correctly
- [ ] Verify no duplicate actions
- [ ] Check in database if possible

### Phase 9: Performance & UX

#### Test 9.1: Loading States
- [ ] Navigate to FeedScreen
- [ ] Verify loading indicator shows
- [ ] Wait for content to load
- [ ] Verify smooth transition

#### Test 9.2: Pull-to-Refresh
- [ ] Pull down on FeedScreen
- [ ] Verify refresh indicator shows
- [ ] Verify feed updates
- [ ] Verify indicator disappears

#### Test 9.3: Infinite Scroll
- [ ] Scroll to bottom of feed
- [ ] Verify loads more posts
- [ ] Verify no duplicates
- [ ] Continue scrolling
- [ ] Verify handles end of list

#### Test 9.4: Navigation Flow
- [ ] Test all navigation paths:
  - Feed → Post → Comments → User Profile
  - Friends → Profile → Posts → Comments
  - Search → Profile → Add Friend → Friends List
- [ ] Verify back button works correctly
- [ ] Verify no navigation errors

## 🐛 Common Issues to Check

### Data Consistency
- [ ] Friend counts match actual friend list
- [ ] Like counts accurate across all views
- [ ] Comment counts match actual comments
- [ ] Post counts match user's posts
- [ ] Timestamps display correctly
- [ ] User info consistent everywhere

### UI/UX Issues
- [ ] All icons render correctly
- [ ] Colors consistent with design
- [ ] Text not truncated unexpectedly
- [ ] Buttons respond to touch
- [ ] Modals open/close smoothly
- [ ] No overlapping UI elements

### Security & Privacy
- [ ] Can't edit other users' posts
- [ ] Can't delete other users' comments
- [ ] Can't view private user data
- [ ] Authentication required for all actions

## 📊 Test Results Template

```markdown
## Test Session: [Date]
**Tester:** [Your Name]
**Devices:** [Device 1, Device 2]
**Accounts:** [Account A Email, Account B Email]

### Results Summary
- ✅ Passed: X tests
- ❌ Failed: Y tests
- ⚠️ Issues: Z issues found

### Failed Tests
1. [Test Name]
   - **Issue:** [Description]
   - **Steps to Reproduce:** [Steps]
   - **Expected:** [Expected behavior]
   - **Actual:** [Actual behavior]
   - **Priority:** High/Medium/Low

### Issues Found
1. [Issue Description]
   - **Severity:** Critical/Major/Minor
   - **Location:** [Screen/Component]
   - **Suggested Fix:** [Fix suggestion]

### Performance Notes
- Feed load time: [X seconds]
- Post creation time: [X seconds]
- Search responsiveness: [Good/Fair/Poor]
```

## 🎉 Testing Complete!

Once all tests pass, you have a fully functional social feature set! 🚀

## 📝 Notes for Developers

### Quick Test Commands
```bash
# Clear app data (Android)
adb shell pm clear com.yourapp.name

# View logs
npx react-native log-android
npx react-native log-ios

# Check Firestore rules
# Visit Firebase Console → Firestore → Rules
```

### Test Data Cleanup
After testing, consider cleaning up test data:
- Delete test posts
- Remove test friend connections
- Clear test comments

### Automation Opportunities
Consider adding:
- E2E tests with Detox
- Unit tests for social service functions
- Integration tests for components
- Snapshot tests for UI consistency
