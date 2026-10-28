import { CharacterDef, CharacterId, Difficulty, FurnitureItem, FurnitureSetup, StoryChoice } from './types';

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  raka: {
    id: 'raka',
    name: 'Raka',
    role: 'Mahasiswa Pecinta Alam & Atlet Lari',
    description: 'Fisik atletis terlatih, mengenakan jaket windbreaker outdoor tangguh dan sepatu gunung. Mampu bergerak cepat dan bertahan lebih lama di medan angker.',
    perkDesc: 'Kecepatan gerak +10%, Kapasitas stamina +25%',
    skillName: 'Lari Kilat',
    skillDesc: 'Melaju dengan kecepatan ganda selama 1,5 detik.',
    skillCooldown: 25,
    speedMult: 1.10,
    staminaMult: 1.25,
    sanityRecoveryMult: 1.0,
    unlockedByDefault: true,
    requiredLevelToUnlock: 1,
    color: '#3b82f6',
    outfitDesc: 'Jaket Outdoor Biru Navy, Celana Kargo Taktikal & Sepatu Trekking',
  },
  sari: {
    id: 'sari',
    name: 'Sari',
    role: 'Perawat Unit Gawat Darurat',
    description: 'Mental stabil, mengenakan seragam medis hijau perawat dengan stetoskop di pundak. Sangat terlatih menghadapi kepanikan dan menenangkan kondisi trauma.',
    perkDesc: 'Keberanian (Sanity) pulih 2x lebih cepat.',
    skillName: 'Tarik Napas',
    skillDesc: 'Diam sejenak untuk memulihkan 30% Keberanian seketika.',
    skillCooldown: 30,
    speedMult: 1.0,
    staminaMult: 1.0,
    sanityRecoveryMult: 2.0,
    unlockedByDefault: true,
    requiredLevelToUnlock: 1,
    color: '#10b981',
    outfitDesc: 'Seragam Medis Hijau Zamrud, Rambut Ikat Sanggul & Stetoskop Pundak',
  },
  joko: {
    id: 'joko',
    name: 'Pak Joko',
    role: 'Satpam Senior Pabrik Tua',
    description: 'Mantan penjaga malam kawakan berbadan tegap dengan seragam dinas satpam resmi, lencana perak, dan topi pet dinas. Senter patrolinya berdaya sorot tinggi.',
    perkDesc: 'Senter 40% lebih terang, baterai hemat 30%.',
    skillName: 'Sorot Terang',
    skillDesc: 'Kilatan cahaya tajam yang menghentikan hantu di depan selama 2,5 detik.',
    skillCooldown: 30,
    speedMult: 0.95,
    staminaMult: 1.05,
    sanityRecoveryMult: 1.1,
    unlockedByDefault: false,
    requiredLevelToUnlock: 2,
    color: '#f59e0b',
    outfitDesc: 'Seragam Satpam Resmi Beremblem, Sabuk Taktikal & Topi Pet Dinas',
  },
  dewi: {
    id: 'dewi',
    name: 'Dewi',
    role: 'Anak Indigo Keturunan Keraton',
    description: 'Gadis peka aura astral, mengenakan kebaya modern anggun dengan selendang batik pusaka dan gelang giok. Mampu merasakan kehadiran makhluk gaib.',
    perkDesc: 'Peringatan bahaya hantu berbunyi 2 detik lebih awal.',
    skillName: 'Mata Batin',
    skillDesc: 'Melihat siluet hantu menembus dinding selama 4 detik (menguras 15% Keberanian).',
    skillCooldown: 35,
    speedMult: 1.0,
    staminaMult: 0.95,
    sanityRecoveryMult: 1.2,
    unlockedByDefault: false,
    requiredLevelToUnlock: 4,
    color: '#8b5cf6',
    outfitDesc: 'Kebaya Modern Ungu Anggun, Selendang Batik Pusaka & Bando Rambut',
  },
};

