class Enemy {
  constructor(game) {
    this.game = game;

    this.width = 100;
    this.height = 100;
    this.y = -this.height;
    this.speedY = 1;
    this.lives = 3;
    this.maxLives = this.lives;

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
    this.maxLives = this.lives;
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
  }
}

class Angler2 extends Enemy {
  constructor(game) {
    super(game);

    this.width = 90;
    this.height = 90;

    this.lives = 9;
    this.maxLives = this.lives;
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
}

class Angler3 extends Enemy {
  constructor(game) {
    super(game);

    this.width = 80;
    this.height = 80;

    this.lives = 6;
    this.maxLives = this.lives;
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
    this.maxLives = this.lives;
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
    this.maxLives = this.lives;
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
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}

class Angler6 extends Enemy {
  constructor(game) {
    super(game);

    this.width = 70;
    this.height = 90;

    this.x = Math.random() * (this.game.width - this.width);
    this.y = -this.height;

    this.lives = 10;
    this.maxLives = this.lives;
    this.speedY = 1.4;

    this.dropTimer = 0;
    this.dropInterval = 1400;

    this.image = document.getElementById('angler6Sprite');

    this.frames = 8;
    this.frameX = 0;

    this.frameTimer = 0;
    this.frameInterval = 120;

    this.frameCuts = [0, 60, 120, 180, 240, 300, 360, 420, 482];
    this.spriteHeight = 90;
  }

  update(deltaTime) {
    super.update(deltaTime);

    this.frameTimer += deltaTime;
    if (this.frameTimer > this.frameInterval) {
      this.frameX = (this.frameX + 1) % this.frames;
      this.frameTimer = 0;
    }

    this.dropTimer += deltaTime;
    if (this.dropTimer >= this.dropInterval && !this.game.gameOver) {
      this.dropMine();
      this.dropTimer = 0;
    }
  }

  dropMine() {
    this.game.enemyMines.push(
      new MineBomb(this.game, this.x + this.width / 2 - 16, this.y)
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
  }
}

class MineBomb {
  constructor(game, x, y) {
    this.game = game;

    this.x = x;
    this.y = y;

    this.width = 32;
    this.height = 32;

    this.speedY = 1.2;
    this.armTime = 700;
    this.lifeTime = 4000;

    this.timer = 0;
    this.markedForDeletion = false;
    this.exploded = false;

    this.triggerDistance = 85;
    this.explodeLine = this.game.height * 0.7;

    this.image = document.getElementById('Angler6MiniBombSprite');
  }

  update(deltaTime) {
    this.timer += deltaTime;
    this.y += this.speedY;

    if (this.y >= this.explodeLine) {
      this.explode();
      return;
    }

    if (this.y > this.game.height + this.height) {
      this.markedForDeletion = true;
      return;
    }

    if (this.timer >= this.armTime) {
      const player = this.game.player;
      const dx = player.x + player.width / 2 - (this.x + this.width / 2);
      const dy = player.y + player.height / 2 - (this.y + this.height / 2);
      const dist = Math.hypot(dx, dy);

      if (dist <= this.triggerDistance) {
        this.explode();
        return;
      }
    }

    const shots = this.game.player.projectiles;
    for (let i = 0; i < shots.length; i++) {
      const p = shots[i];
      if (p.markedForDeletion) continue;

      if (checkCollision(p, this)) {
        p.markedForDeletion = true;
        this.explode();
        return;
      }
    }

    if (this.timer >= this.lifeTime) {
      this.explode();
    }
  }

  explode() {
    if (this.exploded) return;

    this.exploded = true;
    this.markedForDeletion = true;

    this.game.explosions.push(
      new BomberExplosion(
        this.game,
        this.x + this.width / 2,
        this.y + this.height / 2,
        90
      )
    );
  }

