// coins x
let coins = Number(localStorage.getItem('coins')) || 50;
const maxCoins = 999999;

document.addEventListener(
  'touchmove',
  (e) => {
    if (e.scale && e.scale !== 1) e.preventDefault();
  },
  { passive: false }
);

let lastTouchEnd = 0;
document.addEventListener(
  'touchend',
  (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  },
  { passive: false }
);

function rerenderLanguageDependentUI() {
  updateEquipUI?.();
  updatePetUI?.();
  updateSuperEquipUI?.();
  updateLevelsMap?.();
  renderInventoryOverview?.();
  shopOnEnter?.();
}

function rerenderLanguageDependentUI(lang) {
  document.documentElement.lang = lang;

  const isRTL = lang === 'he';
  document.body.dir = isRTL ? 'rtl' : 'ltr';
  document.body.style.direction = isRTL ? 'rtl' : 'ltr';

  requestAnimationFrame(() => {
    window.updatePetUI?.();
    window.updateSuperEquipUI?.();
    window.updateLevelsMap?.();
    window.updateEquipUI?.();
    window.renderInventoryOverview?.();

    window.shopRenderFeatured?.();
    window.shopRenderDaily?.();
    window.shopRenderSkinOffers?.();
    window.shopRenderSkins?.();
    window.shopRenderCoins?.();
    window.renderDailyGiftCard?.();
    window.updateDailyGiftUI?.();
    window.updateFeaturedTimer?.();
    window.updateDailyTimer?.();
    window.updateSkinOffersTimer?.();

    window.shopOnEnter?.();
  });
}

const WEAPONS = {
  laser: {
    name: 'Laser',
    price: 'Free',
    img: './images/logosImage/weaponImg/leserIcone.png',
  },
  missile: {
    name: 'Missile',
    price: 500,
    img: './images/logosImage/weaponImg/missileIcone.png',
  },
  triangleShooter: {
    name: 'Triangle Shooter',
    price: 1250,
    img: './images/logosImage/weaponImg/triangleShooter.png',
  },
};

const PETS = {
  dog: {
    name: 'Chimpo',
    price: 300,
    icon: '🐶',
    img: './images/shopAInventoryicons/petsSIcone/ChimpoIcone.png',
    stats: {
      LIVES: 3,
      DAMAGE: 8,
      SHOOT_RATE: 'Every 8s',
    },
    role: 'ATTACK',
    ability: 'Heavy Pulse',
    description:
      'Chimpo is an autonomous companion unit that assists the player in battle.\n\n' +
      'It automatically targets the closest enemy and fires consistently over time. ' +
      'Perfect for early-game support and survivability.',
  },

  siren: {
    name: 'Siren',
    price: 2500,
    icon: '🧠',
    img: './images/shopAInventoryicons/petsSIcone/sirenIcone.png',
    stats: {
      LIVES: 2,
      ABILITY: 'Mind Control',
      EFFECT: 'Let them do the work.',
      RATE: 'Every 9s',
    },
    role: 'ATTACK',
    ability: 'Mass Crash',
    description:
      'Siren does not deal damage directly.\n\n' +
      'It manipulates enemy minds, forcing them to turn against each other.\n' +
      'Extremely effective in crowded waves.',
  },
};

const SUPERS = {
  waveShield: {
    titleKey: 'super.waveShield.title',
    descKey: 'super.waveShield.desc',
    img: './images/logosImage/superLogosImage/waveShield.png',
    price: 0,
    stats: {
      Duration: '6s',
      Cooldown: '20s',
      Reflect: '35%',
    },
  },

  superLaser: {
    titleKey: 'super.superLaser.title',
    descKey: 'super.superLaser.desc',
    img: './images/logosImage/superLogosImage/superLaser.png',
    price: 1500,
    stats: {
      Duration: '5s',
      Damage: '0.5 Per second',
      Pierce: 'Yes',
    },
  },
};

const STORAGE_KEY_OWNED_SUPERS = 'ownedSupers';

function getOwnedSupers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY_OWNED_SUPERS) || '[]');
}

function saveOwnedSupers(arr) {
  localStorage.setItem(STORAGE_KEY_OWNED_SUPERS, JSON.stringify(arr));
}

function isSuperOwned(id) {
  return SUPERS[id]?.price === 0 || getOwnedSupers().includes(id);
}

const STORAGE_KEY_MAX_LEVEL = 'maxUnlockedLevel';

const STORAGE_KEY_SUPER = 'equippedSuper';

const DEFAULT_WEAPON = 'laser';

let equippedWeapon = localStorage.getItem('equippedWeapon') || DEFAULT_WEAPON;

