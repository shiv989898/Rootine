import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/constants/theme';
import { Post } from '@/types';
import { subscribeToFeedPosts } from '@/services/firebase/socialService';
import { PostCard } from '@/components/social/PostCard';
import { CreatePostModal } from '@/components/social/CreatePostModal';
import { CommentsModal } from '@/components/social/CommentsModal';
import { useNavigation } from '@react-navigation/native';

const FeedScreen = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createPostModalVisible, setCreatePostModalVisible] = useState(false);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = () => {
    // Subscribe to real-time feed updates
    const unsubscribe = subscribeToFeedPosts(
      (updatedPosts) => {
        setPosts(updatedPosts);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error('Feed error:', error);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return unsubscribe;
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  const handleCreatePost = () => {
    setCreatePostModalVisible(true);
  };

  const handleCommentPress = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setCommentsModalVisible(true);
    }
  };

  const handleUserPress = (userId: string) => {
    // TODO: Navigate to user profile
    console.log('View user profile:', userId);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="post-outline" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No Posts Yet</Text>
      <Text style={styles.emptySubtitle}>
        Be the first to share your journey!
      </Text>
      <TouchableOpacity style={styles.createFirstButton} onPress={handleCreatePost}>
        <Text style={styles.createFirstButtonText}>Create Post</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Feed</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading feed...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreatePost}
        >
          <Icon name="plus" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Feed List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onComment={() => handleCommentPress(item.id)}
            onUserPress={handleUserPress}
            onDelete={() => handleRefresh()}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />

      {/* Create Post Modal */}
      <CreatePostModal 
        visible={createPostModalVisible}
        onClose={() => setCreatePostModalVisible(false)}
        onSuccess={handleRefresh}
      />

      {/* Comments Modal */}
      {selectedPost && (
        <CommentsModal
          visible={commentsModalVisible}
          postId={selectedPost.id}
          postAuthor={selectedPost.userName}
          onClose={() => {
            setCommentsModalVisible(false);
            setSelectedPost(null);
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.xl,
  },
  createFirstButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 999,
    marginTop: SPACING.lg,
  },
  createFirstButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

export default FeedScreen;
