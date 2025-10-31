import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './config';
import { PowerUp, PowerUpType } from '@/types';

interface PowerUpDefinition {
  id: string;
  type: PowerUpType;
  name: string;
  description: string;
  icon: string;
  durationHours?: number;
  uses: number;
}

const POWER_UP_DEFINITIONS: PowerUpDefinition[] = [
  {
    id: 'freeze-streak',
    type: 'streak_freeze',
    name: 'Streak Freeze',
    description: 'Protect your streak for 24 hours even if you miss a habit.',
    icon: 'snowflake',
    durationHours: 24,
    uses: 1,
  },
  {
    id: 'double-points-day',
    type: 'double_points',
    name: 'Double Points',
    description: 'Earn double points on all completions for the next 24 hours.',
    icon: 'lightning-bolt',
    durationHours: 24,
    uses: 1,
  },
  {
    id: 'reminder-boost',
    type: 'reminder_boost',
    name: 'Reminder Boost',
    description: 'Receive enhanced reminders with motivational tips for 48 hours.',
    icon: 'bell-ring',
    durationHours: 48,
    uses: 1,
  },
];

const mapDefinitionToPowerUp = (definition: PowerUpDefinition): PowerUp => ({
  id: `${definition.id}_${Date.now()}`,
  type: definition.type,
  name: definition.name,
  description: definition.description,
  icon: definition.icon,
  durationHours: definition.durationHours,
  usesRemaining: definition.uses,
  activatedAt: undefined,
});

export const getPowerUpCatalog = (): PowerUpDefinition[] => POWER_UP_DEFINITIONS;

export const getUserPowerUps = async (): Promise<{ active: PowerUp[]; inventory: PowerUp[] }> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  const userRef = doc(db, 'users', currentUser.uid);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  const data = userDoc.data();
  const profile = data.profile ?? {};

  return {
    active: (profile.activePowerUps ?? []).map(mapStoredPowerUp),
    inventory: (profile.storedPowerUps ?? []).map(mapStoredPowerUp),
  };
};

const mapStoredPowerUp = (powerUp: any): PowerUp => ({
  id: powerUp.id,
  type: powerUp.type,
  name: powerUp.name,
  description: powerUp.description,
  icon: powerUp.icon,
  durationHours: powerUp.durationHours,
  usesRemaining: powerUp.usesRemaining ?? 0,
  activatedAt: powerUp.activatedAt?.toDate?.() ?? (powerUp.activatedAt ? new Date(powerUp.activatedAt) : undefined),
  expiresAt: powerUp.expiresAt?.toDate?.() ?? (powerUp.expiresAt ? new Date(powerUp.expiresAt) : undefined),
  metadata: powerUp.metadata,
});

export const grantPowerUpToUser = async (definitionId: string): Promise<PowerUp> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  const definition = POWER_UP_DEFINITIONS.find((item) => item.id === definitionId);
  if (!definition) {
    throw new Error('Unknown power-up');
  }

  const powerUp = mapDefinitionToPowerUp(definition);

  await updateDoc(doc(db, 'users', currentUser.uid), {
    'profile.storedPowerUps': arrayUnion({
      ...powerUp,
      activatedAt: null,
      expiresAt: null,
      grantedAt: serverTimestamp(),
    }),
  });

  return powerUp;
};

export const activatePowerUp = async (powerUpId: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  const { inventory } = await getUserPowerUps();
  const selected = inventory.find((item) => item.id === powerUpId);
  if (!selected) {
    throw new Error('Power-up not available');
  }

  const activatedAt = new Date();
  const expiresAt = selected.durationHours
    ? new Date(activatedAt.getTime() + selected.durationHours * 60 * 60 * 1000)
    : undefined;

  const updatedPowerUp: PowerUp = {
    ...selected,
    activatedAt,
    expiresAt,
  };

  const userRef = doc(db, 'users', currentUser.uid);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  const userData = userDoc.data();
  const storedPowerUps: any[] = userData.profile?.storedPowerUps ?? [];
  const activePowerUps: any[] = userData.profile?.activePowerUps ?? [];

  const filteredInventory = storedPowerUps.filter((item) => item.id !== powerUpId);

  await updateDoc(userRef, {
    'profile.storedPowerUps': filteredInventory,
    'profile.activePowerUps': [
      ...activePowerUps,
      {
        ...updatedPowerUp,
        activatedAt,
        expiresAt,
      },
    ],
  });
};

export const consumePowerUpUse = async (powerUpId: string): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  const userRef = doc(db, 'users', currentUser.uid);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  const activePowerUps: any[] = userDoc.data().profile?.activePowerUps ?? [];
  const updated = activePowerUps
    .map((item) => {
      if (item.id !== powerUpId) {
        return item;
      }

      const usesRemaining = (item.usesRemaining ?? 0) - 1;
      const stillActive = usesRemaining > 0;

      if (!stillActive) {
        return null;
      }

      return {
        ...item,
        usesRemaining,
      };
    })
    .filter(Boolean);

  await updateDoc(userRef, {
    'profile.activePowerUps': updated,
  });
};