  draw(ctx) {
    if (this.image && this.image.complete && this.image.naturalWidth) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = 'black';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}

class Angler7 extends Enemy {
  constructor(game) {
    super(game);

    this.width = 84;
    this.height = 92;

    this.x = Math.random() * (this.game.width - this.width);
    this.y = -this.height;

    this.lives = 14;
    this.maxLives = this.lives;
    this.speedY = 1.2;

    this.reflectCooldown = 0;
    this.reflectInterval = 120;

    this.image = document.getElementById('angler7Sprite');

    this.frames = 8;
    this.frameX = 0;
    this.frameY = 0;

    this.frameTimer = 0;
    this.frameInterval = 100;

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

    if (this.reflectCooldown > 0) {
      this.reflectCooldown -= deltaTime;
    }

    this.frameTimer += deltaTime;
    if (this.frameTimer > this.frameInterval) {
      this.frameX = (this.frameX + 1) % this.frames;
      this.frameTimer = 0;
    }
  }

  reflectProjectile(projectile) {
    if (this.reflectCooldown > 0) return;

    this.reflectCooldown = this.reflectInterval;

    const startX = projectile.x + projectile.width / 2;
    const startY = projectile.y + projectile.height / 2;

    const player = this.game.player;
    const targetX = player.x + player.width / 2;
    const targetY = player.y + player.height / 2;

    const dx = targetX - startX;
    const dy = targetY - startY;
    const len = Math.hypot(dx, dy) || 1;

    const speed = 5.5;

    this.game.enemyBullets.push(
      new ReflectedShot(
        this.game,
        startX - 8,
        startY - 8,
        (dx / len) * speed,
        (dy / len) * speed
      )
    );
  }

