import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getAllAchievements,
  getUserBadges,
  getAchievementProgress,
  getRarityColor,
  Achievement,
} from '@/services/firebase/achievementService';
import { Badge } from '@/types';

type FilterType = 'all' | 'habits' | 'streaks' | 'points' | 'social' | 'challenges' | 'special';
type RarityFilter = 'all' | 'common' | 'rare' | 'epic' | 'legendary';

export default function BadgeShowcaseScreen() {
  const navigation = useNavigation();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<FilterType>('all');
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Mock user data (in production, fetch from user profile)
  const [userData] = useState({
    habitCount: 15,
    currentStreak: 10,
    totalPoints: 350,
    friendsCount: 7,
    challengesCompleted: 3,
    level: 3,
  });

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const allAchievements = getAllAchievements();
      const badges = await getUserBadges();
      
      setAchievements(allAchievements);
      setUnlockedBadges(badges);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const isUnlocked = (achievementId: string): boolean => {
    return unlockedBadges.some(badge => badge.id === achievementId);
  };

  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = categoryFilter === 'all' || achievement.category === categoryFilter;
    const rarityMatch = rarityFilter === 'all' || achievement.rarity === rarityFilter;
    return categoryMatch && rarityMatch;
  });

  const stats = {
    total: achievements.length,
    unlocked: unlockedBadges.length,
    percentage: Math.round((unlockedBadges.length / achievements.length) * 100),
  };

  const renderAchievementCard = ({ item }: { item: Achievement }) => {
    const unlocked = isUnlocked(item.id);
    const progress = getAchievementProgress(item, userData);
    const rarityColor = getRarityColor(item.rarity);

    return (
      <TouchableOpacity
        style={[
          styles.achievementCard,
          unlocked && styles.achievementCardUnlocked,
        ]}
        onPress={() => {
          setSelectedAchievement(item);
          setModalVisible(true);
        }}
      >
        {/* Rarity Border */}
        <View style={[styles.rarityBorder, { backgroundColor: rarityColor }]} />

        {/* Icon */}
        <View style={[
          styles.iconContainer,
          unlocked ? { backgroundColor: rarityColor } : styles.iconContainerLocked
        ]}>
          <Icon 
            name={item.icon as any} 
            size={32} 
            color={unlocked ? '#FFF' : '#999'} 
          />
        </View>

        {/* Content */}
        <View style={styles.achievementContent}>
          <Text style={[
            styles.achievementTitle,
            !unlocked && styles.textLocked
          ]}>
            {item.title}
          </Text>
          <Text style={[
            styles.achievementDescription,
            !unlocked && styles.textLocked
          ]} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Progress Bar (if not unlocked) */}
          {!unlocked && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${progress.percentage}%`, backgroundColor: rarityColor }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {progress.current}/{progress.target}
              </Text>
            </View>
          )}

          {/* Reward */}
          <View style={styles.rewardContainer}>
            <Icon name="star" size={14} color={rarityColor} />
            <Text style={[styles.rewardText, { color: rarityColor }]}>
              {item.reward.points} pts
            </Text>
            {unlocked && (
              <Icon name="check-circle" size={14} color="#4CAF50" style={{ marginLeft: 8 }} />
            )}
          </View>
        </View>

        {/* Rarity Badge */}
        <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
          <Text style={styles.rarityText}>{item.rarity}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterChip = (
    label: string,
    filter: FilterType,
    icon: string
  ) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        categoryFilter === filter && styles.filterChipActive
      ]}
      onPress={() => setCategoryFilter(filter)}
    >
      <Icon 
        name={icon as any} 
        size={16} 
        color={categoryFilter === filter ? '#FFF' : '#666'} 
      />
      <Text style={[
        styles.filterChipText,
        categoryFilter === filter && styles.filterChipTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderRarityFilter = (rarity: RarityFilter) => {
    const colors = {
      all: '#666',
      common: '#9E9E9E',
      rare: '#2196F3',
      epic: '#9C27B0',
      legendary: '#FFD700',
    };

    return (
      <TouchableOpacity
        style={[
          styles.rarityFilterChip,
          rarityFilter === rarity && { backgroundColor: colors[rarity] }
        ]}
        onPress={() => setRarityFilter(rarity)}
      >
        <Text style={[
          styles.rarityFilterText,
          rarityFilter === rarity && styles.rarityFilterTextActive
        ]}>
          {rarity}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderDetailModal = () => {
    if (!selectedAchievement) return null;

    const unlocked = isUnlocked(selectedAchievement.id);
    const progress = getAchievementProgress(selectedAchievement, userData);
    const rarityColor = getRarityColor(selectedAchievement.rarity);

    return (
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>

            {/* Icon */}
            <View style={[styles.modalIcon, { backgroundColor: rarityColor }]}>
              <Icon name={selectedAchievement.icon as any} size={64} color="#FFF" />
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>{selectedAchievement.title}</Text>
            
            {/* Rarity */}
            <View style={[styles.modalRarityBadge, { backgroundColor: rarityColor }]}>
              <Text style={styles.modalRarityText}>
                {selectedAchievement.rarity.toUpperCase()}
              </Text>
            </View>

            {/* Description */}
            <Text style={styles.modalDescription}>
              {selectedAchievement.description}
            </Text>

            {/* Progress */}
            {!unlocked && (
              <View style={styles.modalProgressContainer}>
                <Text style={styles.modalProgressLabel}>Progress</Text>
                <View style={styles.modalProgressBar}>
                  <View 
                    style={[
                      styles.modalProgressFill,
                      { width: `${progress.percentage}%`, backgroundColor: rarityColor }
                    ]}
                  />
                </View>
                <Text style={styles.modalProgressText}>
                  {progress.current} / {progress.target} ({progress.percentage}%)
                </Text>
              </View>
            )}

            {/* Reward */}
            <View style={styles.modalRewardContainer}>
              <Icon name="star" size={20} color={rarityColor} />
              <Text style={styles.modalRewardText}>
                Reward: <Text style={{ color: rarityColor, fontWeight: 'bold' }}>
                  {selectedAchievement.reward.points} points
                </Text>
              </Text>
            </View>

            {/* Status */}
            {unlocked ? (
              <View style={styles.modalStatusUnlocked}>
                <Icon name="check-circle" size={24} color="#4CAF50" />
                <Text style={styles.modalStatusText}>UNLOCKED!</Text>
              </View>
            ) : (
              <View style={styles.modalStatusLocked}>
                <Icon name="lock" size={24} color="#999" />
                <Text style={styles.modalStatusTextLocked}>Locked</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading achievements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        {/* Stats Card */}
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          style={styles.statsCard}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.unlocked}</Text>
              <Text style={styles.statLabel}>Unlocked</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.percentage}%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Category Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {renderFilterChip('All', 'all', 'star-circle')}
          {renderFilterChip('Habits', 'habits', 'check-circle')}
          {renderFilterChip('Streaks', 'streaks', 'fire')}
          {renderFilterChip('Points', 'points', 'diamond')}
          {renderFilterChip('Social', 'social', 'account-group')}
          {renderFilterChip('Challenges', 'challenges', 'trophy')}
          {renderFilterChip('Special', 'special', 'star-shooting')}
        </ScrollView>

        {/* Rarity Filters */}
        <View style={styles.rarityFiltersContainer}>
          <Text style={styles.rarityFiltersLabel}>Rarity:</Text>
          {renderRarityFilter('all')}
          {renderRarityFilter('common')}
          {renderRarityFilter('rare')}
          {renderRarityFilter('epic')}
          {renderRarityFilter('legendary')}
        </View>

        {/* Achievements List */}
        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>
            {categoryFilter === 'all' ? 'All Achievements' : `${categoryFilter} Achievements`}
            <Text style={styles.sectionCount}> ({filteredAchievements.length})</Text>
          </Text>
          
          <FlatList
            data={filteredAchievements}
            renderItem={renderAchievementCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.achievementsList}
          />
        </View>
      </ScrollView>

      {/* Detail Modal */}
      {renderDetailModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
  statsCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#FFF',
    opacity: 0.3,
  },
  filtersContainer: {
    marginVertical: 16,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  rarityFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  rarityFiltersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  rarityFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  rarityFilterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  rarityFilterTextActive: {
    color: '#FFF',
  },
  achievementsContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  sectionCount: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#999',
  },
  achievementsList: {
    paddingBottom: 20,
  },
  achievementCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    opacity: 0.6,
  },
  achievementCardUnlocked: {
    opacity: 1,
  },
  rarityBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerLocked: {
    backgroundColor: '#E0E0E0',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  textLocked: {
    color: '#999',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#999',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rarityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  modalIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalRarityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalRarityText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalProgressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  modalProgressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  modalProgressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  modalProgressFill: {
    height: '100%',
    borderRadius: 6,
  },
  modalProgressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalRewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  modalRewardText: {
    fontSize: 16,
    color: '#666',
  },
  modalStatusUnlocked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
  },
  modalStatusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  modalStatusLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  modalStatusTextLocked: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
  },
});
