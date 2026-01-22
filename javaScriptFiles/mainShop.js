// item shop script
const SHOP = {
  ownedSkins: new Set(JSON.parse(localStorage.getItem('ownedSkins') || '[]')),
  equippedSkin: localStorage.getItem('equippedSkin') || '',
  ownedFeatured: localStorage.getItem('ownedFeatured') === '1',
};

const K_SHOP_HIGHLIGHT_SKIN = 'shopHighlightSkin';
const normId = (id) =>
  String(id || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[_-]+/g, '');

const shopData = {
  featured: [
    {
      id: 'galaxyPass',
      name: 'Galaxy Pass',
      desc: 'Unlock a premium reward track + bonus coins',
      icon: '✨',
      price: 2500,
    },
    {
      id: 'galaxySkin',
      name: 'Galaxy Skin',
      desc: 'get this skin before it leaving',
      icon: '🏆',
      price: 2000,
    },
  ],
  dailyPool: [
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
    {
      id: 'daily_shield_boost',
      name: 'Shield Boost',
      desc: '+20% shield strength (1 run)',
      icon: '🛡️',
      price: 200,
      badge: 'HOT',
    },
    {
      id: 'daily_fire_rate',
      name: 'Rapid Fire',
      desc: '+25% fire rate (2 battles)',
      icon: '🔥',
      price: 260,
      badge: 'LIMIT',
    },
    {
      id: 'daily_revive',
      name: 'Instant Revive',
      desc: 'Revive once on death',
      icon: '💖',
      price: 300,
      badge: 'RARE',
    },
    {
      id: 'daily_xp_boost',
      name: 'XP Boost',
      desc: '+50% XP for 30 minutes',
      icon: '📈',
      price: 240,
      badge: 'XP',
    },
    {
      id: 'daily_super_charge',
      name: 'Super Charge',
      desc: 'Start battle with full super',
      icon: '⚡',
      price: 280,
      badge: 'POWER',
    },
    {
      id: 'daily_random_box',
      name: 'Mystery Box',
      desc: 'Random reward',
      icon: '🎁',
      price: 350,
      badge: '???',
    },
    {
      id: 'daily_coin_rush',
      name: 'Coin Rush',
      desc: 'Double coins for 2 battles',
      icon: '💰',
      price: 260,
      badge: 'VALUE',
    },
  ],
  skins: [
    {
      id: 'default',
      name: 'Classic',
      image: './images/shopAInventoryicons/skin1Icon.png',
      rarity: 'COMMON',
      price: 0,
    },
    {
      id: 'redclassic',
      name: 'Red Classic',
      image: './images/shopAInventoryicons/redSkunIcone.png',
      desc: 'Red classic',
      rarity: 'RARE',
      price: 500,
    },
    {
      id: 'skin_void',
      name: 'Void Steel',
      desc: 'Dark metallic finish',
      rarity: 'EPIC',
      icon: '⬛',
      price: 1600,
    },
    {
      id: 'skin_sakura',
      name: 'Sakura Drift',
      desc: 'Pink petals FX',
      rarity: 'EPIC',
      icon: '🌸',
      price: 1400,
    },
    {
      id: 'skin_gold',
      name: 'Golden Core',
      desc: 'Gold shine aura',
      rarity: 'LEGENDARY',
      icon: '🏆',
      price: 2200,
    },
  ],
  coinPacks: [
    {
      id: 'coins_1000',
      name: '250 Coins',
      desc: 'Small boost',
      rarity: 'RARE',
      icon: '🪙',
      price: 0,
      add: 1000,
    },
    {
      id: 'coins_3000',
      name: '800 Coins',
      desc: 'Good value',
      rarity: 'RARE',
      icon: '💰',
      price: 0,
      add: 3000,
    },
    {
      id: 'coins_6000',
      name: '2000 Coins',
      desc: 'Big pack',
      rarity: 'EPIC',
      icon: '🏦',
      price: 0,
      add: 6000,
    },
    {
      id: 'coins_10000',
      name: '6000 Coins',
      desc: 'Mega pack',
      rarity: 'LEGENDARY',
      icon: '👑',
      price: 0,
      add: 10000,
    },
  ],
};

const STORAGE_KEY_DAILY_GIFT_CLAIM = 'dailyGiftLastClaim';
const STORAGE_KEY_DAILY_GIFT_TODAY = 'dailyGiftToday';