// --- Furniture Customization Catalog ---
export const FURNITURE_CATALOG: FurnitureItem[] = [
  // 1. Bed Options
  {
    id: 'dipan_jati',
    category: 'BED',
    name: 'Dipan Jati Ukir Jepara',
    subtitle: 'Kayu Jati Kuno 1920',
    description: 'Ranjang kayu jati kuno bertatahkan ukiran sulur flora Jawa yang kokoh, memberikan rasa aman mendalam.',
    buffDesc: 'Pemulihan Stamina +25% saat beristirahat & jongkok',
    icon: '🛏️',
    unlocked: true,
    modelType: 'JATI',
    stats: { staminaRecoveryBonus: 0.25 },
  },
  {
    id: 'ranjang_kolonial',
    category: 'BED',
    name: 'Ranjang Besi Kolonial Belanda',
    subtitle: 'Peninggalan Villa Girimulyo',
    description: 'Ranjang berkerangka besi tempa Eropa dengan ornamen kuningan, berpegas lentur dan mempercepat kesigapan kaki.',
    buffDesc: 'Kecepatan Gerak Jalan & Lari +10%',
    icon: '🏰',
    unlocked: true,
    modelType: 'KOLONIAL',
    stats: { speedBonus: 0.10 },
  },
  {
    id: 'ranjang_bambu',
    category: 'BED',
    name: 'Ranjang Bambu Wulung Keramat',
    subtitle: 'Anyaman Tradisional Lereng Merapi',
    description: 'Ranjang dari bilah bambu hitam tua yang disucikan dengan rempah wangi, menenangkan jiwa yang terguncang.',
    buffDesc: 'Pemulihan Keberanian (Sanity) +20% di dekat lilin',
    icon: '🎋',
    unlocked: false,
    modelType: 'BAMBU',
    stats: { sanityDrainReduction: 0.20 },
  },

  // 2. Altar Options
  {
    id: 'meja_gaharu',
    category: 'ALTAR',
    name: 'Meja Gaharu Sesajen Kuno',
    subtitle: 'Kayu Gaharu Beraroma Kemenyan',
    description: 'Altar sesajen dari kayu gaharu tua yang mengeluarkan aroma mistis penolak hawa dingin arwah.',
    buffDesc: 'Dampak Teror Hantu & Penurunan Keberanian -20%',
    icon: '🕯️',
    unlocked: true,
    modelType: 'GAHARU',
    stats: { sanityDrainReduction: 0.20 },
  },
  {
    id: 'meja_naga',
    category: 'ALTAR',
    name: 'Meja Kayu Naga Wirawan',
    subtitle: 'Ukir Relief Naga Emas',
    description: 'Meja pusaka keluarga Wirawan dengan relief naga berkilau, menyimpan aura perlawanan terhadap santet.',
    buffDesc: 'Efek Stun Jimat & Botol Pengalih +1,5 Detik',
    icon: '🐉',
    unlocked: true,
    modelType: 'NAGA',
    stats: { ghostDetectionReduction: 2.0 },
  },
  {
    id: 'meja_pualam',
    category: 'ALTAR',
    name: 'Meja Pualam Marmer Belanda',
    subtitle: 'Batu Marmer Putih Carrara',
    description: 'Meja marmer dingin berurat abu-abu yang memantulkan cahaya senter secara tajam ke seluruh sudut ruangan.',
    buffDesc: 'Jarak Pancaran Senter +20% & Lebih Terang',
    icon: '🏛️',
    unlocked: false,
    modelType: 'PUALAM',
    stats: { batteryEfficiency: 0.20 },
  },

  // 3. Lamp Options
  {
    id: 'petromak_tembaga',
    category: 'LAMP',
    name: 'Lampu Petromak Tembaga Antik',
    subtitle: 'Penerangan Hangat Minyak Gas',
    description: 'Lampu gantung tembaga kuning bertekanan gas yang memancarkan cahaya hangat stabil penolak bayangan gaib.',
    buffDesc: 'Penggunaan Baterai Senter 30% Lebih Hemat',
    icon: '🏮',
    unlocked: true,
    modelType: 'PETROMAK',
    stats: { batteryEfficiency: 0.30 },
  },
  {
    id: 'lampu_teplok',
    category: 'LAMP',
    name: 'Lampu Teplok Kaca Semprong',
    subtitle: 'Minyak Jelantah Tradisional',
    description: 'Lampu minyak gantung bersumber api lembut yang membuat pergerakan hantu menjadi lebih berat dan lambat.',
    buffDesc: 'Kecepatan Kejar Hantu Melambat 12%',
    icon: '🪔',
    unlocked: true,
    modelType: 'TEPLOK',
    stats: { ghostDetectionReduction: 1.5 },
  },
  {
    id: 'lilin_dupa',
    category: 'LAMP',
    name: 'Lilin Merah & Pedupaan Melati',
    subtitle: 'Sesaji Tujuh Rupa Keraton',
    description: 'Sepasang lilin merah besar dengan asap dupa wangi melati yang menajamkan pendengaran pemain.',
    buffDesc: 'Peringatan Langkah Hantu Berbunyi 3 Meter Lebih Awal',
    icon: '✨',
    unlocked: false,
    modelType: 'DUPA',
    stats: { ghostDetectionReduction: 3.0 },
  },

  // 4. Wall Relic Options
  {
    id: 'keris_nagasasra',
    category: 'WALL_RELIC',
    name: 'Keris Naga Sasra di Beludru',
    subtitle: 'Pusaka Luk Sembilan Mataram',
    description: 'Bilah keris berpamor emas berlekuk sembilan dipajang dalam pigura kaca beludru merah, menebarkan wibawa gaib.',
    buffDesc: 'Radius Deteksi Suara Hantu Berkurang 3 Meter',
    icon: '🗡️',
    unlocked: true,
    modelType: 'KERIS',
    stats: { ghostDetectionReduction: 3.0 },
  },
  {
    id: 'topeng_klana',
    category: 'WALL_RELIC',
    name: 'Topeng Wayang Klana Sakti',
    subtitle: 'Kayu Pule Merah Berukir Taring',
    description: 'Topeng tari klasik berwajah merah murka dengan mata melotot, menakut-nakuti makhluk astral yang memandang.',
    buffDesc: 'Memberikan +1 Kuota Doa Perlindungan Ekstra',
    icon: '👺',
    unlocked: true,
    modelType: 'TOPENG',
    stats: { extraLives: 1 },
  },
  {
    id: 'potret_wirawan',
    category: 'WALL_RELIC',
    name: 'Potret Leluhur Wirawan (1928)',
    subtitle: 'Foto Sepia Pigura Kayu Jati',
    description: 'Potret berwibawa Juragan Wirawan yang sorot matanya mengikuti langkah kaki, menyingkap letak benda rahasia.',
    buffDesc: 'Benda Misi & Kunci Berpendar Lebih Terang di Kejauhan',
    icon: '🖼️',
    unlocked: false,
    modelType: 'POTRET',
    stats: { sanityDrainReduction: 0.15 },
  },

  // 5. Carpet Options
  {
    id: 'batik_parang',
    category: 'CARPET',
    name: 'Permadani Batik Parang Barong',
    subtitle: 'Batik Tulis Pewarna Alami Sogan',
    description: 'Hiasan lantai bermotif parang barong ksatria yang meredam bunyi derit lantai kayu di sekeliling rumah.',
    buffDesc: 'Langkah Kaki Berjalan & Lari 40% Lebih Senyap',
    icon: '📜',
    unlocked: true,
    modelType: 'PARANG',
    stats: { ghostDetectionReduction: 2.5 },
  },
  {
    id: 'karpet_beludru',
    category: 'CARPET',
    name: 'Karpet Beludru Merah Kolonial',
    subtitle: 'Tenunan Halus Wol Eropa',
    description: 'Karpet tebal beludru merah maroon bertepi rumbai emas yang empuk, membuat kaki melangkah lebih ringan.',
    buffDesc: 'Kecepatan Gerak +8% di Seluruh Area Rumah',
    icon: '🧶',
    unlocked: true,
    modelType: 'BELUDRU',
    stats: { speedBonus: 0.08 },
  },
  {
    id: 'tikar_pandan',
    category: 'CARPET',
    name: 'Tikar Pandan Wangi Suci',
    subtitle: 'Anyaman Tangan Desa Karangwungu',
    description: 'Tikar wangi anyaman pandan laut yang disiram air doa, memancarkan kesucian tanah kampung halaman.',
    buffDesc: 'Keberanian (Sanity) Pulih Berkala Walau Tanpa Lilin (+2/detik)',
    icon: '🌾',
    unlocked: false,
    modelType: 'PANDAN',
    stats: { sanityDrainReduction: 0.25 },
  },
];

