/**
 * Procedural Web Audio API Sound Engine
 * Zero external audio files: all ambience, music layers, 3D spatial ghost cues,
 * footsteps, and stingers are synthesized procedurally in real-time.
 */

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Music layers
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private droneGain: GainNode | null = null;

  private tensionGain: GainNode | null = null;
  private chaseGain: GainNode | null = null;
  private chaseIntervalId: number | null = null;

  // Heartbeat state
  private heartbeatIntervalId: number | null = null;
  private currentBpm = 60;

  // Sound settings
  private masterVolume = 0.8;
  private musicVolume = 0.7;
  private sfxVolume = 0.85;

  private isMuted = false;

  constructor() {
    // Initialized on first user gesture
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.startAmbientDrone();
    } catch (err) {
      console.warn('AudioContext gagal diinisialisasi:', err);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolumes(master: number, music: number, sfx: number) {
    this.masterVolume = master;
    this.musicVolume = music;
    this.sfxVolume = sfx;

    if (this.ctx && this.masterGain && this.musicGain && this.sfxGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : master, now, 0.05);
      this.musicGain.gain.setTargetAtTime(music, now, 0.05);
      this.sfxGain.gain.setTargetAtTime(sfx, now, 0.05);
    }
  }

  // --- Dynamic 3-Layer Ambience & Music ---
  private startAmbientDrone() {
    if (!this.ctx || !this.musicGain) return;

    // Layer 1: Eerie Sub-Bass Ambient Drone
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    this.droneGain.connect(this.musicGain);

    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(140, this.ctx.currentTime);
    this.droneFilter.connect(this.droneGain);

    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note
    this.droneOsc1.connect(this.droneFilter);
    this.droneOsc1.start();

    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.setValueAtTime(58.27, this.ctx.currentTime); // Dissonant minor second
    this.droneOsc2.connect(this.droneFilter);
    this.droneOsc2.start();

    // Layer 2: Tension Pulse
    this.tensionGain = this.ctx.createGain();
    this.tensionGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.tensionGain.connect(this.musicGain);

    // Layer 3: Chase Rhythm
    this.chaseGain = this.ctx.createGain();
    this.chaseGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.chaseGain.connect(this.musicGain);
  }

  public setThreatLevel(level: 'CALM' | 'TENSE' | 'CHASE') {
    if (!this.ctx || !this.droneGain || !this.tensionGain || !this.chaseGain) return;
    const now = this.ctx.currentTime;

    if (level === 'CALM') {
      this.droneGain.gain.setTargetAtTime(0.18, now, 0.8);
      this.tensionGain.gain.setTargetAtTime(0.0, now, 0.5);
      this.chaseGain.gain.setTargetAtTime(0.0, now, 0.5);
      this.stopChaseBeats();
    } else if (level === 'TENSE') {
      this.droneGain.gain.setTargetAtTime(0.25, now, 0.4);
      this.tensionGain.gain.setTargetAtTime(0.35, now, 0.4);
      this.chaseGain.gain.setTargetAtTime(0.0, now, 0.4);
      this.stopChaseBeats();
    } else if (level === 'CHASE') {
      this.droneGain.gain.setTargetAtTime(0.35, now, 0.2);
      this.tensionGain.gain.setTargetAtTime(0.4, now, 0.2);
      this.chaseGain.gain.setTargetAtTime(0.6, now, 0.2);
      this.startChaseBeats();
    }
  }

  private startChaseBeats() {
    if (this.chaseIntervalId !== null) return;
    this.chaseIntervalId = window.setInterval(() => {
      this.playChasePercussion();
    }, 280);
  }

  private stopChaseBeats() {
    if (this.chaseIntervalId !== null) {
      clearInterval(this.chaseIntervalId);
      this.chaseIntervalId = null;
    }
  }

  private playChasePercussion() {
    if (!this.ctx || !this.chaseGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.chaseGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // --- 3D Spatial Panner Helpers ---
  private createPanner(x: number, y: number, z: number): PannerNode | null {
    if (!this.ctx) return null;
    try {
      const panner = this.ctx.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = 2.0;
      panner.maxDistance = 25.0;
      panner.rolloffFactor = 1.2;
      panner.positionX.setValueAtTime(x, this.ctx.currentTime);
      panner.positionY.setValueAtTime(y, this.ctx.currentTime);
      panner.positionZ.setValueAtTime(z, this.ctx.currentTime);
      return panner;
    } catch {
      return null;
    }
  }

  public updateListenerPosition(x: number, y: number, z: number, forwardX: number, forwardZ: number) {
    if (!this.ctx) return;
    const listener = this.ctx.listener;
    const now = this.ctx.currentTime;
    try {
      if (listener.positionX) {
        listener.positionX.setTargetAtTime(x, now, 0.05);
        listener.positionY.setTargetAtTime(y, now, 0.05);
        listener.positionZ.setTargetAtTime(z, now, 0.05);
        listener.forwardX.setTargetAtTime(forwardX, now, 0.05);
        listener.forwardY.setTargetAtTime(0, now, 0.05);
        listener.forwardZ.setTargetAtTime(forwardZ, now, 0.05);
        listener.upX.setTargetAtTime(0, now, 0.05);
        listener.upY.setTargetAtTime(1, now, 0.05);
        listener.upZ.setTargetAtTime(0, now, 0.05);
      }
    } catch {
      // Ignored if browser implementation is different
    }
  }

  // --- Ghost Specific SFX ---
  public playPocongHop(relX = 0, relZ = 0) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const panner = this.createPanner(relX, 0, relZ);

    // Deep hollow "tok..." thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);

    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    if (panner) {
      gain.connect(panner);
      panner.connect(this.sfxGain);
    } else {
      gain.connect(this.sfxGain);
    }

    osc.start(now);
    osc.stop(now + 0.28);
  }

  public playNoniWhisper(relX = 0, relZ = 0) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const panner = this.createPanner(relX, 0, relZ);

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(320, now + 0.8);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.Q.setValueAtTime(4.0, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc.connect(filter);
    filter.connect(gain);

    if (panner) {
      gain.connect(panner);
      panner.connect(this.sfxGain);
    } else {
      gain.connect(this.sfxGain);
    }

    osc.start(now);
    osc.stop(now + 1.0);
  }

  public playGhostWhisper(relX = 0, relZ = 0) {
    this.playNoniWhisper(relX, relZ);
  }

  /**
   * Authentic Indonesian female ghost laugh ("hi... hi... hi... hihihihihihi!")
   * Synthesizes staccato vocal formants with rising-falling pitch and eerie vibrato.
   */
  public playKuntilanakLaugh(relX = 0, relZ = 0, volume = 0.85) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const panner = this.createPanner(relX, 0, relZ);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1450, now);
    filter.Q.setValueAtTime(4.2, now);

    const masterGhostGain = this.ctx.createGain();
    masterGhostGain.gain.setValueAtTime(volume * 0.75, now);

    if (panner) {
      filter.connect(masterGhostGain);
      masterGhostGain.connect(panner);
      panner.connect(this.sfxGain);
    } else {
      filter.connect(masterGhostGain);
      masterGhostGain.connect(this.sfxGain);
    }

    const pulses: { time: number; dur: number; freq: number; gain: number }[] = [
      { time: 0.00, dur: 0.18, freq: 880, gain: 0.55 },
      { time: 0.25, dur: 0.18, freq: 960, gain: 0.65 },
      { time: 0.50, dur: 0.20, freq: 1040, gain: 0.75 },
      { time: 0.74, dur: 0.11, freq: 1180, gain: 0.85 },
      { time: 0.86, dur: 0.10, freq: 1120, gain: 0.90 },
      { time: 0.97, dur: 0.10, freq: 1220, gain: 0.92 },
      { time: 1.08, dur: 0.10, freq: 1160, gain: 0.90 },
      { time: 1.19, dur: 0.09, freq: 1260, gain: 0.95 },
      { time: 1.29, dur: 0.09, freq: 1200, gain: 0.90 },
      { time: 1.39, dur: 0.10, freq: 1240, gain: 0.85 },
      { time: 1.50, dur: 0.12, freq: 1140, gain: 0.80 },
      { time: 1.64, dur: 0.15, freq: 1020, gain: 0.70 },
      { time: 1.81, dur: 0.22, freq: 900, gain: 0.55 },
      { time: 2.05, dur: 0.35, freq: 760, gain: 0.40 },
    ];

    for (const p of pulses) {
      const osc = this.ctx.createOscillator();
      const sylGain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const t = now + p.time;
      osc.frequency.setValueAtTime(p.freq, t);
      osc.frequency.exponentialRampToValueAtTime(p.freq * 0.92, t + p.dur);

      const vibrato = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();
      vibrato.frequency.setValueAtTime(14, t);
      vibratoGain.gain.setValueAtTime(30, t);
      vibrato.connect(osc.frequency);
      vibrato.start(t);
      vibrato.stop(t + p.dur);

      sylGain.gain.setValueAtTime(0.001, t);
      sylGain.gain.linearRampToValueAtTime(p.gain, t + p.dur * 0.25);
      sylGain.gain.exponentialRampToValueAtTime(0.001, t + p.dur);

      osc.connect(sylGain);
      sylGain.connect(filter);

      osc.start(t);
      osc.stop(t + p.dur + 0.02);
    }
  }

  public playGhostMoan(relX = 0, relZ = 0) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const panner = this.createPanner(relX, 0, relZ);

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(160, now + 1.0);
    osc.frequency.exponentialRampToValueAtTime(105, now + 1.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);
    filter.Q.setValueAtTime(3.0, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    osc.connect(filter);
    filter.connect(gain);
    if (panner) {
      gain.connect(panner);
      panner.connect(this.sfxGain);
    } else {
      gain.connect(this.sfxGain);
    }

    osc.start(now);
    osc.stop(now + 1.9);
  }

  public playGhostFrenzyScream() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(520, now);
    osc1.frequency.exponentialRampToValueAtTime(1350, now + 0.25);
    osc1.frequency.exponentialRampToValueAtTime(680, now + 1.1);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(560, now);
    osc2.frequency.exponentialRampToValueAtTime(1420, now + 0.25);
    osc2.frequency.exponentialRampToValueAtTime(710, now + 1.1);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(2.5, now);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.15);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.2);
    osc2.stop(now + 1.2);
  }

  public playSparksBuzz() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80 + Math.random() * 80, now);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playStruggleHit() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.16);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playSusterCrawl(relX = 0, relZ = 0) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const panner = this.createPanner(relX, 0, relZ);

    // Wet dragging scrape "sret... sret..."
    const bufferSize = this.ctx.sampleRate * 0.35;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.Q.setValueAtTime(3.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    whiteNoise.connect(filter);
    filter.connect(gain);

    if (panner) {
      gain.connect(panner);
      panner.connect(this.sfxGain);
    } else {
      gain.connect(this.sfxGain);
    }

    whiteNoise.start(now);
  }

  // --- Player & Environment SFX ---
  public playFootstep(surface: 'WOOD' | 'MARBLE' | 'TILE' = 'WOOD', isRun = false) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (surface === 'WOOD') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);
    } else if (surface === 'MARBLE') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
    }

    const vol = isRun ? 0.3 : 0.15;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playDoorCreak(isClosing = false) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    if (isClosing) {
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.35);
    } else {
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(270, now + 0.35);
      osc.frequency.linearRampToValueAtTime(180, now + 0.65);
    }

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isClosing ? 0.45 : 0.7));

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + (isClosing ? 0.48 : 0.72));

    // If closing, add a solid heavy wooden door latch click & frame thud
    if (isClosing) {
      const thudOsc = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(95, now + 0.35);
      thudOsc.frequency.exponentialRampToValueAtTime(28, now + 0.52);

      thudGain.gain.setValueAtTime(0.5, now + 0.35);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      thudOsc.connect(thudGain);
      thudGain.connect(this.sfxGain);

      thudOsc.start(now + 0.35);
      thudOsc.stop(now + 0.56);
    }
  }

  public playDoorSlam() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  public playFlashlightClick() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.setValueAtTime(1200, now + 0.02);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playBottleBreak(relX = 0, relZ = 0) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const panner = this.createPanner(relX, 0, relZ);

    // High crash noise + resonant shards
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    if (panner) {
      gain.connect(panner);
      panner.connect(this.sfxGain);
    } else {
      gain.connect(this.sfxGain);
    }

    osc.start(now);
    osc.stop(now + 0.4);
  }

  public playPianoNote(note: string) {
    if (!this.ctx || !this.sfxGain) return;
    const freqs: Record<string, number> = {
      C4: 261.63,
      D4: 293.66,
      E4: 329.63,
      F4: 349.23,
      G4: 392.00,
      A4: 440.00,
      B4: 493.88,
      C5: 523.25,
    };
    const freq = freqs[note] || 440;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 1.25);
  }

  public playItemPickup() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  public playJumpscareStinger() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Discordant chord + harsh burst
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(80, now);
    osc1.frequency.exponentialRampToValueAtTime(800, now + 0.1);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(85, now);
    osc2.frequency.exponentialRampToValueAtTime(850, now + 0.1);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.85);
    osc2.stop(now + 0.85);
  }

  public playClockTick() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playGongBell() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const freqs = [174, 220, 261.6, 330];
    for (const f of freqs) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 3.2);
    }
  }

  public playSpiritVoice() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.8);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.85);
  }

  public updateHeartbeat(sanity: number) {
    if (!this.ctx || !this.sfxGain) return;

    if (sanity > 40) {
      if (this.heartbeatIntervalId !== null) {
        clearInterval(this.heartbeatIntervalId);
        this.heartbeatIntervalId = null;
      }
      return;
    }

    // BPM ranges from 70 at sanity 40 down to 140 at sanity 0
    const targetBpm = Math.round(70 + (40 - sanity) * 1.75);
    if (this.heartbeatIntervalId === null || Math.abs(this.currentBpm - targetBpm) > 10) {
      if (this.heartbeatIntervalId !== null) {
        clearInterval(this.heartbeatIntervalId);
      }
      this.currentBpm = targetBpm;
      const intervalMs = Math.round(60000 / targetBpm);

      this.heartbeatIntervalId = window.setInterval(() => {
        this.playSingleHeartbeat();
      }, intervalMs);
    }
  }

  private playSingleHeartbeat() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Thump 1
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(65, now);
    osc1.frequency.exponentialRampToValueAtTime(30, now + 0.1);
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(now);
    osc1.stop(now + 0.13);

    // Thump 2
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(55, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(25, now + 0.25);
    gain2.gain.setValueAtTime(0.3, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.27);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.28);
  }

  public dispose() {
    this.stopChaseBeats();
    if (this.heartbeatIntervalId !== null) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
    if (this.droneOsc1) {
      try { this.droneOsc1.stop(); } catch {}
    }
    if (this.droneOsc2) {
      try { this.droneOsc2.stop(); } catch {}
    }
    if (this.ctx) {
      try { this.ctx.close(); } catch {}
    }
  }
}

export const soundManager = new AudioEngine();