function getEquippedWeapon() {
  return equippedWeapon;
}

function setEquippedWeapon(id) {
  equippedWeapon = id;
  localStorage.setItem('equippedWeapon', id);
}

const DEFAULT_PET = null;

let equippedPet = localStorage.getItem('equippedPet') || DEFAULT_PET;

function setEquippedPet(id) {
  equippedPet = id;
  localStorage.setItem('equippedPet', id ?? '');
}

function getEquippedPet() {
  return equippedPet;
}

if (screen.orientation?.lock) {
  screen.orientation.lock('portrait').catch(() => {});
}

// ---------- UI CLICK SOUND ----------
const uiClickSound = new Audio(
  './sounds/backgroundSoundEffect/buttonClick.wav'
);
uiClickSound.preload = 'auto';

uiClickSound.addEventListener('canplaythrough', () => {});
uiClickSound.addEventListener('error', () => {});

let audioUnlocked = false;

document.addEventListener(
  'pointerdown',
  (e) => {
    if (audioUnlocked) return;

    e.stopImmediatePropagation();

    uiClickSound.volume = 0;

    uiClickSound
      .play()
      .then(() => {
        uiClickSound.pause();
        uiClickSound.currentTime = 0;
        audioUnlocked = true;
      })
      .catch((err) => {
        console.warn('Unlock failed:', err);
        audioUnlocked = false;
      });
  },
  { capture: true }
);

const equipSound = new Audio(
  './sounds/backgroundSoundEffect/selectWeaponClick.mp3'
);
equipSound.preload = 'auto';

function playEquipSound() {
  if (localStorage.getItem('audio') === 'off') return;

  const volume = Number(localStorage.getItem('audioVolume') ?? 80);
  equipSound.volume = volume / 100;

  equipSound.currentTime = 0.15;
  equipSound.play().catch(console.warn);
}

function playUIClick() {
  if (localStorage.getItem('audio') === 'off') return;

  const volume = Number(localStorage.getItem('audioVolume') ?? 80);
  uiClickSound.volume = volume / 100;

  uiClickSound.currentTime = 0;
  uiClickSound.play().catch(console.warn);
}

document.addEventListener('pointerdown', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  if (!audioUnlocked) return;

  const s = btn.dataset.sound;

  if (s === 'equip') {
    playEquipSound();
    return;
  }

  if (s === 'map') {
    playMapClick();
    return;
  }

  if (s) {
    playUIClick();
    return;
  }

  playUIClick();
});

// ---------- MAP BUTTON SOUND ----------
const mapClickSound = new Audio('./sounds/backgroundSoundEffect/mapClick.wav');
mapClickSound.preload = 'auto';

mapClickSound.addEventListener('canplaythrough', () => {
  console.log('🗺️ MAP click sound loaded');
});

function playMapClick() {
  if (localStorage.getItem('audio') === 'off') return;

  const volume = Number(localStorage.getItem('audioVolume') ?? 80);
  mapClickSound.volume = volume / 100;

  mapClickSound.currentTime = 0;
  mapClickSound.play().catch(console.warn);
}
function openBuyWeapon(id) {
  const weapon = WEAPONS[id];
  if (!weapon) return;

  selectedWeaponId = id;

  const lang = getLang();

  const popup = document.getElementById('buyWeaponPopup');
  const buyBtn = document.getElementById('buyConfirmBtn');

  document.getElementById('buyWeaponName').textContent = weapon.name;
  document.getElementById('buyWeaponImg').src = weapon.img;

  const owned = id === DEFAULT_WEAPON || isWeaponOwned(id);

  document.getElementById('buyWeaponPrice').textContent = owned
    ? id === DEFAULT_WEAPON
      ? t(lang, 'ui.free')
      : t(lang, 'ui.owned')
    : String(weapon.price);

  if (owned) {
    const equipped = getEquippedWeapon() === id;

    buyBtn.textContent = equipped
      ? t(lang, 'ui.equipped')
      : t(lang, 'ui.equip');
    buyBtn.disabled = equipped;
    buyBtn.className = equipped ? 'owned' : '';
  } else {
    buyBtn.textContent = t(lang, 'ui.buy');
    buyBtn.disabled = false;
    buyBtn.className = '';
  }

  popup.classList.add('open');
}

