import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { db, auth } from './config';
import { MoodEntry } from '@/types';
import { getStartOfDay } from '@/utils/helpers';

const COLLECTION_KEY = 'moodLogs';

export const logHabitMood = async (
  habitId: string,
  rating: number,
  note?: string
): Promise<void> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  await addDoc(collection(db, 'users', userId, COLLECTION_KEY), {
    habitId,
    userId,
    rating,
    note: note ?? null,
    date: getStartOfDay(new Date()).toISOString(),
    createdAt: serverTimestamp(),
  });
};

export const getMoodEntriesForHabit = async (habitId: string): Promise<MoodEntry[]> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const q = query(
    collection(db, 'users', userId, COLLECTION_KEY),
    where('habitId', '==', habitId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      habitId: data.habitId,
      userId: data.userId,
      rating: data.rating,
      note: data.note ?? undefined,
      date: data.date,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    } as MoodEntry;
  });
};
