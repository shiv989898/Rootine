import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/constants/theme';
import { createPost } from '@/services/firebase/socialService';
import { useAuth } from '@/contexts/AuthContext';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MAX_CHARACTERS = 500;

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const charactersRemaining = MAX_CHARACTERS - content.length;
  const isValid = content.trim().length > 0 && content.length <= MAX_CHARACTERS;

  const handleSubmit = async () => {
    if (!isValid || loading) return;

    try {
      setLoading(true);
      await createPost(content.trim());
      
      Alert.alert('Success', 'Your post has been shared!');
      setContent('');
      onClose();
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error creating post:', error);
      Alert.alert('Error', error.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (content.trim().length > 0) {
      Alert.alert(
        'Discard Post?',
        'Are you sure you want to discard this post?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setContent('');
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} disabled={loading}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <TouchableOpacity 
            onPress={handleSubmit} 
            disabled={!isValid || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text 
                style={[
                  styles.postButton,
                  !isValid && styles.postButtonDisabled
                ]}
              >
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.avatarPlaceholder}>
              <Icon name="account" size={24} color={COLORS.textSecondary} />
            </View>
            <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
          </View>

          {/* Text Input */}
          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            placeholderTextColor={COLORS.textSecondary}
            multiline
            value={content}
            onChangeText={setContent}
            maxLength={MAX_CHARACTERS}
            autoFocus
            textAlignVertical="top"
          />

          {/* Character Count */}
          <View style={styles.characterCount}>
            <Text 
              style={[
                styles.characterCountText,
                charactersRemaining < 50 && styles.characterCountWarning,
                charactersRemaining < 0 && styles.characterCountError,
              ]}
            >
              {charactersRemaining} characters remaining
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionItem} disabled>
              <Icon name="image-outline" size={24} color={COLORS.textSecondary} />
              <Text style={styles.actionText}>Photo</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Soon</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} disabled>
              <Icon name="emoticon-happy-outline" size={24} color={COLORS.textSecondary} />
              <Text style={styles.actionText}>Feeling</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Soon</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} disabled>
              <Icon name="map-marker-outline" size={24} color={COLORS.textSecondary} />
              <Text style={styles.actionText}>Location</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Soon</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <View style={styles.tipHeader}>
              <Icon name="lightbulb-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.tipTitle}>Posting Tips</Text>
            </View>
            <Text style={styles.tipText}>â€¢ Share your progress and achievements</Text>
            <Text style={styles.tipText}>â€¢ Ask questions and support others</Text>
            <Text style={styles.tipText}>â€¢ Be positive and encouraging</Text>
            <Text style={styles.tipText}>â€¢ Keep it authentic and genuine</Text>
          </View>
        </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  cancelButton: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  postButton: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  characterCount: {
    marginTop: SPACING.md,
    alignItems: 'flex-end',
  },
  characterCountText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  characterCountWarning: {
    color: COLORS.warning,
  },
  characterCountError: {
    color: COLORS.error,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
  },
  actionItem: {
    alignItems: 'center',
    opacity: 0.5,
  },
  actionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  comingSoonBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.xs,
  },
  comingSoonText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xl,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tipTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  tipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginVertical: 2,
  },
});