function updateEquipUI() {
  const lang = getLang();

  document.querySelectorAll('.weaponItem').forEach((item) => {
    const id = item.dataset.weapon;
    const btn = item.querySelector('.equipBtn');
    if (!btn) return;

    if (id !== DEFAULT_WEAPON && !isWeaponOwned(id)) {
      btn.textContent = t(lang, 'ui.locked');
      btn.disabled = true;
      btn.classList.add('locked');
      btn.classList.remove('equipped');
      return;
    }

    if (id === getEquippedWeapon()) {
      btn.textContent = t(lang, 'ui.equipped');
      btn.disabled = true;
      btn.classList.add('equipped');
      btn.classList.remove('locked');
      return;
    }

    btn.textContent = t(lang, 'ui.equip');
    btn.disabled = false;
    btn.classList.remove('equipped', 'locked');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadCoins?.();

  const savedLang = getLang();
  applyLanguage(savedLang);
});

// לקרוא פעם אחת בטעינה
updateEquipUI();

function equipWeapon(id) {
  if (id !== DEFAULT_WEAPON && !isWeaponOwned(id)) return;

  // אם כבר מצויד – לא לנגן שוב
  if (getEquippedWeapon() === id) return;

  playEquipSound(); // 🔊 עכשיו זה יעבוד בוודאות

  setEquippedWeapon(id);
  updateEquipUI();
}

function equipWeaponFromInventory(id) {
  if (!isWeaponOwned(id)) return;
  if (getEquippedWeapon() === id) return;

  playEquipSound();
  setEquippedWeapon(id);

  updateEquipUI();
  openInv('weapons');
}

const UI = {
  profile: () => document.getElementById('profileSettingsDiv'),
  profileBtn: () => document.getElementById('profileSettingsBtn'),
  weapon: () => document.getElementById('weaponDiv'),
  overlay: () => document.getElementById('overlay'),
  map: () => document.getElementById('mapDiv'),
};

// ---------- CLOSE ALL ----------
function closeAll() {
  UI.profile()?.classList.remove('show', 'open');
  UI.weapon()?.classList.remove('open');
  UI.overlay()?.classList.remove('show');
  document.getElementById('settingsDiv')?.classList.remove('open');
  document.getElementById('socialDiv')?.classList.remove('open');

  document.getElementById('superShopDiv')?.classList.remove('open');
  document.getElementById('buySuperConfirm')?.classList.remove('open');
  document.querySelector('.superInfoDiv')?.classList.remove('open');

  const map = UI.map();
  if (map?.classList.contains('open')) {
    map.classList.remove('open');
    map.classList.add('closing');
    setTimeout(() => map.classList.remove('closing'), 400);
  }
}
// ---------- PROFILE ----------
function openProfileDiv(e) {
  e.stopPropagation();

  const profile = UI.profile();
  if (!profile) return;

  const isOpen = profile.classList.contains('open');
  closeAll();

  if (!isOpen) {
    profile.classList.add('show', 'open');
  }
}

// ---------- WEAPON ----------
function closeBuyWeapon() {
  document.getElementById('buyWeaponPopup').classList.remove('open');
}

function goToLoadoutHighlightWeapon(weaponId) {
  sessionStorage.setItem('weaponLoadoutHighlight', weaponId);
  openWeaponDiv();
}

window.openWeaponDiv = function (e) {
  if (e) e.stopPropagation();
  closeAll();
  UI.weapon()?.classList.add('open');
  UI.overlay()?.classList.add('show');

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      highlightWeaponInLoadout();
    });
  });
};

window.closeWeaponDiv = function (e) {
  if (e) e.stopPropagation();
  closeBuyWeapon();

  UI.weapon()?.classList.remove('open');

  document.getElementById('overlay')?.classList.remove('show');
};

// ---------- MAP ----------
function openMap(e) {
  e.stopPropagation();
  playMapClick();
  closeAll();

  const map = UI.map();
  const levels = document.getElementById('levelsContainer');

  map.classList.add('open');

  setTimeout(() => {
    updateLevelsMap();

    const currentNode = levels.querySelector('.levelNode.current-node');
    if (!currentNode) return;

    const target = currentNode.offsetTop - levels.clientHeight * 0.35;

    const maxScroll = levels.scrollHeight - levels.clientHeight;
    const safeTop = Math.max(0, Math.min(target, maxScroll));

    levels.scrollTo({
      top: safeTop,
      behavior: 'smooth',
    });
  }, 450);
}

function closeMap(e) {
  e?.stopPropagation();
  const map = UI.map();
  if (!map) return;

  map.classList.remove('open');
  map.classList.add('closing');
  setTimeout(() => map.classList.remove('closing'), 400);
}

