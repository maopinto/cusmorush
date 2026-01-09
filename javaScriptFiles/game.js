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

window.addEventListener('load', function () {
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
    background.resize();
    stars.resize();
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
    constructor(canvas, imageSrc, speed = 1) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      this.image = new Image();
      this.image.src = imageSrc;

      this.speed = speed;

      const rect = canvas.getBoundingClientRect();
      this.w = rect.width;
      this.h = rect.height;

      this.y1 = 0;
      this.y2 = -this.h;

      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
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

  const background = new ScrollingBackground(
    canvas,
    './images/game/background/blueSpace.png',
    1.2
  );

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

  const stars = new Starfield(canvas, 160);

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

      this.imageLoaded = false;
      this.image = new Image();
      this.image.onload = () => {
        this.imageLoaded = true;
      };
      this.image.src = './images/game/sprites/smokeExplosion.png';
    }

    update(deltaTime) {
      if (!this.imageLoaded) return;

      if (this.timer > this.interval) {
        this.frameX++;
        this.timer = 0;
      } else {
        this.timer += deltaTime;
      }

      if (this.frameX > this.maxFrame) {
        this.markedForDeletion = true;
      }
    }

    draw(context) {
      if (!this.imageLoaded) return;

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
    constructor(game, x, y, speedX = 0, speedY = -5, canSplit = true) {
      super(game, x, y);

      this.width = 18;
      this.height = 22;

      this.speedX = speedX;
      this.speedY = speedY;

      this.damage = 2;
      this.split = canSplit;

      this.justSpawned = true;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.justSpawned) this.justSpawned = false;

      if (
        this.y < -this.height ||
        this.x < -this.width ||
        this.x > this.game.width + this.width
      ) {
        this.markedForDeletion = true;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.fillStyle = '#00ffff';

      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, this.y);
      ctx.lineTo(this.x, this.y + this.height);
      ctx.lineTo(this.x + this.width, this.y + this.height);
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
    waveShield: { class: SuperAttack1, duration: 500, charge: 1 },
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
      this.image = document.getElementById('player');
      this.frameX = 0;
      this.frameY = 1;
      this.frameTimer = 0;
      this.frameInterval = 80;
      this.spriteWidth = 128;
      this.spriteHeight = 128;
    }

    update(deltaTime) {
      this.x += this.speedX;
      this.y += this.speedY;

      this.frameTimer += deltaTime;
      if (this.frameTimer > this.frameInterval) {
        this.frameX++;
        if (this.frameX >= 6) this.frameX = 0;
        this.frameTimer = 0;
      }

      if (this.game.mouse.pressed) {
        const dx = this.game.mouse.x - (this.x + this.width / 2);
        const dy = this.game.mouse.y - (this.y + this.height / 2);

        this.speedX = dx * 0.1;
        this.speedY = dy * 0.1;

        canvas.style.cursor = 'none';
      } else {
        this.speedX = 0;
        this.speedY = 0;
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
      this.width = 60;
      this.height = 60;
      this.offsetX = -70;
      this.offsetY = 100;

      this.lives = 3;

      this.petBullets = [];
      this.shootTimer = 0;
      this.shootInterval = 8000;

      this.markedForDeletion = false;
      this.invulnerable = false;
      this.invulnerableTimer = 0;
      this.invulnerableInterval = 1000;
    }

    update(deltaTime) {
      const player = this.game.player;

      this.x = player.x + this.offsetX;
      this.y = player.y + this.offsetY;

      this.shootTimer += deltaTime;
      if (this.shootTimer >= this.shootInterval && !this.game.gameOver) {
        this.shoot();
        this.shootTimer = 0;
      }

      this.petBullets.forEach((bullet) => bullet.update());
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
        new Pet1Bullet(this.game, this.x + this.width / 2, this.y + 5, target)
      );
    }

    draw(context) {
      context.fillStyle = this.invulnerable ? 'orange' : 'yellow';
      context.fillRect(this.x, this.y, this.width, this.height);

      this.petBullets.forEach((bullet) => bullet.draw(context));
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
    }

    update() {
      if (!this.target || this.target.markedForDeletion) {
        this.markedForDeletion = true;
        return;
      }

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
      ctx.save();
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(
        this.x - this.size / 2,
        this.y - this.size / 2,
        this.size,
        this.size
      );
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
      this.target = null;

      this.markedForDeletion = false;
    }

    update(deltaTime) {
      const player = this.game.player;

      this.x = player.x + this.offsetX;
      this.y = player.y + this.offsetY;

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

      console.log('🧠 Siren controlled:', controller, '→', target);
    }

    draw(ctx) {
      ctx.save();

      ctx.fillStyle = 'purple';
      ctx.fillRect(this.x, this.y, this.width, this.height);

      if (this.target) {
        ctx.strokeStyle = 'violet';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
        ctx.lineTo(
          this.target.x + this.target.width / 2,
          this.target.y + this.target.height / 2
        );
        ctx.stroke();
      }

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
        console.log('💥 The Enemy is Shooting!');
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

  const ENEMY_SPAWN_TABLE = {
    1: {
      stages: {
        1: [{ type: Angler1, weight: 1 }],
        2: [
          { type: Angler1, weight: 0.8 },
          { type: Angler2, weight: 0.2 },
        ],
        3: [
          { type: Angler1, weight: 0.6 },
          { type: Angler2, weight: 0.3 },
          { type: Angler3, weight: 0.1 },
        ],
      },
    },
    2: {
      stages: {
        1: [
          { type: Angler1, weight: 0.7 },
          { type: Angler2, weight: 0.3 },
        ],
        2: [
          { type: Angler1, weight: 0.4 },
          { type: Angler2, weight: 0.4 },
          { type: Angler3, weight: 0.2 },
        ],
        3: [
          { type: Angler2, weight: 0.5 },
          { type: Angler3, weight: 0.5 },
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

      let hearts;
      if (this.game.gameOver) {
        hearts = '💀💀💀';
      } else if (this.game.player.invulnerable) {
        hearts = '🛡️'.repeat(this.game.player.lives);
      } else {
        hearts = '❤️'.repeat(this.game.player.lives);
      }
      ctx.fillText(`Lives: ${hearts}`, 20, 65);

      this.drawSuperGauge(ctx);

      if (this.game.gameOver) {
        this.drawGameOver(ctx);
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

      context.fillStyle = 'white';
      context.fillRect(0, 0, this.width, this.height);
      context.strokeStyle = '#333';
      context.lineWidth = 2;
      context.strokeRect(0, 0, this.width, this.height);

      this.drawText(context);
      context.restore();
    }

    drawText(context) {
      context.save();
      context.fillStyle = this.color;
      context.font = `${this.fontSize}px ${this.fontFamily}`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      let line1, line2;
      switch (this.type) {
        case 'dublleShoter':
          line1 = 'Double';
          line2 = 'Shooter';
          break;
        case 'plusHp':
          line1 = 'Extra';
          line2 = 'HP';
          break;
        case 'fasterShoter':
          line1 = 'Faster';
          line2 = 'Shooter';
          break;
        default:
          line1 = 'Shield';
          line2 = '20s';
          break;
      }

      context.fillText(
        line1,
        this.width / 2,
        this.height / 2 - this.fontSize * 0.4
      );
      context.fillText(
        line2,
        this.width / 2,
        this.height / 2 + this.fontSize * 0.6
      );
      context.restore();
    }
  }

  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;

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

    update(deltaTime) {
      this.player.update(deltaTime);

      if (this.pet) {
        this.pet.update(deltaTime);
      }

      if (this.enemyTimer >= this.enemyInterval && !this.gameOver) {
        this.addEnemy();
        this.enemyTimer = 0;
        console.log('enemy is entering');
      } else {
        this.enemyTimer += deltaTime;
      }
      this.enemies.forEach((enemy) => enemy.update(deltaTime));
      this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);

      if (this.pet && this.pet.markedForDeletion) {
        this.pet = null;
      }

      let playerHit = false;

      this.enemies.forEach((enemy) => {
        if (
          !this.player.invulnerable &&
          checkCollision(enemy, this.player) &&
          !this.gameOver
        ) {
          this.player.lives--;
          this.player.invulnerable = true;
          this.player.invulnerableTimer += deltaTime;
          playerHit = true;
          if (playerHit)
            console.log('player hitet you have ', this.player.lives, ' lives ');
        }
        if (
          this.pet &&
          !this.pet.invulnerable &&
          checkCollision(this.pet, enemy) &&
          !this.gameOver
        ) {
          this.pet.lives--;
          this.pet.invulnerable = true;

          console.log('🐾 Pet hit! lives:', this.pet.lives);

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
        console.log('invurerable mode is on');
        if (this.player.invulnerableTimer >= this.player.invulnerableInterval) {
          this.player.invulnerable = false;
          this.player.invulnerableTimer = 0;
          console.log('invunrerable mode is off');
        }
      }

      this.player.projectiles.forEach((p) => {
        this.enemies.forEach((enemy) => {
          if (p.markedForDeletion || enemy.markedForDeletion) return;

          if (checkCollision(p, enemy)) {
            if (p instanceof Missile) {
              this.player.projectiles.forEach((proj) => {
                proj.markedForDeletion = true;
              });

              enemy.lives -= p.damage ?? 1;
            } else {
              if (p instanceof TriangleProjectile && p.justSpawned) return;

              enemy.lives -= p.damage ?? 1;

              if (p instanceof TriangleProjectile && p.split) {
                p.split = false;

                const cx = p.x + p.width / 2;
                const cy = p.y;
                const offset = 14;

                this.player.projectiles.push(
                  new TriangleProjectile(this, cx - offset, cy, -5, 0, false)
                );

                this.player.projectiles.push(
                  new TriangleProjectile(this, cx + offset, cy, 5, 0, false)
                );
              }

              p.markedForDeletion = true;
            }

            if (enemy.lives <= 0 && !enemy.markedForDeletion) {
              enemy.markedForDeletion = true;

              this.score++;
              this.superAttackGauge++;

              const px = enemy.x + enemy.width / 2;
              const py = enemy.y + enemy.height / 2;
              this.explosions.push(new Explosion(this, px, py));
            }
          }
        });
      });

      this.explosions.forEach((explosion) => explosion.update(deltaTime));
      this.explosions = this.explosions.filter((e) => !e.markedForDeletion);
      if (this.score >= this.nextRageScore && !this.upgradeCardsShowing) {
        this.upgradeCardsShowing = true;
        this.enemies.forEach((enemy) => {
          enemy.originalSpeedY = enemy.speedY;
          enemy.speedY = 0;
          console.log('stage: ', this.stage);
        });

        this.stage++;
        this.enemyInterval = this.getEnemyInterval();

        console.log(this.stage);

        this.createUpgradeCards();
      }

      if (this.upgradeCardsShowing) {
        this.enemies.forEach((enemy) => (enemy.speedY = 0));
        this.player.speedX = 0;
        this.player.speedY = 0;
      }

      if (
        !this.upgradeCardsShowing &&
        this.enemies.some((e) => e.originalSpeedY !== undefined)
      ) {
        this.enemies.forEach((enemy) => {
          enemy.speedY = enemy.originalSpeedY;
          delete enemy.originalSpeedY;
        });
      }

      if (this.player.lives <= 0 && !this.gameOver) {
        this.gameOver = true;
        this.lost = true;
      }

      if (this.score >= this.winningScore && !this.gameOver) {
        this.gameOver = true;
        this.win = true;
      }

      if (this.gameOver) {
        this.player.speedX = 0;
        this.player.speedY = 0;
        this.player.projectiles.forEach((p) => (p.markedForDeletion = true));
        this.enemies.forEach((enemy) => (enemy.speedY = 0));
        this.player.invulnerable = false;
        this.lives = 0;
      }

      if (this.player.lives <= 0) this.gameOver = true;

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

              if (enemy.lives <= 0) {
                enemy.markedForDeletion = true;
                this.score++;

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
          this.score++;

          const px = enemy.x + enemy.width / 2;
          const py = enemy.y + enemy.height / 2;
          this.explosions.push(new Explosion(this, px, py));
        }
      });

      if (this.win && !this.rewardGiven) {
        const reward = 30 + Math.floor(this.score * 1.2) + this.level * 8;

        grantCoins(reward);
        unlockNextLevel(this.level);
        this.rewardGiven = true;

        showVictoryScreen(reward, this.level);
      }

      this.superAttacks.forEach((superAtk) => {
        // ✅ SuperLaser מטפל בדמג' לבד
        if (superAtk instanceof SuperLaser) return;

        this.enemies.forEach((enemy) => {
          if (
            !enemy.markedForDeletion &&
            !enemy.hitBySuper &&
            checkCollision(superAtk, enemy)
          ) {
            enemy.lives -= superAtk.damage;
            enemy.hitBySuper = true;

            if (enemy.lives <= 0) {
              enemy.markedForDeletion = true;
              this.score++;

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
      const base = 1800;
      const levelFactor = Math.max(1, 1.3 - this.level * 0.15);
      const stageFactor = Math.max(0.4, 1 - this.stage * 0.1);

      return Math.max(400, base * levelFactor * stageFactor);
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

      const allTypes = ['dublleShoter', 'plusHp', 'fasterShoter', 'shild'];
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
          console.log('💥 Upgrade: Double Shooter activated!');
          this.player.doubleShot = true;
          break;

        case 'plusHp':
          console.log('❤️ Upgrade: Extra HP!');
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
          console.log('🛡️ Upgrade: Temporary Shield!');

          this.player.invulnerable = true;
          this.player.shieldActive = true;

          setTimeout(() => {
            this.player.invulnerable = false;
            this.player.shieldActive = false;
            console.log('🛡️ Shield expired');
          }, 20000);

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
        console.warn('Unknown super:', this.equippedSuper);
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

  let game = new Game(logicalW, logicalH);

  function restartGame() {
    game = new Game(logicalW, logicalH);
  }

  let lastTime = 0;

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    ctx.clearRect(0, 0, logicalW, logicalH);

    background.update(deltaTime);
    background.draw();

    stars.update(deltaTime, 1.2);
    stars.draw();

    game.update(deltaTime);
    game.draw(ctx);

    requestAnimationFrame(animate);
  }

  animate(0);
});

function showVictoryScreen(reward, level) {
  const screen = document.getElementById('victoryScreen');
  const text = document.getElementById('rewardText');

  text.textContent = `You earned ${reward} coins`;

  screen.classList.remove('hidden');

  document.getElementById('btnLobby').onclick = () => {
    window.location.href = 'index.html';
  };

  document.getElementById('btnNext').onclick = () => {
    window.location.href = `game.html?level=${level + 1}`;
  };
}
