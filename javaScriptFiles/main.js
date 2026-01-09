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

const TRANSLATIONS = {
  en: {
    settings: 'Settings',
    music: 'Music',
    audio: 'Audio',
    language: 'Language',
  },

  he: {
    settings: 'הגדרות',
    music: 'מוזיקה',
    audio: 'צלילים',
    language: 'שפה',
  },

  es: {
    settings: 'Ajustes',
    music: 'Música',
    audio: 'Audio',
    language: 'Idioma',
  },
};

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
    stats: {
      LIVES: 3,
      DAMAGE: 8,
      SHOOT_RATE: 'Every 8s',
    },
    description:
      'Chimpo is an autonomous companion unit that assists the player in battle.\n\n' +
      'It automatically targets the closest enemy and fires consistently over time. ' +
      'Perfect for early-game support and survivability.',
  },

  siren: {
    name: 'Siren',
    price: 2500,
    icon: '🧠',
    stats: {
      LIVES: 2,
      ABILITY: 'Mind Control',
      EFFECT: 'Forces enemies to attack each other',
      RATE: 'Every 9s',
    },
    description:
      'Siren does not deal damage directly.\n\n' +
      'It manipulates enemy minds, forcing them to turn against each other.\n' +
      'Extremely effective in crowded waves.',
  },
};

const SUPERS = {
  waveShield: {
    title: 'WAVE SHIELD',
    price: 0,
    description:
      'Generates a powerful energy wave that blocks incoming damage and reflects part of it back to enemies.',
    stats: {
      Duration: '6s',
      Cooldown: '20s',
      Reflect: '35%',
    },
  },

  superLaser: {
    title: 'SUPER LASER',
    price: 1500,
    description:
      'Channels a long-range laser beam that deals high damage over time.',
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

  const popup = document.getElementById('buyWeaponPopup');
  const buyBtn = document.getElementById('buyConfirmBtn');

  document.getElementById('buyWeaponName').textContent = weapon.name;
  document.getElementById('buyWeaponImg').src = weapon.img;

  // ---------- DEFAULT WEAPON ----------
  if (id === DEFAULT_WEAPON || isWeaponOwned(id)) {
    document.getElementById('buyWeaponPrice').textContent =
      id === DEFAULT_WEAPON ? 'FREE' : 'OWNED';

    buyBtn.textContent = equippedWeapon === id ? 'EQUIPPED' : 'EQUIP';

    buyBtn.disabled = equippedWeapon === id;
    buyBtn.className = equippedWeapon === id ? 'owned' : '';

    popup.classList.add('open');
    return;
  }

  // ---------- NOT OWNED ----------
  document.getElementById('buyWeaponPrice').textContent = weapon.price;
  buyBtn.textContent = 'BUY';
  buyBtn.disabled = false;
  buyBtn.className = '';

  popup.classList.add('open');
}

function updateEquipUI() {
  document.querySelectorAll('.weaponItem').forEach((item) => {
    const id = item.dataset.weapon;
    const btn = item.querySelector('.equipBtn');
    if (!btn) return;

    if (id !== DEFAULT_WEAPON && !isWeaponOwned(id)) {
      btn.textContent = 'LOCKED';
      btn.disabled = true;
      btn.classList.add('locked');
      btn.classList.remove('equipped');
      return;
    }

    if (id === getEquippedWeapon()) {
      btn.textContent = 'EQUIPPED';
      btn.disabled = true;
      btn.classList.add('equipped');
      btn.classList.remove('locked');
      return;
    }

    btn.textContent = 'EQIPPED';
    btn.disabled = false;
    btn.classList.remove('equipped', 'locked');
  });
}

// לקרוא פעם אחת בטעינה
updateEquipUI();

document.getElementById('buyConfirmBtn').addEventListener('click', () => {
  if (!selectedWeaponId) return;

  // EQUIP
  if (selectedWeaponId === DEFAULT_WEAPON || isWeaponOwned(selectedWeaponId)) {
    setEquippedWeapon(selectedWeaponId);
    updateEquipUI();
    document.getElementById('buyWeaponPopup').classList.remove('open');
    return;
  }

  // BUY
  const weapon = WEAPONS[selectedWeaponId];
  if (coins < weapon.price) {
    showToast('Not enough coins!', 'error');
    return;
  }

  coins -= weapon.price;
  saveCoins();
  updateCoinsUI();

  const owned = getOwnedWeapons();
  owned.push(selectedWeaponId);
  saveOwnedWeapons(owned);

  setEquippedWeapon(selectedWeaponId);
  updateEquipUI();

  document.getElementById('buyWeaponPopup').classList.remove('open');
});

function equipWeapon(id) {
  if (id !== DEFAULT_WEAPON && !isWeaponOwned(id)) return;

  // אם כבר מצויד – לא לנגן שוב
  if (getEquippedWeapon() === id) return;

  playEquipSound(); // 🔊 עכשיו זה יעבוד בוודאות

  setEquippedWeapon(id);
  updateEquipUI();
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

  // סגור הכל קודם
  closeAll();

  // אם היה סגור – פתח
  if (!isOpen) {
    profile.classList.add('show', 'open');
  }
}

// ---------- WEAPON ----------
function closeBuyWeapon() {
  document.getElementById('buyWeaponPopup').classList.remove('open');
}

window.openWeaponDiv = function (e) {
  if (e) e.stopPropagation();
  closeAll();
  UI.weapon()?.classList.add('open');
  UI.overlay()?.classList.add('show');
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

const languageBtn = document.getElementById('languageBtn');
const languageMenu = document.getElementById('languageMenu');
const languageOptions = document.querySelectorAll('.languageOption');

languageBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  languageMenu.classList.toggle('open');
});