// ---------- GLOBAL CLICK ----------
document.addEventListener('click', (e) => {
  if (
    UI.profile()?.contains(e.target) ||
    UI.profileBtn()?.contains(e.target) ||
    UI.weapon()?.contains(e.target) ||
    UI.overlay()?.contains(e.target) ||
    e.target.closest('.InventoryBtn') ||
    e.target.closest('#startGameBtn') ||
    e.target.closest('#settingsDiv') ||
    e.target.closest('#settingsBtn')
  ) {
    return;
  }

  closeAll();
});

function playStartGameAnimation() {
  const btn = document.getElementById('startGameBtn');
  if (!btn) return;

  if (btn.classList.contains('pressed')) return;

  btn.classList.remove('pressed');
  void btn.offsetWidth;

  btn.classList.add('pressed');

  setTimeout(() => {
    btn.classList.remove('pressed');
  }, 600);
}

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startGameBtn');
  if (!startBtn) return;

  startBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    playStartGameAnimation();
  });

  startBtn.addEventListener('pointerup', (e) => {
    e.stopPropagation();
    openMap(e);
  });
  const shopBtn = document.querySelector('[data-target="shopScreen"]');

  if (shopBtn) {
    shopBtn.addEventListener('click', () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (typeof shopOnEnter === 'function') {
            shopOnEnter();
          }
        });
      });
    });
  }
});

// ---------- PAGE SWITCH ----------
document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.bottomButton[data-target]');
  const pages = document.querySelectorAll('.page');

  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      pages.forEach((p) => p.classList.remove('active'));
      document.getElementById(btn.dataset.target)?.classList.add('active');
    });
  });
});

// ---------- INVENTORY CLICK FX ----------
document.querySelectorAll('.inventoryItem').forEach((item) => {
  item.addEventListener('pointerdown', () =>
    item.classList.add('active-click')
  );
  item.addEventListener('pointerup', () =>
    item.classList.remove('active-click')
  );
});
// ---------- SETTINGS ----------
const settingsBtn = document.getElementById('settingsBtn');
const settingsDiv = document.getElementById('settingsDiv');

const musicToggle = document.getElementById('musicToggle');
const audioToggle = document.getElementById('audioToggle');

settingsDiv.addEventListener('click', (e) => {
  e.stopPropagation();
});

function loadSettings() {
  musicToggle.checked = localStorage.getItem('music') !== 'off';
  audioToggle.checked = localStorage.getItem('audio') !== 'off';
}

loadSettings();
musicToggle.addEventListener('change', () => {
  if (!musicToggle.checked) {
    lastMusicVolume = Number(musicVolume.value) || 70;

    music.pause();
    music.volume = 0;

    musicVolume.value = 0;
    localStorage.setItem('musicVolume', 0);
    localStorage.setItem('music', 'off');
  } else {
    const restore = lastMusicVolume || 70;

    music.volume = restore / 100;
    music.play().catch(() => {});

    musicVolume.value = restore;
    localStorage.setItem('musicVolume', restore);
    localStorage.setItem('music', 'on');
  }
});

audioToggle.addEventListener('change', () => {
  if (!audioToggle.checked) {
    lastAudioVolume = Number(audioVolume.value) || lastAudioVolume || 80;
    audioVolume.value = 0;
    localStorage.setItem('audioVolume', 0);
    localStorage.setItem('audio', 'off');
  } else {
    const restore = lastAudioVolume || 80;
    audioVolume.value = restore;
    localStorage.setItem('audioVolume', restore);
    localStorage.setItem('audio', 'on');
  }
});

settingsBtn.addEventListener('click', (e) => {
  e.stopPropagation();

  settingsBtn.classList.remove('spin');
  void settingsBtn.offsetWidth;
  settingsBtn.classList.add('spin');

  const opened = settingsDiv.classList.contains('open');
  closeAll();

  if (!opened) {
    settingsDiv.classList.add('open');
  }
});

//music

const music = new Audio('../sounds/backgroundMusics/homeScreen.mp3');
music.preload = 'auto';
music.loop = false;
music.volume = 0.5;

const LOOP_START = 1;
const LOOP_END = 10;

document.addEventListener(
  'pointerdown',
  () => {
    if (localStorage.getItem('music') === 'off') return;

    music.currentTime = LOOP_START;
    music.play().catch(() => {});
  },
  { once: true }
);

music.addEventListener('timeupdate', () => {
  if (music.currentTime >= LOOP_END - 0.05) {
    music.currentTime = LOOP_START;
  }
});

const musicVolume = document.getElementById('musicVolume');
const audioVolume = document.getElementById('audioVolume');

function loadVolumes() {
  const musicVal = Number(localStorage.getItem('musicVolume') ?? 70);
  const audioVal = Number(localStorage.getItem('audioVolume') ?? 80);

  musicVolume.value = musicVal;
  audioVolume.value = audioVal;

  music.volume = musicVal / 100;

  if (!musicToggle.checked) {
    music.pause();
  }
}

