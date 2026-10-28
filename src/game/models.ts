import * as THREE from 'three';
import { CharacterId } from './types';

// Pre-cached procedural textures
const textureCache: Record<string, THREE.CanvasTexture> = {};

export function getProceduralTexture(
  type: 'WOOD_FLOOR' | 'WALL_WOOD' | 'WALL_COLONIAL' | 'TILES_DIRTY' | 'BLOOD' | 'PORTRAIT' | 'BATIK' | 'CARVED_JATI' | 'PANDAN' | 'CLOCK_FACE'
): THREE.CanvasTexture {
  if (textureCache[type]) return textureCache[type];

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  if (type === 'WOOD_FLOOR') {
    // Rich aged Indonesian teak wood floorboards
    ctx.fillStyle = '#3a2517';
    ctx.fillRect(0, 0, 512, 512);

    const plankHeight = 64;
    for (let y = 0; y < 512; y += plankHeight) {
      const plankShade = Math.sin(y * 12.3) * 15;
      const r = Math.min(255, Math.max(0, 68 + plankShade));
      const g = Math.min(255, Math.max(0, 44 + plankShade * 0.7));
      const b = Math.min(255, Math.max(0, 28 + plankShade * 0.5));
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(0, y, 512, plankHeight - 3);

      ctx.fillStyle = '#180e07';
      ctx.fillRect(0, y + plankHeight - 3, 512, 3);

      ctx.fillStyle = '#15100c';
      for (let x = 32; x < 512; x += 128) {
        ctx.beginPath();
        ctx.arc(x, y + 8, 3, 0, Math.PI * 2);
        ctx.arc(x, y + plankHeight - 10, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.strokeStyle = 'rgba(28, 16, 10, 0.45)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 80; i++) {
      ctx.beginPath();
      const startY = Math.random() * 512;
      ctx.moveTo(0, startY);
      ctx.bezierCurveTo(150, startY + (Math.random() - 0.5) * 20, 350, startY + (Math.random() - 0.5) * 20, 512, startY);
      ctx.stroke();
    }
  } else if (type === 'WALL_WOOD') {
    // Vertical Indonesian timber slats with wall framing
    ctx.fillStyle = '#422c1d';
    ctx.fillRect(0, 0, 512, 512);

    const slatWidth = 32;
    for (let x = 0; x < 512; x += slatWidth) {
      const shade = Math.sin(x * 7.5) * 12;
      ctx.fillStyle = `rgb(${72 + shade}, ${48 + shade * 0.7}, ${32 + shade * 0.5})`;
      ctx.fillRect(x, 0, slatWidth - 2, 512);

      ctx.fillStyle = '#1a1008';
      ctx.fillRect(x + slatWidth - 2, 0, 2, 512);
    }

    ctx.fillStyle = '#2d1c11';
    ctx.fillRect(0, 240, 512, 32);
    ctx.fillStyle = '#160c06';
    ctx.fillRect(0, 238, 512, 2);
    ctx.fillRect(0, 272, 512, 2);
  } else if (type === 'CARVED_JATI') {
    // Intricate Jepara floral carved teak relief pattern
    ctx.fillStyle = '#4a2c16';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#6e4425';
    ctx.lineWidth = 3;
    for (let x = 64; x < 512; x += 128) {
      for (let y = 64; y < 512; y += 128) {
        // Lotus & vine relief
        ctx.beginPath();
        ctx.arc(x, y, 36, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#2d180a';
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#82542e';
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  } else if (type === 'WALL_COLONIAL') {
    // Dutch colonial plaster with moisture stains and peeling paint
    ctx.fillStyle = '#343f4a';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#485766';
    ctx.lineWidth = 2.5;
    for (let x = 32; x < 512; x += 64) {
      for (let y = 32; y < 512; y += 64) {
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeRect(x - 20, y - 20, 40, 40);
      }
    }

    ctx.fillStyle = 'rgba(20, 28, 35, 0.5)';
    for (let k = 0; k < 18; k++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, 20 + Math.random() * 40, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'TILES_DIRTY') {
    // Hospital green-gray cracked tile grid
    ctx.fillStyle = '#283832';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#121c17';
    ctx.lineWidth = 4;
    for (let i = 0; i <= 512; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0); ctx.lineTo(i, 512);
      ctx.moveTo(0, i); ctx.lineTo(512, i);
      ctx.stroke();
    }

    ctx.strokeStyle = '#0a100d';
    ctx.lineWidth = 2;
    for (let c = 0; c < 15; c++) {
      ctx.beginPath();
      const cx = Math.random() * 512;
      const cy = Math.random() * 512;
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 25, cy + 18);
      ctx.lineTo(cx + 40, cy + 10);
      ctx.stroke();
    }
  } else if (type === 'PORTRAIT') {
    // Spooky antique sepia framed portrait of Juragan Wirawan
    ctx.fillStyle = '#3a2512';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#6b4f35';
    ctx.fillRect(40, 40, 432, 432);
    ctx.fillStyle = '#1c130b';
    ctx.fillRect(56, 56, 400, 400);

    ctx.fillStyle = '#453322';
    ctx.beginPath();
    ctx.arc(256, 190, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(156, 270, 200, 180);

    ctx.fillStyle = '#221508';
    ctx.beginPath();
    ctx.arc(256, 170, 75, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(235, 185, 3.5, 0, Math.PI * 2);
    ctx.arc(277, 185, 3.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'BATIK') {
    // Traditional Javanese Batik Parang Barong pattern
    ctx.fillStyle = '#452614';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#d4a373';
    ctx.lineWidth = 6;
    for (let offset = -512; offset < 1024; offset += 48) {
      ctx.beginPath();
      ctx.moveTo(offset, 0);
      ctx.lineTo(offset + 512, 512);
      ctx.stroke();

      ctx.strokeStyle = '#faedcd';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(offset + 12, 0);
      ctx.lineTo(offset + 524, 512);
      ctx.stroke();
      ctx.strokeStyle = '#d4a373';
      ctx.lineWidth = 6;
    }
  } else if (type === 'PANDAN') {
    // Woven natural pandan grass mat texture
    ctx.fillStyle = '#6b705c';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#a5a58d';
    ctx.lineWidth = 3;
    for (let i = 0; i < 512; i += 16) {
      ctx.beginPath();
      ctx.moveTo(i, 0); ctx.lineTo(i, 512);
      ctx.moveTo(0, i); ctx.lineTo(512, i);
      ctx.stroke();
    }
  } else if (type === 'CLOCK_FACE') {
    // Antique Grandfather clock Roman numerals face
    ctx.fillStyle = '#fefae0';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#283618';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(256, 256, 220, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#283618';
    ctx.font = 'bold 36px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6 - Math.PI / 2;
      const x = 256 + Math.cos(angle) * 170;
      const y = 256 + Math.sin(angle) * 170;
      ctx.fillText(numerals[i], x, y);
    }
  } else {
    // Blood splatter
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.clearRect(0, 0, 512, 512);
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.arc(256, 256, 80, 0, Math.PI * 2);
    ctx.fill();
    for (let b = 0; b < 24; b++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 140;
      ctx.beginPath();
      ctx.arc(256 + Math.cos(angle) * dist, 256 + Math.sin(angle) * dist, 6 + Math.random() * 16, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache[type] = texture;
  return texture;
}

/**
 * Creates Anatomically Realistic Human Character 3D Model
 * Fully articulated with human anatomy: sculpted head, facial features (eyes, nose, mouth, ears),
 * realistic hair & character accessories, sculpted neck, layered realistic clothing (collars, pockets, straps, belts),
 * hands with distinct fingers, pants with cargo pockets & articulated knees, and realistic trekking/service boots.
 * Equipped with real-time breathing & locomotion gait animations.
 */
export function createPlayerModel(charId: CharacterId = 'raka') {
  const root = new THREE.Group();
  root.name = `player_${charId}`;

  // Human Skin tones
  const skinColor = charId === 'raka' ? 0xc89670 : charId === 'sari' ? 0xdfab88 : charId === 'joko' ? 0xb88258 : 0xd39d78;
  const skinMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.65,
    metalness: 0.05,
  });

  // Clothing & gear materials
  let jacketColor = 0x1e3a8a; // Raka: Navy outdoor windbreaker
  let pantsColor = 0x374151;  // Charcoal cargo pants
  let shoeColor = 0x1f2937;   // Dark trekking boots
  let hairColor = 0x1c1917;   // Dark brown/black hair

  if (charId === 'sari') {
    jacketColor = 0x059669; // Emerald green medical scrubs
    pantsColor = 0x047857;  // Matching scrubs trousers
    shoeColor = 0xf3f4f6;   // Clean white medical footwear
  } else if (charId === 'joko') {
    jacketColor = 0x1e293b; // Indonesian Satpam dark navy uniform
    pantsColor = 0x0f172a;  // Satpam dark trousers
    shoeColor = 0x09090b;   // Polished black combat patrol boots
  } else if (charId === 'dewi') {
    jacketColor = 0x6b21a8; // Royal purple modern kebaya
    pantsColor = 0x4c1d95;  // Purple batik skirt trousers
    shoeColor = 0x2e1065;   // Traditional patterned selop
    hairColor = 0x09090b;   // Jet black silky hair
  }

  const clothMat = new THREE.MeshStandardMaterial({ color: jacketColor, roughness: 0.75, metalness: 0.08 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.82, metalness: 0.05 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: shoeColor, roughness: 0.45, metalness: 0.2 });
  const beltMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5, metalness: 0.6 });
  const buckleMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.85 });
  const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.85 });
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xfafafa });
  const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.25, metalness: 0.85 });
  const lensMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  // Main Root Anchor & Pelvis
  const pelvisGroup = new THREE.Group();
  pelvisGroup.position.y = 0.95;
  root.add(pelvisGroup);

  // Anatomical Pelvis & Belt
  const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.22, 12), pantsMat);
  pelvis.castShadow = true;
  pelvisGroup.add(pelvis);

  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.06, 12), beltMat);
  belt.position.y = 0.11;
  pelvisGroup.add(belt);

  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.03), buckleMat);
  buckle.position.set(0, 0.11, 0.25);
  pelvisGroup.add(buckle);

  // Upper Torso / Ribcage (Flexible spine joint)
  const chestGroup = new THREE.Group();
  chestGroup.position.set(0, 0.18, 0);
  pelvisGroup.add(chestGroup);

  // Tapered anatomical chest (Chest wider at top, narrower at waist)
  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.52, 12), clothMat);
  chest.position.y = 0.26;
  chest.scale.set(1.05, 1.0, 0.72);
  chest.castShadow = true;
  chestGroup.add(chest);

  // Front Zipper / Button placket seam
  const zipperSeam = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.48, 0.02), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 }));
  zipperSeam.position.set(0, 0.26, 0.21);
  chestGroup.add(zipperSeam);

  // Dual Chest Pockets
  for (const px of [-0.14, 0.14]) {
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.03), clothMat);
    pocket.position.set(px, 0.32, 0.20);
    chestGroup.add(pocket);
  }

  // Backpack / Utility Sling Straps across shoulders
  const strapMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
  const strapL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.44, 0.02), strapMat);
  strapL.position.set(-0.16, 0.26, 0.19);
  const strapR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.44, 0.02), strapMat);
  strapR.position.set(0.16, 0.26, 0.19);
  chestGroup.add(strapL, strapR);

  // Tactical Small Backpack on back
  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.15), strapMat);
  backpack.position.set(0, 0.26, -0.25);
  backpack.castShadow = true;
  chestGroup.add(backpack);

  // Character-Specific Chest Accessories
  if (charId === 'sari') {
    // Medical Stethoscope draped over neck
    const stethMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.2, metalness: 0.9 });
    const stethRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.015, 8, 16), stethMat);
    stethRing.position.set(0, 0.46, 0.12);
    stethRing.rotation.x = Math.PI / 4;
    chestGroup.add(stethRing);

    const stethHead = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.015, 10), stethMat);
    stethHead.position.set(0.08, 0.28, 0.22);
    chestGroup.add(stethHead);
  } else if (charId === 'joko') {
    // Satpam Security Badge & Rank Epaulets
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.015), buckleMat);
    badge.position.set(-0.14, 0.38, 0.21);
    chestGroup.add(badge);

    for (const ex of [-0.26, 0.26]) {
      const epaulet = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.08), beltMat);
      epaulet.position.set(ex, 0.52, 0);
      chestGroup.add(epaulet);
    }
  } else if (charId === 'dewi') {
    // Traditional Batik Selendang draped diagonally
    const sashMat = new THREE.MeshStandardMaterial({ map: getProceduralTexture('BATIK'), roughness: 0.9 });
    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.60, 0.03), sashMat);
    sash.position.set(0.05, 0.24, 0.20);
    sash.rotation.z = -Math.PI / 8;
    chestGroup.add(sash);
  }

  // Contoured Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.16, 10), skinMat);
  neck.position.y = 0.56;
  chestGroup.add(neck);

  // Sculpted Collar
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.03, 8, 14), clothMat);
  collar.position.set(0, 0.52, 0.02);
  collar.rotation.x = Math.PI / 2.2;
  chestGroup.add(collar);

  // Head Pivot (Allows realistic nod, turn & pitch)
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 0.64, 0.02);
  chestGroup.add(headPivot);

  // Anatomical Head (Cranial oval with contoured jaw & chin)
  const headGeom = new THREE.SphereGeometry(0.17, 16, 14);
  headGeom.scale(1.0, 1.25, 1.05);
  const headMesh = new THREE.Mesh(headGeom, skinMat);
  headMesh.castShadow = true;
  headPivot.add(headMesh);

  // Sculpted Jawline & Chin
  const chin = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.16, 10), skinMat);
  chin.position.set(0, -0.10, 0.05);
  chin.rotation.x = -Math.PI / 4;
  headPivot.add(chin);

  // 3D Sculpted Facial Features:
  // 1. Nose Bridge and Tip
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 6), skinMat);
  nose.position.set(0, 0.02, 0.185);
  nose.rotation.x = Math.PI / 2.5;
  headPivot.add(nose);

  // 2. Realistic Eyes (White sclera + pupils)
  for (const ex of [-0.055, 0.055]) {
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), eyeWhiteMat);
    eyeWhite.scale.set(1.1, 0.7, 0.5);
    eyeWhite.position.set(ex, 0.055, 0.165);
    headPivot.add(eyeWhite);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.013, 6, 6), eyePupilMat);
    pupil.position.set(ex, 0.055, 0.182);
    headPivot.add(pupil);

    // Eyebrows
    const eyebrow = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.012, 0.015), hairMat);
    eyebrow.position.set(ex, 0.09, 0.175);
    eyebrow.rotation.z = ex > 0 ? -0.1 : 0.1;
    headPivot.add(eyebrow);
  }

  // 3. Lips / Mouth Seam
  const lipMat = new THREE.MeshStandardMaterial({ color: charId === 'sari' || charId === 'dewi' ? 0xb96860 : 0x9f5b4c, roughness: 0.6 });
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.018, 0.02), lipMat);
  mouth.position.set(0, -0.065, 0.17);
  headPivot.add(mouth);

  // 4. Ears on both sides
  for (const earSide of [-0.175, 0.175]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), skinMat);
    ear.scale.set(0.4, 1.2, 0.7);
    ear.position.set(earSide, 0.03, -0.02);
    headPivot.add(ear);
  }

  // Character-Specific Realistic Hairstyle & Headwear
  if (charId === 'joko') {
    // Official Satpam Peaked Service Cap
    const capCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.18, 0.11, 14), clothMat);
    capCrown.position.set(0, 0.14, -0.01);
    headPivot.add(capCrown);

    const capVisor = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 0.14), shoeMat);
    capVisor.position.set(0, 0.10, 0.15);
    capVisor.rotation.x = 0.2;
    headPivot.add(capVisor);

    // Gold Guard Emblem Shield
    const emblem = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.06, 6), buckleMat);
    emblem.position.set(0, 0.16, 0.18);
    emblem.rotation.x = Math.PI;
    headPivot.add(emblem);

    // Pak Joko's Distinguished Mustache
    const stache = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.025, 0.02), hairMat);
    stache.position.set(0, -0.04, 0.18);
    headPivot.add(stache);
  } else if (charId === 'sari') {
    // Sari's Nurse Hair Bun + Headband Clip
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.185, 14, 12), hairMat);
    hairCap.position.set(0, 0.04, -0.02);
    headPivot.add(hairCap);

    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), hairMat);
    bun.position.set(0, 0.12, -0.18);
    headPivot.add(bun);

    // Medical Hair Clip
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.02), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
    clip.position.set(0, 0.13, 0.12);
    headPivot.add(clip);
  } else if (charId === 'dewi') {
    // Dewi's Long Flowing Hair + Traditional Bando
    const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 12), hairMat);
    hairTop.position.set(0, 0.04, -0.02);
    headPivot.add(hairTop);

    // Long flowing hair locks down past shoulders
    for (const hx of [-0.12, 0.12]) {
      const lock = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.03, 0.48, 8), hairMat);
      lock.position.set(hx, -0.15, 0.02);
      headPivot.add(lock);
    }
    const backLock = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.42, 0.06), hairMat);
    backLock.position.set(0, -0.16, -0.14);
    headPivot.add(backLock);

    // Traditional Batik Bando
    const bando = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.02, 8, 14), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 }));
    bando.position.set(0, 0.10, 0.02);
    bando.rotation.x = Math.PI / 3;
    headPivot.add(bando);
  } else {
    // Raka's Layered Athletic Short Hair
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.185, 14, 12), hairMat);
    hairCap.position.set(0, 0.05, -0.01);
    headPivot.add(hairCap);

    // Fringe locks
    const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.06), hairMat);
    fringe.position.set(0, 0.14, 0.14);
    fringe.rotation.x = -0.3;
    headPivot.add(fringe);
  }

  // Left Arm (Anatomical Shoulder -> Bicep -> Elbow -> Forearm -> Detailed Hand with Fingers)
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.34, 0.42, 0);
  chestGroup.add(leftArmPivot);

  const leftShoulderCap = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), clothMat);
  leftArmPivot.add(leftShoulderCap);

  const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.32, 8), clothMat);
  leftUpperArm.position.y = -0.16;
  leftArmPivot.add(leftUpperArm);

  const leftForearmPivot = new THREE.Group();
  leftForearmPivot.position.set(0, -0.32, 0);
  leftArmPivot.add(leftForearmPivot);

  const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.052, 0.30, 8), skinMat);
  leftForearm.position.y = -0.15;
  leftForearmPivot.add(leftForearm);

  // Digital Sports Watch / Bracelet on left wrist
  const watch = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.03, 10), new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.8 }));
  watch.position.y = -0.28;
  leftForearmPivot.add(watch);

  // Detailed Hand with Palm & Articulated Fingers
  const leftHand = new THREE.Group();
  leftHand.position.set(0, -0.32, 0);
  leftForearmPivot.add(leftHand);

  const leftPalm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.04), skinMat);
  leftHand.add(leftPalm);

  // Thumb
  const leftThumb = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.012, 0.05, 6), skinMat);
  leftThumb.position.set(0.045, -0.01, 0.02);
  leftThumb.rotation.z = -0.4;
  leftHand.add(leftThumb);

  // 4 Fingers
  for (let f = 0; f < 4; f++) {
    const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.010, 0.06, 6), skinMat);
    finger.position.set(-0.03 + f * 0.02, -0.065, 0);
    leftHand.add(finger);
  }

  // Right Arm (Raised forward holding tactical Flashlight)
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.34, 0.42, 0);
  chestGroup.add(rightArmPivot);

  const rightShoulderCap = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), clothMat);
  rightArmPivot.add(rightShoulderCap);

  const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.32, 8), clothMat);
  rightUpperArm.position.y = -0.16;
  rightArmPivot.add(rightUpperArm);

  const rightForearmPivot = new THREE.Group();
  rightForearmPivot.position.set(0, -0.32, 0);
  rightArmPivot.add(rightForearmPivot);

  const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.052, 0.30, 8), skinMat);
  rightForearm.position.y = -0.15;
  rightForearmPivot.add(rightForearm);

  // Right Hand gripping Flashlight firmly
  const rightHand = new THREE.Group();
  rightHand.position.set(0, -0.32, 0);
  rightForearmPivot.add(rightHand);

  const rightPalm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.04), skinMat);
  rightHand.add(rightPalm);

  // Thumb wrapping handle
  const rightThumb = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.012, 0.05, 6), skinMat);
  rightThumb.position.set(-0.045, -0.01, 0.02);
  rightThumb.rotation.z = 0.4;
  rightHand.add(rightThumb);

  // Fingers curled around flashlight
  for (let f = 0; f < 4; f++) {
    const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.011, 0.05, 6), skinMat);
    finger.position.set(-0.03 + f * 0.02, -0.05, 0.02);
    finger.rotation.x = Math.PI / 2.5;
    rightHand.add(finger);
  }

  // High-Grade Tactical Metal Flashlight (Senter Taktikal)
  const flashGroup = new THREE.Group();
  flashGroup.position.set(0, -0.04, 0.08);
  flashGroup.rotation.x = Math.PI / 2;
  rightHand.add(flashGroup);

  const flashBody = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.28, 12), metalMat);
  flashGroup.add(flashBody);

  // Knurled Rubber Grip Ring
  const gripRing = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.12, 12), beltMat);
  gripRing.position.y = -0.02;
  flashGroup.add(gripRing);

  // Beveled Head & Reflector Lens
  const flashHead = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.042, 0.09, 12), metalMat);
  flashHead.position.y = 0.14;
  flashGroup.add(flashHead);

  const flashLens = new THREE.Mesh(new THREE.CircleGeometry(0.06, 12), lensMat);
  flashLens.position.y = 0.186;
  flashLens.rotation.x = -Math.PI / 2;
  flashGroup.add(flashLens);

  // Default Forward Aim Posture for Flashlight Arm
  rightArmPivot.rotation.x = -Math.PI / 3.8;
  rightArmPivot.rotation.y = -Math.PI / 18;
  rightForearmPivot.rotation.x = -Math.PI / 5;

  // Anatomical Legs: Pelvis -> Hip Joint -> Thigh with Cargo Pocket -> Knee Cap -> Shin -> Ankle -> Laced Boots
  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.13, 0, 0);
  pelvisGroup.add(leftLegPivot);

  const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.085, 0.46, 10), pantsMat);
  leftThigh.position.y = -0.23;
  leftThigh.castShadow = true;
  leftLegPivot.add(leftThigh);

  // Cargo Side Pocket on thigh
  const leftPocket = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.12), pantsMat);
  leftPocket.position.set(-0.10, -0.22, 0);
  leftLegPivot.add(leftPocket);

  const leftShinPivot = new THREE.Group();
  leftShinPivot.position.set(0, -0.46, 0);
  leftLegPivot.add(leftShinPivot);

  // Articulated Knee Cap
  const leftKnee = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), pantsMat);
  leftShinPivot.add(leftKnee);

  const leftShin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.40, 10), pantsMat);
  leftShin.position.y = -0.20;
  leftShin.castShadow = true;
  leftShinPivot.add(leftShin);

  // Detailed Adventure Boot with thick tread sole and heel
  const leftBoot = new THREE.Group();
  leftBoot.position.set(0, -0.40, 0);
  leftShinPivot.add(leftBoot);

  const bootUpper = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.24), shoeMat);
  bootUpper.position.set(0, 0.06, 0.04);
  bootUpper.castShadow = true;
  leftBoot.add(bootUpper);

  // Rubber Traction Sole
  const bootSole = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.26), new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 }));
  bootSole.position.set(0, 0.02, 0.04);
  leftBoot.add(bootSole);

  // Colored Boot Laces
  const laceStripe = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.02), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
  laceStripe.position.set(0, 0.08, 0.10);
  leftBoot.add(laceStripe);

  // Right Leg Structure
  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.13, 0, 0);
  pelvisGroup.add(rightLegPivot);

  const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.085, 0.46, 10), pantsMat);
  rightThigh.position.y = -0.23;
  rightThigh.castShadow = true;
  rightLegPivot.add(rightThigh);

  const rightPocket = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.12), pantsMat);
  rightPocket.position.set(0.10, -0.22, 0);
  rightLegPivot.add(rightPocket);

  const rightShinPivot = new THREE.Group();
  rightShinPivot.position.set(0, -0.46, 0);
  rightLegPivot.add(rightShinPivot);

  const rightKnee = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), pantsMat);
  rightShinPivot.add(rightKnee);

  const rightShin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.40, 10), pantsMat);
  rightShin.position.y = -0.20;
  rightShin.castShadow = true;
  rightShinPivot.add(rightShin);

  const rightBoot = new THREE.Group();
  rightBoot.position.set(0, -0.40, 0);
  rightShinPivot.add(rightBoot);

  const rightBootUpper = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.24), shoeMat);
  rightBootUpper.position.set(0, 0.06, 0.04);
  rightBootUpper.castShadow = true;
  rightBoot.add(rightBootUpper);

  const rightBootSole = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.26), new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 }));
  rightBootSole.position.set(0, 0.02, 0.04);
  rightBoot.add(rightBootSole);

  const rightLaceStripe = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.02), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
  rightLaceStripe.position.set(0, 0.08, 0.10);
  rightBoot.add(rightLaceStripe);

  // Soft Radial Contact Shadow Grounding underneath player
  const shadowGeo = new THREE.PlaneGeometry(0.9, 0.9);
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d')!;
  const radGrad = sCtx.createRadialGradient(64, 64, 4, 64, 64, 64);
  radGrad.addColorStop(0, 'rgba(0,0,0,0.6)');
  radGrad.addColorStop(1, 'rgba(0,0,0,0)');
  sCtx.fillStyle = radGrad;
  sCtx.fillRect(0, 0, 128, 128);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.015;
  root.add(contactShadow);

  // --- Real-time Organic Locomotion & Breathing Animation Controller ---
  const updateAnimation = (time: number, speed: number, isCrouching: boolean, pitch: number = 0) => {
    // 1. Idle breathing
    const breath = Math.sin(time * 2.2) * 0.025;
    chestGroup.scale.set(1.0 + breath, 1.0 + breath * 0.5, 1.0 + breath * 1.2);

    // 2. Head pitch tracking look direction
    headPivot.rotation.x = pitch * 0.6;

    // 3. Crouching adjustment
    if (isCrouching) {
      pelvisGroup.position.y = 0.62;
      leftLegPivot.rotation.x = -Math.PI / 4;
      leftShinPivot.rotation.x = Math.PI / 2;
      rightLegPivot.rotation.x = -Math.PI / 4;
      rightShinPivot.rotation.x = Math.PI / 2;
      chestGroup.rotation.x = 0.25;
    } else {
      chestGroup.rotation.x = 0;
      pelvisGroup.position.y = 0.95;

      if (speed > 0.1) {
        // Natural walking/running locomotion cycle
        const strideRate = speed > 4.5 ? 12 : 7.5;
        const stridePhase = time * strideRate;
        const legSwing = Math.sin(stridePhase) * (speed > 4.5 ? 0.75 : 0.45);

        // Opposite leg movement
        leftLegPivot.rotation.x = legSwing;
        rightLegPivot.rotation.x = -legSwing;

        // Knee flexing on backswing
        leftShinPivot.rotation.x = Math.max(0, -legSwing * 1.2);
        rightShinPivot.rotation.x = Math.max(0, legSwing * 1.2);

        // Arm swing (Left arm swings opposite to left leg)
        leftArmPivot.rotation.x = -legSwing * 0.8;
        leftForearmPivot.rotation.x = -Math.abs(legSwing) * 0.5;

        // Flashlight arm remains forward-stabilized with subtle organic sway
        rightArmPivot.rotation.x = -Math.PI / 3.8 + Math.sin(stridePhase * 0.5) * 0.08;
        rightArmPivot.rotation.y = -Math.PI / 18 + Math.cos(stridePhase * 0.5) * 0.05;

        // Torso counter-rotation & natural vertical bobbing
        pelvisGroup.rotation.y = Math.sin(stridePhase) * 0.08;
        pelvisGroup.position.y = 0.95 + Math.abs(Math.sin(stridePhase)) * 0.04;
      } else {
        // Return to natural idle stance
        leftLegPivot.rotation.x = 0;
        leftShinPivot.rotation.x = 0;
        rightLegPivot.rotation.x = 0;
        rightShinPivot.rotation.x = 0;
        leftArmPivot.rotation.x = 0.05;
        leftForearmPivot.rotation.x = -0.1;
        rightArmPivot.rotation.x = -Math.PI / 3.8;
        rightArmPivot.rotation.y = -Math.PI / 18;
        pelvisGroup.rotation.y = 0;
      }
    }
  };

  return {
    root,
    pelvisGroup,
    chestGroup,
    headPivot,
    headMesh,
    leftArmPivot,
    rightArmPivot,
    flashGroup,
    updateAnimation,
  };
}

