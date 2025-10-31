import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  where,
  query,
  serverTimestamp,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from './config';
import { Quest, QuestProgress, QuestRequirement, Reward } from '@/types';

interface QuestTemplate {
  id: string;
  type: Quest['type'];
  title: string;
  description: string;
  requirement: QuestRequirement;
  reward: Reward;
  durationHours: number;
}

const DAILY_QUESTS: QuestTemplate[] = [
  {
    id: 'daily_complete_three',
    type: 'daily',
    title: 'Triple Threat',
    description: 'Complete 3 habits today to keep the momentum going.',
    requirement: { type: 'complete_habits', target: 3 },
    reward: { points: 40 },
    durationHours: 24,
  },
  {
    id: 'daily_category_focus',
    type: 'daily',
    title: 'Category Focus',
    description: 'Complete 2 habits from your busiest category.',
    requirement: { type: 'complete_category', target: 2 },
    reward: { points: 45 },
    durationHours: 24,
  },
  {
    id: 'daily_social_push',
    type: 'daily',
    title: 'Social Spark',
    description: 'Cheer on friends by liking or commenting 3 times.',
    requirement: { type: 'social_interaction', target: 3 },
    reward: { points: 30 },
    durationHours: 24,
  },
];

const WEEKLY_QUESTS: QuestTemplate[] = [
  {
    id: 'weekly_consistency',
    type: 'weekly',
    title: 'Consistency Champion',
    description: 'Complete 15 habits this week across any category.',
    requirement: { type: 'complete_habits', target: 15 },
    reward: { points: 200 },
    durationHours: 24 * 7,
  },
  {
    id: 'weekly_category_master',
    type: 'weekly',
    title: 'Specialist',
    description: 'Complete 8 mindfulness or fitness habits.',
    requirement: { type: 'complete_category', target: 8, category: 'mindfulness' },
    reward: { points: 220 },
    durationHours: 24 * 7,
  },
  {
    id: 'weekly_points_doubler',
    type: 'weekly',
    title: 'Point Surge',
    description: 'Earn 250 points in a single week.',
    requirement: { type: 'earn_points', target: 250 },
    reward: { points: 275 },
    durationHours: 24 * 7,
  },
];

const QUEST_COLLECTION = 'userQuests';

const EXPIRY_MARGIN_MS = 5 * 60 * 1000; // 5 minutes leeway for timers

const mapTemplateToQuest = (template: QuestTemplate, now: Date): Quest => {
  const expiresAt = new Date(now.getTime() + template.durationHours * 60 * 60 * 1000);
  return {
    id: template.id,
    type: template.type,
    title: template.title,
    description: template.description,
    requirement: template.requirement,
    reward: template.reward,
    expiresAt,
  };
};

const mapQuestDocToProgress = (docData: any): QuestProgress => {
  const requirement = docData.quest?.requirement ?? { type: 'complete_habits', target: 0 };

  return {
    quest: {
      ...docData.quest,
      expiresAt: docData.quest?.expiresAt?.toDate?.() ?? new Date(docData.quest?.expiresAt ?? Date.now()),
      requirement: {
        ...requirement,
        current: requirement.current ?? docData.progress ?? 0,
      },
    },
    progress: docData.progress ?? 0,
    isCompleted: docData.isCompleted ?? false,
    isClaimed: docData.isClaimed ?? false,
    updatedAt: docData.updatedAt?.toDate?.() ?? new Date(docData.updatedAt ?? Date.now()),
  };
};

const ensureQuestSet = async (templates: QuestTemplate[], type: Quest['type']): Promise<QuestProgress[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  const now = new Date();
  const questDocsQuery = query(
    collection(db, QUEST_COLLECTION),
    where('userId', '==', currentUser.uid),
    where('type', '==', type)
  );

  const snapshot = await getDocs(questDocsQuery);
  const activeQuests: QuestProgress[] = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const expiresAt = data.quest?.expiresAt?.toDate?.() ?? new Date();
    if (expiresAt.getTime() + EXPIRY_MARGIN_MS < now.getTime()) {
      return;
    }
    activeQuests.push(mapQuestDocToProgress(data));
  });

  if (activeQuests.length > 0) {
    return activeQuests.sort((a, b) => a.quest.expiresAt.getTime() - b.quest.expiresAt.getTime());
  }

  const shuffled = [...templates].sort(() => Math.random() - 0.5);
  const selected = type === 'daily' ? shuffled.slice(0, 2) : shuffled.slice(0, 1);

  const quests: QuestProgress[] = [];
  for (const template of selected) {
    const quest = mapTemplateToQuest(template, now);
    const questDocRef = doc(collection(db, QUEST_COLLECTION));

    const questProgress: QuestProgress = {
      quest,
      progress: 0,
      isCompleted: false,
      isClaimed: false,
      updatedAt: now,
    };

    quests.push(questProgress);

    await setDoc(questDocRef, {
      userId: currentUser.uid,
      type,
      quest: {
        ...quest,
        requirement: {
          ...quest.requirement,
          current: 0,
        },
        expiresAt: Timestamp.fromDate(quest.expiresAt),
      },
      progress: 0,
      isCompleted: false,
      isClaimed: false,
      updatedAt: serverTimestamp(),
    });
  }

  return quests;
};

export const getActiveQuests = async (): Promise<QuestProgress[]> => {
  const [daily, weekly] = await Promise.all([
    ensureQuestSet(DAILY_QUESTS, 'daily'),
    ensureQuestSet(WEEKLY_QUESTS, 'weekly'),
  ]);

  return [...daily, ...weekly].sort((a, b) => a.quest.expiresAt.getTime() - b.quest.expiresAt.getTime());
};

export const incrementQuestProgress = async (
  questId: string,
  incrementBy: number
): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  const questQuery = query(
    collection(db, QUEST_COLLECTION),
    where('userId', '==', currentUser.uid),
    where('quest.id', '==', questId)
  );

  const snapshot = await getDocs(questQuery);
  if (snapshot.empty) {
    return;
  }

  const questDoc = snapshot.docs[0];
  const data = questDoc.data();
  const target = data.quest?.requirement?.target ?? 0;
  const currentProgress = data.progress ?? 0;
  const newProgress = Math.min(target, currentProgress + incrementBy);
  const isCompleted = newProgress >= target;

  await updateDoc(questDoc.ref, {
    progress: newProgress,
    isCompleted,
    updatedAt: serverTimestamp(),
    'quest.requirement.current': newProgress,
  });
};

export const claimQuestReward = async (questId: string): Promise<number> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  const questQuery = query(
    collection(db, QUEST_COLLECTION),
    where('userId', '==', currentUser.uid),
    where('quest.id', '==', questId)
  );

  const snapshot = await getDocs(questQuery);
  if (snapshot.empty) {
    throw new Error('Quest not found');
  }

  const questDoc = snapshot.docs[0];
  const data = questDoc.data();

  if (!data.isCompleted) {
    throw new Error('Quest not completed yet');
  }

  if (data.isClaimed) {
    throw new Error('Quest already claimed');
  }

  const rewardPoints = data.quest?.reward?.points ?? 0;

  await updateDoc(questDoc.ref, {
    isClaimed: true,
    claimedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'users', currentUser.uid), {
    'profile.points': increment(rewardPoints),
    'profile.weeklyPoints': increment(rewardPoints),
    'profile.monthlyPoints': increment(rewardPoints),
  });

  return rewardPoints;
};