loadVolumes();

musicVolume.addEventListener('input', () => {
  const value = Number(musicVolume.value);

  localStorage.setItem('musicVolume', value);
  music.volume = value / 100;

  if (value === 0) {
    musicToggle.checked = false;
    localStorage.setItem('music', 'off');
    music.pause();
  } else {
    musicToggle.checked = true;
    localStorage.setItem('music', 'on');
    if (music.paused) {
      music.play().catch(() => {});
    }
  }
});

audioVolume.addEventListener('input', () => {
  const value = Number(audioVolume.value);
  localStorage.setItem('audioVolume', value);

  if (value === 0) {
    audioToggle.checked = false;
    localStorage.setItem('audio', 'off');
    console.log('🔕 Audio muted');
  } else {
    audioToggle.checked = true;
    localStorage.setItem('audio', 'on');
    console.log('🔊 Audio volume:', value);
  }
});

// ---------- LEVEL NAV ----------
function goToLevel(level) {
  const maxUnlocked = getMaxUnlockedLevel();

  if (level > maxUnlocked) {
    showLockedLevel(level);
    return;
  }

  const target = `game.html?level=${level}`;
  location.href = `index.html?to=${encodeURIComponent(target)}`;
}

// ---------- COINS ----------
function saveCoins() {
  localStorage.setItem('coins', String(coins));
}

function loadCoins() {
  const raw = localStorage.getItem('coins');
  const n = raw === null ? 50 : Number(raw);
  coins = Number.isFinite(n) ? n : 50;

  localStorage.setItem('coins', String(coins));
  updateCoinsUI();
}

function updateCoinsUI() {
  document.getElementById('coinsText').textContent = coins;
}

function grantCoins(amount) {
  coins = getCoins() + amount;
  saveCoins();
  updateCoinsUI();
  flashCoins();
}

function flashCoins() {
  const el = document.getElementById('coinsText');
  el.classList.add('coin-flash');
  setTimeout(() => el.classList.remove('coin-flash'), 600);
}

// ---------- OWNED WEAPONS ----------
function getOwnedWeapons() {
  return JSON.parse(localStorage.getItem('ownedWeapons') || '[]');
}

function saveOwnedWeapons(arr) {
  localStorage.setItem('ownedWeapons', JSON.stringify(arr));
}

function isWeaponOwned(id) {
  if (id === DEFAULT_WEAPON) return true;
  return getOwnedWeapons().includes(id);
}

// ---------- BUY POPUP ----------
let selectedWeaponId = null;

document.getElementById('buyCancelBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  closeBuyWeapon();
});

function closeBuyWeapon() {
  document.getElementById('buyWeaponPopup')?.classList.remove('open');
}

// ---------- BUY WEAPON ----------
document.getElementById('buyConfirmBtn').addEventListener('click', () => {
  const weapon = WEAPONS[selectedWeaponId];
  if (!weapon) return;

  const owned = getOwnedWeapons();
  if (owned.includes(selectedWeaponId)) return;

  if (coins < weapon.price) {
    showToast(t(getLang(), 'toast.noCoins'), 'error');
    return;
  }

  coins -= weapon.price;
  saveCoins();
  updateCoinsUI();

  owned.push(selectedWeaponId);
  saveOwnedWeapons(owned);

  document.getElementById('buyWeaponPopup')?.classList.remove('open');

  showToast(`You bought ${weapon.name}!`, 'success');

  renderInventoryOverview();
  updateEquipUI();
});

const overlay = document.getElementById('comingSoonOverlay');
const text = document.getElementById('comingSoonText');

function showComingSoon() {
  overlay.classList.remove('show');
  text.classList.remove('show');

  void text.offsetWidth;

  overlay.classList.add('show');
  text.classList.add('show');

  clearTimeout(showComingSoon.timer);
  showComingSoon.timer = setTimeout(() => {
    overlay.classList.remove('show');
    text.classList.remove('show');
  }, 1100);
}

document.addEventListener('click', (e) => {
  if (e.target.closest('.closePetShopBtn')) {
    e.stopPropagation();
    closePetShop();
  }
});

function closePetShop() {
  document.getElementById('petShoopDiv')?.classList.add('hidden');
}

document.querySelectorAll('.upgradeWeapon.locked').forEach((btn) => {
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    showComingSoon();
  });
});

document.addEventListener('DOMContentLoaded', () => {
  loadCoins();
  const savedLang = localStorage.getItem('language') || 'en';
});

