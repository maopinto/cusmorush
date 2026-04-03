class BossBase {
  constructor(game) {
    this.game = game;

    this.isBoss = true;

    this.x = 0;
    this.y = 0;
    this.width = 100;
    this.height = 100;

    this.speedX = 2;
    this.speedY = 1;

    this.maxLives = 100;
    this.lives = this.maxLives;

    this.phase = 1;

    this.hitBySuper = false;
    this.markedForDeletion = false;
  }

  update(deltaTime) {
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

    this.width = 120.5;
    this.height = 180;

    this.x = game.width / 2 - this.width / 2;
    this.y = -this.height;

    this.speedY = 1.2;
    this.speedX = 2.2;

    this.maxLives = 100;
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

    this.image =
      document.getElementById('boss1Sprite') ||
      cached?.dom?.boss1Sprite ||
      null;

    this.frames = 8;
    this.frameX = 0;
    this.frameY = 0;
    this.frameTimer = 0;
    this.frameInterval = 90;

    this.spriteWidth = 0;
    this.spriteHeight = 0;

    if (this.image && (this.image.naturalWidth || this.image.width)) {
      const iw = this.image.naturalWidth || this.image.width;
      const ih = this.image.naturalHeight || this.image.height;
      this.spriteWidth = iw / this.frames;
      this.spriteHeight = ih;
    }
  }

  update(deltaTime) {
    if (this.game.upgradeCardsShowing) return;
    const dt = deltaTime / 16.67;

    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameInterval) {
      this.frameX = (this.frameX + 1) % this.frames;
      this.frameTimer = 0;
    }

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
      if (b.isFake) return;

      if (
        !this.game.player.invulnerable &&
        window.checkCollision(this.game.player, b)
      ) {
        this.game.player.lives--;
        this.game.triggerShake(520, 26);
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

    if (this.hitFlash > 0) {
      ctx.globalAlpha = 0.8 + Math.sin(performance.now() * 0.05) * 0.2;
    }

    if (
      this.image &&
      this.image.complete &&
      this.image.naturalWidth &&
      this.spriteWidth > 0 &&
      this.spriteHeight > 0
    ) {
      ctx.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

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
    this.lives = 2;
    this.width = 40;
    this.height = 48;
    this.markedForDeletion = false;
  }

  update(deltaTime) {
    const dt = deltaTime / 16.67;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (
      this.y > this.game.height + this.height ||
      this.x < -this.width ||
      this.x > this.game.width + this.width
    ) {
      this.markedForDeletion = true;
    }

    const shots = this.game.player.projectiles;
    for (let i = 0; i < shots.length; i++) {
      const p = shots[i];
      if (p.markedForDeletion) continue;

      if (window.checkCollision(p, this)) {
        p.markedForDeletion = true;
        this.lives--;

        if (this.lives <= 0) {
          this.markedForDeletion = true;

          for (let i = 0; i < 6; i++) {
            this.game.particles.push({
              x: this.x + this.width / 2,
              y: this.y + this.height / 2,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              size: Math.random() * 3 + 2,
              life: 300,
              markedForDeletion: false,

              update(deltaTime) {
                const dt = deltaTime / 16.67;
                this.x += this.vx * dt;
                this.y += this.vy * dt;
                this.life -= deltaTime;

                if (this.life <= 0) {
                  this.markedForDeletion = true;
                }
              },

              draw(ctx) {
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                ctx.fillStyle = 'rgba(255,120,150,1)';
                ctx.fillRect(this.x, this.y, this.size, this.size);
                ctx.restore();
              },
            });
          }
        }

        break;
      }

      if (this.lives <= 0) {
        this.markedForDeletion = true;
      }
    }
  }

  draw(ctx) {
    const t = performance.now() * 0.02;
    const pulse = 0.88 + 0.12 * Math.sin(t);

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    const trailLen = 10;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    ctx.globalAlpha = 0.22 * pulse;
    ctx.fillStyle = 'rgba(255,50,90,1)';
    ctx.fillRect(this.x - 4, this.y - 4, this.width + 8, this.height + 8);

    const trail = ctx.createLinearGradient(
      cx,
      this.y + this.height + trailLen,
      cx,
      this.y
    );
    trail.addColorStop(0, 'rgba(255,40,80,0)');
    trail.addColorStop(0.35, 'rgba(255,50,90,0.28)');
    trail.addColorStop(1, 'rgba(255,120,140,0.55)');

    ctx.globalAlpha = 0.8;
    ctx.fillStyle = trail;
    ctx.fillRect(
      this.x + this.width * 0.2,
      this.y + this.height * 0.45,
      this.width * 0.6,
      trailLen
    );

    ctx.shadowColor = 'rgba(255, 45, 45, 0.9)';
    ctx.shadowBlur = 10;
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgb(247, 31, 31)';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(247, 53, 53, 0.95)';
    ctx.fillRect(
      this.x + this.width * 0.22,
      this.y + this.height * 0.22,
      this.width * 0.56,
      this.height * 0.56
    );

    ctx.globalAlpha = 0.55;
    ctx.fillStyle = 'rgba(255, 79, 79, 0.9)';
    ctx.fillRect(
      this.x + this.width * 0.28,
      this.y + this.height * 0.18,
      this.width * 0.22,
      this.height * 0.18
    );

    ctx.restore();
  }
}

class Boss2 extends BossBase {
  constructor(game) {
    super(game);

    this.width = 190;
    this.height = 190;

    this.x = this.game.width / 2 - this.width / 2;
    this.y = -this.height;

    this.color = '#f546f5';

    this.debugHitbox = false;
    this.maxLives = 30;
    this.lives = this.maxLives;

    this.maxCoreLives = 40;
    this.coreLives = this.maxCoreLives;
    this.coreBroken = false;

    this.hitBoxWidth = 56;
    this.hitBoxHeight = 56;
    this.hitBoxColor = 'rgb(214, 182, 0)';

    this.speedX = 0;
    this.speedY = 1.8;

    this.targetY = 120;
    this.entered = false;

    this.time = 0;
    this.hitFlash = 0;
    this.coreHitFlash = 0;

    this.enemyBullets = [];
    this.shootTimer = 0;
    this.shootInterval = 2500 + Math.random() * 2500;

    this.image =
      document.getElementById('boss2Sprite') ||
      cached?.dom?.boss2Sprite ||
      null;

    this.frames = 6;
    this.rows = 2;
    this.frameX = 0;
    this.frameY = 0;
    this.frameTimer = 0;
    this.frameInterval = 200;

    this.spriteWidth = 0;
    this.spriteHeight = 0;

    if (this.image && (this.image.naturalWidth || this.image.width)) {
      const iw = this.image.naturalWidth || this.image.width;
      const ih = this.image.naturalHeight || this.image.height;
      this.spriteWidth = iw / this.frames;
      this.spriteHeight = ih / this.rows;
    }
  }

  getHitBoxRect() {
    return {
      x: this.x + this.width / 2 - this.hitBoxWidth / 2,
      y: this.y + this.height - this.hitBoxHeight - 45,
      width: this.hitBoxWidth,
      height: this.hitBoxHeight,
    };
  }

  damageCore(amount) {
    if (this.coreBroken) return;

    this.coreLives -= amount;
    this.coreHitFlash = 120;

    if (this.coreLives <= 0) {
      this.coreLives = 0;
      this.coreBroken = true;
      this.frameY = 1;
    }
  }

  damageBoss(amount) {
    if (!this.coreBroken) return;

    this.lives -= amount;
    this.hitFlash = 120;
  }

  update(deltaTime) {
    if (this.game.upgradeCardsShowing) return;

    const dt = deltaTime / 16.67;
    this.time += deltaTime * 0.001;

    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameInterval) {
      this.frameX = (this.frameX + 1) % this.frames;
      this.frameTimer = 0;
    }

    if (!this.entered) {
      this.y += this.speedY * dt;

      if (this.y >= this.targetY) {
        this.y = this.targetY;
        this.entered = true;
        this.speedY = 0;
        this.speedX = 2.4;
      }

      return;
    }

    this.x += this.speedX * dt;

    if (this.x <= 0) {
      this.x = 0;
      this.speedX = Math.abs(this.speedX);
    } else if (this.x + this.width >= this.game.width) {
      this.x = this.game.width - this.width;
      this.speedX = -Math.abs(this.speedX);
    }

    if (this.hitFlash > 0) this.hitFlash -= deltaTime;
    if (this.coreHitFlash > 0) this.coreHitFlash -= deltaTime;

    super.handlePhases();

    this.shootTimer += deltaTime;

    if (!this.game.gameOver && this.shootTimer >= this.shootInterval) {
      this.shootTimer = 0;

      const bx = this.x + this.width / 2 - 21;
      const by = this.y + this.height - 10;

      const speed = 1.8 + Math.random() * 1.6;

      if (typeof Boss2Bullets !== 'undefined') {
        this.enemyBullets.push(new Boss2Bullets(this.game, bx, by, 0, speed));
      }
    }

    this.enemyBullets.forEach((b) => b.update(deltaTime));
    this.enemyBullets = this.enemyBullets.filter((b) => !b.markedForDeletion);
  }

  draw(ctx) {
    ctx.save();

    if (this.hitFlash > 0) {
      ctx.globalAlpha = 0.8;
    }
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

    if (this.debugHitbox) {
      const core = this.getHitBoxRect();

      ctx.save();
      ctx.strokeStyle = 'yellow';
      ctx.lineWidth = 2;
      ctx.strokeRect(core.x, core.y, core.width, core.height);
      ctx.restore();
    }

    this.enemyBullets.forEach((b) => b.draw(ctx));

    this.drawHealthBar(ctx);
    this.drawCoreHealthBar(ctx);
  }

  drawCoreHealthBar(ctx) {
    if (this.coreBroken) return;

    const barW = 180;
    const barH = 10;
    const bx = this.game.width / 2 - barW / 2;
    const by = 44;

    const p = Math.max(0, this.coreLives / this.maxCoreLives);

    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(bx, by, barW, barH);

    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(bx, by, barW * p, barH);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, barW, barH);
    ctx.restore();
  }
}

class Boss2Bullets {
  constructor(game, x, y, vx = 0, vy = 2.2, isSplit = false) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.isSplit = isSplit;
    this.markedForDeletion = false;
    this.damage = 1;
    this.image =
      document.getElementById('boss2BulletSprite') ||
      cached?.dom?.boss2BulletSprite ||
      null;