/**
 * Creates Authentic Indonesian Pocong Model
 */
export function createPocongModel() {
  const group = new THREE.Group();
  group.name = 'ghost_pocong';

  const shroudMat = new THREE.MeshStandardMaterial({
    color: 0xd8d6cf,
    roughness: 0.95,
    metalness: 0.02,
  });
  const dirtShroudMat = new THREE.MeshStandardMaterial({
    color: 0x8a7f72,
    roughness: 0.98,
  });
  const faceMat = new THREE.MeshStandardMaterial({
    color: 0x181412,
    roughness: 0.95,
  });
  const ropeMat = new THREE.MeshStandardMaterial({
    color: 0x5a4328,
    roughness: 0.85,
  });
  const eyeGlowMat = new THREE.MeshBasicMaterial({ color: 0xff1100 });

  // Main Tapered Shrouded Body
  const bodyGeom = new THREE.CylinderGeometry(0.38, 0.22, 1.95, 14);
  bodyGeom.translate(0, 0.98, 0);
  const body = new THREE.Mesh(bodyGeom, shroudMat);
  body.castShadow = true;
  group.add(body);

  // Dirt & Blood Splatter layers on lower shroud
  const dirtBand = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.23, 0.65, 12), dirtShroudMat);
  dirtBand.position.y = 0.42;
  group.add(dirtBand);

  // Top Head Knot (Pocong Bun)
  const topKnot = new THREE.Mesh(new THREE.SphereGeometry(0.20, 10, 10), shroudMat);
  topKnot.scale.set(0.9, 1.7, 0.9);
  topKnot.position.y = 2.10;
  group.add(topKnot);

  // Frayed Fabric Strips dangling from top knot
  for (let i = 0; i < 4; i++) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.02), shroudMat);
    strip.position.set((Math.random() - 0.5) * 0.15, 2.15, (Math.random() - 0.5) * 0.15);
    strip.rotation.z = (Math.random() - 0.5) * 0.6;
    group.add(strip);
  }

  // Authentic Coarse Jute Ropes (Tali Kafan: Kepala, Leher, Pinggang, Kaki)
  const topRope = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 8, 14), ropeMat);
  topRope.position.y = 1.94;
  topRope.rotation.x = Math.PI / 2;
  group.add(topRope);

  const neckRope = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.045, 8, 14), ropeMat);
  neckRope.position.y = 1.62;
  neckRope.rotation.x = Math.PI / 2;
  group.add(neckRope);

  const waistRope = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.04, 8, 14), ropeMat);
  waistRope.position.y = 1.05;
  waistRope.rotation.x = Math.PI / 2;
  group.add(waistRope);

  const feetRope = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 8, 14), ropeMat);
  feetRope.position.y = 0.16;
  feetRope.rotation.x = Math.PI / 2;
  group.add(feetRope);

  // Sunken Blackened Face Cavity
  const faceCavity = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), faceMat);
  faceCavity.scale.set(0.9, 1.35, 0.45);
  faceCavity.position.set(0, 1.50, 0.26);
  group.add(faceCavity);

  // Piercing Glowing Red Demon Eyes (Visible clearly in pitch dark)
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), eyeGlowMat);
  eyeL.position.set(-0.065, 1.54, 0.38);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), eyeGlowMat);
  eyeR.position.set(0.065, 1.54, 0.38);
  group.add(eyeL, eyeR);

  // Red forward eye beams so player sees ghost gaze through corridors
  const eyeBeam = new THREE.SpotLight(0xff1100, 2.5, 9.0, Math.PI / 5, 0.4);
  eyeBeam.position.set(0, 1.54, 0.38);
  eyeBeam.target.position.set(0, 1.54, 6.0);
  group.add(eyeBeam);
  group.add(eyeBeam.target);

  // Powerful Red Spectral Aura illuminating surroundings
  const redAura = new THREE.PointLight(0xff1100, 2.6, 7.5);
  redAura.position.set(0, 1.45, 0.35);
  group.add(redAura);

  // Eerie ground shadow mist
  const mistCanvas = document.createElement('canvas');
  mistCanvas.width = 128; mistCanvas.height = 128;
  const mctx = mistCanvas.getContext('2d')!;
  const mgrad = mctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  mgrad.addColorStop(0, 'rgba(80, 0, 0, 0.7)');
  mgrad.addColorStop(0.6, 'rgba(30, 0, 0, 0.4)');
  mgrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  mctx.fillStyle = mgrad;
  mctx.fillRect(0, 0, 128, 128);
  const mistTex = new THREE.CanvasTexture(mistCanvas);
  const mistMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: mistTex, transparent: true }));
  mistMesh.rotation.x = -Math.PI / 2;
  mistMesh.position.y = 0.02;
  group.add(mistMesh);

  return group;
}

