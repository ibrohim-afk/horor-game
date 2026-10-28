import { GameProgress, GameSettings } from './types';
import { DEFAULT_FURNITURE_SETUP } from './rules';

const PROGRESS_KEY = 'ujinyali_progress_v2';
const SETTINGS_KEY = 'ujinyali_settings_v2';

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  musicVolume: 0.7,
  sfxVolume: 0.85,
  mouseSensitivity: 1.0,
  graphicsQuality: 'TINGGI',
  brightness: 1.0,
  subtitles: true,
  safeMode: false,
  leftHandedMobile: false,
  hapticFeedback: true,
  mobileJoystickScale: 1.0,
};

export const DEFAULT_PROGRESS: GameProgress = {
  unlockedCharacters: ['raka', 'sari'],
  levelStars: {},
  levelCompleted: {},
  levelBestScores: {},
  collectedNotes: [],
  achievements: [],
  furnitureSetup: { ...DEFAULT_FURNITURE_SETUP },
  unlockedFurniture: [
    'dipan_jati',
    'ranjang_kolonial',
    'meja_gaharu',
    'meja_naga',
    'petromak_tembaga',
    'lampu_teplok',
    'keris_nagasasra',
    'topeng_klana',
    'batik_parang',
    'karpet_beludru',
  ],
  storyChoicesMade: {},
};

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Gagal memuat pengaturan dari localStorage:', err);
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Gagal menyimpan pengaturan ke localStorage:', err);
  }
}

export function loadProgress(): GameProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      furnitureSetup: { ...DEFAULT_FURNITURE_SETUP, ...(parsed.furnitureSetup || {}) },
      unlockedFurniture: parsed.unlockedFurniture || DEFAULT_PROGRESS.unlockedFurniture,
      storyChoicesMade: parsed.storyChoicesMade || {},
    };
  } catch (err) {
    console.warn('Gagal memuat progres dari localStorage:', err);
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress: GameProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn('Gagal menyimpan progres ke localStorage:', err);
  }
}

export function recordLevelCompletion(
  levelId: number,
  score: number,
  stars: number,
  foundNotes: string[]
): GameProgress {
  const current = loadProgress();

  current.levelCompleted[levelId] = true;
  current.levelStars[levelId] = Math.max(current.levelStars[levelId] || 0, stars);
  current.levelBestScores[levelId] = Math.max(current.levelBestScores[levelId] || 0, score);

  // Add newly discovered notes
  for (const nId of foundNotes) {
    if (!current.collectedNotes.includes(nId)) {
      current.collectedNotes.push(nId);
    }
  }

  // Check character unlock thresholds
  if (levelId >= 2 && !current.unlockedCharacters.includes('joko')) {
    current.unlockedCharacters.push('joko');
  }
  if (levelId >= 4 && !current.unlockedCharacters.includes('dewi')) {
    current.unlockedCharacters.push('dewi');
  }

  // Unlock special furniture rewards on completing levels
  if (levelId >= 1 && !current.unlockedFurniture.includes('ranjang_bambu')) {
    current.unlockedFurniture.push('ranjang_bambu');
  }
  if (levelId >= 2 && !current.unlockedFurniture.includes('meja_pualam')) {
    current.unlockedFurniture.push('meja_pualam');
    current.unlockedFurniture.push('lilin_dupa');
  }
  if (levelId >= 3 && !current.unlockedFurniture.includes('potret_wirawan')) {
    current.unlockedFurniture.push('potret_wirawan');
    current.unlockedFurniture.push('tikar_pandan');
  }

  // Check achievements
  if (Object.keys(current.levelCompleted).length >= 1 && !current.achievements.includes('first_escape')) {
    current.achievements.push('first_escape');
  }
  if (current.collectedNotes.length >= 3 && !current.achievements.includes('kolektor_awal')) {
    current.achievements.push('kolektor_awal');
  }
  if (current.unlockedFurniture.length >= 12 && !current.achievements.includes('arsitek_mistis')) {
    current.achievements.push('arsitek_mistis');
  }

  saveProgress(current);
  return current;
}
