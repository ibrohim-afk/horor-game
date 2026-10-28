export type CameraMode = 'FIRST_PERSON' | 'THIRD_PERSON' | 'TOP_DOWN';

export type Difficulty = 'MUDAH' | 'NORMAL' | 'MIMPI_BURUK';

export type CharacterId = 'raka' | 'sari' | 'joko' | 'dewi';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  role: string;
  description: string;
  perkDesc: string;
  skillName: string;
  skillDesc: string;
  skillCooldown: number; // in seconds
  speedMult: number;
  staminaMult: number;
  sanityRecoveryMult: number;
  unlockedByDefault: boolean;
  requiredLevelToUnlock: number;
  color: string;
  outfitDesc: string;
}

export type ItemType = 
  | 'BATTERY'
  | 'KEY_PADLOCK'
  | 'KEY_GATE'
  | 'KEY_ROOM'
  | 'KEYCARD'
  | 'NOTE_SHEET'
  | 'MEDICAL_RECORD'
  | 'JIMAT'
  | 'GARAM'
  | 'AIR_DOA'
  | 'BOTTLE'
  | 'LORE_NOTE'
  | 'EMAS_BATANGAN'
  | 'BONEKA_SANTET';

export interface InventoryItem {
  id: string;
  type: ItemType;
  name: string;
  icon: string;
  count: number;
  description: string;
}

export interface LoreNote {
  id: string;
  levelId: number;
  title: string;
  content: string;
  date: string;
  found: boolean;
}

export type GhostState = 'DORMANT' | 'PATROL' | 'INVESTIGATE' | 'CHASE' | 'SEARCH' | 'STUN';

export interface StoryRiddle {
  id: string;
  title: string;
  loreContext: string;
  question: string;
  options: string[];
  correctIndex: number;
  rewardItemName: string;
  explanation: string;
  solved: boolean;
}

// Interactive Storyline Choice & Encounter
export interface StoryChoice {
  id: string;
  text: string;
  response: string;
  consequenceType: 'SANITY' | 'SCORE' | 'ITEM' | 'GHOST_PACIFY' | 'GHOST_ENRAGE' | 'CLUE';
  consequenceValue?: any;
  consequenceDesc: string;
}

export interface StoryEncounter {
  id: string;
  levelId: number;
  title: string;
  speakerName: string;
  speakerRole: string;
  speakerAvatar: string;
  contextText: string;
  dialogueMessage: string;
  choices: StoryChoice[];
  resolvedChoiceId?: string;
  x: number;
  z: number;
}

// Furniture Customization System
export type FurnitureCategory = 'BED' | 'ALTAR' | 'LAMP' | 'WALL_RELIC' | 'CARPET';

export interface FurnitureItem {
  id: string;
  category: FurnitureCategory;
  name: string;
  subtitle: string;
  description: string;
  buffDesc: string;
  icon: string;
  unlocked: boolean;
  modelType: string;
  stats: {
    sanityDrainReduction?: number; // percentage e.g. 0.20
    staminaRecoveryBonus?: number; // percentage e.g. 0.25
    batteryEfficiency?: number;    // percentage e.g. 0.30
    ghostDetectionReduction?: number; // meters e.g. 3.0
    speedBonus?: number;          // multiplier e.g. 0.10
    extraLives?: number;          // +1 life
  };
}

export interface FurnitureSetup {
  bed: string;
  altar: string;
  lamp: string;
  wallRelic: string;
  carpet: string;
}

export interface GhostData {
  id: string;
  name: string;
  type: 'POCONG' | 'NONI_BELANDA' | 'SUSTER_NGESOT' | 'TUYUL' | 'BABI_NGEPET' | 'GENDERUWO' | 'KUNTILANAK' | 'NYAI_RATIH';
  speed: number;
  hearingSensitivity: number; // multiplier
  sightRange: number;
  sightAngle: number; // radians
  description: string;
}

export interface LevelObjective {
  id: string;
  text: string;
  completed: boolean;
  current: number;
  required: number;
}

export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  location: string;
  difficultyRating: string;
  ghostType: 'POCONG' | 'NONI_BELANDA' | 'SUSTER_NGESOT' | 'TUYUL' | 'BABI_NGEPET' | 'GENDERUWO' | 'KUNTILANAK' | 'NYAI_RATIH';
  ghostName: string;
  atmosphereColor: number;
  fogColor: number;
  fogDensity: number;
  wallColor: number;
  floorColor: number;
  grid: string[]; // ascii map
  parTimeSeconds: number;
  objectives: LevelObjective[];
  loreNotes: LoreNote[];
  riddles: StoryRiddle[];
  storyEncounters: StoryEncounter[];
  isLocked: boolean;
  comingSoon?: boolean;
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  mouseSensitivity: number;
  graphicsQuality: 'RENDAH' | 'SEDANG' | 'TINGGI';
  brightness: number;
  subtitles: boolean;
  safeMode: boolean; // disable jumpscares
  leftHandedMobile: boolean;
  hapticFeedback: boolean;
  mobileJoystickScale: number; // 0.8, 1.0, 1.2
}

export interface GameProgress {
  unlockedCharacters: CharacterId[];
  levelStars: Record<number, number>; // levelId -> 1..3 stars
  levelCompleted: Record<number, boolean>;
  levelBestScores: Record<number, number>;
  collectedNotes: string[]; // note IDs
  achievements: string[];
  furnitureSetup: FurnitureSetup;
  unlockedFurniture: string[]; // furniture IDs
  storyChoicesMade: Record<string, string>; // encounterId -> choiceId
}

export interface NoiseEvent {
  x: number;
  z: number;
  radius: number;
  intensity: number;
  timestamp: number;
}
