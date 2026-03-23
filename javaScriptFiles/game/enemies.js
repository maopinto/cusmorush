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
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Angler1 extends Enemy {
  constructor(game) {
    super(game);

    this.width = 70;
    this.height = 90;

    this.lives = 4;
    this.speedY = 1.5;

    this.x = Math.random() * (this.game.width - this.width);

    this.image = document.getElementById('angler1Sprite');

    this.frameX = 0;
    this.frameY = 0;

    this.frameTimer = 0;
    this.frameInterval = 90;

    this.frames = 8;
    this.maxFrame = this.frames - 1;

    this.spriteWidth = 0;
    this.spriteHeight = 0;

    if (this.image && (this.image.naturalWidth || this.image.width)) {
      const iw = this.image.naturalWidth || this.image.width;
      const ih = this.image.naturalHeight || this.image.height;
      this.spriteWidth = Math.floor(iw / this.frames);
      this.spriteHeight = ih;
    }
  }
  update(deltaTime) {
    super.update(deltaTime);

    this.frameTimer += deltaTime;
    if (this.frameTimer > this.frameInterval) {
      this.frameX = (this.frameX + 1) % (this.maxFrame + 1);
      this.frameTimer = 0;
    }
  }

  draw(ctx) {
    if (this.image && this.image.complete && this.image.naturalWidth) {
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
      ctx.fillStyle = 'red';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}

class Angler2 extends Enemy {
  constructor(game) {
    super(game);

    this.width = 90;
    this.height = 90;

    this.lives = 9;
    this.speedY = Math.random() * (2 - 1.5) + 1.5;
    this.x = Math.random() * (this.game.width - this.width);

    this.image = document.getElementById('angler2Sprite');

    this.frames = 8;
    this.frameX = 0;
    this.frameY = 0;

    this.fps = 5;
    this.frameTimer = 0;
    this.frameInterval = 1000 / this.fps;

    this.frameCuts = [0, 57, 110, 163, 215, 270, 323, 375, 428];
    this.spriteHeight = 80;
  }

  update(deltaTime) {
    super.update(deltaTime);

    this.frameTimer += deltaTime;

    if (this.frameTimer > this.frameInterval) {
      this.frameX = (this.frameX + 1) % this.frames;
      this.frameTimer = 0;
    }
  }

  draw(ctx) {
    if (this.image && this.image.complete && this.image.naturalWidth) {
      const sx = this.frameCuts[this.frameX];
      const sw = this.frameCuts[this.frameX + 1] - sx;

      ctx.drawImage(
        this.image,
        sx,
        0,
        sw,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    } else {
      ctx.fillStyle = 'purple';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
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

    this.shooterTimer = 0;
    this.shooterInterval = Math.random() * (3000 - 2000) + 2000;
    this.enemyBullets = [];

    this.image = document.getElementById('angler3Sprite');

    this.frames = 8;
    this.frameX = 0;

    this.fps = 5;
    this.frameTimer = 0;
    this.frameInterval = 1000 / this.fps;

    this.frameCuts = [0, 57, 110, 163, 215, 270, 323, 375, 428];
    this.spriteHeight = 80;
  }

  update(deltaTime) {
    super.update(deltaTime);

    this.frameTimer += deltaTime;
    if (this.frameTimer > this.frameInterval) {
      this.frameX = (this.frameX + 1) % this.frames;
      this.frameTimer = 0;
    }

    this.shooterTimer += deltaTime;
    if (this.shooterTimer >= this.shooterInterval && !this.game.gameOver) {
      this.shootTop();
      this.shooterTimer = 0;
    }

    if (this.y >= 100) this.speedY = 0;

    this.enemyBullets.forEach((b) => b.update(deltaTime));
    this.enemyBullets = this.enemyBullets.filter(
      (b) => !b.markedForDeletion && b.y <= this.game.height
    );

    this.enemyBullets.forEach((b) => {
      if (checkCollision(this.game.player, b)) {
        this.game.player.lives--;
        this.game.triggerShake(520, 26);
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

  draw(ctx) {
    if (this.image && this.image.complete && this.image.naturalWidth) {
      const sx = this.frameCuts[this.frameX];
      const sw = this.frameCuts[this.frameX + 1] - sx;

      ctx.drawImage(
        this.image,
        sx,
        0,
        sw,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    } else {
      super.draw(ctx);
    }

    this.enemyBullets.forEach((b) => b.draw(ctx));
  }
}

class Angler3Shooter {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.speedY = 5;
    this.markedForDeletion = false;
  }

  update(deltaTime) {
    this.y += this.speedY;
    if (this.y > this.game.height) this.markedForDeletion = true;

    const shots = this.game.player.projectiles;
    for (let i = 0; i < shots.length; i++) {
      const p = shots[i];
      if (p.markedForDeletion) continue;

      if (checkCollision(p, this)) {
        p.markedForDeletion = true;
        this.markedForDeletion = true;
        break;
      }
    }
  }

  draw(ctx) {
    const t = performance.now() * 0.01;
    const pulse = 0.85 + 0.15 * Math.sin(t * 4);

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width * 0.6;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 3);
    glow.addColorStop(0, 'rgba(255,200,255,0.8)');
    glow.addColorStop(0.4, 'rgba(180,120,255,0.6)');
    glow.addColorStop(1, 'rgba(120,60,255,0)');

    ctx.globalAlpha = 0.7 * pulse;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 2.5, 0, Math.PI * 2);
    ctx.fill();

    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    core.addColorStop(0, 'white');
    core.addColorStop(0.4, 'rgba(200,150,255,1)');
    core.addColorStop(1, 'rgba(140,80,255,1)');

    ctx.globalAlpha = 1;
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.4;
    ctx.fillStyle = 'rgba(160,125,255,1)';
    ctx.beginPath();
    ctx.ellipse(cx, cy - r * 2.2, r * 0.7, r * 2.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

window.Enemy = Enemy;
window.Angler1 = Angler1;
window.Angler2 = Angler2;
window.Angler3 = Angler3;
window.Angler3Shooter = Angler3Shooter;