/**
 * Creates Dutch Colonial Ghost: Noni Belanda (Eveline van de Berg)
 * High-detail spectral maiden in torn Victorian lace ballgown with glowing eyes and cyan aura.
 */
export function createNoniBelandaModel() {
  const group = new THREE.Group();
  group.name = 'ghost_noni';

  const dressMat = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    roughness: 0.5,
    metalness: 0.1,
    transparent: true,
    opacity: 0.88,
  });
  const laceMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.3,
    transparent: true,
    opacity: 0.92,
  });
  const bloodMat = new THREE.MeshStandardMaterial({
    color: 0x881337,
    roughness: 0.6,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.3,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    roughness: 0.8,
  });
  const eyeGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  // Floating Hoop Skirt with flared rim
  const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.45, 16, 1, true), dressMat);
  skirt.position.y = 0.75;
  group.add(skirt);

  // Tiered Lace Ruffles
  const ruffle1 = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.06, 6, 16), laceMat);
  ruffle1.position.y = 0.08;
  ruffle1.rotation.x = Math.PI / 2;
  const ruffle2 = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 6, 16), laceMat);
  ruffle2.position.y = 0.70;
  ruffle2.rotation.x = Math.PI / 2;
  group.add(ruffle1, ruffle2);

  // Victorian Corset Torso with Blood Stains
  const corset = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 0.60, 12), dressMat);
  corset.position.y = 1.52;
  group.add(corset);

  const bloodStain = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.32, 0.06), bloodMat);
  bloodStain.position.set(0.04, 1.48, 0.16);
  group.add(bloodStain);

  // Ghostly Pale Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 12), skinMat);
  head.position.y = 1.95;
  group.add(head);

  // Victorian Lace Bonnet
  const bonnet = new THREE.Mesh(new THREE.SphereGeometry(0.23, 12, 10, 0, Math.PI), laceMat);
  bonnet.position.set(0, 2.02, -0.05);
  bonnet.rotation.x = Math.PI / 3;
  group.add(bonnet);

  // Long disheveled blonde locks spilling forward
  for (const hx of [-0.16, 0.16]) {
    const curl = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.03, 0.65, 8), hairMat);
    curl.position.set(hx, 1.70, 0.08);
    curl.rotation.x = 0.2;
    group.add(curl);
  }

  // Piercing Spectral Cyan Eyes
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), eyeGlowMat);
  eyeL.position.set(-0.065, 1.96, 0.18);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), eyeGlowMat);
  eyeR.position.set(0.065, 1.96, 0.18);
  group.add(eyeL, eyeR);

  // Forward Cyan Gaze Beam
  const gazeLight = new THREE.SpotLight(0x38bdf8, 2.8, 8.5, Math.PI / 5, 0.35);
  gazeLight.position.set(0, 1.96, 0.18);
  gazeLight.target.position.set(0, 1.96, 5.0);
  group.add(gazeLight);
  group.add(gazeLight.target);

  // Outstretched Reaching Pale Ghost Arms with clawed fingers
  for (const side of [-1, 1]) {
    const armGroup = new THREE.Group();
    armGroup.position.set(side * 0.38, 1.55, 0.1);
    armGroup.rotation.x = -Math.PI / 3.2;
    armGroup.rotation.y = side * 0.2;

    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.65, 8), skinMat);
    arm.position.y = -0.28;
    armGroup.add(arm);

    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.10, 0.03), skinMat);
    hand.position.y = -0.62;
    armGroup.add(hand);

    group.add(armGroup);
  }

  // Brilliant Ethereal Cyan Aura
  const ghostGlow = new THREE.PointLight(0x38bdf8, 3.0, 8.0);
  ghostGlow.position.y = 1.65;
  group.add(ghostGlow);

  return group;
}