export const DEFAULT_FURNITURE_SETUP: FurnitureSetup = {
  bed: 'dipan_jati',
  altar: 'meja_gaharu',
  lamp: 'petromak_tembaga',
  wallRelic: 'keris_nagasasra',
  carpet: 'batik_parang',
};

/**
 * Calculates aggregated buffs from active furniture customization
 */
export function calculateFurnitureBuffs(setup: FurnitureSetup) {
  let sanityDrainReduction = 0;
  let staminaRecoveryBonus = 0;
  let batteryEfficiency = 0;
  let ghostDetectionReduction = 0;
  let speedBonus = 0;
  let extraLives = 0;

  const items = [
    FURNITURE_CATALOG.find((f) => f.id === setup.bed),
    FURNITURE_CATALOG.find((f) => f.id === setup.altar),
    FURNITURE_CATALOG.find((f) => f.id === setup.lamp),
    FURNITURE_CATALOG.find((f) => f.id === setup.wallRelic),
    FURNITURE_CATALOG.find((f) => f.id === setup.carpet),
  ];

  for (const it of items) {
    if (!it || !it.stats) continue;
    if (it.stats.sanityDrainReduction) sanityDrainReduction += it.stats.sanityDrainReduction;
    if (it.stats.staminaRecoveryBonus) staminaRecoveryBonus += it.stats.staminaRecoveryBonus;
    if (it.stats.batteryEfficiency) batteryEfficiency += it.stats.batteryEfficiency;
    if (it.stats.ghostDetectionReduction) ghostDetectionReduction += it.stats.ghostDetectionReduction;
    if (it.stats.speedBonus) speedBonus += it.stats.speedBonus;
    if (it.stats.extraLives) extraLives += it.stats.extraLives;
  }

  return {
    sanityDrainReduction: Math.min(0.60, sanityDrainReduction),
    staminaRecoveryBonus: Math.min(0.75, staminaRecoveryBonus),
    batteryEfficiency: Math.min(0.60, batteryEfficiency),
    ghostDetectionReduction: Math.min(6.0, ghostDetectionReduction),
    speedBonus: Math.min(0.30, speedBonus),
    extraLives,
  };
}

