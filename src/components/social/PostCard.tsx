import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/constants/theme';
import { Post } from '@/types';
import { likePost, unlikePost, deletePost } from '@/services/firebase/socialService';
import { useAuth } from '@/contexts/AuthContext';

interface PostCardProps {
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onDelete?: () => void;
  onUserPress?: (userId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onDelete,
  onUserPress,
}) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isOwnPost = user?.id === post.userId;
  const shouldTruncate = post.content.length > 200;
  const displayContent = expanded || !shouldTruncate 
    ? post.content 
    : post.content.substring(0, 200) + '...';

  const handleLike = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      const newLikedState = !isLiked;
      
      // Optimistic update
      setIsLiked(newLikedState);
      setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);

      if (newLikedState) {
        await likePost(post.id);
      } else {
        await unlikePost(post.id);
      }

      if (onLike) onLike();
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert on error
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
      Alert.alert('Error', 'Failed to like post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(post.id);
              if (onDelete) onDelete();
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => onUserPress && onUserPress(post.userId)}
          disabled={!onUserPress}
        >
          {post.userAvatar ? (
            <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Icon name="account" size={24} color={COLORS.textSecondary} />
            </View>
          )}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{post.userName}</Text>
            <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
          </View>
        </TouchableOpacity>

        {isOwnPost && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Icon name="delete-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.contentText}>{displayContent}</Text>
        {shouldTruncate && (
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text style={styles.readMore}>
              {expanded ? 'Show less' : 'Read more'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Image */}
      {post.imageUrl && (
        <Image 
          source={{ uri: post.imageUrl }} 
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={styles.statsText}>
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </Text>
        <Text style={styles.statsText}>
          {post.comments} {post.comments === 1 ? 'comment' : 'comments'}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleLike}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <>
              <Icon 
                name={isLiked ? 'heart' : 'heart-outline'} 
                size={22} 
                color={isLiked ? COLORS.error : COLORS.textSecondary} 
              />
              <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
                Like
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onComment}
        >
          <Icon name="comment-outline" size={22} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Icon name="share-outline" size={22} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    padding: SPACING.xs,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  contentText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 20,
  },
  readMore: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  postImage: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.lightGray,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  actionTextActive: {
    color: COLORS.error,
  },
});
