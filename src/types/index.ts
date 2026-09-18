export type SubjectId = 'english' | 'thai' | 'math';

export type EnglishCategory = 
  | 'occupations'
  | 'missing_letter'
  | 'animals' 
  | 'school' 
  | 'fruits_food' 
  | 'colors_shapes' 
  | 'body_parts' 
  | 'phonics';

export type ThaiCategory = 
  | 'thai_writing'
  | 'consonants' 
  | 'vowels' 
  | 'daily_words' 
  | 'spelling';

export type MathCategory = 
  | 'math_tens'
  | 'counting' 
  | 'addition_10' 
  | 'subtraction_10' 
  | 'patterns_compare';

export type CategoryId = EnglishCategory | ThaiCategory | MathCategory;

export interface MissingLetterData {
  fullWord: string;
  displayWord: string;
  missingLetter: string;
}

export interface VerticalCalculationData {
  num1: number;
  num2: number;
  operator: '+' | '-';
}

export interface QuestionItem {
  id: string;
  subject: SubjectId;
  category: CategoryId;
  prompt: string; // e.g., "What is this animal?" or "รูปนี้คืออะไร?" or "3 + 4 = ?"
  schoolSource: string; // e.g. "แนวข้อสอบ สาธิตจุฬาฯ (MEP)", "แนวข้อสอบ สาธิตเกษตรฯ (MEP)", "แนวข้อสอบ อัสสัมชัญ / กรุงเทพคริสเตียน"
  englishWord?: string;
  thaiWord?: string;
  phonics?: string; // e.g., "c - a - t"
  audioText?: string;
  lang?: 'en-US' | 'th-TH';
  imageEmoji: string;
  imageAltText?: string;
  mathObjects?: string[]; // for counting visualizations e.g. ['🍎', '🍎', '🍎']
  choices: string[];
  correctIndex: number;
  hint: string;
  funFact?: string;
  missingLetterData?: MissingLetterData;
  traceGuide?: string;
  verticalCalculation?: VerticalCalculationData;
  isWritingExercise?: boolean;
}

export interface CompanionCharacter {
  id: string;
  name: string;
  nameEn: string;
  avatar: string;
  color: string;
  greeting: string;
  cheerPhraseEn: string;
  cheerPhraseTh: string;
}

export interface StickerReward {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  category: string;
  cost: number;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'legendary';
}

export interface SubjectStats {
  answered: number;
  correct: number;
  stars: number;
  timeSpentSeconds: number;
}

export interface DailyQuest {
  id: string;
  titleTh: string;
  titleEn: string;
  targetCount: number;
  currentCount: number;
  starReward: number;
  completed: boolean;
}

export interface UserProfile {
  name: string;
  avatarId: string;
  level: number;
  exp: number;
  maxExp: number;
  totalStars: number;
  dailyStreak: number;
  lastActiveDate: string;
  stats: {
    english: SubjectStats;
    thai: SubjectStats;
    math: SubjectStats;
  };
  unlockedStickerIds: string[];
  dailyQuests: DailyQuest[];
}

export type GameView = 
  | 'home' 
  | 'learn' 
  | 'battle' 
  | 'stickers' 
  | 'parent_dashboard';
