import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, UserChallenge } from '@/types';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import {
  getUserDailyChallenges,
  getUserWeeklyChallenge,
} from '@/services/firebase/challengeService';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function ChallengesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [dailyChallenges, setDailyChallenges] = useState<UserChallenge[]>([]);
  const [weeklyChallenge, setWeeklyChallenge] = useState<UserChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChallenges = useCallback(async () => {
    try {
      const [daily, weekly] = await Promise.all([
        getUserDailyChallenges(),
        getUserWeeklyChallenge(),
      ]);

      setDailyChallenges(daily);
      setWeeklyChallenge(weekly);
    } catch (error: any) {
      console.error('Error loading challenges:', error);
      Alert.alert(
        'Error Loading Challenges',
        error.message || 'Failed to load challenges. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadChallenges();
    setRefreshing(false);
  };

  const activeChallenges = [
    ...(weeklyChallenge && !weeklyChallenge.isClaimed ? [weeklyChallenge] : []),
    ...dailyChallenges.filter((c) => !c.isClaimed),
  ];

  const completedChallenges = [
    ...(weeklyChallenge && weeklyChallenge.isClaimed ? [weeklyChallenge] : []),
    ...dailyChallenges.filter((c) => c.isClaimed),
  ];

  const totalProgress = activeChallenges.length > 0
    ? Math.round(
        activeChallenges.reduce((sum, c) => sum + c.progress, 0) / activeChallenges.length
      )
    : 0;

  const completedCount = activeChallenges.filter((c) => c.isCompleted && !c.isClaimed).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading challenges...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenges</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <View style={[styles.statIconContainer, { backgroundColor: '#4CAF50' + '20' }]}>
            <MaterialCommunityIcons name="trophy" size={32} color="#4CAF50" />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{activeChallenges.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={[styles.statIconContainer, { backgroundColor: '#FFD700' + '20' }]}>
            <MaterialCommunityIcons name="check-circle" size={32} color="#FFD700" />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Ready to Claim</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={[styles.statIconContainer, { backgroundColor: '#2196F3' + '20' }]}>
            <MaterialCommunityIcons name="chart-line" size={32} color="#2196F3" />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{totalProgress}%</Text>
            <Text style={styles.statLabel}>Average</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        {/* Active Challenges */}
        {activeChallenges.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="fire" size={24} color="#FF6B6B" />
              <Text style={styles.sectionTitle}>Active Challenges</Text>
            </View>

            {activeChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                userChallenge={challenge}
                onClaim={loadChallenges}
              />
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="trophy-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No active challenges</Text>
            <Text style={styles.emptySubtext}>Check back tomorrow for new challenges!</Text>
          </View>
        )}

        {/* Completed Challenges */}
        {completedChallenges.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <MaterialCommunityIcons name="check-all" size={24} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Completed</Text>
            </View>

            {completedChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                userChallenge={challenge}
                onClaim={loadChallenges}
              />
            ))}
          </>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information" size={24} color="#2196F3" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>How Challenges Work</Text>
            <Text style={styles.infoText}>
              • Daily challenges reset every 24 hours{'\n'}
              • Weekly challenges last 7 days{'\n'}
              • Complete challenges to earn points{'\n'}
              • Claim rewards before they expire!
            </Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTextContainer: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 22,
  },
});