  draw(ctx) {
    if (
      this.image &&
      this.image.complete &&
      this.image.naturalWidth &&
      this.spriteWidth > 0
    ) {
      ctx.save();

      ctx.shadowColor = 'rgba(0,140,255,0.65)';
      ctx.shadowBlur = 14;

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
    } else {
      ctx.fillStyle = 'blue';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}

class ReflectedShot {
  constructor(game, x, y, vx, vy) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;

    this.width = 16;
    this.height = 16;

    this.damage = 1;
    this.markedForDeletion = false;
  }

  update(deltaTime) {
    const dt = deltaTime / 16.67;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (
      this.x < -30 ||
      this.x > this.game.width + 30 ||
      this.y < -30 ||
      this.y > this.game.height + 30
    ) {
      this.markedForDeletion = true;
      return;
    }

    if (
      !this.game.player.invulnerable &&
      checkCollision(this, this.game.player) &&
      !this.game.gameOver
    ) {
      this.game.player.lives -= this.damage;
      this.game.player.invulnerable = true;
      this.game.player.invulnerableTimer = 0;
      this.game.triggerShake(520, 22);
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const r = this.width * 0.5;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.5);
    glow.addColorStop(0, 'rgba(255,255,255,1)');
    glow.addColorStop(0.35, 'rgba(255,120,120,0.95)');
    glow.addColorStop(1, 'rgba(255,0,0,0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,180,180,1)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

class Angler8 extends Enemy {
  constructor(game) {
    super(game);

    this.width = 80;
    this.height = 100;

    this.x = Math.random() * (this.game.width - this.width);
    this.y = -this.height;

    this.lives = 12;
    this.maxLives = this.lives;
    this.speedY = 1.2;

    this.stopY = 110 + Math.random() * 70;
    this.shootTimer = 0;
    this.shootInterval = 1700;

    this.enemyBullets = [];

    this.image = document.getElementById('angler8Sprite');

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
    if (this.mindControlled && this.mindTarget) {
      super.update(deltaTime);
      return;
    }

    if (this.y < this.stopY) {
      this.y += this.speedY;
    }

    this.frameTimer += deltaTime;
    if (this.frameTimer > this.frameInterval) {
      this.frameX = (this.frameX + 1) % this.frames;
      this.frameTimer = 0;
    }

    this.shootTimer += deltaTime;
    if (this.shootTimer >= this.shootInterval && !this.game.gameOver) {
      this.shootTimer = 0;
      this.shootFreeze();
    }

    this.enemyBullets.forEach((b) => b.update(deltaTime));
    this.enemyBullets = this.enemyBullets.filter((b) => !b.markedForDeletion);

    if (this.y > this.game.height + this.height) {
      this.markedForDeletion = true;
    }
  }

  shootFreeze() {
    const px = this.game.player.x + this.game.player.width / 2;
    const py = this.game.player.y + this.game.player.height / 2;

    const sx = this.x + this.width / 2;
    const sy = this.y + this.height * 0.78;

    const dx = px - sx;
    const dy = py - sy;
    const len = Math.hypot(dx, dy) || 1;

    const speed = 4.2;

    this.enemyBullets.push(
      new FreezeBullet(
        this.game,
        sx - 11,
        sy - 11,
        (dx / len) * speed,
        (dy / len) * speed
      )
    );
  }

  draw(ctx) {
    if (
      this.image &&
      this.image.complete &&
      this.image.naturalWidth &&
      this.spriteWidth > 0
    ) {
      ctx.save();

      ctx.shadowColor = 'rgba(120,220,255,0.45)';
      ctx.shadowBlur = 12;

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
    } else {
      ctx.save();
      ctx.fillStyle = '#7fe7ff';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.restore();
    }

    this.enemyBullets.forEach((b) => b.draw(ctx));
  }
}

class FreezeBullet {
  constructor(game, x, y, vx, vy) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;

    this.width = 22;
    this.height = 22;

    this.markedForDeletion = false;
    this.rotation = 0;
  }

  update(deltaTime) {
    const dt = deltaTime / 16.67;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += 0.08 * dt;

    const shots = this.game.player.projectiles;
    for (let i = 0; i < shots.length; i++) {
      const p = shots[i];
      if (p.markedForDeletion) continue;

      if (checkCollision(p, this)) {
        p.markedForDeletion = true;
        this.markedForDeletion = true;
        return;
      }
    }

    if (
      !this.game.player.invulnerable &&
      checkCollision(this, this.game.player) &&
      !this.game.gameOver
    ) {
      this.game.player.lives--;
      this.game.player.invulnerable = true;
      this.game.player.invulnerableTimer = 0;

      this.game.player.slowed = true;
      this.game.player.slowTimer = 0;

      this.game.triggerShake(520, 22);
      this.markedForDeletion = true;
      return;
    }

    if (
      this.x < -40 ||
      this.x > this.game.width + 40 ||
      this.y < -40 ||
      this.y > this.game.height + 40
    ) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    const angle = Math.atan2(this.vy, this.vx) + Math.PI / 2;
    const t = performance.now() * 0.01;
    const pulse = 0.94 + Math.sin(t) * 0.06;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle + this.rotation * 0.35);
    ctx.globalCompositeOperation = 'lighter';

    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width * 1.6);
    glow.addColorStop(0, 'rgba(0, 217, 255, 0.35)');
    glow.addColorStop(0.3, 'rgba(160, 241, 255, 0.37)');
    glow.addColorStop(0.7, 'rgba(0, 136, 255, 0.18)');
    glow.addColorStop(1, 'rgba(0, 136, 255, 0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, this.width * 1.2 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'rgba(150,240,255,0.95)';
    ctx.shadowBlur = 18 * pulse;

    const body = ctx.createLinearGradient(
      0,
      -this.height * 0.8,
      0,
      this.height * 0.9
    );
    body.addColorStop(0, '#00f7ff');
    body.addColorStop(0.2, '#00ccff');
    body.addColorStop(0.5, '#8be8ff');
    body.addColorStop(0.78, '#46bbff');
    body.addColorStop(1, '#1f6dff');

    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(0, -this.height * 0.72);
    ctx.quadraticCurveTo(
      this.width * 0.42,
      -this.height * 0.46,
      this.width * 0.48,
      -this.height * 0.05
    );
    ctx.quadraticCurveTo(
      this.width * 0.42,
      this.height * 0.24,
      this.width * 0.18,
      this.height * 0.38
    );
    ctx.lineTo(this.width * 0.08, this.height * 0.72);
    ctx.lineTo(0, this.height * 0.9);
    ctx.lineTo(-this.width * 0.08, this.height * 0.72);
    ctx.lineTo(-this.width * 0.18, this.height * 0.38);
    ctx.quadraticCurveTo(
      -this.width * 0.42,
      this.height * 0.24,
      -this.width * 0.48,
      -this.height * 0.05
    );
    ctx.quadraticCurveTo(
      -this.width * 0.42,
      -this.height * 0.46,
      0,
      -this.height * 0.72
    );
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(0, 217, 255, 0.95)';
    ctx.beginPath();
    ctx.ellipse(
      0,
      -this.height * 0.18,
      this.width * 0.2,
      this.height * 0.18,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 204, 255, 0.95)';
    ctx.beginPath();
    ctx.moveTo(0, -this.height * 0.48);
    ctx.lineTo(this.width * 0.1, -this.height * 0.22);
    ctx.lineTo(0, this.height * 0.08);
    ctx.lineTo(-this.width * 0.1, -this.height * 0.22);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 217, 255, 0.75)';
    ctx.beginPath();
    ctx.moveTo(-this.width * 0.22, -this.height * 0.08);
    ctx.lineTo(-this.width * 0.34, this.height * 0.08);
    ctx.lineTo(-this.width * 0.16, this.height * 0.14);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(this.width * 0.22, -this.height * 0.08);
    ctx.lineTo(this.width * 0.34, this.height * 0.08);
    ctx.lineTo(this.width * 0.16, this.height * 0.14);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.9)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -this.height * 0.56);
    ctx.lineTo(0, this.height * 0.72);
    ctx.stroke();

