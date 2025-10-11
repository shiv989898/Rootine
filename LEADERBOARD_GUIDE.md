# 🏆 Global Leaderboard System - Implementation Guide

## Overview
The Global Leaderboard System provides competitive gamification for Rootine, allowing users to compete globally, with friends, and across different time periods (weekly, monthly, all-time).

---

## ✅ Completed Components

### 1. Leaderboard Service Layer
**File:** `src/services/firebase/leaderboardService.ts`

**8 Core Functions:**

#### `getGlobalLeaderboard(period, limitCount, lastDoc)`
Fetches ranked users based on time period.

```typescript
// Get top 100 users for all-time leaderboard
const leaderboard = await getGlobalLeaderboard('all-time', 100);

// Get top 50 for weekly
const weekly = await getGlobalLeaderboard('weekly', 50);
```

**Features:**
- Supports periods: `'all-time'`, `'weekly'`, `'monthly'`
- Pagination with `lastDoc` parameter
- Sorted by points (desc) with streak as tie-breaker
- Returns `LeaderboardEntry[]` with rank, points, streak, level

**Firestore Query:**
```typescript
query(
  usersRef,
  orderBy('profile.points', 'desc'),
  orderBy('profile.currentStreak', 'desc'),
  limit(100)
)
```

---

#### `getFriendsLeaderboard()`
Gets leaderboard for user's friends only.

```typescript
const friendsLeaderboard = await getFriendsLeaderboard();
// Includes current user + all friends, sorted by points
```

**Features:**
- Fetches friends from `user.friends` array
- Chunks requests (Firestore `in` query limit = 10)
- Adds current user to list
- Calculates ranks after sorting
- Returns empty array if no friends

**Use Case:** "Compare with friends" feature

---

#### `getUserRank(period)`
Gets current user's global rank.

```typescript
const rank = await getUserRank('all-time'); // e.g., 42
const weeklyRank = await getUserRank('weekly'); // e.g., 15
```

**Features:**
- Counts users with higher score
- Works for all periods
- Returns 1-indexed rank (1 = best)
- Used for "Your Rank: #42" display

**Algorithm:**
```typescript
// Count users with score > user's score
const higherUsersCount = await getDocs(
  query(usersRef, where('profile.points', '>', userScore))
);
return higherUsersCount.size + 1;
```

---

#### `getLeaderboardStats()`
Gets aggregate statistics.

```typescript
const stats = await getLeaderboardStats();
// { totalUsers: 1234, averagePoints: 450, topScore: 9500 }
```

**Returns:**
- `totalUsers`: Total registered users
- `averagePoints`: Average points across all users
- `topScore`: Highest point total

**Use Case:** Stats dashboard at top of leaderboard

---

#### `getNearbyUsers(range)`
Gets users near current user's rank.

```typescript
const nearby = await getNearbyUsers(5);
// If user is rank 50, returns ranks 45-55
```

**Features:**
- Shows context around user's position
- Helpful for "climb the ladder" motivation
- Range parameter controls how many above/below

---

#### `searchLeaderboard(searchQuery, limitCount)`
Searches users by display name.

```typescript
const results = await searchLeaderboard('john', 20);
// Returns up to 20 users with "john" in name
```

**Features:**
- Case-insensitive search
- Returns sorted by points
- Includes rank in results
- Limited to 20 results by default

**Note:** Uses client-side filtering (Firestore lacks full-text search). For production, consider Algolia.

---

#### `resetPeriodPoints(period)`
Resets weekly/monthly points (Cloud Function).

```typescript
// This should be called by Firebase Cloud Function
// Weekly: Every Monday 00:00
// Monthly: First day of month 00:00
await resetPeriodPoints('weekly');
```

**Important:** Placeholder function - implement in Cloud Functions for automated resets.

---

#### `chunkArray<T>(array, size)`
Utility function for batching Firestore queries.

```typescript
const chunks = chunkArray(friendIds, 10);
// Splits [1,2,3,...,25] into [[1-10], [11-20], [21-25]]
```

---

## 2. Leaderboard Screen UI
**File:** `src/screens/leaderboard/LeaderboardScreen.tsx`

### Features

#### **Stats Dashboard**
Displays at top of screen:
- 📊 **Total Players**: Active user count
- 📈 **Avg Points**: Average across all users
- 🏆 **Top Score**: Highest point total

#### **User Rank Card**
Shows current user's position:
```
🥇 Your Rank
   #42

Top 100!
```

