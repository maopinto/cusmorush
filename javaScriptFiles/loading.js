const params = new URLSearchParams(location.search);
const to = params.get('to')
  ? decodeURIComponent(params.get('to'))
  : 'main.html';

const HOME_ASSETS = [
  './images/logo.png',
  './images/backgroundImages/homePage.png',
  './images/backgroundImages/centerIconeImage.png',
  './images/logosImage/weaponlogo.png',
  './images/logosImage/petIcone.png',
  './images/logosImage/superIcone.png',
  './images/logosImage/upgreatIcone.png',
  './images/logosImage/socialLogos/discordLogo.png',
  './images/logosImage/socialLogos/youtubeLogo.png',
  './images/logosImage/socialLogos/instagramLogo.png',
  './images/logosImage/socialLogos/tiktokLogo.png',
  './images/logosImage/weaponImg/leserIcone.png',
  './images/logosImage/weaponImg/missileIcone.png',
  './images/logosImage/weaponImg/triangleShooter.png',
  './images/logosImage/weaponImg/lockIcone.png',
];

const GAME_ASSETS = [
  './images/logo.png',
  './images/game/background/blueSpace.png',
  './images/game/sprites/smokeExplosion.png',
  './images/game/sprites/playerSkins/playerSkin1.png',
  './images/game/sprites/playerSkins/playerRedSkin.png',
  './images/game/sprites/missileSprite.png',
  './images/game/sprites/petSprites/chimboSprite.png',
  './images/game/sprites/petSprites/SirenSPrite.png',
];

const ASSETS = [
  ...HOME_ASSETS,
  ...(to.includes('game.html') ? GAME_ASSETS : []),
];

const fillEl = document.getElementById('loadingFill');
const pctEl = document.getElementById('loadingPct');

function setProgress(p) {
  const v = Math.max(0, Math.min(100, Math.round(p)));
  if (fillEl) fillEl.style.width = v + '%';
  if (pctEl) pctEl.textContent = v + '%';
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

function isAudio(src) {
  return /\.(mp3|wav|ogg|m4a)$/i.test(src);
}

function loadAudio(src) {
  return new Promise((resolve) => {
    const a = new Audio();
    const done = (ok) => resolve(ok);
    a.addEventListener('canplaythrough', () => done(true), { once: true });
    a.addEventListener('error', () => done(false), { once: true });
    a.preload = 'auto';
    a.src = src;
    a.load();
  });
}

async function preloadAssets(list) {
  const unique = Array.from(new Set(list)).filter(Boolean);
  const total = unique.length || 1;
  let loaded = 0;

  setProgress(0);

  for (const src of unique) {
    if (isAudio(src)) await loadAudio(src);
    else await loadImage(src);

    loaded++;
    setProgress((loaded / total) * 90);
  }

  for (let p = 90; p <= 100; p++) {
    setProgress(p);
    await new Promise((r) => setTimeout(r, 12));
  }
}

(async () => {
  const KEY = 'passedLoading:' + to;

  if (sessionStorage.getItem(KEY) === '1') {
    location.replace(to);
    return;
  }

  sessionStorage.setItem(KEY, '1');

  try {
    await preloadAssets(ASSETS);

    const root = document.querySelector('.phone-frame');
    if (root) root.classList.add('loadingOut');

    setTimeout(() => {
      location.replace(to);
    }, 350);
  } catch (e) {
    location.replace(to);
  }
})();