    ctx.restore();
  }
}

class Angler9 extends Enemy {
  constructor(game) {
    super(game);

    this.width = 90;
    this.height = 90;

    this.x = Math.random() * (this.game.width - this.width);
    this.y = -this.height;

    this.lives = 16;
    this.maxLives = this.lives;
    this.speedY = 1.15;
    this.speedX = Math.random() < 0.5 ? -1.6 : 1.6;

    this.trailTimer = 0;
    this.trailInterval = 170;

    this.image = document.getElementById('angler9Sprite');

    this.frames = 8;
    this.frameX = 0;
    this.frameY = 0;

    this.frameTimer = 0;
    this.frameInterval = 100;

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
    if (this.mindControlled && this.mindTarget) {
      super.update(deltaTime);
      return;
    }

    this.y += this.speedY;
    this.x += this.speedX;

    if (this.x <= 0) {
      this.x = 0;
      this.speedX *= -1;
    }

    if (this.x + this.width >= this.game.width) {
      this.x = this.game.width - this.width;
      this.speedX *= -1;
    }

    this.trailTimer += deltaTime;
    if (this.trailTimer >= this.trailInterval) {
      this.dropFireTrail();
      this.trailTimer = 0;
    }

    this.frameTimer += deltaTime;
    if (this.frameTimer > this.frameInterval) {
      this.frameX = (this.frameX + 1) % this.frames;
      this.frameTimer = 0;
    }

    if (this.y > this.game.height + this.height) {
      this.markedForDeletion = true;
    }
  }

  dropFireTrail() {
    this.game.fireTrails.push(
      new FireTrail(
        this.game,
        this.x + this.width / 2 - 24,
        this.y + this.height - 10
      )
    );
  }

