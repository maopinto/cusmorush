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

window.Boss1 = Boss1;
window.Boss1Bullet = Boss1Bullet;
window.Boss2 = Boss2;
window.Boss2Bullets = Boss2Bullets;
