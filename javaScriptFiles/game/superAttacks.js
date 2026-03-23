class SuperAttack1 {
  constructor(game) {
    this.game = game;
    this.width = 240;
    this.height = 30;
    this.x = this.game.width / 2 - this.width / 2;
    this.y = game.height;
    this.speedY = 10;
    this.damage = 50;
    this.markedForDeletion = false;

    this.lifeTime = 2500;
    this.timer = 0;
    this.alpha = 1;
  }

  update(deltaTime) {
    const dt = deltaTime / 16.67;

    this.timer += deltaTime;
    this.y -= this.speedY * dt;

    this.alpha = Math.max(0, 1 - this.timer / this.lifeTime);

    if (this.timer >= this.lifeTime || this.y < -this.height) {
      this.markedForDeletion = true;
    }
  }

  draw(context) {
    const t = performance.now() * 0.001;

    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;

    const cx = x + w / 2;
    const cy = y + h / 2;

    const r = h * 0.6;
    const pulse = 0.85 + 0.15 * Math.sin(t * 6);
    const wobble = Math.sin(t * 10) * 0.6;

    context.save();
    context.globalAlpha = this.alpha;
    context.globalCompositeOperation = 'lighter';

    context.globalAlpha = this.alpha * 0.22 * pulse;
    context.shadowColor = 'rgba(0,220,255,0.9)';
    context.shadowBlur = 30;

    const glow = context.createRadialGradient(cx, cy, 0, cx, cy, w * 0.7);
    glow.addColorStop(0, 'rgba(255,255,255,0.22)');
    glow.addColorStop(0.25, 'rgba(0,220,255,0.18)');
    glow.addColorStop(1, 'rgba(0,120,255,0)');

    context.fillStyle = glow;
    context.beginPath();
    context.ellipse(cx, cy, w * 0.55, h * 1.8, 0, 0, Math.PI * 2);
    context.fill();

    context.shadowBlur = 0;
    context.globalAlpha = this.alpha * 0.85;

    const body = context.createLinearGradient(x, y, x + w, y);
    body.addColorStop(0, 'rgba(0,120,255,0)');
    body.addColorStop(0.18, 'rgba(0,200,255,0.95)');
    body.addColorStop(0.5, 'rgba(255,255,255,0.95)');
    body.addColorStop(0.82, 'rgba(0,200,255,0.95)');
    body.addColorStop(1, 'rgba(0,120,255,0)');

    context.fillStyle = body;
    window.drawRoundedRect(context, x, y, w, h, r);
    context.fill();

    context.globalAlpha = this.alpha * 0.95;
    context.fillStyle = 'rgba(255,255,255,0.9)';
    window.drawRoundedRect(
      context,
      x + w * 0.12,
      y + h * 0.35,
      w * 0.76,
      h * 0.3,
      h * 0.25
    );
    context.fill();

    context.globalAlpha = this.alpha * 0.22 * pulse;
    context.lineWidth = 2;

    for (let i = 0; i < 7; i++) {
      const px = x + (i / 7) * w;
      const waveY = cy + Math.sin(t * 8 + i * 0.9) * (h * 0.25) + wobble;

      context.strokeStyle = 'rgba(120,255,255,1)';
      context.beginPath();
      context.moveTo(px, y);
      context.lineTo(px + Math.sin(t * 10 + i) * 6, waveY);
      context.lineTo(px, y + h);
      context.stroke();
    }

    context.globalAlpha = this.alpha * 0.55 * pulse;
    context.shadowColor = 'rgba(0,220,255,0.95)';
    context.shadowBlur = 16;
    context.strokeStyle = 'rgba(0,220,255,0.85)';
    context.lineWidth = 3;
    window.drawRoundedRect(context, x, y, w, h, r);
    context.stroke();

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

      if (window.checkCollision(this, enemy)) {
        const t = this.hitTimers.get(enemy) ?? this.hitInterval;
        if (t >= this.hitInterval) {
          enemy.lives -= this.damagePerTick;
          this.hitTimers.set(enemy, 0);

          if (enemy.lives <= 0 && !enemy.markedForDeletion) {
            enemy.markedForDeletion = true;
            this.game.score++;

            const px = enemy.x + enemy.width / 2;
            const py = enemy.y + enemy.height / 2;
            this.game.explosions.push(new window.Explosion(this.game, px, py));
          }
        }
      }
    });

    this.game.enemies.forEach((enemy) => {
      if (!enemy.enemyBullets) return;
      enemy.enemyBullets.forEach((bullet) => {
        if (!bullet.markedForDeletion && window.checkCollision(this, bullet)) {
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

window.SuperAttack1 = SuperAttack1;
window.SuperLaser = SuperLaser;
window.SUPER_TYPES = {
  waveShield: { class: SuperAttack1, duration: 500, charge: 5 },
  superLaser: { class: SuperLaser, duration: 4000, charge: 9 },
};