  draw(ctx) {
    ctx.save();

    ctx.shadowColor = 'rgba(255,120,0,0.55)';
    ctx.shadowBlur = 16;

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

class FireTrail {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;

    this.width = 52;
    this.height = 52;

    this.life = 0;
    this.maxLife = 2400;

    this.damageCooldown = 0;
    this.markedForDeletion = false;
  }

  update(deltaTime) {
    this.life += deltaTime;

    if (this.damageCooldown > 0) {
      this.damageCooldown -= deltaTime;
    }

    if (
      !this.game.player.invulnerable &&
      checkCollision(this, this.game.player) &&
      !this.game.gameOver &&
      this.damageCooldown <= 0
    ) {
      this.game.player.lives--;
      this.game.player.invulnerable = true;
      this.game.player.invulnerableTimer = 0;
      this.game.triggerShake(400, 16);
      this.damageCooldown = 300;
    }

    if (this.life >= this.maxLife) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    const p = this.life / this.maxLife;
    const fade = 1 - p;

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, this.width * 0.9);
    glow.addColorStop(0, `rgba(255,255,180,${0.95 * fade})`);
    glow.addColorStop(0.25, `rgba(255,180,0,${0.85 * fade})`);
    glow.addColorStop(0.6, `rgba(255,80,0,${0.55 * fade})`);
    glow.addColorStop(1, 'rgba(255,0,0,0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, this.width * 0.85, 0, Math.PI * 2);
    ctx.fill();

    const t = performance.now() * 0.015;

    ctx.fillStyle = `rgba(255,220,120,${0.85 * fade})`;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 18);
    ctx.quadraticCurveTo(cx - 14, cy + 2, cx - 7, cy - 16 + Math.sin(t) * 3);
    ctx.quadraticCurveTo(cx, cy - 28 + Math.sin(t * 1.2) * 4, cx + 7, cy - 14);
    ctx.quadraticCurveTo(cx + 15, cy + 3, cx, cy + 18);
    ctx.fill();

    ctx.fillStyle = `rgba(255,90,0,${0.9 * fade})`;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 15);
    ctx.quadraticCurveTo(
      cx - 10,
      cy + 2,
      cx - 5,
      cy - 9 + Math.sin(t * 1.4) * 2
    );
    ctx.quadraticCurveTo(cx, cy - 18 + Math.sin(t * 1.1) * 3, cx + 5, cy - 8);
    ctx.quadraticCurveTo(cx + 11, cy + 2, cx, cy + 15);
    ctx.fill();

    ctx.restore();
  }
}

class Angler10 extends Enemy {
  constructor(game) {
    super(game);

    this.width = 80;
    this.height = 80;

    this.x = Math.random() * (this.game.width - this.width);
    this.y = -this.height;

    this.lives = 15;
    this.maxLives = this.lives;
    this.speedY = 1.05;

    this.stopY = 420 + Math.random() * 400;

    this.hoverTime = 0;
    this.hoverOffsetX = 0;
    this.hoverOffsetY = 0;

    this.activationRange = 260;
    this.lockTimer = 0;
    this.damageThreshold = 1200;
    this.lockActive = false;

    this.image = document.getElementById('angler10Sprite');

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
    if (this.mindControlled && this.mindTarget) {
      super.update(deltaTime);
      this.lockActive = false;
      this.lockTimer = 0;
      return;
    }
    if (this.y < this.stopY) {
      this.y += this.speedY;
    } else {
      this.hoverTime += deltaTime * 0.002;
      this.hoverOffsetX = Math.sin(this.hoverTime) * 1.2;
      this.hoverOffsetY = Math.cos(this.hoverTime * 1.4) * 0.4;

      this.x += this.hoverOffsetX;
      this.y += this.hoverOffsetY;

      if (this.x < 0) this.x = 0;
      if (this.x + this.width > this.game.width) {
        this.x = this.game.width - this.width;
      }
    }

    this.frameTimer += deltaTime;
    if (this.frameTimer > this.frameInterval) {
      this.frameX = (this.frameX + 1) % this.frames;
      this.frameTimer = 0;
    }
    const player = this.game.player;

    const ex = this.x + this.width / 2;
    const ey = this.y + this.height * 0.65;

    const px = player.x + player.width / 2;
    const py = player.y + player.height / 2;

    const dx = px - ex;
    const dy = py - ey;
    const dist = Math.hypot(dx, dy);

    if (dist <= this.activationRange && !this.game.gameOver) {
      this.lockActive = true;
      this.lockTimer += deltaTime;

      if (this.lockTimer >= this.damageThreshold) {
        if (!player.invulnerable) {
          player.lives--;
          player.invulnerable = true;
          player.invulnerableTimer = 0;
          this.game.triggerShake(500, 20);
        }
        this.lockTimer = 0;
      }
    } else {
      this.lockActive = false;
      this.lockTimer = 0;
    }

    if (this.y > this.game.height + this.height) {
      this.markedForDeletion = true;
    }
  }