Color-coded messages:
- Rank 1: "🎉 You're #1!"
- Rank 2-10: "Top 10!"
- Rank 11-100: "Top 100!"
- Rank 101+: "Keep climbing!"

#### **Search Bar**
Real-time search functionality:
- Search icon + input field
- Loading spinner while searching
- Clear button (X) when query exists
- Searches as user types

#### **4 Tabs**
1. **Global** 🌍 - All-time points leaderboard
2. **Friends** 👥 - Your friends only
3. **Weekly** 📅 - This week's points
4. **Monthly** 📆 - This month's points

Each tab:
- Active state with green color
- Icon + label
- Loads appropriate data

#### **Leaderboard Items**
Each user row displays:

**Rank Badge:**
- 🥇 #1: Gold trophy icon
- 🥈 #2: Silver medal icon  
- 🥉 #3: Bronze medal icon
- #4+: Gray numbered badge

**User Info:**
- Avatar (or placeholder)
- Display name
- "(You)" suffix for current user
- Streak badge: 🔥 X day streak
- Level badge: ⭐ Level X

**Points Display:**
- Large number (context-based)
- "pts" label
- Green color (#4CAF50)

**Current User Highlighting:**
- Green border (2px)
- Light green background (#F1F8F4)
- Name in green color

#### **Empty States**
- No friends: "No friends yet. Add friends to compete!"
- No data: "No leaderboard data available"
- "Add Friends" button for friends tab

#### **Pull to Refresh**
- Standard RefreshControl
- Green loading indicator
- Refreshes leaderboard + stats

---

## 3. Type Definitions
**File:** `src/types/index.ts`

### Extended User Types

```typescript
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isGuest?: boolean;
  profile: UserProfile;
  friends?: string[]; // NEW: User IDs for social features
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  displayName?: string; // NEW: User's display name
  photoURL?: string; // NEW: User's avatar URL
  points: number; // Total all-time points
  weeklyPoints?: number; // NEW: Points earned this week
  monthlyPoints?: number; // NEW: Points earned this month
  currentStreak?: number; // NEW: Current habit streak
  // ... other fields
}
```

### LeaderboardEntry Interface

```typescript
export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar?: string;
  rank: number; // 1-indexed position
  points: number; // Total points
  streak: number; // Current streak
  level: number; // Calculated: points / 100
  weeklyPoints?: number; // This week's points
  monthlyPoints?: number; // This month's points
}
```

### LeaderboardPeriod Type

```typescript
export type LeaderboardPeriod = 
  | 'all-time' // Total career points
  | 'weekly'   // Points this week (Monday-Sunday)
  | 'monthly'  // Points this month
  | 'friends'; // Friends-only competition
```

---

## 4. Navigation Integration

### Routes Added

**Type Definition:**
```typescript
export type RootStackParamList = {
  // ... other routes
  Leaderboard: undefined; // NEW
};
```

**App.tsx:**
```typescript
import LeaderboardScreen from './src/screens/leaderboard/LeaderboardScreen';

// In Stack Navigator
<Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
```

**HomeScreen Quick Action:**
```typescript
<QuickActionButton 
  iconName="podium-gold" 
  label="Leaderboard" 
  onPress={() => navigation.navigate('Leaderboard')} 
/>
```

---

## 🎨 UI/UX Design

### Color Scheme
- **Rank 1 (Gold)**: `#FFD700`
- **Rank 2 (Silver)**: `#C0C0C0`
- **Rank 3 (Bronze)**: `#CD7F32`
- **Rank 4+ (Gray)**: `#666`
- **Primary Green**: `#4CAF50`
- **User Highlight**: `#F1F8F4` (light green background)

### Typography
- **Title**: 20px bold
- **Rank Text**: 16px bold (white)
- **User Name**: 16px semibold
- **Points**: 20px bold (green)
- **Stat Value**: 20px bold
- **Stat Label**: 12px regular

### Layout
- **Card Shadows**: elevation 2-3
- **Border Radius**: 12px (cards), 8px (tabs)
- **Padding**: 16px standard
- **Gap**: 12px between elements
- **Avatar Size**: 48x48px

### Icons (MaterialCommunityIcons)
- **Trophy**: 🏆 `trophy` (rank 1)
- **Medal**: 🥈 `medal` (rank 2)
- **Medal Outline**: 🥉 `medal-outline` (rank 3)
- **Fire**: 🔥 `fire` (streak)
- **Star**: ⭐ `star` (level/points)
- **Earth**: 🌍 `earth` (global)
- **Account Group**: 👥 `account-group` (friends)
- **Calendar Week**: 📅 `calendar-week` (weekly)
- **Calendar Month**: 📆 `calendar-month` (monthly)
- **Podium**: 🏅 `podium-gold` (leaderboard)

---

## 📊 Data Flow

### Loading Leaderboard

```
User Opens Leaderboard
    ↓
Load Stats (getLeaderboardStats)
    ↓
Check Active Tab
    ↓
┌─────────────┬──────────────┬──────────────┬──────────────┐
│   Global    │   Friends    │   Weekly     │   Monthly    │
└─────────────┴──────────────┴──────────────┴──────────────┘
    ↓               ↓               ↓               ↓
getGlobalLeaderboard  getFriendsLeaderboard  getGlobalLeaderboard
('all-time', 100)                           ('weekly', 100)
    ↓               ↓               ↓               ↓
getUserRank         Find user in   getUserRank     getUserRank
('all-time')        friends list   ('weekly')      ('monthly')
    ↓               ↓               ↓               ↓
Display Ranked List + User's Position
    ↓
Pull to Refresh → Reload Everything
    ↓
Search Bar → searchLeaderboard(query)
```

### Rank Calculation

```typescript
// Server-side (Firestore query)
1. Sort all users by points DESC
2. Enumerate results: [User1=Rank1, User2=Rank2, ...]
3. Return top 100

// Client-side (for user rank)
1. Get user's points
2. Count users with points > user's points
3. Rank = count + 1
```

---

## 🔥 Performance Optimization

### Firestore Indexes Required

Create composite indexes:

```
Collection: users
Fields:
  - profile.points (Descending)
  - profile.currentStreak (Descending)

Collection: users  
Fields:
  - profile.weeklyPoints (Descending)
  - profile.points (Descending)

Collection: users
Fields:
  - profile.monthlyPoints (Descending)
  - profile.points (Descending)
```

Firebase will prompt to create these automatically on first query.

### Pagination Strategy

```typescript
// Load initial 100
const firstPage = await getGlobalLeaderboard('all-time', 100);

// Get last document
const lastDoc = firstPage[firstPage.length - 1];

// Load next 100
const secondPage = await getGlobalLeaderboard('all-time', 100, lastDoc);
```

### Caching Strategy

```typescript
// Cache leaderboard data for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
let cachedLeaderboard = null;
let cacheTimestamp = 0;

const getLeaderboard = async () => {
  const now = Date.now();
  if (cachedLeaderboard && now - cacheTimestamp < CACHE_DURATION) {
    return cachedLeaderboard;
  }
  
  cachedLeaderboard = await getGlobalLeaderboard('all-time', 100);
  cacheTimestamp = now;
  return cachedLeaderboard;
};
```

---

## 🚀 Usage Examples

### Example 1: View Global Leaderboard

```typescript
import { getGlobalLeaderboard } from '@/services/firebase/leaderboardService';

const loadGlobal = async () => {
  const leaderboard = await getGlobalLeaderboard('all-time', 100);
  console.log('Top user:', leaderboard[0].userName, leaderboard[0].points);
  
  // Display in FlatList
  <FlatList
    data={leaderboard}
    renderItem={({ item }) => <LeaderboardRow entry={item} />}
    keyExtractor={item => item.userId}
  />
};
```

### Example 2: Check User's Rank

```typescript
import { getUserRank } from '@/services/firebase/leaderboardService';

const checkMyRank = async () => {
  const rank = await getUserRank('all-time');
  
  if (rank === 1) {
    alert("🎉 You're #1!");
  } else if (rank <= 10) {
    alert(`Great job! You're in the top 10 at rank #${rank}`);
  } else {
    alert(`Your rank: #${rank}. Keep going!`);
  }
};
```

### Example 3: Friends Competition

```typescript
import { getFriendsLeaderboard } from '@/services/firebase/leaderboardService';