const DAILY_GIFT_POOL = [
  {
    type: 'coins',
    amount: 80,
    weight: 30,
    name: 'Small Coin Pack',
    icon: '🪙',
  },
  { type: 'coins', amount: 150, weight: 22, name: 'Coin Pack', icon: '💰' },
  { type: 'coins', amount: 300, weight: 10, name: 'Big Coin Pack', icon: '🏦' },

  {
    type: 'boost',
    id: 'boost_xp',
    weight: 12,
    name: 'XP Boost',
    icon: '📈',
    duration: 30,
  },
  {
    type: 'boost',
    id: 'boost_shield',
    weight: 9,
    name: 'Shield Boost',
    icon: '🛡️',
    battles: 1,
  },
  {
    type: 'boost',
    id: 'boost_fire',
    weight: 9,
    name: 'Rapid Fire',
    icon: '🔥',
    battles: 2,
  },
  {
    type: 'boost',
    id: 'boost_laser',
    weight: 8,
    name: 'Laser Boost',
    icon: '⚡',
    battles: 1,
  },
  {
    type: 'boost',
    id: 'boost_revive',
    weight: 4,
    name: 'Instant Revive',
    icon: '💖',
    uses: 1,
  },

  {
    type: 'daily',
    id: 'daily_random_box',
    weight: 6,
    name: 'Mystery Box',
    icon: '🎁',
  },
];

function syncShopState() {
  const arr = JSON.parse(localStorage.getItem('ownedSkins') || '[]');
  if (!arr.includes('default')) {
    arr.push('default');
    localStorage.setItem('ownedSkins', JSON.stringify(arr));
  }

  SHOP.ownedSkins = new Set(arr);
  SHOP.equippedSkin = localStorage.getItem('equippedSkin') || 'default';
  SHOP.ownedFeatured = localStorage.getItem('ownedFeatured') === '1';
}

const K_DAILY_OWNED = 'ownedDaily';