  drawLaser(ctx) {
    const player = this.game.player;

    const startX = this.x + this.width / 2;
    const startY = this.y + this.height * 0.65;

    const endX = player.x + player.width / 2;
    const endY = player.y + player.height / 2;

    const t = performance.now() * 0.02;
    const pulse = 0.75 + Math.sin(t) * 0.25;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    ctx.strokeStyle = `rgba(0,180,255,${0.18 + pulse * 0.12})`;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.strokeStyle = `rgba(80,220,255,${0.55 + pulse * 0.2})`;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    const glow = ctx.createRadialGradient(endX, endY, 0, endX, endY, 28);
    glow.addColorStop(0, 'rgba(255,255,255,0.9)');
    glow.addColorStop(0.25, 'rgba(120,220,255,0.7)');
    glow.addColorStop(1, 'rgba(0,160,255,0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(endX, endY, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawLockBar(ctx) {
    const barWidth = 56;
    const barHeight = 6;
    const x = this.x + this.width / 2 - barWidth / 2;
    const y = this.y - 12;

    const progress = Math.min(this.lockTimer / this.damageThreshold, 1);

    ctx.save();

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(x, y, barWidth, barHeight);

    const grad = ctx.createLinearGradient(x, 0, x + barWidth, 0);
    grad.addColorStop(0, '#b8f3ff');
    grad.addColorStop(0.5, '#42d7ff');
    grad.addColorStop(1, '#0077ff');

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barWidth * progress, barHeight);

    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.strokeRect(x, y, barWidth, barHeight);

    ctx.restore();
  }

  draw(ctx) {
    if (this.lockActive) {
      this.drawLaser(ctx);
    }

    ctx.save();

    ctx.shadowColor = 'rgba(0,200,255,0.7)';
    ctx.shadowBlur = 18;

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

    if (this.lockActive) {
      this.drawLockBar(ctx);
    }
  }
}

class Angler11 extends Enemy {
  constructor(game) {
    super(game);

    this.width = 90;
    this.height = 100;

    this.x = Math.random() * (this.game.width - this.width);
    this.y = -this.height;

    this.lives = 12;
    this.maxLives = this.lives;
    this.speedY = 1.15;

    this.stopY = 100 + Math.random() * 120;
    this.shootTimer = 0;
    this.shootInterval = 1800;

    this.enemyBullets = [];

    this.image = document.getElementById('angler11Sprite');

    this.frames = 7;
    this.frameX = 0;
    this.frameY = 0;

    this.frameTimer = 0;
    this.frameInterval = 140;

    this.frameCuts = [0, 69, 138, 207, 276, 345, 414, 482];
    this.spriteHeight = 90;
  }

  update(deltaTime) {
    if (this.mindControlled && this.mindTarget) {
      super.update(deltaTime);
      return;
    }

    if (this.y < this.stopY) {
      this.y += this.speedY;
    }

    this.frameTimer += deltaTime;
    if (this.frameTimer > this.frameInterval) {
      this.frameX = (this.frameX + 1) % this.frames;
      this.frameTimer = 0;
    }

    this.shootTimer += deltaTime;
    if (this.shootTimer >= this.shootInterval && !this.game.gameOver) {
      this.shootTimer = 0;
      this.shootBlindShot();
    }

    this.enemyBullets.forEach((b) => b.update(deltaTime));
    this.enemyBullets = this.enemyBullets.filter((b) => !b.markedForDeletion);

    if (this.y > this.game.height + this.height) {
      this.markedForDeletion = true;
    }
  }

  shootBlindShot() {
    const player = this.game.player;

    const sx = this.x + this.width / 2;
    const sy = this.y + this.height * 0.72;

    const px = player.x + player.width / 2;
    const py = player.y + player.height / 2;

    const dx = px - sx;
    const dy = py - sy;
    const len = Math.hypot(dx, dy) || 1;

    const speed = 4.8;

    this.enemyBullets.push(
      new BlindBullet(
        this.game,
        sx - 11,
        sy - 11,
        (dx / len) * speed,
        (dy / len) * speed
      )
    );
  }

  draw(ctx) {
    if (this.image && this.image.complete && this.image.naturalWidth) {
      const sx = this.frameCuts[this.frameX];
      const sw = this.frameCuts[this.frameX + 1] - sx;

      ctx.save();

      ctx.shadowColor = 'rgba(180,0,255,0.55)';
      ctx.shadowBlur = 18;

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

      ctx.restore();
    } else {
      ctx.save();
      ctx.fillStyle = '#7a00cc';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.restore();
    }

    this.enemyBullets.forEach((b) => b.draw(ctx));
  }
}

class BlindBullet {
  constructor(game, x, y, vx, vy) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;