/**
 * Noise radius in meters for different player and environment actions
 */
export function getNoiseRadius(action: 'CROUCH' | 'WALK' | 'RUN' | 'OPEN_DOOR' | 'SLAM_DOOR' | 'BREAK_BOTTLE', noiseReductionMeters: number = 0): number {
  let baseRadius = 6.0;
  switch (action) {
    case 'CROUCH':
      baseRadius = 2.0;
      break;
    case 'WALK':
      baseRadius = 6.0;
      break;
    case 'RUN':
      baseRadius = 14.0;
      break;
    case 'OPEN_DOOR':
      baseRadius = 8.0;
      break;
    case 'SLAM_DOOR':
      baseRadius = 20.0;
      break;
    case 'BREAK_BOTTLE':
      baseRadius = 18.0;
      break;
  }
  return Math.max(1.0, baseRadius - noiseReductionMeters);
}

/**
 * Calculates score upon completing a level
 */
export function calculateScore(
  baseScore: number,
  timeTaken: number,
  parTime: number,
  notesFound: number,
  totalNotes: number,
  timesCaught: number,
  cameraMultiplier: number = 1.0,
  storyDecisionsBonus: number = 0
): number {
  const timeBonus = Math.max(0, Math.round((parTime - timeTaken) * 5));
  const notesBonus = notesFound * 300;
  const stealthBonus = timesCaught === 0 ? 1000 : Math.max(0, 500 - timesCaught * 200);

  const rawScore = baseScore + timeBonus + notesBonus + stealthBonus + storyDecisionsBonus;
  return Math.max(100, Math.round(rawScore * cameraMultiplier));
}

/**
 * Calculates 1-3 star rating for level completion
 */
