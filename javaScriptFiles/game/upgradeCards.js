class Upgrades {
  constructor(game) {
    this.game = game;
    this.width = this.game.width * 0.25;
    this.height = this.width * 1.2;
    this.x = this.game.width / 2 - this.width / 2;
    this.y = this.game.height + this.height;
    this.targetY = this.game.height / 2 - this.height / 2;
    this.fontSize = Math.max(14, this.width * 0.12);
    this.fontFamily = '"Archivo Black", system-ui, sans-serif';
    this.color = '#111';
    this.type = 'shield';
    this.opacity = 0;
    this.appearing = true;
    this.removing = false;
    this.scale = 1;
  }

  randomizeType() {
    const rand = Math.random();
    if (rand > 0.9) this.type = 'fasterShooter';
    else if (rand > 0.6) this.type = 'plusHp';
    else if (rand > 0.3) this.type = 'doubleShooter';
    else this.type = 'shield';
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
      case 'doubleShooter':
        line1 = 'Double Shot';
        line2 = '+1 Projectile';
        break;
      case 'plusHp':
        line1 = 'Extra HP';
        line2 = '+1 Life';
        break;
      case 'fasterShooter':
        line1 = 'Faster Fire';
        line2 = '-Rate Boost';
        break;
      case 'petFaster':
        line1 = 'Pet';
        line2 = 'Faster';
        break;
      case 'damageUp':
        line1 = 'Damage Up';
        line2 = '+1 Damage';
        break;
      case 'speedBoost':
        line1 = 'Speed Boost';
        line2 = '+Move Speed';
        break;
      case 'piercingShot':
        line1 = 'Piercing Shot';
        line2 = 'Shots Go Through';
        break;
      case 'superCharge':
        line1 = 'Super Charge';
        line2 = '+Gauge Energy';
        break;
      default:
        line1 = 'Shield';
        line2 = '20s Protection';
        break;
    }

    context.font = `900 ${titleSize}px ${this.fontFamily}`;
    context.fillStyle = 'white';
    context.shadowColor = theme.glow;
    context.shadowBlur = 14;
    context.fillText(line1, this.width / 2, titleY);

    context.shadowBlur = 0;
    context.font = `700 ${subSize}px ${this.fontFamily}`;
    context.fillStyle = 'rgba(255,255,255,0.78)';
    context.fillText(line2, this.width / 2, subY);

    context.restore();
  }

  getTheme() {
    switch (this.type) {
      case 'doubleShooter':
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
      case 'fasterShooter':
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
      case 'damageUp':
        return {
          bgTop: 'rgba(255, 140, 60, 0.20)',
          bgBottom: 'rgba(0, 0, 0, 0.55)',
          border: 'rgba(255, 140, 60, 0.85)',
          glow: 'rgba(255, 140, 60, 0.95)',
          iconBg: 'rgba(255, 140, 60, 0.18)',
          icon: '✹',
        };

      case 'speedBoost':
        return {
          bgTop: 'rgba(80, 255, 120, 0.20)',
          bgBottom: 'rgba(0, 0, 0, 0.55)',
          border: 'rgba(80, 255, 120, 0.85)',
          glow: 'rgba(80, 255, 120, 0.95)',
          iconBg: 'rgba(80, 255, 120, 0.18)',
          icon: '➜',
        };

      case 'piercingShot':
        return {
          bgTop: 'rgba(255, 220, 80, 0.20)',
          bgBottom: 'rgba(0, 0, 0, 0.55)',
          border: 'rgba(255, 220, 80, 0.85)',
          glow: 'rgba(255, 220, 80, 0.95)',
          iconBg: 'rgba(255, 220, 80, 0.18)',
          icon: '☄',
        };

      case 'superCharge':
        return {
          bgTop: 'rgba(80, 220, 255, 0.20)',
          bgBottom: 'rgba(0, 0, 0, 0.55)',
          border: 'rgba(80, 220, 255, 0.85)',
          glow: 'rgba(80, 220, 255, 0.95)',
          iconBg: 'rgba(80, 220, 255, 0.18)',
          icon: '★',
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

function createUpgradeCards(game) {
  game.upgradeCards = [];

  const numberOfCards = 3;
  const cardWidth = game.width * 0.25;
  const spacing = cardWidth * 0.2;
  const totalWidth = numberOfCards * cardWidth + (numberOfCards - 1) * spacing;
  const startX = (game.width - totalWidth) / 2;
  const targetY = game.height / 2 - cardWidth * 0.6;

  const allTypes = [
    'doubleShooter',
    'plusHp',
    'fasterShooter',
    'shield',
    'petFaster',
    'damageUp',
    'speedBoost',
    'piercingShot',
    'superCharge',
  ];

  const selectedTypes = allTypes
    .filter((type) => canOfferUpgrade(game, type))
    .sort(() => 0.5 - Math.random())
    .slice(0, numberOfCards);

  for (let i = 0; i < numberOfCards; i++) {
    const card = new Upgrades(game);
    card.type = selectedTypes[i];
    card.width = cardWidth;
    card.height = card.width * 1.2;
    card.x = startX + i * (cardWidth + spacing);
    card.y = game.height + card.height;
    card.targetY = targetY;
    card.appearing = true;
    card.opacity = 0;
    game.upgradeCards.push(card);
  }
}

function canOfferUpgrade(game, type) {
  switch (type) {
    case 'doubleShooter':
      return !game.player.doubleShot;

    case 'petFaster':
      return !!game.pet;

    case 'plusHp':
      return game.player.lives < 3;

    case 'piercingShot':
      return !game.player.piercingShot;

    default:
      return true;
  }
}

window.Upgrades = Upgrades;
window.createUpgradeCards = createUpgradeCards;
