import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { HorrorUI } from './components/HorrorUI';
import {
  CameraMode,
  CharacterId,
  Difficulty,
  FurnitureSetup,
  GameProgress,
  GameSettings,
  InventoryItem,
  LevelConfig,
  LoreNote,
  StoryEncounter,
  StoryRiddle,
} from './game/types';
import { calculateFurnitureBuffs } from './game/rules';
import { LEVELS } from './game/levels';
import {
  loadProgress,
  loadSettings,
  recordLevelCompletion,
  saveProgress,
  saveSettings,
} from './game/storage';
import { soundManager } from './game/audio';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // High-level App Screen State
  const [currentScreen, setCurrentScreen] = useState<
    'TITLE' | 'CHAR_SELECT' | 'LEVEL_SELECT' | 'SETTINGS' | 'HOW_TO_PLAY' | 'LORE_ARCHIVE' | 'FURNITURE' | 'PLAYING' | 'GAME_OVER' | 'LEVEL_COMPLETE'
  >('TITLE');

  // Configuration & Persistent State
  const [settings, setSettingsState] = useState<GameSettings>(loadSettings);
  const [progress, setProgressState] = useState<GameProgress>(loadProgress);
  const [selectedChar, setSelectedChar] = useState<CharacterId>('raka');
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig>(LEVELS[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');

  // Live in-game telemetry
  const [sanity, setSanity] = useState(100);
  const [stamina, setStamina] = useState(100);
  const [battery, setBattery] = useState(100);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [objectives, setObjectives] = useState<LevelConfig['objectives']>(LEVELS[0].objectives);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [cameraMode, setCameraMode] = useState<CameraMode>('FIRST_PERSON');
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);
  const [isGhostChasing, setIsGhostChasing] = useState(false);
  const [activeNote, setActiveNote] = useState<LoreNote | null>(null);
  const [activeRiddle, setActiveRiddle] = useState<StoryRiddle | null>(null);
  const [activeStoryEncounter, setActiveStoryEncounter] = useState<StoryEncounter | null>(null);
  const [isPianoOpen, setIsPianoOpen] = useState(false);
  const [paranormalNotice, setParanormalNotice] = useState<string | null>(null);
  const [isHiding, setIsHiding] = useState(false);
  const [visitedTiles, setVisitedTiles] = useState<Set<string>>(new Set());
  const [ghostProximity, setGhostProximity] = useState<{
    distance: number;
    threatLevel: 'CALM' | 'TENSE' | 'DANGER' | 'CHASE';
    warningText: string | null;
    angle: number;
  }>({
    distance: 99,
    threatLevel: 'CALM',
    warningText: null,
    angle: 0,
  });
  const [struggleState, setStruggleState] = useState<{
    isStruggling: boolean;
    progress: number;
    timeRemaining: number;
  }>({
    isStruggling: false,
    progress: 0,
    timeRemaining: 0,
  });

  // Mobile virtual joystick state
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const lookStartRef = useRef<{ x: number; y: number } | null>(null);

  // Active furniture buffs
  const activeBuffs = calculateFurnitureBuffs(progress.furnitureSetup);

  // Settings setter with local persistence
  const updateSettings = useCallback((newSettings: GameSettings) => {
    setSettingsState(newSettings);
    saveSettings(newSettings);
    soundManager.setVolumes(newSettings.masterVolume, newSettings.musicVolume, newSettings.sfxVolume);
  }, []);

  // Update furniture setup
  const handleUpdateFurnitureSetup = useCallback((newSetup: FurnitureSetup) => {
    setProgressState((prev) => {
      const next = { ...prev, furnitureSetup: newSetup };
      saveProgress(next);
      return next;
    });
    engineRef.current?.setFurnitureSetup(newSetup);
    soundManager.playItemPickup();
  }, []);

  // Initialize Sound on first interaction
  const ensureAudio = useCallback(() => {
    soundManager.init();
    soundManager.resume();
  }, []);

  // Start Game Level
  const handleStartGame = useCallback(() => {
    ensureAudio();
    setCurrentScreen('PLAYING');

    if (engineRef.current) {
      engineRef.current.startLevel(selectedLevel, selectedChar, difficulty, settings.safeMode, progress.furnitureSetup);
    }
  }, [ensureAudio, selectedLevel, selectedChar, difficulty, settings.safeMode, progress.furnitureSetup]);

  const handleRestartLevel = useCallback(() => {
    ensureAudio();
    setCurrentScreen('PLAYING');
    if (engineRef.current) {
      engineRef.current.startLevel(selectedLevel, selectedChar, difficulty, settings.safeMode, progress.furnitureSetup);
    }
  }, [ensureAudio, selectedLevel, selectedChar, difficulty, settings.safeMode, progress.furnitureSetup]);

  // Story Encounter Choice Callback
  const handleChooseStoryChoice = useCallback((encounterId: string, choiceId: string) => {
    if (!engineRef.current) return { message: '', consequenceDesc: '' };
    const res = engineRef.current.submitStoryChoice(encounterId, choiceId);
    setProgressState((prev) => {
      const next = {
        ...prev,
        storyChoicesMade: { ...prev.storyChoicesMade, [encounterId]: choiceId },
      };
      saveProgress(next);
      return next;
    });
    return res;
  }, []);

  // Mount 3D Engine once
  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new GameEngine(mountRef.current, {
      onSanityChange: (s) => setSanity(s),
      onStaminaChange: (st) => setStamina(st),
      onBatteryChange: (b) => setBattery(b),
      onInventoryChange: (inv) => setInventory(inv),
      onObjectiveUpdate: (objs) => setObjectives(objs),
      onLivesChange: (l) => setLives(l),
      onScoreChange: (sc) => setScore(sc),
      onCameraChange: (cm) => setCameraMode(cm),
      onInteractionPrompt: (p) => setInteractionPrompt(p),
      onGhostDetectedChange: (chasing) => setIsGhostChasing(chasing),
      onGhostProximityChange: (dist, lvl, warning, ang) => {
        setGhostProximity({ distance: dist, threatLevel: lvl, warningText: warning, angle: ang });
      },
      onStruggleStateChange: (struggling, prog, time) => {
        setStruggleState({ isStruggling: struggling, progress: prog, timeRemaining: time });
      },
      onNoteFound: (note) => {
        setActiveNote(note);
        setProgressState((prev) => {
          if (!prev.collectedNotes.includes(note.id)) {
            const next = { ...prev, collectedNotes: [...prev.collectedNotes, note.id] };
            saveProgress(next);
            return next;
          }
          return prev;
        });
      },
      onPianoPuzzleOpen: (open) => setIsPianoOpen(open),
      onOpenRiddle: (riddle) => setActiveRiddle(riddle),
      onOpenStoryEncounter: (encounter) => setActiveStoryEncounter(encounter),
      onGameOver: (reason) => {
        setParanormalNotice(reason);
        setCurrentScreen('GAME_OVER');
      },
      onLevelComplete: (finalScore, stars, foundNotes) => {
        setScore(finalScore);
        const updated = recordLevelCompletion(selectedLevel.id, finalScore, stars, foundNotes);
        setProgressState(updated);
        setCurrentScreen('LEVEL_COMPLETE');
      },
      onParanormalNotification: (text) => {
        setParanormalNotice(text);
        setTimeout(() => setParanormalNotice(null), 3000);
      },
      onHidingStateChange: (hiding) => setIsHiding(hiding),
    });

    engineRef.current = engine;

    // Initialize 3D world immediately so the scene & character are rendered on mount
    engine.startLevel(selectedLevel, selectedChar, difficulty, settings.safeMode, progress.furnitureSetup);
    engine.setScreen(currentScreen);

    // Periodic visited tiles sync
    const interval = setInterval(() => {
      if (engineRef.current) {
        setVisitedTiles(new Set(engineRef.current.getVisitedTiles()));
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      engine.dispose();
      engineRef.current = null;
    };
  }, [selectedLevel.id]);

  // Sync screen changes to engine
  useEffect(() => {
    engineRef.current?.setScreen(currentScreen);
  }, [currentScreen]);

  // Update 3D preview model when changing character or level or furniture in menu
  useEffect(() => {
    if (currentScreen !== 'PLAYING' && engineRef.current) {
      engineRef.current.startLevel(selectedLevel, selectedChar, difficulty, settings.safeMode, progress.furnitureSetup);
      engineRef.current.setScreen(currentScreen);
    }
  }, [selectedChar, selectedLevel, difficulty, settings.safeMode, currentScreen, progress.furnitureSetup]);

  // Touch Joystick Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    ensureAudio();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const isLeftSide = settings.leftHandedMobile
        ? touch.clientX >= window.innerWidth / 2
        : touch.clientX < window.innerWidth / 2;

      if (isLeftSide && !touchStartRef.current) {
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      } else if (!isLeftSide && !lookStartRef.current) {
        lookStartRef.current = { x: touch.clientX, y: touch.clientY };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      // Joystick Movement
      if (touchStartRef.current && Math.hypot(touch.clientX - touchStartRef.current.x, touch.clientY - touchStartRef.current.y) < 140) {
        const dx = (touch.clientX - touchStartRef.current.x) / 50;
        const dy = (touch.clientY - touchStartRef.current.y) / 50;
        engineRef.current?.setJoystickVector(Math.max(-1, Math.min(1, dx)), Math.max(-1, Math.min(1, dy)));
      }

      // Drag Look
      if (lookStartRef.current) {
        const dLookX = touch.clientX - lookStartRef.current.x;
        const dLookY = touch.clientY - lookStartRef.current.y;
        lookStartRef.current = { x: touch.clientX, y: touch.clientY };
        engineRef.current?.handleTouchLookDelta(dLookX, dLookY);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const isLeftSide = settings.leftHandedMobile
        ? touch.clientX >= window.innerWidth / 2
        : touch.clientX < window.innerWidth / 2;

      if (touchStartRef.current && isLeftSide) {
        touchStartRef.current = null;
        engineRef.current?.setJoystickVector(0, 0);
      }
      if (lookStartRef.current && !isLeftSide) {
        lookStartRef.current = null;
      }
    }
  };

  return (
    <div
      className="relative w-screen h-screen bg-black overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={ensureAudio}
    >
      {/* Three.js 3D Viewport Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Atmospheric Scanlines Overlay */}
      <div className="absolute inset-0 scanlines-overlay pointer-events-none z-10 opacity-70" />

      {/* UI Layer */}
      <HorrorUI
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        selectedChar={selectedChar}
        setSelectedChar={setSelectedChar}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        settings={settings}
        setSettings={updateSettings}
        progress={progress}
        onUpdateFurnitureSetup={handleUpdateFurnitureSetup}
        sanity={sanity}
        stamina={stamina}
        battery={battery}
        inventory={inventory}
        objectives={objectives}
        lives={lives}
        score={score}
        cameraMode={cameraMode}
        interactionPrompt={interactionPrompt}
        isGhostChasing={isGhostChasing}
        activeNote={activeNote}
        setActiveNote={setActiveNote}
        activeRiddle={activeRiddle}
        onAnswerRiddle={(choiceIdx) => {
          if (!activeRiddle || !engineRef.current) return { success: false, message: 'Tidak ada teka-teki aktif' };
          return engineRef.current.submitRiddleAnswer(activeRiddle.id, choiceIdx);
        }}
        onCloseRiddle={() => setActiveRiddle(null)}
        activeStoryEncounter={activeStoryEncounter}
        onChooseStoryChoice={handleChooseStoryChoice}
        onCloseStoryEncounter={() => setActiveStoryEncounter(null)}
        isPianoOpen={isPianoOpen}
        setIsPianoOpen={setIsPianoOpen}
        onPianoKey={(note) => engineRef.current?.playPianoKey(note)}
        paranormalNotice={paranormalNotice}
        isHiding={isHiding}
        onToggleFlashlight={() => engineRef.current?.toggleFlashlight()}
        onCycleCamera={() => engineRef.current?.cycleCamera()}
        onUseItem={(type) => engineRef.current?.useItemByType(type)}
        onTriggerSkill={() => engineRef.current?.triggerCharacterSkill()}
        onHoldBreath={(holding) => engineRef.current?.setHoldingBreath(holding)}
        onStartGame={handleStartGame}
        onRestartLevel={handleRestartLevel}
        onPerformAction={() => engineRef.current?.triggerInteract()}
        onToggleCrouch={() => engineRef.current?.toggleCrouch()}
        onToggleSprint={(sprint) => engineRef.current?.setSprinting(sprint)}
        visitedTiles={visitedTiles}
        activeBuffs={activeBuffs}
        ghostProximity={ghostProximity}
        struggleState={struggleState}
        onStruggleTap={() => engineRef.current?.triggerStruggleTap()}
      />
    </div>
  );
}
