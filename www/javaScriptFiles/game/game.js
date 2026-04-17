const ENEMY_SPAWN_TABLE = window.ENEMY_SPAWN_TABLE;

document.addEventListener(
  'touchmove',
  (e) => {
    if (e.scale && e.scale !== 1) e.preventDefault();
  },
  { passive: false }
);

let lastTouchEnd = 0;
document.addEventListener(
  'touchend',
  (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  },
  { passive: false }
);

const params = new URLSearchParams(window.location.search);
const currentLevel = parseInt(params.get('level')) || 1;

const LEVELS = {
  1: {
    maxOnScreen: 4,
    spawnMs: 1200,
    pool: ['Enemy1'],
    speedMul: 1.0,
    hpMul: 1.0,
  },
  2: {
    maxOnScreen: 5,
    spawnMs: 1100,
    pool: ['Enemy1', 'Enemy2'],
    speedMul: 1.05,
    hpMul: 1.0,
  },
  3: {
    maxOnScreen: 6,
    spawnMs: 1000,
    pool: ['Enemy1', 'Enemy2'],
    speedMul: 1.1,
    hpMul: 1.05,
  },
  4: {
    maxOnScreen: 7,
    spawnMs: 900,
    pool: ['Enemy1', 'Enemy2', 'Enemy3'],
    speedMul: 1.15,
    hpMul: 1.1,
  },
};

function getLevelCfg(level) {
  return (
    LEVELS[level] || {
      maxOnScreen: 8,
      spawnMs: Math.max(650, 900 - level * 35),
      pool: ['Enemy1', 'Enemy2', 'Enemy3'],
      speedMul: 1 + level * 0.03,
      hpMul: 1 + level * 0.02,
    }
  );
}

function getOwnedSkinsRewardSet() {
  return new Set(
    JSON.parse(localStorage.getItem('ownedSkins') || '[]').map((x) =>
      String(x || '')
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[_-]+/g, '')
    )
  );
}

function saveOwnedSkinsRewardSet(set) {
  localStorage.setItem('ownedSkins', JSON.stringify([...set]));
}

function unlockSkinReward(id) {
  const n = String(id || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[_-]+/g, '');
  if (!n) return false;

  const owned = getOwnedSkinsRewardSet();
  if (owned.has(n)) return false;

  owned.add(n);
  saveOwnedSkinsRewardSet(owned);
  return true;
}

function getRewardSkinData(id) {
  const n = String(id || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[_-]+/g, '');

  if (n === 'starbreaker') {
    return {
      id: 'star_breaker',
      name: 'Star Breaker',
      image: './images/shopAInventoryicons/playerIcones/starBreakerIcone.png',
    };
  }

  return null;
}

function showSkinRewardPopup(id, onCollect = null) {
  const popup = document.getElementById('skinRewardPopup');
  const img = document.getElementById('skinRewardImg');
  const name = document.getElementById('skinRewardName');
  const btn = document.getElementById('skinRewardCollectBtn');

  if (!popup || !img || !name || !btn) return;

  const skin = getRewardSkinData(id);
  if (!skin) return;

  img.src = skin.image;
  name.textContent = skin.name;

  popup.classList.remove('hidden');

  btn.onclick = () => {
    popup.classList.add('hidden');
    if (typeof onCollect === 'function') onCollect();
  };
}

function getEquippedPet() {
  const pet = localStorage.getItem('equippedPet');
  return pet && pet !== '' ? pet : null;
}

const STORAGE_KEY_MAX_LEVEL = 'maxUnlockedLevel';

function getMaxUnlockedLevel() {
  return Number(localStorage.getItem(STORAGE_KEY_MAX_LEVEL)) || 1;
}

function unlockNextLevel(currentLevel) {
  const maxLevel = getMaxUnlockedLevel();

  if (currentLevel >= maxLevel) {
    localStorage.setItem(STORAGE_KEY_MAX_LEVEL, currentLevel + 1);
  }
}

const SKIN_TO_PLAYER_IMG_ID = {
  default: 'player',
  redclassic: 'playerRedClassic',
  darkreaper: { imgId: 'playerDarkReaper', frameY: 0 },
  celestialsakura: { imgId: 'playerCelestialSakura', frameY: 1 },
  goldencore: { imgId: 'playerGoldenCore', frameY: 1 },
  starbreaker: { imgId: 'playerStarBreaker', frameY: 0 },
};

const DEFAULT_SKIN = 'default';
const STORAGE_KEY_EQUIPPED_SKIN = 'equippedSkin';

const ALLOWED_SKINS = new Set([
  'default',
  'redclassic',
  'darkreaper',
  'celestialsakura',
  'goldencore',
  'starbreaker',
]);

const SKIN_ALIASES = {
  default: 'default',
  redclassic: 'redclassic',
  darkreaper: 'darkreaper',
  celestialsakura: 'celestialsakura',
  goldencore: 'goldencore',
  godencore: 'goldencore',
  starbreaker: 'starbreaker',
  star_breaker: 'starbreaker',
};

function resolveSkinId(raw) {
  const n = normalizeSkinId(raw);
  return SKIN_ALIASES[n] || DEFAULT_SKIN;
}

function normalizeSkinId(id) {
  return String(id || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[_-]+/g, '');
}

function getEquippedSkin() {
  const raw = localStorage.getItem(STORAGE_KEY_EQUIPPED_SKIN) || DEFAULT_SKIN;
  const resolved = resolveSkinId(raw);
  return ALLOWED_SKINS.has(resolved) ? resolved : DEFAULT_SKIN;
}

function setEquippedSkin(id) {
  const resolved = resolveSkinId(id);
  localStorage.setItem(STORAGE_KEY_EQUIPPED_SKIN, resolved);
}

function equipSkin(id) {
  const owned = getOwnedSkinsArr().map(normalizeSkinId);
  const n = normalizeSkinId(id);
  if (!owned.includes(n)) return;

  setEquippedSkin(n);

  const isGamePage = !!document.getElementById('gameBoard');
  if (isGamePage) location.reload();
  else openInv('skins');
}