/**
 * Creates Suster Ngesot Crawling Ghost
 * Horrifying crawling posture with bloodied nurse gown, torn cap, and toxic green aura.
 */
export function createSusterNgesotModel() {
  const group = new THREE.Group();
  group.name = 'ghost_suster';

  const gownMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 });
  const bloodMat = new THREE.MeshStandardMaterial({ color: 0x881337, roughness: 0.6 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6 });
  const crossMat = new THREE.MeshBasicMaterial({ color: 0xb91c1c });
  const eyeGlowMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });

  // Crawling Torso on Ground
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.30, 0.90), gownMat);
  body.position.set(0, 0.20, 0);
  body.castShadow = true;
  group.add(body);

  const bloodSmear = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.02, 0.50), bloodMat);
  bloodSmear.position.set(0, 0.36, 0.1);
  group.add(bloodSmear);

  // Pale Diseased Head staring upward
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), gownMat);
  head.position.set(0, 0.38, 0.52);
  group.add(head);

  // Long Stringy Wet Hair draping across face and floor
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.95 });
  for (let i = -0.12; i <= 0.12; i += 0.06) {
    const hairStrand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6), hairMat);
    hairStrand.position.set(i, 0.28, 0.65);
    hairStrand.rotation.x = Math.PI / 4;
    group.add(hairStrand);
  }

  // Piercing Sickly Green Glowing Eyes
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), eyeGlowMat);
  eyeL.position.set(-0.06, 0.40, 0.66);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), eyeGlowMat);
  eyeR.position.set(0.06, 0.40, 0.66);
  group.add(eyeL, eyeR);

  // Torn Nurse Cap with Red Cross
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.15), capMat);
  cap.position.set(0, 0.52, 0.46);
  group.add(cap);

  const cross = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.02), crossMat);
  cross.position.set(0, 0.53, 0.54);
  group.add(cross);

  // Forward Crawling Arms
  for (const [side, zOffset] of [[-1, 0.72], [1, 0.55]]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.62), gownMat);
    arm.position.set(side * 0.34, 0.12, zOffset);
    arm.castShadow = true;
    group.add(arm);

    // Bloody Reaching Claw Hands
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.16), bloodMat);
    hand.position.set(side * 0.34, 0.04, zOffset + 0.34);
    group.add(hand);
  }

  // Paralyzed Dragging Legs behind
  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.80), gownMat);
  legs.position.set(0, 0.12, -0.70);
  legs.castShadow = true;
  group.add(legs);

  // Sickly Toxic Green Ghost Aura
  const greenAura = new THREE.PointLight(0x22c55e, 2.6, 6.5);
  greenAura.position.set(0, 0.6, 0.4);
  group.add(greenAura);

  return group;
}