function getCoins() {
  const raw = localStorage.getItem('coins');
  const n = raw === null ? 50 : Number(raw);
  return Number.isFinite(n) ? n : 50;
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

function getOwnedDaily() {
  return new Set(JSON.parse(localStorage.getItem(K_DAILY_OWNED) || '[]'));
}

function saveOwnedDaily(set) {
  localStorage.setItem(K_DAILY_OWNED, JSON.stringify([...set]));
}

function isDailyOwned(id) {
  return getOwnedDaily().has(id);
}

function shopInit() {
  shopRenderFeatured();
  shopRenderDaily();
  shopRenderSkins();
  shopRenderCoins();
  shopRenderSkinOffers();

  const modal = document.getElementById('shopModal');
  if (modal) modal.addEventListener('click', () => shopCloseModal());

  const closeBtn = document.getElementById('shopModalClose');
  if (closeBtn) closeBtn.addEventListener('click', () => shopCloseModal());

  setCoins(getCoins());
  shopHighlightPendingSkin();
}

function shopRenderFeatured() {
  const list = shopData.featured || [];
  if (!list.length) return;

  const idx = getFeaturedIndex() % list.length;
  const f = list[idx];

  document.getElementById('featuredName').textContent = f.name;
  document.getElementById('featuredDesc').textContent = f.desc;
  document.getElementById('featuredIcon').textContent = f.icon;
  document.getElementById('featuredPrice').textContent = f.price;

  const btn = document.getElementById('featuredBuyBtn');
  btn.textContent = SHOP.ownedFeatured ? 'OWNED' : 'GET';
  btn.disabled = SHOP.ownedFeatured;

  btn.onclick = () => {
    if (SHOP.ownedFeatured) return;
    shopOpenModal({ ...f, type: 'featured' });
  };
}

const FEATURED_ROTATE_MS = 7 * 24 * 60 * 60 * 1000;
const K_FEATURED_START = 'featuredCycleStart';
const K_FEATURED_INDEX = 'featuredIndex';

function getFeaturedCycleStart() {
  let t = Number(localStorage.getItem(K_FEATURED_START) || 0);
  if (!t) {
    t = Date.now();
    localStorage.setItem(K_FEATURED_START, String(t));
  }
  return t;
}

function setFeaturedCycleStart(t) {
  localStorage.setItem(K_FEATURED_START, String(t));
}

function getFeaturedIndex() {
  return Number(localStorage.getItem(K_FEATURED_INDEX) || 0);
}

function setFeaturedIndex(i) {
  localStorage.setItem(K_FEATURED_INDEX, String(i));
}

function updateFeaturedTimer() {
  const el = document.getElementById('featuredTimer');
  if (!el) return;

  const start = getFeaturedCycleStart();
  const now = Date.now();
  const elapsed = now - start;
  const remaining = FEATURED_ROTATE_MS - (elapsed % FEATURED_ROTATE_MS);

  el.textContent = `NEW FEATURED IN ${formatRemaining(remaining)}`;
}

function rotateFeatured() {
  const list = shopData.featured || [];
  if (!list.length) return;

  setFeaturedIndex((getFeaturedIndex() + 1) % list.length);
  setFeaturedCycleStart(Date.now());

  shopRenderFeatured();
  updateFeaturedTimer();
}

function startFeaturedRotation() {
  updateFeaturedTimer();

  clearInterval(startFeaturedRotation._tick);
  startFeaturedRotation._tick = setInterval(updateFeaturedTimer, 1000);

  const start = getFeaturedCycleStart();
  const now = Date.now();
  const elapsed = now - start;
  const remaining = FEATURED_ROTATE_MS - (elapsed % FEATURED_ROTATE_MS);

  clearTimeout(startFeaturedRotation._align);
  startFeaturedRotation._align = setTimeout(() => {
    rotateFeatured();

    clearInterval(startFeaturedRotation._swap);
    startFeaturedRotation._swap = setInterval(
      rotateFeatured,
      FEATURED_ROTATE_MS
    );
  }, remaining);
}

function shopRenderDaily() {
  const row = document.getElementById('dailyOffersRow');
  if (!row) return;

  row.innerHTML = '';

  const daily3 = getSelectedDaily();
  const ownedDaily = getOwnedDaily();

  daily3.forEach((item) => {
    const owned = ownedDaily.has(item.id);

    const el = document.createElement('div');
    el.className = `offerCard ${owned ? 'owned' : ''}`.trim();

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
        <div class="priceChip">${owned ? '—' : `${item.price} 🪙`}</div>
        <button class="buyMiniBtn" ${owned ? 'disabled' : ''}>
          ${owned ? 'OWNED' : 'BUY'}
        </button>
      </div>
    `;

    const open = () => {
      if (owned) return;
      shopOpenModal({ ...item, type: 'daily' });
    };

    el.querySelector('.buyMiniBtn').onclick = (e) => {
      e.stopPropagation();
      open();
    };

    el.onclick = open;

    row.appendChild(el);
  });
}

const DAILY_GIFT_POOL_VERSION = 1;
const STORAGE_KEY_DAILY_GIFT_VERSION = 'dailyGiftPoolVersion';

function getDailyGiftForToday() {
  const ver = Number(localStorage.getItem(STORAGE_KEY_DAILY_GIFT_VERSION) || 0);
  if (ver !== DAILY_GIFT_POOL_VERSION) {
    localStorage.setItem(
      STORAGE_KEY_DAILY_GIFT_VERSION,
      String(DAILY_GIFT_POOL_VERSION)
    );
    localStorage.removeItem(STORAGE_KEY_DAILY_GIFT_TODAY);
    localStorage.removeItem(STORAGE_KEY_DAILY_GIFT_CLAIM);
  }

  const raw = localStorage.getItem(STORAGE_KEY_DAILY_GIFT_TODAY);
  if (raw) {
    const parsed = JSON.parse(raw);
    if (parsed?.day === getTodayKey() && parsed?.gift) return parsed.gift;
  }

  const gift = weightedPick(DAILY_GIFT_POOL);
  localStorage.setItem(
    STORAGE_KEY_DAILY_GIFT_TODAY,
    JSON.stringify({ day: getTodayKey(), gift })
  );
  return gift;
}

function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isDailyGiftClaimed() {
  return localStorage.getItem(STORAGE_KEY_DAILY_GIFT_CLAIM) === getTodayKey();
}

function setDailyGiftClaimed() {
  localStorage.setItem(STORAGE_KEY_DAILY_GIFT_CLAIM, getTodayKey());
}

function weightedPick(list) {
  const total = list.reduce((s, x) => s + (x.weight || 1), 0);
  let r = Math.random() * total;
  for (const item of list) {
    r -= item.weight || 1;
    if (r <= 0) return item;
  }
  return list[list.length - 1];
}

function renderDailyGiftCard() {
  const gift = getDailyGiftForToday();

  const nameEl = document.getElementById('freeGiftName');
  const descEl = document.getElementById('freeGiftDesc');
  const valEl = document.getElementById('freeGiftValue');
  const iconEl = document.getElementById('freeGiftIcon');

  if (!nameEl || !descEl || !valEl || !iconEl) return;

  nameEl.textContent = gift.name || 'Daily Gift';
  iconEl.textContent = gift.icon || '🎁';

  if (gift.type === 'coins') {
    valEl.textContent = `+${gift.amount} 🪙`;
    descEl.textContent = 'Free coins for today';
    return;
  }

  if (gift.type === 'boost') {
    valEl.textContent = 'FREE';
    descEl.textContent = 'Unlock a boost item';
    return;
  }

  if (gift.type === 'daily') {
    valEl.textContent = 'FREE';
    descEl.textContent = 'Unlock a daily shop item';
    return;
  }

  valEl.textContent = 'FREE';
  descEl.textContent = 'Claim your reward';
}

const K_OWNED_BOOSTS = 'ownedBoosts';

function getOwnedBoosts() {
  return new Set(JSON.parse(localStorage.getItem(K_OWNED_BOOSTS) || '[]'));
}

function saveOwnedBoosts(set) {
  localStorage.setItem(K_OWNED_BOOSTS, JSON.stringify([...set]));
}

function claimDailyGift() {
  if (isDailyGiftClaimed()) {
    updateDailyGiftUI();
    return;
  }

  const gift = getDailyGiftForToday();

  if (gift.type === 'coins') {
    setCoins(getCoins() + Number(gift.amount || 0));
    setDailyGiftClaimed();
    showToast(`Daily gift: +${gift.amount} coins`, 'success');
    renderDailyGiftCard();
    updateDailyGiftUI();
    return;
  }

  if (gift.type === 'boost') {
    const boosts = getOwnedBoosts();

    if (!boosts.has(gift.id)) {
      boosts.add(gift.id);
      saveOwnedBoosts(boosts);
      setDailyGiftClaimed();
      showToast(`Boost unlocked: ${gift.name}`, 'success');
      renderDailyGiftCard();
      updateDailyGiftUI();
      return;
    }

    setCoins(getCoins() + 120);
    setDailyGiftClaimed();
    showToast(`Already owned. Bonus: +120 coins`, 'success');
    renderDailyGiftCard();
    updateDailyGiftUI();
    return;
  }

  if (gift.type === 'daily') {
    const owned = getOwnedDaily();
    owned.add(gift.id);
    saveOwnedDaily(owned);

    setDailyGiftClaimed();
    showToast(`Unlocked: ${gift.name}`, 'success');
    shopRenderDaily();
    renderDailyGiftCard();
    updateDailyGiftUI();
    return;
  }

  setCoins(getCoins() + 100);
  setDailyGiftClaimed();
  showToast(`Daily gift claimed! +100 coins`, 'success');
  renderDailyGiftCard();
  updateDailyGiftUI();
}

function updateDailyGiftUI() {
  const btn = document.getElementById('freeGiftBtn');
  if (!btn) return;

  const claimed = isDailyGiftClaimed();

  btn.textContent = claimed ? 'CLAIMED' : 'CLAIM';
  btn.disabled = claimed;

  const gift = getDailyGiftForToday();
  const valEl = document.getElementById('freeGiftValue');
  if (valEl) {
    if (gift?.type === 'coins') valEl.textContent = `+${gift.amount} 🪙`;
    else valEl.textContent = claimed ? 'CLAIMED' : 'FREE';
  }
}

const SKIN_OFFERS_COUNT = 4;
const K_SKIN_OFFERS_IDS = 'skinOffersSelectedIds';
const K_SKIN_OFFERS_START = 'skinOffersCycleStart';
const SKIN_OFFERS_ROTATE_MS = 86400000;

function getSkinOffersCycleStart() {
  let t = Number(localStorage.getItem(K_SKIN_OFFERS_START) || 0);
  if (!t) {
    t = Date.now();
    localStorage.setItem(K_SKIN_OFFERS_START, String(t));
  }
  return t;
}

function setSkinOffersCycleStart(t) {
  localStorage.setItem(K_SKIN_OFFERS_START, String(t));
}

function isSkinOwned(id) {
  return id === 'default' || SHOP.ownedSkins.has(id);
}

function pickSkinOffersFresh() {
  const allPaid = (shopData.skins || []).filter((s) => s.price > 0);

  const notOwned = allPaid.filter((s) => !isSkinOwned(s.id));

  const picked = pickNRandomUnique(notOwned, SKIN_OFFERS_COUNT);

  if (picked.length < SKIN_OFFERS_COUNT) {
    const need = SKIN_OFFERS_COUNT - picked.length;

    const pickedIds = new Set(picked.map((x) => x.id));
    const fillers = allPaid.filter((s) => !pickedIds.has(s.id));

    picked.push(...pickNRandomUnique(fillers, need));
  }

  picked.sort((a, b) => {
    const rank = { RARE: 0, EPIC: 1, LEGENDARY: 2, COMMON: 3 };
    const ra = rank[(a.rarity || 'COMMON').toUpperCase()] ?? 99;
    const rb = rank[(b.rarity || 'COMMON').toUpperCase()] ?? 99;
    return ra - rb;
  });

  localStorage.setItem(
    K_SKIN_OFFERS_IDS,
    JSON.stringify(picked.map((x) => x.id))
  );
  setSkinOffersCycleStart(Date.now());
  return picked;
}

function getSelectedSkinOffers() {
  const skins = shopData.skins || [];
  const saved = JSON.parse(localStorage.getItem(K_SKIN_OFFERS_IDS) || '[]');
  const map = new Map(skins.map((x) => [x.id, x]));
  const selected = saved.map((id) => map.get(id)).filter(Boolean);

  if (
    selected.length === SKIN_OFFERS_COUNT &&
    selected.every((s) => s.price > 0)
  )
    return selected;

  return pickSkinOffersFresh();
}

function updateSkinOffersTimer() {
  const el = document.getElementById('skinOffersTimer');
  if (!el) return;

  const start = getSkinOffersCycleStart();
  const now = Date.now();
  const elapsed = now - start;
  const remaining = SKIN_OFFERS_ROTATE_MS - (elapsed % SKIN_OFFERS_ROTATE_MS);

  el.textContent = formatRemaining(remaining);
}

function shopRenderSkinOffers() {
  syncShopState();

  const grid = document.getElementById('skinOffersGrid');
  if (!grid) return;

  grid.innerHTML = '';

  const offers = getSelectedSkinOffers();

  offers.forEach((s) => {
    const owned = isSkinOwned(s.id);

    const el = document.createElement('div');
    const rarityClass = `rarity-card-${(s.rarity || 'COMMON').toUpperCase()}`;
    el.className = `shopItemCard ${rarityClass} ${owned ? 'owned' : ''}`.trim();

    const status = owned ? 'OWNED' : '';
    const priceText = owned ? '—' : `${s.price} 🪙`;
    const btnText = owned ? 'OWNED' : 'BUY';
    const btnDisabled = owned;

    const iconHtml = s.image
      ? `<img class="skinIconImg" src="${s.image}" alt="${s.name}">`
      : `<span class="skinIconEmoji">${s.icon || ''}</span>`;

    const rarity = (s.rarity || 'COMMON').toUpperCase();

    el.innerHTML = `
      <div class="itemTopLine">
        <div class="itemIcon">${iconHtml}</div>
        <div class="skinMeta">
          <div class="skinRarity rarity-${rarity}">${rarity}</div>
          <div class="skinOwned">${status}</div>
        </div>
      </div>

      <div class="itemName">${s.name}</div>
      <div class="itemDesc">${s.desc || ''}</div>

      <div class="itemBottomLine">
        <div class="itemPrice">${priceText}</div>
        <button class="itemBtn" ${
          btnDisabled ? 'disabled' : ''
        }>${btnText}</button>
      </div>
    `;

    const sid = normId(s.id);
    el.dataset.skinId = sid;

    const btn = el.querySelector('.itemBtn');

    btn.onclick = (e) => {
      e.stopPropagation();
      if (owned) return;
      shopOpenModal({ ...s, type: 'skin' });
    };

    el.onclick = () => {
      if (owned) return;
      shopOpenModal({ ...s, type: 'skin' });
    };

    grid.appendChild(el);
  });
  shopHighlightPendingSkin();
}

function selectNewSkinOffers() {
  pickSkinOffersFresh();
  shopRenderSkinOffers();
  updateSkinOffersTimer();
}

function startSkinOffersRotation() {
  updateSkinOffersTimer();

  clearInterval(startSkinOffersRotation._tick);
  startSkinOffersRotation._tick = setInterval(updateSkinOffersTimer, 500);

  const start = getSkinOffersCycleStart();
  const now = Date.now();
  const elapsed = now - start;
  const remaining = SKIN_OFFERS_ROTATE_MS - (elapsed % SKIN_OFFERS_ROTATE_MS);

  clearTimeout(startSkinOffersRotation._align);
  startSkinOffersRotation._align = setTimeout(() => {
    selectNewSkinOffers();

    clearInterval(startSkinOffersRotation._swap);
    startSkinOffersRotation._swap = setInterval(
      selectNewSkinOffers,
      SKIN_OFFERS_ROTATE_MS
    );
  }, remaining);
}

function shopRenderSkins() {
  syncShopState();

  const grid = document.getElementById('skinsGrid');
  if (!grid) return;

  grid.innerHTML = '';

  shopData.skins.forEach((s) => {
    const owned =
      s.id === 'default' || s.price === 0 || SHOP.ownedSkins.has(s.id);

    const el = document.createElement('div');
    const rarityClass = `rarity-card-${(s.rarity || 'COMMON').toUpperCase()}`;
    el.className = `shopItemCard ${rarityClass} ${owned ? 'owned' : ''}`.trim();

    const status = owned ? 'OWNED' : '';
    const priceText = owned ? '—' : `${s.price} 🪙`;

    const iconHtml = s.image
      ? `<img class="skinIconImg" src="${s.image}" alt="${s.name}">`
      : `<span class="skinIconEmoji">${s.icon || ''}</span>`;

    const btnText = owned ? 'OWNED' : 'BUY';
    const btnDisabled = owned;

    const rarity = (s.rarity || 'COMMON').toUpperCase();

    el.innerHTML = `
     <div class="itemTopLine">
      <div class="itemIcon">${iconHtml}</div>
      <div class="skinMeta">
      <div class="skinRarity rarity-${rarity}">${rarity}</div>
      <div class="skinOwned">${status}</div>
    </div>
  </div>

  <div class="itemName">${s.name}</div>
  <div class="itemDesc">${s.desc || ''}</div>

  <div class="itemBottomLine">
    <div class="itemPrice">${priceText}</div>
    <button class="itemBtn" ${btnDisabled ? 'disabled' : ''}>${btnText}</button>
  </div>
`;

    const sid = normId(s.id);
    el.dataset.skinId = sid;

    const btn = el.querySelector('.itemBtn');

    btn.onclick = (e) => {
      e.stopPropagation();
      if (owned) return;
      shopOpenModal({ ...s, type: 'skin' });
    };

    el.onclick = () => {
      if (owned) return;
      shopOpenModal({ ...s, type: 'skin' });
    };

    grid.appendChild(el);
  });
}

function shopRenderCoins() {
  const grid = document.getElementById('coinsGrid');
  if (!grid) return;

  grid.innerHTML = '';

  (shopData.coinPacks || []).forEach((p) => {
    const rarity = (p.rarity || 'COMMON').toUpperCase();
    const rarityClass = `rarity-card-${rarity}`;

    const el = document.createElement('div');
    el.className = `shopItemCard ${rarityClass}`.trim();

    el.innerHTML = `
      <div class="itemTopLine">
        <div class="itemIcon">${p.icon}</div>
        <div class="skinMeta">
          <div class="skinRarity rarity-${rarity}">${rarity}</div>
        </div>
      </div>

      <div class="itemName">${p.name}</div>
      <div class="itemDesc">${p.desc}</div>

      <div class="itemBottomLine">
        <div class="itemPrice">+${p.add} 🪙</div>
        <button class="itemBtn">CLAIM</button>
      </div>
    `;

    const open = () => shopOpenModal({ ...p, type: 'coin' });

    el.querySelector('.itemBtn').onclick = (e) => {
      e.stopPropagation();
      open();
    };
    el.onclick = open;

    grid.appendChild(el);
  });
}

function shopOpenModal(item) {
  const modal = document.getElementById('shopModal');
  if (!modal) return;

  modal.classList.remove('hidden');

  modal.classList.remove(
    'modal-COMMON',
    'modal-RARE',
    'modal-EPIC',
    'modal-LEGENDARY'
  );
  modal.classList.add(`modal-${(item.rarity || 'COMMON').toUpperCase()}`);

  const box = modal.querySelector('.shopModalBox');
  if (box) box.onclick = (e) => e.stopPropagation();

  const closeBtn = document.getElementById('shopModalClose');
  if (closeBtn) {
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      shopCloseModal();
    };
  }

  modal.onclick = () => shopCloseModal();

  const iconEl = document.getElementById('shopModalIcon');
  const titleEl = document.getElementById('shopModalTitle');
  const descEl = document.getElementById('shopModalDesc');
  const priceEl = document.getElementById('shopModalPrice');

  if (iconEl) iconEl.textContent = item.icon || '🛒';
  if (titleEl) titleEl.textContent = item.name || 'Item';
  if (descEl) descEl.textContent = item.desc || '';
  if (priceEl) priceEl.textContent = item.price ?? 0;

  if (priceEl)
    priceEl.textContent =
      item.type === 'coin' ? `+${item.add} 🪙` : (item.price ?? 0);

  const buyBtn = document.getElementById('shopModalBuy');
  if (!buyBtn) return;

  buyBtn.disabled = false;

  if (item.type === 'coin') {
    buyBtn.textContent = 'CLAIM';
  } else if (
    item.type === 'skin' &&
    (item.id === 'default' || item.price === 0 || SHOP.ownedSkins.has(item.id))
  ) {
    buyBtn.textContent = 'OWNED';
    buyBtn.disabled = true;
  } else if (item.type === 'featured' && SHOP.ownedFeatured) {
    buyBtn.textContent = 'OWNED';
    buyBtn.disabled = true;
  } else {
    buyBtn.textContent = 'BUY';
  }

  buyBtn.onclick = () => {
    if (buyBtn.disabled) return;
    shopBuy(item);
  };
}

function shopCloseModal() {
  const modal = document.getElementById('shopModal');
  modal.classList.add('hidden');
}

function shopBuy(item) {
  const price = Number(item.price || 0);
  const c = getCoins();

  if (item.type === 'coin') {
    setCoins(getCoins() + Number(item.add || 0));
    showToast(`+${item.add} coins!`, 'success');
    shopCloseModal();
    return;
  }

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
    shopRenderSkinOffers();
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
  initShopBlueScroller();
  initShopDotsNav();

  const btn = document.getElementById('freeGiftBtn');
  if (btn)
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      claimDailyGift();
    });

  renderDailyGiftCard();
  updateDailyGiftUI();
  setInterval(updateDailyGiftUI, 1000);

  startDailyRotation();
  startFeaturedRotation();
  startSkinOffersRotation();
});

function initShopBlueScroller() {
  const scroller = document.getElementById('shopScroll');
  const bar = document.getElementById('shopRail');
  const thumb = document.getElementById('shopScrollIndicator');
  if (!scroller || !bar || !thumb) return;

  let hideTm = null;
  let dragging = false;

  const showBar = () => {
    bar.classList.add('show');
    clearTimeout(hideTm);
    hideTm = setTimeout(() => bar.classList.remove('show'), 900);
  };

  const syncThumb = () => {
    const view = scroller.clientHeight;
    const total = scroller.scrollHeight;

    if (total <= view) {
      thumb.style.height = '0px';
      return;
    }

    const track = bar.clientHeight;
    const minH = 32;

    const h = Math.max(minH, (view / total) * track);
    const maxTop = track - h;

    const ratio = scroller.scrollTop / (total - view);
    const top = maxTop * ratio;

    thumb.style.height = `${h}px`;
    thumb.style.transform = `translateY(${top}px)`;
  };

  const setScrollFromThumbY = (clientY) => {
    const rect = bar.getBoundingClientRect();
    const track = rect.height;

    const thumbH = thumb.offsetHeight || 1;
    const maxTop = track - thumbH;

    let y = clientY - rect.top - thumbH / 2;
    y = Math.max(0, Math.min(y, maxTop));

    const view = scroller.clientHeight;
    const total = scroller.scrollHeight;

    const ratio = y / maxTop;
    scroller.scrollTop = ratio * (total - view);
  };

  scroller.addEventListener('scroll', syncThumb);
  scroller.addEventListener('pointerdown', showBar, { passive: true });
  scroller.addEventListener('pointermove', showBar, { passive: true });

  thumb.addEventListener('pointerdown', (e) => {
    dragging = true;
    showBar();
    thumb.setPointerCapture(e.pointerId);
    setScrollFromThumbY(e.clientY);
  });

  thumb.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    setScrollFromThumbY(e.clientY);
  });

  thumb.addEventListener('pointerup', () => {
    dragging = false;
    showBar();
  });

  window.addEventListener('resize', () => {
    syncThumb();
  });

  syncThumb();
}

function initShopDotsNav() {
  const scroller = document.getElementById('shopScroll');
  const dotsWrap = document.getElementById('shopDots');
  if (!scroller || !dotsWrap) return;

  const targets = Array.from(scroller.querySelectorAll('[data-shop-target]'));
  if (!targets.length) return;

  dotsWrap.innerHTML = '';
  const dots = targets.map((el, i) => {
    const b = document.createElement('button');
    b.className = 'shopDot';
    b.type = 'button';
    b.setAttribute(
      'aria-label',
      el.getAttribute('data-shop-target') || `Section ${i + 1}`
    );

    b.addEventListener('click', () => {
      const top = el.offsetTop;
      scroller.scrollTo({ top, behavior: 'smooth' });
    });

    dotsWrap.appendChild(b);
    return b;
  });

  const setActive = () => {
    const y = scroller.scrollTop + scroller.clientHeight * 0.25;
    let best = 0;
    for (let i = 0; i < targets.length; i++) {
      if (targets[i].offsetTop <= y) best = i;
    }
    dots.forEach((d, idx) => d.classList.toggle('active', idx === best));
  };

  scroller.addEventListener('scroll', setActive, { passive: true });
  window.addEventListener('resize', setActive);
  setActive();
}

function formatRemaining(ms) {
  let s = Math.max(0, Math.floor(ms / 1000));

  const days = Math.floor(s / 86400);
  s %= 86400;

  const hours = Math.floor(s / 3600);
  s %= 3600;

  const minutes = Math.floor(s / 60);
  const seconds = s % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

const DAILY_COUNT = 3;
const K_DAILY_IDS = 'dailySelectedIds';
const K_DAILY_START = 'dailyCycleStart';

function getDailyCycleStart() {
  let t = Number(localStorage.getItem(K_DAILY_START) || 0);
  if (!t) {
    t = Date.now();
    localStorage.setItem(K_DAILY_START, String(t));
  }
  return t;
}

function setDailyCycleStart(t) {
  localStorage.setItem(K_DAILY_START, String(t));
}

function pickNRandomUnique(arr, n) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

function getSelectedDaily() {
  const pool = shopData.dailyPool || [];
  const saved = JSON.parse(localStorage.getItem(K_DAILY_IDS) || '[]');
  const map = new Map(pool.map((x) => [x.id, x]));
  const selected = saved.map((id) => map.get(id)).filter(Boolean);

  if (selected.length === DAILY_COUNT) return selected;

  const fresh = pickNRandomUnique(pool, DAILY_COUNT);
  localStorage.setItem(K_DAILY_IDS, JSON.stringify(fresh.map((x) => x.id)));
  setDailyCycleStart(Date.now());
  return fresh;
}

const DAILY_ROTATE_MS = 86400000;

function updateDailyTimer() {
  const el = document.getElementById('dailyTimer');
  if (!el) return;

  const start = getDailyCycleStart();
  const now = Date.now();

  const elapsed = now - start;
  const remaining = DAILY_ROTATE_MS - (elapsed % DAILY_ROTATE_MS);

  el.innerHTML = `${formatRemaining(remaining)}`;
}

function selectNewDaily() {
  const pool = shopData.dailyPool || [];
  const fresh = pickNRandomUnique(pool, DAILY_COUNT);

  localStorage.setItem(K_DAILY_IDS, JSON.stringify(fresh.map((x) => x.id)));
  setDailyCycleStart(Date.now());

  shopRenderDaily();
  updateDailyTimer();
}

function startDailyRotation() {
  updateDailyTimer();

  clearInterval(startDailyRotation._tick);
  startDailyRotation._tick = setInterval(updateDailyTimer, 500);

  const start = getDailyCycleStart();
  const now = Date.now();

  const elapsed = now - start;
  const remaining = DAILY_ROTATE_MS - (elapsed % DAILY_ROTATE_MS);

  clearTimeout(startDailyRotation._align);
  startDailyRotation._align = setTimeout(() => {
    selectNewDaily();

    clearInterval(startDailyRotation._swap);
    startDailyRotation._swap = setInterval(selectNewDaily, DAILY_ROTATE_MS);
  }, remaining);
}

function shopHighlightPendingSkin() {
  const scroller = document.getElementById('shopScroll');
  if (!scroller) return;

  const raw = localStorage.getItem(K_SHOP_HIGHLIGHT_SKIN) || '';
  const id = normId(raw);
  if (!id) return;

  localStorage.removeItem(K_SHOP_HIGHLIGHT_SKIN);

  const card = scroller.querySelector(`[data-skin-id="${id}"]`);
  if (!card) return;

  scroller
    .querySelectorAll('.shopHighlight')
    .forEach((x) => x.classList.remove('shopHighlight'));

  const top =
    card.getBoundingClientRect().top -
    scroller.getBoundingClientRect().top +
    scroller.scrollTop;

  scroller.scrollTo({ top: Math.max(0, top - 80), behavior: 'smooth' });

  card.classList.add('shopHighlight');
  setTimeout(() => card.classList.remove('shopHighlight'), 1800);
}

function shopOnEnter() {
  const scroller = document.getElementById('shopScroll');
  if (!scroller) return;

  const jump = sessionStorage.getItem('shopJumpTo');

  if (jump !== 'skinOffers') {
    scroller.scrollTo({ top: 0, behavior: 'auto' });
    return;
  }

  sessionStorage.removeItem('shopJumpTo');

  const section = scroller.querySelector('[data-shop-target="Skin Offers"]');
  if (!section) return;

  scroller.scrollTo({
    top: Math.max(0, section.offsetTop - 12),
    behavior: 'smooth',
  });

  const targetId = (sessionStorage.getItem('shopHighlightSkin') || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[_-]+/g, '');

  sessionStorage.removeItem('shopHighlightSkin');

  setTimeout(() => {
    const card = scroller.querySelector(`[data-skin-id="${targetId}"]`);
    if (!card) return;

    scroller
      .querySelectorAll('.shopHighlight')
      .forEach((x) => x.classList.remove('shopHighlight'));
    card.classList.add('shopHighlight');
    setTimeout(() => card.classList.remove('shopHighlight'), 1800);
  }, 250);
}
