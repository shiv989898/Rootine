import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { auth } from '@/config/firebase';
import {
  getGlobalLeaderboard,
  getFriendsLeaderboard,
  getUserRank,
  getLeaderboardStats,
  searchLeaderboard,
} from '@/services/firebase/leaderboardService';
import { LeaderboardEntry, LeaderboardPeriod } from '@/types';

type TabType = 'global' | 'friends' | 'weekly' | 'monthly';

export default function LeaderboardScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('global');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRank, setUserRank] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    averagePoints: 0,
    topScore: 0,
  });

  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    loadLeaderboard();
    loadStats();
  }, [activeTab]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      let period: LeaderboardPeriod = 'all-time';
      let data: LeaderboardEntry[] = [];

      if (activeTab === 'friends') {
        data = await getFriendsLeaderboard();
        period = 'friends';
      } else {
        // Map tab to period
        switch (activeTab) {
          case 'weekly':
            period = 'weekly';
            break;
          case 'monthly':
            period = 'monthly';
            break;
          default:
            period = 'all-time';
        }
        data = await getGlobalLeaderboard(period, 100);
      }

      setLeaderboard(data);

      // Get user's rank
      if (activeTab !== 'friends') {
        const rank = await getUserRank(period);
        setUserRank(rank);
      } else {
        // For friends, find rank in the data
        const userEntry = data.find(entry => entry.userId === currentUserId);
        setUserRank(userEntry?.rank || 0);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getLeaderboardStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    await loadStats();
    setRefreshing(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      loadLeaderboard();
      return;
    }

    try {
      setSearching(true);
      const results = await searchLeaderboard(query, 20);
      setLeaderboard(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  const getRankColor = (rank: number): string => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#666';
  };

  const getRankIcon = (rank: number): string => {
    if (rank === 1) return 'trophy';
    if (rank === 2) return 'medal';
    if (rank === 3) return 'medal-outline';
    return 'numeric';
  };

  const renderLeaderboardItem = ({ item }: { item: LeaderboardEntry }) => {
    const isCurrentUser = item.userId === currentUserId;
    const rankColor = getRankColor(item.rank);

    return (
      <View style={[
        styles.leaderboardItem,
        isCurrentUser && styles.currentUserItem
      ]}>
        {/* Rank Badge */}
        <View style={[styles.rankBadge, { backgroundColor: rankColor }]}>
          {item.rank <= 3 ? (
            <Icon name={getRankIcon(item.rank) as any} size={24} color="#FFF" />
          ) : (
            <Text style={styles.rankText}>{item.rank}</Text>
          )}
        </View>

        {/* User Avatar */}
        <View style={styles.avatarContainer}>
          {item.userAvatar ? (
            <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="account" size={24} color="#999" />
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={[styles.userName, isCurrentUser && styles.currentUserName]}>
            {item.userName}
            {isCurrentUser && ' (You)'}
          </Text>
          <View style={styles.userStats}>
            <View style={styles.statBadge}>
              <Icon name="fire" size={14} color="#FF6B6B" />
              <Text style={styles.statText}>{item.streak} day streak</Text>
            </View>
            <View style={styles.statBadge}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.statText}>Level {item.level}</Text>
            </View>
          </View>
        </View>

        {/* Points */}
        <View style={styles.pointsContainer}>
          <Text style={styles.points}>
            {activeTab === 'weekly' 
              ? item.weeklyPoints 
              : activeTab === 'monthly' 
              ? item.monthlyPoints 
              : item.points}
          </Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>
    );
  };

  const renderTab = (tab: TabType, label: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}
    >
      <Icon 
        name={icon as any} 
        size={20} 
        color={activeTab === tab ? '#4CAF50' : '#999'} 
      />
      <Text style={[
        styles.tabText,
        activeTab === tab && styles.activeTabText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="account-group" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Players</Text>
        </View>
        
        <View style={styles.statCard}>
          <Icon name="chart-line" size={24} color="#2196F3" />
          <Text style={styles.statValue}>{stats.averagePoints}</Text>
          <Text style={styles.statLabel}>Avg Points</Text>
        </View>
        
        <View style={styles.statCard}>
          <Icon name="trophy" size={24} color="#FFD700" />
          <Text style={styles.statValue}>{stats.topScore}</Text>
          <Text style={styles.statLabel}>Top Score</Text>
        </View>
      </View>

      {/* User Rank Card */}
      {userRank > 0 && (
        <View style={styles.userRankCard}>
          <View style={styles.userRankLeft}>
            <Icon name="medal" size={32} color="#4CAF50" />
            <View>
              <Text style={styles.userRankTitle}>Your Rank</Text>
              <Text style={styles.userRankValue}>#{userRank}</Text>
            </View>
          </View>
          <Text style={styles.userRankSubtext}>
            {userRank === 1 
              ? "🎉 You're #1!" 
              : userRank <= 10 
              ? 'Top 10!' 
              : userRank <= 100 
              ? 'Top 100!' 
              : 'Keep climbing!'}
          </Text>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searching && (
          <ActivityIndicator size="small" color="#4CAF50" />
        )}
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Icon name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {renderTab('global', 'Global', 'earth')}
        {renderTab('friends', 'Friends', 'account-group')}
        {renderTab('weekly', 'Weekly', 'calendar-week')}
        {renderTab('monthly', 'Monthly', 'calendar-month')}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon 
        name={activeTab === 'friends' ? 'account-off' : 'trophy-broken'} 
        size={64} 
        color="#CCC" 
      />
      <Text style={styles.emptyText}>
        {activeTab === 'friends' 
          ? 'No friends yet. Add friends to compete!' 
          : 'No leaderboard data available'}
      </Text>
      {activeTab === 'friends' && (
        <TouchableOpacity 
          style={styles.addFriendsButton}
          onPress={() => navigation.navigate('SearchUsers' as never)}
        >
          <Text style={styles.addFriendsButtonText}>Add Friends</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Icon name="refresh" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          renderItem={renderLeaderboardItem}
          keyExtractor={(item) => item.userId}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
              tintColor="#4CAF50"
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  header: {
    paddingBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  userRankCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userRankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userRankTitle: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
  },
  userRankValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userRankSubtext: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#E8F5E9',
  },
  tabText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  currentUserName: {
    color: '#4CAF50',
  },
  userStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  points: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  addFriendsButton: {
    marginTop: 16,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFriendsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
