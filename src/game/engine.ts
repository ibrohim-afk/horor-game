import * as THREE from 'three';
import {
  CameraMode,
  CharacterId,
  Difficulty,
  FurnitureSetup,
  GhostState,
  InventoryItem,
  LevelConfig,
  LoreNote,
  StoryEncounter,
  StoryRiddle,
} from './types';
import {
  calculateFurnitureBuffs,
  calculateProximityThreat,
  calculateStruggleTapGain,
  CHARACTERS,
  checkCircleBoxCollision,
  checkRiddleAnswer,
  DEFAULT_FURNITURE_SETUP,
  evaluateDoorAlignment,
  evaluateGhostDetection,
  getDifficultyLives,
  resolveStoryChoice,
  shouldAwakenGhost,
  updateSanity,
  updateStamina,
  verifyPianoPuzzle,
} from './rules';
import {
  createCandleCheckpoint,
  createCustomAltar,
  createCustomBed,
  createCustomCarpet,
  createCustomLamp,
  createCustomWallRelic,
  createDoor,
  createDustParticles,
  createFuseBox,
  createGrandfatherClock,
  createGrandPiano,
  createNoniBelandaModel,
  createPlayerModel,
  createPocongModel,
  createSokoGuruPillar,
  createSusterNgesotModel,
  createTableAndChairs,
  createWardrobe,
  getProceduralTexture,
} from './models';
import { soundManager } from './audio';
import { AIDirector } from './director';

export interface GameEngineCallbacks {
  onSanityChange: (sanity: number) => void;
  onStaminaChange: (stamina: number) => void;
  onBatteryChange: (battery: number) => void;
  onInventoryChange: (items: InventoryItem[]) => void;
  onObjectiveUpdate: (objectives: LevelConfig['objectives']) => void;
  onLivesChange: (lives: number) => void;
  onScoreChange: (score: number) => void;
  onCameraChange: (mode: CameraMode) => void;
  onInteractionPrompt: (prompt: string | null) => void;
  onGhostDetectedChange: (isChasing: boolean, threatDistance: number) => void;
  onGhostProximityChange: (distance: number, threatLevel: 'CALM' | 'TENSE' | 'DANGER' | 'CHASE', warningText: string | null, angle: number) => void;
  onStruggleStateChange: (isStruggling: boolean, progress: number, timeRemaining: number) => void;
  onNoteFound: (note: LoreNote) => void;
  onPianoPuzzleOpen: (isOpen: boolean) => void;
  onOpenRiddle: (riddle: StoryRiddle) => void;
  onOpenStoryEncounter: (encounter: StoryEncounter) => void;
  onGameOver: (reason: string) => void;
  onLevelComplete: (score: number, stars: number, foundNoteIds: string[]) => void;
  onParanormalNotification: (text: string) => void;
  onHidingStateChange: (isHiding: boolean) => void;
}

export class GameEngine {
  private container: HTMLDivElement;
  private callbacks: GameEngineCallbacks;

  // Three.js core
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();

  // Rendering guard
  private isSoftwareGl = false;
  private animationFrameId: number | null = null;
  private isDisposed = false;
  private isPaused = false;

  // Active Level & Player
  private levelConfig!: LevelConfig;
  private characterId: CharacterId = 'raka';
  private difficulty: Difficulty = 'NORMAL';
  private cameraMode: CameraMode = 'FIRST_PERSON';

  // Furniture Customization
  private furnitureSetup: FurnitureSetup = { ...DEFAULT_FURNITURE_SETUP };
  private furnitureBuffs = calculateFurnitureBuffs(DEFAULT_FURNITURE_SETUP);

  // Player state
  private playerX = 3;
  private playerZ = 3;
  private playerRotY = 0;
  private playerPitch = 0; // vertical camera tilt
  private sanity = 100;
  private stamina = 100;
  private battery = 100;
  private isFlashlightOn = true;
  private lives = 3;
  private score = 0;
  private elapsedLevelTime = 0;
  private isHiding = false;
  private isHoldingBreath = false;
  private isPossessed = false;
  private possessedTimer = 0;
  private skillCooldownTimer = 0;

  // Anti-Sudden-Death Struggle & Warning State
  private isStruggling = false;
  private struggleProgress = 0;
  private struggleTimer = 3.5;
  private invulnerabilityTimer = 0;
  private lastGhostLaughTime = 0;
  private lastSparksTime = 0;

  // 3D Player Realistic Human Mesh Rig
  private playerRig!: ReturnType<typeof createPlayerModel>;
  private flashlightSpot!: THREE.SpotLight;
  private flashlightTarget!: THREE.Object3D;

  // Ghost entity
  private ghostMesh: THREE.Group | null = null;
  private ghostX = 8;
  private ghostZ = 8;
  private ghostState: GhostState = 'DORMANT';
  private ghostTimer = 0;
  private ghostTargetX = 8;
  private ghostTargetZ = 8;
  private ghostStunTimer = 0;
  private ghostHopAnim = 0;
  private lastGhostFootstepTime = 0;

  // Level World Map
  private grid: string[] = [];
  private walls: THREE.Box3[] = [];
  private interactiveDoors: Array<{
    frame: THREE.Group;
    pivot: THREE.Group;
    isOpen: boolean;
    x: number;
    z: number;
    isVertical: boolean;
    collisionMinX: number;
    collisionMaxX: number;
    collisionMinZ: number;
    collisionMaxZ: number;
  }> = [];
  private hidingSpots: Array<{ mesh: THREE.Group; x: number; z: number }> = [];
  private candleProps: Array<{ light: THREE.PointLight; flame: THREE.Mesh; x: number; z: number; isLit: boolean; burnTime: number }> = [];
  private pickupItems: Array<{ id: string; mesh: THREE.Group; x: number; z: number; type: string; name: string; collected: boolean }> = [];
  private visitedGridTiles: Set<string> = new Set();
  private solvedRiddleIds: Set<string> = new Set();
  private activeRiddleTriggers: Array<{ riddle: StoryRiddle; x: number; z: number }> = [];
  private resolvedEncounterIds: Set<string> = new Set();
  private storyEncounterMarkers: Array<{ encounter: StoryEncounter; mesh: THREE.Group; light: THREE.PointLight }> = [];

  // Special Props (Clock, Piano, Fuse Box)
  private pendulumPivot: THREE.Group | null = null;
  private lastClockTickSecond = 0;
  private pianoMesh: THREE.Group | null = null;
  private fuseBoxMesh: THREE.Group | null = null;
  private isFuseBoxOn = false;
  private pianoInputNotes: string[] = [];
  private activeSaltCircle: { mesh: THREE.Mesh; x: number; z: number; expireTime: number } | null = null;

  // Inventory & Story Progress
  private inventory: InventoryItem[] = [];
  private collectedNotesThisRun: string[] = [];

  // Director
  private director: AIDirector;

  // Input states
  private keysPressed: Record<string, boolean> = {};
  private moveJoystick = { x: 0, y: 0 };
  private isMouseDown = false;
  private prevMouseX = 0;
  private prevMouseY = 0;

  // Camera lerp targets
  private camCurrentPos = new THREE.Vector3();
  private camTargetPos = new THREE.Vector3();

  // Scratch helpers
  private readonly _v1 = new THREE.Vector3();

  constructor(container: HTMLDivElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.director = new AIDirector(false);

    this.checkSoftwareGl();
    this.initThree();
    this.bindInputs();
  }