// =========================================================================
// CUSTOMIZABLE FURNITURE SYSTEM 3D BUILDERS
// =========================================================================

/**
 * 1. Customizable Bed (Dipan Jati Ukir, Ranjang Besi Kolonial, Ranjang Bambu)
 */
export function createCustomBed(modelType: string = 'JATI') {
  const group = new THREE.Group();
  group.name = `custom_bed_${modelType}`;

  const sheetMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.8 });
  const pillowMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 });

  if (modelType === 'KOLONIAL') {
    // Victorian Cast Iron Bed Frame
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.85 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.9 });

    // 4 Corner iron posts with brass spherical finials
    for (const [x, z] of [[-0.8, -1.1], [0.8, -1.1], [-0.8, 1.1], [0.8, 1.1]]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), ironMat);
      post.position.set(x, 0.6, z);
      const finial = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), brassMat);
      finial.position.set(x, 1.23, z);
      group.add(post, finial);
    }

    // Curved iron headboard and footboard bars
    const headBar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.04), ironMat);
    headBar.position.set(0, 1.0, -1.1);
    const footBar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.04), ironMat);
    footBar.position.set(0, 0.7, 1.1);
    group.add(headBar, footBar);

    // Mattress & Crimson Throw Blanket
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.25, 2.1), sheetMat);
    mattress.position.set(0, 0.45, 0);
    mattress.castShadow = true;
    group.add(mattress);

    const velvetMat = new THREE.MeshStandardMaterial({ color: 0x881337, roughness: 0.7 });
    const velvetThrow = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.03, 0.9), velvetMat);
    velvetThrow.position.set(0, 0.58, 0.5);
    group.add(velvetThrow);
  } else if (modelType === 'BAMBU') {
    // Traditional Javanese Bamboo Wulung Bed
    const bambooMat = new THREE.MeshStandardMaterial({ color: 0x422817, roughness: 0.65 });
    const rattanTieMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.8 });

    // Bamboo frame poles
    for (const [x, z] of [[-0.75, -1.05], [0.75, -1.05], [-0.75, 1.05], [0.75, 1.05]]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8), bambooMat);
      pole.position.set(x, 0.45, z);
      const tie = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 6, 8), rattanTieMat);
      tie.position.set(x, 0.5, z);
      tie.rotation.x = Math.PI / 2;
      group.add(pole, tie);
    }

    // Bamboo headboard slats
    for (let i = -0.6; i <= 0.6; i += 0.2) {
      const slat = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.6, 6), bambooMat);
      slat.position.set(i, 0.7, -1.05);
      group.add(slat);
    }

    const matting = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.2, 2.05), sheetMat);
    matting.position.set(0, 0.45, 0);
    group.add(matting);

    // Traditional Guling (Bolster Pillow)
    const guling = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 1.1, 8), pillowMat);
    guling.position.set(0, 0.62, 0);
    guling.rotation.x = Math.PI / 2;
    group.add(guling);
  } else {
    // Default JATI: Ornate Carved Jepara Teak Bed
    const jatiMat = new THREE.MeshStandardMaterial({ map: getProceduralTexture('CARVED_JATI'), roughness: 0.65 });
    const woodMat = new THREE.MeshStandardMaterial({ map: getProceduralTexture('WOOD_FLOOR'), roughness: 0.75 });
    const batikMat = new THREE.MeshStandardMaterial({ map: getProceduralTexture('BATIK'), roughness: 0.85 });

    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.28, 2.2), woodMat);
    frame.position.set(0, 0.35, 0);
    frame.castShadow = true;
    group.add(frame);

    // Carved Headboard with ornate relief
    const headboard = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.12), jatiMat);
    headboard.position.set(0, 0.85, -1.05);
    headboard.castShadow = true;
    group.add(headboard);

    // Top Headboard Arch
    const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.8, 0.12, 12), jatiMat);
    arch.position.set(0, 1.4, -1.05);
    arch.rotation.z = Math.PI / 2;
    group.add(arch);

    const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.22, 2.05), sheetMat);
    mattress.position.set(0, 0.55, 0);
    group.add(mattress);

    const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.04, 1.2), batikMat);
    blanket.position.set(0, 0.68, 0.35);
    group.add(blanket);

    const pillowGeom = new THREE.BoxGeometry(0.5, 0.14, 0.36);
    const pillow1 = new THREE.Mesh(pillowGeom, pillowMat);
    pillow1.position.set(-0.35, 0.72, -0.75);
    const pillow2 = new THREE.Mesh(pillowGeom, pillowMat);
    pillow2.position.set(0.35, 0.72, -0.75);
    group.add(pillow1, pillow2);
  }

  return group;
}

