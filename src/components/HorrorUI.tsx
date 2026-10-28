import React, { useState } from 'react';
import {
  CameraMode,
  CharacterDef,
  CharacterId,
  Difficulty,
  FurnitureCategory,
  FurnitureItem,
  FurnitureSetup,
  GameProgress,
  GameSettings,
  InventoryItem,
  LevelConfig,
  LoreNote,
  StoryEncounter,
  StoryRiddle,
} from '../game/types';
import { CHARACTERS, FURNITURE_CATALOG, calculateFurnitureBuffs } from '../game/rules';
import { LEVELS } from '../game/levels';
import {
  Flame,
  Volume2,
  Shield,
  Eye,
  Camera,
  Map as MapIcon,
  HelpCircle,
  Settings as SettingsIcon,
  Play,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Armchair,
  Sparkles,
  Zap,
  CheckCircle2,
  Footprints,
  Compass,
} from 'lucide-react';

interface HorrorUIProps {
  currentScreen: 'TITLE' | 'CHAR_SELECT' | 'LEVEL_SELECT' | 'SETTINGS' | 'HOW_TO_PLAY' | 'LORE_ARCHIVE' | 'FURNITURE' | 'PLAYING' | 'GAME_OVER' | 'LEVEL_COMPLETE';
  setCurrentScreen: (screen: any) => void;
  selectedChar: CharacterId;
  setSelectedChar: (id: CharacterId) => void;
  selectedLevel: LevelConfig;
  setSelectedLevel: (lvl: LevelConfig) => void;
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  settings: GameSettings;
  setSettings: (settings: GameSettings) => void;
  progress: GameProgress;
  onUpdateFurnitureSetup: (setup: FurnitureSetup) => void;

  // In-Game Live State
  sanity: number;
  stamina: number;
  battery: number;
  inventory: InventoryItem[];
  objectives: LevelConfig['objectives'];
  lives: number;
  score: number;
  cameraMode: CameraMode;
  interactionPrompt: string | null;
  isGhostChasing: boolean;
  activeNote: LoreNote | null;
  setActiveNote: (note: LoreNote | null) => void;
  activeRiddle: StoryRiddle | null;
  onAnswerRiddle: (choiceIndex: number) => { success: boolean; message: string; rewardItemName?: string };
  onCloseRiddle: () => void;
  activeStoryEncounter: StoryEncounter | null;
  onChooseStoryChoice: (encounterId: string, choiceId: string) => { message: string; consequenceDesc: string };
  onCloseStoryEncounter: () => void;
  isPianoOpen: boolean;
  setIsPianoOpen: (open: boolean) => void;
  onPianoKey: (note: string) => void;
  paranormalNotice: string | null;
  isHiding: boolean;
  onToggleFlashlight: () => void;
  onCycleCamera: () => void;
  onUseItem: (type: string) => void;
  onTriggerSkill: () => void;
  onHoldBreath: (holding: boolean) => void;
  onStartGame: () => void;
  onRestartLevel: () => void;
  onPerformAction: () => void;
  onToggleCrouch: () => void;
  onToggleSprint: (sprinting: boolean) => void;
  visitedTiles: Set<string>;
  activeBuffs: ReturnType<typeof calculateFurnitureBuffs>;
  ghostProximity: {
    distance: number;
    threatLevel: 'CALM' | 'TENSE' | 'DANGER' | 'CHASE';
    warningText: string | null;
    angle: number;
  };
  struggleState: {
    isStruggling: boolean;
    progress: number;
    timeRemaining: number;
  };
  onStruggleTap: () => void;
}