window.addEventListener('load', function () {
  function getBackgroundForLevel(level) {
    if (level >= 91) return './images/game/background/goldSpace.png';
    else if (level >= 81) return './images/game/background/blackSpace.png';
    else if (level >= 71) return './images/game/background/yellowSpace.png';
    else if (level >= 61) return './images/game/background/lightblueSpace.png';
    else if (level >= 51) return './images/game/background/orangeSpace.png';
    else if (level >= 41) return './images/game/background/purpleSpace.png';
    else if (level >= 31) return './images/game/background/redSpace.png';
    else if (level >= 21) return './images/game/background/pinkSpace.png';
    else if (level >= 11) return './images/game/background/greenSpace.png';
    return './images/game/background/blueSpace.png';
  }

  const ASSETS = {
    bg: getBackgroundForLevel(currentLevel),
    explosion: './images/game/sprites/smokeExplosion.png',
    music: './sounds/game/gameplayMusic.mp3',
  };

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function getMusicEnabled() {
    return localStorage.getItem('music') !== 'off';
  }

  function getMusicVolume() {
    const v = Number(localStorage.getItem('musicVolume') ?? 70);
    return Math.max(0, Math.min(100, v));
  }

  function applyGameMusicSettings() {
    if (!bgMusic) return;

    const enabled = getMusicEnabled();
    const volume = getMusicVolume();

    bgMusic.volume = volume / 100;

    if (!enabled || volume === 0) {
      bgMusic.pause();
      return;
    }

    if (musicStarted && bgMusic.paused) {
      bgMusic.play().catch(() => {});
    }
  }
  ('');

  function setupMusic() {
    bgMusic = new Audio(ASSETS.music);
    bgMusic.loop = true;
    bgMusic.preload = 'auto';
    applyGameMusicSettings();
  }

  function startMusic() {
    if (!bgMusic || musicStarted) return;
    if (!getMusicEnabled() || getMusicVolume() === 0) return;

    bgMusic.volume = getMusicVolume() / 100;

    bgMusic
      .play()
      .then(() => {
        musicStarted = true;
      })
      .catch(() => {});
  }

  window.addEventListener('storage', (e) => {
    if (e.key === 'music' || e.key === 'musicVolume') {
      applyGameMusicSettings();
    }
  });

  function stopMusic() {
    if (!bgMusic) return;
    bgMusic.pause();
    bgMusic.currentTime = 0;
    musicStarted = false;
  }

  let cached = {};

  let EXPLOSION_IMG = null;
  let background = null;
  let stars = null;
  let game = null;
  let bgMusic = null;
  let musicStarted = false;

  async function preload() {
    const [bgImg, explosionImg] = await Promise.all([
      loadImage(ASSETS.bg),
      loadImage(ASSETS.explosion),
    ]);
    cached.bgImg = bgImg;
    cached.explosionImg = explosionImg;
  }

  // canvas settings
  const canvas = document.getElementById('gameBoard');
  const ctx = canvas.getContext('2d');
  let logicalW = 0;
  let logicalH = 0;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    logicalW = rect.width;
    logicalH = rect.height;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  resizeCanvas();
  window.addEventListener('resize', () => {
    resizeCanvas();
    if (background) background.resize();
    if (stars) stars.resize();
    if (game) {
      game.width = logicalW;
      game.height = logicalH;
    }
  });

  function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function drawVignette(ctx, w, h) {
    const g = ctx.createRadialGradient(
      w * 0.5,
      h * 0.45,
      Math.min(w, h) * 0.2,
      w * 0.5,
      h * 0.5,
      Math.max(w, h) * 0.78
    );
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.55)');

    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  let _scan = null;
  function drawScanlines(ctx, w, h) {
    if (!_scan || _scan.width !== w || _scan.height !== h) {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const g = c.getContext('2d');

      g.fillStyle = 'rgba(255,255,255,0.03)';
      for (let y = 0; y < h; y += 3) g.fillRect(0, y, w, 1);

      _scan = c;
    }

    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.35;
    ctx.drawImage(_scan, 0, 0);
    ctx.restore();
  }

  function drawThruster(
    ctx,
    x,
    y,
    w,
    h,
    isRed = false,
    isDark = false,
    isCelestial = false,
    isGolden = false,
    isStarBreaker = false
  ) {
    const t = performance.now() * 0.008;

    const cx = x + w * 0.5;
    const baseY = y + h * 0.56;

    const len = h * (0.55 + 0.08 * Math.sin(t * 2));
    const baseW = w * (0.75 + 0.06 * Math.sin(t * 3));
    const sideW = w * (0.45 + 0.05 * Math.sin(t * 2.4));

    const C = isRed
      ? {
          shadow: 'rgba(255,80,90,0.9)',
          haze1: 'rgba(255,255,255,0.35)',
          haze2: 'rgba(255,120,120,0.28)',
          haze3: 'rgba(255,30,40,0)',
          core1: 'rgba(255,255,255,0.95)',
          core2: 'rgba(255,150,150,0.85)',
          core3: 'rgba(255,70,70,0.45)',
          core4: 'rgba(180,0,20,0)',
          side1: 'rgba(255,255,255,0.8)',
          side2: 'rgba(255,130,130,0.65)',
          side3: 'rgba(255,30,40,0)',
        }
      : isDark
        ? {
            shadow: 'rgba(120, 40, 255, 0.75)',
            haze1: 'rgba(255,255,255,0.10)',
            haze2: 'rgba(120, 40, 255, 0.22)',
            haze3: 'rgba(0,0,0,0)',
            core1: 'rgba(220,220,255,0.55)',
            core2: 'rgba(140, 60, 255, 0.55)',
            core3: 'rgba(50, 0, 110, 0.35)',
            core4: 'rgba(0,0,0,0)',
            side1: 'rgba(210,210,255,0.22)',
            side2: 'rgba(120, 40, 255, 0.28)',
            side3: 'rgba(0,0,0,0)',
          }
        : isCelestial
          ? {
              shadow: 'rgba(255, 150, 205, 0.85)',
              haze1: 'rgba(255,255,255,0.36)',
              haze2: 'rgba(250, 118, 184, 0.3)',
              haze3: 'rgba(255,120,190,0)',
              core1: 'rgba(255,255,255,0.96)',
              core2: 'rgba(255, 103, 186, 0.88)',
              core3: 'rgba(255, 123, 196, 0.48)',
              core4: 'rgba(255,120,190,0)',
              side1: 'rgba(255,255,255,0.82)',
              side2: 'rgba(255, 109, 187, 0.68)',
              side3: 'rgba(255,140,200,0)',
            }
          : isGolden
            ? {
                shadow: 'rgba(255,215,60,0.95)',
                haze1: 'rgba(255,255,255,0.55)',
                haze2: 'rgba(255,215,0,0.45)',
                haze3: 'rgba(255,180,0,0)',
                core1: 'rgba(255,255,255,1)',
                core2: 'rgba(255,235,120,0.95)',
                core3: 'rgba(255,200,0,0.65)',
                core4: 'rgba(255,150,0,0)',
                side1: 'rgba(255,255,255,0.95)',
                side2: 'rgba(255,215,0,0.85)',
                side3: 'rgba(255,180,0,0)',
              }
            : {
                shadow: 'rgba(0,200,255,0.85)',
                haze1: 'rgba(255,255,255,0.35)',
                haze2: 'rgba(0,220,255,0.28)',
                haze3: 'rgba(0,120,255,0)',
                core1: 'rgba(255,255,255,0.95)',
                core2: 'rgba(0,235,255,0.85)',
                core3: 'rgba(0,140,255,0.45)',
                core4: 'rgba(0,80,255,0)',
                side1: 'rgba(255,255,255,0.8)',
                side2: 'rgba(0,220,255,0.65)',
                side3: 'rgba(0,120,255,0)',
              };

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    ctx.globalAlpha = 0.55;
    ctx.shadowColor = C.shadow;
    ctx.shadowBlur = 34;

    const haze = ctx.createRadialGradient(
      cx,
      baseY,
      0,
      cx,
      baseY + len * 0.35,
      len * 0.95
    );
    haze.addColorStop(0, C.haze1);
    haze.addColorStop(0.25, C.haze2);
    haze.addColorStop(1, C.haze3);
    ctx.fillStyle = haze;
    ctx.beginPath();
    ctx.ellipse(
      cx,
      baseY + len * 0.25,
      baseW * 0.55,
      len * 0.55,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.globalAlpha = 0.95;
    ctx.shadowBlur = 26;

    const core = ctx.createRadialGradient(cx, baseY, 0, cx, baseY + len, len);
    core.addColorStop(0, C.core1);
    core.addColorStop(0.28, C.core2);
    core.addColorStop(0.6, C.core3);
    core.addColorStop(1, C.core4);
    ctx.fillStyle = core;

    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    ctx.bezierCurveTo(
      cx - baseW * 0.55,
      baseY + len * 0.18,
      cx - baseW * 0.25,
      baseY + len * 0.75,
      cx,
      baseY + len
    );
    ctx.bezierCurveTo(
      cx + baseW * 0.25,
      baseY + len * 0.75,
      cx + baseW * 0.55,
      baseY + len * 0.18,
      cx,
      baseY
    );
    ctx.closePath();
    ctx.fill();

    const ox = w * 0.22;

    const side = (sx) => {
      const g = ctx.createRadialGradient(
        sx,
        baseY,
        0,
        sx,
        baseY + len * 0.9,
        len * 0.85
      );
      g.addColorStop(0, C.side1);
      g.addColorStop(0.35, C.side2);
      g.addColorStop(1, C.side3);
      ctx.fillStyle = g;

      ctx.beginPath();
      ctx.moveTo(sx, baseY);
      ctx.bezierCurveTo(
        sx - sideW * 0.42,
        baseY + len * 0.22,
        sx - sideW * 0.18,
        baseY + len * 0.78,
        sx,
        baseY + len * 0.95
      );
      ctx.bezierCurveTo(
        sx + sideW * 0.18,
        baseY + len * 0.78,
        sx + sideW * 0.42,
        baseY + len * 0.22,
        sx,
        baseY
      );
      ctx.closePath();
      ctx.fill();
    };

    side(cx - ox);
    side(cx + ox);

    ctx.globalAlpha = 0.9;
    ctx.shadowBlur = 18;
    ctx.fillStyle = isDark
      ? 'rgba(210,190,255,0.35)'
      : isCelestial
        ? 'rgba(255,225,240,0.88)'
        : 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.ellipse(cx, baseY + len * 0.15, w * 0.08, h * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  window.drawRoundedRect = drawRoundedRect;
  window.checkCollision = checkCollision;

  const WEAPON_BEHAVIOR = {
    laser: {
      fireRate: 200,
      fire(player) {
        const centerX = player.x + player.width / 2;
        const y = player.y;
        const damage = player.damage || 1;
        const piercing = !!player.piercingShot;

        const p1 = new Projectile(player.game, centerX - 8, y);
        p1.damage = damage;
        p1.piercing = piercing;
        player.projectiles.push(p1);

        if (player.doubleShot) {
          const p2 = new Projectile(player.game, centerX + 8, y);
          p2.damage = damage;
          p2.piercing = piercing;
          player.projectiles.push(p2);
        }
      },
    },

    missile: {
      fireRate: 700,
      fire(player) {
        const centerX = player.x + player.width / 2;
        const y = player.y;
        const damage = 5 + ((player.damage || 1) - 1);
        const piercing = !!player.piercingShot;
        const spacing = 20;

        const m1 = new Missile(player.game, centerX - spacing, y);
        m1.damage = damage;
        m1.piercing = piercing;
        player.projectiles.push(m1);

        if (player.doubleShot) {
          const m2 = new Missile(player.game, centerX + spacing, y);
          m2.damage = damage;
          m2.piercing = piercing;
          player.projectiles.push(m2);
        }
      },
    },

    triangleShooter: {
      fireRate: 700,
      fire(player) {
        const centerX = player.x + player.width / 2;
        const y = player.y;
        const damage = 5 + ((player.damage || 1) - 1);
        const piercing = !!player.piercingShot;

        const t1 = new TriangleProjectile(player.game, centerX - 9, y);
        t1.damage = damage;
        t1.piercing = piercing;
        player.projectiles.push(t1);

        if (player.doubleShot) {
          const t2 = new TriangleProjectile(player.game, centerX + 9, y);
          t2.damage = damage;
          t2.piercing = piercing;
          player.projectiles.push(t2);
        }
      },
    },
  };

  class Mouse {
    constructor(game) {
      this.game = game;
      this.pressed = false;
      this.x = 0;
      this.y = 0;
      this.fireInterval = null;
      this.activePointerId = null;

      const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      };

      const startFiring = () => {
        this.pressed = true;
      };

      const stopFiring = () => {
        this.pressed = false;
        this.activePointerId = null;
      };
      canvas.addEventListener(
        'pointerdown',
        (e) => {
          e.preventDefault();
          startMusic();

          this.activePointerId = e.pointerId;
          canvas.setPointerCapture(e.pointerId);

          const p = getPos(e);
          this.x = p.x;
          this.y = p.y;

          this.pressed = true;

          if (this.game.stageIntroActive) {
            this.handleClick(this.x, this.y);
            stopFiring();
            return;
          }

          if (this.game.upgradeCardsShowing) {
            this.handleClick(this.x, this.y);
            stopFiring();
            return;
          }

          startFiring();
        },
        { passive: false }
      );

      canvas.addEventListener(
        'pointermove',
        (e) => {
          if (
            this.activePointerId !== null &&
            e.pointerId !== this.activePointerId
          )
            return;
          e.preventDefault();
          const p = getPos(e);
          this.x = p.x;
          this.y = p.y;
        },
        { passive: false }
      );

      canvas.addEventListener('pointerup', stopFiring, { passive: true });
      canvas.addEventListener('pointercancel', stopFiring, { passive: true });
      canvas.addEventListener('lostpointercapture', stopFiring, {
        passive: true,
      });

      window.addEventListener('keydown', (e) => {
        if (e.key === 'r' && this.game.gameOver) restartGame();
      });
    }

    handleClick(mx, my) {
      if (this.game.stageIntroActive) {
        const btn = this.game.getIntroSkipButtonRect();

        if (
          mx > btn.x &&
          mx < btn.x + btn.width &&
          my > btn.y &&
          my < btn.y + btn.height
        ) {
          this.game.skipStageIntro();
        }

        return;
      }
      this.game.upgradeCards.forEach((card) => {
        if (
          mx > card.x &&
          mx < card.x + card.width &&
          my > card.y &&
          my < card.y + card.height
        ) {
          this.game.applyUpgrade(card.type);
          this.game.upgradeCardsShowing = false;
          if (this.game.level >= 31) {
            this.game.nextRageScore += 20;
          } else this.game.nextRageScore += 10;
        }
      });
    }

    restartFire() {}
  }

  class ScrollingBackground {
    constructor(canvas, image, speed = 1) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.image = image;
      this.speed = speed;

      const rect = canvas.getBoundingClientRect();
      this.w = rect.width;
      this.h = rect.height;

      this.y1 = 0;
      this.y2 = -this.h;
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.w = rect.width;
      this.h = rect.height;

      this.y1 = 0;
      this.y2 = -this.h;
    }

    update(deltaTime) {
      const dt = deltaTime / 16.67;

      this.y1 += this.speed * dt;
      this.y2 += this.speed * dt;

      if (this.y1 >= this.h) this.y1 = this.y2 - this.h;
      if (this.y2 >= this.h) this.y2 = this.y1 - this.h;
    }

    drawCover(y) {
      const img = this.image;
      if (!img.complete || !img.naturalWidth) return;

      const iw = img.naturalWidth;
      const ih = img.naturalHeight;

      const scale = Math.max(this.w / iw, this.h / ih);
      const sw = this.w / scale;
      const sh = this.h / scale;
      const sx = (iw - sw) / 2;
      const sy = (ih - sh) / 2;

      this.ctx.drawImage(img, sx, sy, sw, sh, 0, y, this.w, this.h);
    }

    draw() {
      this.drawCover(this.y1);
      this.drawCover(this.y2);
    }
  }

  class Starfield {
    constructor(canvas, count = 150) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.count = count;
      this.stars = [];
      this.w = canvas.width;
      this.h = canvas.height;
      this.seed();
    }

    seed() {
      this.w = this.canvas.width;
      this.h = this.canvas.height;
      this.stars.length = 0;

      for (let i = 0; i < this.count; i++) {
        const layer = Math.random();
        this.stars.push({
          x: Math.random() * this.w,
          y: Math.random() * this.h,
          r: 0.6 + Math.random() * 1.8,
          layer,
          baseA: 0.25 + Math.random() * 0.55,
          tw: 0.5 + Math.random() * 1.8,
          p: Math.random() * Math.PI * 2,
        });
      }
    }

    resize() {
      this.seed();
    }

    update(deltaTime, speed = 1.2) {
      const dt = deltaTime / 16.67;

      for (const s of this.stars) {
        const v = speed * (0.35 + s.layer * 1.2);
        s.y += v * dt;

        s.p += 0.02 * dt * s.tw;

        if (s.y - s.r > this.h) {
          s.y = -s.r;
          s.x = Math.random() * this.w;
        }
      }
    }

    draw() {
      const ctx = this.ctx;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      for (const s of this.stars) {
        const twinkle = 0.6 + 0.4 * Math.sin(s.p);
        const a = Math.min(1, s.baseA * 1.6 * twinkle);
        ctx.globalAlpha = a;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        const glow = 0.8 + 1.6 * s.layer;
        ctx.globalAlpha = a * 0.55;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * glow, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  class Particle {
    constructor(x, y, vx, vy, life, size, hue) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.life = life;
      this.maxLife = life;
      this.size = size;
      this.hue = hue;
      this.markedForDeletion = false;
    }

    update(dt) {
      const k = dt / 16.67;
      this.x += this.vx * k;
      this.y += this.vy * k;
      this.vy += 0.08 * k;

      this.life -= dt;
      if (this.life <= 0) this.markedForDeletion = true;
    }

    draw(ctx) {
      const p = clamp(this.life / this.maxLife, 0, 1);
      const r = this.size * (0.3 + 0.7 * p);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.9 * p;

      ctx.shadowColor = `hsla(${this.hue},100%,60%,1)`;
      ctx.shadowBlur = 14;
      ctx.fillStyle = `hsla(${this.hue},100%,60%,1)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.8 * p;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  class Player {
    constructor(game) {
      this.game = game;
      this.width = 100;
      this.height = 120;
      this.x = this.game.width / 2 - this.width / 2;
      this.y = this.game.height - this.height - 20;
      this.speedX = 0;
      this.speedY = 0;
      this.projectiles = [];
      this.lives = 3;
      this.damage = 1;
      this.moveBoost = 1;
      this.piercingShot = false;
      this.doubleShot = false;
      this.invulnerable = false;
      this.invulnerableTimer = 0;
      this.invulnerableInterval = 3000;
      this.shootingInterval = 200;
      this.lastFireTime = 0;
      this.weapon = localStorage.getItem('equippedWeapon') || 'laser';
      this.magnetLocked = false;
      this.blinded = false;
      this.blindTimer = 0;
      this.blindDuration = 2500;
      this.cursorHidden = false;

      const skinId = getEquippedSkin();
      this.isRedClassic = skinId === 'redclassic';
      this.isDarkReaper = skinId === 'darkreaper' || skinId === 'darkvoid';
      this.isCelestialSakura = skinId === 'celestialsakura';
      this.isGoldenCore = skinId === 'goldencore';
      this.isStarBreaker = skinId === 'starbreaker';

      const skinDef = SKIN_TO_PLAYER_IMG_ID[skinId];

      let imgId = 'player';
      let frameY = this.isRedClassic ? 0 : 1;

      if (typeof skinDef === 'string') {
        imgId = skinDef;
      } else if (skinDef && typeof skinDef === 'object') {
        imgId = skinDef.imgId || imgId;
        if (Number.isFinite(skinDef.frameY)) frameY = skinDef.frameY;
      }

      this.slowed = false;
      this.slowTimer = 0;
      this.slowDuration = 1400;
      this.moveSlowMultiplier = 0.15;

      this.image =
        document.getElementById(imgId) ||
        cached?.dom?.[imgId] ||
        document.getElementById('player') ||
        cached?.dom?.player;

      this.frameX = 0;
      this.frameY = frameY;

      this.frameTimer = 0;
      this.frameInterval = 120;
      this.spriteWidth = 128;
      this.spriteHeight = 128;
      this.fireRateMult = 1;
    }

    update(deltaTime) {
      this.frameTimer += deltaTime;
      if (this.frameTimer > this.frameInterval) {
        this.frameX++;
        if (this.frameX >= 6) this.frameX = 0;
        this.frameTimer = 0;
      }

      if (this.slowed) {
        this.slowTimer += deltaTime;
        if (this.slowTimer >= this.slowDuration) {
          this.slowed = false;
          this.slowTimer = 0;
        }
      }

      if (!this.magnetLocked && this.game.mouse.pressed) {
        const targetX = this.game.mouse.x - this.width / 2;
        const targetY = this.game.mouse.y - this.height / 2;
        const boost = this.moveBoost || 1;
        const moveFactor = this.slowed
          ? 0.22 * this.moveSlowMultiplier * boost
          : 0.22 * boost;

        this.x += (targetX - this.x) * moveFactor;
        this.y += (targetY - this.y) * moveFactor;

        if (!this.cursorHidden) {
          canvas.style.cursor = 'none';
          this.cursorHidden = true;
        }
      } else {
        if (this.cursorHidden) {
          canvas.style.cursor = 'default';
          this.cursorHidden = false;
        }
      }

      if (this.x < 0) this.x = 0;
      if (this.x + this.width > this.game.width) {
        this.x = this.game.width - this.width;
      }
      if (this.y < 0) this.y = 0;
      if (this.y + this.height > this.game.height) {
        this.y = this.game.height - this.height;
      }

      for (let i = 0; i < this.projectiles.length; i++) {
        this.projectiles[i].update(deltaTime);
      }
      compactArray(this.projectiles);

      if (this.blinded) {
        this.blindTimer += deltaTime;
        if (this.blindTimer >= this.blindDuration) {
          this.blinded = false;
          this.blindTimer = 0;
        }
      }
    }

    draw(context) {
      context.save();

      if (this.invulnerable) context.globalAlpha = 0.65;

      if (this.isGoldenCore) {
        const t = performance.now() * 0.008;
        const cx = this.x + this.width * 0.5;
        const cy = this.y + this.height * 0.88;

        context.save();
        context.globalCompositeOperation = 'lighter';

        const aura = context.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          this.width * 0.42
        );
        aura.addColorStop(0, 'rgba(255,255,220,0.28)');
        aura.addColorStop(0.35, 'rgba(255,215,90,0.22)');
        aura.addColorStop(1, 'rgba(255,180,0,0)');
        context.globalAlpha = 0.9;
        context.fillStyle = aura;
        context.beginPath();
        context.arc(cx, cy, this.width * 0.42, 0, Math.PI * 2);
        context.fill();

        for (let i = 0; i < 7; i++) {
          const ang = t * 1.2 + i * 0.9;
          const r = this.width * (0.12 + (i % 3) * 0.05);
          const sx = cx + Math.cos(ang) * r;
          const sy = cy + Math.sin(ang * 1.4) * 8 - i * 3;

          const sparkle = 0.65 + 0.35 * Math.sin(t * 4 + i * 2);

          context.globalAlpha = sparkle;
          context.fillStyle = 'rgba(255,235,140,0.95)';
          context.beginPath();
          context.arc(sx, sy, 1.5 + (i % 2), 0, Math.PI * 2);
          context.fill();

          context.globalAlpha = sparkle * 0.8;
          context.strokeStyle = 'rgba(255,250,210,0.95)';
          context.lineWidth = 1.2;
          context.beginPath();
          context.moveTo(sx - 4, sy);
          context.lineTo(sx + 4, sy);
          context.moveTo(sx, sy - 4);
          context.lineTo(sx, sy + 4);
          context.stroke();
        }

        if (this.isStarBreaker) {
          const t = performance.now() * 0.006;
          const cx = this.x + this.width * 0.5;
          const cy = this.y + this.height * 0.52;

          context.save();
          context.globalCompositeOperation = 'lighter';

          const aura = context.createRadialGradient(
            cx,
            cy,
            0,
            cx,
            cy,
            this.width * 0.55
          );
          aura.addColorStop(0, 'rgba(255,255,255,0.22)');
          aura.addColorStop(0.35, 'rgba(140,220,255,0.18)');
          aura.addColorStop(1, 'rgba(60,100,255,0)');
          context.fillStyle = aura;
          context.beginPath();
          context.arc(cx, cy, this.width * 0.55, 0, Math.PI * 2);
          context.fill();

          for (let i = 0; i < 7; i++) {
            const ang = t * 1.4 + i * 0.9;
            const r = this.width * (0.18 + (i % 3) * 0.06);
            const sx = cx + Math.cos(ang) * r;
            const sy = cy + Math.sin(ang * 1.3) * r * 0.45;

            context.fillStyle = 'rgba(200,240,255,0.95)';
            context.beginPath();
            context.arc(sx, sy, 2 + (i % 2), 0, Math.PI * 2);
            context.fill();

            context.strokeStyle = 'rgba(255,255,255,0.8)';
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(sx - 4, sy);
            context.lineTo(sx + 4, sy);
            context.moveTo(sx, sy - 4);
            context.lineTo(sx, sy + 4);
            context.stroke();
          }

          context.restore();
        }

        for (let i = 0; i < 5; i++) {
          const rise = (t * 35 + i * 17) % 26;
          const px =
            this.x +
            this.width * (0.28 + ((i * 0.17 + Math.sin(t + i)) * 0.22 + 0.22));
          const py = this.y + this.height * 0.95 - rise;

          const size = 1.8 + ((i + 1) % 3);
          const alpha = 0.35 + 0.45 * (1 - rise / 26);

          context.globalAlpha = alpha;
          context.fillStyle = 'rgba(255,210,70,0.95)';
          context.beginPath();
          context.arc(px, py, size, 0, Math.PI * 2);
          context.fill();

          context.globalAlpha = alpha * 0.9;
          context.fillStyle = 'rgba(255,255,255,0.95)';
          context.beginPath();
          context.arc(px, py, size * 0.45, 0, Math.PI * 2);
          context.fill();
        }

        const pulseR = this.width * (0.16 + 0.03 * Math.sin(t * 3));
        const pulse = context.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          pulseR * 2.4
        );
        pulse.addColorStop(0, 'rgba(255,255,255,0.9)');
        pulse.addColorStop(0.4, 'rgba(255,225,110,0.65)');
        pulse.addColorStop(1, 'rgba(255,180,0,0)');
        context.globalAlpha = 0.8;
        context.fillStyle = pulse;
        context.beginPath();
        context.arc(cx, cy, pulseR * 2.2, 0, Math.PI * 2);
        context.fill();

        context.restore();
      }
      drawThruster(
        context,
        this.x,
        this.y,
        this.width,
        this.height,
        this.isRedClassic,
        this.isDarkReaper,
        this.isCelestialSakura,
        this.isGoldenCore,
        this.isStarBreaker
      );

      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );

      context.restore();

      for (let i = 0; i < this.projectiles.length; i++) {
        this.projectiles[i].draw(context);
      }
    }

    fire() {
      const now = performance.now();
      const weapon = WEAPON_BEHAVIOR[this.weapon];
      if (!weapon) return;

      const effectiveRate = Math.max(60, weapon.fireRate * this.fireRateMult);
      if (now - this.lastFireTime < effectiveRate) return;

      this.lastFireTime = now;
      this.shootingInterval = effectiveRate;
      weapon.fire(this);
    }
  }

  class Explosion {
    constructor(game, x, y) {
      this.game = game;
      this.spriteWidth = 200;
      this.spriteHeight = 200;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;

      this.x = x - this.width / 2;
      this.y = y - this.height / 2;

      this.frameX = 0;
      this.frameY = 0;

      this.fps = 60;
      this.timer = 0;
      this.interval = 1000 / this.fps;

      this.markedForDeletion = false;
      this.maxFrame = 8;

      this.image = EXPLOSION_IMG;

      if (this.game && this.game.spawnSparks) {
        this.game.spawnSparks(x, y, 16, 190);
      }
    }

    update(deltaTime) {
      if (this.timer > this.interval) {
        this.frameX++;
        this.timer = 0;
      } else {
        this.timer += deltaTime;
      }

      if (this.frameX > this.maxFrame) this.markedForDeletion = true;
    }
    draw(context) {
      if (!this.image) return;

      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }

  window.Explosion = Explosion;

  class Projectile {
    constructor(game, x, y) {
      this.game = game;
      this.width = 4;
      this.height = 14;
      this.x = x;
      this.y = y;
      this.speedY = -4.5;

      this.damage = 1;
      this.markedForDeletion = false;

      this.len = 22;
      this.w = 3;
      this.phase = Math.random() * Math.PI * 2;
      this.hitTargets = new Set();
    }

    update(deltaTime) {
      this.y += this.speedY;
      if (this.y < -this.len - 30) this.markedForDeletion = true;
    }

    draw(ctx) {
      const t = performance.now() * 0.008 + this.phase;
      const pulse = 0.8 + 0.2 * Math.sin(t * 3);

      const cx = this.x + this.width / 2;
      const topY = this.y;
      const botY = this.y + this.len;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // ==== OUTER GLOW (הילה חיצונית רכה) ====
      ctx.globalAlpha = 0.15 * pulse;
      ctx.lineWidth = this.w * 8;
      ctx.strokeStyle = 'rgba(0,180,255,1)';
      ctx.beginPath();
      ctx.moveTo(cx, botY);
      ctx.lineTo(cx, topY);
      ctx.stroke();

      const grad = ctx.createLinearGradient(cx, botY, cx, topY);
      grad.addColorStop(0, 'rgba(0,120,255,0)');
      grad.addColorStop(0.2, 'rgba(0,200,255,0.7)');
      grad.addColorStop(0.5, 'rgba(120,255,255,1)');
      grad.addColorStop(0.8, 'rgba(255,255,255,1)');
      grad.addColorStop(1, 'rgba(255,255,255,1)');

      ctx.globalAlpha = 0.95;
      ctx.lineWidth = this.w * 2.2;
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(cx, botY);
      ctx.lineTo(cx, topY);
      ctx.stroke();

      ctx.globalAlpha = 1;
      ctx.lineWidth = Math.max(1.5, this.w * 0.8);
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(cx, botY);
      ctx.lineTo(cx, topY);
      ctx.stroke();

      const tipRadius = 3.5 + 1.2 * Math.sin(t * 4);

      const tipGrad = ctx.createRadialGradient(
        cx,
        topY,
        0,
        cx,
        topY,
        tipRadius * 3
      );

      tipGrad.addColorStop(0, 'rgba(255,255,255,1)');
      tipGrad.addColorStop(0.3, 'rgba(120,255,255,1)');
      tipGrad.addColorStop(1, 'rgba(0,150,255,0)');

      ctx.globalAlpha = 1;
      ctx.fillStyle = tipGrad;
      ctx.beginPath();
      ctx.arc(cx, topY, tipRadius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.35;
      ctx.lineWidth = this.w * 1.4;
      ctx.strokeStyle = 'rgba(180,255,255,1)';
      ctx.beginPath();
      ctx.moveTo(cx + Math.sin(t * 5) * 1.2, botY);
      ctx.lineTo(cx, topY + 6);
      ctx.stroke();

      ctx.restore();
    }
  }

  class Missile extends Projectile {
    constructor(game, x, y) {
      super(game, x, y);
      this.width = 25;
      this.height = 30;

      this.vy = -4.5;
      this.accY = -0.25;
      this.maxSpeed = -14;

      this.damage = 5;

      this.image = document.getElementById('missile');
      this.frameX = 0;
      this.frameY = 0;
      this.frameTimer = 0;
      this.frameInterval = 80;
      this.spriteWidth = 25;
      this.spriteHeight = 30;
      this.maxFrame = 7;
    }

    update(deltaTime) {
      const dt = deltaTime / 16.67;

      this.vy += this.accY * dt;
      if (this.vy < this.maxSpeed) this.vy = this.maxSpeed;

      this.y += this.vy * dt;

      if (this.y < -this.height) this.markedForDeletion = true;

      this.frameTimer += deltaTime;
      if (this.frameTimer > this.frameInterval) {
        this.frameX = (this.frameX + 1) % this.maxFrame;
        this.frameTimer = 0;
      }
    }

    draw(context) {
      if (!this.image) return;

      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }

  class TriangleProjectile extends Projectile {
    constructor(
      game,
      x,
      y,
      speedX = 0,
      speedY = -4,
      canSplit = true,
      graceMs = 0
    ) {
      super(game, x, y);

      this.width = 18;
      this.height = 22;

      this.speedX = speedX;
      this.speedY = speedY;

      this.damage = 5;
      this.split = canSplit;

      this.grace = graceMs;
    }

    update(deltaTime) {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.grace > 0) this.grace -= deltaTime;

      if (
        this.y < -this.height ||
        this.x < -this.width ||
        this.x > this.game.width + this.width
      ) {
        this.markedForDeletion = true;
      }
    }
    draw(ctx) {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;

      const t = performance.now() * 0.01;
      const pulse = 0.85 + 0.15 * Math.sin(t * 2 + this.phase);

      const dx = this.speedX || 0;
      const dy = this.speedY || -1;
      const ang = Math.atan2(dy, dx) + Math.PI / 2;

      const len = this.height * 1.1;
      const wid = this.width * 0.55;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ang);
      ctx.globalCompositeOperation = 'lighter';

      ctx.globalAlpha = 0.22 * pulse;
      ctx.shadowColor = 'rgba(0,255,255,0.9)';
      ctx.shadowBlur = 26;
      ctx.fillStyle = 'rgba(0,180,255,0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 0, wid * 1.35, len * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      const g = ctx.createLinearGradient(0, -len, 0, len);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.25, 'rgba(120,255,255,1)');
      g.addColorStop(0.65, 'rgba(0,200,255,0.95)');
      g.addColorStop(1, 'rgba(0,120,255,0)');

      ctx.globalAlpha = 0.95;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -len);
      ctx.bezierCurveTo(-wid, -len * 0.25, -wid * 0.85, len * 0.55, 0, len);
      ctx.bezierCurveTo(wid * 0.85, len * 0.55, wid, -len * 0.25, 0, -len);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = 0.9;
      ctx.lineWidth = Math.max(2, wid * 0.25);
      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      ctx.beginPath();
      ctx.moveTo(0, len * 0.55);
      ctx.lineTo(0, -len * 0.85);
      ctx.stroke();

      const tipR = 4 + 2 * Math.sin(t * 3 + this.phase);
      const tip = ctx.createRadialGradient(
        0,
        -len * 0.92,
        0,
        0,
        -len * 0.92,
        tipR * 3
      );
      tip.addColorStop(0, 'rgba(255,255,255,1)');
      tip.addColorStop(0.35, 'rgba(120,255,255,1)');
      tip.addColorStop(1, 'rgba(0,180,255,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = tip;
      ctx.beginPath();
      ctx.arc(0, -len * 0.92, tipR * 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.28;
      ctx.lineWidth = wid * 0.35;
      ctx.strokeStyle = 'rgba(0,220,255,1)';
      for (let i = 0; i < 3; i++) {
        const ox = Math.sin(t * 2.6 + i) * 0.7 * wid * 0.25;
        const oy1 = len * (0.2 + i * 0.18);
        const oy2 = len * (0.65 + i * 0.18);
        ctx.beginPath();
        ctx.moveTo(ox, oy1);
        ctx.lineTo(ox, oy2);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  const PET_CLASSES = {
    dog: Pet,
    siren: Siren,
  };

  class UI {
    constructor(game) {
      this.game = game;
      this.fontSize = 26;
      this.fontFamily = '"Archivo Black", system-ui, sans-serif';
      this.color = 'white';

      this.bossText = '';
      this.bossTimer = 0;
      this.bossDuration = 4500;

      this.prevLives = game.player.lives;
      this.hurtPulse = 0;

      this.superColors = [
        { p: 0.0, c: { r: 0, g: 200, b: 255 } },
        { p: 0.25, c: { r: 0, g: 150, b: 255 } },
        { p: 0.5, c: { r: 0, g: 255, b: 180 } },
        { p: 0.75, c: { r: 180, g: 255, b: 80 } },
        { p: 1.0, c: { r: 255, g: 220, b: 80 } },
      ];
    }

    draw(ctx) {
      if (this.bossTimer > 0) {
        this.bossTimer -= 16.67;
        if (this.bossTimer < 0) this.bossTimer = 0;
      }

      ctx.save();

      ctx.fillStyle = this.color;
      ctx.font = `${this.fontSize}px ${this.fontFamily}`;
      ctx.fillText(
        `Score: ${this.game.score} / ${this.game.winningScore}`,
        20,
        30
      );

      this.drawLives(ctx);
      this.drawSuperGauge(ctx);

      ctx.restore();

      this.drawBossText(ctx);
    }

    drawLives(ctx) {
      const lives = Math.max(0, this.game.player.lives);

      if (lives < this.prevLives) this.hurtPulse = 1;
      this.prevLives = lives;
      this.hurtPulse *= 0.9;

      const x = 20;
      const y = 65;

      const shake =
        this.hurtPulse > 0.02
          ? Math.sin(performance.now() * 0.06) * 3 * this.hurtPulse
          : 0;

      const pop = 1 + this.hurtPulse * 0.35;

      ctx.save();
      ctx.translate(shake, 0);

      ctx.font = `700 22px ${this.fontFamily}`;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText('Lives:', x, y);

      const startX = x + 70;
      const gap = 22;
      const maxLives = 3;

      for (let i = 0; i < maxLives; i++) {
        const isFull = i < lives;
        const icon = isFull ? '❤️' : '🖤';

        ctx.save();
        const ix = startX + i * gap;

        if (isFull && this.hurtPulse > 0.02) {
          ctx.translate(ix + 10, y - 10);
          ctx.scale(pop, pop);
          ctx.translate(-(ix + 10), -(y - 10));
        }

        ctx.globalAlpha = isFull ? 1 : 0.35;
        ctx.fillText(icon, ix, y);
        ctx.restore();
      }

      ctx.restore();
    }

    drawSuperGauge(ctx) {
      const barWidth = 200;
      const barHeight = 16;
      const x = this.game.width / 2 - barWidth / 2;
      const y = this.game.height - 30;

      const progress = Math.min(this.game.superGaugeVisual, 1);

      ctx.save();

      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(x, y, barWidth, barHeight);

      const color = this.getSuperColor(progress);

      if (progress > 0.85) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
      }

      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth * progress, barHeight);

      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, barWidth, barHeight);

      if (progress >= 1) {
        ctx.fillStyle = color;
        ctx.font = `800 14px ${this.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.fillText('SUPER READY', this.game.width / 2, y - 6);
      }

      ctx.restore();
    }

    getSuperColor(progress) {
      for (let i = 0; i < this.superColors.length - 1; i++) {
        const a = this.superColors[i];
        const b = this.superColors[i + 1];

        if (progress >= a.p && progress <= b.p) {
          const t = (progress - a.p) / (b.p - a.p);
          return this.lerpColor(a.c, b.c, t);
        }
      }
      return 'white';
    }

    lerp(a, b, t) {
      return a + (b - a) * t;
    }

    lerpColor(c1, c2, t) {
      return `rgb(
      ${Math.round(this.lerp(c1.r, c2.r, t))},
      ${Math.round(this.lerp(c1.g, c2.g, t))},
      ${Math.round(this.lerp(c1.b, c2.b, t))}
    )`;
    }

    showBoss(text) {
      this.bossText = text;
      this.bossTimer = this.bossDuration;
    }

    drawBossText(ctx) {
      if (this.bossTimer <= 0 || !this.bossText) return;

      const progress = 1 - this.bossTimer / this.bossDuration;
      const fadeIn = Math.min(progress / 0.2, 1);
      const fadeOut = Math.min(this.bossTimer / 600, 1);
      const alpha = Math.min(fadeIn, fadeOut);

      const pulse = 1 + Math.sin(performance.now() * 0.01) * 0.05;
      const scale = (0.9 + fadeIn * 0.25) * pulse;

      const x = this.game.width / 2;
      const y = this.game.height / 2;

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const fontSize = Math.min(this.game.width * 0.09, 70);
      ctx.font = `900 ${fontSize}px ${this.fontFamily}`;

      const textWidth = ctx.measureText(this.bossText).width;

      const gradient = ctx.createLinearGradient(
        -textWidth / 2,
        0,
        textWidth / 2,
        0
      );
      gradient.addColorStop(0, '#ff2a2a');
      gradient.addColorStop(0.5, '#ffffff');
      gradient.addColorStop(1, '#ff2a2a');

      ctx.globalAlpha = alpha;
      ctx.shadowColor = 'rgba(255,0,0,1)';
      ctx.shadowBlur = 35;

      ctx.fillStyle = gradient;
      ctx.fillText(this.bossText, 0, 0);

      ctx.shadowBlur = 0;
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#5a0000';
      ctx.strokeText(this.bossText, 0, 0);

      ctx.restore();
    }
  }

  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;

      this.shakeTime = 0;
      this.shakeDuration = 0;
      this.shakeMagnitude = 0;

      this.bossSpawned = false;
      this.bossActive = false;
      this.bossKilled = false;

      this.level = currentLevel;

      this.stage = 1;
      this.score = 0;

      this.enemyTimer = 0;
      const spawnSettings = this.getSpawnSettings();
      this.enemyInterval = spawnSettings.enemyInterval;
      this.enemies = [];
      this.enemyMines = [];

      this.player = new Player(this);

      const petId = getEquippedPet();
      this.pet =
        petId && PET_CLASSES[petId] ? new PET_CLASSES[petId](this) : null;
      this.petCooldownMult = 1;
      this.petCooldownMin = 2000;

      this.mouse = new Mouse(this);
      this.ui = new UI(this);
      this.explosions = [];
      this.enemyBullets = [];

      if (this.level >= 51) this.nextRageScore = 20;
      else this.nextRageScore = 10;

      if (this.level === 100) this.winningScore = 999;
      else if (this.level >= 51) this.winningScore = 100;
      else if (this.level >= 31) this.winningScore = 70;
      else if (this.level >= 11) this.winningScore = 50;
      else if (this.level == 1) this.winningScore = 15;
      else this.winningScore = 30;

      this.equippedSuper =
        localStorage.getItem('equippedSuper') || 'superLaser';
      this.superAttacks = [];
      this.superAttackGauge = 0;
      const superMap = window.SUPER_TYPES || {};
      const superData = superMap[this.equippedSuper];
      this.superAttackReadyGauge = superData?.charge ?? 5;
      this.superReady = false;
      this.superActive = false;

      this.gameOver = false;
      this.win = false;
      this.lost = false;

      this.upgradeCards = [];
      this.upgradeCardsShowing = false;

      this.rewardGiven = false;
      this.redirectScheduled = false;

      this.superGaugeVisual = 0;

      this.fireTrails = [];
      this.particles = [];
      this.shake = 0;

      this.isBossRushLevel = this.level === 100;

      this.bossRushQueue = this.isBossRushLevel
        ? [
            { type: Boss2, text: 'CORE AWAKENS' },
            { type: Boss3, text: 'MIRROR CHAOS' },
            { type: Boss4, text: 'SPLIT PROTOCOL' },
            { type: Boss5, text: 'HUNTER MODE' },
            { type: Boss6, text: 'SHIELD SYSTEM' },
            { type: Boss7, text: 'LASER LOCKDOWN' },
            { type: Boss8, text: 'MAGNETIC STORM' },
            { type: Boss9, text: 'WAVE OF DOOM' },
            { type: Boss10, text: 'THUNDER DESCENDS' },
            { type: BossPortalMaster, text: 'PORTAL MASTER' },
          ]
        : [];

      this.currentBossRushIndex = 0;
      this.bossRushPendingSpawn = false;
      this.bossRushCleared = false;
      this.stageIntroActive = this.level === 100;
      this.stageIntroDone = this.level !== 100;
      this.stageIntroDelay = 1200;
      this.stageIntroTimer = 0;

      this.stageIntroTitle =
        this.level === 100 ? this.getStageIntroTitle() : '';
      this.stageIntroText = this.level === 100 ? this.getStageIntroText() : [];
    }

    triggerShake(duration = 420, magnitude = 18) {
      this.shakeDuration = duration;
      this.shakeTime = duration;
      this.shakeMagnitude = Math.max(this.shakeMagnitude, magnitude);
    }

    addSuperCharge(amount = 1) {
      if (this.gameOver) return;
      const need = this.superAttackReadyGauge || 5;
      this.superAttackGauge = Math.min(need, this.superAttackGauge + amount);
    }

    spawnSparks(x, y, amount = 18, hue = 190) {
      for (let i = 0; i < amount; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = rand(1.2, 4.8);
        const vx = Math.cos(a) * sp;
        const vy = Math.sin(a) * sp;

        this.particles.push(
          new Particle(
            x,
            y,
            vx,
            vy,
            rand(220, 520),
            rand(2.5, 6),
            hue + rand(-25, 25)
          )
        );
      }
    }

    updateStageByScore() {
      const maxStage = ENEMY_SPAWN_TABLE?.[this.level]?.stages
        ? Math.max(
            ...Object.keys(ENEMY_SPAWN_TABLE[this.level].stages).map(Number)
          )
        : 1;

      const scoreStage = Math.floor(this.score / 10) + 1;
      this.stage = Math.min(scoreStage, maxStage);
    }

    update(deltaTime) {
      if (this.stageIntroActive) {
        this.stageIntroTimer += deltaTime;

        if (this.player) {
          this.player.speedX = 0;
          this.player.speedY = 0;
        }

        return;
      }
      this.updateStageByScore();
      this.player.update(deltaTime);
      if (
        this.mouse.pressed &&
        !this.gameOver &&
        !this.upgradeCardsShowing &&
        !this.isSuperLaserActive() &&
        !this.stageIntroActive
      ) {
        this.player.fire();
      }

      this.shake *= 0.86;

      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].update(deltaTime);
      }
      compactArray(this.particles);

      if (this.pet) this.pet.update(deltaTime);

      if (!this.bossActive) {
        if (this.enemyTimer >= this.enemyInterval && !this.gameOver) {
          const spawnSettings = this.getSpawnSettings();

          if (this.enemies.length < spawnSettings.maxOnScreen) {
            this.addEnemy();
          }

          this.enemyTimer = 0;
        } else {
          this.enemyTimer += deltaTime;
        }
      }

      for (let i = 0; i < this.enemies.length; i++) {
        this.enemies[i].update(deltaTime);
      }
      compactArray(this.enemies);

      if (this.pet && this.pet.markedForDeletion) this.pet = null;

      for (let i = 0; i < this.enemies.length; i++) {
        const enemy = this.enemies[i];

        if (
          !this.player.invulnerable &&
          checkCollision(enemy, this.player) &&
          !this.gameOver
        ) {
          this.player.lives--;
          this.triggerShake(520, 26);
          this.player.invulnerable = true;
          this.player.invulnerableTimer = 0;
        }

        if (
          this.pet &&
          !this.pet.invulnerable &&
          checkCollision(this.pet, enemy) &&
          !this.gameOver
        ) {
          this.pet.lives--;
          this.pet.invulnerable = true;
          this.pet.invulnerableTimer = 0;

          if (this.pet.lives <= 0 && !this.pet.markedForDeletion) {
            const px = this.pet.x + this.pet.width / 2;
            const py = this.pet.y + this.pet.height / 2;
            this.explosions.push(new Explosion(this, px, py));
            this.pet.markedForDeletion = true;
          }
        }
      }

      for (let i = 0; i < this.enemyBullets.length; i++) {
        this.enemyBullets[i].update(deltaTime);
      }
      compactArray(this.enemyBullets);

      if (this.player.invulnerable && !this.gameOver) {
        this.player.invulnerableTimer += deltaTime;
        if (this.player.invulnerableTimer >= this.player.invulnerableInterval) {
          this.player.invulnerable = false;
          this.player.invulnerableTimer = 0;
        }
      }

      if (this.pet && this.pet.invulnerable && !this.gameOver) {
        this.pet.invulnerableTimer += deltaTime;
        if (this.pet.invulnerableTimer >= this.pet.invulnerableInterval) {
          this.pet.invulnerable = false;
          this.pet.invulnerableTimer = 0;
        }
      }

      const newProjectiles = [];

      for (let i = 0; i < this.player.projectiles.length; i++) {
        const p = this.player.projectiles[i];

        for (let j = 0; j < this.enemies.length; j++) {
          const enemy = this.enemies[j];

          if (p.markedForDeletion || enemy.markedForDeletion) continue;

          let collided = false;

          if (enemy instanceof Boss2) {
            if (!enemy.coreBroken) {
              const hitBox = enemy.getHitBoxRect();
              collided = checkCollision(p, hitBox);
              if (!collided) continue;

              enemy.damageCore(p.damage ?? 1);

              if (!p.piercing) {
                p.markedForDeletion = true;
              }
            } else {
              collided = checkCollision(p, enemy);
              if (!collided) continue;

              enemy.damageBoss(p.damage ?? 1);

              if (p instanceof TriangleProjectile && p.split) {
                p.split = false;

                const cy = p.y + p.height * 0.35;
                const leftX = p.x - 6;
                const rightX = p.x + 6;
                const grace = 140;

                newProjectiles.push(
                  new TriangleProjectile(
                    this,
                    leftX - 8,
                    cy - 10,
                    -6,
                    -1,
                    false,
                    grace
                  )
                );

                newProjectiles.push(
                  new TriangleProjectile(
                    this,
                    rightX + 8,
                    cy - 10,
                    6,
                    -1,
                    false,
                    grace
                  )
                );
              }

              if (!p.piercing) {
                p.markedForDeletion = true;
              }
            }
          } else {
            if (!checkCollision(p, enemy) || p.hitTargets.has(enemy)) continue;

            if (p instanceof Missile) {
              enemy.lives -= p.damage ?? 1;
              p.hitTargets.add(enemy);

              if (enemy instanceof Angler7) {
                enemy.reflectProjectile(p);
              }

              if (!p.piercing) {
                p.markedForDeletion = true;
              }
            } else {
              if (p instanceof TriangleProjectile && p.grace > 0) continue;

              enemy.lives -= p.damage ?? 1;

              if (enemy instanceof Angler7) {
                enemy.reflectProjectile(p);
              }

              if (p instanceof TriangleProjectile && p.split) {
                p.split = false;

                const cy = p.y + p.height * 0.35;
                const leftX = p.x - 6;
                const rightX = p.x + 6;
                const grace = 140;

                newProjectiles.push(
                  new TriangleProjectile(
                    this,
                    leftX - 8,
                    cy - 10,
                    -6,
                    -1,
                    false,
                    grace
                  )
                );

                newProjectiles.push(
                  new TriangleProjectile(
                    this,
                    rightX + 8,
                    cy - 10,
                    6,
                    -1,
                    false,
                    grace
                  )
                );
              }

              if (!p.piercing) {
                p.markedForDeletion = true;
              }
            }
          }

          if (enemy.lives <= 0 && !enemy.markedForDeletion) {
            this.handleEnemyDeath(enemy);
          }

          if (p.markedForDeletion && !p.piercing) {
            break;
          }
        }
      }

      if (newProjectiles.length > 0) {
        this.player.projectiles.push(...newProjectiles);
      }
      for (let i = 0; i < this.explosions.length; i++) {
        this.explosions[i].update(deltaTime);
      }
      compactArray(this.explosions);
      if (
        !this.bossActive &&
        this.score >= this.nextRageScore &&
        !this.upgradeCardsShowing &&
        this.score < this.winningScore
      ) {
        this.upgradeCardsShowing = true;

        for (let i = 0; i < this.enemies.length; i++) {
          const enemy = this.enemies[i];
          enemy.originalSpeedY = enemy.speedY;
          enemy.speedY = 0;
        }
        this.enemyInterval = this.getSpawnSettings().enemyInterval;
        window.createUpgradeCards(this);
      }

      if (this.upgradeCardsShowing) {
        for (let i = 0; i < this.enemies.length; i++) {
          const enemy = this.enemies[i];
          if (enemy.originalSpeedY === undefined) {
            enemy.originalSpeedY = enemy.speedY;
          }
          enemy.speedY = 0;
        }

        this.player.speedX = 0;
        this.player.speedY = 0;
      } else {
        for (let i = 0; i < this.enemies.length; i++) {
          const enemy = this.enemies[i];
          if (enemy.originalSpeedY !== undefined) {
            enemy.speedY = enemy.originalSpeedY;
            delete enemy.originalSpeedY;
          }
        }
      }

      if (
        this.level === 1 &&
        !this.bossSpawned &&
        this.score >= this.winningScore
      ) {
        this.bossSpawned = true;
        this.bossActive = true;

        this.enemies = [];
        this.enemies.push(new Boss1(this));
        this.ui.showBoss('BOSS INCOMING!');
      }

      if (
        this.level === 10 &&
        !this.bossSpawned &&
        this.score >= this.winningScore
      ) {
        this.bossSpawned = true;
        this.bossActive = true;

        this.enemies = [];
        this.enemies.push(new Boss2(this));
        this.ui.showBoss('BOSS INCOMING!');
      }

      if (
        this.level === 20 &&
        !this.bossSpawned &&
        this.score >= this.winningScore
      ) {
        this.bossSpawned = true;
        this.bossActive = true;

        this.enemies = [];
        this.enemies.push(new Boss3(this));
        this.ui.showBoss('BOSS INCOMING!');
      }

      if (
        this.level === 30 &&
        !this.bossSpawned &&
        this.score >= this.winningScore
      ) {
        this.bossSpawned = true;
        this.bossActive = true;

        this.enemies = [];
        this.enemies.push(new Boss4(this));
        this.ui.showBoss('BOSS INCOMING!');
      }

      if (
        this.level === 40 &&
        !this.bossSpawned &&
        this.score >= this.winningScore
      ) {
        this.bossSpawned = true;
        this.bossActive = true;

        this.enemies = [];
        this.enemies.push(new Boss5(this));
        this.ui.showBoss('BOSS INCOMING!');
      }

      if (
        this.level === 50 &&
        !this.bossSpawned &&
        this.score >= this.winningScore
      ) {
        this.bossSpawned = true;
        this.bossActive = true;

        this.enemies = [];
        this.enemies.push(new Boss6(this));
        this.ui.showBoss('BOSS INCOMING!');
      }

      if (
        this.level === 60 &&
        !this.bossSpawned &&
        this.score >= this.winningScore
      ) {
        this.bossSpawned = true;
        this.bossActive = true;

        this.enemies = [];
        this.enemies.push(new Boss7(this));
        this.ui.showBoss('BOSS INCOMING!');
      }

      if (
        this.level === 70 &&
        !this.bossSpawned &&
        this.score >= this.winningScore
      ) {
        this.bossSpawned = true;
        this.bossActive = true;

        this.enemies = [];
        this.enemies.push(new Boss8(this));
        this.ui.showBoss('BOSS INCOMING!');
      }

      if (
        this.level === 80 &&
        !this.bossSpawned &&
        this.score >= this.winningScore
      ) {
        this.bossSpawned = true;
        this.bossActive = true;

        this.enemies = [];
        this.enemies.push(new Boss9(this));
        this.ui.showBoss('BOSS INCOMING!');
      }

      if (this.player.lives <= 0 && !this.gameOver) {
        this.gameOver = true;
        this.lost = true;
      }

      if (this.bossKilled && !this.gameOver) {
        this.gameOver = true;
        this.win = true;
      }

      if (
        this.level === 90 &&
        !this.bossSpawned &&
        this.score >= this.winningScore
      ) {
        this.bossSpawned = true;
        this.bossActive = true;

        this.enemies = [];
        this.enemies.push(new Boss10(this));
        this.ui.showBoss('BOSS INCOMING!');
      }

      if (this.isBossRushLevel && !this.gameOver) {
        if (
          !this.bossSpawned &&
          !this.bossActive &&
          !this.upgradeCardsShowing
        ) {
          this.spawnNextBossRushBoss();
        }

        if (
          this.bossRushPendingSpawn &&
          !this.bossActive &&
          !this.upgradeCardsShowing
        ) {
          this.spawnNextBossRushBoss();
        }
      }
      if (
        this.level !== 1 &&
        this.level !== 10 &&
        this.level !== 20 &&
        this.level !== 30 &&
        this.level !== 40 &&
        this.level !== 50 &&
        this.level !== 60 &&
        this.level !== 70 &&
        this.level !== 80 &&
        this.level !== 90 &&
        this.level !== 100 &&
        !this.gameOver &&
        !this.upgradeCardsShowing &&
        this.score >= this.winningScore
      ) {
        this.gameOver = true;
        this.win = true;
      }

      if (this.gameOver) {
        this.player.speedX = 0;
        this.player.speedY = 0;

        for (let i = 0; i < this.player.projectiles.length; i++) {
          this.player.projectiles[i].markedForDeletion = true;
        }

        for (let i = 0; i < this.enemies.length; i++) {
          this.enemies[i].speedY = 0;
        }

        this.player.invulnerable = false;
      }
      if (this.upgradeCardsShowing) {
        for (let i = 0; i < this.upgradeCards.length; i++) {
          this.upgradeCards[i].update(deltaTime);
        }
      }

      if (this.pet && Array.isArray(this.pet.petBullets)) {
        for (let i = 0; i < this.pet.petBullets.length; i++) {
          const bullet = this.pet.petBullets[i];
          if (bullet.markedForDeletion) continue;

          const br = bullet.r ?? bullet.size * 0.5;
          const bulletRect = {
            x: bullet.x - br,
            y: bullet.y - br,
            width: br * 2,
            height: br * 2,
          };

          for (let j = 0; j < this.enemies.length; j++) {
            const enemy = this.enemies[j];
            if (enemy.markedForDeletion) continue;

            if (enemy instanceof Boss3) {
              let hitClone = false;

              for (let k = 0; k < enemy.clones.length; k++) {
                const clone = enemy.clones[k];
                if (checkCollision(bulletRect, clone)) {
                  bullet.markedForDeletion = true;
                  hitClone = true;
                  break;
                }
              }

              if (hitClone) break;
              if (!checkCollision(bulletRect, enemy)) continue;

              enemy.lives -= bullet.damage ?? 1;
              bullet.markedForDeletion = true;

              if (enemy.lives <= 0 && !enemy.markedForDeletion) {
                this.handleEnemyDeath(enemy);
              }
              break;
            }

            let collided = false;

            if (enemy instanceof Boss2) {
              if (!enemy.coreBroken) {
                const hitBox = enemy.getHitBoxRect();
                collided = checkCollision(bulletRect, hitBox);
                if (!collided) continue;

                enemy.damageCore(bullet.damage ?? 1);
                bullet.markedForDeletion = true;
              } else {
                collided = checkCollision(bulletRect, enemy);
                if (!collided) continue;

                enemy.damageBoss(bullet.damage ?? 1);
                bullet.markedForDeletion = true;
              }
            } else {
              if (!checkCollision(bulletRect, enemy)) continue;

              enemy.lives -= bullet.damage ?? 1;
              bullet.markedForDeletion = true;
            }

            if (enemy.lives <= 0 && !enemy.markedForDeletion) {
              this.handleEnemyDeath(enemy);
            }

            if (bullet.markedForDeletion) break;
          }
        }
      }

      if (this.gameOver && !this.rewardGiven) {
        if (bgMusic) bgMusic.pause();

        if (this.win) {
          const reward = Math.floor(22 + this.level * 3.5 + this.score * 0.4);
          grantCoins(reward);
          unlockNextLevel(this.level);
          showVictoryScreen({ win: true, reward, level: this.level });
        } else {
          showVictoryScreen({ win: false, reward: 0, level: this.level });
        }

        this.rewardGiven = true;
      }

      for (let i = 0; i < this.superAttacks.length; i++) {
        const superAtk = this.superAttacks[i];

        if (superAtk instanceof SuperLaser) continue;

        const giveSuperCharge = !(superAtk instanceof SuperAttack1);

        for (let j = 0; j < this.enemies.length; j++) {
          const enemy = this.enemies[j];

          if (enemy.markedForDeletion || enemy.hitBySuper) continue;

          let collided = false;

          if (enemy instanceof Boss2) {
            if (!enemy.coreBroken) {
              const hitBox = enemy.getHitBoxRect();
              collided = checkCollision(superAtk, hitBox);
              if (!collided) continue;

              enemy.damageCore(superAtk.damage);
            } else {
              collided = checkCollision(superAtk, enemy);
              if (!collided) continue;

              enemy.damageBoss(superAtk.damage);
            }
          } else {
            collided = checkCollision(superAtk, enemy);
            if (!collided) continue;

            enemy.lives -= superAtk.damage;
          }

          enemy.hitBySuper = true;

          if (enemy.lives <= 0 && !enemy.markedForDeletion) {
            this.handleEnemyDeath(enemy, giveSuperCharge);
          }

          if (enemy.enemyBullets && enemy.enemyBullets.length > 0) {
            for (let k = 0; k < enemy.enemyBullets.length; k++) {
              const bullet = enemy.enemyBullets[k];

              if (bullet.markedForDeletion) continue;
              if (!checkCollision(superAtk, bullet)) continue;

              bullet.markedForDeletion = true;
            }
          }
        }
      }

      if (
        this.superAttackGauge >= this.superAttackReadyGauge &&
        !this.superActive &&
        !this.gameOver
      ) {
        this.activateSuper();
      }

      for (let i = 0; i < this.superAttacks.length; i++) {
        this.superAttacks[i].update(deltaTime);
      }
      compactArray(this.superAttacks);

      const target = this.superAttackGauge / this.superAttackReadyGauge;
      this.superGaugeVisual += (target - this.superGaugeVisual) * 0.08;

      if (this.shakeTime > 0) {
        this.shakeTime -= deltaTime;
        if (this.shakeTime < 0) this.shakeTime = 0;
      }

      for (let i = 0; i < this.enemyMines.length; i++) {
        this.enemyMines[i].update(deltaTime);
      }
      compactArray(this.enemyMines);

      for (let i = 0; i < this.fireTrails.length; i++) {
        this.fireTrails[i].update(deltaTime);
      }
      compactArray(this.fireTrails);
    }

    draw(context) {
      let shakeX = 0;
      let shakeY = 0;

      if (this.shakeTime > 0) {
        const p = this.shakeTime / this.shakeDuration;
        const ease = p * p;
        const mag = this.shakeMagnitude * ease;

        shakeX += (Math.random() * 2 - 1) * mag;
        shakeY += (Math.random() * 2 - 1) * mag;
      }

      if (this.shake > 0.2) {
        const s = this.shake;
        shakeX += (Math.random() * 2 - 1) * s;
        shakeY += (Math.random() * 2 - 1) * s;
      }

      context.save();
      context.translate(shakeX, shakeY);

      if (this.pet) this.pet.draw(context);

      for (let i = 0; i < this.superAttacks.length; i++) {
        this.superAttacks[i].draw(context);
      }

      for (let i = 0; i < this.enemyMines.length; i++) {
        this.enemyMines[i].draw(context);
      }

      for (let i = 0; i < this.enemies.length; i++) {
        this.enemies[i].draw(context);
      }

      for (let i = 0; i < this.explosions.length; i++) {
        this.explosions[i].draw(context);
      }

      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].draw(context);
      }

      if (this.upgradeCardsShowing) {
        for (let i = 0; i < this.upgradeCards.length; i++) {
          this.upgradeCards[i].draw(context);
        }
      }

      for (let i = 0; i < this.enemyBullets.length; i++) {
        this.enemyBullets[i].draw(ctx);
      }

      this.player.draw(context);

      context.restore();

      const boss4s = [];
      for (let i = 0; i < this.enemies.length; i++) {
        const enemy = this.enemies[i];
        if (enemy instanceof Boss4) {
          boss4s.push(enemy);
        }
      }

      boss4s.sort((a, b) => a.x - b.x);

      for (let i = 0; i < boss4s.length; i++) {
        boss4s[i].drawTopHealthBar(context, i, boss4s.length);
      }
      for (let i = 0; i < this.fireTrails.length; i++) {
        this.fireTrails[i].draw(ctx);
      }

      this.ui.draw(context);

      if (this.stageIntroActive) {
        this.drawStageIntro(context);
      }

      if (this.player.blinded) {
        const p = this.player.blindTimer / this.player.blindDuration;

        let darkness = 0;
        if (p < 0.2) darkness = p / 0.2;
        else if (p > 0.75) darkness = 1 - (p - 0.75) / 0.25;
        else darkness = 1;

        darkness = Math.max(0, Math.min(1, darkness));

        const px = this.player.x + this.player.width / 2;
        const py = this.player.y + this.player.height / 2;

        const pulse = Math.sin(performance.now() * 0.008) * 8;
        const innerRadius = 55 + pulse;
        const outerRadius = 170 + pulse * 1.5;

        context.save();

        const g = context.createRadialGradient(
          px,
          py,
          innerRadius,
          px,
          py,
          outerRadius
        );

        g.addColorStop(0, `rgba(0,0,0,0)`);
        g.addColorStop(0.25, `rgba(0,0,0,${0.25 * darkness})`);
        g.addColorStop(0.6, `rgba(0,0,0,${0.72 * darkness})`);
        g.addColorStop(1, `rgba(0,0,0,${0.96 * darkness})`);

        context.fillStyle = g;
        context.fillRect(0, 0, this.width, this.height);

        context.restore();
      }
    }

    handleEnemyDeath(enemy, giveSuperCharge = true) {
      if (!enemy || enemy.markedForDeletion) return;

      if (enemy instanceof Boss4) {
        if (enemy.splitLevel < 2) {
          enemy.split();
          enemy.markedForDeletion = true;

          this.explosions.push(
            new Explosion(
              this,
              enemy.x + enemy.width / 2,
              enemy.y + enemy.height / 2
            )
          );

          return;
        }

        enemy.markedForDeletion = true;

        let hasOtherBoss4 = false;

        for (let i = 0; i < this.enemies.length; i++) {
          const e = this.enemies[i];
          if (e !== enemy && e instanceof Boss4 && !e.markedForDeletion) {
            hasOtherBoss4 = true;
            break;
          }
        }

        if (!hasOtherBoss4) {
          this.bossActive = false;

          if (this.isBossRushLevel) {
            this.score++;
            this.addSuperCharge(2);

            if (this.currentBossRushIndex >= this.bossRushQueue.length) {
              this.bossKilled = true;
              this.bossRushCleared = true;
              return;
            } else {
              this.bossRushPendingSpawn = true;
              this.upgradeCardsShowing = true;
              window.createUpgradeCards(this);
            }
          }
        }

        this.explosions.push(
          new Explosion(
            this,
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2
          )
        );

        return;
      }
      if (enemy instanceof Angler5) {
        enemy.split();
      }

      enemy.markedForDeletion = true;

      const isBossEnemy =
        enemy instanceof Boss1 ||
        enemy instanceof Boss2 ||
        enemy instanceof Boss3 ||
        enemy instanceof Boss5 ||
        enemy instanceof Boss6 ||
        enemy instanceof Boss7 ||
        enemy instanceof Boss8 ||
        enemy instanceof Boss9 ||
        enemy instanceof Boss10 ||
        enemy instanceof BossPortalMaster;

      if (isBossEnemy) {
        this.bossActive = false;

        if (this.isBossRushLevel) {
          this.score++;

          if (giveSuperCharge) this.addSuperCharge(2);

          if (this.currentBossRushIndex >= this.bossRushQueue.length) {
            this.bossKilled = true;
            this.bossRushCleared = true;
          } else {
            this.bossRushPendingSpawn = true;
            this.upgradeCardsShowing = true;
            window.createUpgradeCards(this);
          }
        } else {
          this.bossKilled = true;
        }
      } else {
        this.score++;
        if (giveSuperCharge) this.addSuperCharge(1);
      }

      this.explosions.push(
        new Explosion(
          this,
          enemy.x + enemy.width / 2,
          enemy.y + enemy.height / 2
        )
      );
    }

    addEnemy() {
      if (this.level === 100) return;
      if (this.level === 1) {
        this.enemies.push(new Angler1(this));
        return;
      }

      if (this.bossActive) return;

      const fallbackLevel = ENEMY_SPAWN_TABLE?.[1];
      const levelData = ENEMY_SPAWN_TABLE?.[this.level] || fallbackLevel;

      if (!levelData || !levelData.stages) return;

      const stageKeys = Object.keys(levelData.stages).map(Number);
      if (!stageKeys.length) return;

      const lastStage = Math.max(...stageKeys);
      const stageData =
        levelData.stages[this.stage] || levelData.stages[lastStage];

      if (!Array.isArray(stageData) || !stageData.length) return;

      const enemyClass = this.pickWeighted(stageData);
      if (!enemyClass) return;

      this.enemies.push(new enemyClass(this));
    }

    pickWeighted(pool) {
      const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
      let roll = Math.random() * total;

      for (const entry of pool) {
        roll -= entry.weight;
        if (roll <= 0) return entry.type;
      }

      return pool[pool.length - 1]?.type || null;
    }

    getSpawnSettings() {
      const level = this.level;
      const stage = this.stage;

      const baseInterval = Math.max(700, 1750 - level * 35);
      const stageIntervalBonus = Math.max(0.72, 1 - (stage - 1) * 0.07);
      const enemyInterval = Math.max(500, baseInterval * stageIntervalBonus);

      const baseMaxOnScreen = Math.min(5 + Math.floor(level / 3), 10);
      const stageBonus = Math.min(stage - 1, 4);
      const maxOnScreen = Math.min(baseMaxOnScreen + stageBonus, 14);

      return {
        enemyInterval,
        maxOnScreen,
      };
    }

    applyUpgrade(type) {
      switch (type) {
        case 'doubleShooter':
          this.player.doubleShot = true;
          break;

        case 'plusHp':
          this.player.lives++;
          break;

        case 'fasterShoter':
          this.player.fireRateMult = Math.max(
            0.45,
            this.player.fireRateMult * 0.85
          );
          break;

        case 'shild':
          this.player.invulnerable = true;
          this.player.shieldActive = true;

          setTimeout(() => {
            this.player.invulnerable = false;
            this.player.shieldActive = false;
          }, 20000);

          break;

        case 'petFaster':
          if (this.pet) {
            this.petCooldownMult = Math.max(0.55, this.petCooldownMult - 0.15);
          }
          break;
        case 'damageUp':
          this.player.damage = (this.player.damage || 1) + 1;
          break;

        case 'speedBoost':
          this.player.moveBoost = (this.player.moveBoost || 1) + 0.2;
          break;

        case 'piercingShot':
          this.player.piercingShot = true;
          break;

        case 'superCharge':
          this.addSuperCharge(2);
          break;
      }
    }

    getClosestEnemy(x, y) {
      let closest = null;
      let minDistSq = Infinity;

      for (let i = 0; i < this.enemies.length; i++) {
        const enemy = this.enemies[i];
        if (enemy.markedForDeletion) continue;

        const dx = enemy.x + enemy.width * 0.5 - x;
        const dy = enemy.y + enemy.height * 0.5 - y;
        const distSq = dx * dx + dy * dy;

        if (distSq < minDistSq) {
          minDistSq = distSq;
          closest = enemy;
        }
      }

      return closest;
    }

    spawnNextBossRushBoss() {
      if (!this.isBossRushLevel) return;
      if (this.currentBossRushIndex >= this.bossRushQueue.length) {
        this.bossRushCleared = true;
        this.bossActive = false;
        this.bossKilled = true;
        return;
      }

      const entry = this.bossRushQueue[this.currentBossRushIndex];
      this.currentBossRushIndex++;

      this.bossActive = true;
      this.bossSpawned = true;
      this.bossRushPendingSpawn = false;

      this.enemies = [];
      this.enemyBullets = [];
      this.enemyMines = [];

      this.ui.showBoss(entry.text);
      this.enemies.push(new entry.type(this));
    }

    getStageIntroTitle() {
      if (this.level === 100) return 'LEVEL 100:';
      if (this.level === 90) return 'LEVEL 90: STORM CORE';
      if (this.level === 80) return 'LEVEL 80: WAVE WALL';
      if (this.level === 70) return 'LEVEL 70: MAGNETIC CHAOS';
      if (this.level === 60) return 'LEVEL 60: LASER LOCK';
      return `LEVEL ${this.level}`;
    }

    getStageIntroText() {
      if (this.level === 100) {
        return [
          'This is the final stage… and the rules are about to change.',
          'No Anglers this time.',
          'You will face every boss… and then the final one will appear.',
          'After each boss falls, you’ll earn an upgrade.',
          'Survive the full gauntlet to clear the level.',
          '★ Complete this stage to unlock an exclusive skin you can’t get anywhere else.',
        ];
      }

      if (this.level === 90) {
        return [
          'Boss10 controls lightning strikes and electric zones.',
          'Keep moving and avoid marked danger areas.',
        ];
      }

      if (this.level === 80) {
        return [
          'Boss9 creates wave walls with narrow safe gaps.',
          'Read the telegraph and move early.',
        ];
      }

      return [
        'Get ready.',
        'Survive the stage and defeat everything in your path.',
      ];
    }
    getIntroSkipButtonRect() {
      const boxW = Math.min(this.width * 0.92, 700);
      const boxH = Math.min(this.height * 0.75, 520);
      const boxX = this.width / 2 - boxW / 2;
      const boxY = this.height / 2 - boxH / 2 + 60;

      return {
        x: this.width / 2 - 110,
        y: boxY + boxH - 90,
        width: 220,
        height: 60,
      };
    }
    drawStageIntro(ctx) {
      if (this.level !== 100 || !this.stageIntroActive) return;

      ctx.save();

      ctx.fillStyle = 'rgba(0,0,0,0.82)';
      ctx.fillRect(0, 0, this.width, this.height);

      const boxW = Math.min(this.width * 0.92, 700);
      const boxH = Math.min(this.height * 0.75, 520);
      const boxX = this.width / 2 - boxW / 2;
      const boxY = this.height / 2 - boxH / 2;

      ctx.fillStyle = 'rgba(20,20,30,0.96)';
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 2;

      drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 18);
      ctx.fill();
      ctx.stroke();

      const paddingX = 26;
      const textMaxWidth = boxW - paddingX * 2;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px "Archivo Black", system-ui, sans-serif';
      ctx.fillText(this.stageIntroTitle, this.width / 2, boxY + 46);

      ctx.font = '18px Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.92)';

      const wrapText = (text, maxWidth) => {
        const words = text.split(' ');
        const lines = [];
        let line = '';

        for (let i = 0; i < words.length; i++) {
          const testLine = line ? line + ' ' + words[i] : words[i];
          const testWidth = ctx.measureText(testLine).width;

          if (testWidth > maxWidth && line) {
            lines.push(line);
            line = words[i];
          } else {
            line = testLine;
          }
        }

        if (line) lines.push(line);
        return lines;
      };

      let currentY = boxY + 105;
      const lineHeight = 28;
      const blockGap = 12;

      (this.stageIntroText || []).forEach((paragraph) => {
        const wrappedLines = wrapText(paragraph, textMaxWidth);

        wrappedLines.forEach((line) => {
          ctx.fillText(line, this.width / 2, currentY);
          currentY += lineHeight;
        });

        currentY += blockGap;
      });

      const btn = this.getIntroSkipButtonRect();

      ctx.fillStyle = '#ff4040';
      drawRoundedRect(ctx, btn.x, btn.y, btn.width, btn.height, 12);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 20px "Archivo Black", system-ui, sans-serif';
      ctx.fillText(
        'ENTER THE CHAOS!',
        btn.x + btn.width / 2,
        btn.y + btn.height / 2 + 1
      );

      ctx.restore();
    }

    skipStageIntro() {
      if (this.level !== 100) return;
      this.stageIntroActive = false;
      this.stageIntroDone = true;
    }

    activateSuper() {
      const superMap = window.SUPER_TYPES || {};
      const superData = superMap[this.equippedSuper];
      if (!superData || !superData.class) return;
      if (this.superActive) return;

      this.superAttackReadyGauge =
        superData.charge ?? this.superAttackReadyGauge;

      this.superActive = true;
      this.superAttackGauge = 0;

      for (let i = 0; i < this.enemies.length; i++) {
        this.enemies[i].hitBySuper = false;
      }

      this.superAttacks.push(new superData.class(this));

      setTimeout(() => {
        this.superActive = false;
      }, superData.duration ?? 500);
    }

    isSuperLaserActive() {
      return this.superAttacks.some((s) => s instanceof SuperLaser);
    }
  }

  function checkCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  window.checkCollision = checkCollision;

  function grantCoins(amount) {
    const current = Number(localStorage.getItem('coins')) || 0;
    localStorage.setItem('coins', current + amount);
  }

  (async () => {
    function waitDomImg(id) {
      return new Promise((resolve) => {
        const img = document.getElementById(id);
        if (!img) return resolve(null);

        const done = () => resolve(img);

        if (img.complete && (img.naturalWidth || img.width)) return done();

        img.onload = done;
        img.onerror = () => resolve(null);
      });
    }

    const PRELOAD_DOM_IMAGES = [
      'player',
      'playerRedClassic',
      'playerDarkReaper',
      'playerCelestialSakura',
      'playerGoldenCore',
      'missile',
      'chimboSprite',
      'sirenSprite',
      'angler1Sprite',
      'angler2Sprite',
      'angler3Sprite',
      'boss1Sprite',
    ];

    async function preload() {
      const [bgImg, explosionImg, ...domImgs] = await Promise.all([
        loadImage(ASSETS.bg),
        loadImage(ASSETS.explosion),
        ...PRELOAD_DOM_IMAGES.map(waitDomImg),
      ]);

      cached.bgImg = bgImg;
      cached.explosionImg = explosionImg;

      cached.dom = {};
      for (let i = 0; i < PRELOAD_DOM_IMAGES.length; i++) {
        cached.dom[PRELOAD_DOM_IMAGES[i]] = domImgs[i];
      }
    }
    setupMusic();
    await preload();
    applyGameMusicSettings();

    EXPLOSION_IMG = cached.explosionImg;

    background = new ScrollingBackground(canvas, cached.bgImg, 1.2);
    stars = new Starfield(canvas, 160);

    game = new Game(logicalW, logicalH);

    let lastTime = 0;
    function loop(timeStamp) {
      let deltaTime = timeStamp - lastTime;
      lastTime = timeStamp;

      if (deltaTime > 50) deltaTime = 50;
      if (deltaTime < 0) deltaTime = 0;

      ctx.clearRect(0, 0, logicalW, logicalH);

      background.update(deltaTime);
      background.draw();

      stars.update(deltaTime, 1.2);
      stars.draw();

      game.update(deltaTime);
      game.draw(ctx);

      drawVignette(ctx, logicalW, logicalH);
      drawScanlines(ctx, logicalW, logicalH);

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  })();
});