/**
 * 2. Customizable Altar (Meja Gaharu, Meja Naga Wirawan, Meja Pualam Belanda)
 */
export function createCustomAltar(modelType: string = 'GAHARU') {
  const group = new THREE.Group();
  group.name = `custom_altar_${modelType}`;

  if (modelType === 'PUALAM') {
    // Dutch Colonial Marble Altar Table
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.2, metalness: 0.1 });
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.9 });

    const slab = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.8), marbleMat);
    slab.position.y = 0.74;
    slab.castShadow = true;
    group.add(slab);

    // Turned marble baluster legs
    for (const [x, z] of [[-0.55, -0.3], [0.55, -0.3], [-0.55, 0.3], [0.55, 0.3]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.7, 8), marbleMat);
      leg.position.set(x, 0.35, z);
      group.add(leg);
    }

    // Vintage Silver Candelabra
    const candelabra = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 0.25, 8), silverMat);
    candelabra.position.set(0, 0.88, 0);
    group.add(candelabra);

    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 6), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    candle.position.set(0, 1.05, 0);
    group.add(candle);

    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.07, 6), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    flame.position.set(0, 1.18, 0);
    group.add(flame);

    const light = new THREE.PointLight(0xfff7ed, 1.6, 6);
    light.position.set(0, 1.25, 0);
    group.add(light);
  } else if (modelType === 'NAGA') {
    // Golden Dragon Carved Altar
    const nagaMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.8 });
    const woodMat = new THREE.MeshStandardMaterial({ map: getProceduralTexture('WOOD_FLOOR'), roughness: 0.8 });

    const table = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.7, 0.85), woodMat);
    table.position.y = 0.35;
    table.castShadow = true;
    group.add(table);

    // Gilded Dragon relief plate on front
    const dragonFront = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.04), nagaMat);
    dragonFront.position.set(0, 0.45, 0.43);
    group.add(dragonFront);

    // Golden offering urns
    for (const ux of [-0.35, 0.35]) {
      const urn = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.04, 0.16, 8), nagaMat);
      urn.position.set(ux, 0.78, 0);
      group.add(urn);
    }

    const light = new THREE.PointLight(0xf59e0b, 1.5, 6);
    light.position.set(0, 1.0, 0);
    group.add(light);
  } else {
    // Default GAHARU: Antique Fragrant Wood Altar with Incense & Offerings
    const gaharuMat = new THREE.MeshStandardMaterial({ color: 0x27170b, roughness: 0.75 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.85 });
    const clothMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.9 });

    const table = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.7, 0.8), gaharuMat);
    table.position.y = 0.35;
    table.castShadow = true;
    group.add(table);

    const cloth = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.02, 0.84), clothMat);
    cloth.position.y = 0.71;
    group.add(cloth);

    // Incense Burner (Tempat Dupa Kemenyan)
    const incense = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 0.12, 8), brassMat);
    incense.position.set(0, 0.78, 0);
    group.add(incense);

    // Bunga Tujuh Rupa Offering Bowl
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.09, 0.07, 10), brassMat);
    bowl.position.set(0.32, 0.75, 0);
    group.add(bowl);

    // Red candles
    for (const xOff of [-0.36, 0.36]) {
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.25, 6), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
      candle.position.set(xOff, 0.82, -0.18);
      group.add(candle);

      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 6), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
      flame.position.set(xOff, 0.96, -0.18);
      group.add(flame);
    }

    const altarLight = new THREE.PointLight(0xff5511, 1.4, 6);
    altarLight.position.set(0, 1.0, 0);
    group.add(altarLight);
  }

  return group;
}

/**
 * 3. Customizable Lamp (Petromak Tembaga, Lampu Teplok Minyak, Lilin Merah Dupa)
 */
export function createCustomLamp(modelType: string = 'PETROMAK') {
  const group = new THREE.Group();
  group.name = `custom_lamp_${modelType}`;

  if (modelType === 'TEPLOK') {
    // Traditional Javanese Teplok Kerosene Lamp
    const tinMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.8 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.1, transparent: true, opacity: 0.65 });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 0.12, 8), tinMat);
    base.position.y = -0.06;
    group.add(base);

    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 0.28, 8), glassMat);
    chimney.position.y = 0.14;
    group.add(chimney);

    const reflector = new THREE.Mesh(new THREE.CircleGeometry(0.12, 10), tinMat);
    reflector.position.set(0, 0.16, -0.08);
    group.add(reflector);

    const light = new THREE.PointLight(0xff8800, 1.5, 10);
    light.position.y = 0.14;
    light.castShadow = true;
    group.add(light);
    return { group, light };
  } else if (modelType === 'DUPA') {
    // Red Ceremonial Candles & Incense Brazier
    const candleMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

    const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8), candleMat);
    c1.position.set(-0.12, 0.15, 0);
    const f1 = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 6), flameMat);
    f1.position.set(-0.12, 0.36, 0);
    group.add(c1, f1);

    const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8), candleMat);
    c2.position.set(0.12, 0.15, 0);
    const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 6), flameMat);
    f2.position.set(0.12, 0.36, 0);
    group.add(c2, f2);

    const light = new THREE.PointLight(0xff4400, 1.8, 12);
    light.position.y = 0.35;
    light.castShadow = true;
    group.add(light);
    return { group, light };
  } else {
    // Default PETROMAK: Burnished Brass/Copper Petromak Pressure Lantern
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.28, metalness: 0.88 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.1, transparent: true, opacity: 0.65 });

    const hood = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.14, 10), brassMat);
    hood.position.y = 0.36;
    group.add(hood);

    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.32, 10), glassMat);
    glass.position.y = 0.15;
    group.add(glass);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.16, 10), brassMat);
    base.position.y = -0.09;
    group.add(base);

    const light = new THREE.PointLight(0xffa500, 2.0, 15);
    light.position.y = 0.15;
    light.castShadow = true;
    group.add(light);
    return { group, light };
  }
}

/**
 * 4. Customizable Wall Relic (Keris Naga Sasra, Topeng Wayang Klana, Potret Wirawan)
 */
