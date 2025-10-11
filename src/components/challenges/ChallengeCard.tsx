import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserChallenge } from '@/types';
import { claimChallengeReward } from '@/services/firebase/challengeService';
import PointsAnimation from '@/components/animations/PointsAnimation';

interface ChallengeCardProps {
  userChallenge: UserChallenge;
  onClaim?: () => void;
}

export const ChallengeCard = React.memo<ChallengeCardProps>(({ userChallenge, onClaim }) => {
  const [claiming, setClaiming] = useState(false);
  const [showPoints, setShowPoints] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const { challenge, progress, isCompleted, isClaimed } = userChallenge;

  // Cleanup animation state on unmount
  useEffect(() => {
    return () => {
      setShowPoints(false);
    };
  }, []);

  const getTimeRemaining = (): string => {
    const now = new Date();
    const end = challenge.endDate;
    const diffMs = end.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expired';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h left`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }

    return `${minutes}m left`;
  };

  const handleClaim = async () => {
    if (!isCompleted || isClaimed || claiming) return;

    setClaiming(true);
    try {
      const points = await claimChallengeReward(challenge.id);
      setPointsEarned(points);
      setShowPoints(true);
      
      // Delay alert to let animation play
      setTimeout(() => {
        Alert.alert(
          'Reward Claimed! 🎉',
          `You earned ${points} points!`,
          [{ text: 'Awesome!', onPress: onClaim }]
        );
      }, 500);
    } catch (error) {
      console.error('Error claiming reward:', error);
      Alert.alert('Error', 'Failed to claim reward. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  const getChallengeColor = () => {
    if (challenge.type === 'weekly') return '#9C27B0';
    return '#4CAF50';
  };

  const getStatusColor = () => {
    if (isClaimed) return '#999';
    if (isCompleted) return '#FFD700';
    return getChallengeColor();
  };

  return (
    <View style={[styles.container, { borderLeftColor: getChallengeColor() }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: getChallengeColor() + '20' }]}>
            <MaterialCommunityIcons
              name={challenge.icon as any}
              size={28}
              color={getChallengeColor()}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{challenge.title}</Text>
            <Text style={styles.description}>{challenge.description}</Text>
          </View>
        </View>
        {challenge.type === 'weekly' && (
          <View style={styles.weeklyBadge}>
            <Text style={styles.weeklyBadgeText}>WEEKLY</Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            {challenge.goal.current || 0} / {challenge.goal.target}
          </Text>
          <Text style={[styles.timeText, { color: getStatusColor() }]}>
            {getTimeRemaining()}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progress}%`,
                backgroundColor: getStatusColor(),
              },
            ]}
          />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.rewardContainer}>
          <MaterialCommunityIcons name="star" size={18} color="#FFD700" />
          <Text style={styles.rewardText}>{challenge.reward.points} points</Text>
        </View>

        {/* Action Button */}
        {isClaimed ? (
          <View style={[styles.button, styles.buttonClaimed]}>
            <MaterialCommunityIcons name="check-circle" size={18} color="#fff" />
            <Text style={styles.buttonTextClaimed}>Claimed</Text>
          </View>
        ) : isCompleted ? (
          <TouchableOpacity
            style={[styles.button, styles.buttonClaim]}
            onPress={handleClaim}
            disabled={claiming}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="gift" size={18} color="#fff" />
            <Text style={styles.buttonTextClaim}>
              {claiming ? 'Claiming...' : 'Claim Reward'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.button, styles.buttonInProgress]}>
            <MaterialCommunityIcons name="timer-sand" size={18} color="#666" />
            <Text style={styles.buttonTextInProgress}>In Progress</Text>
          </View>
        )}
      </View>

      {/* Points Animation */}
      <PointsAnimation
        points={pointsEarned}
        visible={showPoints}
        onComplete={() => setShowPoints(false)}
        type="challenge"
      />
    </View>
  );
}, (prevProps, nextProps) => {
  // Prevent re-render if challenge data hasn't changed
  return (
    prevProps.userChallenge.challenge.id === nextProps.userChallenge.challenge.id &&
    prevProps.userChallenge.isCompleted === nextProps.userChallenge.isCompleted &&
    prevProps.userChallenge.isClaimed === nextProps.userChallenge.isClaimed &&
    prevProps.userChallenge.progress === nextProps.userChallenge.progress
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  weeklyBadge: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  weeklyBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  rewardText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#F57C00',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buttonClaim: {
    backgroundColor: '#4CAF50',
  },
  buttonTextClaim: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  buttonClaimed: {
    backgroundColor: '#999',
  },
  buttonTextClaimed: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  buttonInProgress: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonTextInProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
});
