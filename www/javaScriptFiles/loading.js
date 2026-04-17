const params = new URLSearchParams(location.search);
const to = params.get('to')
  ? decodeURIComponent(params.get('to'))
  : 'main.html';

const fillEl = document.getElementById('loadingFill');
const pctEl = document.getElementById('loadingPct');

const MAIN_KNOWN_ASSETS = [
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
  './images/shopAInventoryicons/petsSIcone/ChimpoIcone.png',
  './images/shopAInventoryicons/petsSIcone/sirenIcone.png',
  './images/logosImage/superLogosImage/superLaser.png',
  './images/logosImage/superLogosImage/waveShield.png',
];

const GAME_ASSETS = [
  './images/logo.png',
  './images/game/background/blueSpace.png',

  './images/game/sprites/playerSkins/playerSkin1.png',
  './images/game/sprites/playerSkins/playerRedSkin.png',
  './images/game/sprites/playerSkins/playerDarkReaper.png',
  './images/game/sprites/playerSkins/playerCelestialSakura.png',
  './images/game/sprites/playerSkins/playerGoldenCore.png',
  './images/game/sprites/playerSkins/star_breaker.png',

  './images/game/sprites/missileSprite.png',

  './images/game/sprites/petSprites/chimboSprite.png',
  './images/game/sprites/petSprites/sirenSprite.png',

  './images/game/sprites/enemiesSprites/Angler1Sprite.png',
  './images/game/sprites/enemiesSprites/Angler2Sprite.png',
  './images/game/sprites/enemiesSprites/Angler3Sprite.png',
  './images/game/sprites/enemiesSprites/Angler4Sprite.png',
  './images/game/sprites/enemiesSprites/Angler5Sprite.png',
  './images/game/sprites/enemiesSprites/Angler5miniSprite.png',
  './images/game/sprites/enemiesSprites/Angler6Sprite.png',
  './images/game/sprites/enemiesSprites/Angler6MiniBombSprite.png',
  './images/game/sprites/enemiesSprites/Angler7Sprite.png',
  './images/game/sprites/enemiesSprites/Angler8Sprite.png',
  './images/game/sprites/enemiesSprites/Angler9Sprite.png',
  './images/game/sprites/enemiesSprites/angler10Sprite.png',
  './images/game/sprites/enemiesSprites/Angler11Sprite.png',
  './images/game/sprites/enemiesSprites/Angler12Sprite.png',

  './images/game/sprites/bossesSprites/boss1Sprite.png',
  './images/game/sprites/bossesSprites/boss2Sprite.png',
  './images/game/sprites/bossesSprites/boss3Sprite.png',
  './images/game/sprites/bossesSprites/boss4Sprites/boss4PinkSprite.png',
  './images/game/sprites/bossesSprites/boss4Sprites/boss4GreenSprite.png',
  './images/game/sprites/bossesSprites/boss4Sprites/boss4PurpleSprite.png',
  './images/game/sprites/bossesSprites/boss5Sprite.png',
  './images/game/sprites/bossesSprites/boss6Sprite.png',
  './images/game/sprites/bossesSprites/boss7Sprite.png',
  './images/game/sprites/bossesSprites/Boss8Sprite.png',
  './images/game/sprites/bossesSprites/Boss9Sprite.png',
  './images/game/sprites/bossesSprites/boss10Sprite.png',
  './images/game/sprites/bossesSprites/BossPortalMasterSprite.png',

  './images/game/sprites/bossesBullets/boss2BulletSprite.png',
  './images/game/sprites/smokeExplosion.png',
];

function setProgress(p) {
  const value = Math.max(0, Math.min(100, Math.round(p)));
  if (fillEl) fillEl.style.width = value + '%';
  if (pctEl) pctEl.textContent = value + '%';
}

function isAudio(src) {
  return /\.(mp3|wav|ogg|m4a)$/i.test(src);
}

function isImage(src) {
  return /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(src);
}

function normalizeAssetUrl(src, basePath) {
  if (!src) return '';
  if (/^(data:|blob:|https?:|\/\/)/i.test(src)) return src;

  try {
    return new URL(src, basePath).pathname.replace(/^\//, './');
  } catch {
    return src;
  }
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = async () => {
      try {
        if (img.decode) await img.decode();
      } catch {}

      resolve(true);
    };

    img.onerror = () => resolve(false);
    img.src = src;
  });
}

function loadAudio(src) {
  return new Promise((resolve) => {
    const audio = new Audio();
    const done = (ok) => resolve(ok);

    audio.addEventListener('canplaythrough', () => done(true), { once: true });
    audio.addEventListener('error', () => done(false), { once: true });

    audio.preload = 'auto';
    audio.src = src;
    audio.load();
  });
}

async function collectMainHtmlAssets(pagePath) {
  try {
    const res = await fetch(pagePath, { cache: 'force-cache' });
    if (!res.ok) return [];

    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const basePath = new URL(pagePath, location.href);

    const assets = [];

    doc.querySelectorAll('[src]').forEach((el) => {
      const src = el.getAttribute('src');
      const normalized = normalizeAssetUrl(src, basePath);

      if (normalized && (isImage(normalized) || isAudio(normalized))) {
        assets.push(normalized);
      }
    });

    doc.querySelectorAll('link[href]').forEach((el) => {
      const rel = (el.getAttribute('rel') || '').toLowerCase();
      const href = el.getAttribute('href');
      if (!href) return;
      if (!rel.includes('icon') && !rel.includes('preload')) return;

      const normalized = normalizeAssetUrl(href, basePath);
      if (normalized && isImage(normalized)) {
        assets.push(normalized);
      }
    });

    return assets;
  } catch {
    return [];
  }
}

async function preloadAssets(list, sessionKey) {
  const alreadyLoaded = JSON.parse(sessionStorage.getItem(sessionKey) || '[]');
  const loadedSet = new Set(alreadyLoaded);

  const unique = Array.from(new Set(list))
    .filter(Boolean)
    .filter((src) => !loadedSet.has(src));

  const total = unique.length;

  if (total === 0) {
    setProgress(100);
    return;
  }

  let loaded = 0;
  setProgress(0);

  const chunks = chunkArray(unique, 8);

  for (const group of chunks) {
    await Promise.allSettled(
      group.map(async (src) => {
        if (isAudio(src)) {
          await loadAudio(src);
        } else {
          await loadImage(src);
        }

        loadedSet.add(src);
        loaded++;
        setProgress((loaded / total) * 90);
      })
    );
  }

  sessionStorage.setItem(sessionKey, JSON.stringify([...loadedSet]));

  for (let p = 90; p <= 100; p++) {
    setProgress(p);
    await new Promise((resolve) => setTimeout(resolve, 8));
  }
}

(async () => {
  const PASS_KEY = 'passedLoading:' + to;
  const ASSET_CACHE_KEY = 'preloadedAssets:' + to;

  if (sessionStorage.getItem(PASS_KEY) === '1') {
    location.replace(to);
    return;
  }

  sessionStorage.setItem(PASS_KEY, '1');

  try {
    let assets = [];

    if (to.includes('main.html')) {
      const mainHtmlAssets = await collectMainHtmlAssets('./main.html');
      assets = [...MAIN_KNOWN_ASSETS, ...mainHtmlAssets];
    } else if (to.includes('game.html')) {
      assets = GAME_ASSETS;
    }

    await preloadAssets(assets, ASSET_CACHE_KEY);

    const root = document.querySelector('.phone-frame');
    if (root) root.classList.add('loadingOut');

    setTimeout(() => {
      location.replace(to);
    }, 300);
  } catch {
    location.replace(to);
  }
})();
