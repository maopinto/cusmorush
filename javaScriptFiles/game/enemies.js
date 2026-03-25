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

class Angler4 extends Enemy {
  constructor(game) {
    super(game);

    this.width = 70;
    this.height = 90;

    this.x = Math.random() * (this.game.width - this.width);
    this.y = -this.height;

    this.lives = 13;
    this.speedY = 3;

    this.state = 'enter';
    this.triggerRange = 220;
    this.chargeSpeed = 9;

    this.speedX = 0;
    this.damage = 1;

    this.image = document.getElementById('angler4Sprite');

    this.frames = 8;
    this.frameX = 0;

    this.fps = 10;
    this.frameTimer = 0;
    this.frameInterval = 1000 / this.fps;

    this.frameCuts = [0, 60, 120, 180, 240, 300, 360, 420, 482];
    this.spriteHeight = 80;
  }

  update(deltaTime) {
    this.frameTimer += deltaTime;
    if (this.frameTimer > this.frameInterval) {
      this.frameX = (this.frameX + 1) % this.frames;
      this.frameTimer = 0;
    }

    if (this.mindControlled && this.mindTarget) {
      super.update(deltaTime);
      return;
    }

    const player = this.game.player;

    const dx = player.x + player.width / 2 - (this.x + this.width / 2);
    const dy = player.y + player.height / 2 - (this.y + this.height / 2);
    const dist = Math.hypot(dx, dy);

    if (this.state === 'enter') {
      this.y += this.speedY;

      if (dist < this.triggerRange) {
        const len = dist || 1;
        this.speedX = (dx / len) * this.chargeSpeed;
        this.speedY = (dy / len) * this.chargeSpeed;
        this.state = 'charge';
      }
    } else if (this.state === 'charge') {
      this.x += this.speedX;
      this.y += this.speedY;

      if (checkCollision(this, player)) {
        this.explode();
      }

      if (
        this.x < -this.width ||
        this.x > this.game.width + this.width ||
        this.y > this.game.height + this.height
      ) {
        this.explode();
      }
    }
  }

  explode() {
    this.markedForDeletion = true;

    this.game.explosions.push(
      new BomberExplosion(
        this.game,
        this.x + this.width / 2,
        this.y + this.height / 2,
        140
      )
    );
  }

  draw(ctx) {
    ctx.save();

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
    }

    if (this.state === 'charge') {
      ctx.strokeStyle = 'rgba(255,50,50,0.9)';
      ctx.lineWidth = 3;
      ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
    }

    ctx.restore();
  }
}

class BomberExplosion {
  constructor(game, x, y, radius = 180) {
    this.game = game;
    this.x = x;
    this.y = y;

    this.life = 0;
    this.maxLife = 170;

    this.radius = 0;
    this.maxRadius = radius;

    this.ringRadius = 10;
    this.ringMaxRadius = radius * 1.3;

    this.markedForDeletion = false;
    this.hit = false;

    this.spikes = [];
    for (let i = 0; i < 14; i++) {
      this.spikes.push({
        angle: (Math.PI * 2 * i) / 14 + Math.random() * 0.3,
        len: 25 + Math.random() * 30,
        width: 6 + Math.random() * 6,
      });
    }
  }

  update(deltaTime) {
    this.life += deltaTime;

    const t = Math.min(this.life / this.maxLife, 1);

    this.radius = this.maxRadius * (0.2 + 0.8 * t);
    this.ringRadius = this.ringMaxRadius * t;

    if (!this.hit) {
      const player = this.game.player;
      const dx = player.x + player.width / 2 - this.x;
      const dy = player.y + player.height / 2 - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= this.radius * 0.95) {
        player.lives--;
        this.game.triggerShake(520, 30);
        this.hit = true;
      }
    }

    if (this.life >= this.maxLife) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    const p = Math.min(this.life / this.maxLife, 1);
    const fade = 1 - p;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalCompositeOperation = 'lighter';

