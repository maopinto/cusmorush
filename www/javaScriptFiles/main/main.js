// coins x
let coins = Number(localStorage.getItem('coins')) || 50;
const maxCoins = 999999;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) =>
  Array.from(root.querySelectorAll(selector));

function nextFrame(fn) {
  requestAnimationFrame(fn);
}

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

function rerenderLanguageDependentUI(lang = getLang?.() || 'en') {
  document.documentElement.lang = lang;

  const isRTL = lang === 'he';
  document.body.dir = isRTL ? 'rtl' : 'ltr';
  document.body.style.direction = isRTL ? 'rtl' : 'ltr';

  nextFrame(() => {
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
    price: 1500,
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
    price: 0,
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
const DEFAULT_PET = null;

let equippedWeapon = localStorage.getItem('equippedWeapon') || DEFAULT_WEAPON;
let equippedPet = localStorage.getItem('equippedPet') || DEFAULT_PET;
let audioUnlocked = false;
let selectedWeaponId = null;
let pendingSuperBuy = null;
let lastMusicVolume = Number(localStorage.getItem('musicVolume') ?? 70);
let lastAudioVolume = Number(localStorage.getItem('audioVolume') ?? 80);
let musicLoopInterval = null;

function getEquippedWeapon() {
  return equippedWeapon;
}

function setEquippedWeapon(id) {
  equippedWeapon = id;
  localStorage.setItem('equippedWeapon', id);
}

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

const uiClickSound = new Audio(
  './sounds/backgroundSoundEffect/buttonClick.wav'
);
uiClickSound.preload = 'auto';

const equipSound = new Audio(
  './sounds/backgroundSoundEffect/selectWeaponClick.mp3'
);
equipSound.preload = 'auto';

const mapClickSound = new Audio('./sounds/backgroundSoundEffect/mapClick.wav');
mapClickSound.preload = 'auto';

const music = new Audio('./sounds/backgroundMusics/homeScreen.mp3');
music.preload = 'auto';
music.loop = false;
music.volume = 0.5;

const LOOP_START = 1;
const LOOP_END = 10;

const DOM = {};

function cacheDom() {
  DOM.profileSettingsDiv = $('#profileSettingsDiv');
  DOM.profileSettingsBtn = $('#profileSettingsBtn');
  DOM.weaponDiv = $('#weaponDiv');
  DOM.overlay = $('#overlay');
  DOM.mapDiv = $('#mapDiv');
  DOM.settingsDiv = $('#settingsDiv');
  DOM.settingsBtn = $('#settingsBtn');
  DOM.socialDiv = $('#socialDiv');
  DOM.superShopDiv = $('#superShopDiv');
  DOM.buySuperConfirm = $('#buySuperConfirm');
  DOM.superInfoDiv = $('.superInfoDiv');
  DOM.levelsContainer = $('#levelsContainer');
  DOM.startGameBtn = $('#startGameBtn');
  DOM.shopBtn = $('[data-target="shopScreen"]');
  DOM.bottomButtons = $$('.bottomButton[data-target]');
  DOM.pages = $$('.page');
  DOM.musicToggle = $('#musicToggle');
  DOM.audioToggle = $('#audioToggle');
  DOM.musicVolume = $('#musicVolume');
  DOM.audioVolume = $('#audioVolume');
  DOM.coinsText = $('#coinsText');
  DOM.buyWeaponPopup = $('#buyWeaponPopup');
  DOM.buyConfirmBtn = $('#buyConfirmBtn');
  DOM.buyCancelBtn = $('#buyCancelBtn');
  DOM.buyWeaponName = $('#buyWeaponName');
  DOM.buyWeaponImg = $('#buyWeaponImg');
  DOM.buyWeaponPrice = $('#buyWeaponPrice');
  DOM.comingSoonOverlay = $('#comingSoonOverlay');
  DOM.comingSoonText = $('#comingSoonText');
  DOM.petShopDiv = $('#petShoopDiv');
  DOM.petInfoOverlay = $('#petInfoOverlay');
  DOM.petInfoTitle = $('#petInfoTitle');
  DOM.petInfoDesc = $('#petInfoDesc');
  DOM.petInfoStats = $('#petInfoStats');
  DOM.petInfoLongDesc = $('#petInfoLongDesc');
  DOM.closePetInfo = $('#closePetInfo');
  DOM.toast = $('#toast');
  DOM.superInfoTitle = $('#superInfoTitle');
  DOM.superInfoDesc = $('#superInfoDesc');
  DOM.superStats = $('#superStats');
  DOM.shopCoinsText = $('#shopCoinsText');
}

const UI = {
  profile: () => DOM.profileSettingsDiv,
  profileBtn: () => DOM.profileSettingsBtn,
  weapon: () => DOM.weaponDiv,
  overlay: () => DOM.overlay,
  map: () => DOM.mapDiv,
};

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

function playMapClick() {
  if (localStorage.getItem('audio') === 'off') return;

  const volume = Number(localStorage.getItem('audioVolume') ?? 80);
  mapClickSound.volume = volume / 100;
  mapClickSound.currentTime = 0;
  mapClickSound.play().catch(console.warn);
}

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

function getOwnedPets() {
  return JSON.parse(localStorage.getItem('ownedPets') || '[]');
}

function saveOwnedPets(pets) {
  localStorage.setItem('ownedPets', JSON.stringify(pets));
}

function isPetOwned(id) {
  return getOwnedPets().includes(id);
}

function getEquippedSuper() {
  return localStorage.getItem(STORAGE_KEY_SUPER);
}

function setEquippedSuper(id) {
  localStorage.setItem(STORAGE_KEY_SUPER, id);
}

function ensureEquippedSuper() {
  const equipped = getEquippedSuper();
  if (equipped && SUPERS[equipped]) return;
  setEquippedSuper('superLaser');
}

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
  if (DOM.coinsText) DOM.coinsText.textContent = coins;
  if (DOM.shopCoinsText) DOM.shopCoinsText.textContent = coins;
}

function grantCoins(amount) {
  coins = Math.min(maxCoins, getCoins() + amount);
  saveCoins();
  updateCoinsUI();
  flashCoins();
}

function flashCoins() {
  const el = DOM.coinsText;
  if (!el) return;
  el.classList.add('coin-flash');
  clearTimeout(flashCoins.timer);
  flashCoins.timer = setTimeout(() => el.classList.remove('coin-flash'), 600);
}

function loadSettings() {
  if (DOM.musicToggle) {
    DOM.musicToggle.checked = localStorage.getItem('music') !== 'off';
  }
  if (DOM.audioToggle) {
    DOM.audioToggle.checked = localStorage.getItem('audio') !== 'off';
  }
}

function loadVolumes() {
  const musicVal = Number(localStorage.getItem('musicVolume') ?? 70);
  const audioVal = Number(localStorage.getItem('audioVolume') ?? 80);

  if (DOM.musicVolume) DOM.musicVolume.value = musicVal;
  if (DOM.audioVolume) DOM.audioVolume.value = audioVal;

  music.volume = musicVal / 100;

  if (DOM.musicToggle && !DOM.musicToggle.checked) {
    music.pause();
  }
}

function startMusicLoopWatcher() {
  if (musicLoopInterval) return;

  musicLoopInterval = setInterval(() => {
    if (music.currentTime >= LOOP_END - 0.05) {
      music.currentTime = LOOP_START;
    }
  }, 120);
}

function closeAll() {
  UI.profile()?.classList.remove('show', 'open');
  UI.weapon()?.classList.remove('open');
  UI.overlay()?.classList.remove('show');
  DOM.settingsDiv?.classList.remove('open');
  DOM.socialDiv?.classList.remove('open');
  DOM.superShopDiv?.classList.remove('open');
  DOM.buySuperConfirm?.classList.remove('open');
  DOM.superInfoDiv?.classList.remove('open');

  const map = UI.map();
  if (map?.classList.contains('open')) {
    map.classList.remove('open');
    map.classList.add('closing');
    setTimeout(() => map.classList.remove('closing'), 400);
  }
}

function openProfileDiv(e) {
  e?.stopPropagation();

  const profile = UI.profile();
  if (!profile) return;

  const isOpen = profile.classList.contains('open');
  closeAll();

  if (!isOpen) {
    profile.classList.add('show', 'open');
  }
}

function closeBuyWeapon() {
  DOM.buyWeaponPopup?.classList.remove('open');
}

function goToLoadoutHighlightWeapon(weaponId) {
  sessionStorage.setItem('weaponLoadoutHighlight', weaponId);
  openWeaponDiv();
}

function openWeaponDiv(e) {
  e?.stopPropagation();
  closeAll();
  UI.weapon()?.classList.add('open');
  UI.overlay()?.classList.add('show');
  nextFrame(() => {
    highlightWeaponInLoadout();
  });
}

function closeWeaponDiv(e) {
  e?.stopPropagation();
  closeBuyWeapon();
  UI.weapon()?.classList.remove('open');
  UI.overlay()?.classList.remove('show');
}

window.openWeaponDiv = openWeaponDiv;
window.closeWeaponDiv = closeWeaponDiv;

function setMapThemeByLevel(maxLevel) {
  const map = UI.map();
  if (!map) return;

  map.classList.remove(
    'level-gold',
    'level-black',
    'level-yellow',
    'level-lightBlue',
    'level-orange',
    'level-purple',
    'level-red',
    'level-pink',
    'level-green'
  );

  if (maxLevel >= 91) map.classList.add('level-gold');
  else if (maxLevel >= 81) map.classList.add('level-black');
  else if (maxLevel >= 71) map.classList.add('level-yellow');
  else if (maxLevel >= 61) map.classList.add('level-lightBlue');
  else if (maxLevel >= 51) map.classList.add('level-orange');
  else if (maxLevel >= 41) map.classList.add('level-purple');
  else if (maxLevel >= 31) map.classList.add('level-red');
  else if (maxLevel >= 21) map.classList.add('level-pink');
  else if (maxLevel >= 11) map.classList.add('level-green');
}

function openMap(e) {
  e?.stopPropagation();
  playMapClick();
  closeAll();

  const map = UI.map();
  const levels = DOM.levelsContainer;
  if (!map || !levels) return;

  map.classList.add('open');
  const maxLevel = getMaxUnlockedLevel();
  setMapThemeByLevel(maxLevel);

  setTimeout(() => {
    updateLevelsMap();

    const currentNode = $('.levelNode.current-node', levels);
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

function playStartGameAnimation() {
  const btn = DOM.startGameBtn;
  if (!btn) return;
  if (btn.classList.contains('pressed')) return;

  btn.classList.add('pressed');
  clearTimeout(playStartGameAnimation.timer);
  playStartGameAnimation.timer = setTimeout(() => {
    btn.classList.remove('pressed');
  }, 600);
}

function goToLevel(level) {
  const maxUnlocked = getMaxUnlockedLevel();

  if (level > maxUnlocked) {
    showLockedLevel(level);
    return;
  }

  const target = `game.html?level=${level}`;
  location.href = `index.html?to=${encodeURIComponent(target)}`;
}

function openBuyWeapon(id) {
  const weapon = WEAPONS[id];
  if (!weapon) return;

  selectedWeaponId = id;

  const lang = getLang();
  const buyBtn = DOM.buyConfirmBtn;

  if (DOM.buyWeaponName) DOM.buyWeaponName.textContent = weapon.name;
  if (DOM.buyWeaponImg) DOM.buyWeaponImg.src = weapon.img;

  const owned = id === DEFAULT_WEAPON || isWeaponOwned(id);

  if (DOM.buyWeaponPrice) {
    DOM.buyWeaponPrice.textContent = owned
      ? id === DEFAULT_WEAPON
        ? t(lang, 'ui.free')
        : t(lang, 'ui.owned')
      : String(weapon.price);
  }

  if (buyBtn) {
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
  }

  DOM.buyWeaponPopup?.classList.add('open');
}

function updateEquipUI() {
  const lang = getLang();

  $$('.weaponItem').forEach((item) => {
    const id = item.dataset.weapon;
    const btn = $('.equipBtn', item);
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

function equipWeapon(id) {
  if (id !== DEFAULT_WEAPON && !isWeaponOwned(id)) return;
  if (getEquippedWeapon() === id) return;

  playEquipSound();
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

function showComingSoon() {
  const overlay = DOM.comingSoonOverlay;
  const text = DOM.comingSoonText;
  if (!overlay || !text) return;

  overlay.classList.remove('show');
  text.classList.remove('show');

  nextFrame(() => {
    overlay.classList.add('show');
    text.classList.add('show');
  });

  clearTimeout(showComingSoon.timer);
  showComingSoon.timer = setTimeout(() => {
    overlay.classList.remove('show');
    text.classList.remove('show');
  }, 1100);
}

function openPetShop() {
  DOM.petShopDiv?.classList.remove('hidden');
}

function closePetShop() {
  DOM.petShopDiv?.classList.add('hidden');
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
  playEquipSound();
  updatePetUI();

  showToast(`You bought and equipped ${pet.name}!`, 'success');

  const card = $(`.petCard[data-pet="${id}"]`);
  if (card) {
    card.classList.add('purchasedFx');
    setTimeout(() => card.classList.remove('purchasedFx'), 600);
  }
}

function equipPet(id) {
  if (!isPetOwned(id)) return;
  setEquippedPet(id);
  updatePetUI();
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

function updatePetUI() {
  const lang = getLang();

  $$('.petCard').forEach((card) => {
    const id = card.dataset.pet;
    const btn = $('.petBuyBtn', card);
    const price = $('.petPrice', card);
    if (!btn || !price) return;

    if (!isPetOwned(id)) {
      btn.textContent = t(lang, 'ui.buy');
      btn.className = 'petBuyBtn';
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
  });
}

function closePetInfo() {
  DOM.petInfoOverlay?.classList.add('hidden');
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

  DOM.petInfoStats?.appendChild(li);
}

function openPetInfo(petKey) {
  const pet = PETS[petKey];
  if (!pet) return;

  const lang = getLang();

  if (DOM.petInfoTitle) {
    DOM.petInfoTitle.textContent = t(lang, 'pets.info', { name: pet.name });
  }

  if (DOM.petInfoDesc) {
    DOM.petInfoDesc.textContent = t(lang, `pets.${petKey}.short`, {});
  }

  if (DOM.petInfoStats) {
    DOM.petInfoStats.textContent = '';
    const fragment = document.createDocumentFragment();

    Object.entries(pet.stats).forEach(([label, value]) => {
      const li = document.createElement('li');

      const spanLabel = document.createElement('span');
      spanLabel.className = 'statLabel';
      spanLabel.textContent = t(lang, `pets.stat.${label}`);

      const spanValue = document.createElement('span');
      spanValue.className = 'statValue';
      spanValue.textContent = value;

      li.appendChild(spanLabel);
      li.appendChild(spanValue);
      fragment.appendChild(li);
    });

    DOM.petInfoStats.appendChild(fragment);
  }

  if (DOM.petInfoLongDesc) {
    DOM.petInfoLongDesc.textContent = t(lang, `pets.${petKey}.long`, {});
  }

  DOM.petInfoOverlay?.classList.remove('hidden');
}

function toggleSuperShop(e) {
  e?.stopPropagation();
  closeAll();
  DOM.superShopDiv?.classList.add('open');
  updateSuperEquipUI();
}

function closeSuperShop() {
  DOM.superShopDiv?.classList.remove('open');
}

function renderSuperInfo(key) {
  const data = SUPERS[key];
  if (
    !data ||
    !DOM.superInfoDiv ||
    !DOM.superInfoTitle ||
    !DOM.superInfoDesc ||
    !DOM.superStats
  )
    return;

  const lang = getLang();
  DOM.superInfoTitle.textContent = t(lang, data.titleKey);
  DOM.superInfoDesc.textContent = t(lang, data.descKey);
  DOM.superStats.textContent = '';

  const fragment = document.createDocumentFragment();
  Object.entries(data.stats).forEach(([label, value]) => {
    const row = document.createElement('div');
    row.className = 'statRow';

    const statLabel = document.createElement('span');
    statLabel.className = 'statLabel';
    statLabel.textContent = t(lang, `super.stat.${label}`);

    const statValue = document.createElement('span');
    statValue.className = 'statValue';
    statValue.textContent = value;

    row.appendChild(statLabel);
    row.appendChild(statValue);
    fragment.appendChild(row);
  });

  DOM.superStats.appendChild(fragment);
  DOM.superInfoDiv.classList.add('open');
}

function closeSuperInfo() {
  DOM.superInfoDiv?.classList.remove('open');
}

function updateSuperEquipUI() {
  ensureEquippedSuper();

  const lang = getLang();
  const equipped = getEquippedSuper();

  $$('.superCard').forEach((card) => {
    const id = card.dataset.super;
    const btn = $('.superEquipBtn', card);
    if (!btn || !SUPERS[id]) return;

    const label = $('.label', btn);
    if (!label) return;

    if (!isSuperOwned(id)) {
      label.textContent = `${t(lang, 'ui.buy')} (${SUPERS[id].price} 🪙)`;
      btn.className = 'superEquipBtn buy';
      btn.disabled = false;
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
  if (!owned.includes(id)) {
    owned.push(id);
    saveOwnedSupers(owned);
  }

  setEquippedSuper(id);
  playEquipSound();
  showToast('Super purchased and equipped!', 'success');
  updateSuperEquipUI();
}

function equipSuper(id) {
  if (getEquippedSuper() === id) return;
  setEquippedSuper(id);
  updateSuperEquipUI();
}

function openBuySuperConfirm(id) {
  pendingSuperBuy = id;
  DOM.buySuperConfirm?.classList.add('open');
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
  if (!owned.includes(pendingSuperBuy)) {
    owned.push(pendingSuperBuy);
    saveOwnedSupers(owned);
  }

  setEquippedSuper(pendingSuperBuy);
  playEquipSound();
  showToast('Super unlocked and equipped!', 'success');

  pendingSuperBuy = null;
  closeBuySuperConfirm();
  updateSuperEquipUI();
}

function closeBuySuperConfirm() {
  pendingSuperBuy = null;
  DOM.buySuperConfirm?.classList.remove('open');
}

function showToast(message, type = '') {
  const toast = DOM.toast;
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast show ${type}`;

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 1600);
}

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

  $$('.levelNode').forEach((node) => {
    const btn = $('.levelsBtn', node);
    if (!btn) return;

    const level = Number(btn.textContent.trim());
    const isBossLevel = level % 10 === 0;
    const isLocked = level > maxLevel;
    const isCurrent = level === maxLevel;

    node.classList.remove(
      'locked',
      'current-node',
      'boss-node',
      'boss-current'
    );
    btn.classList.remove(
      'locked-btn',
      'current',
      'boss-btn',
      'boss-current-btn',
      'boss-locked-btn'
    );

    if (isLocked) {
      node.classList.add('locked');
      btn.classList.add('locked-btn');
    }

    if (isCurrent) {
      node.classList.add('current-node');
      btn.classList.add('current');
    }

    if (isBossLevel) {
      node.classList.add('boss-node');
      btn.classList.add('boss-btn');

      if (isLocked) btn.classList.add('boss-locked-btn');
      if (isCurrent) {
        node.classList.add('boss-current');
        btn.classList.add('boss-current-btn');
      }
    }
  });
}

function toggleSocial(e) {
  e?.stopPropagation();

  const socialDiv = DOM.socialDiv;
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
  const card = $(`.petCard[data-pet="${key}"]`);
  if (!card) return;

  $$('.petCard.petHighlight').forEach((x) =>
    x.classList.remove('petHighlight')
  );

  card.classList.add('petHighlight');
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });

  setTimeout(() => card.classList.remove('petHighlight'), 1800);
  sessionStorage.removeItem('petShopHighlight');
}

function highlightWeaponInLoadout() {
  const id = sessionStorage.getItem('weaponLoadoutHighlight');
  if (!id) return;

  const list = DOM.weaponDiv;
  const item = $(`.weaponItem[data-weapon="${id}"]`);

  if (!list || !item) {
    sessionStorage.removeItem('weaponLoadoutHighlight');
    return;
  }

  $$('.weaponItem.weaponHighlight').forEach((x) =>
    x.classList.remove('weaponHighlight')
  );

  const iconBtn = $('.upgradeWeapon', item);
  if (!iconBtn) return;

  $$('.upgradeWeapon.weaponHighlight').forEach((x) =>
    x.classList.remove('weaponHighlight')
  );

  iconBtn.classList.add('weaponHighlight');

  const itemTop = item.offsetTop;
  const targetTop = itemTop - list.clientHeight / 2 + item.clientHeight / 2;

  list.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });

  setTimeout(() => iconBtn.classList.remove('weaponHighlight'), 1100);
  sessionStorage.removeItem('weaponLoadoutHighlight');
}

function handleGlobalPointerDown(e) {
  const unlockAttempt = !audioUnlocked;

  if (unlockAttempt) {
    e.stopImmediatePropagation();
    uiClickSound.volume = 0;
    uiClickSound
      .play()
      .then(() => {
        uiClickSound.pause();
        uiClickSound.currentTime = 0;
        audioUnlocked = true;
      })
      .catch(() => {
        audioUnlocked = false;
      });
  }

  const btn = e.target.closest('button');
  if (!btn || !audioUnlocked) return;

  const s = btn.dataset.sound;

  if (s === 'equip') {
    playEquipSound();
    return;
  }

  if (s === 'map') {
    playMapClick();
    return;
  }

  playUIClick();
}

function handleGlobalClick(e) {
  if (
    UI.profile()?.contains(e.target) ||
    UI.profileBtn()?.contains(e.target) ||
    UI.weapon()?.contains(e.target) ||
    UI.overlay()?.contains(e.target) ||
    e.target.closest('.InventoryBtn') ||
    e.target.closest('#startGameBtn') ||
    e.target.closest('#settingsDiv') ||
    e.target.closest('#settingsBtn') ||
    e.target.closest('#superShopDiv') ||
    e.target.closest('.superInfoDiv') ||
    e.target.closest('#buySuperConfirm')
  ) {
    return;
  }

  if (e.target.closest('.closePetShopBtn')) {
    e.stopPropagation();
    closePetShop();
    return;
  }

  const superShop = DOM.superShopDiv;
  if (superShop?.classList.contains('open') && !superShop.contains(e.target)) {
    superShop.classList.remove('open');
  }

  closeAll();
}

function handleDelegatedClicks(e) {
  const bottomBtn = e.target.closest('.bottomButton[data-target]');
  if (bottomBtn) {
    e.stopPropagation();
    DOM.pages.forEach((p) => p.classList.remove('active'));
    document.getElementById(bottomBtn.dataset.target)?.classList.add('active');
    return;
  }

  const lockedWeaponBtn = e.target.closest('.upgradeWeapon.locked');
  if (lockedWeaponBtn) {
    e.preventDefault();
    showComingSoon();
    return;
  }

  const petCard = e.target.closest('.petCard');
  const petBtn = e.target.closest('.petBuyBtn');
  if (petCard) {
    const petId = petCard.dataset.pet;
    if (petBtn) {
      e.stopPropagation();
      if (!isPetOwned(petId)) buyPet(petId);
      else toggleEquipPet(petId);
      return;
    }

    openPetInfo(petId);
    return;
  }

  const selectSuperBtn = e.target.closest('.selectSuperBtn');
  if (selectSuperBtn) {
    e.stopPropagation();
    const card = selectSuperBtn.closest('.superCard');
    const key = card?.dataset.super;
    if (key) renderSuperInfo(key);
    return;
  }

  const superEquipBtn = e.target.closest('.superEquipBtn');
  if (superEquipBtn) {
    e.stopPropagation();
    const card = superEquipBtn.closest('.superCard');
    const id = card?.dataset.super;
    if (!id) return;

    if (!isSuperOwned(id)) {
      openBuySuperConfirm(id);
      return;
    }

    if (getEquippedSuper() !== id) {
      equipSuper(id);
    }
  }
}

function bindEvents() {
  document.addEventListener('pointerdown', handleGlobalPointerDown, {
    capture: true,
  });
  document.addEventListener('click', handleGlobalClick);
  document.addEventListener('click', handleDelegatedClicks);

  DOM.settingsDiv?.addEventListener('click', (e) => e.stopPropagation());
  DOM.superInfoDiv?.addEventListener('click', (e) => e.stopPropagation());

  DOM.startGameBtn?.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    playStartGameAnimation();
  });

  DOM.startGameBtn?.addEventListener('pointerup', (e) => {
    e.stopPropagation();
    openMap(e);
  });

  DOM.shopBtn?.addEventListener('click', () => {
    nextFrame(() => {
      if (typeof shopOnEnter === 'function') {
        shopOnEnter();
      }
    });
  });

  DOM.musicToggle?.addEventListener('change', () => {
    if (!DOM.musicToggle.checked) {
      lastMusicVolume = Number(DOM.musicVolume?.value) || 70;
      music.pause();
      music.volume = 0;

      if (DOM.musicVolume) DOM.musicVolume.value = 0;
      localStorage.setItem('musicVolume', 0);
      localStorage.setItem('music', 'off');
    } else {
      const restore = lastMusicVolume || 70;
      music.volume = restore / 100;
      music.play().catch(() => {});

      if (DOM.musicVolume) DOM.musicVolume.value = restore;
      localStorage.setItem('musicVolume', restore);
      localStorage.setItem('music', 'on');
    }
  });

  DOM.audioToggle?.addEventListener('change', () => {
    if (!DOM.audioToggle.checked) {
      lastAudioVolume = Number(DOM.audioVolume?.value) || lastAudioVolume || 80;
      if (DOM.audioVolume) DOM.audioVolume.value = 0;
      localStorage.setItem('audioVolume', 0);
      localStorage.setItem('audio', 'off');
    } else {
      const restore = lastAudioVolume || 80;
      if (DOM.audioVolume) DOM.audioVolume.value = restore;
      localStorage.setItem('audioVolume', restore);
      localStorage.setItem('audio', 'on');
    }
  });

  DOM.settingsBtn?.addEventListener('click', (e) => {
    e.stopPropagation();

    DOM.settingsBtn.classList.remove('spin');
    nextFrame(() => DOM.settingsBtn.classList.add('spin'));

    const opened = DOM.settingsDiv?.classList.contains('open');
    closeAll();

    if (!opened) {
      DOM.settingsDiv?.classList.add('open');
    }
  });

  document.addEventListener(
    'pointerdown',
    () => {
      if (localStorage.getItem('music') === 'off') return;
      music.currentTime = LOOP_START;
      music.play().catch(() => {});
      startMusicLoopWatcher();
    },
    { once: true }
  );

  DOM.musicVolume?.addEventListener('input', () => {
    const value = Number(DOM.musicVolume.value);

    localStorage.setItem('musicVolume', value);
    music.volume = value / 100;

    if (value === 0) {
      if (DOM.musicToggle) DOM.musicToggle.checked = false;
      localStorage.setItem('music', 'off');
      music.pause();
    } else {
      if (DOM.musicToggle) DOM.musicToggle.checked = true;
      localStorage.setItem('music', 'on');
      if (music.paused) {
        music.play().catch(() => {});
      }
    }
  });

  DOM.audioVolume?.addEventListener('input', () => {
    const value = Number(DOM.audioVolume.value);
    localStorage.setItem('audioVolume', value);

    if (value === 0) {
      if (DOM.audioToggle) DOM.audioToggle.checked = false;
      localStorage.setItem('audio', 'off');
    } else {
      if (DOM.audioToggle) DOM.audioToggle.checked = true;
      localStorage.setItem('audio', 'on');
    }
  });

  DOM.buyCancelBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeBuyWeapon();
  });

  DOM.buyConfirmBtn?.addEventListener('click', () => {
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

    setEquippedWeapon(selectedWeaponId);
    playEquipSound();
    closeBuyWeapon();

    showToast(`You bought and equipped ${weapon.name}!`, 'success');

    renderInventoryOverview?.();
    updateEquipUI();
  });

  DOM.closePetInfo?.addEventListener('click', (e) => {
    e.stopPropagation();
    closePetInfo();
  });

  DOM.petInfoOverlay?.addEventListener('click', (e) => {
    if (e.target === DOM.petInfoOverlay) {
      closePetInfo();
    }
  });

  DOM.buySuperConfirm
    ?.querySelector('.buyCancelBtn')
    ?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeBuySuperConfirm();
    });

  DOM.buySuperConfirm
    ?.querySelector('.buyConfirmBtn')
    ?.addEventListener('click', (e) => {
      e.stopPropagation();
      confirmBuySuper();
    });

  DOM.buySuperConfirm?.addEventListener('click', (e) => {
    if (e.target === DOM.buySuperConfirm) closeBuySuperConfirm();
  });
}

function init() {
  cacheDom();
  loadSettings();
  loadVolumes();
  loadCoins();
  bindEvents();

  const savedLang = getLang?.() || localStorage.getItem('language') || 'en';
  applyLanguage?.(savedLang);
  initLanguageUI?.();

  ensureEquippedSuper();
  updateEquipUI();
  updatePetUI();
  updateSuperEquipUI();
}

document.addEventListener('DOMContentLoaded', init);

window.openMap = openMap;
window.closeMap = closeMap;
window.openProfileDiv = openProfileDiv;
window.toggleSocial = toggleSocial;
window.openBuyWeapon = openBuyWeapon;
window.equipWeapon = equipWeapon;
window.equipWeaponFromInventory = equipWeaponFromInventory;
window.goToLoadoutHighlightWeapon = goToLoadoutHighlightWeapon;
window.openPetShop = openPetShop;
window.closePetShop = closePetShop;
window.buyPet = buyPet;
window.equipPet = equipPet;
window.toggleEquipPet = toggleEquipPet;
window.openPetInfo = openPetInfo;
window.closePetInfo = closePetInfo;
window.toggleSuperShop = toggleSuperShop;
window.closeSuperShop = closeSuperShop;
window.closeSuperInfo = closeSuperInfo;
window.openBuySuperConfirm = openBuySuperConfirm;
window.confirmBuySuper = confirmBuySuper;
window.closeBuySuperConfirm = closeBuySuperConfirm;
window.buySuper = buySuper;
window.equipSuper = equipSuper;
window.showToast = showToast;
window.getMaxUnlockedLevel = getMaxUnlockedLevel;
window.unlockNextLevel = unlockNextLevel;
window.showLockedLevel = showLockedLevel;
window.updateLevelsMap = updateLevelsMap;
window.highlightPetInShop = highlightPetInShop;
window.highlightWeaponInLoadout = highlightWeaponInLoadout;
window.enterFullscreen = enterFullscreen;
window.rerenderLanguageDependentUI = rerenderLanguageDependentUI;
window.saveCoins = saveCoins;
window.loadCoins = loadCoins;
window.updateCoinsUI = updateCoinsUI;
window.grantCoins = grantCoins;
window.getOwnedWeapons = getOwnedWeapons;
window.saveOwnedWeapons = saveOwnedWeapons;
window.isWeaponOwned = isWeaponOwned;
window.getOwnedPets = getOwnedPets;
window.saveOwnedPets = saveOwnedPets;
window.isPetOwned = isPetOwned;
window.getOwnedSupers = getOwnedSupers;
window.saveOwnedSupers = saveOwnedSupers;
window.isSuperOwned = isSuperOwned;
window.getEquippedWeapon = getEquippedWeapon;
window.setEquippedWeapon = setEquippedWeapon;
window.getEquippedPet = getEquippedPet;
window.setEquippedPet = setEquippedPet;
window.getEquippedSuper = getEquippedSuper;
window.setEquippedSuper = setEquippedSuper;
window.updateEquipUI = updateEquipUI;
window.updatePetUI = updatePetUI;
window.updateSuperEquipUI = updateSuperEquipUI;
window.goToLevel = goToLevel;
window.closeBuyWeapon = closeBuyWeapon;