export function calculateStars(
  completed: boolean,
  notesFound: number,
  timesCaught: number,
  timeTaken: number,
  parTime: number
): number {
  if (!completed) return 0;
  let stars = 1;
  // Second star: found at least 2 notes and caught at most once
  if (notesFound >= 2 && timesCaught <= 1) {
    stars = 2;
  }
  // Third star: found all 3 notes, never caught, and within par time + 60s
  if (notesFound >= 3 && timesCaught === 0 && timeTaken <= parTime + 60) {
    stars = 3;
  }
  return stars;
}

/**
 * Updates Keberanian (Sanity 0-100) taking into account furniture buff
 */
export function updateSanity(
  currentSanity: number,
  inDarkness: boolean,
  distanceToGhost: number,
  isLookingAtGhost: boolean,
  isNearCandle: boolean,
  delta: number,
  recoveryMult: number = 1.0,
  drainReductionFraction: number = 0.0
): number {
  let rate = 0;

  if (isNearCandle) {
    rate += 6.0 * recoveryMult; // steady healing
  }

  const drainMult = Math.max(0.4, 1.0 - drainReductionFraction);

  if (inDarkness) {
    rate -= 1.5 * drainMult; // slow dread in dark
  } else if (!isNearCandle) {
    rate += 1.0 * recoveryMult; // baseline lit room recovery
  }

  if (distanceToGhost < 12.0) {
    const proximityThreat = (12.0 - distanceToGhost) / 12.0; // 0..1
    rate -= proximityThreat * 8.0 * drainMult;

    if (isLookingAtGhost) {
      rate -= proximityThreat * 12.0 * drainMult; // looking directly drains faster
    }
  }

  const nextSanity = Math.max(0, Math.min(100, currentSanity + rate * delta));
  return nextSanity;
}

/**
 * Updates Stamina (0-100)
 */
export function updateStamina(
  currentStamina: number,
  isRunning: boolean,
  isCrouching: boolean,
  isHoldingBreath: boolean,
  delta: number,
  maxStamina: number = 100,
  staminaRecoveryBonus: number = 0.0
): number {
  let rate = 0;
  const recBonusMult = 1.0 + staminaRecoveryBonus;

  if (isHoldingBreath) {
    rate = -18.0; // drains during breath holding
  } else if (isRunning) {
    rate = -22.0; // drains during sprint
  } else if (isCrouching) {
    rate = 20.0 * recBonusMult; // fast recovery while crouched
  } else {
    rate = 14.0 * recBonusMult; // normal walking/idle recovery
  }

  return Math.max(0, Math.min(maxStamina, currentStamina + rate * delta));
}

/**
 * Verifies piano puzzle chord/melody in Level 2
 */
export function verifyPianoPuzzle(inputNotes: string[], targetMelody: string[]): boolean {
  if (inputNotes.length !== targetMelody.length) return false;
  return inputNotes.every((note, idx) => note.toUpperCase() === targetMelody[idx].toUpperCase());
}

/**
 * Evaluates ghost detection of player
 */