const compareFriends = async () => {
  const friends = await getFriendsLeaderboard();
  
  if (friends.length === 0) {
    console.log('No friends yet. Add some to compete!');
    return;
  }
  
  const me = friends.find(f => f.userId === auth.currentUser?.uid);
  console.log(`You're rank #${me?.rank} among your friends!`);
  
  const top3 = friends.slice(0, 3);
  console.log('Top 3 friends:', top3.map(f => f.userName));
};
```

### Example 4: Weekly Challenge Winner

```typescript
import { getGlobalLeaderboard } from '@/services/firebase/leaderboardService';

const getWeeklyWinner = async () => {
  const weekly = await getGlobalLeaderboard('weekly', 1);
  
  if (weekly.length > 0) {
    const winner = weekly[0];
    console.log(`This week's winner: ${winner.userName}`);
    console.log(`Weekly points: ${winner.weeklyPoints}`);
    
    // Award special badge or notification
    await awardBadge(winner.userId, 'Weekly Champion');
  }
};
```

### Example 5: Search for User

```typescript
import { searchLeaderboard } from '@/services/firebase/leaderboardService';

const findUser = async (name: string) => {
  const results = await searchLeaderboard(name, 10);
  
  if (results.length === 0) {
    console.log(`No users found matching "${name}"`);
    return;
  }
  
  console.log(`Found ${results.length} users:`);
  results.forEach(user => {
    console.log(`- ${user.userName} (Rank #${user.rank}, ${user.points} pts)`);
  });
};
```

---

## 🔄 Integration Points

### With Challenge System

```typescript
// When user claims challenge reward
import { claimChallengeReward } from '@/services/firebase/challengeService';

