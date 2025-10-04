import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  QueryDocumentSnapshot,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import { auth } from './config';
import { Post, Comment, Friendship, User } from '@/types';

// ==================== FRIEND REQUESTS ====================

/**
 * Send a friend request to another user
 */
export const sendFriendRequest = async (toUserId: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const friendshipId = [currentUser.uid, toUserId].sort().join('_');

  await setDoc(doc(db, 'friendships', friendshipId), {
    users: [currentUser.uid, toUserId],
    requestedBy: currentUser.uid,
    requestedTo: toUserId,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Create notification for the recipient
  await setDoc(doc(collection(db, 'notifications')), {
    userId: toUserId,
    type: 'friend_request',
    fromUserId: currentUser.uid,
    message: `sent you a friend request`,
    read: false,
    createdAt: serverTimestamp(),
  });
};

/**
 * Accept a friend request
 */
export const acceptFriendRequest = async (friendshipId: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  await updateDoc(doc(db, 'friendships', friendshipId), {
    status: 'accepted',
    acceptedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Get friendship data to send notification
  const friendshipDoc = await getDoc(doc(db, 'friendships', friendshipId));
  const friendshipData = friendshipDoc.data();
  const otherUserId = friendshipData?.requestedBy === currentUser.uid 
    ? friendshipData?.requestedTo 
    : friendshipData?.requestedBy;

  // Create notification for the requester
  await setDoc(doc(collection(db, 'notifications')), {
    userId: otherUserId,
    type: 'friend_accepted',
    fromUserId: currentUser.uid,
    message: `accepted your friend request`,
    read: false,
    createdAt: serverTimestamp(),
  });

  // Update friend counts for both users
  await updateDoc(doc(db, 'users', currentUser.uid), {
    friends: arrayUnion(otherUserId),
  });
  await updateDoc(doc(db, 'users', otherUserId), {
    friends: arrayUnion(currentUser.uid),
  });
};

/**
 * Reject a friend request
 */
export const rejectFriendRequest = async (friendshipId: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  await deleteDoc(doc(db, 'friendships', friendshipId));
};

/**
 * Remove a friend
 */
export const removeFriend = async (friendUserId: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const friendshipId = [currentUser.uid, friendUserId].sort().join('_');
  await deleteDoc(doc(db, 'friendships', friendshipId));

  // Remove from friends arrays
  await updateDoc(doc(db, 'users', currentUser.uid), {
    friends: arrayRemove(friendUserId),
  });
  await updateDoc(doc(db, 'users', friendUserId), {
    friends: arrayRemove(currentUser.uid),
  });
};

/**
 * Get user's friends
 */
export const getFriends = async (): Promise<User[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const friendshipsQuery = query(
    collection(db, 'friendships'),
    where('users', 'array-contains', currentUser.uid),
    where('status', '==', 'accepted')
  );

  const snapshot = await getDocs(friendshipsQuery);
  const friendIds: string[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const friendId = data.users.find((id: string) => id !== currentUser.uid);
    if (friendId) friendIds.push(friendId);
  });

  // Fetch friend user data
  const friends: User[] = [];
  for (const friendId of friendIds) {
    const userDoc = await getDoc(doc(db, 'users', friendId));
    if (userDoc.exists()) {
      friends.push({
        id: userDoc.id,
        ...userDoc.data(),
        createdAt: userDoc.data().createdAt?.toDate() || new Date(),
        updatedAt: userDoc.data().updatedAt?.toDate() || new Date(),
      } as User);
    }
  }

  return friends;
};

/**
 * Get pending friend requests (received)
 */
export const getPendingFriendRequests = async (): Promise<Array<{ friendshipId: string; user: User }>> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const friendshipsQuery = query(
    collection(db, 'friendships'),
    where('requestedTo', '==', currentUser.uid),
    where('status', '==', 'pending')
  );

  const snapshot = await getDocs(friendshipsQuery);
  const requests: Array<{ friendshipId: string; user: User }> = [];

  for (const friendshipDoc of snapshot.docs) {
    const data = friendshipDoc.data();
    const requesterId = data.requestedBy;

    const userDoc = await getDoc(doc(db, 'users', requesterId));
    if (userDoc.exists()) {
      requests.push({
        friendshipId: friendshipDoc.id,
        user: {
          id: userDoc.id,
          ...userDoc.data(),
          createdAt: userDoc.data().createdAt?.toDate() || new Date(),
          updatedAt: userDoc.data().updatedAt?.toDate() || new Date(),
        } as User,
      });
    }
  }

  return requests;
};

/**
 * Check friendship status with another user
 */
export const getFriendshipStatus = async (userId: string): Promise<'none' | 'pending_sent' | 'pending_received' | 'friends'> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return 'none';

  const friendshipId = [currentUser.uid, userId].sort().join('_');
  const friendshipDoc = await getDoc(doc(db, 'friendships', friendshipId));

  if (!friendshipDoc.exists()) return 'none';

  const data = friendshipDoc.data();
  if (data.status === 'accepted') return 'friends';
  if (data.requestedBy === currentUser.uid) return 'pending_sent';
  return 'pending_received';
};

// ==================== POSTS ====================

/**
 * Create a new post
 */
export const createPost = async (content: string, imageUrl?: string): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const postRef = doc(collection(db, 'posts'));
  
  await setDoc(postRef, {
    userId: currentUser.uid,
    content,
    imageUrl: imageUrl || null,
    likes: 0,
    comments: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Award points for creating a post
  await updateDoc(doc(db, 'users', currentUser.uid), {
    'profile.points': increment(5),
  });

  return postRef.id;
};

/**
 * Update a post (user can only edit their own posts)
 */
export const updatePost = async (postId: string, content: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const postRef = doc(db, 'posts', postId);
  const postDoc = await getDoc(postRef);

  if (!postDoc.exists()) throw new Error('Post not found');
  if (postDoc.data().userId !== currentUser.uid) throw new Error('Not authorized');

  await updateDoc(postRef, {
    content,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete a post
 */
export const deletePost = async (postId: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const postRef = doc(db, 'posts', postId);
  const postDoc = await getDoc(postRef);

  if (!postDoc.exists()) throw new Error('Post not found');
  if (postDoc.data().userId !== currentUser.uid) throw new Error('Not authorized');

  // Delete all likes for this post
  const likesQuery = query(collection(db, 'postLikes'), where('postId', '==', postId));
  const likesSnapshot = await getDocs(likesQuery);
  const deletePromises = likesSnapshot.docs.map((doc) => deleteDoc(doc.ref));

  // Delete all comments for this post
  const commentsQuery = query(collection(db, 'comments'), where('postId', '==', postId));
  const commentsSnapshot = await getDocs(commentsQuery);
  const commentDeletePromises = commentsSnapshot.docs.map((doc) => deleteDoc(doc.ref));

  await Promise.all([...deletePromises, ...commentDeletePromises, deleteDoc(postRef)]);
};

/**
 * Get posts by a specific user
 */
export const getUserPosts = async (userId: string, limitCount: number = 20): Promise<Post[]> => {
  const postsQuery = query(
    collection(db, 'posts'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(postsQuery);
  const posts: Post[] = [];

  for (const postDoc of snapshot.docs) {
    const data = postDoc.data();
    
    // Get user data
    const userDoc = await getDoc(doc(db, 'users', data.userId));
    const userData = userDoc.exists() ? userDoc.data() : null;

    posts.push({
      id: postDoc.id,
      userId: data.userId,
      userName: userData?.displayName || 'Unknown User',
      userAvatar: userData?.photoURL,
      content: data.content,
      imageUrl: data.imageUrl,
      likes: data.likes || 0,
      comments: data.comments || 0,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    });
  }

  return posts;
};

/**
 * Get feed posts (from friends and public posts)
 */
export const getFeedPosts = async (limitCount: number = 20, lastDoc?: QueryDocumentSnapshot): Promise<{ posts: Post[]; lastDoc: QueryDocumentSnapshot | null }> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  // For now, get all posts (can be optimized to show only friends' posts)
  let postsQuery = query(
    collection(db, 'posts'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  if (lastDoc) {
    postsQuery = query(postsQuery, startAfter(lastDoc));
  }

  const snapshot = await getDocs(postsQuery);
  const posts: Post[] = [];

  for (const postDoc of snapshot.docs) {
    const data = postDoc.data();
    
    // Get user data
    const userDoc = await getDoc(doc(db, 'users', data.userId));
    const userData = userDoc.exists() ? userDoc.data() : null;

    // Check if current user liked this post
    const likeQuery = query(
      collection(db, 'postLikes'),
      where('postId', '==', postDoc.id),
      where('userId', '==', currentUser.uid)
    );
    const likeSnapshot = await getDocs(likeQuery);
    const isLiked = !likeSnapshot.empty;

    posts.push({
      id: postDoc.id,
      userId: data.userId,
      userName: userData?.displayName || 'Unknown User',
      userAvatar: userData?.photoURL,
      content: data.content,
      imageUrl: data.imageUrl,
      likes: data.likes || 0,
      comments: data.comments || 0,
      isLiked,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    });
  }

  return {
    posts,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
  };
};

/**
 * Subscribe to feed posts (real-time updates)
 */
export const subscribeToFeedPosts = (
  callback: (posts: Post[]) => void,
  errorCallback?: (error: Error) => void,
  limitCount: number = 20
): Unsubscribe => {
  const postsQuery = query(
    collection(db, 'posts'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(
    postsQuery,
    async (snapshot) => {
      const posts: Post[] = [];
      const currentUser = auth.currentUser;

      for (const postDoc of snapshot.docs) {
        const data = postDoc.data();
        
        // Get user data
        const userDoc = await getDoc(doc(db, 'users', data.userId));
        const userData = userDoc.exists() ? userDoc.data() : null;

        // Check if current user liked this post
        let isLiked = false;
        if (currentUser) {
          const likeQuery = query(
            collection(db, 'postLikes'),
            where('postId', '==', postDoc.id),
            where('userId', '==', currentUser.uid)
          );
          const likeSnapshot = await getDocs(likeQuery);
          isLiked = !likeSnapshot.empty;
        }

        posts.push({
          id: postDoc.id,
          userId: data.userId,
          userName: userData?.displayName || 'Unknown User',
          userAvatar: userData?.photoURL,
          content: data.content,
          imageUrl: data.imageUrl,
          likes: data.likes || 0,
          comments: data.comments || 0,
          isLiked,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      }

      callback(posts);
    },
    (error) => {
      console.error('Feed subscription error:', error);
      if (errorCallback) errorCallback(error);
    }
  );
};

// ==================== LIKES ====================

/**
 * Like a post
 */
export const likePost = async (postId: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const likeId = `${currentUser.uid}_${postId}`;
  
  await setDoc(doc(db, 'postLikes', likeId), {
    userId: currentUser.uid,
    postId,
    createdAt: serverTimestamp(),
  });

  // Increment like count
  await updateDoc(doc(db, 'posts', postId), {
    likes: increment(1),
  });

  // Create notification for post owner
  const postDoc = await getDoc(doc(db, 'posts', postId));
  const postOwnerId = postDoc.data()?.userId;
  
  if (postOwnerId && postOwnerId !== currentUser.uid) {
    await setDoc(doc(collection(db, 'notifications')), {
      userId: postOwnerId,
      type: 'post_like',
      fromUserId: currentUser.uid,
      postId,
      message: `liked your post`,
      read: false,
      createdAt: serverTimestamp(),
    });
  }
};

/**
 * Unlike a post
 */
export const unlikePost = async (postId: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const likeId = `${currentUser.uid}_${postId}`;
  await deleteDoc(doc(db, 'postLikes', likeId));

  // Decrement like count
  await updateDoc(doc(db, 'posts', postId), {
    likes: increment(-1),
  });
};

// ==================== COMMENTS ====================

/**
 * Add a comment to a post
 */
export const addComment = async (postId: string, content: string): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const commentRef = doc(collection(db, 'comments'));
  
  await setDoc(commentRef, {
    postId,
    userId: currentUser.uid,
    content,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Increment comment count
  await updateDoc(doc(db, 'posts', postId), {
    comments: increment(1),
  });

  // Award points for commenting
  await updateDoc(doc(db, 'users', currentUser.uid), {
    'profile.points': increment(2),
  });

  // Create notification for post owner
  const postDoc = await getDoc(doc(db, 'posts', postId));
  const postOwnerId = postDoc.data()?.userId;
  
  if (postOwnerId && postOwnerId !== currentUser.uid) {
    await setDoc(doc(collection(db, 'notifications')), {
      userId: postOwnerId,
      type: 'post_comment',
      fromUserId: currentUser.uid,
      postId,
      message: `commented on your post`,
      read: false,
      createdAt: serverTimestamp(),
    });
  }

  return commentRef.id;
};

/**
 * Edit a comment (within 5 minutes)
 */
export const editComment = async (commentId: string, content: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const commentRef = doc(db, 'comments', commentId);
  const commentDoc = await getDoc(commentRef);

  if (!commentDoc.exists()) throw new Error('Comment not found');
  if (commentDoc.data().userId !== currentUser.uid) throw new Error('Not authorized');

  // Check if within 5 minutes
  const createdAt = commentDoc.data().createdAt?.toDate();
  const now = new Date();
  const diffMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60;
  
  if (diffMinutes > 5) throw new Error('Can only edit comments within 5 minutes');

  await updateDoc(commentRef, {
    content,
    updatedAt: serverTimestamp(),
    edited: true,
  });
};

/**
 * Delete a comment
 */
export const deleteComment = async (commentId: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const commentRef = doc(db, 'comments', commentId);
  const commentDoc = await getDoc(commentRef);

  if (!commentDoc.exists()) throw new Error('Comment not found');
  if (commentDoc.data().userId !== currentUser.uid) throw new Error('Not authorized');

  const postId = commentDoc.data().postId;

  await deleteDoc(commentRef);

  // Decrement comment count
  await updateDoc(doc(db, 'posts', postId), {
    comments: increment(-1),
  });
};

/**
 * Get comments for a post
 */
export const getPostComments = async (postId: string): Promise<Comment[]> => {
  const commentsQuery = query(
    collection(db, 'comments'),
    where('postId', '==', postId),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(commentsQuery);
  const comments: Comment[] = [];

  for (const commentDoc of snapshot.docs) {
    const data = commentDoc.data();
    
    // Get user data
    const userDoc = await getDoc(doc(db, 'users', data.userId));
    const userData = userDoc.exists() ? userDoc.data() : null;

    comments.push({
      id: commentDoc.id,
      postId: data.postId,
      userId: data.userId,
      userName: userData?.displayName || 'Unknown User',
      userAvatar: userData?.photoURL,
      content: data.content,
      edited: data.edited || false,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    });
  }

  return comments;
};

/**
 * Subscribe to comments for a post (real-time updates)
 */
export const subscribeToPostComments = (
  postId: string,
  callback: (comments: Comment[]) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe => {
  const commentsQuery = query(
    collection(db, 'comments'),
    where('postId', '==', postId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(
    commentsQuery,
    async (snapshot) => {
      const comments: Comment[] = [];

      for (const commentDoc of snapshot.docs) {
        const data = commentDoc.data();
        
        // Get user data
        const userDoc = await getDoc(doc(db, 'users', data.userId));
        const userData = userDoc.exists() ? userDoc.data() : null;

        comments.push({
          id: commentDoc.id,
          postId: data.postId,
          userId: data.userId,
          userName: userData?.displayName || 'Unknown User',
          userAvatar: userData?.photoURL,
          content: data.content,
          edited: data.edited || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      }

      callback(comments);
    },
    (error) => {
      console.error('Comments subscription error:', error);
      if (errorCallback) errorCallback(error);
    }
  );
};

// ==================== LEADERBOARD ====================

/**
 * Get leaderboard (top users by points)
 */
export const getLeaderboard = async (limitCount: number = 50): Promise<User[]> => {
  const usersQuery = query(
    collection(db, 'users'),
    orderBy('profile.points', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(usersQuery);
  const users: User[] = [];

  snapshot.forEach((doc) => {
    users.push({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    } as User);
  });

  return users;
};

/**
 * Search for users by display name
 */
export const searchUsers = async (searchTerm: string, limitCount: number = 20): Promise<User[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  // Note: This is a simple search. For better performance, use Algolia or similar
  const usersQuery = query(
    collection(db, 'users'),
    orderBy('displayName'),
    limit(limitCount)
  );

  const snapshot = await getDocs(usersQuery);
  const users: User[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    // Filter by search term (case-insensitive)
    if (data.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) && doc.id !== currentUser.uid) {
      users.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as User);
    }
  });

  return users;
};