export function evaluateGhostDetection(
  ghostType: string,
  distance: number,
  playerSpeed: number,
  inSightCone: boolean,
  flashlightOn: boolean,
  flashlightAimedAtGhost: boolean,
  isCrouched: boolean,
  saltActiveDistance: number,
  stealthBonusMeters: number = 0
): { detected: boolean; reason: 'SIGHT' | 'SOUND' | 'FLASHLIGHT' | 'NONE'; frozen?: boolean } {
  // If player is inside salt circle and ghost is near salt, ghost is repelled
  if (saltActiveDistance < 3.0 && ghostType !== 'NYAI_RATIH') {
    return { detected: false, reason: 'NONE' };
  }

  const adjustedDistance = distance + stealthBonusMeters;

  // Suster Ngesot is completely blind, relies 100% on hearing
  if (ghostType === 'SUSTER_NGESOT') {
    if (playerSpeed > 0.05) {
      const soundThreshold = isCrouched ? 2.5 : playerSpeed > 4.5 ? 16.0 : 8.0;
      if (adjustedDistance <= soundThreshold) {
        return { detected: true, reason: 'SOUND' };
      }
    }
    return { detected: false, reason: 'NONE' };
  }

  // Noni Belanda freezes when hit by flashlight beam
  if (ghostType === 'NONI_BELANDA') {
    if (flashlightOn && flashlightAimedAtGhost && distance < 10.0) {
      return { detected: true, reason: 'FLASHLIGHT', frozen: true };
    }
    if (inSightCone && adjustedDistance < 12.0) {
      return { detected: true, reason: 'SIGHT' };
    }
    if (playerSpeed > 4.5 && adjustedDistance < 10.0) {
      return { detected: true, reason: 'SOUND' };
    }
    return { detected: false, reason: 'NONE' };
  }

  // Pocong & default
  if (inSightCone && adjustedDistance < 14.0) {
    // Senter increases visibility range dramatically
    const maxVision = flashlightOn ? 18.0 : 10.0;
    if (adjustedDistance <= maxVision) {
      return { detected: true, reason: 'SIGHT' };
    }
  }

  // Sound detection
  const soundRange = isCrouched ? 2.5 : playerSpeed > 4.5 ? 14.0 : 6.0;
  if (adjustedDistance <= soundRange && playerSpeed > 0.1) {
    return { detected: true, reason: 'SOUND' };
  }

  return { detected: false, reason: 'NONE' };
}

/**
 * Returns lives count based on difficulty + furniture buff
 */
export function getDifficultyLives(difficulty: Difficulty, extraLives: number = 0): number {
  let base = 3;
  switch (difficulty) {
    case 'MUDAH':
      base = 5;
      break;
    case 'NORMAL':
      base = 3;
      break;
    case 'MIMPI_BURUK':
      base = 1;
      break;
  }
  return base + extraLives;
}

/**
 * Validates player answer to a story lore riddle
 */
export function checkRiddleAnswer(correctIndex: number, selectedOptionIndex: number): boolean {
  return selectedOptionIndex === correctIndex;
}

/**
 * Resolves consequences of an interactive story choice
 */
export function resolveStoryChoice(choice: StoryChoice): {
  sanityChange: number;
  scoreBonus: number;
  message: string;
  pacifyGhost: boolean;
  enrageGhost: boolean;
  rewardItem?: string;
} {
  let sanityChange = 0;
  let scoreBonus = 0;
  let pacifyGhost = false;
  let enrageGhost = false;
  let rewardItem: string | undefined = undefined;

  switch (choice.consequenceType) {
    case 'SANITY':
      sanityChange = choice.consequenceValue ?? 25;
      break;
    case 'SCORE':
      scoreBonus = choice.consequenceValue ?? 350;
      break;
    case 'GHOST_PACIFY':
      pacifyGhost = true;
      sanityChange = 15;
      break;
    case 'GHOST_ENRAGE':
      enrageGhost = true;
      scoreBonus = 500;
      break;
    case 'ITEM':
      rewardItem = choice.consequenceValue ?? 'Jimat Rajah';
      break;
    case 'CLUE':
      scoreBonus = 200;
      sanityChange = 10;
      break;
  }

  return {
    sanityChange,
    scoreBonus,
    message: choice.response,
    pacifyGhost,
    enrageGhost,
    rewardItem,
  };
}

/**
 * Decides whether the ghost should awaken from dormant state based on story progression
 * Ghost awakens only after player has uncovered lore notes, found a key, solved a riddle, or triggered a story encounter.
 */
export function shouldAwakenGhost(foundNotesCount: number, foundKeysCount: number, solvedRiddlesCount: number, storyDecisionsCount: number = 0): boolean {
  return foundNotesCount >= 1 || foundKeysCount >= 1 || solvedRiddlesCount >= 1 || storyDecisionsCount >= 1;
}

/**
 * Robust circle vs AABB (axis-aligned bounding box) collision detection
 * Ensures player and entities cannot clip through walls or doors even at high speed or glancing angles.
 */
