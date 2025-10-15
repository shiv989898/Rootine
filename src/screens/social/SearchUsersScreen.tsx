import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, User } from '@/types';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db, auth } from '@/services/firebase/config';
import { sendFriendRequest } from '@/services/firebase/socialService';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface UserWithFriendship extends User {
  friendshipStatus?: 'none' | 'pending' | 'accepted';
}

export default function SearchUsersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserWithFriendship[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const searchUsers = async (searchText: string) => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Search by email or display name
      const usersRef = collection(db, 'users');
      
      // Search by email
      const emailQuery = query(
        usersRef,
        where('email', '>=', searchText.toLowerCase()),
        where('email', '<=', searchText.toLowerCase() + '\uf8ff'),
        limit(10)
      );

      // Search by display name
      const nameQuery = query(
        usersRef,
        where('displayName', '>=', searchText),
        where('displayName', '<=', searchText + '\uf8ff'),
        limit(10)
      );

      const [emailSnapshot, nameSnapshot] = await Promise.all([
        getDocs(emailQuery),
        getDocs(nameQuery),
      ]);

      const usersMap = new Map<string, UserWithFriendship>();

      // Process email results
      emailSnapshot.forEach((doc) => {
        if (doc.id !== currentUser.uid) {
          usersMap.set(doc.id, {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          } as UserWithFriendship);
        }
      });

      // Process name results
      nameSnapshot.forEach((doc) => {
        if (doc.id !== currentUser.uid && !usersMap.has(doc.id)) {
          usersMap.set(doc.id, {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          } as UserWithFriendship);
        }
      });

      // Check friendship status for each user
      const users = Array.from(usersMap.values());
      const usersWithStatus = await Promise.all(
        users.map(async (user) => {
          const friendshipId = [currentUser.uid, user.id].sort().join('_');
          const friendshipDoc = await getDocs(
            query(collection(db, 'friendships'), where('__name__', '==', friendshipId))
          );

          if (!friendshipDoc.empty) {
            const friendshipData = friendshipDoc.docs[0].data();
            user.friendshipStatus = friendshipData.status as 'pending' | 'accepted';
          } else {
            user.friendshipStatus = 'none';
          }

          return user;
        })
      );

      setSearchResults(usersWithStatus);
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'Failed to search users. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    // Debounce search
    if (text.length >= 2) {
      setTimeout(() => {
        searchUsers(text);
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    setLoading(true);
    try {
      await sendFriendRequest(userId);
      
      // Update local state
      setSearchResults((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, friendshipStatus: 'pending' }
            : user
        )
      );

      Alert.alert('Success', 'Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', 'Failed to send friend request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  const getAvatarColor = (userId: string): string => {
    const colors = ['#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#F44336', '#00BCD4', '#E91E63'];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const renderActionButton = (user: UserWithFriendship) => {
    if (loading) {
      return <ActivityIndicator size="small" color="#4CAF50" />;
    }

    switch (user.friendshipStatus) {
      case 'accepted':
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.friendsButton]}
            disabled
          >
            <MaterialCommunityIcons name="check" size={16} color="#4CAF50" />
            <Text style={styles.friendsButtonText}>Friends</Text>
          </TouchableOpacity>
        );
      case 'pending':
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.pendingButton]}
            disabled
          >
            <MaterialCommunityIcons name="clock-outline" size={16} color="#FF9800" />
            <Text style={styles.pendingButtonText}>Pending</Text>
          </TouchableOpacity>
        );
      default:
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.addButton]}
            onPress={() => handleSendFriendRequest(user.id)}
          >
            <MaterialCommunityIcons name="account-plus" size={16} color="#fff" />
            <Text style={styles.addButtonText}>Add Friend</Text>
          </TouchableOpacity>
        );
    }
  };

  const renderUserItem = ({ item }: { item: UserWithFriendship }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleViewProfile(item.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.id) }]}>
        <Text style={styles.avatarText}>
          {item.displayName?.charAt(0).toUpperCase() || 'U'}
        </Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.displayName || 'Unknown User'}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        
        {item.profile && (
          <View style={styles.userStats}>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="fire" size={12} color="#FF6B6B" />
              <Text style={styles.statText}>{item.profile.streakDays || 0}</Text>
            </View>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="trophy" size={12} color="#FFD700" />
              <Text style={styles.statText}>{item.profile.points || 0}</Text>
            </View>
          </View>
        )}
      </View>

      {renderActionButton(item)}
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (searching) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.emptyText}>Searching...</Text>
        </View>
      );
    }

    if (searchQuery.length === 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="account-search" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Search for users by email or name</Text>
          <Text style={styles.emptySubtext}>Type at least 2 characters to start</Text>
        </View>
      );
    }

    if (searchQuery.length < 2) {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="magnify" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Keep typing...</Text>
          <Text style={styles.emptySubtext}>Need at least 2 characters</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="account-question" size={80} color="#ccc" />
        <Text style={styles.emptyText}>No users found</Text>
        <Text style={styles.emptySubtext}>Try a different search term</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Users</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by email or name..."
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      <FlatList
        data={searchResults}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  userStats: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  pendingButton: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  pendingButtonText: {
    color: '#FF9800',
    fontSize: 13,
    fontWeight: '600',
  },
  friendsButton: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  friendsButtonText: {
    color: '#4CAF50',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