    this.rotation = 0;
    this.rotationSpeed = 0.35;

    if (!isSplit) {
      this.width = 42;
      this.height = 42;
      this.splitY = game.height * 0.6;
      this.lives = 4;
    } else {
      this.width = 18;
      this.height = 18;
      this.lives = 1;
    }
  }

  update(deltaTime) {
    const dt = deltaTime / 16.67;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.rotationSpeed * dt;

    if (!this.isSplit) {
      const shots = this.game.player.projectiles;

      for (let i = 0; i < shots.length; i++) {
        const p = shots[i];
        if (p.markedForDeletion) continue;

        if (checkCollision(p, this)) {
          p.markedForDeletion = true;
          this.lives -= p.damage ?? 1;

          if (this.lives <= 0) {
            this.markedForDeletion = true;
            return;
          }
        }
      }
    }

    if (!this.isSplit && this.y >= this.splitY) {
      this.split();
      return;
    }

    if (
      this.y > this.game.height + this.height ||
      this.x < -this.width ||
      this.x > this.game.width + this.width
    ) {
      this.markedForDeletion = true;
      return;
    }

    if (
      !this.game.player.invulnerable &&
      checkCollision(this, this.game.player)
    ) {
      this.game.player.lives--;
      this.game.player.invulnerable = true;
      this.game.player.invulnerableTimer = 0;
      this.game.triggerShake(520, 26);
      this.markedForDeletion = true;
    }
  }

  split() {
    if (this.markedForDeletion) return;

    this.markedForDeletion = true;

    const cx = this.x + this.width / 2 - 9;
    const cy = this.y + this.height / 2 - 9;

    const boss = this.game.enemies.find((enemy) => enemy instanceof Boss2);
    if (!boss) return;

    boss.enemyBullets.push(
      new Boss2Bullets(this.game, cx, cy, -4.2, 5.2, true)
    );
    boss.enemyBullets.push(new Boss2Bullets(this.game, cx, cy, 0, 5.8, true));
    boss.enemyBullets.push(new Boss2Bullets(this.game, cx, cy, 4.2, 5.2, true));
  }
  draw(ctx) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    ctx.save();
    ctx.translate(cx, cy);

    if (!this.isSplit) {
      ctx.rotate(this.rotation);

      if (this.image && this.image.complete) {
        ctx.drawImage(
          this.image,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
      } else {
        ctx.fillStyle = '#ffb300';
        ctx.fillRect(
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
      }
    } else {
      const angle = Math.atan2(this.vy, this.vx);
      ctx.rotate(angle + Math.PI / 2);

      ctx.globalCompositeOperation = 'lighter';

      ctx.fillStyle = 'rgba(255,140,40,0.18)';
      ctx.beginPath();
      ctx.arc(0, 0, this.width * 0.9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff5a36';
      ctx.beginPath();
      ctx.moveTo(0, -this.height * 0.7);
      ctx.lineTo(this.width * 0.42, this.height * 0.15);
      ctx.lineTo(0, this.height * 0.45);
      ctx.lineTo(-this.width * 0.42, this.height * 0.15);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.moveTo(0, -this.height * 0.38);
      ctx.lineTo(this.width * 0.16, 0);
      ctx.lineTo(0, this.height * 0.18);
      ctx.lineTo(-this.width * 0.16, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(0, -this.height * 0.18, this.width * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

class Boss3 extends BossBase {
  constructor(game) {
    super(game);

    this.width = 140;
    this.height = 140;

    this.x = game.width / 2 - this.width / 2;
    this.y = -this.height;

    this.baseY = 95;
    this.speedY = 1.6;
    this.speedX = 2.8;

    this.maxLives = 140;
    this.lives = this.maxLives;

    this.time = 0;
    this.hitFlash = 0;
    this.entered = false;

    this.enemyBullets = [];

    this.clones = [];
    this.cloneCount = 0;
    this.hasSplit = false;

    this.splitTimer = 0;
    this.splitDelay = 3500;

    this.swapTimer = 0;
    this.swapInterval = 2200;

    this.shootTimer = 0;
    this.shootInterval = 900;

    this.color = '#58d7ff';

    this.image = document.getElementById('boss3Sprite') || null;

    this.frames = 8;
    this.frameX = 0;
    this.frameTimer = 0;
    this.frameInterval = 100;

    this.spriteWidth = 0;
    this.spriteHeight = 0;

    if (this.image && (this.image.naturalWidth || this.image.width)) {
      const iw = this.image.naturalWidth || this.image.width;
      const ih = this.image.naturalHeight || this.image.height;
      this.spriteWidth = iw / this.frames;
      this.spriteHeight = ih;
    }
  }

  handlePhases() {
    const hpPercent = this.lives / this.maxLives;

    if (hpPercent < 0.65 && this.phase === 1) {
      this.phase = 2;
      this.speedX *= 1.15;

      if (!this.hasSplit) {
        this.createClones(2);
        this.hasSplit = true;
      }
    }

    if (hpPercent < 0.3 && this.phase === 2) {
      this.phase = 3;
      this.speedX *= 1.15;
      this.shootInterval = 700;
      this.swapInterval = 1500;
    }
  }

  createClones(count = 2) {
    this.clones = [];

    for (let i = 0; i < count; i++) {
      this.clones.push({
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,

        mode: i % 3,
        offsetX: i === 0 ? -220 : 220,
        offsetY: i === 0 ? -20 : 20,

        waveSpeed: 1.2 + Math.random() * 1.3,
        waveAmpX: 30 + Math.random() * 45,
        waveAmpY: 20 + Math.random() * 35,
        phase: Math.random() * Math.PI * 2,

        followSmooth: 0.04 + Math.random() * 0.04,
        driftTimer: 0,
        driftInterval: 900 + Math.random() * 900,
        driftX: 0,
        driftY: 0,
      });
    }
  }

  refreshClonePositions(deltaTime = 16.67) {
    if (!this.clones.length) return;

    const dt = deltaTime / 16.67;
    const t = this.time;

    this.clones.forEach((clone) => {
      clone.driftTimer += deltaTime;

      if (clone.driftTimer >= clone.driftInterval) {
        clone.driftTimer = 0;
        clone.driftInterval = 900 + Math.random() * 900;
        clone.driftX = (Math.random() - 0.5) * 120;
        clone.driftY = (Math.random() - 0.5) * 80;
      }

      let targetX = this.x + clone.offsetX;
      let targetY = this.y + clone.offsetY;

      if (clone.mode === 0) {
        targetX += Math.sin(t * clone.waveSpeed + clone.phase) * clone.waveAmpX;
        targetY +=
          Math.cos(t * (clone.waveSpeed * 1.3) + clone.phase) * clone.waveAmpY;
      }

      if (clone.mode === 1) {
        targetX +=
          Math.cos(t * clone.waveSpeed + clone.phase) * (clone.waveAmpX * 0.6);
        targetY +=
          Math.sin(t * (clone.waveSpeed * 2.1) + clone.phase) *
          (clone.waveAmpY * 1.4);
      }

      if (clone.mode === 2) {
        const pull = Math.sin(t * clone.waveSpeed + clone.phase);
        targetX += clone.driftX + pull * 70;
        targetY +=
          clone.driftY +
          Math.cos(t * (clone.waveSpeed * 1.7) + clone.phase) * 30;
      }

      targetX = Math.max(
        10,
        Math.min(this.game.width - clone.width - 10, targetX)
      );
      targetY = Math.max(40, Math.min(this.game.height * 0.45, targetY));

      clone.x += (targetX - clone.x) * clone.followSmooth * dt * 1.8;
      clone.y += (targetY - clone.y) * clone.followSmooth * dt * 1.8;
    });
  }

  swapWithClone() {
    if (!this.clones.length) return;

    const index = Math.floor(Math.random() * this.clones.length);
    const clone = this.clones[index];

    const oldX = this.x;
    const oldY = this.y;

    this.x = clone.x;
    this.y = clone.y;

    clone.x = oldX;
    clone.y = oldY;
  }

  shootFrom(x, y, speed = 6.5, spread = 0, isFake = false) {
    const px = this.game.player.x + this.game.player.width / 2;
    const py = this.game.player.y + this.game.player.height / 2;

    const bx = x + this.width / 2;
    const by = y + this.height * 0.72;

    const dx = px - bx;
    const dy = py - by;

    const len = Math.hypot(dx, dy) || 1;

    let vx = (dx / len) * speed;
    let vy = (dy / len) * speed;

    if (spread !== 0) {
      const angle = Math.atan2(vy, vx) + spread;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    }

    this.enemyBullets.push(
      new Boss3Bullet(this.game, bx - 10, by - 10, vx, vy, isFake)
    );
  }

  update(deltaTime) {
    if (this.game.upgradeCardsShowing) return;

    const dt = deltaTime / 16.67;

    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameInterval) {
      this.frameX = (this.frameX + 1) % this.frames;
      this.frameTimer = 0;
    }

    if (!this.entered) {
      this.y += this.speedY * dt;

      if (this.y >= this.baseY) {
        this.y = this.baseY;
        this.entered = true;
      }

      return;
    }

    this.time += deltaTime * 0.001;
    this.x += this.speedX * dt;

    if (this.x <= 0) {
      this.x = 0;
      this.speedX = Math.abs(this.speedX);
    } else if (this.x + this.width >= this.game.width) {
      this.x = this.game.width - this.width;
      this.speedX = -Math.abs(this.speedX);
    }

    this.y = this.baseY + Math.sin(this.time * 1.8) * 18;

    if (!this.hasSplit) {
      this.splitTimer += deltaTime;
      if (this.splitTimer >= this.splitDelay) {
        this.createClones(2);
        this.hasSplit = true;
      }
    }

    this.handlePhases();
    this.refreshClonePositions(deltaTime);

    if (this.hasSplit) {
      this.swapTimer += deltaTime;
      if (this.swapTimer >= this.swapInterval) {
        this.swapTimer = 0;
        this.swapWithClone();
      }
    }

    this.shootTimer += deltaTime;
    if (!this.game.gameOver && this.shootTimer >= this.shootInterval) {
      this.shootTimer = 0;

      this.shootFrom(this.x, this.y - 20, this.phase === 3 ? 7.1 : 6.5);

      if (this.phase >= 2) {
        this.shootFrom(this.x, this.y, 6.3, -0.18);
        this.shootFrom(this.x, this.y, 6.3, 0.18);
      }

      if (this.hasSplit) {
        this.clones.forEach((clone) => {
          this.shootFrom(clone.x, clone.y, 5.4, 0, true);

          if (this.phase >= 3) {
            this.shootFrom(clone.x, clone.y, 5.1, -0.2, true);
            this.shootFrom(clone.x, clone.y, 5.1, 0.2, true);
          }
        });
      }
    }

    this.enemyBullets.forEach((b) => b.update(deltaTime));
    this.enemyBullets = this.enemyBullets.filter((b) => !b.markedForDeletion);

    this.enemyBullets.forEach((b) => {
      if (b.markedForDeletion) return;
      if (b.isFake) return;

      if (
        !this.game.player.invulnerable &&
        window.checkCollision(this.game.player, b)
      ) {
        this.game.player.lives--;
        this.game.player.invulnerable = true;
        this.game.player.invulnerableTimer = 0;
        this.game.triggerShake(520, 24);
        b.markedForDeletion = true;
        this.hitFlash = 100;
      }
    });

    if (this.hitFlash > 0) this.hitFlash -= deltaTime;
  }

  drawBossBlock(ctx, x, y, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(
      this.image,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      x,
      y,
      this.width,
      this.height
    );

    ctx.restore();
  }

  draw(ctx) {
    this.clones.forEach((clone) => {
      this.drawBossBlock(ctx, clone.x, clone.y, 1);
    });

    let alpha = 1;
    if (this.hitFlash > 0) {
      alpha = 0.78 + Math.sin(performance.now() * 0.04) * 0.22;
    }

    this.drawBossBlock(ctx, this.x, this.y, alpha);

    this.enemyBullets.forEach((b) => b.draw(ctx));
    this.drawHealthBar(ctx);
  }
}

class Boss3Bullet {
  constructor(game, x, y, vx, vy, isFake = false) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.width = 20;
    this.height = 20;
    this.lives = 1;
    this.markedForDeletion = false;
    this.rotation = 0;
    this.isFake = isFake;
  }

  update(deltaTime) {
    const dt = deltaTime / 16.67;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += 0.18 * dt;

    if (
      this.y > this.game.height + this.height ||
      this.x < -this.width ||
      this.x > this.game.width + this.width ||
      this.y < -this.height
    ) {
      this.markedForDeletion = true;
      return;
    }

    if (!this.isFake) {
      const shots = this.game.player.projectiles;
      for (let i = 0; i < shots.length; i++) {
        const p = shots[i];
        if (p.markedForDeletion) continue;

        if (window.checkCollision(p, this)) {
          p.markedForDeletion = true;
          this.lives -= p.damage ?? 1;

          if (this.lives <= 0) {
            this.markedForDeletion = true;
          }

          break;
        }
      }
    }
  }

  draw(ctx) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);
    ctx.globalCompositeOperation = 'lighter';

    ctx.globalAlpha = this.isFake ? 0.3 : 1;

    ctx.fillStyle = 'rgba(90,220,255,0.2)';
    ctx.beginPath();
    ctx.arc(0, 0, this.width, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#68e7ff';
    ctx.beginPath();
    ctx.moveTo(0, -this.height * 0.75);
    ctx.lineTo(this.width * 0.45, 0);
    ctx.lineTo(0, this.height * 0.75);
    ctx.lineTo(-this.width * 0.45, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, this.width * 0.14, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

class Boss4 extends BossBase {
  constructor(game, x = null, y = null, splitLevel = 0) {
    super(game);

    this.splitLevel = splitLevel;
    this.hasSplit = false;
    this.entered = false;

    if (splitLevel === 0) {
      this.width = 140;
      this.height = 180;
      this.maxLives = 80;
      this.speedX = 2.2;
      this.speedY = 1.2;
      this.shootInterval = 1300;
      this.color = '#cc00ff';
      this.scoreValue = 10;
      this.image = document.getElementById('boss4PinkSprite');
    } else if (splitLevel === 1) {
      this.width = 60;
      this.height = 90;
      this.maxLives = 20;
      this.speedX = 2.6;
      this.speedY = 1.4;
      this.shootInterval = 1300;
      this.color = '#45d7ff';
      this.scoreValue = 6;
      this.image = document.getElementById('boss4GreenSprite');
    } else {
      this.width = 35;
      this.height = 45;
      this.maxLives = 8;
      this.speedX = 2.8;
      this.speedY = 1.4;
      this.shootInterval = 1800;
      this.color = '#b884ff';
      this.scoreValue = 3;
      this.image = document.getElementById('boss4PurpleSprite');
    }

    this.lives = this.maxLives;

    this.x = x !== null ? x : this.game.width / 2 - this.width / 2;
    this.y = y !== null ? y : -this.height;

    this.targetY = splitLevel === 0 ? 90 : Math.max(40, y ?? 80);

    this.dirX = Math.random() < 0.5 ? -1 : 1;
    this.shootTimer = 0;
    this.enemyBullets = [];
    this.hitFlash = 0;

    this.frames = 8;
    this.frameX = 0;
    this.frameTimer = 0;
    this.frameInterval = 120;

    this.spriteWidth = 0;
    this.spriteHeight = 0;

    if (this.image && (this.image.naturalWidth || this.image.width)) {
      const iw = this.image.naturalWidth || this.image.width;
      const ih = this.image.naturalHeight || this.image.height;
      this.spriteWidth = iw / this.frames;
      this.spriteHeight = ih;
    }
  }

  update(deltaTime) {
    if (this.game.upgradeCardsShowing) return;

    const dt = deltaTime / 16.67;

    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameInterval) {
      this.frameX = (this.frameX + 1) % this.frames;
      this.frameTimer = 0;
    }

    if (!this.entered) {
      this.y += this.speedY * dt;

      if (this.y >= this.targetY) {
        this.y = this.targetY;
        this.entered = true;
      }
    } else {
      this.x += this.speedX * this.dirX * dt;

      if (this.x <= 0) {
        this.x = 0;
        this.dirX = 1;
      } else if (this.x + this.width >= this.game.width) {
        this.x = this.game.width - this.width;
        this.dirX = -1;
      }

      if (this.splitLevel > 0) {
        this.y += Math.sin(performance.now() * 0.002 + this.x * 0.01) * 0.35;
      }

      this.shootTimer += deltaTime;
      if (!this.game.gameOver && this.shootTimer >= this.shootInterval) {
        this.shootTimer = 0;
        this.shoot();
      }
    }

    this.enemyBullets.forEach((b) => b.update(deltaTime));
    this.enemyBullets = this.enemyBullets.filter((b) => !b.markedForDeletion);

    this.enemyBullets.forEach((b) => {
      if (b.markedForDeletion) return;

      if (
        !this.game.player.invulnerable &&
        window.checkCollision(this.game.player, b)
      ) {
        this.game.player.lives--;
        this.game.player.invulnerable = true;
        this.game.player.invulnerableTimer = 0;
        this.game.triggerShake(520, 24);
        b.markedForDeletion = true;
      }
    });

    if (this.hitFlash > 0) this.hitFlash -= deltaTime;
  }

  shoot() {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height;

    const px = this.game.player.x + this.game.player.width / 2;
    const py = this.game.player.y + this.game.player.height / 2;

    const dx = px - cx;
    const dy = py - cy;
    const len = Math.hypot(dx, dy) || 1;
    const angle = Math.atan2(dy, dx);

    if (this.splitLevel === 0) {
      const speed = 4.8;

      this.enemyBullets.push(
        new Boss4Bullet(
          this.game,
          cx - 8,
          cy,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          16,
          '#ff4fd8',
          this.splitLevel
        )
      );
    } else if (this.splitLevel === 1) {
      const speed = 4.6;
      const spread = 0.12;

      this.enemyBullets.push(
        new Boss4Bullet(
          this.game,
          cx - 6,
          cy,
          Math.cos(angle - spread) * speed,
          Math.sin(angle - spread) * speed,
          11,
          '#62ff6b',
          this.splitLevel
        )
      );

      this.enemyBullets.push(
        new Boss4Bullet(
          this.game,
          cx - 6,
          cy,
          Math.cos(angle + spread) * speed,
          Math.sin(angle + spread) * speed,
          11,
          '#62ff6b',
          this.splitLevel
        )
      );
    } else {
      const speed = 4.2;
      const spread = 0.22;

      this.enemyBullets.push(
        new Boss4Bullet(
          this.game,
          cx - 4,
          cy,
          Math.cos(angle - spread) * speed,
          Math.sin(angle - spread) * speed,
          7,
          '#b884ff',
          this.splitLevel
        )
      );

      this.enemyBullets.push(
        new Boss4Bullet(
          this.game,
          cx - 4,
          cy,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          7,
          '#b884ff',
          this.splitLevel
        )
      );

      this.enemyBullets.push(
        new Boss4Bullet(
          this.game,
          cx - 4,
          cy,
          Math.cos(angle + spread) * speed,
          Math.sin(angle + spread) * speed,
          7,
          '#b884ff',
          this.splitLevel
        )
      );
    }
  }

  split() {
    if (this.hasSplit) return;
    if (this.splitLevel >= 2) return;

    this.hasSplit = true;

    const nextLevel = this.splitLevel + 1;
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    const childA = new Boss4(this.game, centerX - 35, centerY - 10, nextLevel);
    const childB = new Boss4(this.game, centerX + 5, centerY - 10, nextLevel);

    childA.entered = true;
    childB.entered = true;

    childA.dirX = -1;
    childB.dirX = 1;

    this.game.enemies.push(childA, childB);
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
    this.enemyBullets.forEach((b) => b.draw(ctx));
  }

  drawTopHealthBar(ctx, index = 0, total = 1) {
    const barW = this.splitLevel === 0 ? 220 : this.splitLevel === 1 ? 120 : 70;
    const barH = this.splitLevel === 0 ? 14 : this.splitLevel === 1 ? 10 : 7;

    const gap = 10;
    const totalWidth = total * barW + (total - 1) * gap;
    const startX = this.game.width / 2 - totalWidth / 2;
    const x = startX + index * (barW + gap);
    const y = 22;

    const p = Math.max(0, this.lives / this.maxLives);

    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x, y, barW, barH);

    ctx.fillStyle = this.color;
    ctx.fillRect(x, y, barW * p, barH);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barW, barH);
  }
}

class Boss4Bullet {
  constructor(
    game,
    x,
    y,
    vx,
    vy,
    size = 14,
    color = '#62ff6b',
    splitLevel = 0
  ) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.width = size;
    this.height = size;
    this.color = color;
    this.splitLevel = splitLevel;
    this.markedForDeletion = false;
    this.rotation = 0;
  }

  update(deltaTime) {
    const dt = deltaTime / 16.67;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += 0.12 * dt;

    const shots = this.game.player.projectiles;
    for (let i = 0; i < shots.length; i++) {
      const p = shots[i];
      if (p.markedForDeletion) continue;

      if (window.checkCollision(p, this)) {
        p.markedForDeletion = true;
        this.markedForDeletion = true;
        break;
      }
    }

    if (
      this.y > this.game.height + this.height ||
      this.x < -this.width ||
      this.x > this.game.width + this.width ||
      this.y < -this.height
    ) {
      this.markedForDeletion = true;
    }
  }

  getPalette() {
    if (this.splitLevel === 0) {
      return {
        main: '#ff4fd8',
        dark: '#b1007f',
        light: '#ffd0f5',
        glow: 'rgba(255, 79, 216, 0.28)',
      };
    } else if (this.splitLevel === 1) {
      return {
        main: '#62ff6b',
        dark: '#159a2d',
        light: '#d8ffe0',
        glow: 'rgba(98, 255, 107, 0.26)',
      };
    } else {
      return {
        main: '#b884ff',
        dark: '#6c31c9',
        light: '#efe2ff',
        glow: 'rgba(184, 132, 255, 0.28)',
      };
    }
  }

  draw(ctx) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const angle = Math.atan2(this.vy, this.vx);
    const palette = this.getPalette();

    const t = performance.now() * 0.01;
    const pulse = 0.92 + Math.sin(t) * 0.08;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    ctx.globalCompositeOperation = 'lighter';

    ctx.fillStyle = palette.glow;
    ctx.beginPath();
    ctx.ellipse(
      0,
      0,
      this.width * 1.6 * pulse,
      this.height * 1.1 * pulse,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    const tail = ctx.createLinearGradient(
      -this.width * 2.8,
      0,
      this.width * 0.8,
      0
    );
    tail.addColorStop(0, 'rgba(255,255,255,0)');
    tail.addColorStop(0.35, palette.glow);
    tail.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = tail;
    ctx.fillRect(
      -this.width * 2.8,
      -this.height * 0.22,
      this.width * 2.8,
      this.height * 0.44
    );

    ctx.rotate(this.rotation);

    ctx.fillStyle = palette.dark;
    ctx.beginPath();
    ctx.moveTo(this.width * 0.9, 0);
    ctx.lineTo(this.width * 0.15, -this.height * 0.48);
    ctx.lineTo(-this.width * 0.55, -this.height * 0.2);
    ctx.lineTo(-this.width * 0.35, 0);
    ctx.lineTo(-this.width * 0.55, this.height * 0.2);
    ctx.lineTo(this.width * 0.15, this.height * 0.48);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = palette.main;
    ctx.beginPath();
    ctx.moveTo(this.width * 0.68, 0);
    ctx.lineTo(this.width * 0.08, -this.height * 0.34);
    ctx.lineTo(-this.width * 0.26, 0);
    ctx.lineTo(this.width * 0.08, this.height * 0.34);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = palette.light;
    ctx.beginPath();
    ctx.moveTo(this.width * 0.24, 0);
    ctx.lineTo(-this.width * 0.02, -this.height * 0.12);
    ctx.lineTo(-this.width * 0.1, 0);
    ctx.lineTo(-this.width * 0.02, this.height * 0.12);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

class Boss5 extends BossBase {
  constructor(game) {
    super(game);

    this.width = 170;
    this.height = 190;

    this.x = this.game.width / 2 - this.width / 2;
    this.y = -this.height;

    this.baseY = 90;
    this.entered = false;

    this.maxLives = 170;
    this.lives = this.maxLives;

    this.phase = 1;
    this.hitBySuper = false;
    this.markedForDeletion = false;

    this.speedX = 2.2;
    this.dirX = 1;

    this.enemyBullets = [];
    this.shootTimer = 0;
    this.shootInterval = 1400;

    this.specialMoveTimer = 0;
    this.specialMoveInterval = 3200;

    this.state = 'normal';
    this.moveTargetX = this.x;
    this.moveTargetY = this.baseY;
    this.savedX = this.x;
    this.savedY = this.baseY;

    this.holdTimer = 0;
    this.holdDuration = 650;

    this.moveSmooth = 0.12;
    this.hitFlash = 0;

    this.image = document.getElementById('boss5Sprite') || null;

    this.frames = 8;
    this.frameX = 0;
    this.frameY = 0;
    this.frameTimer = 0;
    this.frameInterval = 120;

    this.spriteWidth = 0;
    this.spriteHeight = 0;

    if (this.image && (this.image.naturalWidth || this.image.width)) {
      const iw = this.image.naturalWidth || this.image.width;
      const ih = this.image.naturalHeight || this.image.height;
      this.spriteWidth = iw / this.frames;
      this.spriteHeight = ih;
    }
  }

  handlePhases() {
    const hpPercent = this.lives / this.maxLives;

    if (hpPercent < 0.65 && this.phase === 1) {
      this.phase = 2;
      this.shootInterval = 1050;
      this.specialMoveInterval = 2700;
      this.moveSmooth = 0.135;
    }

    if (hpPercent < 0.3 && this.phase === 2) {
      this.phase = 3;
      this.shootInterval = 820;
      this.specialMoveInterval = 2200;
      this.moveSmooth = 0.15;
      this.holdDuration = 850;
    }
  }

  update(deltaTime) {
    if (this.game.upgradeCardsShowing) return;

    const dt = deltaTime / 16.67;

    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameInterval) {
      this.frameX = (this.frameX + 1) % this.frames;
      this.frameTimer = 0;
    }

    if (!this.entered) {
      this.y += 1.4 * dt;
      if (this.y >= this.baseY) {
        this.y = this.baseY;
        this.entered = true;
        this.moveTargetY = this.baseY;
        this.savedY = this.baseY;
      }
      return;
    }

    this.handlePhases();

    if (this.hitFlash > 0) this.hitFlash -= deltaTime;

    this.shootTimer += deltaTime;
    this.specialMoveTimer += deltaTime;

    if (this.state === 'normal') {
      this.x += this.speedX * this.dirX * dt;

      if (this.x <= 0) {
        this.x = 0;
        this.dirX = 1;
      } else if (this.x + this.width >= this.game.width) {
        this.x = this.game.width - this.width;
        this.dirX = -1;
      }

      if (!this.game.gameOver && this.shootTimer >= this.shootInterval) {
        this.shootTimer = 0;
        this.shoot();
      }

      if (this.specialMoveTimer >= this.specialMoveInterval) {
        this.specialMoveTimer = 0;
        this.savedX = this.x;
        this.savedY = this.y;
        this.pickAttackPositionNearPlayer();
        this.state = 'movingToPlayerZone';
      }
    } else if (this.state === 'movingToPlayerZone') {
      this.x += (this.moveTargetX - this.x) * this.moveSmooth;
      this.y += (this.moveTargetY - this.y) * this.moveSmooth;

      if (!this.game.gameOver && this.shootTimer >= this.shootInterval * 0.9) {
        this.shootTimer = 0;
        this.shoot();
      }

      if (
        Math.abs(this.x - this.moveTargetX) < 6 &&
        Math.abs(this.y - this.moveTargetY) < 6
      ) {
        this.holdTimer = 0;
        this.state = 'holdingNearPlayer';
      }
    } else if (this.state === 'holdingNearPlayer') {
      this.holdTimer += deltaTime;

      if (!this.game.gameOver && this.shootTimer >= this.shootInterval * 0.65) {
        this.shootTimer = 0;
        this.shoot();
      }

      if (this.holdTimer >= this.holdDuration) {
        this.moveTargetX = this.savedX;
        this.moveTargetY = this.savedY;
        this.state = 'returning';
      }
    } else if (this.state === 'returning') {
      this.x += (this.moveTargetX - this.x) * this.moveSmooth;
      this.y += (this.moveTargetY - this.y) * this.moveSmooth;

      if (!this.game.gameOver && this.shootTimer >= this.shootInterval) {
        this.shootTimer = 0;
        this.shoot();
      }

      if (
        Math.abs(this.x - this.moveTargetX) < 6 &&
        Math.abs(this.y - this.moveTargetY) < 6
      ) {
        this.x = this.moveTargetX;
        this.y = this.moveTargetY;
        this.state = 'normal';
      }
    }

    this.enemyBullets.forEach((b) => b.update(deltaTime));
    this.enemyBullets = this.enemyBullets.filter((b) => !b.markedForDeletion);

    this.enemyBullets.forEach((b) => {
      if (b.markedForDeletion) return;

      if (
        !this.game.player.invulnerable &&
        window.checkCollision(this.game.player, b)
      ) {
        this.game.player.lives--;
        this.game.player.invulnerable = true;
        this.game.player.invulnerableTimer = 0;
        this.game.triggerShake(520, 24);
        b.markedForDeletion = true;
      }
    });
  }

  pickAttackPositionNearPlayer() {
    const player = this.game.player;
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;

    const minDist = 140;
    const maxDist = 240;

    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = minDist + Math.random() * (maxDist - minDist);

      let nx = playerCenterX + Math.cos(angle) * dist - this.width / 2;
      let ny = playerCenterY + Math.sin(angle) * dist - this.height / 2;

      nx = Math.max(10, Math.min(this.game.width - this.width - 10, nx));
      ny = Math.max(45, Math.min(this.game.height * 0.62, ny));

      const dx = nx + this.width / 2 - playerCenterX;
      const dy = ny + this.height / 2 - playerCenterY;
      const realDist = Math.hypot(dx, dy);

      if (realDist >= minDist - 10 && realDist <= maxDist + 15) {
        this.moveTargetX = nx;
        this.moveTargetY = ny;
        return;
      }
    }

    this.moveTargetX = Math.max(
      10,
      Math.min(
        this.game.width - this.width - 10,
        playerCenterX - this.width / 2
      )
    );
    this.moveTargetY = Math.max(
      45,
      Math.min(this.game.height * 0.55, playerCenterY - 180)
    );
  }

  shoot() {
    const px = this.game.player.x + this.game.player.width / 2;
    const py = this.game.player.y + this.game.player.height / 2;

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height * 0.78;

    const dx = px - cx;
    const dy = py - cy;
    const len = Math.hypot(dx, dy) || 1;
    const angle = Math.atan2(dy, dx);

    const speed = 5.4;

    this.enemyBullets.push(
      new Boss5Bullet(
        this.game,
        cx - 10,
        cy - 10,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      )
    );

    if (this.phase >= 2) {
      const spread = 0.18;

      this.enemyBullets.push(
        new Boss5Bullet(
          this.game,
          cx - 10,
          cy - 10,
          Math.cos(angle - spread) * speed,
          Math.sin(angle - spread) * speed
        )
      );

      this.enemyBullets.push(
        new Boss5Bullet(
          this.game,
          cx - 10,
          cy - 10,
          Math.cos(angle + spread) * speed,
          Math.sin(angle + spread) * speed
        )
      );
    }

    if (this.phase >= 3) {
      const sideSpread = 0.36;

      this.enemyBullets.push(
        new Boss5Bullet(
          this.game,
          cx - 10,
          cy - 10,
          Math.cos(angle - sideSpread) * (speed - 0.3),
          Math.sin(angle - sideSpread) * (speed - 0.3)
        )
      );

      this.enemyBullets.push(
        new Boss5Bullet(
          this.game,
          cx - 10,
          cy - 10,
          Math.cos(angle + sideSpread) * (speed - 0.3),
          Math.sin(angle + sideSpread) * (speed - 0.3)
        )
      );
    }
  }

  draw(ctx) {
    ctx.save();

    if (this.hitFlash > 0) {
      ctx.globalAlpha = 0.8 + Math.sin(performance.now() * 0.05) * 0.2;
    }

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

    this.enemyBullets.forEach((b) => b.draw(ctx));
    this.drawHealthBar(ctx);
  }
}

class Boss5Bullet {
  constructor(game, x, y, vx, vy) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.width = 20;
    this.height = 20;
    this.markedForDeletion = false;
    this.rotation = 0;
  }

  update(deltaTime) {
    const dt = deltaTime / 16.67;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += 0.18 * dt;

    const shots = this.game.player.projectiles;
    for (let i = 0; i < shots.length; i++) {
      const p = shots[i];
      if (p.markedForDeletion) continue;

      if (window.checkCollision(p, this)) {
        p.markedForDeletion = true;
        this.markedForDeletion = true;
        break;
      }
    }

    if (
      this.y > this.game.height + this.height ||
      this.x < -this.width ||
      this.x > this.game.width + this.width ||
      this.y < -this.height
    ) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    const t = performance.now() * 0.01;
    const pulse = 0.9 + Math.sin(t) * 0.1;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);
    ctx.globalCompositeOperation = 'lighter';

    ctx.globalAlpha = 0.25 * pulse;
    ctx.fillStyle = 'rgba(255,40,40,1)';
    ctx.beginPath();
    ctx.arc(0, 0, this.width * 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ff1f1f';
    ctx.beginPath();
    ctx.moveTo(0, -this.height * 0.8);
    ctx.lineTo(this.width * 0.5, 0);
    ctx.lineTo(0, this.height * 0.8);
    ctx.lineTo(-this.width * 0.5, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ff6a6a';
    ctx.beginPath();
    ctx.moveTo(0, -this.height * 0.45);
    ctx.lineTo(this.width * 0.25, 0);
    ctx.lineTo(0, this.height * 0.45);
    ctx.lineTo(-this.width * 0.25, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, this.width * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

class Boss6 extends BossBase {
  constructor(game) {
    super(game);

    this.width = 180;
    this.height = 200;

    this.x = this.game.width / 2 - this.width / 2;
    this.y = -this.height;

    this.baseY = 90;
    this.entered = false;

    this.maxLives = 220;
    this.lives = this.maxLives;

    this.speedX = 2.3;
    this.speedY = 1.4;
    this.dirX = 1;

    this.enemyBullets = [];
    this.shootTimer = 0;
    this.shootInterval = 1100;

    this.hitFlash = 0;

    this.shieldRadius = 115;
    this.shieldWidth = 140;
    this.shieldHeight = 22;
    this.shieldAngle = 0;
    this.baseShieldSpeed = 0.025;

    this.frames = 8;
    this.frameX = 0;
    this.frameY = 0;
    this.frameTimer = 0;
    this.frameInterval = 110;

    this.spriteWidth = 0;
    this.spriteHeight = 0;

    this.image =
      document.getElementById('boss6Sprite') ||
      cached?.dom?.boss6Sprite ||
      null;

    this.frames = 7;
    this.frameX = 0;
    this.frameTimer = 0;
    this.frameInterval = 185;

    this.spriteWidth = 0;
    this.spriteHeight = 0;

    if (this.image && (this.image.naturalWidth || this.image.width)) {
      const iw = this.image.naturalWidth || this.image.width;
      const ih = this.image.naturalHeight || this.image.height;
      this.spriteWidth = iw / this.frames;
      this.spriteHeight = ih;
    }
  }

  getCenter() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };
  }

  getShieldPositions() {
    const c = this.getCenter();

    return [
      {
        x: c.x + Math.cos(this.shieldAngle) * this.shieldRadius,
        y: c.y + Math.sin(this.shieldAngle) * this.shieldRadius,
        width: this.shieldWidth,
        height: this.shieldHeight,
        angle: this.shieldAngle + Math.PI / 2,
      },
      {
        x: c.x + Math.cos(this.shieldAngle + Math.PI) * this.shieldRadius,
        y: c.y + Math.sin(this.shieldAngle + Math.PI) * this.shieldRadius,
        width: this.shieldWidth,
        height: this.shieldHeight,
        angle: this.shieldAngle + Math.PI + Math.PI / 2,
      },
    ];
  }

  getShieldSpeed() {
    const lostHp = 1 - this.lives / this.maxLives;
    return this.baseShieldSpeed + lostHp * 0.08;
  }

  handlePlayerShots() {
    const shots = this.game.player.projectiles;
    const shields = this.getShieldPositions();

    for (let i = 0; i < shots.length; i++) {
      const p = shots[i];
      if (p.markedForDeletion) continue;

      let blocked = false;

      for (let j = 0; j < shields.length; j++) {
        const shield = shields[j];

        const dx = p.x + p.width / 2 - shield.x;
        const dy = p.y + p.height / 2 - shield.y;

        const cos = Math.cos(-shield.angle);
        const sin = Math.sin(-shield.angle);

        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        if (
          Math.abs(localX) < shield.width / 2 + p.width / 2 &&
          Math.abs(localY) < shield.height / 2 + p.height / 2
        ) {
          p.markedForDeletion = true;
          blocked = true;
          break;
        }
      }

      if (blocked) continue;

      if (window.checkCollision(p, this)) {
        p.markedForDeletion = true;
        this.lives -= p.damage ?? 1;
        this.hitFlash = 120;

        if (this.lives <= 0) {
          this.lives = 0;
          this.markedForDeletion = true;
        }
      }
    }
  }

  shoot() {
    const px = this.game.player.x + this.game.player.width / 2;
    const py = this.game.player.y + this.game.player.height / 2;

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height * 0.8;

    const dx = px - cx;
    const dy = py - cy;
    const len = Math.hypot(dx, dy) || 1;
    const angle = Math.atan2(dy, dx);
    const speed = 5.3;

    this.enemyBullets.push(
      new Boss6Bullet(
        this.game,
        cx - 10,
        cy - 10,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      )
    );

    if (this.lives < this.maxLives * 0.6) {
      const spread = 0.18;

      this.enemyBullets.push(
        new Boss6Bullet(
          this.game,
          cx - 10,
          cy - 10,
          Math.cos(angle - spread) * speed,
          Math.sin(angle - spread) * speed
        )
      );

      this.enemyBullets.push(
        new Boss6Bullet(
          this.game,
          cx - 10,
          cy - 10,
          Math.cos(angle + spread) * speed,
          Math.sin(angle + spread) * speed
        )
      );
    }
  }

  update(deltaTime) {
    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameInterval) {
      this.frameX = (this.frameX + 1) % this.frames;
      this.frameTimer = 0;
    }

    if (this.game.upgradeCardsShowing) return;

    const dt = deltaTime / 16.67;

    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameInterval) {
      this.frameX = (this.frameX + 1) % this.frames;
      this.frameTimer = 0;
    }

    if (!this.entered) {
      this.y += this.speedY * dt;
      if (this.y >= this.baseY) {
        this.y = this.baseY;
        this.entered = true;
      }
    } else {
      this.x += this.speedX * this.dirX * dt;

      if (this.x <= 0) {
        this.x = 0;
        this.dirX = 1;
      } else if (this.x + this.width >= this.game.width) {
        this.x = this.game.width - this.width;
        this.dirX = -1;
      }

      this.shieldAngle += this.getShieldSpeed() * dt;

      this.shootTimer += deltaTime;
      if (!this.game.gameOver && this.shootTimer >= this.shootInterval) {
        this.shootTimer = 0;
        this.shoot();
      }
    }

    this.handlePlayerShots();

    this.enemyBullets.forEach((b) => b.update(deltaTime));
    this.enemyBullets = this.enemyBullets.filter((b) => !b.markedForDeletion);

    this.enemyBullets.forEach((b) => {
      if (b.markedForDeletion) return;

      if (
        !this.game.player.invulnerable &&
        window.checkCollision(this.game.player, b)
      ) {
        this.game.player.lives--;
        this.game.player.invulnerable = true;
        this.game.player.invulnerableTimer = 0;
        this.game.triggerShake(520, 24);
        b.markedForDeletion = true;
      }
    });

    if (this.hitFlash > 0) this.hitFlash -= deltaTime;
  }

  drawShield(ctx, shield) {
    const t = performance.now() * 0.008;
    const pulse = 0.9 + Math.sin(t) * 0.1;

    ctx.save();
    ctx.translate(shield.x, shield.y);
    ctx.rotate(shield.angle);
    ctx.globalCompositeOperation = 'lighter';

    const grad = ctx.createLinearGradient(
      0,
      -shield.height / 2,
      0,
      shield.height / 2
    );
    grad.addColorStop(0, 'rgba(180,240,255,0.9)');
    grad.addColorStop(0.2, 'rgba(90,220,255,1)');
    grad.addColorStop(0.5, 'rgba(0,140,255,0.9)');
    grad.addColorStop(0.8, 'rgba(90,220,255,1)');
    grad.addColorStop(1, 'rgba(180,240,255,0.9)');

    ctx.shadowColor = 'rgba(80,220,255,0.9)';
    ctx.shadowBlur = 22 * pulse;

    ctx.fillStyle = grad;
    ctx.fillRect(
      -shield.width / 2,
      -shield.height / 2,
      shield.width,
      shield.height
    );

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(
      -shield.width * 0.2,
      -shield.height / 2,
      shield.width * 0.4,
      shield.height
    );

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(-shield.width / 2, -shield.height * 0.3, shield.width, 4);
    ctx.fillRect(-shield.width / 2, shield.height * 0.25, shield.width, 4);

    ctx.beginPath();
    ctx.moveTo(0, -shield.height * 0.6);
    ctx.lineTo(shield.width * 0.6, -shield.height * 0.4);
    ctx.lineTo(-shield.width * 0.6, -shield.height * 0.4);
    ctx.closePath();
    ctx.fillStyle = 'rgba(120,240,255,0.8)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, shield.height * 0.6);
    ctx.lineTo(shield.width * 0.6, shield.height * 0.4);
    ctx.lineTo(-shield.width * 0.6, shield.height * 0.4);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.restore();
  }

  draw(ctx) {
    ctx.save();

    if (this.hitFlash > 0) {
      ctx.globalAlpha = 0.8 + Math.sin(performance.now() * 0.05) * 0.2;
    }

    ctx.drawImage(
      this.image,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );

    ctx.restore();

    const shields = this.getShieldPositions();
    shields.forEach((shield) => this.drawShield(ctx, shield));

    this.enemyBullets.forEach((b) => b.draw(ctx));
    this.drawHealthBar(ctx);
  }
}

class Boss6Bullet {
  constructor(game, x, y, vx, vy) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.width = 20;
    this.height = 20;
    this.markedForDeletion = false;
    this.rotation = 0;
  }

  update(deltaTime) {
    const dt = deltaTime / 16.67;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += 0.18 * dt;

    const shots = this.game.player.projectiles;
    for (let i = 0; i < shots.length; i++) {
      const p = shots[i];
      if (p.markedForDeletion) continue;

      if (window.checkCollision(p, this)) {
        p.markedForDeletion = true;
        this.markedForDeletion = true;
        break;
      }
    }

    if (
      this.y > this.game.height + this.height ||
      this.x < -this.width ||
      this.x > this.game.width + this.width ||
      this.y < -this.height
    ) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    const angle = Math.atan2(this.vy, this.vx);
    const t = performance.now() * 0.012;
    const pulse = 0.92 + Math.sin(t) * 0.08;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle + Math.PI / 2);
    ctx.globalCompositeOperation = 'lighter';

    ctx.fillStyle = 'rgba(80,180,255,0.16)';
    ctx.beginPath();
    ctx.ellipse(
      0,
      0,
      this.width * 1.8 * pulse,
      this.height * 1.3 * pulse,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    const tail = ctx.createLinearGradient(
      0,
      this.height * 1.2,
      0,
      -this.height * 0.9
    );
    tail.addColorStop(0, 'rgba(0,120,255,0)');
    tail.addColorStop(0.35, 'rgba(80,180,255,0.35)');
    tail.addColorStop(1, 'rgba(255,255,255,0.15)');
    ctx.fillStyle = tail;
    ctx.beginPath();
    ctx.moveTo(-this.width * 0.22, this.height * 0.9);
    ctx.lineTo(this.width * 0.22, this.height * 0.9);
    ctx.lineTo(this.width * 0.08, -this.height * 0.4);
    ctx.lineTo(-this.width * 0.08, -this.height * 0.4);
    ctx.closePath();
    ctx.fill();

    ctx.shadowColor = 'rgba(90,220,255,0.95)';
    ctx.shadowBlur = 18 * pulse;

    const body = ctx.createLinearGradient(
      0,
      -this.height * 0.9,
      0,
      this.height * 0.85
    );
    body.addColorStop(0, '#e8fbff');
    body.addColorStop(0.22, '#8fe7ff');
    body.addColorStop(0.55, '#3aa7ff');
    body.addColorStop(1, '#123dff');

    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(0, -this.height * 0.95);
    ctx.lineTo(this.width * 0.42, -this.height * 0.2);
    ctx.lineTo(this.width * 0.26, this.height * 0.75);
    ctx.lineTo(0, this.height * 0.95);
    ctx.lineTo(-this.width * 0.26, this.height * 0.75);
    ctx.lineTo(-this.width * 0.42, -this.height * 0.2);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.moveTo(0, -this.height * 0.62);
    ctx.lineTo(this.width * 0.14, 0);
    ctx.lineTo(0, this.height * 0.42);
    ctx.lineTo(-this.width * 0.14, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(170,240,255,0.75)';
    ctx.beginPath();
    ctx.moveTo(0, -this.height * 0.82);
    ctx.lineTo(this.width * 0.12, -this.height * 0.55);
    ctx.lineTo(-this.width * 0.12, -this.height * 0.55);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

class Boss7 extends BossBase {
  constructor(game) {
    super(game);

    this.width = 180;
    this.height = 210;

    this.x = this.game.width / 2 - this.width / 2;
    this.y = -this.height;

    this.baseY = 90;
    this.entered = false;

    this.maxLives = 420;
    this.lives = this.maxLives;

    this.speedX = 3.2;
    this.speedY = 1.5;
    this.dirX = 1;

    this.phase = 1;

    this.hitFlash = 0;

    this.attackCooldown = 2000;
    this.attackTimer = 0;

    this.state = 'idle';
    this.stateTimer = 0;

    this.shotsToFire = 2;
    this.shotsFired = 0;
    this.shotDelay = 380;
    this.chargeDuration = 760;
    this.laserDuration = 240;
    this.currentLaserWidth = 20;

    this.lockedTarget = null;
    this.activeLasers = [];

    this.hoverTime = 0;
    this.hoverAmp = 18;

    this.image =
      document.getElementById('boss7Sprite') ||
      cached?.dom?.boss7Sprite ||
      null;

    this.frames = 8;
    this.frameX = 0;
    this.frameTimer = 0;
    this.frameInterval = 100;

    this.spriteWidth = 0;
    this.spriteHeight = 0;

    if (this.image && (this.image.naturalWidth || this.image.width)) {
      const iw = this.image.naturalWidth || this.image.width;
      const ih = this.image.naturalHeight || this.image.height;
      this.spriteWidth = iw / this.frames;
      this.spriteHeight = ih;
    }
  }

  handlePhases() {
    const hpPercent = this.lives / this.maxLives;

    if (hpPercent < 0.75 && this.phase === 1) {
      this.phase = 2;
      this.speedX = 4;
      this.attackCooldown = 1450;
      this.chargeDuration = 620;
      this.laserDuration = 270;
      this.hoverAmp = 24;
    }

    if (hpPercent < 0.4 && this.phase === 2) {
      this.phase = 3;
      this.speedX = 4.9;
      this.attackCooldown = 950;
      this.chargeDuration = 500;
      this.laserDuration = 320;
      this.hoverAmp = 30;
    }
  }

  getPhaseShotCount() {
    if (this.phase === 1) return 2;
    if (this.phase === 2) return 2;
    return 3;
  }

  getPhaseLaserWidth() {
    if (this.phase === 1) return 24;
    if (this.phase === 2) return 40;
    return 60;
  }

  lockTarget() {
    const player = this.game.player;

    this.lockedTarget = {
      x: player.x + player.width / 2,
      y: player.y + player.height / 2,
    };
  }

  getMuzzle() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height * 0.6,
    };
  }

  getAttackInterval() {
    const hpRatio = this.lives / this.maxLives;
    const slow = 1900;
    const fast = 500;

    return fast + (slow - fast) * hpRatio;
  }

  getShotDelay() {
    const hpRatio = this.lives / this.maxLives;

    const slow = 420;
    const fast = 180;

    return fast + (slow - fast) * hpRatio;
  }

  fireLaser() {
    const muzzle = this.getMuzzle();
    if (!this.lockedTarget) this.lockTarget();

    this.game.triggerShake(220, 14);

    if (this.game.spawnSparks) {
      this.game.spawnSparks(muzzle.x, muzzle.y, 18, 8);
    }

    const targets = [{ x: this.lockedTarget.x, y: this.lockedTarget.y }];

    if (this.phase >= 2) {
      targets.push(
        { x: this.lockedTarget.x - 90, y: this.lockedTarget.y },
        { x: this.lockedTarget.x + 90, y: this.lockedTarget.y }
      );
    }

    if (this.phase >= 3) {
      targets.push(
        { x: this.lockedTarget.x - 170, y: this.lockedTarget.y },
        { x: this.lockedTarget.x + 170, y: this.lockedTarget.y }
      );
    }

    targets.forEach((target) => {
      this.activeLasers.push(
        new Boss7Laser(
          this.game,
          muzzle.x,
          muzzle.y,
          target.x,
          target.y,
          this.currentLaserWidth,
          this.laserDuration
        )
      );
    });
  }

  startAttackSequence() {
    this.shotsToFire = this.getPhaseShotCount();
    this.currentLaserWidth = this.getPhaseLaserWidth();
    this.shotDelay = this.getShotDelay();
    this.shotsFired = 0;
    this.lockTarget();
    this.state = 'charging';
    this.stateTimer = 0;
  }

  updateAttackState(deltaTime) {
    if (this.state === 'idle') {
      this.attackTimer += deltaTime;

      const currentInterval = this.getAttackInterval();

      if (this.attackTimer >= currentInterval) {
        this.attackTimer = 0;
        this.startAttackSequence();
      }
      return;
    }

    this.stateTimer += deltaTime;

    if (this.state === 'charging') {
      if (this.stateTimer >= this.chargeDuration) {
        this.fireLaser();
        this.shotsFired++;
        this.state = 'betweenShots';
        this.stateTimer = 0;
      }
      return;
    }

    if (this.state === 'betweenShots') {
      if (this.shotsFired >= this.shotsToFire) {
        this.state = 'idle';
        this.stateTimer = 0;
        return;
      }

      if (this.stateTimer >= this.shotDelay) {
        this.lockTarget();
        this.state = 'charging';
        this.stateTimer = 0;
      }
    }
  }

  update(deltaTime) {
    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameInterval) {
      this.frameX = (this.frameX + 1) % this.frames;
      this.frameTimer = 0;
    }
    if (this.game.upgradeCardsShowing) return;

    const dt = deltaTime / 16.67;

    if (!this.entered) {
      this.y += this.speedY * dt;
      if (this.y >= this.baseY) {
        this.y = this.baseY;
        this.entered = true;
      }
      return;
    }

    this.handlePhases();

    this.hoverTime += deltaTime * 0.0018;
    this.x += this.speedX * this.dirX * dt;
    this.y = this.baseY + Math.sin(this.hoverTime * 2.2) * this.hoverAmp;

    if (this.x <= 0) {
      this.x = 0;
      this.dirX = 1;
    } else if (this.x + this.width >= this.game.width) {
      this.x = this.game.width - this.width;
      this.dirX = -1;
    }

    this.updateAttackState(deltaTime);

    this.activeLasers.forEach((laser) => laser.update(deltaTime));
    this.activeLasers = this.activeLasers.filter(
      (laser) => !laser.markedForDeletion
    );

    if (this.hitFlash > 0) this.hitFlash -= deltaTime;
  }

  drawChargeLine(ctx) {
    if (this.state !== 'charging' || !this.lockedTarget) return;

    const muzzle = this.getMuzzle();
    const progress = Math.min(1, this.stateTimer / this.chargeDuration);
    const pulse = 0.9 + Math.sin(performance.now() * 0.05) * 0.12;

    const dx = this.lockedTarget.x - muzzle.x;
    const dy = this.lockedTarget.y - muzzle.y;
    const len = Math.hypot(dx, dy) || 1;

    const dirX = dx / len;
    const dirY = dy / len;

    const EXTEND = 2000;

    const xStart = muzzle.x - dirX * EXTEND;
    const yStart = muzzle.y - dirY * EXTEND;
    const xEnd = this.lockedTarget.x + dirX * EXTEND;
    const yEnd = this.lockedTarget.y + dirY * EXTEND;

    const width = Math.max(10, this.currentLaserWidth * (0.5 + progress));

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    ctx.strokeStyle = `rgba(255,40,40,${0.18 + progress * 0.2})`;
    ctx.lineWidth = width * 3.6 * pulse;
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255,80,80,${0.5 + progress * 0.35})`;
    ctx.lineWidth = width * 2 * pulse;
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255,255,255,${0.7 + progress * 0.25})`;
    ctx.lineWidth = Math.max(2, width * 0.24);
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();

    ctx.restore();
  }

  draw(ctx) {
    ctx.save();

    ctx.drawImage(
      this.image,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );

    ctx.restore();

    this.drawChargeLine(ctx);
    this.activeLasers.forEach((laser) => laser.draw(ctx));
    this.drawHealthBar(ctx);

    if (this.state === 'charging') {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,0,0,0.4)';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.restore();
    }
  }
}