function openPetShop() {
  document.getElementById('petShoopDiv')?.classList.remove('hidden');
}

function getOwnedPets() {
  return JSON.parse(localStorage.getItem('ownedPets') || '[]');
}

function saveOwnedPets(pets) {
  localStorage.setItem('ownedPets', JSON.stringify(pets));
}

function isPetOwned(id) {
  return getOwnedPets().includes(id);
}

function buyPet(id) {
  const pet = PETS[id];
  if (!pet) return;

  const lang = getLang();

  if (isPetOwned(id)) {
    showToast(t(lang, 'toast.alreadyOwned'), 'error');
    return;
  }

  if (coins < pet.price) {
    showToast(t(lang, 'toast.noCoins'), 'error');
    return;
  }

  coins -= pet.price;
  saveCoins();
  updateCoinsUI();

  const owned = getOwnedPets();
  owned.push(id);
  saveOwnedPets(owned);

  setEquippedPet(id);
  updatePetUI();

  showToast(`You bought ${pet.name}!`, 'success');

  const card = document.querySelector(`.petCard[data-pet="${id}"]`);
  if (card) {
    card.classList.add('purchasedFx');
    setTimeout(() => card.classList.remove('purchasedFx'), 600);
  }
}

function updatePetUI() {
  const lang = getLang();

  document.querySelectorAll('.petCard').forEach((card) => {
    const id = card.dataset.pet;
    const btn = card.querySelector('.petBuyBtn');
    const price = card.querySelector('.petPrice');

    if (!isPetOwned(id)) {
      btn.textContent = t(lang, 'ui.buy');
      btn.className = 'petBuyBtn';
      btn.onclick = () => buyPet(id);
      price.textContent = `${PETS[id].price} 🪙`;
      return;
    }

    price.textContent = '';

    if (getEquippedPet() === id) {
      btn.textContent = t(lang, 'pets.unequip');
      btn.className = 'petBuyBtn equipped';
    } else {
      btn.textContent = t(lang, 'pets.equip');
      btn.className = 'petBuyBtn';
    }

    btn.onclick = () => toggleEquipPet(id);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updatePetUI();
});

function equipPet(id) {
  if (!isPetOwned(id)) return;

  setEquippedPet(id);
  updatePetUI();

  console.log('🐾 Equipped pet:', id);
}

function toggleEquipPet(id) {
  if (!isPetOwned(id)) return;

  if (getEquippedPet() === id) {
    setEquippedPet(null);
  } else {
    setEquippedPet(id);
  }

  updatePetUI();
}

document.querySelectorAll('.petCard').forEach((card) => {
  card.addEventListener('click', () => {
    const petKey = card.dataset.pet;
    openPetInfo(petKey);
  });
});

document.querySelectorAll('.petBuyBtn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('Equip clicked');
  });
});

function closePetInfo() {
  document.getElementById('petInfoOverlay')?.classList.add('hidden');
}

document.getElementById('closePetInfo')?.addEventListener('click', (e) => {
  e.stopPropagation();
  closePetInfo();
});

document.getElementById('petInfoOverlay')?.addEventListener('click', (e) => {
  if (e.target.id === 'petInfoOverlay') {
    closePetInfo();
  }
});

function openPetInfo(petKey) {
  const pet = PETS[petKey];
  if (!pet) return;

  const lang = getLang();

  document.getElementById('petInfoTitle').textContent = t(lang, 'pets.info', {
    name: pet.name,
  });

  document.getElementById('petInfoDesc').textContent = t(
    lang,
    `pets.${petKey}.short`,
    {}
  );

  const statsUl = document.getElementById('petInfoStats');
  statsUl.innerHTML = '';

  Object.entries(pet.stats).forEach(([label, value]) => {
    addPetStat(label, value);
  });

  document.getElementById('petInfoLongDesc').textContent = t(
    lang,
    `pets.${petKey}.long`,
    {}
  );

  document.getElementById('petInfoOverlay').classList.remove('hidden');

  document.getElementById('petInfoTitle').textContent = t(
    getLang(),
    'pets.info',
    {
      name: pet.name,
    }
  );
}

function addPetStat(label, value) {
  const lang = getLang();

  const li = document.createElement('li');

  const spanLabel = document.createElement('span');
  spanLabel.className = 'statLabel';
  spanLabel.textContent = t(lang, `pets.stat.${label}`);

  const spanValue = document.createElement('span');
  spanValue.className = 'statValue';
  spanValue.textContent = value;

  li.appendChild(spanLabel);
  li.appendChild(spanValue);

  document.getElementById('petInfoStats').appendChild(li);
}