export function createCustomWallRelic(modelType: string = 'KERIS') {
  const group = new THREE.Group();
  group.name = `custom_relic_${modelType}`;

  if (modelType === 'TOPENG') {
    // Hand-Carved Topeng Wayang Klana (Red Demon-King Mask)
    const redMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.45 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.85 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 });

    // Fierce Face Shape
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), redMat);
    face.scale.set(0.9, 1.25, 0.5);
    group.add(face);

    // Golden Crown (Makuta)
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.24, 6), goldMat);
    crown.position.set(0, 0.28, 0);
    group.add(crown);

    // Bulging Fierce Eyes
    for (const ex of [-0.09, 0.09]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), goldMat);
      eye.position.set(ex, 0.08, 0.14);
      group.add(eye);
    }

    // Long Curling Mustache
    const stache = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.04), hairMat);
    stache.position.set(0, -0.06, 0.14);
    group.add(stache);
  } else if (modelType === 'POTRET') {
    // Antique Framed Photograph of Juragan Wirawan (1928)
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.8 });
    const pictureMat = new THREE.MeshStandardMaterial({ map: getProceduralTexture('PORTRAIT'), roughness: 0.5 });

    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.90, 1.25, 0.06), frameMat);
    group.add(frame);

    const picture = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 1.08), pictureMat);
    picture.position.z = 0.035;
    group.add(picture);
  } else {
    // Default KERIS: Keris Naga Sasra in Velvet Display Case
    const caseMat = new THREE.MeshStandardMaterial({ map: getProceduralTexture('WOOD_FLOOR'), roughness: 0.7 });
    const velvetMat = new THREE.MeshStandardMaterial({ color: 0x881337, roughness: 0.8 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.9 });

    // Glass display shadowbox
    const shadowBox = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.12), caseMat);
    group.add(shadowBox);

    const velvetBacking = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.42, 0.02), velvetMat);
    velvetBacking.position.z = 0.03;
    group.add(velvetBacking);

    // Wavy Luk-9 Keris Blade
    const kerisGroup = new THREE.Group();
    kerisGroup.position.set(0, 0, 0.05);

    // Golden undulating blade
    for (let i = 0; i < 9; i++) {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.08, 6), goldMat);
      seg.position.set(-0.35 + i * 0.07, Math.sin(i * 1.2) * 0.025, 0);
      seg.rotation.z = Math.PI / 2 + Math.cos(i * 1.2) * 0.25;
      kerisGroup.add(seg);
    }

    // Carved hilt (Hulu Keris Ukir)
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.14, 8), caseMat);
    hilt.position.set(0.35, 0, 0);
    hilt.rotation.z = Math.PI / 2.2;
    kerisGroup.add(hilt);

    group.add(kerisGroup);
  }

  return group;
}

/**
 * 5. Customizable Carpet (Batik Parang Barong, Karpet Beludru Merah, Tikar Pandan)
 */
export function createCustomCarpet(modelType: string = 'PARANG') {
  const group = new THREE.Group();
  group.name = `custom_carpet_${modelType}`;

  let tex: THREE.CanvasTexture;
  if (modelType === 'BELUDRU') {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#881337'; // royal velvet red
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#d97706'; // gold border
    ctx.lineWidth = 14;
    ctx.strokeRect(8, 8, 240, 240);
    tex = new THREE.CanvasTexture(canvas);
  } else if (modelType === 'PANDAN') {
    tex = getProceduralTexture('PANDAN');
  } else {
    tex = getProceduralTexture('BATIK');
  }

  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.85,
    metalness: 0.05,
  });

  const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.6), mat);
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.025; // slightly above floor to prevent z-fighting
  rug.receiveShadow = true;
  group.add(rug);

  return group;
}

/**
 * Antique Grandfather Clock (Jam Bandul Kuno) with Moving Pendulum
 */
export function createGrandfatherClock() {
  const group = new THREE.Group();
  group.name = 'prop_grandfather_clock';

  const woodMat = new THREE.MeshStandardMaterial({ map: getProceduralTexture('CARVED_JATI'), roughness: 0.7 });
  const faceMat = new THREE.MeshStandardMaterial({ map: getProceduralTexture('CLOCK_FACE'), roughness: 0.4 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.88 });

  // Main tall wooden cabinet
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.5, 0.45), woodMat);
  cabinet.position.y = 1.25;
  cabinet.castShadow = true;
  group.add(cabinet);

  // Ornate Carved Pediment Arch Top
  const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.46, 12), woodMat);
  arch.position.set(0, 2.5, 0);
  arch.rotation.x = Math.PI / 2;
  group.add(arch);

  // Clock Dial Face
  const dial = new THREE.Mesh(new THREE.CircleGeometry(0.22, 16), faceMat);
  dial.position.set(0, 2.05, 0.23);
  group.add(dial);

  // Clock Hands
  const handH = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.12, 0.01), brassMat);
  handH.position.set(0, 2.08, 0.235);
  handH.rotation.z = 0.7;
  const handM = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.17, 0.01), brassMat);
  handM.position.set(0, 2.10, 0.235);
  handM.rotation.z = -1.2;
  group.add(handH, handM);

  // Glass Window for Pendulum Chamber
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.1, transparent: true, opacity: 0.5 });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.9), glassMat);
  glass.position.set(0, 1.05, 0.23);
  group.add(glass);

  // Swinging Pendulum Pivot
  const pendulumPivot = new THREE.Group();
  pendulumPivot.position.set(0, 1.45, 0.05);
  group.add(pendulumPivot);

  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.65, 6), brassMat);
  rod.position.y = -0.32;
  pendulumPivot.add(rod);

  const bob = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 14), brassMat);
  bob.position.set(0, -0.65, 0);
  bob.rotation.x = Math.PI / 2;
  pendulumPivot.add(bob);

  return { group, pendulumPivot };
}

/**
 * Authentic Soko Guru Carved Teak Pillar with Stone Pedestal Base
 */
export function createSokoGuruPillar() {
  const group = new THREE.Group();
  group.name = 'prop_soko_guru';

  const woodMat = new THREE.MeshStandardMaterial({ map: getProceduralTexture('CARVED_JATI'), roughness: 0.75 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });

  // Tiered Stone Umpak Pedestal Base
  const umpakBase = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.55), stoneMat);
  umpakBase.position.y = 0.09;
  umpakBase.castShadow = true;
  group.add(umpakBase);

  const umpakTier = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.16, 8), stoneMat);
  umpakTier.position.y = 0.25;
  group.add(umpakTier);

  // Carved Teak Wooden Pillar Column
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 2.8, 8), woodMat);
  pillar.position.y = 1.70;
  pillar.castShadow = true;
  group.add(pillar);

  // Lotus Flower Capital (Ukir Padma)
  const capital = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.22, 0.48), woodMat);
  capital.position.y = 3.10;
  group.add(capital);

  return group;
}

/**
 * Antique Javanese Dining Table & Chairs with tea set
 */
export function createTableAndChairs() {
  const group = new THREE.Group();
  group.name = 'prop_table_set';

  const woodMat = new THREE.MeshStandardMaterial({
    map: getProceduralTexture('WOOD_FLOOR'),
    roughness: 0.7,
    metalness: 0.1,
  });
  const clothMat = new THREE.MeshStandardMaterial({
    map: getProceduralTexture('BATIK'),
    roughness: 0.9,
  });
  const teaMat = new THREE.MeshStandardMaterial({
    color: 0x4d7c0f,
    roughness: 0.4,
    metalness: 0.5,
  });

  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.0), woodMat);
  tableTop.position.y = 0.8;
  tableTop.castShadow = true;
  group.add(tableTop);

  const runner = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.01, 0.4), clothMat);
  runner.position.set(0, 0.845, 0);
  group.add(runner);

  const legGeom = new THREE.CylinderGeometry(0.05, 0.04, 0.8, 8);
  for (const [x, z] of [[-0.7, -0.4], [0.7, -0.4], [-0.7, 0.4], [0.7, 0.4]]) {
    const leg = new THREE.Mesh(legGeom, woodMat);
    leg.position.set(x, 0.4, z);
    leg.castShadow = true;
    group.add(leg);
  }

  const teapot = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.16, 8), teaMat);
  teapot.position.set(0, 0.93, 0);
  group.add(teapot);

  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.09, 8), teaMat);
  cup.position.set(0.25, 0.89, 0);
  group.add(cup);

  for (const zSide of [-0.75, 0.75]) {
    const chair = new THREE.Group();
    chair.position.set(0, 0, zSide);
    if (zSide > 0) chair.rotation.y = Math.PI;

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.5), woodMat);
    seat.position.y = 0.45;
    chair.add(seat);

    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.05), woodMat);
    backrest.position.set(0, 0.75, -0.22);
    chair.add(backrest);

    for (const [cx, cz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) {
      const cLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 6), woodMat);
      cLeg.position.set(cx, 0.225, cz);
      chair.add(cLeg);
    }
    group.add(chair);
  }

  return group;
}

/**
 * Traditional Antique Wooden Bed with Pillow & Batik Blanket
 */
export function createAntiqueBed() {
  return createCustomBed('JATI');
}

/**
 * Framed Sepia Ancestor Portrait
 */
export function createPortraitPainting() {
  return createCustomWallRelic('POTRET');
}

/**
 * Kerosene Lamp
 */
export function createKeroseneLamp() {
  return createCustomLamp('PETROMAK');
}

/**
 * Altar Sesajen
 */
export function createAltarSesajen() {
  return createCustomAltar('GAHARU');
}

/**
 * Wardrobe (Lemari Jati)
 */
