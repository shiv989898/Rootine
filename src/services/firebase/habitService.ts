import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  writeBatch,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from './config';
import { Habit, HabitCompletion } from '@/types';
import { getCurrentUser } from './authService';
import { calculateStreak, getStartOfDay } from '@/utils/helpers';

/**
 * Create a new habit for the current user
 */
export const createHabit = async (habitData: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'currentStreak' | 'longestStreak' | 'completedDates' | 'updatedAt'>): Promise<Habit> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const habit: Omit<Habit, 'id'> = {
    ...habitData,
    userId: user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    currentStreak: 0,
    longestStreak: 0,
    completedDates: [],
  };

  const docRef = await addDoc(collection(db, 'habits'), habit);
  return { ...habit, id: docRef.id } as Habit;
};

/**
 * Get all habits for the current user
 */
export const getUserHabits = async (): Promise<Habit[]> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const q = query(
    collection(db, 'habits'),
    where('userId', '==', user.id),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnapshot: QueryDocumentSnapshot<DocumentData>) => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
    } as Habit;
  });
};

/**
 * Get a single habit by ID
 */
export const getHabitById = async (habitId: string): Promise<Habit | null> => {
  const docRef = doc(db, 'habits', habitId);
  const docSnapshot = await getDoc(docRef);
  
  if (!docSnapshot.exists()) return null;

  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    ...data,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
  } as Habit;
};

/**
 * Update a habit
 */
export const updateHabit = async (habitId: string, updates: Partial<Habit>): Promise<void> => {
  const docRef = doc(db, 'habits', habitId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

/**
 * Delete a habit and all its completions
 */
export const deleteHabit = async (habitId: string): Promise<void> => {
  // Delete all completions for this habit
  const q = query(
    collection(db, 'habitCompletions'),
    where('habitId', '==', habitId)
  );
  const completions = await getDocs(q);
  
  const batch = writeBatch(db);
  completions.docs.forEach((docSnapshot) => {
    batch.delete(docSnapshot.ref);
  });
  await batch.commit();

  // Delete the habit
  const habitRef = doc(db, 'habits', habitId);
  await deleteDoc(habitRef);
};

/**
 * Toggle habit completion for a specific date
 */
export const toggleHabitCompletion = async (habitId: string, date: Date = new Date()): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const dateStr = getStartOfDay(date).toISOString();
  
  // Check if completion already exists
  const q = query(
    collection(db, 'habitCompletions'),
    where('habitId', '==', habitId),
    where('userId', '==', user.id),
    where('date', '==', dateStr)
  );
  const existingCompletion = await getDocs(q);

  if (!existingCompletion.empty) {
    // Remove completion
    const completionRef = doc(db, 'habitCompletions', existingCompletion.docs[0].id);
    await deleteDoc(completionRef);
  } else {
    // Add completion
    await addDoc(collection(db, 'habitCompletions'), {
      habitId,
      userId: user.id,
      date: dateStr,
      completedAt: new Date(),
    });
  }

  // Update habit streaks
  await updateHabitStreaks(habitId);
};

/**
 * Get all completions for a habit
 */
export const getHabitCompletions = async (habitId: string): Promise<HabitCompletion[]> => {
  const q = query(
    collection(db, 'habitCompletions'),
    where('habitId', '==', habitId),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnapshot: QueryDocumentSnapshot<DocumentData>) => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      ...data,
      completedAt: data.completedAt instanceof Timestamp ? data.completedAt.toDate() : data.completedAt,
    } as HabitCompletion;
  });
};

/**
 * Check if habit is completed for a specific date
 */
export const isHabitCompletedOnDate = async (habitId: string, date: Date): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;

  const dateStr = getStartOfDay(date).toISOString();
  
  const q = query(
    collection(db, 'habitCompletions'),
    where('habitId', '==', habitId),
    where('userId', '==', user.id),
    where('date', '==', dateStr),
    limit(1)
  );
  const snapshot = await getDocs(q);

  return !snapshot.empty;
};

/**
 * Update habit streaks based on completions
 */
export const updateHabitStreaks = async (habitId: string): Promise<void> => {
  const completions = await getHabitCompletions(habitId);
  const completedDates = completions.map(c => c.date);
  
  const { current, longest } = calculateStreak(completedDates);

  const habitRef = doc(db, 'habits', habitId);
  await updateDoc(habitRef, {
    currentStreak: current,
    longestStreak: longest,
    completedDates: completedDates,
    updatedAt: new Date(),
  });
};

/**
 * Get habits completed today
 */
export const getTodaysCompletedHabits = async (): Promise<string[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  const todayStr = getStartOfDay(new Date()).toISOString();
  
  const q = query(
    collection(db, 'habitCompletions'),
    where('userId', '==', user.id),
    where('date', '==', todayStr)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnapshot) => docSnapshot.data().habitId);
};

/**
 * Get habit statistics for a user
 */
export const getHabitStatistics = async (): Promise<{
  totalHabits: number;
  completedToday: number;
  totalCompletions: number;
  bestStreak: number;
}> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const habits = await getUserHabits();
  const completedToday = await getTodaysCompletedHabits();

  const totalCompletions = habits.reduce((sum, habit) => 
    sum + (habit.completedDates?.length || 0), 0
  );

  const bestStreak = habits.reduce((max, habit) => 
    Math.max(max, habit.longestStreak || 0), 0
  );

  return {
    totalHabits: habits.length,
    completedToday: completedToday.length,
    totalCompletions,
    bestStreak,
  };
};

/**
 * Subscribe to habit updates (real-time)
 */
export const subscribeToHabits = (
  onUpdate: (habits: Habit[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  getCurrentUser().then(user => {
    if (!user) {
      onError?.(new Error('User not authenticated'));
      return;
    }

    const q = query(
      collection(db, 'habits'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const habits = snapshot.docs.map((docSnapshot: QueryDocumentSnapshot<DocumentData>) => {
          const data = docSnapshot.data();
          return {
            id: docSnapshot.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
          } as Habit;
        });
        onUpdate(habits);
      },
      (error) => {
        console.error('Habits subscription error:', error);
        onError?.(error);
      }
    );
  }).catch(error => {
    onError?.(error);
  });

  // Return empty unsubscribe function as fallback
  return () => {};
};
