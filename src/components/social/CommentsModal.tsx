import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/constants/theme';
import { Comment } from '@/types';
import {
  subscribeToPostComments,
  addComment,
  editComment,
  deleteComment,
} from '@/services/firebase/socialService';
import { useAuth } from '@/contexts/AuthContext';

interface CommentsModalProps {
  visible: boolean;
  postId: string;
  postAuthor: string;
  onClose: () => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  postId,
  postAuthor,
  onClose,
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) return;

    setLoading(true);
    const unsubscribe = subscribeToPostComments(
      postId,
      (updatedComments) => {
        setComments(updatedComments);
        setLoading(false);
      },
      (error) => {
        console.error('Comments subscription error:', error);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [visible, postId]);

  const handleSubmit = async () => {
    if (!commentText.trim() || submitting) return;

    try {
      setSubmitting(true);

      if (editingCommentId) {
        // Edit existing comment
        await editComment(editingCommentId, commentText.trim());
        setEditingCommentId(null);
      } else {
        // Add new comment
        await addComment(postId, commentText.trim());
      }

      setCommentText('');
      inputRef.current?.blur();
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      Alert.alert('Error', error.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    const createdAt = comment.createdAt;
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60;

    if (diffMinutes > 5) {
      Alert.alert('Time Limit', 'You can only edit comments within 5 minutes of posting.');
      return;
    }

    setEditingCommentId(comment.id);
    setCommentText(comment.content);
    inputRef.current?.focus();
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setCommentText('');
  };

  const handleDelete = (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteComment(commentId);
            } catch (error: any) {
              console.error('Error deleting comment:', error);
              Alert.alert('Error', error.message || 'Failed to delete comment');
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
    });
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const isOwnComment = user?.id === item.userId;
    const createdAt = item.createdAt;
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60;
    const canEdit = isOwnComment && diffMinutes <= 5;

    return (
      <View style={styles.commentItem}>
        {/* Avatar */}
        {item.userAvatar ? (
          <Image source={{ uri: item.userAvatar }} style={styles.commentAvatar} />
        ) : (
          <View style={[styles.commentAvatar, styles.avatarPlaceholder]}>
            <Icon name="account" size={16} color={COLORS.textSecondary} />
          </View>
        )}

        {/* Content */}
        <View style={styles.commentContent}>
          <View style={styles.commentBubble}>
            <Text style={styles.commentAuthor}>{item.userName}</Text>
            <Text style={styles.commentText}>{item.content}</Text>
            {item.edited && (
              <Text style={styles.editedLabel}>(edited)</Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.commentActions}>
            <Text style={styles.commentTime}>{formatDate(item.createdAt)}</Text>

            {isOwnComment && (
              <>
                {canEdit && (
                  <TouchableOpacity onPress={() => handleEdit(item)}>
                    <Text style={styles.commentAction}>Edit</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text style={[styles.commentAction, styles.deleteAction]}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="comment-outline" size={48} color={COLORS.textSecondary} />
      <Text style={styles.emptyText}>No comments yet</Text>
      <Text style={styles.emptySubtext}>Be the first to comment!</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comments</Text>
          <View style={styles.headerRight}>
            <Text style={styles.commentCount}>{comments.length}</Text>
          </View>
        </View>

        {/* Comments List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading comments...</Text>
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderComment}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          {editingCommentId && (
            <View style={styles.editingBanner}>
              <Text style={styles.editingText}>Editing comment</Text>
              <TouchableOpacity onPress={handleCancelEdit}>
                <Icon name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputRow}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.inputAvatar} />
            ) : (
              <View style={[styles.inputAvatar, styles.avatarPlaceholder]}>
                <Icon name="account" size={20} color={COLORS.textSecondary} />
              </View>
            )}

            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor={COLORS.textSecondary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={300}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                (!commentText.trim() || submitting) && styles.sendButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!commentText.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Icon name="send" size={20} color={COLORS.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingTop: Platform.OS === 'ios' ? 50 : SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  commentCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
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
  listContent: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.sm,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  commentAuthor: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  commentText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 18,
  },
  editedLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingLeft: SPACING.sm,
  },
  commentTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginRight: SPACING.md,
  },
  commentAction: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: SPACING.md,
  },
  deleteAction: {
    color: COLORS.error,
  },
  inputContainer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : SPACING.sm,
  },
  editingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
  },
  editingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
