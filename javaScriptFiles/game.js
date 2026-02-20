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
};

function normalizeSkinId(id) {
  return String(id || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[_-]+/g, '');
}

const DEFAULT_SKIN = 'default';
const STORAGE_KEY_EQUIPPED_SKIN = 'equippedSkin';

function getEquippedSkin() {
  const raw = localStorage.getItem(STORAGE_KEY_EQUIPPED_SKIN) || DEFAULT_SKIN;
  const n = normalizeSkinId(raw);
  return n === 'redclassic' ? 'redclassic' : 'default';
}

function setEquippedSkin(id) {
  const n = normalizeSkinId(id);
  localStorage.setItem(
    STORAGE_KEY_EQUIPPED_SKIN,
    n === 'redclassic' ? 'redclassic' : 'default'
  );
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
  const ASSETS = {
    bg: './images/game/background/blueSpace.png',
    explosion: './images/game/sprites/smokeExplosion.png',
  };

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  let cached = {};

  let EXPLOSION_IMG = null;
  let background = null;
  let stars = null;
  let game = null;

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
    const dpr = window.devicePixelRatio || 1;

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

  ctx.fillStyle = 'lime';
  ctx.fillRect(0, 0, 100, 100);
  //canvas settings end

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

  const WEAPON_BEHAVIOR = {
    laser: {
      fireRate: 200,
      fire(player) {
        const x = player.x + player.width / 2;
        player.projectiles.push(new Projectile(player.game, x - 2, player.y));

        if (player.doubleShot) {
          player.projectiles.push(
            new Projectile(player.game, x + 10, player.y)
          );
        }
      },
    },

    missile: {
      fireRate: 700,
      fire(player) {
        const centerX = player.x + player.width / 2;
        const y = player.y;

        const spacing = 20;

        player.projectiles.push(new Missile(player.game, centerX - spacing, y));

        if (player.doubleShot) {
          player.projectiles.push(
            new Missile(player.game, centerX + spacing, y)
          );
        }
      },
    },

    triangleShooter: {
      fireRate: 700,
      fire(player) {
        const centerX = player.x + player.width / 2;
        const y = player.y;

        player.projectiles.push(
          new TriangleProjectile(player.game, centerX - 9, y)
        );

        if (player.doubleShot) {
          player.projectiles.push(
            new TriangleProjectile(player.game, centerX + 9, y)
          );
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
        if (this.fireInterval) return;
        this.fireInterval = setInterval(() => {
          if (!this.pressed) return;
          if (this.game.gameOver) return;
          if (this.game.upgradeCardsShowing) return;
          if (this.game.isSuperLaserActive()) return;
          this.game.player.fire();
        }, 16);
      };

      const stopFiring = () => {
        this.pressed = false;
        this.activePointerId = null;
        clearInterval(this.fireInterval);
        this.fireInterval = null;
      };

      canvas.addEventListener(
        'pointerdown',
        (e) => {
          e.preventDefault();
          this.activePointerId = e.pointerId;
          canvas.setPointerCapture(e.pointerId);

          const p = getPos(e);
          this.x = p.x;
          this.y = p.y;

          this.pressed = true;

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
      this.game.upgradeCards.forEach((card) => {
        if (
          mx > card.x &&
          mx < card.x + card.width &&
          my > card.y &&
          my < card.y + card.height
        ) {
          this.game.applyUpgrade(card.type);
          this.game.upgradeCardsShowing = false;
          this.game.nextRageScore += 10;
        }
      });
    }

    restartFire() {
      if (!this.pressed) return;
      clearInterval(this.fireInterval);
      this.fireInterval = setInterval(() => {
        this.game.player.fire();
      }, this.game.player.shootingInterval);
    }
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

  class Projectile {
    constructor(game, x, y) {
      this.game = game;
      this.width = 4;
      this.height = 10;
      this.x = x;
      this.y = y;
      this.speedY = -7;
      this.damege = 1;
      this.markedForDeletion = false;
    }
    update() {
      this.y += this.speedY;
      if (this.y < -this.height) this.markedForDeletion = true;
    }

    draw(context) {
      context.fillStyle = 'yellow';
      context.fillRect(this.x, this.y, this.width, this.height);
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
      speedY = -5,
      canSplit = true,
      graceMs = 0
    ) {
      super(game, x, y);

      this.width = 18;
      this.height = 22;

      this.speedX = speedX;
      this.speedY = speedY;

      this.damage = 2;
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

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 18;

      const grad = ctx.createLinearGradient(
        cx,
        this.y,
        cx,
        this.y + this.height
      );

      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#00ffff');
      grad.addColorStop(1, '#0077ff');

      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(cx, this.y);
      ctx.lineTo(this.x, this.y + this.height);
      ctx.lineTo(this.x + this.width, this.y + this.height);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.moveTo(cx, this.y + 4);
      ctx.lineTo(this.x + 5, this.y + this.height - 6);
      ctx.lineTo(this.x + this.width - 5, this.y + this.height - 6);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  class SuperAttack1 {
    constructor(game) {
      this.game = game;
      this.width = 240;
      this.height = 30;
      this.x = this.game.width / 2 - this.width / 2;
      this.y = game.height;
      this.speedY = 4;
      this.damage = 50;
      this.markedForDeletion = false;
    }
    update() {
      this.y -= this.speedY;
      if (this.y < -this.height) this.markedForDeletion = true;
    }
    draw(context) {
      const t = performance.now() * 0.008;
      const radius = this.height * 0.6;
      const pulse = 0.85 + 0.15 * Math.sin(t * 2);

      context.save();

      context.globalAlpha = 0.7 * pulse;
      context.fillStyle = 'rgba(0, 220, 255, 1)';
      drawRoundedRect(context, this.x, this.y, this.width, this.height, radius);
      context.fill();

      context.globalAlpha = 0.35;
      context.fillStyle = 'rgba(255, 255, 255, 1)';
      const stripeCount = 6;

      for (let i = 0; i < stripeCount; i++) {
        const offset = (t * 30 + i * 40) % this.width;
        drawRoundedRect(context, this.x + offset, this.y, 8, this.height, 4);
        context.fill();
      }

      context.globalAlpha = 0.9;
      context.fillStyle = 'rgba(255, 255, 255, 1)';
      drawRoundedRect(context, this.x, this.y, this.width, 4, 2);
      context.fill();

      context.shadowColor = 'rgba(0, 200, 255, 0.9)';
      context.shadowBlur = 20;
      context.globalAlpha = 0.4;
      context.fillStyle = 'rgba(0, 200, 255, 1)';
      drawRoundedRect(context, this.x, this.y, this.width, this.height, radius);
      context.fill();

      context.restore();
    }
  }

  class SuperLaser {
    constructor(game) {
      this.game = game;

      this.width = 40;
      this.height = game.height;
      this.lifeTime = 4000;
      this.timer = 0;
      this.x = 0;
      this.y = 0;
      this.damagePerTick = 1.2;
      this.hitInterval = 200;
      this.markedForDeletion = false;

      this.hitTimers = new Map();
    }

    update(deltaTime) {
      const p = this.game.player;
      const centerX = p.x + p.width / 2;
      this.x = centerX - this.width / 2;

      this.timer += deltaTime;
      if (this.timer >= this.lifeTime) {
        this.markedForDeletion = true;
        return;
      }

      for (const [enemy, t] of this.hitTimers.entries()) {
        if (!enemy || enemy.markedForDeletion) this.hitTimers.delete(enemy);
        else this.hitTimers.set(enemy, t + deltaTime);
      }

      this.game.enemies.forEach((enemy) => {
        if (enemy.markedForDeletion) return;

        if (checkCollision(this, enemy)) {
          const t = this.hitTimers.get(enemy) ?? this.hitInterval;
          if (t >= this.hitInterval) {
            enemy.lives -= this.damagePerTick;
            this.hitTimers.set(enemy, 0);

            if (enemy.lives <= 0 && !enemy.markedForDeletion) {
              enemy.markedForDeletion = true;
              this.game.score++;

              const px = enemy.x + enemy.width / 2;
              const py = enemy.y + enemy.height / 2;
              this.game.explosions.push(new Explosion(this.game, px, py));
            }
          }
        }
      });

      this.game.enemies.forEach((enemy) => {
        if (!enemy.enemyBullets) return;
        enemy.enemyBullets.forEach((bullet) => {
          if (!bullet.markedForDeletion && checkCollision(this, bullet)) {
            bullet.markedForDeletion = true;
          }
        });
      });
    }

    draw(ctx) {
      const t = performance.now() * 0.01;

      const pulse = 0.85 + 0.15 * Math.sin(t);

      const glowW = this.width * (2.6 + 0.4 * Math.sin(t * 1.4));
      const coreW = this.width * (1.2 + 0.15 * Math.sin(t * 2));
      const hotW = Math.max(4, this.width * 0.18);

      const cx = this.x + this.width / 2;

      ctx.save();

      ctx.globalAlpha = 0.22 * pulse;
      ctx.fillStyle = 'rgba(255, 0, 30, 1)';
      ctx.fillRect(cx - glowW / 2, this.y, glowW, this.height);

      ctx.globalAlpha = 0.65 * pulse;
      ctx.fillStyle = 'rgba(255, 40, 70, 1)';
      ctx.fillRect(cx - coreW / 2, this.y, coreW, this.height);

      ctx.globalAlpha = 0.95;
      ctx.fillStyle = 'rgba(255, 108, 108, 1)';
      ctx.fillRect(cx - hotW / 2, this.y, hotW, this.height);

      ctx.globalAlpha = 1;
      ctx.shadowColor = 'rgba(255, 0, 60, 0.95)';
      ctx.shadowBlur = 26;
      ctx.fillStyle = 'rgba(255, 0, 60, 0.18)';
      ctx.fillRect(cx - coreW / 2, this.y, coreW, this.height);

      ctx.restore();
    }
  }

  const SUPER_TYPES = {
    waveShield: { class: SuperAttack1, duration: 500, charge: 5 },
    superLaser: { class: SuperLaser, duration: 4000, charge: 9 },
  };

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
      this.doubleShot = false;
      this.invulnerable = false;
      this.invulnerableTimer = 0;
      this.invulnerableInterval = 3000;
      this.shootingInterval = 200;
      this.lastFireTime = 0;
      this.weapon = localStorage.getItem('equippedWeapon') || 'laser';

      const skinId = getEquippedSkin();
      const imgId = SKIN_TO_PLAYER_IMG_ID[skinId] || 'player';
      this.image =
        document.getElementById(imgId) || document.getElementById('player');

      this.frameX = 0;
      this.frameY = 1;
      this.frameTimer = 0;
      this.frameInterval = 80;
      this.spriteWidth = 128;
      this.spriteHeight = 128;
    }

    update(deltaTime) {
      this.frameTimer += deltaTime;
      if (this.frameTimer > this.frameInterval) {
        this.frameX++;
        if (this.frameX >= 6) this.frameX = 0;
        this.frameTimer = 0;
      }
      if (this.game.mouse.pressed) {
        const targetX = this.game.mouse.x - this.width / 2;
        const targetY = this.game.mouse.y - this.height / 2;

        this.x += (targetX - this.x) * 0.22;
        this.y += (targetY - this.y) * 0.22;

        canvas.style.cursor = 'none';
      } else {
        canvas.style.cursor = 'default';
      }

      if (this.x < 0) this.x = 0;
      if (this.x + this.width > this.game.width)
        this.x = this.game.width - this.width;
      if (this.y < 0) this.y = 0;
      if (this.y + this.height > this.game.height)
        this.y = this.game.height - this.height;

      this.projectiles.forEach((p) => p.update(deltaTime));
      this.projectiles = this.projectiles.filter((p) => !p.markedForDeletion);
    }

    draw(context) {
      context.save();

      if (this.invulnerable) context.globalAlpha = 0.65;

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

      this.projectiles.forEach((p) => p.draw(context));
    }

    fire() {
      const now = performance.now();
      const weapon = WEAPON_BEHAVIOR[this.weapon];
      if (!weapon) return;

      if (now - this.lastFireTime < weapon.fireRate) return;

      this.lastFireTime = now;
      this.shootingInterval = weapon.fireRate;

      weapon.fire(this);
    }
  }
  class Pet {
    constructor(game) {
      this.game = game;

      this.image = document.getElementById('chimboSprite');

      this.spriteWidth = 128;
      this.spriteHeight = 192;
      this.maxFrame = 8;

      this.frameX = 0;
      this.frameY = 0;
      this.frameTimer = 0;
      this.frameInterval = 90;

      this.width = 80;
      this.height = Math.round(
        this.width * (this.spriteHeight / this.spriteWidth)
      );

      this.offsetX = -60;
      this.offsetY = 60;

      this.x = 0;
      this.y = 0;

      this.lives = 3;
      this.invulnerable = false;
      this.invulnerableTimer = 0;
      this.invulnerableInterval = 1000;

      this.petBullets = [];
      this.shootTimer = 0;

      this.baseShootInterval = 8000;
      this.markedForDeletion = false;
    }

    update(deltaTime) {
      const p = this.game.player;

      const targetX = p.x + this.offsetX;
      const targetY = p.y + this.offsetY;

      this.x += (targetX - this.x) * 0.18;
      this.y += (targetY - this.y) * 0.18;

      this.frameTimer += deltaTime;
      if (this.frameTimer > this.frameInterval) {
        this.frameX = (this.frameX + 1) % this.maxFrame;
        this.frameTimer = 0;
      }

      const interval = Math.max(
        this.game.petCooldownMin,
        Math.round(this.baseShootInterval * this.game.petCooldownMult)
      );

      this.shootTimer += deltaTime;
      if (!this.game.gameOver && this.shootTimer >= interval) {
        this.shootTimer = 0;
        this.shoot();
      }

      this.petBullets.forEach((b) => b.update(deltaTime));
      this.petBullets = this.petBullets.filter((b) => !b.markedForDeletion);

      if (this.invulnerable) {
        this.invulnerableTimer += deltaTime;
        if (this.invulnerableTimer >= this.invulnerableInterval) {
          this.invulnerable = false;
          this.invulnerableTimer = 0;
        }
      }
    }

    shoot() {
      const target = this.game.getClosestEnemy(
        this.x + this.width / 2,
        this.y + this.height / 2
      );
      if (!target) return;

      this.petBullets.push(
        new Pet1Bullet(this.game, this.x + this.width / 2, this.y + 10, target)
      );
    }

    draw(ctx) {
      if (!this.image) return;

      ctx.save();
      if (this.invulnerable) ctx.globalAlpha = 0.65;

      ctx.drawImage(
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

      ctx.restore();

      this.petBullets.forEach((b) => b.draw(ctx));
    }
  }

  class Pet1Bullet {
    constructor(game, x, y, target) {
      this.game = game;
      this.x = x;
      this.y = y;

      this.size = 12;
      this.speed = 3;
      this.damage = 8;

      this.target = target;
      this.markedForDeletion = false;

      this.vx = 0;
      this.vy = -this.speed;

      this.turnRate = 0.08;

      this.trail = [];
      this.trailMax = 10;

      this.hue = 185;
    }

    update() {
      if (!this.target || this.target.markedForDeletion) {
        this.markedForDeletion = true;
        return;
      }

      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > this.trailMax) this.trail.shift();

      const tx = this.target.x + this.target.width / 2;
      const ty = this.target.y + this.target.height / 2;

      const desiredX = tx - this.x;
      const desiredY = ty - this.y;

      const desiredDist = Math.hypot(desiredX, desiredY);
      if (desiredDist < 12) {
        this.target.lives -= this.damage;
        this.markedForDeletion = true;
        return;
      }

      const desiredVX = (desiredX / desiredDist) * this.speed;
      const desiredVY = (desiredY / desiredDist) * this.speed;

      this.vx += (desiredVX - this.vx) * this.turnRate;
      this.vy += (desiredVY - this.vy) * this.turnRate;

      this.x += this.vx;
      this.y += this.vy;
    }

    draw(ctx) {
      const r = this.size * 0.5;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < this.trail.length; i++) {
        const t = this.trail[i];
        const a = (i + 1) / this.trail.length;

        ctx.globalAlpha = 0.25 * a;
        ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, 1)`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, r * (0.35 + 0.65 * a), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 0.75;
      ctx.shadowColor = `hsla(${this.hue}, 100%, 60%, 1)`;
      ctx.shadowBlur = 18;
      ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, 1)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 1.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.fillStyle = `hsla(${this.hue}, 100%, 92%, 1)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 0.55, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  class Siren {
    constructor(game) {
      this.game = game;

      this.width = 60;
      this.height = 60;

      this.offsetX = 70;
      this.offsetY = 100;

      this.x = 0;
      this.y = 0;
      this.lives = 2;

      this.controlTimer = 0;
      this.controlInterval = 9000;

      this.markedForDeletion = false;

      this.image = document.getElementById('sirenSprite');
      this.frameX = 0;
      this.frameY = 0;
      this.frameTimer = 0;
      this.frameInterval = 90;

      this.baseControlInterval = 9000;
      this.controlInterval = this.baseControlInterval;

      this.spriteWidth = 128;
      this.spriteHeight = 128;
      this.maxFrame = 1;
    }

    update(deltaTime) {
      const player = this.game.player;

      this.x = player.x + this.offsetX;
      this.y = player.y + this.offsetY;

      this.controlInterval = Math.max(
        this.game.petCooldownMin,
        Math.round(this.baseControlInterval * this.game.petCooldownMult)
      );

      this.frameTimer += deltaTime;
      if (this.frameTimer > this.frameInterval) {
        this.frameX = (this.frameX + 1) % this.maxFrame;
        this.frameTimer = 0;
      }

      this.controlTimer += deltaTime;
      if (this.controlTimer >= this.controlInterval && !this.game.gameOver) {
        this.findTarget();
        this.controlTimer = 0;
      }
    }

    findTarget() {
      const enemies = this.game.enemies.filter(
        (e) => !e.markedForDeletion && !e.mindControlled
      );
      if (enemies.length < 2) return;

      const controller = enemies[Math.floor(Math.random() * enemies.length)];

      let target;
      do {
        target = enemies[Math.floor(Math.random() * enemies.length)];
      } while (target === controller);

      controller.mindControlled = true;
      controller.mindTarget = target;
      controller.mindTimer = 0;
    }

    draw(ctx) {
      if (!this.image) return;

      ctx.save();

      ctx.drawImage(
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

      ctx.restore();
    }
  }

  const PET_CLASSES = {
    dog: Pet,
    siren: Siren,
  };

  class Enemy {
    constructor(game) {
      this.game = game;

      this.width = 100;
      this.height = 100;
      this.y = -this.height;
      this.speedY = 1;
      this.lives = 3;

      this.hitBySuper = false;
      this.markedForDeletion = false;
      this.color = 'red';

      // 🧠 Siren states
      this.mindControlled = false;
      this.mindTimer = 0;
      this.mindDuration = 3000;
      this.mindTarget = null;
    }

    update(deltaTime) {
      if (this.mindControlled && this.mindTarget) {
        this.mindTimer += deltaTime;

        const tx = this.mindTarget.x + this.mindTarget.width / 2;
        const ty = this.mindTarget.y + this.mindTarget.height / 2;

        this.x += (tx - (this.x + this.width / 2)) * 0.06;
        this.y += (ty - (this.y + this.height / 2)) * 0.06;

        if (checkCollision(this, this.mindTarget)) {
          this.mindTarget.lives -= this.lives;
          this.markedForDeletion = true;
        }

        if (
          this.mindTimer >= this.mindDuration ||
          this.mindTarget.markedForDeletion
        ) {
          this.clearMindControl();
        }

        return;
      }

      this.y += this.speedY;
      if (this.y > this.game.height) this.markedForDeletion = true;
    }

    clearMindControl() {
      this.mindControlled = false;
      this.mindTimer = 0;
      this.mindTarget = null;
    }

    draw(ctx) {
      ctx.save();

      ctx.fillStyle = this.mindControlled ? 'violet' : this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);

      ctx.restore();
    }
  }

  class Angler1 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 80;
      this.height = 80;
      this.lives = 4;
      this.speedY = 1.5;
      this.x = Math.random() * (this.game.width - this.width);
      this.color = 'red';
    }
  }

  class Angler2 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 100;
      this.height = 100;
      this.lives = 10;
      this.speedY = Math.random() * (2 - 1.5) + 1.5;
      this.x = Math.random() * (this.game.width - this.width);
      this.color = 'purple';
    }
  }

  class Angler3 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 80;
      this.height = 80;
      this.lives = 6;
      this.speedY = 0.5;
      this.x = Math.random() * (this.game.width - this.width);
      this.color = 'orange';

      this.shooterTimer = 0;
      this.shooterInterval = Math.random() * (3000 - 2000) + 2000;
      this.enemyBullets = [];
    }

    update(deltaTime) {
      super.update();
      this.shooterTimer += deltaTime;
      if (this.shooterTimer >= this.shooterInterval && !this.game.gameOver) {
        this.shootTop();
        this.shooterTimer = 0;
      }

      if (this.y >= 100) {
        this.speedY = 0;
      }

      this.enemyBullets.forEach((b) => b.update(deltaTime));

      this.enemyBullets = this.enemyBullets.filter(
        (b) => !b.markedForDeletion && b.y <= this.game.height
      );

      this.enemyBullets.forEach((b) => {
        if (checkCollision(this.game.player, b)) {
          this.game.player.lives--;
          b.markedForDeletion = true;
        }
      });
    }

    shootTop() {
      this.enemyBullets.push(
        new Angler3Shooter(
          this.game,
          this.x + this.width / 2 - 2,
          this.y + this.height
        )
      );
    }

    draw(context) {
      super.draw(context);
      this.enemyBullets.forEach((b) => b.draw(context));
    }
  }

  class Angler3Shooter {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.width = 10;
      this.height = 10;
      this.speedY = 7;
      this.markedForDeletion = false;
    }

    update() {
      this.y += this.speedY;
      if (this.y > this.game.height) this.markedForDeletion = true;
    }

    draw(context) {
      context.fillStyle = 'rgb(160, 125, 255)';
      context.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  class BossBase extends Enemy {
    constructor(game) {
      super(game);

      this.isBoss = true;

      this.maxLives = 100;
      this.lives = this.maxLives;

      this.speedX = 2;
      this.speedY = 1;

      this.phase = 1;
    }

    update(deltaTime) {
      super.update(deltaTime);

      this.handlePhases();
    }

    handlePhases() {
      const hpPercent = this.lives / this.maxLives;

      if (hpPercent < 0.6 && this.phase === 1) {
        this.phase = 2;
        this.speedX *= 1.4;
      }

      if (hpPercent < 0.3 && this.phase === 2) {
        this.phase = 3;
        this.speedX *= 1.5;
      }
    }

    drawHealthBar(ctx) {
      const barW = 260;
      const barH = 16;
      const bx = this.game.width / 2 - barW / 2;
      const by = 22;

      const p = Math.max(0, this.lives / this.maxLives);

      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(bx, by, barW, barH);

      ctx.fillStyle = '#ff2d55';
      ctx.fillRect(bx, by, barW * p, barH);

      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, barW, barH);
    }
  }

  class Boss1 extends BossBase {
    constructor(game) {
      super(game);

      this.width = 180;
      this.height = 180;

      this.x = game.width / 2 - this.width / 2;
      this.y = -this.height;

      this.speedY = 1.2;
      this.speedX = 2.2;

      this.maxLives = 30;
      this.lives = this.maxLives;

      this.color = '#ff2d55';

      this.time = 0;

      this.baseY = 80;
      this.hoverAmp = 10;

      this.moveAmp = game.width * 0.18;
      this.moveSmooth = 0.12;

      this.shootTimer = 0;
      this.shootInterval = 750;

      this.enemyBullets = [];

      this.hitFlash = 0;
    }

    update(deltaTime) {
      if (this.game.upgradeCardsShowing) return;
      const dt = deltaTime / 16.67;

      if (this.y < this.baseY) {
        this.y += this.speedY * dt;
        return;
      }

      this.time += deltaTime * 0.001;

      const centerX = this.game.width / 2 - this.width / 2;
      const targetX = centerX + Math.sin(this.time) * this.moveAmp;
      this.x += (targetX - this.x) * this.moveSmooth;

      const targetY = this.baseY + Math.sin(this.time * 1.5) * this.hoverAmp;
      this.y += (targetY - this.y) * 0.18;

      this.shootTimer += deltaTime;
      if (!this.game.gameOver && this.shootTimer >= this.shootInterval) {
        this.shootTimer = 0;

        const px = this.game.player.x + this.game.player.width / 2;
        const py = this.game.player.y + this.game.player.height / 2;

        const bx = this.x + this.width / 2;
        const by = this.y + this.height;

        const dx = px - bx;
        const dy = py - by;

        const len = Math.hypot(dx, dy) || 1;

        const speed = 7.2;
        const vx = (dx / len) * speed;
        const vy = (dy / len) * speed;

        this.enemyBullets.push(new Boss1Bullet(this.game, bx - 5, by, vx, vy));
      }

      this.enemyBullets.forEach((b) => b.update(deltaTime));
      this.enemyBullets = this.enemyBullets.filter((b) => !b.markedForDeletion);

      this.enemyBullets.forEach((b) => {
        if (b.markedForDeletion) return;

        if (
          !this.game.player.invulnerable &&
          checkCollision(this.game.player, b)
        ) {
          this.game.player.lives--;
          this.game.player.invulnerable = true;
          this.game.player.invulnerableTimer = 0;
          b.markedForDeletion = true;
          this.hitFlash = 120;
        }
      });

      if (this.hitFlash > 0) this.hitFlash -= deltaTime;

      super.handlePhases();
    }

    draw(ctx) {
      ctx.save();

      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);

      ctx.restore();

      this.drawHealthBar(ctx);

      this.enemyBullets.forEach((b) => b.draw(ctx));
    }
  }

  class Boss1Bullet {
    constructor(game, x, y, vx, vy) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.width = 10;
      this.height = 18;
      this.markedForDeletion = false;
    }

    update(deltaTime) {
      const dt = deltaTime / 16.67;
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      if (this.y > this.game.height + this.height)
        this.markedForDeletion = true;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.shadowColor = 'rgba(255,45,85,0.9)';
      ctx.shadowBlur = 14;
      ctx.fillStyle = 'rgba(255,45,85,1)';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.restore();
    }
  }

  const ENEMY_SPAWN_TABLE = {
    1: {
      stages: {
        1: [{ type: Angler1, weight: 1 }],
        2: [{ type: Angler1, weight: 1 }],
        3: [{ type: Angler1, weight: 1 }],
      },
    },

    2: {
      stages: {
        1: [{ type: Angler1, weight: 1 }],
        2: [
          { type: Angler1, weight: 0.7 },
          { type: Angler2, weight: 0.3 },
        ],
        3: [
          { type: Angler1, weight: 0.5 },
          { type: Angler2, weight: 0.5 },
        ],
      },
    },

    3: {
      stages: {
        1: [
          { type: Angler1, weight: 0.75 },
          { type: Angler2, weight: 0.25 },
        ],
        2: [
          { type: Angler1, weight: 0.5 },
          { type: Angler2, weight: 0.5 },
        ],
        3: [
          { type: Angler1, weight: 0.6 },
          { type: Angler2, weight: 0.4 },
        ],
      },
    },

    4: {
      stages: {
        1: [
          { type: Angler1, weight: 0.65 },
          { type: Angler2, weight: 0.35 },
        ],
        2: [
          { type: Angler1, weight: 0.45 },
          { type: Angler2, weight: 0.48 },
          { type: Angler3, weight: 0.07 },
        ],
        3: [
          { type: Angler1, weight: 0.22 },
          { type: Angler2, weight: 0.6 },
          { type: Angler3, weight: 0.18 },
        ],
      },
    },

    5: {
      stages: {
        1: [
          { type: Angler1, weight: 0.55 },
          { type: Angler2, weight: 0.42 },
          { type: Angler3, weight: 0.03 },
        ],
        2: [
          { type: Angler1, weight: 0.35 },
          { type: Angler2, weight: 0.55 },
          { type: Angler3, weight: 0.1 },
        ],
        3: [
          { type: Angler1, weight: 0.18 },
          { type: Angler2, weight: 0.62 },
          { type: Angler3, weight: 0.2 },
        ],
      },
    },

    6: {
      stages: {
        1: [
          { type: Angler1, weight: 0.45 },
          { type: Angler2, weight: 0.5 },
          { type: Angler3, weight: 0.05 },
        ],
        2: [
          { type: Angler1, weight: 0.28 },
          { type: Angler2, weight: 0.58 },
          { type: Angler3, weight: 0.14 },
        ],
        3: [
          { type: Angler1, weight: 0.14 },
          { type: Angler2, weight: 0.62 },
          { type: Angler3, weight: 0.24 },
        ],
      },
    },

    7: {
      stages: {
        1: [
          { type: Angler1, weight: 0.38 },
          { type: Angler2, weight: 0.54 },
          { type: Angler3, weight: 0.08 },
        ],
        2: [
          { type: Angler1, weight: 0.22 },
          { type: Angler2, weight: 0.6 },
          { type: Angler3, weight: 0.18 },
        ],
        3: [
          { type: Angler1, weight: 0.1 },
          { type: Angler2, weight: 0.62 },
          { type: Angler3, weight: 0.28 },
        ],
      },
    },

    8: {
      stages: {
        1: [
          { type: Angler1, weight: 0.3 },
          { type: Angler2, weight: 0.58 },
          { type: Angler3, weight: 0.12 },
        ],
        2: [
          { type: Angler1, weight: 0.18 },
          { type: Angler2, weight: 0.62 },
          { type: Angler3, weight: 0.2 },
        ],
        3: [
          { type: Angler1, weight: 0.08 },
          { type: Angler2, weight: 0.6 },
          { type: Angler3, weight: 0.32 },
        ],
      },
    },

    9: {
      stages: {
        1: [
          { type: Angler1, weight: 0.24 },
          { type: Angler2, weight: 0.6 },
          { type: Angler3, weight: 0.16 },
        ],
        2: [
          { type: Angler1, weight: 0.14 },
          { type: Angler2, weight: 0.62 },
          { type: Angler3, weight: 0.24 },
        ],
        3: [
          { type: Angler1, weight: 0.06 },
          { type: Angler2, weight: 0.58 },
          { type: Angler3, weight: 0.36 },
        ],
      },
    },

    10: {
      stages: {
        1: [
          { type: Angler1, weight: 0.2 },
          { type: Angler2, weight: 0.6 },
          { type: Angler3, weight: 0.2 },
        ],
        2: [
          { type: Angler1, weight: 0.12 },
          { type: Angler2, weight: 0.6 },
          { type: Angler3, weight: 0.28 },
        ],
        3: [
          { type: Angler1, weight: 0.05 },
          { type: Angler2, weight: 0.55 },
          { type: Angler3, weight: 0.4 },
        ],
      },
    },
  };

  class UI {
    constructor(game) {
      this.game = game;
      this.fontSize = 26;
      this.fontFamily = 'Helvetica';
      this.color = 'white';

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
      ctx.save();

      ctx.fillStyle = this.color;
      ctx.font = `${this.fontSize}px ${this.fontFamily}`;
      ctx.fillText(`Score: ${this.game.score}`, 20, 30);

      // 👇 החיים החדשים
      this.drawLives(ctx);

      this.drawSuperGauge(ctx);

      if (this.game.gameOver) {
        this.drawGameOver(ctx);
      }

      ctx.restore();
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
        ctx.font = 'bold 14px Helvetica';
        ctx.textAlign = 'center';
        ctx.fillText('SUPER READY', this.game.width / 2, y - 6);
      }

      ctx.restore();
    }

    drawGameOver(ctx) {
      let message1, message2, color;

      if (this.game.win) {
        message1 = 'YOU WIN!';
        message2 = `Score: ${this.game.score}`;
        color = '#FFD700';
      } else {
        message1 = 'GAME OVER';
        message2 = `Score: ${this.game.score}`;
        color = '#FF5555';
      }

      ctx.save();
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.font = `48px ${this.fontFamily}`;
      ctx.fillText(message1, this.game.width / 2, this.game.height / 2 - 60);

      ctx.font = `28px ${this.fontFamily}`;
      ctx.fillText(message2, this.game.width / 2, this.game.height / 2 + 10);

      ctx.font = `22px ${this.fontFamily}`;
      ctx.fillStyle = 'white';
      ctx.fillText(
        'Press R to Restart',
        this.game.width / 2,
        this.game.height / 2 + 70
      );

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
  }

  class Upgrades {
    constructor(game) {
      this.game = game;
      this.width = this.game.width * 0.25;
      this.height = this.width * 1.2;
      this.x = this.game.width / 2 - this.width / 2;
      this.y = this.game.height + this.height;
      this.targetY = this.game.height / 2 - this.height / 2;
      this.fontSize = Math.max(14, this.width * 0.12);
      this.fontFamily = 'Helvetica';
      this.color = '#111';
      this.type = 'shild';
      this.opacity = 0;
      this.appearing = true;
      this.removing = false;
      this.scale = 1;
    }

    randomizeType() {
      const rand = Math.random();
      if (rand > 0.9) this.type = 'fasterShoter';
      else if (rand > 0.6) this.type = 'plusHp';
      else if (rand > 0.3) this.type = 'dublleShoter';
      else this.type = 'shild';
    }

    update(deltaTime) {
      const speed = 0.4;
      if (this.appearing) {
        const distance = this.y - this.targetY;
        this.y -= distance * speed * (deltaTime / 16.67);
        this.opacity += 0.08 * (deltaTime / 16.67);
        if (Math.abs(distance) < 1) {
          this.y = this.targetY;
          this.opacity = 1;
          this.appearing = false;
        }
      }
      if (this.removing) {
        this.scale += 0.07 * (deltaTime / 16.67);
        this.opacity -= 0.1 * (deltaTime / 16.67);
        if (this.opacity <= 0) {
          this.opacity = 0;
          this.removing = false;
        }
      }
    }

    draw(context) {
      context.save();
      context.globalAlpha = this.opacity;
      context.translate(this.x + this.width / 2, this.y + this.height / 2);
      context.scale(this.scale, this.scale);
      context.translate(-this.width / 2, -this.height / 2);

      const w = this.width;
      const h = this.height;
      const r = Math.max(14, w * 0.12);

      const theme = this.getTheme();

      context.save();
      context.shadowColor = theme.glow;
      context.shadowBlur = 28;
      context.globalAlpha *= 0.75;
      this.roundRect(context, 0, 0, w, h, r);
      context.fillStyle = 'rgba(0,0,0,0.35)';
      context.fill();
      context.restore();

      const g = context.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, theme.bgTop);
      g.addColorStop(1, theme.bgBottom);
      this.roundRect(context, 0, 0, w, h, r);
      context.fillStyle = g;
      context.fill();

      const shine = context.createLinearGradient(0, 0, w, h * 0.55);
      shine.addColorStop(0, 'rgba(255,255,255,0.20)');
      shine.addColorStop(0.45, 'rgba(255,255,255,0.06)');
      shine.addColorStop(1, 'rgba(255,255,255,0)');
      this.roundRect(context, 2, 2, w - 4, h * 0.55, r - 2);
      context.fillStyle = shine;
      context.fill();

      context.save();
      context.shadowColor = theme.glow;
      context.shadowBlur = 18;
      context.lineWidth = 3;
      this.roundRect(context, 0, 0, w, h, r);
      context.strokeStyle = theme.border;
      context.stroke();
      context.restore();

      context.lineWidth = 2;
      this.roundRect(context, 6, 6, w - 12, h - 12, r - 6);
      context.strokeStyle = 'rgba(255,255,255,0.12)';
      context.stroke();

      const cx = w / 2;
      const cy = h * 0.32;
      const iconR = Math.max(18, w * 0.16);

      context.save();
      context.shadowColor = theme.glow;
      context.shadowBlur = 20;
      context.globalAlpha *= 0.95;
      context.beginPath();
      context.arc(cx, cy, iconR, 0, Math.PI * 2);
      context.fillStyle = theme.iconBg;
      context.fill();
      context.restore();

      context.save();
      context.font = `bold ${Math.round(iconR * 1.15)}px ${this.fontFamily}`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = 'white';
      context.shadowColor = theme.glow;
      context.shadowBlur = 12;
      context.fillText(theme.icon, cx, cy + 1);
      context.restore();

      this.drawText(context, theme);

      context.restore();
    }

    drawText(context, theme) {
      context.save();
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      const titleY = this.height * 0.62;
      const subY = this.height * 0.75;

      const titleSize = Math.round(this.fontSize * 1.05);
      const subSize = Math.round(this.fontSize * 0.78);

      let line1, line2;
      switch (this.type) {
        case 'dublleShoter':
          line1 = 'Double Shot';
          line2 = '+1 Projectile';
          break;
        case 'plusHp':
          line1 = 'Extra HP';
          line2 = '+1 Life';
          break;
        case 'fasterShoter':
          line1 = 'Faster Fire';
          line2 = '-Rate Boost';
          break;
        default:
          line1 = 'Shield';
          line2 = '20s Protection';
          break;
        case 'petFaster':
          line1 = 'Pet';
          line2 = 'Faster';
          break;
      }

      // title
      context.font = `900 ${titleSize}px ${this.fontFamily}`;
      context.fillStyle = 'white';
      context.shadowColor = theme.glow;
      context.shadowBlur = 14;
      context.fillText(line1, this.width / 2, titleY);

      // subtitle
      context.shadowBlur = 0;
      context.font = `700 ${subSize}px ${this.fontFamily}`;
      context.fillStyle = 'rgba(255,255,255,0.78)';
      context.fillText(line2, this.width / 2, subY);

      context.restore();
    }

    getTheme() {
      switch (this.type) {
        case 'dublleShoter':
          return {
            bgTop: 'rgba(60, 255, 200, 0.18)',
            bgBottom: 'rgba(0, 0, 0, 0.55)',
            border: 'rgba(60, 255, 200, 0.85)',
            glow: 'rgba(60, 255, 200, 0.95)',
            iconBg: 'rgba(60, 255, 200, 0.18)',
            icon: '⟡',
          };
        case 'plusHp':
          return {
            bgTop: 'rgba(255, 80, 140, 0.18)',
            bgBottom: 'rgba(0, 0, 0, 0.55)',
            border: 'rgba(255, 80, 140, 0.85)',
            glow: 'rgba(255, 80, 140, 0.95)',
            iconBg: 'rgba(255, 80, 140, 0.18)',
            icon: '❤',
          };
        case 'fasterShoter':
          return {
            bgTop: 'rgba(110, 160, 255, 0.20)',
            bgBottom: 'rgba(0, 0, 0, 0.55)',
            border: 'rgba(110, 160, 255, 0.85)',
            glow: 'rgba(110, 160, 255, 0.95)',
            iconBg: 'rgba(110, 160, 255, 0.18)',
            icon: '⚡',
          };
        default:
          return {
            bgTop: 'rgba(180, 120, 255, 0.20)',
            bgBottom: 'rgba(0, 0, 0, 0.55)',
            border: 'rgba(180, 120, 255, 0.85)',
            glow: 'rgba(180, 120, 255, 0.95)',
            iconBg: 'rgba(180, 120, 255, 0.18)',
            icon: '🛡',
          };
      }
    }

    roundRect(ctx, x, y, w, h, r) {
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
  }

  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;

      this.bossSpawned = false;
      this.bossActive = false;
      this.bossKilled = false;

      this.level = currentLevel;

      this.stage = 1;
      this.score = 0;

      this.enemyTimer = 0;
      this.enemyInterval = this.getEnemyInterval();
      this.enemies = [];

      this.player = new Player(this);

      const petId = getEquippedPet();
      this.pet =
        petId && PET_CLASSES[petId] ? new PET_CLASSES[petId](this) : null;
      this.petCooldownMult = 1;
      this.petCooldownMin = 2000;

      this.mouse = new Mouse(this);
      this.ui = new UI(this);
      this.explosions = [];

      this.nextRageScore = 10;
      this.winningScore = 30;

      this.equippedSuper =
        localStorage.getItem('equippedSuper') || 'waveShield';
      this.superAttacks = [];
      this.superAttackGauge = 0;
      const superData = SUPER_TYPES[this.equippedSuper];
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
    }

    addSuperCharge(amount = 1) {
      if (this.gameOver) return;
      const need = this.superAttackReadyGauge || 5;
      this.superAttackGauge = Math.min(need, this.superAttackGauge + amount);
    }

    update(deltaTime) {
      this.player.update(deltaTime);

      if (this.pet) this.pet.update(deltaTime);

      if (!this.bossActive) {
        if (this.enemyTimer >= this.enemyInterval && !this.gameOver) {
          const cfg = getLevelCfg(this.level);

          if (this.enemies.length < cfg.maxOnScreen) {
            this.addEnemy();
          }

          this.enemyTimer = 0;
        } else {
          this.enemyTimer += deltaTime;
        }
      }

      this.enemies.forEach((enemy) => enemy.update(deltaTime));
      this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);

      if (this.pet && this.pet.markedForDeletion) this.pet = null;

      this.enemies.forEach((enemy) => {
        if (
          !this.player.invulnerable &&
          checkCollision(enemy, this.player) &&
          !this.gameOver
        ) {
          this.player.lives--;
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
      });

      if (this.player.invulnerable && !this.gameOver) {
        this.player.invulnerableTimer += deltaTime;
        if (this.player.invulnerableTimer >= this.player.invulnerableInterval) {
          this.player.invulnerable = false;
          this.player.invulnerableTimer = 0;
        }
      }

      this.player.projectiles.forEach((p) => {
        this.enemies.forEach((enemy) => {
          if (p.markedForDeletion || enemy.markedForDeletion) return;
          if (!checkCollision(p, enemy)) return;

          if (p instanceof Missile) {
            enemy.lives -= p.damage ?? 1;
            p.markedForDeletion = true;
          } else {
            if (p instanceof TriangleProjectile && p.grace > 0) return;

            enemy.lives -= p.damage ?? 1;

            if (p instanceof TriangleProjectile && p.split) {
              p.split = false;

              const cy = p.y + p.height * 0.35;
              const leftX = p.x - 6;
              const rightX = p.x + 6;
              const grace = 140;

              this.player.projectiles.push(
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

              this.player.projectiles.push(
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

              p.markedForDeletion = true;
            }

            p.markedForDeletion = true;
          }

          if (enemy.lives <= 0 && !enemy.markedForDeletion) {
            enemy.markedForDeletion = true;

            if (enemy instanceof Boss1) {
              this.bossActive = false;
              this.bossKilled = true;
            } else {
              this.score++;
              this.addSuperCharge(1);
            }

            const px = enemy.x + enemy.width / 2;
            const py = enemy.y + enemy.height / 2;
            this.explosions.push(new Explosion(this, px, py));
          }
        });
      });

      this.explosions.forEach((explosion) => explosion.update(deltaTime));
      this.explosions = this.explosions.filter((e) => !e.markedForDeletion);

      if (
        !this.bossActive &&
        this.score >= this.nextRageScore &&
        !this.upgradeCardsShowing
      ) {
        this.upgradeCardsShowing = true;

        this.enemies.forEach((enemy) => {
          enemy.originalSpeedY = enemy.speedY;
          enemy.speedY = 0;
        });

        this.stage++;
        this.enemyInterval = this.getEnemyInterval();
        this.createUpgradeCards();
      }

      if (this.upgradeCardsShowing) {
        this.enemies.forEach((enemy) => {
          if (enemy.originalSpeedY === undefined)
            enemy.originalSpeedY = enemy.speedY;
          enemy.speedY = 0;
        });

        this.player.speedX = 0;
        this.player.speedY = 0;
      } else {
        this.enemies.forEach((enemy) => {
          if (enemy.originalSpeedY !== undefined) {
            enemy.speedY = enemy.originalSpeedY;
            delete enemy.originalSpeedY;
          }
        });
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
        this.level !== 1 &&
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
        this.player.projectiles.forEach((p) => (p.markedForDeletion = true));
        this.enemies.forEach((enemy) => (enemy.speedY = 0));
        this.player.invulnerable = false;
      }

      if (this.upgradeCardsShowing) {
        this.upgradeCards.forEach((card) => card.update(deltaTime));
      }

      if (this.pet && Array.isArray(this.pet.petBullets)) {
        this.pet.petBullets.forEach((bullet) => {
          if (bullet.markedForDeletion) return;

          this.enemies.forEach((enemy) => {
            if (enemy.markedForDeletion) return;

            if (checkCollision(bullet, enemy)) {
              enemy.lives -= bullet.damage;
              bullet.markedForDeletion = true;

              if (enemy.lives <= 0 && !enemy.markedForDeletion) {
                enemy.markedForDeletion = true;

                if (enemy instanceof Boss1) {
                  this.bossActive = false;
                  this.bossKilled = true;
                } else {
                  this.score++;
                  this.addSuperCharge(1);
                }

                const px = enemy.x + enemy.width / 2;
                const py = enemy.y + enemy.height / 2;
                this.explosions.push(new Explosion(this, px, py));
              }
            }
          });
        });
      }

      this.enemies.forEach((enemy) => {
        if (enemy.lives <= 0 && !enemy.markedForDeletion) {
          enemy.markedForDeletion = true;

          if (enemy instanceof Boss1) {
            this.bossActive = false;
            this.bossKilled = true;
          } else {
            this.score++;
            this.addSuperCharge(1);
          }

          const px = enemy.x + enemy.width / 2;
          const py = enemy.y + enemy.height / 2;
          this.explosions.push(new Explosion(this, px, py));
        }
      });

      if (this.gameOver && !this.rewardGiven) {
        if (this.win) {
          const reward = 30 + Math.floor(this.score * 1.2) + this.level * 8;

          grantCoins(reward);
          unlockNextLevel(this.level);

          showVictoryScreen({ win: true, reward, level: this.level });
        } else {
          showVictoryScreen({ win: false, reward: 0, level: this.level });
        }

        this.rewardGiven = true;
      }

      this.superAttacks.forEach((superAtk) => {
        if (superAtk instanceof SuperLaser) return;

        this.enemies.forEach((enemy) => {
          if (
            !enemy.markedForDeletion &&
            !enemy.hitBySuper &&
            checkCollision(superAtk, enemy)
          ) {
            enemy.lives -= superAtk.damage;
            enemy.hitBySuper = true;

            if (enemy.lives <= 0 && !enemy.markedForDeletion) {
              enemy.markedForDeletion = true;
              this.score++;
              this.addSuperCharge(1);

              this.explosions.push(
                new Explosion(
                  this,
                  enemy.x + enemy.width / 2,
                  enemy.y + enemy.height / 2
                )
              );
            }
          }

          if (enemy.enemyBullets) {
            enemy.enemyBullets.forEach((bullet) => {
              if (
                !bullet.markedForDeletion &&
                checkCollision(superAtk, bullet)
              ) {
                bullet.markedForDeletion = true;
              }
            });
          }
        });
      });

      if (
        this.superAttackGauge >= this.superAttackReadyGauge &&
        !this.superActive &&
        !this.gameOver
      ) {
        this.activateSuper();
      }

      this.superAttacks.forEach((s) => s.update(deltaTime));
      this.superAttacks = this.superAttacks.filter((s) => !s.markedForDeletion);

      const target = this.superAttackGauge / this.superAttackReadyGauge;
      this.superGaugeVisual += (target - this.superGaugeVisual) * 0.08;
    }

    draw(context) {
      this.player.draw(context);

      if (this.pet) {
        this.pet.draw(context);
      }
      this.superAttacks.forEach((sa) => sa.draw(context));
      this.enemies.forEach((enemy) => enemy.draw(context));
      this.explosions.forEach((explosion) => explosion.draw(context));
      this.ui.draw(context);

      if (this.upgradeCardsShowing) {
        this.upgradeCards.forEach((card) => card.draw(context));
      }
    }

    addEnemy() {
      if (this.level === 1) {
        this.enemies.push(new Angler1(this));
        return;
      }

      const levelData = ENEMY_SPAWN_TABLE[this.level] || ENEMY_SPAWN_TABLE[1];
      const stageData =
        levelData.stages[this.stage] ||
        levelData.stages[Math.max(...Object.keys(levelData.stages))];

      const enemyClass = this.pickWeighted(stageData);
      this.enemies.push(new enemyClass(this));
    }

    pickWeighted(pool) {
      const total = pool.reduce((s, e) => s + e.weight, 0);
      let r = Math.random() * total;

      for (const e of pool) {
        r -= e.weight;
        if (r <= 0) return e.type;
      }
    }

    getEnemyInterval() {
      const level = this.level;
      const stage = this.stage;

      const levelBase =
        {
          1: 1300,
          2: 1500,
          3: 1350,
          4: 1200,
        }[level] ?? Math.max(850, 1250 - level * 25);

      const stageMul =
        {
          1: 1.0,
          2: 0.92,
          3: 0.85,
        }[stage] ?? Math.max(0.75, 1 - stage * 0.07);

      return Math.max(500, levelBase * stageMul);
    }

    createUpgradeCards() {
      this.upgradeCards = [];

      const numberOfCards = 3;
      const cardWidth = this.width * 0.25;
      const spacing = cardWidth * 0.2;
      const totalWidth =
        numberOfCards * cardWidth + (numberOfCards - 1) * spacing;
      const startX = (this.width - totalWidth) / 2;
      const targetY = this.height / 2 - cardWidth * 0.6;

      const allTypes = [
        'dublleShoter',
        'plusHp',
        'fasterShoter',
        'shild',
        'petFaster',
      ];
      const selectedTypes = allTypes
        .sort(() => 0.5 - Math.random())
        .slice(0, numberOfCards);

      for (let i = 0; i < numberOfCards; i++) {
        const card = new Upgrades(this);
        card.type = selectedTypes[i];
        card.width = cardWidth;
        card.height = card.width * 1.2;
        card.x = startX + i * (cardWidth + spacing);
        card.y = this.height + card.height;
        card.targetY = targetY;
        card.appearing = true;
        card.opacity = 0;
        this.upgradeCards.push(card);
      }
    }

    applyUpgrade(type) {
      switch (type) {
        case 'dublleShoter':
          this.player.doubleShot = true;
          break;

        case 'plusHp':
          this.player.lives++;
          break;

        case 'fasterShoter':
          this.player.shootingInterval = Math.max(
            60,
            this.player.shootingInterval - 80
          );
          this.mouse.restartFire();
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
          this.petCooldownMult = Math.max(0.55, this.petCooldownMult - 0.15);
          break;
      }
    }

    getClosestEnemy(x, y) {
      let closest = null;
      let minDist = Infinity;

      this.enemies.forEach((enemy) => {
        const dx = enemy.x + enemy.width / 2 - x;
        const dy = enemy.y + enemy.height / 2 - y;
        const dist = Math.hypot(dx, dy);

        if (dist < minDist) {
          minDist = dist;
          closest = enemy;
        }
      });

      return closest;
    }

    activateSuper() {
      if (this.superActive) return;

      const superData = SUPER_TYPES[this.equippedSuper];
      if (!superData) {
        return;
      }

      this.superAttackReadyGauge =
        superData.charge ?? this.superAttackReadyGauge;

      this.superActive = true;
      this.superAttackGauge = 0;

      this.enemies.forEach((e) => (e.hitBySuper = false));

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

  function grantCoins(amount) {
    const current = Number(localStorage.getItem('coins')) || 0;
    localStorage.setItem('coins', current + amount);
  }

  function restartGame() {
    game = new Game(logicalW, logicalH);
  }

  (async () => {
    await preload();

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

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  })();
});

function showVictoryScreen(data) {
  const screen = document.getElementById('victoryScreen');
  const text = document.getElementById('rewardText');
  const title = screen.querySelector('h2');
  const nextBtn = document.getElementById('btnNext');

  if (data.win) {
    title.textContent = '🏆 Victory!';
    text.textContent = `You earned ${data.reward} coins`;
    nextBtn.textContent = 'Next Level';

    nextBtn.onclick = () => {
      window.location.href = `game.html?level=${data.level + 1}`;
    };
  } else {
    title.textContent = '💀 Game Over';
    text.textContent = 'Better luck next time!';
    nextBtn.textContent = 'Try Again';

    nextBtn.onclick = () => {
      window.location.href = `game.html?level=${data.level}`;
    };
  }

  screen.classList.remove('hidden');

  document.getElementById('btnLobby').onclick = () => {
    window.location.href = 'index.html';
  };
}

function enterFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen();
}

battleBtn.addEventListener('click', () => {
  enterFullscreen();
});