function toggleSuperShop(e) {
  e.stopPropagation();
  closeAll();
  document.getElementById('superShopDiv')?.classList.add('open');
  updateSuperEquipUI();
}

function closeSuperShop() {
  document.getElementById('superShopDiv')?.classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.closeBtnsDiv')?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeSuperShop();
  });
});

document.addEventListener('click', (e) => {
  const superShop = document.getElementById('superShopDiv');
  if (!superShop || !superShop.classList.contains('open')) return;

  if (superShop.contains(e.target)) return;

  superShop.classList.remove('open');
});
document.addEventListener('DOMContentLoaded', () => {
  const superInfoDiv = document.querySelector('.superInfoDiv');
  const titleEl = document.getElementById('superInfoTitle');
  const descEl = document.getElementById('superInfoDesc');
  const statsEl = document.getElementById('superStats');

  initLanguageUI();
  updateEquipUI();

  document.querySelectorAll('.selectSuperBtn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();

      const card = btn.closest('.superCard');
      if (!card) return;

      const key = card.dataset.super;
      if (!key) return;

      const data = SUPERS[key];
      if (!data) return;

      const lang = getLang();

      titleEl.textContent = t(lang, data.titleKey);
      descEl.textContent = t(lang, data.descKey);

      statsEl.innerHTML = '';

      Object.entries(data.stats).forEach(([label, value]) => {
        const row = document.createElement('div');
        row.className = 'statRow';

        row.innerHTML = `
    <span class="statLabel">${t(lang, `super.stat.${label}`)}</span>
    <span class="statValue">${value}</span>
  `;

        statsEl.appendChild(row);
      });

      superInfoDiv.classList.add('open');
    });
  });

  superInfoDiv.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  const box = document.getElementById('buySuperConfirm');
  if (!box) return;

  box.querySelector('.buyCancelBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeBuySuperConfirm();
  });

  box.querySelector('.confirmBox')?.addEventListener('click', (e) => {
    e.stopPropagation();
    confirmBuySuper();
  });

  box.addEventListener('click', (e) => {
    if (e.target === box) closeBuySuperConfirm();
  });

  const key = 'equippedSuper';

  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, 'waveShield');
  }

  ensureEquippedSuper();
});

function closeSuperInfo() {
  const superInfoDiv = document.querySelector('.superInfoDiv');
  if (!superInfoDiv) return;

  superInfoDiv.classList.remove('open');
}

function getEquippedSuper() {
  return localStorage.getItem(STORAGE_KEY_SUPER);
}

function ensureEquippedSuper() {
  const equipped = getEquippedSuper();

  if (equipped && SUPERS[equipped]) return;

  setEquippedSuper('waveShield');
}

function setEquippedSuper(id) {
  localStorage.setItem(STORAGE_KEY_SUPER, id);
}

function updateSuperEquipUI() {
  ensureEquippedSuper();

  const lang = getLang();
  const equipped = getEquippedSuper();

  document.querySelectorAll('.superCard').forEach((card) => {
    const id = card.dataset.super;
    const btn = card.querySelector('.superEquipBtn');
    if (!btn || !SUPERS[id]) return;

    const label = btn.querySelector('.label');
    btn.onclick = null;

    if (!isSuperOwned(id)) {
      label.textContent = `${t(lang, 'ui.buy')} (${SUPERS[id].price} 🪙)`;
      btn.className = 'superEquipBtn buy';
      btn.disabled = false;

      btn.onclick = (e) => {
        e.stopPropagation();
        openBuySuperConfirm(id);
      };
      return;
    }

    if (equipped === id) {
      label.textContent = t(lang, 'ui.equipped');
      btn.className = 'superEquipBtn equipped';
      btn.disabled = true;
      return;
    }

    label.textContent = t(lang, 'ui.equip');
    btn.className = 'superEquipBtn';
    btn.disabled = false;

    btn.onclick = (e) => {
      e.stopPropagation();
      equipSuper(id);
    };
  });
}

function buySuper(id) {
  const superData = SUPERS[id];
  if (!superData) return;

  if (coins < superData.price) {
    showToast('Not enough coins!', 'error');
    return;
  }

  coins -= superData.price;
  saveCoins();
  updateCoinsUI();

  const owned = getOwnedSupers();
  owned.push(id);
  saveOwnedSupers(owned);

  playEquipSound();
  showToast(`${superData.title} purchased!`, 'success');

  updateSuperEquipUI();
}

function equipSuper(id) {
  if (getEquippedSuper() === id) return;

  setEquippedSuper(id);
  updateSuperEquipUI();
}