export const HorrorUI: React.FC<HorrorUIProps> = ({
  currentScreen,
  setCurrentScreen,
  selectedChar,
  setSelectedChar,
  selectedLevel,
  setSelectedLevel,
  difficulty,
  setDifficulty,
  settings,
  setSettings,
  progress,
  onUpdateFurnitureSetup,
  sanity,
  stamina,
  battery,
  inventory,
  objectives,
  lives,
  score,
  cameraMode,
  interactionPrompt,
  isGhostChasing,
  activeNote,
  setActiveNote,
  activeRiddle,
  onAnswerRiddle,
  onCloseRiddle,
  activeStoryEncounter,
  onChooseStoryChoice,
  onCloseStoryEncounter,
  isPianoOpen,
  setIsPianoOpen,
  onPianoKey,
  paranormalNotice,
  isHiding,
  onToggleFlashlight,
  onCycleCamera,
  onUseItem,
  onTriggerSkill,
  onHoldBreath,
  onStartGame,
  onRestartLevel,
  onPerformAction,
  onToggleCrouch,
  onToggleSprint,
  visitedTiles,
  activeBuffs,
  ghostProximity,
  struggleState,
  onStruggleTap,
}) => {
  const [showMinimap, setShowMinimap] = useState(false);
  const [objectivesCollapsed, setObjectivesCollapsed] = useState(false);
  const [isBreathHeld, setIsBreathHeld] = useState(false);
  const [isSprintActive, setIsSprintActive] = useState(false);
  const [riddleFeedback, setRiddleFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [storyFeedback, setStoryFeedback] = useState<{ message: string; consequence: string } | null>(null);
  const [selectedFurnitureCategory, setSelectedFurnitureCategory] = useState<FurnitureCategory>('BED');

  // --- 1. TITLE SCREEN ---
  if (currentScreen === 'TITLE') {
    return (
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/35 flex flex-col items-center justify-between p-6 z-50 overflow-y-auto">
        {/* Warning Banner */}
        <div className="text-center py-2 px-4 bg-red-950/60 border border-red-800/60 rounded text-red-300 text-xs tracking-wider max-w-lg mt-4 shadow-lg">
          ⚠️ PERINGATAN: Mengandung jumpscare, suara keras, dan ketegangan psikologis.
        </div>

        {/* Title Lockup */}
        <div className="text-center my-auto">
          <h1 className="font-cinzel text-4xl sm:text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-stone-100 via-stone-300 to-red-800 tracking-widest drop-shadow-[0_10px_20px_rgba(200,0,0,0.5)]">
            UJI NYALI
          </h1>
          <p className="font-cinzel text-lg sm:text-2xl text-red-500 font-semibold tracking-widest mt-2 uppercase">
            Malam Jumat Kliwon
          </p>
          <p className="text-stone-300 text-xs sm:text-sm max-w-lg mx-auto mt-3 font-light leading-relaxed">
            Jelajahi 7 rumah angker keluarga Wirawan. Ungkap rahasia pesugihan melalui alur cerita interaktif, kustomisasi furnitur penangkal kutukan, dan kabur sebelum fajar menyingsing.
          </p>

          {/* Active Furniture Buffs Preview Pill */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 mt-4 px-3 py-1.5 bg-amber-950/40 border border-amber-800/40 rounded-full text-[11px] text-amber-300">
            <span className="flex items-center gap-1 font-semibold"><Sparkles className="w-3 h-3" /> Buff Furnitur:</span>
            {activeBuffs.staminaRecoveryBonus > 0 && <span>Stamina +{Math.round(activeBuffs.staminaRecoveryBonus * 100)}%</span>}
            {activeBuffs.batteryEfficiency > 0 && <span>• Baterai +{Math.round(activeBuffs.batteryEfficiency * 100)}%</span>}
            {activeBuffs.ghostDetectionReduction > 0 && <span>• Senyap +{activeBuffs.ghostDetectionReduction}m</span>}
          </div>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6">
            <button
              onClick={() => setCurrentScreen('CHAR_SELECT')}
              className="w-52 py-3.5 px-6 bg-red-800 hover:bg-red-700 active:scale-95 text-stone-100 font-bold tracking-widest rounded-lg border border-red-500/50 shadow-lg shadow-red-950/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              MULAI MAIN
            </button>
            <button
              onClick={() => setCurrentScreen('FURNITURE')}
              className="w-52 py-3.5 px-6 bg-amber-950/70 hover:bg-amber-900/80 text-amber-200 font-semibold tracking-wider rounded-lg border border-amber-700/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Armchair className="w-5 h-5 text-amber-400" />
              KUSTOMISASI FURNITUR
            </button>
            <button
              onClick={() => setCurrentScreen('LEVEL_SELECT')}
              className="w-52 py-3.5 px-6 bg-stone-900/90 hover:bg-stone-800 text-stone-300 font-semibold tracking-wider rounded-lg border border-stone-700 transition-all cursor-pointer"
            >
              PILIH RUMAH
            </button>
          </div>

          {/* Auxiliary Navigation */}
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <button
              onClick={() => setCurrentScreen('HOW_TO_PLAY')}
              className="px-4 py-2 text-xs bg-stone-950/80 hover:bg-stone-800 text-stone-400 rounded-lg border border-stone-800 flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Cara Bermain & HP
            </button>
            <button
              onClick={() => setCurrentScreen('LORE_ARCHIVE')}
              className="px-4 py-2 text-xs bg-stone-950/80 hover:bg-stone-800 text-stone-400 rounded-lg border border-stone-800 flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" /> Arsip Catatan ({progress.collectedNotes.length}/21)
            </button>
            <button
              onClick={() => setCurrentScreen('SETTINGS')}
              className="px-4 py-2 text-xs bg-stone-950/80 hover:bg-stone-800 text-stone-400 rounded-lg border border-stone-800 flex items-center gap-1.5 cursor-pointer"
            >
              <SettingsIcon className="w-3.5 h-3.5" /> Pengaturan
            </button>
          </div>
        </div>

        {/* Footer controls hint */}
        <div className="text-center text-stone-500 text-[11px] font-mono pb-2">
          PC: WASD Jalan • Mouse Bidik • F Senter • E Aksi/Bicara • Shift Lari • C Jongkok • V Kamera • X Skill | HP: Joystick & Tombol Sentuh
        </div>
      </div>
    );
  }

  // --- 2. FURNITURE CUSTOMIZATION SCREEN ---
  if (currentScreen === 'FURNITURE') {
    const categories: { key: FurnitureCategory; label: string; icon: string }[] = [
      { key: 'BED', label: 'Dipan Ranjang', icon: '🛏️' },
      { key: 'ALTAR', label: 'Meja Sesajen', icon: '🕯️' },
      { key: 'LAMP', label: 'Penerangan', icon: '🏮' },
      { key: 'WALL_RELIC', label: 'Relik Dinding', icon: '🗡️' },
      { key: 'CARPET', label: 'Permadani Lantai', icon: '📜' },
    ];

    const currentCatItems = FURNITURE_CATALOG.filter((f) => f.category === selectedFurnitureCategory);

    return (
      <div className="absolute inset-0 bg-stone-950/95 flex flex-col p-4 sm:p-6 z-50 overflow-y-auto">
        <div className="flex justify-between items-center max-w-5xl w-full mx-auto mb-4">
          <div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-400 flex items-center gap-2">
              <Armchair className="w-6 h-6 text-amber-500" /> KUSTOMISASI RUMAH & FURNITUR PUSAKA
            </h2>
            <p className="text-xs text-stone-400">
              Tata furnitur di rumah angker keluarga Wirawan. Setiap furnitur memberikan berkah gaib (stat buff) untuk bertahan hidup.
            </p>
          </div>
          <button
            onClick={() => setCurrentScreen('TITLE')}
            className="text-stone-300 hover:text-white text-xs px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-900 cursor-pointer"
          >
            Kembali ke Menu
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 max-w-5xl w-full mx-auto mb-4">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedFurnitureCategory(cat.key)}
              className={`px-4 py-2 text-xs font-bold rounded-lg border flex items-center gap-2 transition-all cursor-pointer ${
                selectedFurnitureCategory === cat.key
                  ? 'bg-amber-900/80 border-amber-500 text-amber-200 shadow-lg shadow-amber-950/60 ring-1 ring-amber-500'
                  : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Items Grid for Current Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl w-full mx-auto">
          {currentCatItems.map((item) => {
            const isUnlocked = progress.unlockedFurniture.includes(item.id);
            const slotKey = item.category === 'BED' ? 'bed' : item.category === 'ALTAR' ? 'altar' : item.category === 'LAMP' ? 'lamp' : item.category === 'WALL_RELIC' ? 'wallRelic' : 'carpet';
            const isEquipped = progress.furnitureSetup[slotKey] === item.id;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isUnlocked) {
                    const newSetup = { ...progress.furnitureSetup, [slotKey]: item.id };
                    onUpdateFurnitureSetup(newSetup);
                  }
                }}
                className={`p-5 rounded-xl border transition-all relative flex flex-col justify-between ${
                  isEquipped
                    ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500 shadow-xl shadow-amber-950/40'
                    : isUnlocked
                    ? 'bg-stone-900/80 border-stone-800 hover:border-stone-700 cursor-pointer'
                    : 'bg-stone-950/60 border-stone-900 opacity-50 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-3xl">{item.icon}</span>
                    {isEquipped ? (
                      <span className="text-[11px] font-bold bg-amber-500 text-stone-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> DIPASANG
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[10px] text-stone-400 border border-stone-700 px-2 py-0.5 rounded">
                        Klik Pasang
                      </span>
                    ) : (
                      <span className="text-[10px] bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded font-mono">
                        Terkunci (Selesaikan Level)
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-stone-100 text-base">{item.name}</h3>
                  <div className="text-[11px] text-amber-500 font-mono mb-2">{item.subtitle}</div>
                  <p className="text-xs text-stone-400 leading-relaxed mb-4">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-stone-800/80">
                  <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{item.buffDesc}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Buffs Summary Banner */}
        <div className="max-w-5xl w-full mx-auto mt-6 bg-stone-900/90 border border-amber-800/50 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> TOTAL BUFF AKTIF RUMAH SAAT INI:
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-300 font-mono">
              <span>Keberanian Drain: <strong className="text-emerald-400">-{Math.round(activeBuffs.sanityDrainReduction * 100)}%</strong></span>
              <span>Pemulihan Stamina: <strong className="text-emerald-400">+{Math.round(activeBuffs.staminaRecoveryBonus * 100)}%</strong></span>
              <span>Efisiensi Senter: <strong className="text-emerald-400">+{Math.round(activeBuffs.batteryEfficiency * 100)}%</strong></span>
              <span>Radius Senyap: <strong className="text-emerald-400">+{activeBuffs.ghostDetectionReduction}m</strong></span>
              {activeBuffs.speedBonus > 0 && <span>Kecepatan: <strong className="text-emerald-400">+{Math.round(activeBuffs.speedBonus * 100)}%</strong></span>}
              {activeBuffs.extraLives > 0 && <span>Doa Tambahan: <strong className="text-emerald-400">+{activeBuffs.extraLives}</strong></span>}
            </div>
          </div>
          <button
            onClick={() => setCurrentScreen('LEVEL_SELECT')}
            className="px-6 py-2.5 bg-red-800 hover:bg-red-700 text-white font-bold text-xs tracking-wider rounded-lg border border-red-600 transition-all cursor-pointer"
          >
            Lanjut Main Uji Nyali
          </button>
        </div>
      </div>
    );
  }

  // --- 3. CHARACTER SELECT ---
  if (currentScreen === 'CHAR_SELECT') {
    const charsList = Object.values(CHARACTERS);
    return (
      <div className="absolute inset-0 bg-stone-950/90 flex flex-col p-6 z-50 overflow-y-auto">
        <div className="flex justify-between items-center max-w-4xl w-full mx-auto mb-6">
          <div>
            <h2 className="font-cinzel text-2xl font-bold text-stone-100 tracking-wider">PILIH TOKOH UJI NYALI</h2>
            <p className="text-xs text-stone-400">Karakter 3D Manusia Realistis dengan Model & Keahlian Khusus</p>
          </div>
          <button
            onClick={() => setCurrentScreen('TITLE')}
            className="text-stone-400 hover:text-stone-100 text-sm px-3 py-1 rounded border border-stone-800"
          >
            Kembali
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full mx-auto">
          {charsList.map((char) => {
            const isUnlocked = progress.unlockedCharacters.includes(char.id);
            const isSelected = selectedChar === char.id;
            return (
              <div
                key={char.id}
                onClick={() => {
                  if (isUnlocked) setSelectedChar(char.id);
                }}
                className={`p-5 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-stone-900 border-red-500 shadow-lg shadow-red-950/40 ring-1 ring-red-500'
                    : isUnlocked
                    ? 'bg-stone-950/80 border-stone-800 hover:border-stone-700'
                    : 'bg-stone-950/40 border-stone-900 opacity-50 cursor-not-allowed'
                }`}
              >
                {!isUnlocked && (
                  <div className="absolute top-3 right-3 text-xs bg-stone-900 text-amber-500 border border-amber-900/50 px-2 py-0.5 rounded font-mono">
                    Terkunci (Selesaikan Level {char.requiredLevelToUnlock})
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-md"
                    style={{ backgroundColor: char.color }}
                  >
                    {char.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-100 text-lg">{char.name}</h3>
                    <p className="text-xs text-stone-400">{char.role}</p>
                  </div>
                </div>

                <p className="text-xs text-stone-300 mt-3 leading-relaxed">{char.description}</p>
                <div className="text-[11px] text-amber-300/90 font-mono mt-1">👔 Busana 3D: {char.outfitDesc}</div>

                <div className="mt-3 pt-3 border-t border-stone-800/80 space-y-1 text-xs">
                  <div className="text-emerald-400 font-medium">⚡ {char.perkDesc}</div>
                  <div className="text-amber-400 font-medium">
                    🎯 Skill [X] {char.skillName}: <span className="text-stone-300 font-normal">{char.skillDesc} (CD {char.skillCooldown}d)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Difficulty Selection */}
        <div className="max-w-4xl w-full mx-auto mt-6 bg-stone-900/60 p-4 rounded-xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-stone-400 block font-semibold">Tingkat Kesulitan:</span>
            <div className="flex gap-2 mt-1">
              {(['MUDAH', 'NORMAL', 'MIMPI_BURUK'] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    difficulty === diff
                      ? 'bg-red-800 border-red-500 text-white'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {diff === 'MUDAH' ? 'Mudah (5 Doa)' : diff === 'NORMAL' ? 'Normal (3 Doa)' : 'Mimpi Buruk (1 Doa)'}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setCurrentScreen('LEVEL_SELECT')}
            className="w-full sm:w-auto px-8 py-3 bg-red-800 hover:bg-red-700 text-white font-bold tracking-wider rounded-lg border border-red-600 transition-all cursor-pointer"
          >
            Lanjut Pilih Rumah →
          </button>
        </div>
      </div>
    );
  }

  // --- 4. LEVEL SELECT ---
  if (currentScreen === 'LEVEL_SELECT') {
    return (
      <div className="absolute inset-0 bg-stone-950/90 flex flex-col p-6 z-50 overflow-y-auto">
        <div className="flex justify-between items-center max-w-4xl w-full mx-auto mb-6">
          <div>
            <h2 className="font-cinzel text-2xl font-bold text-stone-100 tracking-wider">PILIH RUMAH ANGKER</h2>
            <p className="text-xs text-stone-400">Tujuh Rumah Milik Keluarga Wirawan</p>
          </div>
          <button
            onClick={() => setCurrentScreen('TITLE')}
            className="text-stone-400 hover:text-stone-100 text-sm px-3 py-1 rounded border border-stone-800"
          >
            Kembali
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full mx-auto">
          {LEVELS.map((lvl) => {
            const stars = progress.levelStars[lvl.id] || 0;
            const isPlayable = lvl.id <= 3;
            return (
              <div
                key={lvl.id}
                onClick={() => {
                  if (isPlayable) setSelectedLevel(lvl);
                }}
                className={`p-5 rounded-xl border transition-all ${
                  isPlayable
                    ? selectedLevel.id === lvl.id
                      ? 'bg-stone-900 border-red-500 shadow-md ring-1 ring-red-500 cursor-pointer'
                      : 'bg-stone-950/80 border-stone-800 hover:border-stone-700 cursor-pointer'
                    : 'bg-stone-950/40 border-stone-900 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono text-red-500 font-semibold">{lvl.difficultyRating}</span>
                    <h3 className="font-bold text-stone-100 text-lg mt-0.5">{lvl.title}</h3>
                    <p className="text-xs text-stone-400">{lvl.subtitle}</p>
                  </div>
                  {isPlayable ? (
                    <div className="flex text-amber-400 text-sm">
                      {'⭐'.repeat(stars)}
                      {'☆'.repeat(3 - stars)}
                    </div>
                  ) : (
                    <span className="text-xs bg-stone-900 text-stone-400 px-2 py-0.5 rounded border border-stone-800">
                      🔒 Segera Hadir
                    </span>
                  )}
                </div>

                <div className="mt-3 text-xs text-stone-300">
                  <span className="text-stone-400">Entitas:</span> <span className="font-medium text-red-400">{lvl.ghostName}</span>
                </div>
                <div className="text-xs text-stone-400 mt-1">
                  Lokasi: {lvl.location}
                </div>

                {isPlayable && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLevel(lvl);
                      onStartGame();
                    }}
                    className="w-full mt-4 py-2.5 bg-red-800 hover:bg-red-700 text-white font-bold text-xs tracking-wider rounded-lg border border-red-600 transition-all cursor-pointer"
                  >
                    MASUK RUMAH INI 🚪
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- 5. HOW TO PLAY ---
  if (currentScreen === 'HOW_TO_PLAY') {
    return (
      <div className="absolute inset-0 bg-stone-950 flex flex-col p-6 z-50 overflow-y-auto">
        <div className="flex justify-between items-center max-w-3xl w-full mx-auto mb-6">
          <h2 className="font-cinzel text-2xl font-bold text-stone-100 tracking-wider">CARA BERMAIN & KONTROL HP</h2>
          <button
            onClick={() => setCurrentScreen('TITLE')}
            className="text-stone-400 hover:text-stone-100 text-sm px-3 py-1 rounded border border-stone-800"
          >
            Kembali
          </button>
        </div>

        <div className="max-w-3xl w-full mx-auto space-y-4 text-xs sm:text-sm text-stone-300">
          <div className="bg-stone-900/80 p-4 rounded-xl border border-stone-800">
            <h3 className="font-bold text-amber-400 text-base mb-2">📱 Kontrol Layar Sentuh HP & Tablet</h3>
            <p className="text-stone-300 leading-relaxed mb-3">
              Game ini didesain penuh untuk kenyamanan bermain di layar sentuh HP (Portrait maupun Landscape):
            </p>
            <ul className="space-y-1.5 font-mono text-stone-300 text-xs">
              <li>• <span className="text-white font-semibold">Joystick Kiri:</span> Geser untuk bergerak maju, mundur, dan melangkah ke samping.</li>
              <li>• <span className="text-white font-semibold">Usap Kanan:</span> Geser layar kanan untuk memutar sudut pandang kamera dan menyorot senter.</li>
              <li>• <span className="text-white font-semibold">Tombol AKSI [E]:</span> Tombol besar di kanan untuk membuka pintu, mengambil item, dan berinteraksi dengan arwah.</li>
              <li>• <span className="text-white font-semibold">Tombol SENTER [F]:</span> Menghidupkan/mematikan senter.</li>
              <li>• <span className="text-white font-semibold">Tombol LARI / JONGKOK:</span> Berlari cepat atau mengendap-endap senyap.</li>
            </ul>
          </div>

          <div className="bg-stone-900/80 p-4 rounded-xl border border-stone-800">
            <h3 className="font-bold text-amber-400 text-base mb-2">💻 Kontrol Keyboard & Mouse (PC)</h3>
            <ul className="space-y-1 font-mono text-stone-300 text-xs">
              <li>• <span className="text-white font-semibold">WASD:</span> Bergerak | <span className="text-white font-semibold">Mouse:</span> Melihat & Membidik</li>
              <li>• <span className="text-white font-semibold">E:</span> Aksi / Bicara Alur Cerita / Persembunyian</li>
              <li>• <span className="text-white font-semibold">Shift:</span> Lari | <span className="text-white font-semibold">C:</span> Jongkok (Senyap)</li>
              <li>• <span className="text-white font-semibold">F:</span> Senter | <span className="text-white font-semibold">R:</span> Ganti Baterai</li>
              <li>• <span className="text-white font-semibold">Q / G / T / H:</span> Jimat / Garam / Botol / Air Doa</li>
              <li>• <span className="text-white font-semibold">X:</span> Skill Khusus | <span className="text-white font-semibold">V:</span> Ganti Kamera 1st/3rd/Top</li>
            </ul>
          </div>

          <div className="bg-stone-900/80 p-4 rounded-xl border border-stone-800">
            <h3 className="font-bold text-amber-400 text-base mb-2">🏮 Sistem Furnitur & Alur Cerita Interaktif</h3>
            <p className="text-stone-300 leading-relaxed text-xs">
              Kunjungi menu <strong>Kustomisasi Furnitur</strong> sebelum bermain. Memasang ranjang, meja sesajen, lampu petromak, dan keris pusaka akan memberikan pengurangan drain Keberanian hingga 20%, stamina pulih 25% lebih cepat, dan langkah kaki 40% lebih senyap! Saat bertemu arwah di rumah, buat keputusan cerdas pada dialog interaktif.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- 6. LORE ARCHIVE ---
  if (currentScreen === 'LORE_ARCHIVE') {
    const allNotes: LoreNote[] = LEVELS.flatMap((l) => l.loreNotes);
    return (
      <div className="absolute inset-0 bg-stone-950 flex flex-col p-6 z-50 overflow-y-auto">
        <div className="flex justify-between items-center max-w-4xl w-full mx-auto mb-6">
          <div>
            <h2 className="font-cinzel text-2xl font-bold text-stone-100 tracking-wider">ARSIP CATATAN WIRAWAN</h2>
            <p className="text-xs text-stone-400">Total Terkumpul: {progress.collectedNotes.length} / 21 Catatan</p>
          </div>
          <button
            onClick={() => setCurrentScreen('TITLE')}
            className="text-stone-400 hover:text-stone-100 text-sm px-3 py-1 rounded border border-stone-800"
          >
            Kembali
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-4xl w-full mx-auto">
          {allNotes.map((note) => {
            const isDiscovered = progress.collectedNotes.includes(note.id);
            return (
              <div
                key={note.id}
                onClick={() => {
                  if (isDiscovered) setActiveNote(note);
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isDiscovered
                    ? 'bg-amber-950/20 border-amber-900/60 hover:border-amber-600 cursor-pointer'
                    : 'bg-stone-950/40 border-stone-900 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="text-xs font-mono text-amber-500">{note.date}</div>
                <h4 className="font-bold text-stone-200 text-sm mt-1">
                  {isDiscovered ? note.title : '??? (Belum Ditemukan)'}
                </h4>
                <p className="text-xs text-stone-400 mt-2 line-clamp-3">
                  {isDiscovered ? note.content : 'Jelajahi rumah untuk menemukan potongan kebenaran...'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- 7. SETTINGS ---
  if (currentScreen === 'SETTINGS') {
    return (
      <div className="absolute inset-0 bg-stone-950 flex flex-col p-6 z-50 overflow-y-auto">
        <div className="flex justify-between items-center max-w-xl w-full mx-auto mb-6">
          <h2 className="font-cinzel text-2xl font-bold text-stone-100 tracking-wider">PENGATURAN</h2>
          <button
            onClick={() => setCurrentScreen('TITLE')}
            className="text-stone-400 hover:text-stone-100 text-sm px-3 py-1 rounded border border-stone-800"
          >
            Kembali
          </button>
        </div>

        <div className="max-w-xl w-full mx-auto space-y-4 text-sm bg-stone-900/80 p-6 rounded-xl border border-stone-800">
          <div>
            <label className="text-stone-300 block mb-1">Volume Suara Utama: {Math.round(settings.masterVolume * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              onChange={(e) => setSettings({ ...settings, masterVolume: parseFloat(e.target.value) })}
              className="w-full accent-red-600"
            />
          </div>
          <div>
            <label className="text-stone-300 block mb-1">Volume Musik & Ambience: {Math.round(settings.musicVolume * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => setSettings({ ...settings, musicVolume: parseFloat(e.target.value) })}
              className="w-full accent-red-600"
            />
          </div>
          <div>
            <label className="text-stone-300 block mb-1">Volume Efek Suara (SFX): {Math.round(settings.sfxVolume * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => setSettings({ ...settings, sfxVolume: parseFloat(e.target.value) })}
              className="w-full accent-red-600"
            />
          </div>
          <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-stone-200 block">Mode Aman (Anti-Jumpscare)</span>
              <span className="text-xs text-stone-400">Menonaktifkan kilatan mendadak saat tertangkap</span>
            </div>
            <input
              type="checkbox"
              checked={settings.safeMode}
              onChange={(e) => setSettings({ ...settings, safeMode: e.target.checked })}
              className="w-5 h-5 accent-red-600"
            />
          </div>
          <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-stone-200 block">Mode Kidal (Mobile Touch)</span>
              <span className="text-xs text-stone-400">Tukar posisi joystick virtual ke sisi kanan</span>
            </div>
            <input
              type="checkbox"
              checked={settings.leftHandedMobile}
              onChange={(e) => setSettings({ ...settings, leftHandedMobile: e.target.checked })}
              className="w-5 h-5 accent-red-600"
            />
          </div>
        </div>
      </div>
    );
  }

  // --- 8. GAME OVER ---
  if (currentScreen === 'GAME_OVER') {
    return (
      <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 z-50 text-center">
        <h2 className="font-cinzel text-5xl font-extrabold text-red-600 tracking-widest drop-shadow-[0_0_25px_rgba(255,0,0,0.8)]">
          ARWAHMU TERTINGGAL
        </h2>
        <p className="text-stone-400 text-sm max-w-md mt-4">
          Doa pelindung telah habis. Arwahmu kini terikat selamanya bersama korban pesugihan keluarga Wirawan...
        </p>
        <div className="flex gap-4 mt-8">
          <button
            onClick={onRestartLevel}
            className="px-6 py-3 bg-red-800 hover:bg-red-700 text-white font-bold rounded-lg flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Ulangi Rumah Ini
          </button>
          <button
            onClick={() => setCurrentScreen('TITLE')}
            className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-stone-300 font-semibold rounded-lg border border-stone-700 cursor-pointer"
          >
            Menu Utama
          </button>
        </div>
      </div>
    );
  }

  // --- 9. LEVEL COMPLETE ---
  if (currentScreen === 'LEVEL_COMPLETE') {
    return (
      <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 z-50 text-center">
        <h2 className="font-cinzel text-4xl sm:text-5xl font-bold text-amber-400 tracking-wider">
          SELAMAT DARI MALAM KLIWON!
        </h2>
        <p className="text-stone-300 text-sm mt-2">{selectedLevel.title}</p>
        <div className="bg-stone-900/80 border border-stone-800 p-6 rounded-xl max-w-sm w-full mt-6 space-y-3">
          <div className="text-3xl text-amber-400">⭐⭐⭐</div>
          <div className="flex justify-between text-sm text-stone-300 border-b border-stone-800 pb-2">
            <span>Skor Akhir:</span>
            <span className="font-mono font-bold text-white">{score}</span>
          </div>
          <div className="flex justify-between text-sm text-stone-300">
            <span>Pengali Kamera:</span>
            <span className="font-mono text-emerald-400">
              {cameraMode === 'FIRST_PERSON' ? 'x1.5 (Orang Pertama)' : cameraMode === 'THIRD_PERSON' ? 'x1.2 (Orang Ketiga)' : 'x1.0 (Top-Down)'}
            </span>
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => setCurrentScreen('LEVEL_SELECT')}
            className="px-6 py-3 bg-red-800 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer"
          >
            Pilih Rumah Berikutnya →
          </button>
          <button
            onClick={() => setCurrentScreen('TITLE')}
            className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-stone-300 font-semibold rounded-lg border border-stone-700 cursor-pointer"
          >
            Menu Utama
          </button>
        </div>
      </div>
    );
  }

  // --- 10. IN-GAME ACTIVE HUD (PLAYING) ---
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-40 overflow-hidden font-sans">
      {/* Dynamic Screen Vignette: Struggle / Chase / Danger / Cold Mist / Low Sanity */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          struggleState.isStruggling
            ? 'pulse-vignette opacity-100 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(220,0,0,0.85)_100%)]'
            : isGhostChasing || ghostProximity.threatLevel === 'DANGER'
            ? 'pulse-vignette opacity-100 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(190,0,0,0.7)_100%)]'
            : ghostProximity.threatLevel === 'TENSE'
            ? 'opacity-70 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(14,116,144,0.45)_100%)]'
            : sanity < 35
            ? 'opacity-80 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(120,0,0,0.5)_100%)]'
            : 'opacity-0'
        }`}
      />

      {/* Early Warning Ghost Presence & Radar Banner */}
      {ghostProximity.warningText && !struggleState.isStruggling && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-stone-950/92 border border-red-600/90 text-red-200 text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-[0_0_25px_rgba(239,68,68,0.5)] tracking-wide animate-pulse pointer-events-none z-30 font-semibold">
          <span>{ghostProximity.warningText}</span>
          <span className="text-amber-400 font-mono text-[11px] font-bold">[{ghostProximity.distance.toFixed(1)}m]</span>
        </div>
      )}

      {/* Paranormal Notice Toast */}
      {paranormalNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-stone-950/90 border border-red-800/80 text-red-300 text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-lg tracking-wider animate-bounce pointer-events-auto">
          {paranormalNotice}
        </div>
      )}

      {/* STRUGGLE DEFENSE QTE MODAL (ANTI TIBA-TIBA MATI) */}
      {struggleState.isStruggling && (
        <div className="absolute inset-0 bg-red-950/45 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center p-4 pointer-events-auto select-none">
          <div className="bg-stone-950/95 border-2 border-red-500 p-6 sm:p-8 rounded-2xl max-w-md w-full text-center shadow-[0_0_60px_rgba(220,38,38,0.8)] space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="inline-block px-3 py-1 bg-red-900/80 text-red-200 text-xs font-mono font-bold rounded-full border border-red-500 animate-pulse">
              ⚠️ ARWAH MENYERANG! CENGKERAMAN GAIB
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-cinzel text-red-100 tracking-wider">
              LEPASKAN DIRI!
            </h3>
            <p className="text-xs text-stone-300">
              Tekan tombol atau spasi berulang kali secepat mungkin sebelum energimu terkuras!
            </p>

            {/* Struggle Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-amber-400">DORONGAN: {Math.round(struggleState.progress)}%</span>
                <span className="text-red-400">WAKTU: {struggleState.timeRemaining.toFixed(1)}s</span>
              </div>
              <div className="w-full bg-stone-900 h-4 rounded-full overflow-hidden border border-stone-700 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-400 rounded-full transition-all duration-75 shadow-lg"
                  style={{ width: `${Math.max(0, Math.min(100, struggleState.progress))}%` }}
                />
              </div>
            </div>

            {/* Big Interactive Tap Button (Desktop & Mobile) */}
            <button
              onClick={onStruggleTap}
              onTouchStart={(e) => {
                e.preventDefault();
                onStruggleTap();
              }}
              className="w-full py-4 sm:py-5 bg-gradient-to-b from-red-700 to-red-950 hover:from-red-600 hover:to-red-900 active:scale-95 border-2 border-red-400 rounded-xl text-white font-black text-lg sm:text-xl shadow-[0_0_30px_rgba(239,68,68,0.8)] cursor-pointer transition-transform"
            >
              TAP CEPAT / TEKAN SPASI 🤛
            </button>

            <div className="flex justify-center gap-2 pt-1">
              {inventory.some((i) => i.type === 'JIMAT') && (
                <button
                  onClick={() => onUseItem('JIMAT')}
                  className="px-3 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-600 text-amber-200 text-xs font-bold rounded-lg cursor-pointer"
                >
                  📜 Gunakan Jimat [Q]
                </button>
              )}
              {inventory.some((i) => i.type === 'GARAM') && (
                <button
                  onClick={() => onUseItem('GARAM')}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-500 text-stone-100 text-xs font-bold rounded-lg cursor-pointer"
                >
                  🧂 Tabur Garam [G]
                </button>
              )}
            </div>

            <p className="text-[10px] text-amber-400/90 font-mono">
              💡 Tip: Sorotkan senter ke wajah hantu untuk menambah dorongan!
            </p>
          </div>
        </div>
      )}

      {/* Top Bar: Sanity, Stamina, Battery, Lives */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
        {/* Left Status Cluster */}
        <div className="bg-stone-950/85 border border-stone-800/80 p-2.5 rounded-xl space-y-2 pointer-events-auto max-w-xs w-full sm:w-60 shadow-lg">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-stone-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" /> Keberanian
              </span>
              <span className={`tabular-nums ${sanity < 30 ? 'text-red-400 font-bold' : 'text-stone-200'}`}>
                {Math.round(sanity)}%
              </span>
            </div>
            <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden border border-stone-800">
              <div
                className={`h-full transition-all duration-200 ${
                  sanity > 60 ? 'bg-emerald-500' : sanity > 30 ? 'bg-amber-500' : 'bg-red-600'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, sanity))}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-stone-300">⚡ Stamina</span>
              <span className="text-stone-300 tabular-nums">{Math.round(stamina)}%</span>
            </div>
            <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden border border-stone-800">
              <div
                className="h-full bg-blue-500 transition-all duration-150"
                style={{ width: `${Math.max(0, Math.min(100, stamina))}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-stone-300 pt-0.5">
            <span className="flex items-center gap-1">🔦 Senter:</span>
            <span className="font-mono tabular-nums text-amber-300">{Math.round(battery)}%</span>
          </div>
        </div>

        {/* Right Status Cluster */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onCycleCamera}
            className="bg-stone-950/85 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline font-mono">
              {cameraMode === 'FIRST_PERSON' ? '1ST (x1.5)' : cameraMode === 'THIRD_PERSON' ? '3RD (x1.2)' : 'TOP (x1.0)'}
            </span>
          </button>
          <button
            onClick={() => setShowMinimap(!showMinimap)}
            className="bg-stone-950/85 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs p-2 rounded-xl cursor-pointer shadow-lg"
            title="Lihat Peta (M)"
          >
            <MapIcon className="w-4 h-4 text-stone-300" />
          </button>
          <div className="bg-stone-950/85 border border-stone-800 text-stone-200 text-xs px-3 py-2 rounded-xl flex items-center gap-1 shadow-lg font-mono">
            <span className="text-red-500">🙏</span> Doa: {lives}
          </div>
        </div>
      </div>

      {/* Center Interaction Prompt */}
      {interactionPrompt && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-950/90 border border-amber-500/80 text-amber-300 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-2xl pointer-events-auto animate-pulse flex items-center gap-2">
          <span>{interactionPrompt}</span>
        </div>
      )}

      {/* Crosshair (First person) */}
      {cameraMode === 'FIRST_PERSON' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/70 rounded-full pointer-events-none" />
      )}

      {/* VIRTUAL JOYSTICK VISUAL GUIDE (MOBILE) */}
      <div className="absolute left-4 bottom-22 pointer-events-none sm:hidden z-30 flex flex-col items-center opacity-75">
        <div className="w-22 h-22 rounded-full border border-dashed border-stone-500/40 bg-stone-950/30 flex items-center justify-center relative">
          <div className="w-9 h-9 rounded-full bg-stone-800/80 border border-stone-600/80 shadow-md flex items-center justify-center text-xs text-stone-300">
            🕹️
          </div>
          <span className="absolute -bottom-3.5 text-[8px] font-mono text-stone-400 font-semibold tracking-wider">
            SENTUH & GESER
          </span>
        </div>
      </div>

      {/* MOBILE ON-SCREEN TOUCH ACTION CONTROLS */}
      <div className="absolute right-3 bottom-20 flex flex-col items-end gap-2 pointer-events-auto sm:hidden z-40">
        <div className="flex gap-2 items-center">
          <button
            onClick={onToggleFlashlight}
            className="w-11 h-11 rounded-full bg-stone-900/95 border border-amber-500/70 active:bg-amber-600 flex items-center justify-center text-amber-300 text-lg shadow-lg active:scale-95 transition-transform"
            title="Senter"
          >
            🔦
          </button>
          <button
            onClick={onPerformAction}
            className="w-13 h-13 rounded-full bg-red-800/95 border-2 border-red-500 active:bg-red-600 flex flex-col items-center justify-center text-white font-bold text-[11px] shadow-xl active:scale-95 transition-transform"
            title="Aksi [E]"
          >
            <span>AKSI</span>
            <span className="text-[8px] text-amber-300 font-mono">[E]</span>
          </button>
        </div>
        <div className="flex gap-1.5 items-center">
          <button
            onClick={onToggleCrouch}
            className="w-10 h-10 rounded-full bg-stone-900/95 border border-stone-700 active:bg-stone-700 flex items-center justify-center text-stone-200 text-xs shadow-md active:scale-95 transition-transform"
            title="Jongkok [C]"
          >
            🧎 C
          </button>
          <button
            onTouchStart={() => onToggleSprint(true)}
            onTouchEnd={() => onToggleSprint(false)}
            onMouseDown={() => onToggleSprint(true)}
            onMouseUp={() => onToggleSprint(false)}
            className="w-10 h-10 rounded-full bg-blue-950/95 border border-blue-600 active:bg-blue-600 flex items-center justify-center text-blue-200 text-[10px] font-bold shadow-md active:scale-95 transition-transform"
            title="Lari [Shift]"
          >
            ⚡ LARI
          </button>
          <button
            onClick={onTriggerSkill}
            className="w-10 h-10 rounded-full bg-amber-950/95 border border-amber-600 active:bg-amber-600 flex items-center justify-center text-amber-200 text-[10px] font-bold shadow-md active:scale-95 transition-transform"
            title="Skill [X]"
          >
            🎯 X
          </button>
        </div>
      </div>

      {/* Bottom Bar: Quick Inventory & Objectives */}
      <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 flex items-end justify-between gap-2 pointer-events-none z-30">
        {/* Objectives Box */}
        <div className="bg-stone-950/90 border border-stone-800 p-2 sm:p-2.5 rounded-xl text-xs max-w-[170px] sm:max-w-xs shadow-lg pointer-events-auto">
          <div
            onClick={() => setObjectivesCollapsed(!objectivesCollapsed)}
            className="flex justify-between items-center cursor-pointer font-bold text-stone-200 mb-0.5"
          >
            <span className="text-[11px] sm:text-xs">📜 TUJUAN</span>
            {objectivesCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
          {!objectivesCollapsed && (
            <ul className="space-y-0.5 sm:space-y-1 text-stone-300 text-[10px] sm:text-xs">
              {objectives.map((obj) => (
                <li key={obj.id} className="flex items-center gap-1">
                  <span className={obj.completed ? 'text-emerald-400 font-bold' : 'text-stone-500'}>
                    {obj.completed ? '✓' : '○'}
                  </span>
                  <span className={`truncate ${obj.completed ? 'line-through text-stone-500' : ''}`}>
                    {obj.text} {obj.required > 1 && `(${obj.current}/${obj.required})`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick Item Slots */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-stone-950/90 border border-stone-800 p-1 sm:p-2 rounded-xl shadow-lg pointer-events-auto">
          {inventory.map((item) => (
            <button
              key={item.id}
              onClick={() => onUseItem(item.type)}
              className="w-8 h-8 sm:w-11 sm:h-11 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-lg flex flex-col items-center justify-center relative active:scale-95 transition-all cursor-pointer"
              title={`${item.name} (${item.count})`}
            >
              <span className="text-xs sm:text-base">{item.icon}</span>
              <span className="text-[8px] sm:text-[9px] font-mono absolute top-0 right-0.5 text-amber-300 font-bold">
                {item.count}
              </span>
              <span className="hidden sm:inline text-[8px] text-stone-400 absolute bottom-0 font-mono">
                {item.type === 'BATTERY' ? 'R' : item.type === 'JIMAT' ? 'Q' : item.type === 'GARAM' ? 'G' : item.type === 'BOTTLE' ? 'T' : item.type === 'AIR_DOA' ? 'H' : ''}
              </span>
            </button>
          ))}
          <button
            onClick={onTriggerSkill}
            className="w-8 h-8 sm:w-11 sm:h-11 bg-red-950/80 hover:bg-red-900 border border-red-700/80 rounded-lg flex flex-col items-center justify-center text-amber-300 font-bold active:scale-95 transition-all cursor-pointer"
            title="Skill Karakter [X]"
          >
            <span className="text-xs">🎯</span>
            <span className="hidden sm:inline text-[8px] font-mono">[X]</span>
          </button>
        </div>
      </div>

      {/* Mini-Game: Breath Holding when Hiding */}
      {isHiding && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 bg-stone-950/90 border border-stone-800 p-4 rounded-xl text-center max-w-xs w-full pointer-events-auto shadow-2xl">
          <div className="text-xs font-bold text-amber-400 mb-1">BERSEMBUNYI DI LEMARI</div>
          <p className="text-[11px] text-stone-400 mb-2">
            Jika hantu mendekat, tahan tombol untuk menahan napas agar tidak terdengar.
          </p>
          <button
            onMouseDown={() => {
              setIsBreathHeld(true);
              onHoldBreath(true);
            }}
            onMouseUp={() => {
              setIsBreathHeld(false);
              onHoldBreath(false);
            }}
            onTouchStart={() => {
              setIsBreathHeld(true);
              onHoldBreath(true);
            }}
            onTouchEnd={() => {
              setIsBreathHeld(false);
              onHoldBreath(false);
            }}
            className={`w-full py-2.5 font-bold text-xs rounded-lg transition-all cursor-pointer ${
              isBreathHeld ? 'bg-blue-600 text-white' : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
            }`}
          >
            {isBreathHeld ? '💨 MENAHAN NAPAS...' : 'TAHAN NAPAS (Tahan Klik/Sentuh)'}
          </button>
        </div>
      )}

      {/* INTERACTIVE STORY ENCOUNTER DIALOGUE MODAL */}
      {activeStoryEncounter && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4 z-50 pointer-events-auto">
          <div className="bg-[#1c1511] text-[#e8ded3] p-6 sm:p-8 rounded-2xl max-w-lg w-full shadow-2xl border-2 border-amber-600 font-sans relative">
            <div className="flex items-center gap-3 border-b border-amber-900/60 pb-3 mb-4">
              <span className="text-4xl">{activeStoryEncounter.speakerAvatar}</span>
              <div>
                <h3 className="font-cinzel text-lg font-bold text-amber-300">{activeStoryEncounter.speakerName}</h3>
                <p className="text-xs text-amber-500 font-mono">{activeStoryEncounter.speakerRole}</p>
              </div>
            </div>

            <div className="text-xs text-stone-400 italic mb-3 bg-stone-950/60 p-2.5 rounded-lg border border-stone-800">
              {activeStoryEncounter.contextText}
            </div>

            <p className="text-sm font-medium text-stone-100 mb-5 leading-relaxed bg-amber-950/30 p-3.5 rounded-xl border border-amber-900/50">
              "{activeStoryEncounter.dialogueMessage}"
            </p>

            {storyFeedback ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-700 text-amber-200 text-xs leading-relaxed">
                  <div className="font-bold text-amber-300 mb-1">Tanggapan Arwah:</div>
                  <p>{storyFeedback.message}</p>
                  <div className="text-emerald-400 font-mono mt-2 font-semibold">Dampak: {storyFeedback.consequence}</div>
                </div>
                <button
                  onClick={() => {
                    setStoryFeedback(null);
                    onCloseStoryEncounter();
                  }}
                  className="w-full py-2.5 bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Lanjutkan Uji Nyali [Tutup]
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-stone-400 mb-1">PILIH TANGGAPANMU:</div>
                {activeStoryEncounter.choices.map((choice, idx) => (
                  <button
                    key={choice.id}
                    onClick={() => {
                      const res = onChooseStoryChoice(activeStoryEncounter.id, choice.id);
                      setStoryFeedback({ message: res.message, consequence: res.consequenceDesc });
                    }}
                    className="w-full text-left p-3 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700 hover:border-amber-500 text-stone-200 text-xs sm:text-sm transition-all active:scale-[0.99] cursor-pointer flex flex-col gap-1"
                  >
                    <div className="font-semibold text-stone-100 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-900 text-amber-200 font-bold flex items-center justify-center text-xs">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{choice.text}</span>
                    </div>
                    <span className="text-[10px] text-amber-400/90 font-mono ml-7">⚡ {choice.consequenceDesc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Minimap Popup Modal */}
      {showMinimap && (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center p-4 z-50 pointer-events-auto">
          <div className="bg-stone-900 border border-stone-800 p-5 rounded-xl max-w-sm w-full text-center">
            <h3 className="font-cinzel text-lg font-bold text-stone-100 mb-2">DENAH RUMAH (KUNJUNGAN)</h3>
            <p className="text-xs text-stone-400 mb-4">Area terang adalah ruangan yang sudah dijelajahi.</p>
            <div className="inline-grid grid-cols-8 gap-1 p-2 bg-black rounded-lg border border-stone-800">
              {Array.from({ length: 64 }).map((_, idx) => {
                const rx = idx % 8;
                const rz = Math.floor(idx / 8);
                const visited = visitedTiles.has(`${rx},${rz}`);
                return (
                  <div
                    key={idx}
                    className={`w-5 h-5 rounded-sm ${
                      visited ? 'bg-amber-700/60 border border-amber-600/40' : 'bg-stone-900'
                    }`}
                  />
                );
              })}
            </div>
            <button
              onClick={() => setShowMinimap(false)}
              className="mt-4 px-6 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-lg cursor-pointer"
            >
              Tutup Peta
            </button>
          </div>
        </div>
      )}

      {/* Note Reader Modal */}
      {activeNote && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4 z-50 pointer-events-auto">
          <div className="bg-[#f4ebd0] text-[#2b1f14] p-6 sm:p-8 rounded-xl max-w-lg w-full shadow-2xl border-4 border-[#8c6747] font-typewriter relative">
            <div className="text-xs font-bold text-[#8c6747] mb-1">{activeNote.date}</div>
            <h3 className="text-xl font-bold font-cinzel mb-4 text-[#4a2e18]">{activeNote.title}</h3>
            <p className="text-sm leading-relaxed mb-6 font-medium whitespace-pre-line">{activeNote.content}</p>
            <button
              onClick={() => setActiveNote(null)}
              className="w-full py-2.5 bg-[#4a2e18] hover:bg-[#362111] text-[#f4ebd0] font-bold text-xs tracking-wider rounded-lg cursor-pointer font-sans"
            >
              SIMPAN CATATAN KE ARSIP [ESC]
            </button>
          </div>
        </div>
      )}

      {/* Piano Puzzle Modal (Level 2) */}
      {isPianoOpen && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4 z-50 pointer-events-auto">
          <div className="bg-stone-900 border border-stone-800 p-6 rounded-xl max-w-sm w-full text-center">
            <h3 className="font-cinzel text-lg font-bold text-amber-400 mb-1">PIANO MARMER NONI BELANDA</h3>
            <p className="text-xs text-stone-400 mb-4">
              Mainkan urutan 4 nada sesuai lembar partitur: <strong className="text-amber-300">C4 - E4 - G4 - B4</strong>
            </p>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {['C4', 'E4', 'G4', 'B4'].map((note) => (
                <button
                  key={note}
                  onClick={() => onPianoKey(note)}
                  className="py-6 bg-stone-100 hover:bg-stone-200 active:bg-amber-200 text-stone-900 font-bold text-base rounded-lg shadow-md border-b-4 border-stone-400 cursor-pointer transition-all"
                >
                  {note}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsPianoOpen(false)}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded-lg cursor-pointer"
            >
              Tutup Piano
            </button>
          </div>
        </div>
      )}

      {/* Story Riddle Modal (Interactive Lore Puzzle) */}
      {activeRiddle && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4 z-50 pointer-events-auto">
          <div className="bg-[#1c1511] text-[#e8ded3] p-6 sm:p-7 rounded-2xl max-w-lg w-full shadow-2xl border-2 border-amber-800/80 font-sans relative">
            <div className="flex items-center justify-between border-b border-amber-900/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">📜</span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-cinzel text-amber-300">
                    TEKA-TEKI ARWAH & PESUGIHAN
                  </h3>
                  <div className="text-[11px] text-amber-500/90 font-mono">{activeRiddle.title}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setRiddleFeedback(null);
                  onCloseRiddle();
                }}
                className="text-stone-400 hover:text-stone-200 text-xs px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 cursor-pointer"
              >
                Tutup
              </button>
            </div>
            <div className="bg-amber-950/40 border border-amber-800/40 p-3 rounded-lg mb-4 text-xs text-amber-200/90 italic leading-relaxed">
              Petunjuk Catatan: {activeRiddle.loreContext}
            </div>
            <p className="text-sm font-semibold text-stone-100 mb-4 leading-normal">
              {activeRiddle.question}
            </p>
            <div className="space-y-2 mb-4">
              {activeRiddle.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const res = onAnswerRiddle(idx);
                    setRiddleFeedback({ message: res.message, isCorrect: res.success });
                    if (res.success) {
                      setTimeout(() => {
                        setRiddleFeedback(null);
                        onCloseRiddle();
                      }, 2500);
                    }
                  }}
                  className="w-full text-left p-3 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 hover:border-amber-600 text-stone-200 text-xs sm:text-sm font-medium transition-all active:scale-[0.99] cursor-pointer flex items-center gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-amber-900/70 border border-amber-700/60 flex items-center justify-center font-bold text-amber-300 text-xs shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
            {riddleFeedback && (
              <div
                className={`p-3 rounded-lg text-xs leading-relaxed font-semibold mb-3 ${
                  riddleFeedback.isCorrect
                    ? 'bg-emerald-950 border border-emerald-600 text-emerald-200'
                    : 'bg-red-950 border border-red-700 text-red-200'
                }`}
              >
                {riddleFeedback.message}
              </div>
            )}
            <div className="text-[10px] text-stone-400 text-center font-mono">
              Buka arsip catatan atau jelajahi ruangan jika belum yakin dengan jawabannya.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
