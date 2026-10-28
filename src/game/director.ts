import { soundManager } from './audio';

export interface ParanormalEvent {
  type: 'LIGHT_FLICKER' | 'DOOR_SLAM' | 'WHISPER' | 'STATIC';
  message?: string;
  duration: number;
}

export class AIDirector {
  private timeSinceLastEncounter = 0;
  private chaseCooldownTimer = 0;
  private paranormalEventTimer = 0;
  private nextParanormalInterval = 25; // seconds
  private isSafeMode = false;

  constructor(safeMode = false) {
    this.isSafeMode = safeMode;
    this.reset();
  }

  public setSafeMode(safe: boolean) {
    this.isSafeMode = safe;
  }

  public reset() {
    this.timeSinceLastEncounter = 0;
    this.chaseCooldownTimer = 0;
    this.paranormalEventTimer = 0;
    this.nextParanormalInterval = 20 + Math.random() * 20;
  }

  public update(
    delta: number,
    isChasing: boolean,
    distanceToGhost: number
  ): { directGhostToPlayer: boolean; paranormalEvent: ParanormalEvent | null } {
    let directGhostToPlayer = false;
    let paranormalEvent: ParanormalEvent | null = null;

    if (isChasing) {
      this.timeSinceLastEncounter = 0;
      this.chaseCooldownTimer = 35; // 35 seconds cooldown after chase breaks
    } else {
      this.timeSinceLastEncounter += delta;
      if (this.chaseCooldownTimer > 0) {
        this.chaseCooldownTimer -= delta;
      }
    }

    // Adaptive pacing: If player hasn't seen ghost in >60s and cooldown is over, gently steer ghost
    if (this.timeSinceLastEncounter > 55 && this.chaseCooldownTimer <= 0) {
      directGhostToPlayer = true;
    }

    // Paranormal pacing events
    this.paranormalEventTimer += delta;
    if (this.paranormalEventTimer >= this.nextParanormalInterval) {
      this.paranormalEventTimer = 0;
      this.nextParanormalInterval = 25 + Math.random() * 25;

      // Select random spooky event
      const roll = Math.random();
      if (roll < 0.35) {
        paranormalEvent = {
          type: 'LIGHT_FLICKER',
          message: 'Lampu berkedip aneh...',
          duration: 1.5,
        };
      } else if (roll < 0.65) {
        soundManager.playDoorSlam();
        paranormalEvent = {
          type: 'DOOR_SLAM',
          message: 'Terdengar debuman pintu di kejauhan!',
          duration: 2.0,
        };
      } else {
        soundManager.playNoniWhisper(2, 2);
        paranormalEvent = {
          type: 'WHISPER',
          message: 'Bisikan dingin memanggil namamu...',
          duration: 2.5,
        };
      }
    }

    return { directGhostToPlayer, paranormalEvent };
  }

  public canTriggerJumpscare(): boolean {
    return !this.isSafeMode;
  }
}