const claimReward = async (challengeId: string) => {
  const pointsAwarded = await claimChallengeReward(challengeId);
  
  // Points automatically added to user.profile.points
  // Leaderboard will reflect new total on next load
  
  // Optional: Check if user's rank improved
  const newRank = await getUserRank('all-time');
  console.log(`New rank: #${newRank}`);
};
```

### With Habit Completion

```typescript
// When user completes habit
import { updateDoc, doc, increment } from 'firebase/firestore';

const completeHabit = async (habitId: string) => {
  // Award points for habit completion
  await updateDoc(doc(db, 'users', userId), {
    'profile.points': increment(10),
    'profile.weeklyPoints': increment(10),
    'profile.monthlyPoints': increment(10),
  });
  
  // User's leaderboard position updates automatically
};
```

### With Achievements

```typescript
// When achievement unlocked
const unlockAchievement = async (userId: string, achievement: string) => {
  // Award bonus points
  await updateDoc(doc(db, 'users', userId), {
    'profile.points': increment(50), // Achievement bonus
  });
  
  // Check if user entered top 100
  const rank = await getUserRank('all-time');
  if (rank <= 100) {
    await sendNotification(userId, "You're in the top 100! 🎉");
  }
};
```

---

## 📱 User Experience Flow

### First Time User

1. Opens app → Completes profile setup
2. Navigates Home → Sees "Leaderboard" button
3. Taps "Leaderboard" → Opens LeaderboardScreen
4. Sees Global tab (default)
5. Views top 100 users
6. Sees "Your Rank: #1234"
7. Taps Friends tab → Empty state
8. Taps "Add Friends" → Goes to SearchUsers
9. Adds friends → Returns to Leaderboard
10. Friends tab now shows competition! 🎉

### Engaged User

1. Completes daily habits
2. Checks Leaderboard → Rank improved!
3. Switches to Weekly tab → Top 50!
4. Searches for specific friend
5. Sees they're ahead → Motivation to do more habits
6. Completes challenge → Earns 50 points
7. Refreshes leaderboard → Climbed 5 ranks!
8. Achievement unlocked: "Top 100 Climber" 🏆

---

## 🐛 Known Limitations

### 1. Real-time Updates
**Issue:** Leaderboard doesn't update in real-time
**Workaround:** Pull-to-refresh functionality
**Future:** Implement Firestore snapshot listeners

### 2. Search Performance
**Issue:** Client-side search limited to first 100 results
**Workaround:** Works for most use cases
**Future:** Integrate Algolia or Typesense for full-text search

### 3. Weekly/Monthly Reset
**Issue:** No automatic reset implemented yet
**Workaround:** Manually reset during testing
**Future:** Cloud Functions with cron schedule

### 4. Rank Calculation Scale
**Issue:** Rank calculation queries all users (expensive at scale)
**Workaround:** Acceptable for < 10k users
**Future:** Pre-calculate ranks with Cloud Function

### 5. Friends List Size
**Issue:** Firestore `in` query limited to 10 items per chunk
**Workaround:** Chunks requests in batches
**Future:** Denormalize friends data for faster queries

---

## 🔮 Future Enhancements

### Phase 2 Features

1. **Real-time Rank Changes**
   - Firestore snapshot listeners
   - Live position updates
   - Push notification on rank change

2. **Advanced Filtering**
   - Filter by region/country
   - Filter by age group
   - Filter by activity level

3. **Leaderboard Challenges**
   - Weekly tournaments
   - Bracket-style competitions
   - Prize pools for winners

4. **Social Features**
   - Challenge friend directly
   - Trash talk / kudos system
   - Share rank on social media

5. **Analytics Dashboard**
   - Personal rank history graph
   - Points earned over time
   - Comparison with averages

6. **Seasonal Leagues**
   - Promotion/relegation system
   - Bronze/Silver/Gold/Diamond tiers
   - Season rewards

---

## 🧪 Testing Checklist

### Functional Tests

- [ ] Global leaderboard loads top 100
- [ ] Friends leaderboard shows only friends
- [ ] Weekly leaderboard uses weeklyPoints
- [ ] Monthly leaderboard uses monthlyPoints
- [ ] User rank displays correctly
- [ ] Rank badges show correct icons/colors
- [ ] Current user highlighted with green border
- [ ] Search returns matching users
- [ ] Search clears results properly
- [ ] Pull-to-refresh updates data
- [ ] Empty state for no friends works
- [ ] Navigation from HomeScreen works
- [ ] Back button returns to previous screen

### Edge Cases

- [ ] No friends → Shows empty state
- [ ] User not ranked → Handles gracefully
- [ ] Tie in points → Streak used as tie-breaker
- [ ] 0 points users → Displayed at bottom
- [ ] Deleted users → Handled in queries
- [ ] Network error → Shows error message
- [ ] Large user base (1000+) → Pagination works
- [ ] Search with no results → Shows empty
- [ ] Special characters in names → Searches correctly

### Performance Tests

- [ ] Loads in < 2 seconds
- [ ] Smooth scrolling with 100 items
- [ ] Search responds quickly (< 500ms)
- [ ] Pull-to-refresh doesn't lag
- [ ] Images load progressively
- [ ] No memory leaks on tab switching

---

## 📈 Success Metrics

### Track These KPIs

- **Daily leaderboard views**: How many users check daily
- **Rank improvement rate**: % users improving rank weekly
- **Friends competition**: % users with 5+ friends
- **Search usage**: % users searching for others
- **Tab usage**: Most popular tab (Global vs Friends vs Weekly)
- **Time on screen**: Average session duration
- **Return rate**: Users returning to check rank

### Expected Impact

- ↑ 30% increase in daily active users
- ↑ 25% increase in habit completion rate
- ↑ 40% increase in challenge participation
- ↑ 50% increase in friend connections
- ↑ 20% increase in session duration
- ↓ 15% decrease in churn rate

---

## 🎓 Best Practices

### For Developers

1. **Always handle loading states**
   ```typescript
   if (loading) return <LoadingSpinner />;
   ```

2. **Provide empty states**
   ```typescript
   if (data.length === 0) return <EmptyState />;
   ```

3. **Use pull-to-refresh**
   ```typescript
   <FlatList refreshControl={<RefreshControl ... />} />
   ```

4. **Cache appropriately**
   - Don't fetch on every render
   - Use `useEffect` with proper dependencies

5. **Handle errors gracefully**
   ```typescript
   try { ... } catch (error) { showErrorToast(error); }
   ```

6. **Optimize images**
   - Use placeholder avatars
   - Load images lazily
   - Cache avatar images

### For Users

1. **Check daily**: Ranks change frequently
2. **Add friends**: More fun with friends
3. **Complete challenges**: Fastest way to climb
4. **Maintain streaks**: Consistency = points
5. **Celebrate milestones**: Top 100, Top 10, #1!

---

## 📚 Code Examples

### Create Leaderboard Row Component

```typescript
interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ entry, isCurrentUser }) => {
  return (
    <View style={[styles.row, isCurrentUser && styles.currentUserRow]}>
      <RankBadge rank={entry.rank} />
      <Avatar uri={entry.userAvatar} />
      <UserInfo 
        name={entry.userName} 
        streak={entry.streak} 
        level={entry.level}
        isCurrentUser={isCurrentUser}
      />
      <Points value={entry.points} />
    </View>
  );
};
```

### Add Rank Change Notification

```typescript
import { getUserRank } from '@/services/firebase/leaderboardService';

const checkRankChange = async (previousRank: number) => {
  const currentRank = await getUserRank('all-time');
  
  if (currentRank < previousRank) {
    const improved = previousRank - currentRank;
    showToast(`🎉 You moved up ${improved} ranks!`);
  }
  
  return currentRank;
};
```

---

**Status:** ✅ Leaderboard System Complete  
**Next Steps:** Implement Achievement/Badge System 🏅  
**Goal:** Make Rootine the most competitive habit app! 🚀
