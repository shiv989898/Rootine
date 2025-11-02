import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { SPACING, FONT_SIZES } from '@/constants/theme';
import { usePreferences } from '@/contexts/PreferencesContext';
import { AppTheme } from '@/constants/themes';
import { Post } from '@/types';
import { subscribeToFeedPosts } from '@/services/firebase/socialService';
import { PostCard } from '@/components/social/PostCard';
import { CreatePostModal } from '@/components/social/CreatePostModal';
import { CommentsModal } from '@/components/social/CommentsModal';

const FeedScreen = () => {
  const { themePalette } = usePreferences();
  const styles = useMemo(() => createStyles(themePalette), [themePalette]);
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

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadFeed();
  }, []);

  const handleCreatePost = useCallback(() => {
    setCreatePostModalVisible(true);
  }, []);

  const handleCommentPress = useCallback((postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setCommentsModalVisible(true);
    }
  }, [posts]);

  const handleUserPress = useCallback((userId: string) => {
    // TODO: Navigate to user profile
    console.log('View user profile:', userId);
  }, []);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="post-outline" size={64} color={themePalette.textSecondary} />
      <Text style={styles.emptyTitle}>No Posts Yet</Text>
      <Text style={styles.emptySubtitle}>
        Be the first to share your journey!
      </Text>
      <TouchableOpacity style={styles.createFirstButton} onPress={handleCreatePost}>
        <Text style={styles.createFirstButtonText}>Create Post</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPost = useCallback(({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onComment={() => handleCommentPress(item.id)}
      onUserPress={handleUserPress}
      onDelete={handleRefresh}
    />
  ), [handleCommentPress, handleUserPress, handleRefresh]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Feed</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themePalette.primary} />
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
          <Icon name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Feed List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={themePalette.primary}
            colors={[themePalette.primary]}
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
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

const createStyles = (palette: AppTheme['palette']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      backgroundColor: palette.surface,
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
    },
    headerTitle: {
      fontSize: FONT_SIZES.xxl,
      fontWeight: 'bold',
      color: palette.text,
    },
    createButton: {
      backgroundColor: palette.primary,
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
      color: palette.textSecondary,
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
      color: palette.text,
      marginTop: SPACING.md,
    },
    emptySubtitle: {
      fontSize: FONT_SIZES.md,
      color: palette.textSecondary,
      textAlign: 'center',
      marginTop: SPACING.xs,
      paddingHorizontal: SPACING.xl,
    },
    createFirstButton: {
      backgroundColor: palette.primary,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.md,
      borderRadius: 999,
      marginTop: SPACING.lg,
    },
    createFirstButtonText: {
      color: '#FFFFFF',
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
    },
  });

export default FeedScreen;