    this.width = 22;
    this.height = 22;

    this.markedForDeletion = false;
    this.rotation = 0;
  }

  update(deltaTime) {
    const dt = deltaTime / 16.67;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += 0.1 * dt;

    const shots = this.game.player.projectiles;
    for (let i = 0; i < shots.length; i++) {
      const p = shots[i];
      if (p.markedForDeletion) continue;

      if (checkCollision(p, this)) {
        p.markedForDeletion = true;
        this.markedForDeletion = true;
        return;
      }
    }

    if (
      !this.game.player.invulnerable &&
      checkCollision(this, this.game.player) &&
      !this.game.gameOver
    ) {
      this.game.player.lives--;
      this.game.player.invulnerable = true;
      this.game.player.invulnerableTimer = 0;

      this.game.player.blinded = true;
      this.game.player.blindTimer = 0;

      this.game.triggerShake(520, 22);
      this.markedForDeletion = true;
      return;
    }

    if (
      this.x < -40 ||
      this.x > this.game.width + 40 ||
      this.y < -40 ||
      this.y > this.game.height + 40
    ) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const t = performance.now() * 0.01;
    const pulse = 0.88 + Math.sin(t * 2.2) * 0.12;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);
    ctx.globalCompositeOperation = 'lighter';

    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width * 1.5);
    glow.addColorStop(0, 'rgba(255,255,255,0.95)');
    glow.addColorStop(0.25, 'rgba(205,120,255,0.85)');
    glow.addColorStop(0.65, 'rgba(120,0,200,0.45)');
    glow.addColorStop(1, 'rgba(80,0,120,0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, this.width * 1.2 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(235,180,255,0.95)';
    ctx.beginPath();
    ctx.arc(0, 0, this.width * 0.34, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 * i) / 6;
      const r1 = this.width * 0.35;
      const r2 = this.width * 0.72;

      ctx.strokeStyle = 'rgba(210,140,255,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

class Angler12 extends Enemy {
  constructor(game) {
    super(game);

    this.width = 80;
    this.height = 80;

    this.x = Math.random() * (this.game.width - this.width);
    this.y = -this.height;

    this.lives = 8;
    this.maxLives = this.lives;
    this.speedY = 1.1;

    this.stopY = 90 + Math.random() * 100;

    this.healTimer = 0;
    this.healInterval = 2200;
    this.healAmount = 2;

    this.enemyBullets = [];

    this.image = document.getElementById('angler12Sprite');

    this.frames = 7;
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
    if (this.mindControlled && this.mindTarget) {
      super.update(deltaTime);
      return;
    }

    if (this.y < this.stopY) {
      this.y += this.speedY;
    }

    this.frameTimer += deltaTime;
    if (this.frameTimer > this.frameInterval) {
      this.frameX = (this.frameX + 1) % this.frames;
      this.frameTimer = 0;
    }

    this.healTimer += deltaTime;
    if (this.healTimer >= this.healInterval && !this.game.gameOver) {
      const target = this.findHealTarget();
      if (target) {
        this.healTimer = 0;
        this.shootHeal(target);
      }
    }

    this.enemyBullets.forEach((b) => b.update(deltaTime));
    this.enemyBullets = this.enemyBullets.filter((b) => !b.markedForDeletion);

    if (this.y > this.game.height + this.height) {
      this.markedForDeletion = true;
    }
  }

  findHealTarget() {
    const player = this.game.player;
    const px = player.x + player.width / 2;
    const py = player.y + player.height / 2;

    const candidates = this.game.enemies.filter((enemy) => {
      if (!enemy || enemy === this) return false;
      if (enemy.markedForDeletion) return false;
      if (enemy.mindControlled) return false;
      if (enemy.lives <= 0) return false;
      if (enemy instanceof Angler12) return false;
      if (typeof enemy.maxLives !== 'number') return false;
      if (enemy.lives >= enemy.maxLives) return false;
      return true;
    });

    if (!candidates.length) return null;

    let best = null;
    let bestScore = Infinity;

    for (const enemy of candidates) {
      const ex = enemy.x + enemy.width / 2;
      const ey = enemy.y + enemy.height / 2;

      const distToPlayer = Math.hypot(ex - px, ey - py);

      if (distToPlayer < bestScore) {
        bestScore = distToPlayer;
        best = enemy;
      }
    }

    return best;
  }

  shootHeal(target) {
    const sx = this.x + this.width / 2;
    const sy = this.y + this.height * 0.78;

    const tx = target.x + target.width / 2;
    const ty = target.y + target.height / 2;

    const dx = tx - sx;
    const dy = ty - sy;
    const len = Math.hypot(dx, dy) || 1;

    const speed = 8;

    this.enemyBullets.push(
      new HealShot(
        this.game,
        sx - 10,
        sy - 10,
        (dx / len) * speed,
        (dy / len) * speed,
        target,
        this.healAmount
      )
    );
  }

  draw(ctx) {
    if (
      this.image &&
      this.image.complete &&
      this.image.naturalWidth &&
      this.spriteWidth > 0
    ) {
      ctx.save();

      ctx.shadowColor = 'rgba(0,255,140,0.55)';
      ctx.shadowBlur = 18;

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
    } else {
      ctx.fillStyle = 'green';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    this.enemyBullets.forEach((b) => b.draw(ctx));
  }
}

class HealShot {
  constructor(game, x, y, vx, vy, target, healAmount) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;

    this.width = 10;
    this.height = 10;

    this.target = target;
    this.healAmount = healAmount;

    this.speed = 7.5;
    this.turnSpeed = 0.22;

    this.markedForDeletion = false;
    this.rotation = 0;
  }

  update(deltaTime) {
    const dt = deltaTime / 16.67;

    if (
      !this.target ||
      this.target.markedForDeletion ||
      this.target.lives <= 0
    ) {
      this.markedForDeletion = true;
      return;
    }

    const tx = this.target.x + this.target.width / 2 - this.width / 2;
    const ty = this.target.y + this.target.height / 2 - this.height / 2;

    const dx = tx - this.x;
    const dy = ty - this.y;
    const len = Math.hypot(dx, dy) || 1;

    const desiredVX = (dx / len) * this.speed;
    const desiredVY = (dy / len) * this.speed;

    this.vx += (desiredVX - this.vx) * this.turnSpeed * dt;
    this.vy += (desiredVY - this.vy) * this.turnSpeed * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.rotation = Math.atan2(this.vy, this.vx);

    if (checkCollision(this, this.target)) {
      this.target.lives = Math.min(
        this.target.lives + this.healAmount,
        this.target.maxLives
      );
      this.markedForDeletion = true;
      return;
    }

    if (
      this.x < -60 ||
      this.x > this.game.width + 60 ||
      this.y < -60 ||
      this.y > this.game.height + 60
    ) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const t = performance.now() * 0.01;
    const pulse = 0.9 + Math.sin(t * 2.4) * 0.1;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation + Math.PI / 2);
    ctx.globalCompositeOperation = 'lighter';

    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width * 1.8);
    glow.addColorStop(0, 'rgba(255,255,255,0.95)');
    glow.addColorStop(0.25, 'rgba(120,255,170,0.9)');
    glow.addColorStop(0.7, 'rgba(0,255,120,0.35)');
    glow.addColorStop(1, 'rgba(0,255,120,0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, this.width * 1.2 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(180,255,210,1)';
    ctx.beginPath();
    ctx.arc(0, 0, this.width * 0.32, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(120,255,170,0.95)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(6, 0);
    ctx.moveTo(0, -6);
    ctx.lineTo(0, 6);
    ctx.stroke();

    ctx.restore();
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
window.Angler6 = Angler6;
window.MineBomb = MineBomb;
window.Angler7 = Angler7;
window.ReflectedShot = ReflectedShot;
window.Angler8 = Angler8;
window.FreezeBullet = FreezeBullet;
window.Angler9 = Angler9;
window.FireTrail = FireTrail;
window.Angler10 = Angler10;
window.Angler11 = Angler11;
window.BlindBullet = BlindBullet;
window.Angler12 = Angler12;
window.HealShot = HealShot;
