const ASSETS = [
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

const fillEl = document.getElementById('loadingFill');
const pctEl = document.getElementById('loadingPct');

function setProgress(p) {
  const v = Math.max(0, Math.min(100, Math.round(p)));
  fillEl.style.width = v + '%';
  pctEl.textContent = v + '%';
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ src, ok: true });
    img.onerror = () => resolve({ src, ok: false });
    img.src = src;
  });
}

function loadAudio(src) {
  return new Promise((resolve) => {
    const a = new Audio();
    const done = (ok) => resolve({ src, ok });
    a.addEventListener('canplaythrough', () => done(true), { once: true });
    a.addEventListener('error', () => done(false), { once: true });
    a.preload = 'auto';
    a.src = src;
    a.load();
  });
}

function isAudio(src) {
  return /\.(mp3|wav|ogg|m4a)$/i.test(src);
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
    setProgress((loaded / total) * 100);
  }

  return true;
}

(async () => {
  try {
    await preloadAssets(ASSETS);

    sessionStorage.setItem('passedLoading', '1');

    const root = document.querySelector('.phone-frame');
    if (root) root.classList.add('loadingOut');

    setTimeout(() => {
      window.location.replace('index.html');
    }, 350);
  } catch (e) {
    sessionStorage.setItem('passedLoading', '1');
    window.location.replace('index.html');
  }
})();

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

  return true;
}