export function createWardrobe() {
  const group = new THREE.Group();
  group.name = 'prop_wardrobe';

  const woodMat = new THREE.MeshStandardMaterial({
    map: getProceduralTexture('CARVED_JATI'),
    roughness: 0.75,
    metalness: 0.1,
  });
  const handleMat = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    roughness: 0.3,
    metalness: 0.85,
  });

  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.3, 0.75), woodMat);
  frame.position.y = 1.15;
  frame.castShadow = true;
  group.add(frame);

  const crown = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.82), woodMat);
  crown.position.y = 2.36;
  group.add(crown);

  const handleL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 6), handleMat);
  handleL.position.set(-0.07, 1.15, 0.39);
  const handleR = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 6), handleMat);
  handleR.position.set(0.07, 1.15, 0.39);
  group.add(handleL, handleR);

  return group;
}

/**
 * Grand Piano for Level 2
 */
export function createGrandPiano() {
  const group = new THREE.Group();
  group.name = 'prop_piano';

  const lacquerMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.2,
    metalness: 0.7,
  });
  const keyWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.2), lacquerMat);
  body.position.set(0, 0.9, 0);
  body.castShadow = true;
  group.add(body);

  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.25), lacquerMat);
  shelf.position.set(0, 0.8, 0.65);
  group.add(shelf);

  const keys = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.04, 0.2), keyWhite);
  keys.position.set(0, 0.87, 0.65);
  group.add(keys);

  const legGeom = new THREE.CylinderGeometry(0.06, 0.04, 0.7, 8);
  for (const [x, z] of [[-0.65, 0.45], [0.65, 0.45], [0, -0.45]]) {
    const leg = new THREE.Mesh(legGeom, lacquerMat);
    leg.position.set(x, 0.35, z);
    group.add(leg);
  }

  return group;
}

/**
 * Fuse Box for Level 2
 */
export function createFuseBox() {
  const group = new THREE.Group();
  group.name = 'prop_fuse_box';

  const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.7 });
  const redLamp = new THREE.MeshBasicMaterial({ color: 0xef4444 });

  const box = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.15), metalMat);
  box.position.y = 1.4;
  group.add(box);

  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), redLamp);
  lamp.position.set(0, 1.55, 0.08);
  group.add(lamp);

  return group;
}

/**
 * Candle Checkpoint
 */
export function createCandleCheckpoint() {
  const group = new THREE.Group();
  group.name = 'prop_candle';

  const waxMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 });
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

  const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.4, 8), waxMat);
  stool.position.y = 0.2;
  group.add(stool);

  const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8), waxMat);
  candle.position.y = 0.5;
  group.add(candle);

  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 6), flameMat);
  flame.position.y = 0.64;
  group.add(flame);

  const light = new THREE.PointLight(0xf59e0b, 1.5, 8.0);
  light.position.y = 0.66;
  group.add(light);

  return { group, light, flame };
}

/**
 * High-Detail Interactive Architectural Door
 * Completely seals the 2.0m x 3.2m wall opening with solid teak architraves,
 * transom louvers, threshold sill, 4 carved relief panels, cast iron hinges,
 * and antique brass handle hardware.
 */
export function createDoor() {
  const frameGroup = new THREE.Group();
  frameGroup.name = 'door_architectural_frame';

  const woodMat = new THREE.MeshStandardMaterial({
    map: getProceduralTexture('WOOD_FLOOR'),
    roughness: 0.75,
    metalness: 0.08,
  });
  const carvedMat = new THREE.MeshStandardMaterial({
    map: getProceduralTexture('CARVED_JATI'),
    roughness: 0.65,
    metalness: 0.12,
  });
  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.5,
    metalness: 0.85,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.25,
    metalness: 0.9,
  });

  // 1. Left Wall Jamb Architrave (Sayap Kusen Kiri: x = -1.0 to -0.52)
  const leftJamb = new THREE.Mesh(new THREE.BoxGeometry(0.48, 3.2, 0.24), woodMat);
  leftJamb.position.set(-0.76, 1.6, 0);
  leftJamb.castShadow = true;
  leftJamb.receiveShadow = true;
  frameGroup.add(leftJamb);

  // 2. Right Wall Jamb Architrave (Sayap Kusen Kanan: x = +0.52 to +1.0)
  const rightJamb = new THREE.Mesh(new THREE.BoxGeometry(0.48, 3.2, 0.24), woodMat);
  rightJamb.position.set(0.76, 1.6, 0);
  rightJamb.castShadow = true;
  rightJamb.receiveShadow = true;
  frameGroup.add(rightJamb);

  // 3. Top Transom Header with Antique Ventilation Louvers (Kusen Atas & Jalusi Bovenlicht: y = 2.26 to 3.20)
  const transomHeader = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.94, 0.24), woodMat);
  transomHeader.position.set(0, 2.73, 0);
  transomHeader.castShadow = true;
  transomHeader.receiveShadow = true;
  frameGroup.add(transomHeader);

  // Carved floral ventilation relief plaque in transom
  const louverRelief = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.60, 0.26), carvedMat);
  louverRelief.position.set(0, 2.73, 0);
  frameGroup.add(louverRelief);

  // 4. Sturdy Hardwood Threshold Base Sill (Ambang Bawah Kayu: y = 0 to 0.08)
  const sill = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.08, 0.26), woodMat);
  sill.position.set(0, 0.04, 0);
  sill.receiveShadow = true;
  frameGroup.add(sill);

  // 5. Inner Door Stop Molding (Lis Penahan Daun Pintu agar tertutup rapat)
  const stopTop = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.04, 0.03), woodMat);
  stopTop.position.set(0, 2.24, -0.04);
  const stopRight = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.18, 0.03), woodMat);
  stopRight.position.set(0.50, 1.15, -0.04);
  frameGroup.add(stopTop, stopRight);

  // 6. Door Pivot Group on the Left Hinge Axis
  const doorPivot = new THREE.Group();
  doorPivot.position.set(-0.51, 0, 0);
  frameGroup.add(doorPivot);

  // Main Heavy Teak Door Leaf (Daun Pintu Jati Tebal)
  // Perfectly fits inside the 1.02m x 2.18m opening with tight 0.5cm tolerances
  const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.02, 2.18, 0.085), woodMat);
  doorLeaf.position.set(0.51, 1.17, 0);
  doorLeaf.castShadow = true;
  doorLeaf.receiveShadow = true;
  doorPivot.add(doorLeaf);

  // 4 Raised Beveled Carved Panels on Front (z = +0.045) and Back (z = -0.045)
  for (const zSide of [0.046, -0.046]) {
    // Upper Panels (Left & Right)
    for (const px of [0.28, 0.74]) {
      const topPanel = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.85, 0.012), carvedMat);
      topPanel.position.set(px, 1.58, zSide);
      doorPivot.add(topPanel);

      const botPanel = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.65, 0.012), carvedMat);
      botPanel.position.set(px, 0.65, zSide);
      doorPivot.add(botPanel);
    }
  }

  // 3 Heavy Antique Cast Iron Strap Hinges (Engsel Besi Hitam Kuno)
  for (const hy of [0.38, 1.17, 1.95]) {
    const hingeStrap = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.015), ironMat);
    hingeStrap.position.set(0.12, hy, 0.048);
    doorPivot.add(hingeStrap);

    const hingePin = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.09, 8), ironMat);
    hingePin.position.set(0.01, hy, 0.048);
    doorPivot.add(hingePin);
  }

  // Antique Brass Door Handle Sets on Both Sides
  for (const zSide of [0.052, -0.052]) {
    // Escutcheon Backplate
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.22, 0.012), brassMat);
    plate.position.set(0.92, 1.05, zSide);
    doorPivot.add(plate);

    // Turned Brass Lever Latch Handle
    const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.010, 0.12, 8), brassMat);
    handleBar.position.set(0.88, 1.08, zSide + (zSide > 0 ? 0.035 : -0.035));
    handleBar.rotation.z = Math.PI / 2;
    doorPivot.add(handleBar);

    // Antique Keyhole Cutout
    const keyhole = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.015, 6), ironMat);
    keyhole.position.set(0.92, 0.98, zSide + (zSide > 0 ? 0.005 : -0.005));
    keyhole.rotation.x = Math.PI / 2;
    doorPivot.add(keyhole);
  }

  // Security Slide Bolt (Slot Grendel Kayu) on the inner side (z = -0.05)
  const bolt = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.02), ironMat);
  bolt.position.set(0.92, 1.25, -0.055);
  doorPivot.add(bolt);

  return { frameGroup, doorPivot, isOpen: false, isLocked: false };
}

/**
 * Floating Dust Particles
 */
export function createDustParticles(count = 150) {
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 35;
    positions[i * 3 + 1] = Math.random() * 3.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 35;
  }

  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xedd6b4,
    size: 0.04,
    transparent: true,
    opacity: 0.5,
  });

  return new THREE.Points(geom, mat);
}
