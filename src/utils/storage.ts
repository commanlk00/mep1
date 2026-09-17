import { INITIAL_USER_PROFILE } from '../data/learningData';
import { SubjectId, UserProfile } from '../types';

const STORAGE_KEY = 'mep_kids_adventure_profile_v1';

export function loadUserProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return INITIAL_USER_PROFILE;
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return INITIAL_USER_PROFILE;
    const parsed = JSON.parse(data);
    return {
      ...INITIAL_USER_PROFILE,
      ...parsed,
      stats: {
        ...INITIAL_USER_PROFILE.stats,
        ...(parsed.stats || {}),
      },
    };
  } catch {
    return INITIAL_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // local storage quota exceeded or disabled
  }
}

export function recordQuestionResult(
  profile: UserProfile,
  subject: SubjectId,
  isCorrect: boolean,
  timeSpentSeconds: number = 10
): { updatedProfile: UserProfile; didLevelUp: boolean; earnedStars: number; earnedExp: number } {
  const updated = JSON.parse(JSON.stringify(profile)) as UserProfile;

  const currentStats = updated.stats[subject];
  currentStats.answered += 1;
  currentStats.timeSpentSeconds += timeSpentSeconds;

  let earnedStars = 0;
  let earnedExp = 0;

  if (isCorrect) {
    currentStats.correct += 1;
    earnedStars = 3; // 3 stars per correct answer
    earnedExp = 25;
  } else {
    earnedStars = 1; // 1 encouragement star
    earnedExp = 8;
  }

  currentStats.stars += earnedStars;
  updated.totalStars += earnedStars;
  updated.exp += earnedExp;

  // Check level up
  let didLevelUp = false;
  while (updated.exp >= updated.maxExp) {
    updated.level += 1;
    updated.exp -= updated.maxExp;
    updated.maxExp = Math.round(updated.maxExp * 1.3); // scaling exp requirement
    didLevelUp = true;
    updated.totalStars += 15; // bonus stars for leveling up!
  }

  // Update daily quest counters
  updated.dailyQuests = updated.dailyQuests.map((quest) => {
    let matches = false;
    if (quest.id === 'quest_1' && subject === 'english') matches = true;
    if (quest.id === 'quest_2' && subject === 'thai') matches = true;
    if (quest.id === 'quest_3' && subject === 'math') matches = true;

    if (matches && !quest.completed) {
      const newCount = quest.currentCount + 1;
      const completed = newCount >= quest.targetCount;
      if (completed && !quest.completed) {
        updated.totalStars += quest.starReward;
      }
      return {
        ...quest,
        currentCount: newCount,
        completed,
      };
    }
    return quest;
  });

  saveUserProfile(updated);
  return { updatedProfile: updated, didLevelUp, earnedStars, earnedExp };
}

export function unlockSticker(profile: UserProfile, stickerId: string, cost: number): UserProfile | null {
  if (profile.totalStars < cost || profile.unlockedStickerIds.includes(stickerId)) {
    return null;
  }
  const updated: UserProfile = {
    ...profile,
    totalStars: profile.totalStars - cost,
    unlockedStickerIds: [...profile.unlockedStickerIds, stickerId],
  };
  saveUserProfile(updated);
  return updated;
}