  private checkSoftwareGl() {
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) {
        this.isSoftwareGl = true;
        return;
      }
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      this.isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      this.isSoftwareGl = true;
    }
  }

  private initThree() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 50);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', this.onWindowResize);
  }

  public setFurnitureSetup(setup: FurnitureSetup) {
    this.furnitureSetup = { ...setup };
    this.furnitureBuffs = calculateFurnitureBuffs(this.furnitureSetup);
    // Rebuild world with newly configured 3D furniture
    if (this.levelConfig) {
      this.buildWorld();
    }
  }

  public startLevel(
    level: LevelConfig,
    charId: CharacterId,
    difficulty: Difficulty,
    safeMode = false,
    furnitureSetup?: FurnitureSetup
  ) {
    this.levelConfig = JSON.parse(JSON.stringify(level));
    this.characterId = charId;
    this.difficulty = difficulty;
    if (furnitureSetup) {
      this.furnitureSetup = { ...furnitureSetup };
    }
    this.furnitureBuffs = calculateFurnitureBuffs(this.furnitureSetup);

    this.director.setSafeMode(safeMode);
    this.director.reset();

    // Reset player attributes
    this.sanity = 100;
    const charDef = CHARACTERS[charId];
    this.stamina = 100 * charDef.staminaMult;
    this.battery = 100;
    this.isFlashlightOn = true;
    this.lives = getDifficultyLives(difficulty, this.furnitureBuffs.extraLives);
    this.score = 0;
    this.elapsedLevelTime = 0;
    this.isHiding = false;
    this.isHoldingBreath = false;
    this.isPossessed = false;
    this.skillCooldownTimer = 0;
    this.isFuseBoxOn = false;
    this.activeSaltCircle = null;
    this.visitedGridTiles.clear();
    this.collectedNotesThisRun = [];
    this.pianoInputNotes = [];
    this.ghostState = 'DORMANT';
    this.solvedRiddleIds.clear();
    this.activeRiddleTriggers = [];
    this.resolvedEncounterIds.clear();
    this.storyEncounterMarkers = [];

    // Default Starting Items
    this.inventory = [
      { id: 'item_bat_1', type: 'BATTERY', name: 'Baterai ABC', icon: '🔋', count: 2, description: 'Mengisi ulang daya senter.' },
      { id: 'item_jimat_1', type: 'JIMAT', name: 'Jimat Rajah', icon: '📜', count: 1, description: 'Menyetrum hantu selama 5 detik.' },
      { id: 'item_garam_1', type: 'GARAM', name: 'Garam Suci', icon: '🧂', count: 1, description: 'Lingkaran pelindung hantu 10 detik.' },
      { id: 'item_botol_1', type: 'BOTTLE', name: 'Botol Kaca', icon: '🍾', count: 2, description: 'Lempar untuk mengecoh hantu.' },
      { id: 'item_air_1', type: 'AIR_DOA', name: 'Air Doa Mbah', icon: '💧', count: 1, description: 'Memulihkan 40% Keberanian.' },
    ];

    this.buildWorld();
    this.updateHUDAll();

    if (!this.animationFrameId) {
      this.clock.start();
      this.tick();
    }
  }

  private buildWorld() {
    // Clear old scene contents
    while (this.scene.children.length > 0) {
      const obj = this.scene.children[0];
      this.scene.remove(obj);
    }
    this.walls = [];
    this.interactiveDoors = [];
    this.hidingSpots = [];
    this.candleProps = [];
    this.pickupItems = [];
    this.storyEncounterMarkers = [];
    this.pendulumPivot = null;

    // Atmosphere & Fog
    this.scene.background = new THREE.Color(this.levelConfig.fogColor);
    this.scene.fog = new THREE.FogExp2(this.levelConfig.fogColor, this.levelConfig.fogDensity);

    // Moonlight Directional Key Light with soft shadows
    const moonLight = new THREE.DirectionalLight(0x7599c4, 1.4);
    moonLight.position.set(16, 22, 14);
    moonLight.castShadow = !this.isSoftwareGl;
    moonLight.shadow.mapSize.width = 1024;
    moonLight.shadow.mapSize.height = 1024;
    moonLight.shadow.bias = -0.0005;
    this.scene.add(moonLight);

    // Ambient Environmental Fill
    const hemiLight = new THREE.HemisphereLight(0x5a708c, 0x1f2328, 0.9);
    this.scene.add(hemiLight);

    // Realistic Anatomical Human Player Rig
    this.playerRig = createPlayerModel(this.characterId);
    this.scene.add(this.playerRig.root);

    // Flashlight SpotLight and High-Intensity Bulb Glow
    this.flashlightTarget = new THREE.Object3D();
    this.scene.add(this.flashlightTarget);

    const flashIntensity = this.characterId === 'joko' ? 10.0 : 7.5;
    this.flashlightSpot = new THREE.SpotLight(0xfff7e6, flashIntensity, 32, Math.PI / 3.6, 0.4, 1.0);
    this.flashlightSpot.castShadow = !this.isSoftwareGl;
    this.flashlightSpot.shadow.bias = -0.0005;
    this.flashlightSpot.target = this.flashlightTarget;
    this.scene.add(this.flashlightSpot);

    const bulbGlow = new THREE.PointLight(0xffe8ba, 2.5, 9.0);
    bulbGlow.name = 'flashlight_bulb';
    this.flashlightSpot.add(bulbGlow);

    // Floating Cinematic Dust Particles
    const dust = createDustParticles(180);
    this.scene.add(dust);

    // Build Floor, Ceiling Beams, and Walls from Grid
    this.grid = this.levelConfig.grid;
    const rows = this.grid.length;
    const cols = this.grid[0].length;

    const floorTexture = getProceduralTexture(
      this.levelConfig.id === 1 ? 'WOOD_FLOOR' : this.levelConfig.id === 2 ? 'WALL_COLONIAL' : 'TILES_DIRTY'
    );
    floorTexture.repeat.set(cols / 2, rows / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.7,
      metalness: 0.15,
    });
    const floorGeom = new THREE.PlaneGeometry(cols * 2, rows * 2);
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set((cols * 2) / 2, 0, (rows * 2) / 2);
    floor.receiveShadow = !this.isSoftwareGl;
    this.scene.add(floor);

    // Overhead Wooden Ceiling Beams (Kaso & Balok Plafon)
    const beamMat = new THREE.MeshStandardMaterial({ map: getProceduralTexture('WOOD_FLOOR'), roughness: 0.8 });
    for (let bx = 2; bx < cols * 2; bx += 4) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.35, rows * 2), beamMat);
      beam.position.set(bx, 3.2, (rows * 2) / 2);
      this.scene.add(beam);
    }

    // Traditional Soko Guru Pillars in the central joglo hall (Desa Karangwungu)
    if (this.levelConfig.id === 1) {
      for (const [px, pz] of [[9, 9], [9, 15], [15, 9], [15, 15]]) {
        const pillar = createSokoGuruPillar();
        pillar.position.set(px, 0, pz);
        this.scene.add(pillar);
      }
    }

    // Grandfather Clock with swinging pendulum in central living room
    const clockObj = createGrandfatherClock();
    clockObj.group.position.set(11, 0, 7.2);
    this.pendulumPivot = clockObj.pendulumPivot;
    this.scene.add(clockObj.group);

    // Wall Material with Vertical Slats & Trim
    const wallTexture = getProceduralTexture(
      this.levelConfig.id === 1 ? 'WALL_WOOD' : this.levelConfig.id === 2 ? 'WALL_COLONIAL' : 'TILES_DIRTY'
    );
    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTexture,
      roughness: 0.85,
      metalness: 0.05,
    });
    const wallGeom = new THREE.BoxGeometry(2, 3.2, 2);

    let keyIndex = 1;
    let noteIndex = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const char = this.grid[r][c];
        const wx = c * 2 + 1;
        const wz = r * 2 + 1;

        if (char === 'W') {
          const wallMesh = new THREE.Mesh(wallGeom, wallMat);
          wallMesh.position.set(wx, 1.6, wz);
          wallMesh.castShadow = !this.isSoftwareGl;
          wallMesh.receiveShadow = !this.isSoftwareGl;
          this.scene.add(wallMesh);

          const box = new THREE.Box3().setFromObject(wallMesh);
          this.walls.push(box);
        } else if (char === 'S') {
          this.playerX = wx;
          this.playerZ = wz;
          this.playerRotY = -Math.PI / 2;
        } else if (char === 'G') {
          this.ghostX = wx;
          this.ghostZ = wz;
          this.ghostTargetX = wx;
          this.ghostTargetZ = wz;
        } else if (char === 'D') {
          const align = evaluateDoorAlignment(this.grid, r, c);
          const door = createDoor();
          door.frameGroup.position.set(wx, 0, wz);
          door.frameGroup.rotation.y = align.rotationY;
          this.scene.add(door.frameGroup);
          this.interactiveDoors.push({
            frame: door.frameGroup,
            pivot: door.doorPivot,
            isOpen: false,
            x: wx,
            z: wz,
            isVertical: align.isVertical,
            collisionMinX: align.collisionMinX,
            collisionMaxX: align.collisionMaxX,
            collisionMinZ: align.collisionMinZ,
            collisionMaxZ: align.collisionMaxZ,
          });
        } else if (char === 'H') {
          const wardrobe = createWardrobe();
          wardrobe.position.set(wx, 0, wz);
          this.scene.add(wardrobe);
          this.hidingSpots.push({ mesh: wardrobe, x: wx, z: wz });
        } else if (char === 'T') {
          const tableSet = createTableAndChairs();
          tableSet.position.set(wx, 0, wz);
          this.scene.add(tableSet);
        } else if (char === 'B') {
          // CUSTOMIZABLE BED: Instantiated based on active player furniture setup!
          const bed = createCustomBed(this.furnitureSetup.bed);
          bed.position.set(wx, 0, wz);
          this.scene.add(bed);
          this.hidingSpots.push({ mesh: bed, x: wx, z: wz });
        } else if (char === 'A') {
          // CUSTOMIZABLE ALTAR: Instantiated based on active player furniture setup!
          const altar = createCustomAltar(this.furnitureSetup.altar);
          altar.position.set(wx, 0, wz);
          this.scene.add(altar);

          if (this.levelConfig.riddles && this.levelConfig.riddles[0]) {
            this.activeRiddleTriggers.push({
              riddle: this.levelConfig.riddles[0],
              x: wx,
              z: wz,
            });
          }
        } else if (char === 'C') {
          const candle = createCandleCheckpoint();
          candle.group.position.set(wx, 0, wz);
          this.scene.add(candle.group);
          this.candleProps.push({
            light: candle.light,
            flame: candle.flame,
            x: wx,
            z: wz,
            isLit: true,
            burnTime: 45,
          });
        } else if (char === 'K') {
          const itemType = this.levelConfig.id === 1 ? 'KEY_PADLOCK' : this.levelConfig.id === 2 ? 'NOTE_SHEET' : 'MEDICAL_RECORD';
          const itemName = this.levelConfig.id === 1 ? `Kunci Gembok #${keyIndex++}` : this.levelConfig.id === 2 ? `Partitur Not #${keyIndex++}` : `Rekam Medis #${keyIndex++}`;
          this.spawnWorldPickup(wx, wz, itemType, itemName);
        } else if (char === 'N') {
          if (noteIndex < this.levelConfig.loreNotes.length) {
            const noteObj = this.levelConfig.loreNotes[noteIndex++];
            this.spawnWorldPickup(wx, wz, 'LORE_NOTE', noteObj.title, noteObj.id);
          }
        } else if (char === 'P') {
          this.pianoMesh = createGrandPiano();
          this.pianoMesh.position.set(wx, 0, wz);
          this.scene.add(this.pianoMesh);
        } else if (char === 'F') {
          this.fuseBoxMesh = createFuseBox();
          this.fuseBoxMesh.position.set(wx, 0, wz);
          this.scene.add(this.fuseBoxMesh);
        }
      }
    }

    // Place CUSTOMIZABLE CARPET in central living room area
    const carpet = createCustomCarpet(this.furnitureSetup.carpet);
    carpet.position.set(13, 0, 11);
    this.scene.add(carpet);

    // Place CUSTOMIZABLE WALL RELIC (Keris Naga Sasra / Topeng Klana / Potret Wirawan)
    const wallRelic = createCustomWallRelic(this.furnitureSetup.wallRelic);
    wallRelic.position.set(13, 2.0, 6.95);
    this.scene.add(wallRelic);

    // Secondary story riddle chest if available
    if (this.levelConfig.riddles && this.levelConfig.riddles.length > 1) {
      const secondRiddle = this.levelConfig.riddles[1];
      const chestX = 17;
      const chestZ = 7;
      const chestGeom = new THREE.BoxGeometry(0.75, 0.55, 0.45);
      const chestMat = new THREE.MeshStandardMaterial({
        color: 0x45220d,
        roughness: 0.7,
        metalness: 0.2,
      });
      const chestMesh = new THREE.Mesh(chestGeom, chestMat);
      chestMesh.position.set(chestX, 0.28, chestZ);
      this.scene.add(chestMesh);

      const chestLight = new THREE.PointLight(0xf59e0b, 1.4, 2.5);
      chestLight.position.set(chestX, 0.65, chestZ);
      this.scene.add(chestLight);

      this.activeRiddleTriggers.push({
        riddle: secondRiddle,
        x: chestX,
        z: chestZ,
      });
    }

    // Atmospheric CUSTOMIZABLE LAMPS (Lampu Petromak / Teplok / Dupa) in designated rooms
    const lanternPositions = [
      { x: 5, z: 5 },
      { x: 13, z: 5 },
      { x: 7, z: 15 },
      { x: 21, z: 15 },
      { x: 13, z: 21 },
    ];
    for (const lp of lanternPositions) {
      const { group: lampGroup } = createCustomLamp(this.furnitureSetup.lamp);
      lampGroup.position.set(lp.x, 2.4, lp.z);
      this.scene.add(lampGroup);
    }

    // Spawn Interactive Story Encounters 3D visual beacon markers
    if (this.levelConfig.storyEncounters) {
      for (const encounter of this.levelConfig.storyEncounters) {
        const markerGroup = new THREE.Group();
        markerGroup.position.set(encounter.x, 0, encounter.z);

        // Ethereal glowing orb & spirit beacon ring
        const spiritMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 });
        const spiritOrb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), spiritMat);
        spiritOrb.position.y = 1.35;
        markerGroup.add(spiritOrb);

        const ringGeom = new THREE.RingGeometry(0.4, 0.5, 24);
        const ringMesh = new THREE.Mesh(ringGeom, spiritMat);
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.y = 0.05;
        markerGroup.add(ringMesh);

        const spiritLight = new THREE.PointLight(0x38bdf8, 1.5, 4.5);
        spiritLight.position.y = 1.4;
        markerGroup.add(spiritLight);

        this.scene.add(markerGroup);
        this.storyEncounterMarkers.push({
          encounter,
          mesh: markerGroup,
          light: spiritLight,
        });
      }
    }

    // Spawn Ghost Mesh
    if (this.levelConfig.ghostType === 'POCONG') {
      this.ghostMesh = createPocongModel();
    } else if (this.levelConfig.ghostType === 'NONI_BELANDA') {
      this.ghostMesh = createNoniBelandaModel();
    } else {
      this.ghostMesh = createSusterNgesotModel();
    }
    this.ghostMesh.position.set(this.ghostX, 0, this.ghostZ);
    this.ghostMesh.visible = this.ghostState !== 'DORMANT';
    this.scene.add(this.ghostMesh);

    // Position player
    this.playerRig.root.position.set(this.playerX, 0, this.playerZ);
    this.playerRig.root.rotation.y = this.playerRotY;
  }

  private spawnWorldPickup(x: number, z: number, type: string, name: string, loreNoteId?: string) {
    const group = new THREE.Group();
    group.name = `pickup_${type}`;

    let geom: THREE.BufferGeometry;
    let mat: THREE.Material;

    if (type === 'KEY_PADLOCK' || type === 'KEY_GATE') {
      geom = new THREE.TorusGeometry(0.09, 0.025, 6, 8);
      mat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.9 });
    } else if (type === 'NOTE_SHEET' || type === 'MEDICAL_RECORD' || type === 'LORE_NOTE') {
      geom = new THREE.BoxGeometry(0.2, 0.02, 0.28);
      mat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9 });
    } else {
      geom = new THREE.CylinderGeometry(0.04, 0.04, 0.15, 6);
      mat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4 });
    }

    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.y = 0.35;
    mesh.castShadow = !this.isSoftwareGl;
    group.add(mesh);

    const glow = new THREE.PointLight(0xffffff, 0.6, 2.5);
    glow.position.y = 0.5;
    group.add(glow);

    group.position.set(x, 0, z);
    this.scene.add(group);

    this.pickupItems.push({
      id: loreNoteId || `item_${Math.random().toString(36).substring(2, 7)}`,
      mesh: group,
      x,
      z,
      type,
      name,
      collected: false,
    });
  }

  private bindInputs() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    this.keysPressed[e.code] = true;
    if (e.code === 'Space') {
      if (this.isStruggling) {
        this.triggerStruggleTap();
        return;
      }
    }
    if (e.code === 'KeyF') this.toggleFlashlight();
    if (e.code === 'KeyV') this.cycleCamera();
    if (e.code === 'KeyE') {
      if (this.isStruggling) {
        this.triggerStruggleTap();
        return;
      }
      this.performInteraction();
    }
    if (e.code === 'KeyR') this.useItemByType('BATTERY');
    if (e.code === 'KeyQ') this.useItemByType('JIMAT');
    if (e.code === 'KeyG') this.useItemByType('GARAM');
    if (e.code === 'KeyT') this.useItemByType('BOTTLE');
    if (e.code === 'KeyH') this.useItemByType('AIR_DOA');
    if (e.code === 'KeyX') this.triggerCharacterSkill();
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keysPressed[e.code] = false;
  };

  private onMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      this.isMouseDown = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
      soundManager.resume();
      if (this.isStruggling) {
        this.triggerStruggleTap();
      }
    }
  };

  private onMouseUp = () => {
    this.isMouseDown = false;
  };

  private onMouseMove = (e: MouseEvent) => {
    const isLocked = document.pointerLockElement === this.container || document.pointerLockElement === this.renderer.domElement;
    if (isLocked) {
      const sensitivity = 0.0022;
      this.playerRotY -= e.movementX * sensitivity;
      this.playerPitch -= e.movementY * sensitivity;
      this.playerPitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.playerPitch));
    } else if (this.isMouseDown) {
      const dx = e.clientX - this.prevMouseX;
      const dy = e.clientY - this.prevMouseY;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      const sensitivity = 0.004;
      this.playerRotY -= dx * sensitivity;
      this.playerPitch -= dy * sensitivity;
      this.playerPitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.playerPitch));
    }
  };

  public setJoystickVector(vx: number, vy: number) {
    this.moveJoystick.x = vx;
    this.moveJoystick.y = vy;
  }

  public handleTouchLookDelta(dx: number, dy: number) {
    const sensitivity = 0.0045;
    this.playerRotY -= dx * sensitivity;
    this.playerPitch -= dy * sensitivity;
    this.playerPitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.playerPitch));
  }

  public toggleFlashlight() {
    this.isFlashlightOn = !this.isFlashlightOn;
    this.flashlightSpot.visible = this.isFlashlightOn;
    soundManager.playFlashlightClick();
  }

  public triggerInteract() {
    if (this.isStruggling) {
      this.triggerStruggleTap();
      return;
    }
    this.performInteraction();
  }

  /**
   * Action trigger for struggle QTE (mobile tap or Space key)
   */
  public triggerStruggleTap() {
    if (!this.isStruggling) return;

    const gain = calculateStruggleTapGain(this.characterId, this.isFlashlightOn && this.battery > 0);
    this.struggleProgress = Math.min(100, this.struggleProgress + gain);
    soundManager.playStruggleHit();

    // Camera jolt
    this.playerPitch += (Math.random() - 0.5) * 0.08;

    if (this.struggleProgress >= 100) {
      this.isStruggling = false;
      this.ghostState = 'STUN';
      this.ghostStunTimer = 4.5;
      this.invulnerabilityTimer = 4.0;

      // Push ghost back away from player
      const pushDist = 3.5;
      const sinRot = Math.sin(this.playerRotY);
      const cosRot = Math.cos(this.playerRotY);
      this.ghostX -= sinRot * pushDist;
      this.ghostZ -= cosRot * pushDist;
      this.ghostTargetX = this.ghostX;
      this.ghostTargetZ = this.ghostZ;

      // Recover stamina rush
      this.stamina = Math.min(100, this.stamina + 35);
      this.callbacks.onStaminaChange(this.stamina);
      soundManager.playDoorSlam();
      this.callbacks.onStruggleStateChange(false, 100, 0);
      this.callbacks.onParanormalNotification('💥 Kamu berhasil melepaskan diri! Hantu terpukul mundur! LARI SEKARANG!');
    } else {
      this.callbacks.onStruggleStateChange(true, this.struggleProgress, this.struggleTimer);
    }
  }

  public toggleCrouch() {
    this.keysPressed['KeyC'] = !this.keysPressed['KeyC'];
  }

  public setSprinting(sprint: boolean) {
    this.keysPressed['ShiftLeft'] = sprint;
  }

  public cycleCamera() {
    if (this.cameraMode === 'FIRST_PERSON') {
      this.cameraMode = 'THIRD_PERSON';
    } else if (this.cameraMode === 'THIRD_PERSON') {
      this.cameraMode = 'TOP_DOWN';
    } else {
      this.cameraMode = 'FIRST_PERSON';
    }
    this.callbacks.onCameraChange(this.cameraMode);
  }

  public setCameraMode(mode: CameraMode) {
    this.cameraMode = mode;
    this.callbacks.onCameraChange(this.cameraMode);
  }

  public useItemByType(type: string): boolean {
    const itemIndex = this.inventory.findIndex((it) => it.type === type && it.count > 0);
    if (itemIndex === -1) return false;

    const item = this.inventory[itemIndex];

    if (this.isStruggling && (type === 'JIMAT' || type === 'GARAM')) {
      this.struggleProgress = 100;
      this.triggerStruggleTap();
      item.count -= 1;
      if (item.count <= 0) {
        this.inventory.splice(itemIndex, 1);
      }
      this.callbacks.onInventoryChange([...this.inventory]);
      return true;
    }

    if (type === 'BATTERY') {
      this.battery = Math.min(100, this.battery + 60);
      soundManager.playFlashlightClick();
      this.callbacks.onBatteryChange(this.battery);
    } else if (type === 'AIR_DOA') {
      this.sanity = Math.min(100, this.sanity + 40);
      soundManager.playItemPickup();
      this.callbacks.onSanityChange(this.sanity);
    } else if (type === 'JIMAT') {
      this.ghostState = 'STUN';
      this.ghostStunTimer = 5.0;
      soundManager.playItemPickup();
      this.callbacks.onParanormalNotification('Jimat bercahaya! Hantu terpukul mundur!');
    } else if (type === 'GARAM') {
      this.deploySaltCircle();
      this.callbacks.onParanormalNotification('Garam Suci ditabur! Membentuk lingkaran pelindung.');
    } else if (type === 'BOTTLE') {
      const throwDist = 7.0;
      const targetX = this.playerX - Math.sin(this.playerRotY) * throwDist;
      const targetZ = this.playerZ - Math.cos(this.playerRotY) * throwDist;
      soundManager.playBottleBreak(targetX - this.playerX, targetZ - this.playerZ);
      this.ghostTargetX = targetX;
      this.ghostTargetZ = targetZ;
      this.ghostState = 'INVESTIGATE';
      this.callbacks.onParanormalNotification('Prang! Botol pecah menarik perhatian hantu!');
    }

    item.count -= 1;
    if (item.count <= 0) {
      this.inventory.splice(itemIndex, 1);
    }
    this.callbacks.onInventoryChange([...this.inventory]);
    return true;
  }

  private deploySaltCircle() {
    if (this.activeSaltCircle) {
      this.scene.remove(this.activeSaltCircle.mesh);
    }
    const ringGeom = new THREE.RingGeometry(2.8, 3.0, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.set(this.playerX, 0.02, this.playerZ);
    this.scene.add(ringMesh);

    this.activeSaltCircle = {
      mesh: ringMesh,
      x: this.playerX,
      z: this.playerZ,
      expireTime: this.elapsedLevelTime + 10,
    };
  }

  public triggerCharacterSkill() {
    if (this.skillCooldownTimer > 0) return;
    const char = CHARACTERS[this.characterId];
    this.skillCooldownTimer = char.skillCooldown;

    if (this.characterId === 'raka') {
      this.stamina = Math.min(100, this.stamina + 20);
      this.callbacks.onParanormalNotification('Lari Kilat aktif!');
    } else if (this.characterId === 'sari') {
      this.sanity = Math.min(100, this.sanity + 30);
      this.callbacks.onSanityChange(this.sanity);
      this.callbacks.onParanormalNotification('Tarik Napas: Keberanian dipulihkan!');
    } else if (this.characterId === 'joko') {
      this.ghostState = 'STUN';
      this.ghostStunTimer = 2.5;
      soundManager.playFlashlightClick();
      this.callbacks.onParanormalNotification('Sorot Terang! Hantu terbutakan!');
    } else if (this.characterId === 'dewi') {
      this.sanity = Math.max(0, this.sanity - 15);
      this.callbacks.onSanityChange(this.sanity);
      this.callbacks.onParanormalNotification('Mata Batin aktif: Keberadaan gaib terungkap!');
    }
  }

  public playPianoKey(note: string) {
    soundManager.playPianoNote(note);
    this.pianoInputNotes.push(note);

    const targetMelody = ['C4', 'E4', 'G4', 'B4'];
    if (this.pianoInputNotes.length === targetMelody.length) {
      if (verifyPianoPuzzle(this.pianoInputNotes, targetMelody)) {
        soundManager.playItemPickup();
        this.callbacks.onParanormalNotification('Klak! Brankas rahasia di samping piano terbuka!');
        this.callbacks.onPianoPuzzleOpen(false);
        const obj = this.levelConfig.objectives.find((o) => o.id === 'piano');
        if (obj) obj.completed = true;
        this.spawnWorldPickup(this.playerX + 1, this.playerZ, 'KEY_GATE', 'Kunci Gerbang Utama');
        this.callbacks.onObjectiveUpdate([...this.levelConfig.objectives]);
      } else {
        this.callbacks.onParanormalNotification('Melodi salah... Terdengar desah lirih di cermin.');
        this.pianoInputNotes = [];
      }
    }
  }

  public setHoldingBreath(holding: boolean) {
    this.isHoldingBreath = holding;
  }

  // --- Interaction Check ---
  private performInteraction() {
    if (this.isHiding) {
      this.isHiding = false;
      this.callbacks.onHidingStateChange(false);
      this.callbacks.onParanormalNotification('Keluar dari persembunyian.');
      return;
    }

    // Check Story Encounters (Interactive Narrative Dialogue)
    if (this.levelConfig.storyEncounters) {
      for (const encounter of this.levelConfig.storyEncounters) {
        if (!this.resolvedEncounterIds.has(encounter.id)) {
          const dist = Math.hypot(encounter.x - this.playerX, encounter.z - this.playerZ);
          if (dist < 2.5) {
            soundManager.playSpiritVoice();
            this.callbacks.onOpenStoryEncounter(encounter);
            return;
          }
        }
      }
    }

    // Check pickups within 2m
    for (let i = 0; i < this.pickupItems.length; i++) {
      const item = this.pickupItems[i];
      if (item.collected) continue;
      const d = Math.hypot(item.x - this.playerX, item.z - this.playerZ);
      if (d < 1.8) {
        item.collected = true;
        this.scene.remove(item.mesh);
        soundManager.playItemPickup();

        if (item.type === 'LORE_NOTE') {
          const noteData = this.levelConfig.loreNotes.find((n) => n.id === item.id);
          if (noteData) {
            noteData.found = true;
            this.collectedNotesThisRun.push(noteData.id);
            this.callbacks.onNoteFound(noteData);
          }
        } else {
          const existing = this.inventory.find((inv) => inv.type === item.type);
          if (existing) {
            existing.count += 1;
          } else {
            this.inventory.push({
              id: item.id,
              type: item.type as any,
              name: item.name,
              icon: item.type.includes('KEY') ? '🔑' : '📄',
              count: 1,
              description: item.name,
            });
          }
          this.callbacks.onInventoryChange([...this.inventory]);

          if (item.type === 'KEY_PADLOCK') {
            const obj = this.levelConfig.objectives.find((o) => o.id === 'keys');
            if (obj) {
              obj.current += 1;
              if (obj.current >= obj.required) obj.completed = true;
            }
          } else if (item.type === 'NOTE_SHEET') {
            const obj = this.levelConfig.objectives.find((o) => o.id === 'sheets');
            if (obj) {
              obj.current += 1;
              if (obj.current >= obj.required) obj.completed = true;
            }
          } else if (item.type === 'MEDICAL_RECORD') {
            const obj = this.levelConfig.objectives.find((o) => o.id === 'records');
            if (obj) {
              obj.current += 1;
              if (obj.current >= obj.required) obj.completed = true;
            }
          }
          this.callbacks.onObjectiveUpdate([...this.levelConfig.objectives]);
        }
        return;
      }
    }

    // Check Story Riddles within 2.2m
    for (const trigger of this.activeRiddleTriggers) {
      if (!this.solvedRiddleIds.has(trigger.riddle.id)) {
        const dist = Math.hypot(trigger.x - this.playerX, trigger.z - this.playerZ);
        if (dist < 2.2) {
          this.callbacks.onOpenRiddle(trigger.riddle);
          return;
        }
      }
    }

    // Check Doors within 2.2m
    for (const d of this.interactiveDoors) {
      const dist = Math.hypot(d.x - this.playerX, d.z - this.playerZ);
      if (dist < 2.0) {
        d.isOpen = !d.isOpen;
        d.pivot.rotation.y = d.isOpen ? 1.48 : 0;
        soundManager.playDoorCreak(!d.isOpen);
        return;
      }
    }

    // Check Wardrobes / Hiding spots within 2.0m
    for (const h of this.hidingSpots) {
      const dist = Math.hypot(h.x - this.playerX, h.z - this.playerZ);
      if (dist < 2.0) {
        this.isHiding = true;
        this.playerX = h.x;
        this.playerZ = h.z;
        this.callbacks.onHidingStateChange(true);
        this.callbacks.onParanormalNotification('Bersembunyi... Tahan Napas jika hantu memeriksa!');
        return;
      }
    }

    // Check Piano in Level 2
    if (this.pianoMesh) {
      const dist = Math.hypot(this.pianoMesh.position.x - this.playerX, this.pianoMesh.position.z - this.playerZ);
      if (dist < 2.5) {
        this.callbacks.onPianoPuzzleOpen(true);
        return;
      }
    }

    // Check Fuse Box in Level 2
    if (this.fuseBoxMesh) {
      const dist = Math.hypot(this.fuseBoxMesh.position.x - this.playerX, this.fuseBoxMesh.position.z - this.playerZ);
      if (dist < 2.2) {
        this.isFuseBoxOn = true;
        soundManager.playFlashlightClick();
        this.callbacks.onParanormalNotification('Listrik Villa menyala! Lampu kristal menerangi lorong.');
        const obj = this.levelConfig.objectives.find((o) => o.id === 'fuse');
        if (obj) obj.completed = true;
        this.callbacks.onObjectiveUpdate([...this.levelConfig.objectives]);
        return;
      }
    }

    // Check Exit / Escape condition at edge doors
    const escapeObj = this.levelConfig.objectives.find((o) => o.id === 'escape');
    if (escapeObj) {
      const canEscape = this.levelConfig.objectives.filter((o) => o.id !== 'escape').every((o) => o.completed);
      if (canEscape) {
        const distToStart = Math.hypot(this.playerX - 3, this.playerZ - 3);
        if (distToStart < 3.0) {
          escapeObj.completed = true;
          this.finishLevel(true);
        }
      }
    }
  }

  // Submit Interactive Story Choice
  public submitStoryChoice(encounterId: string, choiceId: string): { message: string; consequenceDesc: string } {
    const encounter = this.levelConfig.storyEncounters?.find((e) => e.id === encounterId);
    if (!encounter) return { message: 'Peristiwa tidak ditemukan.', consequenceDesc: '' };

    const choice = encounter.choices.find((c) => c.id === choiceId);
    if (!choice) return { message: 'Pilihan tidak valid.', consequenceDesc: '' };

    this.resolvedEncounterIds.add(encounterId);
    encounter.resolvedChoiceId = choiceId;

    const res = resolveStoryChoice(choice);
    soundManager.playGongBell();

    if (res.sanityChange !== 0) {
      this.sanity = Math.max(10, Math.min(100, this.sanity + res.sanityChange));
      this.callbacks.onSanityChange(this.sanity);
    }

    if (res.scoreBonus > 0) {
      this.score += res.scoreBonus;
      this.callbacks.onScoreChange(this.score);
    }

    if (res.pacifyGhost) {
      this.ghostState = 'STUN';
      this.ghostStunTimer = 15.0;
      this.callbacks.onParanormalNotification('Arwah berhasil ditenangkan! Hantu membeku selama 15 detik.');
    }

    if (res.enrageGhost) {
      this.ghostState = 'CHASE';
      this.ghostTargetX = this.playerX;
      this.ghostTargetZ = this.playerZ;
      soundManager.playJumpscareStinger();
      this.callbacks.onParanormalNotification('⚠️ Arwah berteriak murka! Hantu mengejar dengan kecepatan penuh!');
    }

    if (res.rewardItem) {
      this.inventory.push({
        id: `reward_${choice.id}`,
        type: 'JIMAT',
        name: res.rewardItem,
        icon: '📜',
        count: 1,
        description: `Pusaka dari ${encounter.speakerName}`,
      });
      this.callbacks.onInventoryChange([...this.inventory]);
    }

    // Complete encounter objective if present
    const encounterObj = this.levelConfig.objectives.find((o) => o.id === 'encounter');
    if (encounterObj) {
      encounterObj.completed = true;
      this.callbacks.onObjectiveUpdate([...this.levelConfig.objectives]);
    }

    return {
      message: res.message,
      consequenceDesc: choice.consequenceDesc,
    };
  }

  private afterDraw = (cb: () => void) => {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl || !gl.fenceSync) {
      this.animationFrameId = window.setTimeout(cb, 50);
      return;
    }
    try {
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (this.isDisposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.animationFrameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          this.animationFrameId = window.setTimeout(cb, 50);
        }
      };
      this.animationFrameId = window.setTimeout(poll, 5);
    } catch {
      this.animationFrameId = window.setTimeout(cb, 50);
    }
  };

  // --- Main Tick Loop ---
  private tick = () => {
    if (this.isDisposed) return;
    const rawDelta = this.clock.getDelta();
    const delta = Math.min(rawDelta, 0.05);

    if (!this.isPaused) {
      this.updateSimulation(delta);
    }

    this.renderScene();
    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.animationFrameId = requestAnimationFrame(this.tick);
    }
  };

  private updateSimulation(delta: number) {
    this.elapsedLevelTime += delta;
    if (this.skillCooldownTimer > 0) {
      this.skillCooldownTimer -= delta;
    }

    // Animate Grandfather Clock Pendulum & Tick Sound
    if (this.pendulumPivot) {
      this.pendulumPivot.rotation.z = Math.sin(this.elapsedLevelTime * 3.14159) * 0.28;
      const currentSecond = Math.floor(this.elapsedLevelTime);
      if (currentSecond !== this.lastClockTickSecond) {
        this.lastClockTickSecond = currentSecond;
        const distToClock = Math.hypot(11 - this.playerX, 7.2 - this.playerZ);
        if (distToClock < 8.0) {
          soundManager.playClockTick();
        }
      }
    }

    // Drain Flashlight battery with furniture buff applied
    if (this.isFlashlightOn) {
      const drainRate = (this.characterId === 'joko' ? 0.35 : 0.55) * (1.0 - this.furnitureBuffs.batteryEfficiency);
      this.battery = Math.max(0, this.battery - drainRate * delta);
      if (this.battery <= 0 && this.flashlightSpot.visible) {
        this.flashlightSpot.visible = false;
        this.callbacks.onParanormalNotification('Baterai senter habis! Tekan [R] untuk ganti baterai.');
      }
      this.callbacks.onBatteryChange(this.battery);
    }

    // Check Active Salt Circle
    if (this.activeSaltCircle && this.elapsedLevelTime >= this.activeSaltCircle.expireTime) {
      this.scene.remove(this.activeSaltCircle.mesh);
      this.activeSaltCircle = null;
    }

    // Player Movement physics with furniture speed bonus
    let moveSpeed = 0;
    const isCrouch = this.keysPressed['KeyC'] || false;
    const isShift = (this.keysPressed['ShiftLeft'] || this.keysPressed['ShiftRight']) && this.stamina > 5;

    if (!this.isHiding) {
      const charDef = CHARACTERS[this.characterId];
      let baseSpeed = 2.8 * charDef.speedMult * (1.0 + this.furnitureBuffs.speedBonus);
      if (isShift) {
        baseSpeed = 5.4 * charDef.speedMult * (1.0 + this.furnitureBuffs.speedBonus);
      } else if (isCrouch) {
        baseSpeed = 1.4;
      }

      let moveForward = 0;
      let moveSide = 0;
      if (this.keysPressed['KeyW'] || this.keysPressed['ArrowUp']) moveForward += 1;
      if (this.keysPressed['KeyS'] || this.keysPressed['ArrowDown']) moveForward -= 1;
      if (this.keysPressed['KeyA'] || this.keysPressed['ArrowLeft']) moveSide -= 1;
      if (this.keysPressed['KeyD'] || this.keysPressed['ArrowRight']) moveSide += 1;

      if (Math.abs(this.moveJoystick.y) > 0.1) moveForward -= this.moveJoystick.y;
      if (Math.abs(this.moveJoystick.x) > 0.1) moveSide += this.moveJoystick.x;

      if (this.isPossessed) {
        moveForward = -moveForward;
        moveSide = -moveSide;
        this.possessedTimer -= delta;
        if (this.possessedTimer <= 0) {
          this.isPossessed = false;
        }
      }

      const inputLen = Math.hypot(moveForward, moveSide);
      if (inputLen > 0.05) {
        const dirForward = moveForward / inputLen;
        const dirSide = moveSide / inputLen;

        const sinRot = Math.sin(this.playerRotY);
        const cosRot = Math.cos(this.playerRotY);

        const dx = (-sinRot * dirForward + cosRot * dirSide) * baseSpeed * delta;
        const dz = (-cosRot * dirForward - sinRot * dirSide) * baseSpeed * delta;

        this.attemptMovePlayer(dx, dz);
        moveSpeed = baseSpeed;

        const surface = this.levelConfig.id === 1 ? 'WOOD' : this.levelConfig.id === 2 ? 'MARBLE' : 'TILE';
        if (this.clock.getElapsedTime() - this.lastGhostFootstepTime > (isShift ? 0.32 : 0.55)) {
          this.lastGhostFootstepTime = this.clock.getElapsedTime();
          soundManager.playFootstep(surface, isShift);
        }
      }

      // Update stamina with furniture recovery bonus
      this.stamina = updateStamina(
        this.stamina,
        isShift && inputLen > 0.1,
        isCrouch,
        this.isHoldingBreath,
        delta,
        100 * charDef.staminaMult,
        this.furnitureBuffs.staminaRecoveryBonus
      );
      this.callbacks.onStaminaChange(this.stamina);
    }

    // Animate Realistic Human Character Model (Breathing, Walking/Running Gait, Head Pitch)
    this.playerRig.updateAnimation(this.elapsedLevelTime, moveSpeed, isCrouch, this.playerPitch);

    // Distance to ghost
    const distToGhost = Math.hypot(this.ghostX - this.playerX, this.ghostZ - this.playerZ);

    // Update Sanity with furniture drain reduction
    const charDef = CHARACTERS[this.characterId];
    const isNearCandle = this.candleProps.some((c) => c.isLit && Math.hypot(c.x - this.playerX, c.z - this.playerZ) < 3.0);
    this.sanity = updateSanity(
      this.sanity,
      !this.isFlashlightOn && !isNearCandle,
      distToGhost,
      distToGhost < 8.0,
      isNearCandle,
      delta,
      charDef.sanityRecoveryMult,
      this.furnitureBuffs.sanityDrainReduction
    );
    this.callbacks.onSanityChange(this.sanity);
    soundManager.updateHeartbeat(this.sanity);

    if (this.sanity <= 0 && !this.isPossessed) {
      this.isPossessed = true;
      this.possessedTimer = 8.0;
      this.callbacks.onParanormalNotification('KERASUKAN! Kontrol terbalik dan hantu mengetahui posisimu!');
    }

    // AI Director update
    const isGhostChasing = this.ghostState === 'CHASE';
    const { directGhostToPlayer, paranormalEvent } = this.director.update(delta, isGhostChasing, distToGhost);
    if (directGhostToPlayer && this.ghostState === 'PATROL') {
      this.ghostTargetX = this.playerX + (Math.random() - 0.5) * 4;
      this.ghostTargetZ = this.playerZ + (Math.random() - 0.5) * 4;
    }
    if (paranormalEvent && paranormalEvent.message) {
      this.callbacks.onParanormalNotification(paranormalEvent.message);
    }

    // Countdown invulnerability grace timer
    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer -= delta;
    }

    // Proximity threat evaluation & Early Warning Signals
    const angleToGhost = Math.atan2(this.ghostX - this.playerX, this.ghostZ - this.playerZ) - this.playerRotY;
    const threat = calculateProximityThreat(distToGhost, isGhostChasing);
    this.callbacks.onGhostProximityChange(distToGhost, threat.threatLevel, threat.warningText, angleToGhost);

    // Periodic chilling ghost laughter ("hihihihihi...") or moan
    if (distToGhost < 16.0 && this.ghostState !== 'DORMANT') {
      const timeSinceLastLaugh = this.elapsedLevelTime - this.lastGhostLaughTime;
      const laughInterval = this.ghostState === 'CHASE' ? 6.5 : 12.0;
      if (timeSinceLastLaugh > laughInterval) {
        this.lastGhostLaughTime = this.elapsedLevelTime;
        if (this.levelConfig.ghostType === 'NONI_BELANDA' || this.levelConfig.ghostType === 'POCONG') {
          soundManager.playKuntilanakLaugh(this.ghostX - this.playerX, this.ghostZ - this.playerZ, this.ghostState === 'CHASE' ? 0.95 : 0.70);
        } else {
          soundManager.playGhostMoan(this.ghostX - this.playerX, this.ghostZ - this.playerZ);
        }
      }
    }

    // Flashlight flicker & static buzz when ghost is nearby
    if (threat.shouldFlickerFlashlight && this.isFlashlightOn) {
      const flickerChance = distToGhost < 5.0 ? 0.40 : 0.18;
      if (Math.random() < flickerChance) {
        this.flashlightSpot.intensity = Math.random() * 0.7;
        if (distToGhost < 7.0 && this.elapsedLevelTime - this.lastSparksTime > 1.2) {
          this.lastSparksTime = this.elapsedLevelTime;
          soundManager.playSparksBuzz();
        }
      } else {
        this.flashlightSpot.intensity = this.characterId === 'joko' ? 3.2 : 2.4;
      }
    } else if (this.isFlashlightOn) {
      this.flashlightSpot.intensity = this.characterId === 'joko' ? 3.2 : 2.4;
    }

    // Ghost Simulation with stealth bonus from furniture
    this.updateGhostAI(delta, moveSpeed);

    // Audio listener update
    soundManager.updateListenerPosition(
      this.playerX,
      1.65,
      this.playerZ,
      -Math.sin(this.playerRotY),
      -Math.cos(this.playerRotY)
    );

    // Threat audio layer update
    if (this.ghostState === 'CHASE') {
      soundManager.setThreatLevel('CHASE');
    } else if (distToGhost < 10.0) {
      soundManager.setThreatLevel('TENSE');
    } else {
      soundManager.setThreatLevel('CALM');
    }

    // Update Visited Grid Tiles for Minimap
    const gridX = Math.floor(this.playerX / 2);
    const gridZ = Math.floor(this.playerZ / 2);
    this.visitedGridTiles.add(`${gridX},${gridZ}`);

    // Update interaction prompt in view
    this.updateInteractionPrompt();
  }

  private attemptMovePlayer(dx: number, dz: number) {
    const nextX = this.playerX + dx;
    const nextZ = this.playerZ + dz;

    const playerRadius = 0.42;
    let canMoveX = true;
    let canMoveZ = true;

    for (const box of this.walls) {
      if (checkCircleBoxCollision(nextX, this.playerZ, playerRadius, box.min.x, box.max.x, box.min.z, box.max.z)) {
        canMoveX = false;
      }
      if (checkCircleBoxCollision(this.playerX, nextZ, playerRadius, box.min.x, box.max.x, box.min.z, box.max.z)) {
        canMoveZ = false;
      }
    }

    for (const d of this.interactiveDoors) {
      if (!d.isOpen) {
        if (checkCircleBoxCollision(nextX, this.playerZ, playerRadius, d.collisionMinX, d.collisionMaxX, d.collisionMinZ, d.collisionMaxZ)) {
          canMoveX = false;
        }
        if (checkCircleBoxCollision(this.playerX, nextZ, playerRadius, d.collisionMinX, d.collisionMaxX, d.collisionMinZ, d.collisionMaxZ)) {
          canMoveZ = false;
        }
      }
    }

    if (canMoveX) this.playerX = nextX;
    if (canMoveZ) this.playerZ = nextZ;

    this.playerX = Math.max(1, Math.min(this.grid[0].length * 2 - 1, this.playerX));
    this.playerZ = Math.max(1, Math.min(this.grid.length * 2 - 1, this.playerZ));

    this.playerRig.root.position.set(this.playerX, 0, this.playerZ);
    this.playerRig.root.rotation.y = this.playerRotY + Math.PI;
  }

  private updateGhostAI(delta: number, playerSpeed: number) {
    if (!this.ghostMesh) return;

    // Handle Active Struggle
    if (this.isStruggling) {
      this.struggleTimer -= delta;

      // Passive assistance: Senter shining at ghost adds escape pressure
      if (this.isFlashlightOn && this.battery > 0) {
        this.struggleProgress = Math.min(100, this.struggleProgress + 14 * delta);
      }

      this.callbacks.onStruggleStateChange(true, this.struggleProgress, Math.max(0, this.struggleTimer));

      // Keep ghost directly grappling in front of player
      const sinP = Math.sin(this.playerRotY);
      const cosP = Math.cos(this.playerRotY);
      this.ghostX = this.playerX - sinP * 1.1;
      this.ghostZ = this.playerZ - cosP * 1.1;
      this.ghostMesh.position.set(this.ghostX, 0.1, this.ghostZ);
      this.ghostMesh.rotation.y = this.playerRotY;

      if (this.struggleTimer <= 0) {
        this.isStruggling = false;
        this.callbacks.onStruggleStateChange(false, 0, 0);
        this.onPlayerCaught();
      }
      return;
    }

    if (this.ghostState === 'DORMANT') {
      const foundNotesCount = this.collectedNotesThisRun.length;
      const foundKeysCount = this.inventory.filter((i) => i.type.includes('KEY')).reduce((acc, i) => acc + i.count, 0);
      const solvedRiddlesCount = this.solvedRiddleIds.size;
      const solvedEncountersCount = this.resolvedEncounterIds.size;

      if (shouldAwakenGhost(foundNotesCount, foundKeysCount, solvedRiddlesCount, solvedEncountersCount)) {
        this.ghostState = 'PATROL';
        this.ghostMesh.visible = true;
        soundManager.playKuntilanakLaugh(this.ghostX - this.playerX, this.ghostZ - this.playerZ, 1.0);
        soundManager.playJumpscareStinger();
        this.callbacks.onParanormalNotification('⚠️ Arwah BANGKIT dari peristirahatan! Dengarkan suara tawanya!');
      } else {
        this.ghostMesh.visible = false;
        return;
      }
    }

    if (this.ghostState === 'STUN') {
      this.ghostStunTimer -= delta;
      if (this.ghostStunTimer <= 0) {
        this.ghostState = 'SEARCH';
        this.ghostTimer = 6.0;
      }
      return;
    }

    const distToPlayer = Math.hypot(this.ghostX - this.playerX, this.ghostZ - this.playerZ);

    const saltDist = this.activeSaltCircle ? Math.hypot(this.ghostX - this.activeSaltCircle.x, this.ghostZ - this.activeSaltCircle.z) : 999;
    const detection = evaluateGhostDetection(
      this.levelConfig.ghostType,
      distToPlayer,
      playerSpeed,
      distToPlayer < 12.0,
      this.isFlashlightOn,
      distToPlayer < 8.0,
      this.keysPressed['KeyC'] || false,
      saltDist,
      this.furnitureBuffs.ghostDetectionReduction
    );

    if (detection.frozen) {
      return;
    }

    if (detection.detected && !this.isHiding) {
      if (this.ghostState !== 'CHASE') {
        soundManager.playKuntilanakLaugh(this.ghostX - this.playerX, this.ghostZ - this.playerZ, 1.0);
      }
      this.ghostState = 'CHASE';
      this.ghostTargetX = this.playerX;
      this.ghostTargetZ = this.playerZ;
      this.callbacks.onGhostDetectedChange(true, distToPlayer);
    }

    let ghostSpeed = 2.4;
    if (this.levelConfig.ghostType === 'POCONG') {
      ghostSpeed = this.ghostState === 'CHASE' ? 3.6 : 1.8;
    } else if (this.levelConfig.ghostType === 'NONI_BELANDA') {
      ghostSpeed = this.ghostState === 'CHASE' ? 4.2 : 2.6;
    } else if (this.levelConfig.ghostType === 'SUSTER_NGESOT') {
      ghostSpeed = this.ghostState === 'CHASE' ? 4.8 : 1.6;
    }

    const dx = this.ghostTargetX - this.ghostX;
    const dz = this.ghostTargetZ - this.ghostZ;
    const distToTarget = Math.hypot(dx, dz);

    if (distToTarget > 0.2) {
      const step = Math.min(distToTarget, ghostSpeed * delta);
      this.ghostX += (dx / distToTarget) * step;
      this.ghostZ += (dz / distToTarget) * step;

      const angle = Math.atan2(dx, dz);
      this.ghostMesh.rotation.y = angle;
    }

    this.ghostHopAnim += delta * (this.ghostState === 'CHASE' ? 6 : 3);
    if (this.levelConfig.ghostType === 'POCONG') {
      const hopHeight = Math.abs(Math.sin(this.ghostHopAnim)) * 0.45;
      this.ghostMesh.position.set(this.ghostX, hopHeight, this.ghostZ);
      if (Math.sin(this.ghostHopAnim) < -0.8 && distToPlayer < 20) {
        soundManager.playPocongHop(this.ghostX - this.playerX, this.ghostZ - this.playerZ);
      }
    } else if (this.levelConfig.ghostType === 'SUSTER_NGESOT') {
      this.ghostMesh.position.set(this.ghostX, 0, this.ghostZ);
      if (Math.sin(this.ghostHopAnim) < -0.8 && distToPlayer < 18) {
        soundManager.playSusterCrawl(this.ghostX - this.playerX, this.ghostZ - this.playerZ);
      }
    } else {
      const floatY = 0.2 + Math.sin(this.ghostHopAnim * 0.5) * 0.15;
      this.ghostMesh.position.set(this.ghostX, floatY, this.ghostZ);
    }

    // Anti-Sudden-Death: Initiate Struggle QTE when close instead of instant death!
    if (distToPlayer < 1.35 && !this.isHiding) {
      if (this.invulnerabilityTimer > 0) {
        const repAngle = Math.atan2(this.ghostX - this.playerX, this.ghostZ - this.playerZ);
        this.ghostX = this.playerX + Math.sin(repAngle) * 2.2;
        this.ghostZ = this.playerZ + Math.cos(repAngle) * 2.2;
      } else {
        this.isStruggling = true;
        this.struggleProgress = 0;
        this.struggleTimer = 3.5;
        soundManager.playGhostFrenzyScream();
        soundManager.playKuntilanakLaugh(0, 0, 1.0);
        this.callbacks.onStruggleStateChange(true, 0, 3.5);
        this.callbacks.onParanormalNotification('⚠️ ARWAH MENYERANG! TEKAN SPASI / TAP CEPAT UNTUK MELEPASKAN DIRI!');
      }
    }
  }

  private onPlayerCaught() {
    this.isStruggling = false;
    this.callbacks.onStruggleStateChange(false, 0, 0);
    soundManager.playJumpscareStinger();
    this.lives -= 1;
    this.callbacks.onLivesChange(this.lives);
    if (this.lives <= 0) {
      this.callbacks.onGameOver('Doa pelindung habis... Arwahmu terikat di rumah angker keluarga Wirawan.');
    } else {
      this.callbacks.onParanormalNotification('Tertangkap! Mengulang di lilin pelindung...');
      this.playerX = 3;
      this.playerZ = 3;
      this.ghostX = 14;
      this.ghostZ = 14;
      this.ghostState = 'PATROL';
      this.sanity = 65;
      this.invulnerabilityTimer = 5.0; // 5 seconds grace period
    }
  }

  private updateInteractionPrompt() {
    if (this.isStruggling) {
      this.callbacks.onInteractionPrompt('💥 [SPASI / TAP] LEPASKAN DIRI!');
      return;
    }

    let prompt: string | null = null;

    // Check Story Encounters
    if (this.levelConfig.storyEncounters) {
      for (const enc of this.levelConfig.storyEncounters) {
        if (!this.resolvedEncounterIds.has(enc.id)) {
          if (Math.hypot(enc.x - this.playerX, enc.z - this.playerZ) < 2.5) {
            prompt = `[E] Bicara: ${enc.speakerName}`;
            break;
          }
        }
      }
    }

    // Check pickups
    if (!prompt) {
      for (const item of this.pickupItems) {
        if (!item.collected && Math.hypot(item.x - this.playerX, item.z - this.playerZ) < 1.8) {
          prompt = `[E] Ambil ${item.name}`;
          break;
        }
      }
    }

    // Check doors
    if (!prompt) {
      for (const d of this.interactiveDoors) {
        if (Math.hypot(d.x - this.playerX, d.z - this.playerZ) < 2.0) {
          prompt = d.isOpen ? '[E] Tutup Pintu Jati' : '[E] Buka Pintu Jati';
          break;
        }
      }
    }

    // Check hiding spots
    if (!prompt) {
      for (const h of this.hidingSpots) {
        if (Math.hypot(h.x - this.playerX, h.z - this.playerZ) < 2.0) {
          prompt = this.isHiding ? '[E] Keluar Persembunyian' : '[E] Sembunyi';
          break;
        }
      }
    }

    // Check piano
    if (!prompt && this.pianoMesh) {
      if (Math.hypot(this.pianoMesh.position.x - this.playerX, this.pianoMesh.position.z - this.playerZ) < 2.5) {
        prompt = '[E] Mainkan Piano Tua';
      }
    }

    // Check fuse box
    if (!prompt && this.fuseBoxMesh && !this.isFuseBoxOn) {
      if (Math.hypot(this.fuseBoxMesh.position.x - this.playerX, this.fuseBoxMesh.position.z - this.playerZ) < 2.2) {
        prompt = '[E] Nyalakan Sekring Listrik';
      }
    }

    // Check story riddles (Altar & Peti)
    if (!prompt) {
      for (const trigger of this.activeRiddleTriggers) {
        if (!this.solvedRiddleIds.has(trigger.riddle.id)) {
          if (Math.hypot(trigger.x - this.playerX, trigger.z - this.playerZ) < 2.2) {
            prompt = `[E] Pecahkan: ${trigger.riddle.title}`;
            break;
          }
        }
      }
    }

    this.callbacks.onInteractionPrompt(prompt);
  }

  public submitRiddleAnswer(riddleId: string, choiceIndex: number): { success: boolean; message: string; rewardItemName?: string } {
    const riddle = this.levelConfig.riddles?.find((r) => r.id === riddleId);
    if (!riddle) return { success: false, message: 'Teka-teki tidak ditemukan.' };

    if (checkRiddleAnswer(riddle.correctIndex, choiceIndex)) {
      this.solvedRiddleIds.add(riddleId);
      riddle.solved = true;
      soundManager.playItemPickup();

      let rewardIcon = '🔑';
      let itemType: any = 'KEY_PADLOCK';
      if (riddle.rewardItemName.includes('Jimat')) {
        rewardIcon = '📜';
        itemType = 'JIMAT';
      } else if (riddle.rewardItemName.includes('Air Doa')) {
        rewardIcon = '💧';
        itemType = 'AIR_DOA';
      } else if (riddle.rewardItemName.includes('Kunci')) {
        rewardIcon = '🔑';
        itemType = 'KEY_PADLOCK';
        const keyObj = this.levelConfig.objectives.find((o) => o.id === 'keys');
        if (keyObj) {
          keyObj.current = Math.min(keyObj.required, keyObj.current + 1);
          if (keyObj.current >= keyObj.required) keyObj.completed = true;
          this.callbacks.onObjectiveUpdate([...this.levelConfig.objectives]);
        }
      }

      const existing = this.inventory.find((i) => i.name === riddle.rewardItemName);
      if (existing) {
        existing.count += 1;
      } else {
        this.inventory.push({
          id: `reward_${riddle.id}`,
          type: itemType,
          name: riddle.rewardItemName,
          icon: rewardIcon,
          count: 1,
          description: `Hadiah pemecahan: ${riddle.title}`,
        });
      }
      this.callbacks.onInventoryChange([...this.inventory]);

      if (this.ghostState === 'DORMANT') {
        this.ghostState = 'PATROL';
        if (this.ghostMesh) this.ghostMesh.visible = true;
        soundManager.playJumpscareStinger();
        this.callbacks.onParanormalNotification('⚠️ Arwah Mbah Karto BANGKIT karena rahasianya terungkap! Cari pintu keluar!');
      } else {
        this.callbacks.onParanormalNotification(`Jawaban Benar! ${riddle.rewardItemName} ditambahkan ke tas.`);
      }

      return {
        success: true,
        message: `Benar! ${riddle.explanation}`,
        rewardItemName: riddle.rewardItemName,
      };
    } else {
      this.sanity = Math.max(10, this.sanity - 10);
      this.callbacks.onSanityChange(this.sanity);
      soundManager.playGhostWhisper(0, 0);
      return {
        success: false,
        message: 'Salah! Jawaban tidak sesuai dengan catatan arwah. Keberanianmu terguncang (-10%).',
      };
    }
  }

  private finishLevel(victory: boolean) {
    if (victory) {
      const multiplier = this.cameraMode === 'FIRST_PERSON' ? 1.5 : this.cameraMode === 'THIRD_PERSON' ? 1.2 : 1.0;
      const finalScore = Math.round(1500 * multiplier);
      this.callbacks.onLevelComplete(finalScore, 3, this.collectedNotesThisRun);
    }
  }

  private activeScreen = 'TITLE';
  public setScreen(screen: string) {
    this.activeScreen = screen;
  }

  private renderScene() {
    if (this.activeScreen === 'TITLE' || this.activeScreen === 'CHAR_SELECT') {
      const time = this.clock.getElapsedTime();
      const radius = 3.6;
      const camX = this.playerX + Math.sin(time * 0.35) * radius;
      const camZ = this.playerZ + Math.cos(time * 0.35) * radius;
      this.camera.position.set(camX, 1.8 + Math.sin(time * 0.2) * 0.15, camZ);
      this.camera.lookAt(this.playerX, 1.25, this.playerZ);

      this.flashlightSpot.position.set(this.playerX, 1.35, this.playerZ);
      this.flashlightTarget.position.set(this.playerX - Math.sin(time * 0.35) * 4, 1.0, this.playerZ - Math.cos(time * 0.35) * 4);

      this.playerRig.root.rotation.y = time * 0.45;
      this.playerRig.root.visible = true;
      this.playerRig.updateAnimation(time, 0, false, 0);
      this.renderer.render(this.scene, this.camera);
      return;
    }

    const sinRot = Math.sin(this.playerRotY);
    const cosRot = Math.cos(this.playerRotY);

    this.flashlightSpot.position.set(this.playerX, 1.35, this.playerZ);

    if (this.cameraMode === 'FIRST_PERSON') {
      // First person: In front of eyes, hide head mesh to prevent near clipping
      this.playerRig.headPivot.visible = false;
      this.camTargetPos.set(this.playerX - sinRot * 0.22, 1.68, this.playerZ - cosRot * 0.22);
      this.camera.position.lerp(this.camTargetPos, 0.4);

      const lookTarget = this._v1.set(
        this.playerX - sinRot * Math.cos(this.playerPitch) * 10,
        1.68 + Math.sin(this.playerPitch) * 10,
        this.playerZ - cosRot * Math.cos(this.playerPitch) * 10
      );
      this.camera.lookAt(lookTarget);
      this.flashlightTarget.position.copy(lookTarget);
      this.playerRig.root.visible = true;
      this.playerRig.root.rotation.y = this.playerRotY + Math.PI;
    } else if (this.cameraMode === 'THIRD_PERSON') {
      // Third person: Cinematic over-the-right-shoulder chase camera
      this.playerRig.headPivot.visible = true;
      const behindDist = 2.8;
      const shoulderOffset = 0.45;
      const camX = this.playerX + sinRot * behindDist - cosRot * shoulderOffset;
      const camZ = this.playerZ + cosRot * behindDist + sinRot * shoulderOffset;
      const camY = 2.05 + Math.sin(this.playerPitch) * 1.2;
      this.camTargetPos.set(camX, camY, camZ);
      this.camera.position.lerp(this.camTargetPos, 0.25);

      const lookTarget = this._v1.set(
        this.playerX - sinRot * 10,
        1.5 + Math.sin(this.playerPitch) * 8,
        this.playerZ - cosRot * 10
      );
      this.camera.lookAt(lookTarget);
      this.flashlightTarget.position.set(this.playerX - sinRot * 10, 1.2, this.playerZ - cosRot * 10);
      this.playerRig.root.visible = true;
      this.playerRig.root.rotation.y = this.playerRotY + Math.PI;
    } else {
      // Top-Down tactical overview
      this.playerRig.headPivot.visible = true;
      this.camTargetPos.set(this.playerX, 14.0, this.playerZ + 4.0);
      this.camera.position.lerp(this.camTargetPos, 0.15);
      this.camera.lookAt(this.playerX, 0, this.playerZ);
      this.flashlightTarget.position.set(this.playerX - sinRot * 10, 0, this.playerZ - cosRot * 10);
      this.playerRig.root.visible = true;
      this.playerRig.root.rotation.y = this.playerRotY + Math.PI;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private updateHUDAll() {
    this.callbacks.onSanityChange(this.sanity);
    const charDef = CHARACTERS[this.characterId];
    this.callbacks.onStaminaChange(this.stamina);
    this.callbacks.onBatteryChange(this.battery);
    this.callbacks.onInventoryChange([...this.inventory]);
    this.callbacks.onObjectiveUpdate([...this.levelConfig.objectives]);
    this.callbacks.onLivesChange(this.lives);
    this.callbacks.onScoreChange(this.score);
    this.callbacks.onCameraChange(this.cameraMode);
  }

  public getVisitedTiles(): Set<string> {
    return this.visitedGridTiles;
  }

  public getPlayerCoords() {
    return { x: this.playerX, z: this.playerZ, rotY: this.playerRotY };
  }

  public dispose() {
    this.isDisposed = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.renderer.dispose();
  }
}