export function checkCircleBoxCollision(
  cx: number,
  cz: number,
  radius: number,
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number
): boolean {
  // Find closest point on the rectangle to the circle center
  const closestX = Math.max(minX, Math.min(cx, maxX));
  const closestZ = Math.max(minZ, Math.min(cz, maxZ));

  // Calculate distance between circle's center and this closest point
  const distanceX = cx - closestX;
  const distanceZ = cz - closestZ;

  // If distance is less than radius, collision occurred
  const distanceSquared = distanceX * distanceX + distanceZ * distanceZ;
  return distanceSquared < radius * radius;
}

/**
 * Calculates proximity threat level, HUD warning text, vignette intensity, and flashlight flicker state
 */
export function calculateProximityThreat(distance: number, isChasing: boolean): {
  threatLevel: 'CALM' | 'TENSE' | 'DANGER' | 'CHASE';
  warningText: string | null;
  vignetteIntensity: number;
  shouldFlickerFlashlight: boolean;
  radarPulseRate: number;
} {
  if (isChasing) {
    return {
      threatLevel: 'CHASE',
      warningText: '🔥 BAHAYA! HANTU SEDANG MENGEJAR!',
      vignetteIntensity: 0.95,
      shouldFlickerFlashlight: true,
      radarPulseRate: 4.0,
    };
  }

  if (distance < 5.0) {
    return {
      threatLevel: 'DANGER',
      warningText: '🚨 ARWAH SANGAT DEKAT! JANGAN BERISIK / BERSEMBUNYI!',
      vignetteIntensity: 0.75,
      shouldFlickerFlashlight: true,
      radarPulseRate: 3.0,
    };
  }

  if (distance < 11.0) {
    return {
      threatLevel: 'TENSE',
      warningText: '⚠️ HAWA DINGIN MENCEKAM... (Suara gaib terdengar)',
      vignetteIntensity: 0.40,
      shouldFlickerFlashlight: distance < 8.0,
      radarPulseRate: 1.8,
    };
  }

  return {
    threatLevel: 'CALM',
    warningText: null,
    vignetteIntensity: 0.0,
    shouldFlickerFlashlight: false,
    radarPulseRate: 0.5,
  };
}

/**
 * Calculates struggle progress gain per tap/press
 * Raka has extra athletic stamina gain, flashlight shining at ghost adds bonus
 */
export function calculateStruggleTapGain(characterId: CharacterId = 'raka', hasFlashlightBeam: boolean = false): number {
  let baseGain = 22.0; // 5 quick taps to break free
  if (characterId === 'raka') baseGain += 4.0; // 4 taps
  if (characterId === 'joko') baseGain += 3.0;
  if (hasFlashlightBeam) baseGain += 6.0;
  return baseGain;
}

/**
 * Evaluates whether a door grid tile should align horizontally (E-W) or vertically (N-S)
 * based on adjacent wall placements in the level grid.
 */
export function evaluateDoorAlignment(grid: string[], row: number, col: number): {
  isVertical: boolean;
  rotationY: number;
  collisionMinX: number;
  collisionMaxX: number;
  collisionMinZ: number;
  collisionMaxZ: number;
} {
  const wx = col * 2 + 1;
  const wz = row * 2 + 1;

  const hasWallNorth = row > 0 && grid[row - 1][col] === 'W';
  const hasWallSouth = row < grid.length - 1 && grid[row + 1][col] === 'W';
  const hasWallWest = col > 0 && grid[row][col - 1] === 'W';
  const hasWallEast = col < grid[0].length - 1 && grid[row][col + 1] === 'W';

  // If walls are above/below, the doorway runs North-South, meaning the door plane spans North-South (Z-axis).
  // Thus it needs rotation Math.PI / 2.
  if ((hasWallNorth || hasWallSouth) && !(hasWallWest && hasWallEast)) {
    return {
      isVertical: true,
      rotationY: Math.PI / 2,
      collisionMinX: wx - 0.28,
      collisionMaxX: wx + 0.28,
      collisionMinZ: wz - 1.05,
      collisionMaxZ: wz + 1.05,
    };
  }

  // Default: doorway spans West-East (X-axis)
  return {
    isVertical: false,
    rotationY: 0,
    collisionMinX: wx - 1.05,
    collisionMaxX: wx + 1.05,
    collisionMinZ: wz - 0.28,
    collisionMaxZ: wz + 0.28,
  };
}