function restartGame() {
  game = new Game(logicalW, logicalH);
}

function showVictoryScreen(data) {
  if (typeof bgMusic !== 'undefined' && bgMusic) {
    bgMusic.pause();
  }

  const screen = document.getElementById('victoryScreen');
  const box = screen.querySelector('.victoryBox');
  const text = document.getElementById('rewardText');
  const title = screen.querySelector('h2');
  const nextBtn = document.getElementById('btnNext');
  const lobbyBtn = document.getElementById('btnLobby');

  screen.classList.remove('hidden', 'is-win', 'is-lose');
  box.classList.remove('is-win', 'is-lose');

  if (data.win) {
    if (data.level === 100) {
      const isNew = unlockSkinReward('starbreaker');

      if (isNew) {
        showSkinRewardPopup('starbreaker', () => {
          window.location.href = 'index.html';
        });
        return;
      }
    }

    screen.classList.add('is-win');
    box.classList.add('is-win');

    title.textContent = 'Victory!';
    text.textContent = `You earned ${data.reward} coins`;

    nextBtn.textContent = data.level === 100 ? 'Back to Lobby' : 'Next Level';

    nextBtn.onclick = () => {
      if (data.level === 100) {
        window.location.href = 'index.html';
      } else {
        window.location.href = `game.html?level=${data.level + 1}`;
      }
    };

    lobbyBtn.onclick = () => {
      window.location.href = 'index.html';
    };
  } else {
    screen.classList.add('is-lose');
    box.classList.add('is-lose');

    title.textContent = 'Game Over!';
    text.textContent = 'Better luck next time!';
    nextBtn.textContent = 'Try Again';

    nextBtn.onclick = () => {
      window.location.href = `game.html?level=${data.level}`;
    };

    lobbyBtn.onclick = () => {
      window.location.href = 'index.html';
    };
  }
}

function enterFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen();
}

function compactArray(arr) {
  let write = 0;
  for (let read = 0; read < arr.length; read++) {
    if (!arr[read].markedForDeletion) {
      arr[write++] = arr[read];
    }
  }
  arr.length = write;
}