document.addEventListener('click', () => {
  languageMenu.classList.remove('open');
});

languageMenu.addEventListener('click', (e) => {
  e.stopPropagation();
});

languageOptions.forEach((btn) => {
  btn.addEventListener('click', () => {
    const lang = btn.dataset.lang;

    localStorage.setItem('language', lang);
    console.log('🌍 Language set to:', lang);

    languageMenu.classList.remove('open');

    const savedLang = localStorage.getItem('language') || 'en';
    applyLanguage(savedLang);
    console.log('🌍 Current language:', savedLang);
  });
});

// language
function applyLanguage(lang) {
  const t = TRANSLATIONS[lang];
  if (!t) return;

  document.getElementById('settingsTitle').textContent = t.settings;

  const settingTexts = document.querySelectorAll('.settingText');
  settingTexts[0].textContent = t.music;
  settingTexts[1].textContent = t.audio;

  languageBtn.textContent = t.language;

  document.body.style.direction = lang === 'he' ? 'rtl' : 'ltr';
}

// ---------- LEVEL NAV ----------
function goToLevel(level) {
  window.location.href = `game.html?level=${level}`;
}
// ---------- COINS ----------
let coins = Number(localStorage.getItem('coins')) || 50;
const maxCoins = 999999;

function saveCoins() {
  localStorage.setItem('coins', coins);
}

function loadCoins() {
  coins = Number(localStorage.getItem('coins')) || 50;
  updateCoinsUI();
}

function updateCoinsUI() {
  document.getElementById('coinsText').textContent = coins;
}

function grantCoins(amount) {
  let coins = Number(localStorage.getItem('coins')) || 0;
  coins += amount;
  localStorage.setItem('coins', coins);
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

  // Already own?
  if (isWeaponOwned(selectedWeaponId)) return;

  // Not enough coins
  if (coins < weapon.price) {
    return;
  }

  // Pay
  coins -= weapon.price;
  saveCoins();
  updateCoinsUI();

  // Save weapon
  const owned = getOwnedWeapons();
  owned.push(selectedWeaponId);
  saveOwnedWeapons(owned);

  alert(`You bought ${weapon.name}!`);

  // Close popup
  document.getElementById('buyWeaponPopup').classList.remove('open');
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

  if (isPetOwned(id)) {
    alert('You already own this pet!');
    return;
  }

  setEquippedPet(id);
  updatePetUI();

  if (coins < pet.price) {
    alert('Not enough coins!');
    return;
  }

  coins -= pet.price;
  saveCoins();
  updateCoinsUI();

  const owned = getOwnedPets();
  owned.push(id);
  saveOwnedPets(owned);

  updatePetUI();

  alert(`You bought ${pet.name}!`);
}