    const shake = Math.sin(performance.now() * 0.02) * 2 * (1 - p);
    ctx.translate(shake, shake);

    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 1.8);
    glow.addColorStop(0, `rgba(255,255,255,${0.9 * fade})`);
    glow.addColorStop(0.2, `rgba(255,100,100,${0.85 * fade})`);
    glow.addColorStop(0.5, `rgba(255,0,0,${0.6 * fade})`);
    glow.addColorStop(1, 'rgba(120,0,0,0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 1.8, 0, Math.PI * 2);
    ctx.fill();

    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
    core.addColorStop(0, `rgba(255,255,255,${1 * fade})`);
    core.addColorStop(0.3, `rgba(255,120,120,${0.95 * fade})`);
    core.addColorStop(0.7, `rgba(255,0,0,${0.6 * fade})`);
    core.addColorStop(1, `rgba(150,0,0,${0.2 * fade})`);

    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    const innerPulse =
      this.radius * (0.6 + 0.1 * Math.sin(performance.now() * 0.01));
    const inner = ctx.createRadialGradient(0, 0, 0, 0, 0, innerPulse);

    inner.addColorStop(0, `rgba(255,255,255,${0.8 * fade})`);
    inner.addColorStop(0.4, `rgba(255,80,80,${0.6 * fade})`);
    inner.addColorStop(1, 'rgba(255,0,0,0)');

    ctx.fillStyle = inner;
    ctx.beginPath();
    ctx.arc(0, 0, innerPulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255,120,120,${0.8 * fade})`;
    ctx.lineWidth = Math.max(2, 6 * fade);
    ctx.beginPath();
    ctx.arc(0, 0, this.ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}

class Angler5 extends Enemy {
  constructor(game) {
    super(game);

    this.width = 80;
    this.height = 100;

    this.lives = 14;
    this.speedY = 1.8;
    this.x = Math.random() * (this.game.width - this.width);

    this.hasSplit = false;

    this.image = document.getElementById('angler5Sprite');

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

      this.spriteWidth = Math.floor(iw / this.frames);
      this.spriteHeight = ih;
    }
  }

  update(deltaTime) {
    super.update(deltaTime);

    this.frameTimer += deltaTime;
    if (this.frameTimer > this.frameInterval) {
      this.frameX = (this.frameX + 1) % this.frames;
      this.frameTimer = 0;
    }
  }

  split() {
    if (this.hasSplit) return;
    this.hasSplit = true;

    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    this.game.enemies.push(
      new Angler5Mini(this.game, centerX, centerY, -1),
      new Angler5Mini(this.game, centerX, centerY, 1)
    );
  }

  draw(ctx) {
    if (this.image && this.image.complete && this.image.naturalWidth) {
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
      ctx.fillStyle = 'limegreen';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}

class Angler5Mini extends Enemy {
  constructor(game, centerX, centerY, dir) {
    super(game);

    this.width = 50;
    this.height = 50;

    this.x = centerX - this.width / 2;
    this.y = centerY - this.height / 2;

    this.lives = 3;

    this.dir = dir;

    this.state = 'split';
    this.stateTimer = 0;
    this.splitDuration = 175;

    this.speedX = 1.8 * dir;
    this.speedY = 1.2;

    this.maxSplitSpeedX = 4.8;
    this.maxSplitSpeedY = 2.8;

    this.accelX = 0.16 * dir;
    this.accelY = 0.08;

    this.forwardSpeed = 5.2;
    this.turnSpeed = 0.12;

    this.image = document.getElementById('angler5MiniSprite');
  }

  update(deltaTime) {
    if (this.mindControlled && this.mindTarget) {
      super.update(deltaTime);
      return;
    }

    this.stateTimer += deltaTime;

    if (this.state === 'split') {
      this.speedX += this.accelX;
      this.speedY += this.accelY;

      if (this.dir < 0 && this.speedX < -this.maxSplitSpeedX) {
        this.speedX = -this.maxSplitSpeedX;
      }

      if (this.dir > 0 && this.speedX > this.maxSplitSpeedX) {
        this.speedX = this.maxSplitSpeedX;
      }

      if (this.speedY > this.maxSplitSpeedY) {
        this.speedY = this.maxSplitSpeedY;
      }

      if (this.stateTimer >= this.splitDuration) {
        this.state = 'forward';
      }
    } else if (this.state === 'forward') {
      this.speedX += (0 - this.speedX) * this.turnSpeed;
      this.speedY += (this.forwardSpeed - this.speedY) * this.turnSpeed;
    }

    this.x += this.speedX;
    this.y += this.speedY;

    if (
      this.y > this.game.height ||
      this.x < -this.width ||
      this.x > this.game.width + this.width
    ) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    if (this.image && this.image.complete && this.image.naturalWidth) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = 'green';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}

window.Enemy = Enemy;
window.Angler1 = Angler1;
window.Angler2 = Angler2;
window.Angler3 = Angler3;
window.Angler3Shooter = Angler3Shooter;
window.Angler4 = Angler4;
window.BomberExplosion = BomberExplosion;
window.Angler5 = Angler5;
window.Angler5Mini = Angler5Mini;
