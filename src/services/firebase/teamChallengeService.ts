import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, auth } from './config';
import { TeamChallenge, TeamChallengeMember, TeamChallengeGoal } from '@/types';

interface CreateTeamChallengeInput {
  title: string;
  description: string;
  goal: TeamChallengeGoal;
  teamSizeLimit: number;
  reward: TeamChallenge['reward'];
  startDate: Date;
  endDate: Date;
  habitIds?: string[];
}

const TEAM_CHALLENGE_COLLECTION = 'teamChallenges';

const mapMember = (member: any): TeamChallengeMember => ({
  userId: member.userId,
  displayName: member.displayName,
  photoURL: member.photoURL,
  contribution: member.contribution ?? 0,
  joinedAt: member.joinedAt?.toDate?.() ?? new Date(),
  lastActivityAt: member.lastActivityAt?.toDate?.(),
});

const mapChallengeDoc = (docSnap: any): TeamChallenge => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    title: data.title,
    description: data.description,
    goal: data.goal,
    habitIds: data.habitIds ?? [],
    teamSizeLimit: data.teamSizeLimit ?? 10,
    createdBy: data.createdBy,
    reward: data.reward,
    startDate: data.startDate?.toDate?.() ?? new Date(),
    endDate: data.endDate?.toDate?.() ?? new Date(),
    members: Array.isArray(data.members) ? data.members.map(mapMember) : [],
    isActive: data.isActive ?? true,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  };
};

export const getActiveTeamChallenges = async (): Promise<TeamChallenge[]> => {
  const q = query(collection(db, TEAM_CHALLENGE_COLLECTION), where('isActive', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapChallengeDoc).sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
};

export const getUserTeamChallenges = async (): Promise<TeamChallenge[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  const q = query(
    collection(db, TEAM_CHALLENGE_COLLECTION),
    where('memberIds', 'array-contains', currentUser.uid)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapChallengeDoc);
};

export const createTeamChallenge = async (
  input: CreateTeamChallengeInput
): Promise<TeamChallenge> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  const challengeRef = doc(collection(db, TEAM_CHALLENGE_COLLECTION));
  const now = new Date();

  const creatorMember: TeamChallengeMember = {
    userId: currentUser.uid,
    displayName: currentUser.displayName || 'You',
    photoURL: currentUser.photoURL || undefined,
    contribution: 0,
    joinedAt: now,
    lastActivityAt: now,
  };

  await setDoc(challengeRef, {
    title: input.title,
    description: input.description,
    goal: input.goal,
    habitIds: input.habitIds ?? [],
    teamSizeLimit: input.teamSizeLimit,
    createdBy: currentUser.uid,
    reward: input.reward,
    startDate: Timestamp.fromDate(input.startDate),
    endDate: Timestamp.fromDate(input.endDate),
    members: [
      {
        userId: creatorMember.userId,
        displayName: creatorMember.displayName,
        photoURL: creatorMember.photoURL,
        contribution: 0,
        joinedAt: serverTimestamp(),
        lastActivityAt: serverTimestamp(),
      },
    ],
    memberIds: [currentUser.uid],
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const challengeSnap = await getDoc(challengeRef);
  return mapChallengeDoc(challengeSnap);
};

export const joinTeamChallenge = async (challengeId: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  const challengeRef = doc(db, TEAM_CHALLENGE_COLLECTION, challengeId);
  const challengeSnap = await getDoc(challengeRef);

  if (!challengeSnap.exists()) {
    throw new Error('Challenge not found');
  }

  const challenge = mapChallengeDoc(challengeSnap);
  if (!challenge.isActive) {
    throw new Error('Challenge is no longer active');
  }

  if (challenge.members.some((member) => member.userId === currentUser.uid)) {
    return;
  }

  if (challenge.members.length >= challenge.teamSizeLimit) {
    throw new Error('Challenge is full');
  }

  const newMember: TeamChallengeMember = {
    userId: currentUser.uid,
    displayName: currentUser.displayName || 'You',
    photoURL: currentUser.photoURL || undefined,
    contribution: 0,
    joinedAt: new Date(),
    lastActivityAt: new Date(),
  };

  await updateDoc(challengeRef, {
    members: arrayUnion({
      ...newMember,
      joinedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    }),
    memberIds: arrayUnion(currentUser.uid),
    updatedAt: serverTimestamp(),
  });
};

export const recordTeamContribution = async (
  challengeId: string,
  contribution: number
): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  const challengeRef = doc(db, TEAM_CHALLENGE_COLLECTION, challengeId);
  const challengeSnap = await getDoc(challengeRef);
  if (!challengeSnap.exists()) {
    throw new Error('Challenge not found');
  }

  const challenge = mapChallengeDoc(challengeSnap);
  const memberIndex = challenge.members.findIndex((member) => member.userId === currentUser.uid);

  if (memberIndex === -1) {
    throw new Error('Join the challenge before contributing');
  }

  const updatedMembers = [...challenge.members];
  updatedMembers[memberIndex] = {
    ...updatedMembers[memberIndex],
    contribution: updatedMembers[memberIndex].contribution + contribution,
    lastActivityAt: new Date(),
  };

  await updateDoc(challengeRef, {
    members: updatedMembers.map((member) => ({
      userId: member.userId,
      displayName: member.displayName,
      photoURL: member.photoURL,
      contribution: member.contribution,
      joinedAt: Timestamp.fromDate(member.joinedAt),
      lastActivityAt: Timestamp.fromDate(member.lastActivityAt ?? new Date()),
    })),
    updatedAt: serverTimestamp(),
  });
};

export const leaveTeamChallenge = async (challengeId: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  const challengeRef = doc(db, TEAM_CHALLENGE_COLLECTION, challengeId);
  const challengeSnap = await getDoc(challengeRef);
  if (!challengeSnap.exists()) {
    throw new Error('Challenge not found');
  }

  const challenge = mapChallengeDoc(challengeSnap);
  const filteredMembers = challenge.members.filter((member) => member.userId !== currentUser.uid);
  const filteredMemberIds = filteredMembers.map((member) => member.userId);

  await updateDoc(challengeRef, {
    members: filteredMembers.map((member) => ({
      userId: member.userId,
      displayName: member.displayName,
      photoURL: member.photoURL,
      contribution: member.contribution,
      joinedAt: Timestamp.fromDate(member.joinedAt),
      lastActivityAt: member.lastActivityAt ? Timestamp.fromDate(member.lastActivityAt) : null,
    })),
    memberIds: filteredMemberIds,
    updatedAt: serverTimestamp(),
  });
};
