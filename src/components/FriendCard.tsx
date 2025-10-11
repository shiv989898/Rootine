import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { User, RootStackParamList } from '@/types';
import { removeFriend } from '@/services/firebase/socialService';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface FriendCardProps {
  friend: User;
  status?: 'accepted' | 'pending';
  onRemove?: () => void;
}

export const FriendCard: React.FC<FriendCardProps> = ({
  friend,
  status = 'accepted',
  onRemove,
}) => {
  const navigation = useNavigation<NavigationProp>();

  // Generate consistent color for avatar based on user ID
  const getAvatarColor = (userId: string): string => {
    const colors = ['#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#F44336', '#00BCD4', '#E91E63'];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const handleViewProfile = () => {
    navigation.navigate('UserProfile', { userId: friend.id });
  };

  const handleRemoveFriend = () => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friend.displayName} from your friends?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFriend(friend.id);
              onRemove?.();
            } catch (error) {
              console.error('Error removing friend:', error);
              Alert.alert('Error', 'Failed to remove friend. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getStreakDisplay = () => {
    if (friend.profile.streakDays > 0) {
      return `${friend.profile.streakDays}`;
    }
    return '0';
  };

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(friend.id) }]}>
          <Text style={styles.avatarText}>
            {friend.displayName?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        {status === 'pending' && (
          <View style={styles.pendingBadge}>
            <MaterialCommunityIcons name="clock-outline" size={12} color="#fff" />
          </View>
        )}
      </View>

      {/* Friend Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {friend.displayName || 'Unknown User'}
        </Text>
        
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="fire" size={14} color="#FF6B6B" />
            <Text style={styles.statText}>{getStreakDisplay()}</Text>
          </View>
          
          <View style={styles.stat}>
            <MaterialCommunityIcons name="trophy" size={14} color="#FFD700" />
            <Text style={styles.statText}>{friend.profile.points || 0}</Text>
          </View>
          
          {friend.profile.friends && (
            <View style={styles.stat}>
              <MaterialCommunityIcons name="account-group" size={14} color="#4CAF50" />
              <Text style={styles.statText}>{friend.profile.friends.length}</Text>
            </View>
          )}
        </View>

        {status === 'pending' && (
          <Text style={styles.pendingText}>Pending</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleViewProfile}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="account" size={20} color="#4CAF50" />
        </TouchableOpacity>

        {status === 'accepted' && (
          <TouchableOpacity
            style={[styles.iconButton, styles.removeButton]}
            onPress={handleRemoveFriend}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="account-minus" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
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
  pendingBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FF9800',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  pendingText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#FFEBEE',
  },
});
