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
        this.frameY * this.spriteHeight,
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
        x,
        y,
        this.width,
        this.height
      );
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(x, y, this.width, this.height);
    }

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
      this.width = 180;
      this.height = 180;
      this.maxLives = 80;
      this.speedX = 2.2;
      this.speedY = 1.2;
      this.shootInterval = 1300;
      this.color = '#62ff6b';
      this.scoreValue = 10;
    } else if (splitLevel === 1) {
      this.width = 88;
      this.height = 88;
      this.maxLives = 20;
      this.speedX = 2.6;
      this.speedY = 1.4;
      this.shootInterval = 1300;
      this.color = '#45d7ff';
      this.scoreValue = 6;
    } else {
      this.width = 42;
      this.height = 42;
      this.maxLives = 8;
      this.speedX = 2.8;
      this.speedY = 1.4;
      this.shootInterval = 1800;
      this.color = '#b884ff';
      this.scoreValue = 3;
    }

    this.lives = this.maxLives;

    this.x = x !== null ? x : this.game.width / 2 - this.width / 2;
    this.y = y !== null ? y : -this.height;

    this.targetY = splitLevel === 0 ? 90 : Math.max(40, y ?? 80);

    this.dirX = Math.random() < 0.5 ? -1 : 1;
    this.shootTimer = 0;
    this.enemyBullets = [];
    this.hitFlash = 0;
  }

  update(deltaTime) {
    if (this.game.upgradeCardsShowing) return;

    const dt = deltaTime / 16.67;

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

    if (this.splitLevel === 0) {
      const speed = 4.8;
      this.enemyBullets.push(
        new Boss4Bullet(
          this.game,
          cx - 9,
          cy,
          (dx / len) * speed,
          (dy / len) * speed,
          16,
          '#62ff6b'
        )
      );
    } else if (this.splitLevel === 1) {
      const speed = 4.6;
      const angle = Math.atan2(dy, dx);

      this.enemyBullets.push(
        new Boss4Bullet(
          this.game,
          cx - 6,
          cy,
          Math.cos(angle - 0.1) * speed,
          Math.sin(angle - 0.1) * speed,
          11,
          '#45d7ff'
        )
      );
      this.enemyBullets.push(
        new Boss4Bullet(
          this.game,
          cx - 6,
          cy,
          Math.cos(angle + 0.1) * speed,
          Math.sin(angle + 0.1) * speed,
          11,
          '#45d7ff'
        )
      );
    } else {
      const speed = 4.2;
      const angle = Math.atan2(dy, dx);

      this.enemyBullets.push(
        new Boss4Bullet(
          this.game,
          cx - 4,
          cy,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          7,
          '#b884ff'
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
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

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
  constructor(game, x, y, vx, vy, size = 14, color = '#62ff6b') {
    this.game = game;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.width = size;
    this.height = size;
    this.color = color;
    this.markedForDeletion = false;
  }

  update(deltaTime) {
    const dt = deltaTime / 16.67;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

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
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
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