function updatePetUI() {
  document.querySelectorAll('.petCard').forEach((card) => {
    const id = card.dataset.pet;
    const btn = card.querySelector('.petBuyBtn');
    const price = card.querySelector('.petPrice');

    if (!isPetOwned(id)) {
      btn.textContent = 'BUY';
      btn.className = 'petBuyBtn';
      btn.onclick = () => buyPet(id);
      price.textContent = `${PETS[id].price} 🪙`;
      return;
    }

    // ✅ Owned
    price.textContent = '';

    if (getEquippedPet() === id) {
      btn.textContent = 'UNEQUIP';
      btn.className = 'petBuyBtn equipped';
    } else {
      btn.textContent = 'EQUIP';
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

  document.getElementById('petInfoTitle').textContent = pet.name + ' Info';

  document.getElementById('petInfoDesc').textContent = 'Support companion';

  const statsUl = document.getElementById('petInfoStats');
  statsUl.innerHTML = '';

  Object.entries(pet.stats).forEach(([label, value]) => {
    addPetStat(label, value);
  });

  document.getElementById('petInfoLongDesc').textContent =
    pet.description || 'No description available.';

  document.getElementById('petInfoOverlay').classList.remove('hidden');
}

document.getElementById('closePetInfo').onclick = () => {
  document.getElementById('petInfoOverlay').classList.add('hidden');
};

function addPetStat(label, value) {
  const li = document.createElement('li');

  const spanLabel = document.createElement('span');
  spanLabel.className = 'statLabel';
  spanLabel.textContent = label;

  const spanValue = document.createElement('span');
  spanValue.className = 'statValue';
  spanValue.textContent = value;

  li.appendChild(spanLabel);
  li.appendChild(spanValue);

  document.getElementById('petInfoStats').appendChild(li);
}

function toggleSuperShop(e) {
  e.stopPropagation();

  const superShop = document.getElementById('superShopDiv');
  if (!superShop) return;

  superShop.classList.toggle('open');
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

  document.querySelectorAll('.selectSuperBtn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();

      const card = btn.closest('.superCard');
      if (!card) return;

      const key = card.dataset.super;
      if (!key) return;

      const data = SUPERS[key];
      if (!data) return;

      titleEl.textContent = data.title;
      descEl.textContent = data.description;

      statsEl.innerHTML = '';
      Object.entries(data.stats).forEach(([label, value]) => {
        const row = document.createElement('div');
        row.className = 'statRow';

        row.innerHTML = `
          <span class="statLabel">${label}</span>
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
});

function closeSuperInfo() {
  const superInfoDiv = document.querySelector('.superInfoDiv');
  if (!superInfoDiv) return;

  superInfoDiv.classList.remove('open');
}

function getEquippedSuper() {
  return localStorage.getItem(STORAGE_KEY_SUPER);
}

function setEquippedSuper(id) {
  localStorage.setItem(STORAGE_KEY_SUPER, id);
}

function updateSuperEquipUI() {
  const equipped = getEquippedSuper();

  document.querySelectorAll('.superCard').forEach((card) => {
    const id = card.dataset.super;
    const btn = card.querySelector('.superEquipBtn');
    if (!btn || !SUPERS[id]) return;

    const label = btn.querySelector('.label');

    btn.onclick = null;

    if (!isSuperOwned(id)) {
      label.textContent = `BUY (${SUPERS[id].price} 🪙)`;
      btn.className = 'superEquipBtn buy';
      btn.disabled = false;

      btn.onclick = (e) => {
        e.stopPropagation();
        openBuySuperConfirm(id);
      };
      return;
    }

    if (equipped === id) {
      label.textContent = 'EQUIPPED';
      btn.className = 'superEquipBtn equipped';
      btn.disabled = true;
      return;
    }

    label.textContent = 'EQUIP';
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
}

function closeBuySuperConfirm() {
  pendingSuperBuy = null;
  document.getElementById('buySuperConfirm')?.classList.remove('open');
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

function goToLevel(level) {
  const maxUnlocked = getMaxUnlockedLevel();

  if (level > maxUnlocked) {
    showLockedLevel(level);
    return;
  }

  window.location.href = `game.html?level=${level}`;
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

  closeAll(); // סוגר הכל קודם

  if (!isOpen) {
    socialDiv.classList.add('open');
  }
}

// item shop script
const SHOP = {
  ownedSkins: new Set(JSON.parse(localStorage.getItem('ownedSkins') || '[]')),
  equippedSkin: localStorage.getItem('equippedSkin') || '',
  ownedFeatured: localStorage.getItem('ownedFeatured') === '1',
};

const shopData = {
  featured: {
    id: 'galaxyPass',
    name: 'Galaxy Pass',
    desc: 'Unlock a premium reward track + bonus coins',
    icon: '✨',
    price: 2500,
  },
  daily: [
    {
      id: 'daily_laser_boost',
      name: 'Laser Boost',
      desc: '+15% laser dmg (1 run)',
      icon: '⚡',
      price: 180,
      badge: 'HOT',
    },
    {
      id: 'daily_pet_food',
      name: 'Pet Treat',
      desc: 'Pet bonus for 3 battles',
      icon: '🐾',
      price: 220,
      badge: 'NEW',
    },
    {
      id: 'daily_coin_bundle',
      name: 'Mini Coins',
      desc: '+350 coins',
      icon: '🪙',
      price: 150,
      badge: 'VALUE',
    },
  ],
  skins: [
    {
      id: 'skin_neon',
      name: 'Neon Runner',
      desc: 'Electric neon trails',
      icon: '🟦',
      price: 1200,
    },
    {
      id: 'skin_void',
      name: 'Void Steel',
      desc: 'Dark metallic finish',
      icon: '⬛',
      price: 1600,
    },
    {
      id: 'skin_sakura',
      name: 'Sakura Drift',
      desc: 'Pink petals FX',
      icon: '🌸',
      price: 1400,
    },
    {
      id: 'skin_gold',
      name: 'Golden Core',
      desc: 'Gold shine aura',
      icon: '🏆',
      price: 2200,
    },
  ],
  coinPacks: [
    {
      id: 'coins_500',
      name: '500 Coins',
      desc: 'Starter pack',
      icon: '🪙',
      price: 0,
      add: 500,
    },
    {
      id: 'coins_1500',
      name: '1500 Coins',
      desc: 'Best value',
      icon: '💰',
      price: 0,
      add: 1500,
    },
    {
      id: 'coins_4000',
      name: '4000 Coins',
      desc: 'Mega pack',
      icon: '🚀',
      price: 0,
      add: 4000,
    },
    {
      id: 'coins_10000',
      name: '10000 Coins',
      desc: 'Ultra pack',
      icon: '👑',
      price: 0,
      add: 10000,
    },
  ],
};

function getCoins() {
  return Number(localStorage.getItem('coins') || '0');
}

function setCoins(v) {
  localStorage.setItem('coins', String(v));

  const coinsText = document.getElementById('coinsText');
  if (coinsText) coinsText.textContent = v;

  const shopCoinsText = document.getElementById('shopCoinsText');
  if (shopCoinsText) shopCoinsText.textContent = v;
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.className = `toast show ${type}`.trim();
  t.textContent = msg;
  clearTimeout(showToast._tm);
  showToast._tm = setTimeout(() => {
    t.className = 'toast';
  }, 1400);
}

function shopInit() {
  shopRenderFeatured();
  shopRenderDaily();
  shopRenderSkins();
  shopRenderCoins();

  const modal = document.getElementById('shopModal');
  if (modal) modal.addEventListener('click', () => shopCloseModal());

  const closeBtn = document.getElementById('shopModalClose');
  if (closeBtn) closeBtn.addEventListener('click', () => shopCloseModal());

  setCoins(getCoins());
}

function shopRenderFeatured() {
  const f = shopData.featured;

  document.getElementById('featuredName').textContent = f.name;
  document.getElementById('featuredDesc').textContent = f.desc;
  document.getElementById('featuredIcon').textContent = f.icon;
  document.getElementById('featuredPrice').textContent = f.price;

  const btn = document.getElementById('featuredBuyBtn');
  btn.textContent = SHOP.ownedFeatured ? 'OWNED' : 'GET';
  btn.disabled = SHOP.ownedFeatured;

  btn.onclick = () => {
    if (SHOP.ownedFeatured) return;
    shopOpenModal({
      id: f.id,
      name: f.name,
      desc: f.desc,
      icon: f.icon,
      price: f.price,
      type: 'featured',
    });
  };
}

function shopRenderDaily() {
  const row = document.getElementById('dailyOffersRow');
  row.innerHTML = '';

  shopData.daily.forEach((item) => {
    const el = document.createElement('div');
    el.className = 'offerCard';
    el.innerHTML = `
      <div class="offerTop">
        <div class="offerBadge">${item.badge}</div>
        <div class="offerIcon">${item.icon}</div>
      </div>
      <div class="offerMid">
        <div class="offerName">${item.name}</div>
        <div class="offerDesc">${item.desc}</div>
      </div>
      <div class="offerBottom">
        <div class="priceChip">${item.price} 🪙</div>
        <button class="buyMiniBtn">BUY</button>
      </div>
    `;

    el.querySelector('.buyMiniBtn').onclick = (e) => {
      e.stopPropagation();
      shopOpenModal({ ...item, type: 'daily' });
    };

    el.onclick = () => shopOpenModal({ ...item, type: 'daily' });

    row.appendChild(el);
  });
}

function shopRenderSkins() {
  const grid = document.getElementById('skinsGrid');
  grid.innerHTML = '';

  shopData.skins.forEach((s) => {
    const owned = SHOP.ownedSkins.has(s.id);
    const equipped = SHOP.equippedSkin === s.id;

    const el = document.createElement('div');
    el.className = `shopItemCard ${owned ? 'owned' : ''}`.trim();
    el.innerHTML = `
      <div class="itemTopLine">
        <div class="itemIcon">${s.icon}</div>
        <div style="font-size:11px;font-weight:1000;letter-spacing:2px;color:rgba(255,255,255,0.75);text-transform:uppercase;">
          ${equipped ? 'EQUIPPED' : owned ? 'OWNED' : ''}
        </div>
      </div>
      <div class="itemName">${s.name}</div>
      <div class="itemDesc">${s.desc}</div>
      <div class="itemBottomLine">
        <div class="itemPrice">${owned ? '—' : `${s.price} 🪙`}</div>
        <button class="itemBtn">${
          owned ? (equipped ? 'EQUIPPED' : 'EQUIP') : 'BUY'
        }</button>
      </div>
    `;

    const btn = el.querySelector('.itemBtn');
    btn.onclick = (e) => {
      e.stopPropagation();

      if (owned) {
        if (equipped) return;
        SHOP.equippedSkin = s.id;
        localStorage.setItem('equippedSkin', s.id);
        showToast('Skin equipped!', 'success');
        shopRenderSkins();
        return;
      }

      shopOpenModal({ ...s, type: 'skin' });
    };

    el.onclick = () => {
      if (!owned) shopOpenModal({ ...s, type: 'skin' });
    };

    grid.appendChild(el);
  });
}

function shopRenderCoins() {
  const grid = document.getElementById('coinsGrid');
  grid.innerHTML = '';

  shopData.coinPacks.forEach((p) => {
    const el = document.createElement('div');
    el.className = 'shopItemCard locked';
    el.innerHTML = `
      <div class="itemTopLine">
        <div class="itemIcon">${p.icon}</div>
        <div style="font-size:11px;font-weight:1000;letter-spacing:2px;color:rgba(255,160,160,0.9);text-transform:uppercase;">
          SOON
        </div>
      </div>
      <div class="itemName">${p.name}</div>
      <div class="itemDesc">Coming soon</div>
      <div class="itemBottomLine">
        <div class="itemPrice">—</div>
        <button class="itemBtn" disabled>LOCKED</button>
      </div>
    `;
    grid.appendChild(el);
  });
}

function shopOpenModal(item) {
  const modal = document.getElementById('shopModal');
  modal.classList.remove('hidden');

  document.getElementById('shopModalIcon').textContent = item.icon || '🛒';
  document.getElementById('shopModalTitle').textContent = item.name || 'Item';
  document.getElementById('shopModalDesc').textContent = item.desc || '';
  document.getElementById('shopModalPrice').textContent = item.price ?? 0;

  const buyBtn = document.getElementById('shopModalBuy');

  if (item.type === 'coin') {
    buyBtn.textContent = 'CLAIM';
  } else if (item.type === 'skin' && SHOP.ownedSkins.has(item.id)) {
    buyBtn.textContent = 'OWNED';
    buyBtn.disabled = true;
  } else if (item.type === 'featured' && SHOP.ownedFeatured) {
    buyBtn.textContent = 'OWNED';
    buyBtn.disabled = true;
  } else {
    buyBtn.textContent = 'BUY';
    buyBtn.disabled = false;
  }

  buyBtn.onclick = () => shopBuy(item);
}

function shopCloseModal() {
  const modal = document.getElementById('shopModal');
  modal.classList.add('hidden');
}

function shopBuy(item) {
  showToast('Shop purchases disabled for now', 'error');
  return;

  const price = Number(item.price || 0);
  const c = getCoins();

  if (price > c) {
    showToast('Not enough coins', 'error');
    return;
  }

  setCoins(c - price);

  if (item.type === 'skin') {
    SHOP.ownedSkins.add(item.id);
    localStorage.setItem('ownedSkins', JSON.stringify([...SHOP.ownedSkins]));
    showToast('Skin purchased!', 'success');
    shopRenderSkins();
  }

  if (item.type === 'featured') {
    SHOP.ownedFeatured = true;
    localStorage.setItem('ownedFeatured', '1');
    showToast('Featured unlocked!', 'success');
    shopRenderFeatured();
  }

  if (item.type === 'daily') {
    showToast('Deal purchased!', 'success');
  }

  shopCloseModal();
}

document.addEventListener('DOMContentLoaded', () => {
  shopInit();
});