let pendingSuperBuy = null;

function openBuySuperConfirm(id) {
  pendingSuperBuy = id;
  document.getElementById('buySuperConfirm')?.classList.add('open');
}

function confirmBuySuper() {
  coins = Number(localStorage.getItem('coins')) || 0;

  if (!pendingSuperBuy) return;

  const data = SUPERS[pendingSuperBuy];
  if (!data) return;

  if (coins < data.price) {
    showToast('Not enough coins!', 'error');
    return;
  }

  coins -= data.price;
  saveCoins();
  updateCoinsUI();

  const owned = getOwnedSupers();
  owned.push(pendingSuperBuy);
  saveOwnedSupers(owned);

  showToast(`${data.title} unlocked!`, 'success');
  playEquipSound();

  pendingSuperBuy = null;
  closeBuySuperConfirm();
  updateSuperEquipUI();
  ensureEquippedSuper();
}

function closeBuySuperConfirm() {
  pendingSuperBuy = null;
  document.getElementById('buySuperConfirm')?.classList.remove('open');
}

function closeBuySuperConfirm() {
  pendingSuperBuy = null;
  document.getElementById('buySuperConfirm')?.classList.remove('open');
}
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast show ${type}`;

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 1600);
}

document.addEventListener('DOMContentLoaded', () => {
  updateSuperEquipUI();
});

function getMaxUnlockedLevel() {
  return Number(localStorage.getItem(STORAGE_KEY_MAX_LEVEL)) || 1;
}

function unlockNextLevel(currentLevel) {
  const maxLevel = getMaxUnlockedLevel();

  if (currentLevel >= maxLevel) {
    localStorage.setItem(STORAGE_KEY_MAX_LEVEL, currentLevel + 1);
  }
}

function showLockedLevel(level) {
  playUIClick();

  alert(`🔒 Level ${level} is locked!\nComplete previous levels first.`);
}

function updateLevelsMap() {
  const maxLevel = getMaxUnlockedLevel();

  document.querySelectorAll('.levelNode').forEach((node) => {
    const btn = node.querySelector('.levelsBtn');
    const level = Number(btn.textContent);

    if (level > maxLevel) {
      node.classList.add('locked');
      btn.classList.remove('current');
    } else if (level === maxLevel) {
      node.classList.remove('locked');
      btn.classList.add('current');
    } else {
      node.classList.remove('locked');
      btn.classList.remove('current');
    }

    if (level === maxLevel) {
      node.classList.remove('locked');
      node.classList.add('current-node');
      btn.classList.add('current');
    } else {
      node.classList.remove('current-node');
      btn.classList.remove('current');
    }
  });
}

function toggleSocial(e) {
  e.stopPropagation();

  const socialDiv = document.getElementById('socialDiv');
  if (!socialDiv) return;

  const isOpen = socialDiv.classList.contains('open');

  closeAll();

  if (!isOpen) {
    socialDiv.classList.add('open');
  }
}

function enterFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen();
}

function highlightPetInShop() {
  const raw = sessionStorage.getItem('petShopHighlight');
  if (!raw) return;

  const key = String(raw);
  const card = document.querySelector(`.petCard[data-pet="${key}"]`);
  if (!card) return;

  document.querySelectorAll('.petCard.petHighlight').forEach((x) => {
    x.classList.remove('petHighlight');
  });

  card.classList.add('petHighlight');
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });

  setTimeout(() => card.classList.remove('petHighlight'), 1800);

  sessionStorage.removeItem('petShopHighlight');
}

function highlightWeaponInLoadout() {
  const id = sessionStorage.getItem('weaponLoadoutHighlight');
  if (!id) return;

  const list = document.getElementById('weaponDiv');
  const item = document.querySelector(`.weaponItem[data-weapon="${id}"]`);

  if (!list || !item) {
    sessionStorage.removeItem('weaponLoadoutHighlight');
    return;
  }

  document
    .querySelectorAll('.weaponItem.weaponHighlight')
    .forEach((x) => x.classList.remove('weaponHighlight'));

  const iconBtn = item.querySelector('.upgradeWeapon');
  if (!iconBtn) return;

  document
    .querySelectorAll('.upgradeWeapon.weaponHighlight')
    .forEach((x) => x.classList.remove('weaponHighlight'));

  iconBtn.classList.add('weaponHighlight');

  const itemTop = item.offsetTop;
  const targetTop = itemTop - list.clientHeight / 2 + item.clientHeight / 2;

  list.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });

  setTimeout(() => item.classList.remove('weaponHighlight'), 1100);
  sessionStorage.removeItem('weaponLoadoutHighlight');
}