class Boss7Laser {
  constructor(game, x1, y1, x2, y2, width, duration) {
    this.game = game;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.width = width;
    this.duration = duration;
    this.life = duration;
    this.markedForDeletion = false;
    this.didDamage = false;
  }

  update(deltaTime) {
    this.life -= deltaTime;

    if (!this.didDamage && this.hitPlayer()) {
      if (!this.game.player.invulnerable) {
        this.game.player.lives--;
        this.game.player.invulnerable = true;
        this.game.player.invulnerableTimer = 0;
        this.game.triggerShake(520, 28);
      }
      this.didDamage = true;
    }

    if (this.life <= 0) {
      this.markedForDeletion = true;
    }
  }

  hitPlayer() {
    const player = this.game.player;
    const px = player.x + player.width / 2;
    const py = player.y + player.height / 2;

    const dx = this.x2 - this.x1;
    const dy = this.y2 - this.y1;
    const lenSq = dx * dx + dy * dy || 1;

    let t = ((px - this.x1) * dx + (py - this.y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const nearestX = this.x1 + dx * t;
    const nearestY = this.y1 + dy * t;

    const dist = Math.hypot(px - nearestX, py - nearestY);
    const hitRadius =
      this.width / 2 + Math.max(player.width, player.height) * 0.28;

    return dist <= hitRadius;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.duration);
    const pulse = 0.92 + Math.sin(performance.now() * 0.05) * 0.08;

    const dx = this.x2 - this.x1;
    const dy = this.y2 - this.y1;
    const len = Math.hypot(dx, dy) || 1;

    const dirX = dx / len;
    const dirY = dy / len;

    const EXTEND = 2200;

    const xStart = this.x1;
    const yStart = this.y1;
    const xFullEnd = this.x2 + dirX * EXTEND;
    const yFullEnd = this.y2 + dirY * EXTEND;
    const rawProgress = 1 - this.life / (this.duration * 0.35);
    const appearProgress = Math.max(0, Math.min(1, rawProgress));
    const beamLen = Math.hypot(xFullEnd - xStart, yFullEnd - yStart);

    const drawEndX = xStart + dirX * beamLen * appearProgress;
    const drawEndY = yStart + dirY * beamLen * appearProgress;

    const coreWidth = this.width * pulse;
    const outerWidth = this.width * 2.8 * pulse;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const ringR = Math.max(0, 20 + 26 * appearProgress);
    ctx.globalAlpha = 0.28 * alpha;
    ctx.fillStyle = 'rgba(255,60,60,1)';
    ctx.beginPath();
    ctx.arc(this.x1, this.y1, ringR, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.9 * alpha;
    ctx.strokeStyle = 'rgba(255,180,180,0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x1, this.y1, ringR * 0.72, 0, Math.PI * 2);
    ctx.stroke();

    const flashGrad = ctx.createRadialGradient(
      this.x1,
      this.y1,
      0,
      this.x1,
      this.y1,
      55 + 20 * pulse
    );
    flashGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
    flashGrad.addColorStop(0.18, 'rgba(255,210,210,0.95)');
    flashGrad.addColorStop(0.45, 'rgba(255,70,70,0.65)');
    flashGrad.addColorStop(1, 'rgba(255,0,0,0)');

    ctx.globalAlpha = 0.95 * alpha;
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(this.x1, this.y1, 65 + 18 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(this.x1, this.y1);
    ctx.rotate(Math.atan2(dy, dx));

    ctx.globalAlpha = 0.9 * alpha;
    ctx.fillStyle = 'rgba(255,120,120,0.9)';
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(70 + 25 * appearProgress, 0);
    ctx.lineTo(0, 18);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(42 + 16 * appearProgress, 0);
    ctx.lineTo(0, 8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    ctx.strokeStyle = `rgba(255,40,40,${0.22 * alpha})`;
    ctx.lineWidth = outerWidth;
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(drawEndX, drawEndY);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255,70,70,${0.95 * alpha})`;
    ctx.lineWidth = coreWidth * 1.35;
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(drawEndX, drawEndY);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.lineWidth = Math.max(3, this.width * 0.28);
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(drawEndX, drawEndY);
    ctx.stroke();

    ctx.restore();
  }
}

class Boss8 extends BossBase {
  constructor(game) {
    super(game);

    this.width = 160;
    this.height = 190;

    this.x = this.game.width / 2 - this.width / 2;
    this.y = -this.height;

    this.baseY = 85;
    this.entered = false;

    this.maxLives = 520;
    this.lives = this.maxLives;

    this.speedX = 3.2;
    this.speedY = 1.4;
    this.dirX = 1;

    this.phase = 1;
    this.hitFlash = 0;

    this.enemyBullets = [];

    this.hoverTime = 0;
    this.hoverAmp = 16;

    this.normalShootTimer = 0;
    this.normalShootInterval = 420;

    this.burstTimer = 0;
    this.burstInterval = 1800;

    this.magnetShootTimer = 0;
    this.magnetShootInterval = 3600;

    this.pullPlayerTimer = 0;
    this.pullPlayerDuration = 1400;
    this.pullStrength = 5.2;

    this.image = document.getElementById('boss8Sprite') || null;

    this.frames = 8;
    this.frameX = 0;
    this.frameTimer = 0;
    this.frameInterval = 120;

    this.spriteWidth = 0;
    this.spriteHeight = 0;

    if (this.image && (this.image.naturalWidth || this.image.width)) {
      const iw = this.image.naturalWidth || this.image.width;
      const ih = this.image.naturalHeight || this.image.height;
      this.spriteWidth = iw / this.frames;
      this.spriteHeight = ih;
    }
  }

  handlePhases() {
    const hpPercent = this.lives / this.maxLives;

    if (hpPercent < 0.7 && this.phase === 1) {
      this.phase = 2;
      this.speedX = 3.8;
      this.normalShootInterval = 360;
      this.burstInterval = 1550;
      this.hoverAmp = 22;
    }

    if (hpPercent < 0.35 && this.phase === 2) {
      this.phase = 3;
      this.speedX = 4.5;
      this.normalShootInterval = 300;
      this.burstInterval = 1250;
      this.pullStrength = 2.2;
      this.pullPlayerDuration = 1200;
      this.hoverAmp = 28;
    }
  }

  getMuzzle() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height * 0.72,
    };
  }

  startPullEffect() {
    this.pullPlayerTimer = this.pullPlayerDuration;
    this.game.player.magnetLocked = true;
    this.game.triggerShake(500, 20);
  }

  getMagnetShootInterval() {
    const hpRatio = this.lives / this.maxLives;
    const slow = 3600;
    const fast = 1200;
    return fast + (slow - fast) * hpRatio;
  }

  applyPullToPlayer(deltaTime) {
    if (this.pullPlayerTimer <= 0) {
      this.game.player.magnetLocked = false;
      return;
    }

    const player = this.game.player;
    const dt = deltaTime / 16.67;

    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;

    const bossCenterX = this.x + this.width / 2;
    const bossCenterY = this.y + this.height / 2;

    const dx = bossCenterX - playerCenterX;
    const dy = bossCenterY - playerCenterY;
    const dist = Math.hypot(dx, dy) || 1;

    const dirX = dx / dist;
    const dirY = dy / dist;

    const progress = this.pullPlayerTimer / this.pullPlayerDuration;

    let force = this.pullStrength;

    if (dist > 260) force *= 1.9;
    else if (dist > 180) force *= 1.45;
    else if (dist > 100) force *= 1.15;

    if (progress > 0.65) force *= 1.35;

    player.x += dirX * force * dt;
    player.y += dirY * force * dt;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > this.game.width) {
      player.x = this.game.width - player.width;
    }

    if (player.y < 0) player.y = 0;
    if (player.y + player.height > this.game.height) {
      player.y = this.game.height - player.height;
    }

    this.pullPlayerTimer -= deltaTime;

    if (this.pullPlayerTimer <= 0) {
      this.pullPlayerTimer = 0;
      this.game.player.magnetLocked = false;
    }
  }

  shootNormalSpread(count = 3, spread = 0.22, speed = 5.6) {
    const muzzle = this.getMuzzle();
    const player = this.game.player;

    const px = player.x + player.width / 2;
    const py = player.y + player.height / 2;

    const dx = px - muzzle.x;
    const dy = py - muzzle.y;
    const angle = Math.atan2(dy, dx);

    if (count === 1) {
      this.enemyBullets.push(
        new Boss8Bullet(
          this.game,
          muzzle.x - 8,
          muzzle.y - 8,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          false
        )
      );
      return;
    }

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const a = angle - spread + t * spread * 2;

      this.enemyBullets.push(
        new Boss8Bullet(
          this.game,
          muzzle.x - 8,
          muzzle.y - 8,
          Math.cos(a) * speed,
          Math.sin(a) * speed,
          false
        )
      );
    }
  }

  shootMagnetBullet() {
    const muzzle = this.getMuzzle();
    const player = this.game.player;

    const px = player.x + player.width / 2;
    const py = player.y + player.height / 2;

    const dx = px - muzzle.x;
    const dy = py - muzzle.y;
    const len = Math.hypot(dx, dy) || 1;

    const speed = this.phase === 1 ? 4.3 : this.phase === 2 ? 4.9 : 5.4;

    this.enemyBullets.push(
      new Boss8Bullet(
        this.game,
        muzzle.x - 14,
        muzzle.y - 14,
        (dx / len) * speed,
        (dy / len) * speed,
        true,
        this
      )
    );
  }

  update(deltaTime) {
    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameInterval) {
      this.frameX = (this.frameX + 1) % this.frames;
      this.frameTimer = 0;
    }

    if (this.game.upgradeCardsShowing) return;

    const dt = deltaTime / 16.67;

    if (!this.entered) {
      this.y += this.speedY * dt;
      if (this.y >= this.baseY) {
        this.y = this.baseY;
        this.entered = true;
      }
      return;
    }

    this.handlePhases();

    this.hoverTime += deltaTime * 0.0018;
    this.x += this.speedX * this.dirX * dt;
    this.y = this.baseY + Math.sin(this.hoverTime * 2.1) * this.hoverAmp;

    if (this.x <= 0) {
      this.x = 0;
      this.dirX = 1;
    } else if (this.x + this.width >= this.game.width) {
      this.x = this.game.width - this.width;
      this.dirX = -1;
    }

    this.normalShootTimer += deltaTime;
    this.burstTimer += deltaTime;
    this.magnetShootTimer += deltaTime;

    if (
      !this.game.gameOver &&
      this.normalShootTimer >= this.normalShootInterval
    ) {
      this.normalShootTimer = 0;
      this.shootNormalSpread(1, 0, this.phase === 3 ? 5.8 : 5.2);
    }

    if (!this.game.gameOver && this.burstTimer >= this.burstInterval) {
      this.burstTimer = 0;

      if (this.phase === 1) {
        this.shootNormalSpread(2, 0.16, 5.1);
      } else if (this.phase === 2) {
        this.shootNormalSpread(3, 0.24, 5.3);
      } else {
        this.shootNormalSpread(5, 0.34, 5.6);
      }
    }

    const magnetInterval = this.getMagnetShootInterval();

    if (!this.game.gameOver && this.magnetShootTimer >= magnetInterval) {
      this.magnetShootTimer = 0;
      this.shootMagnetBullet();

      if (this.phase >= 3) {
        setTimeout(() => {
          if (!this.markedForDeletion && !this.game.gameOver) {
            this.shootMagnetBullet();
          }
        }, 420);
      }
    }

    this.applyPullToPlayer(deltaTime);

    this.enemyBullets.forEach((b) => b.update(deltaTime));
    this.enemyBullets = this.enemyBullets.filter((b) => !b.markedForDeletion);

    if (this.hitFlash > 0) this.hitFlash -= deltaTime;
  }

  drawPullAura(ctx) {
    if (this.pullPlayerTimer <= 0) return;

    const p = this.pullPlayerTimer / this.pullPlayerDuration;
    const r = 80 + (1 - p) * 70;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(120,220,255,${0.22 + p * 0.35})`;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(
      this.x + this.width / 2,
      this.y + this.height / 2,
      r,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    ctx.strokeStyle = `rgba(255,255,255,${0.15 + p * 0.2})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(
      this.x + this.width / 2,
      this.y + this.height / 2,
      r * 0.72,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.restore();
  }

  draw(ctx) {
    ctx.save();

    if (this.hitFlash > 0) {
      ctx.globalAlpha = 0.78 + Math.sin(performance.now() * 0.05) * 0.22;
    }

    ctx.drawImage(
      this.image,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );

    ctx.restore();

    this.drawPullAura(ctx);
    this.enemyBullets.forEach((b) => b.draw(ctx));
    this.drawHealthBar(ctx);
  }
}
class Boss8Bullet {
  constructor(game, x, y, vx, vy, isMagnet = false, bossRef = null) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.isMagnet = isMagnet;
    this.bossRef = bossRef;

    this.width = isMagnet ? 28 : 24;
    this.height = isMagnet ? 28 : 24;

    this.markedForDeletion = false;
    this.rotation = 0;
    this.rotationSpeed = isMagnet ? 0.16 : 0.24;
    this.lives = isMagnet ? 5 : 1;
  }

  update(deltaTime) {
    const dt = deltaTime / 16.67;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.rotationSpeed * dt;

    if (!this.isMagnet) {
      const shots = this.game.player.projectiles;
      for (let i = 0; i < shots.length; i++) {
        const p = shots[i];
        if (p.markedForDeletion) continue;

        if (window.checkCollision(p, this)) {
          p.markedForDeletion = true;
          this.markedForDeletion = true;
          break;
        }
      }
    }

    if (
      !this.game.player.invulnerable &&
      window.checkCollision(this.game.player, this)
    ) {
      this.game.player.lives--;
      this.game.player.invulnerable = true;
      this.game.player.invulnerableTimer = 0;
      this.game.triggerShake(520, this.isMagnet ? 30 : 22);

      if (this.isMagnet && this.bossRef) {
        this.bossRef.startPullEffect();
      }

      this.markedForDeletion = true;
    }

    if (
      this.y > this.game.height + this.height ||
      this.x < -this.width ||
      this.x > this.game.width + this.width ||
      this.y < -this.height
    ) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    ctx.save();
    ctx.translate(cx, cy);

    if (this.isMagnet) {
      ctx.rotate(this.rotation);
      ctx.globalCompositeOperation = 'lighter';

      const pulse = 0.88 + Math.sin(performance.now() * 0.015) * 0.12;

      ctx.fillStyle = 'rgba(90,190,255,0.18)';
      ctx.beginPath();
      ctx.arc(0, 0, this.width * 1.25 * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#5bd4ff';
      ctx.beginPath();
      ctx.arc(0, 0, this.width * 0.48, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.width * 0.78, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, this.width * 0.78, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, this.width * 0.12, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const angle = Math.atan2(this.vy, this.vx);
      const t = performance.now() * 0.01;
      const pulse = 0.9 + Math.sin(t * 3) * 0.1;

      ctx.rotate(angle);
      ctx.globalCompositeOperation = 'lighter';

      ctx.fillStyle = 'rgba(180,80,255,0.14)';
      ctx.beginPath();
      ctx.ellipse(
        0,
        0,
        this.width * 1.45 * pulse,
        this.height * 1.05,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      const trailGrad = ctx.createLinearGradient(
        -this.width * 1.5,
        0,
        this.width * 0.2,
        0
      );
      trailGrad.addColorStop(0, 'rgba(80,0,180,0)');
      trailGrad.addColorStop(0.35, 'rgba(120,40,255,0.22)');
      trailGrad.addColorStop(1, 'rgba(220,140,255,0.08)');

      ctx.fillStyle = trailGrad;
      ctx.beginPath();
      ctx.moveTo(-this.width * 1.4, 0);
      ctx.lineTo(-this.width * 0.2, -this.height * 0.3);
      ctx.lineTo(-this.width * 0.2, this.height * 0.3);
      ctx.closePath();
      ctx.fill();

      const bodyGrad = ctx.createLinearGradient(
        -this.width * 0.8,
        0,
        this.width * 0.95,
        0
      );
      bodyGrad.addColorStop(0, '#4e00c8');
      bodyGrad.addColorStop(0.45, '#b55cff');
      bodyGrad.addColorStop(1, '#ffe8ff');

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(this.width * 0.95, 0);
      ctx.lineTo(this.width * 0.15, -this.height * 0.42);
      ctx.lineTo(-this.width * 0.55, -this.height * 0.24);
      ctx.lineTo(-this.width * 0.2, 0);
      ctx.lineTo(-this.width * 0.55, this.height * 0.24);
      ctx.lineTo(this.width * 0.15, this.height * 0.42);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.beginPath();
      ctx.moveTo(this.width * 0.32, 0);
      ctx.lineTo(-this.width * 0.02, -this.height * 0.12);
      ctx.lineTo(-this.width * 0.12, 0);
      ctx.lineTo(-this.width * 0.02, this.height * 0.12);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.beginPath();
      ctx.arc(this.width * 0.08, 0, this.width * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

window.Boss1 = Boss1;
window.Boss1Bullet = Boss1Bullet;
window.Boss2 = Boss2;
window.Boss2Bullets = Boss2Bullets;
window.Boss3 = Boss3;
window.Boss3Bullet = Boss3Bullet;
window.Boss4 = Boss4;
window.Boss4Bullet = Boss4Bullet;
window.Boss5 = Boss5;
window.Boss5Bullet = Boss5Bullet;
window.Boss6 = Boss6;
window.Boss6Bullet = Boss6Bullet;
window.Boss7 = Boss7;
window.Boss7Laser = Boss7Laser;
window.Boss8 = Boss8;
window.Boss8Bullet = Boss8Bullet;
