// item shop script
const SHOP = {
  ownedSkins: new Set(JSON.parse(localStorage.getItem('ownedSkins') || '[]')),
  equippedSkin: localStorage.getItem('equippedSkin') || '',
  ownedFeatured: localStorage.getItem('ownedFeatured') === '1',
};

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
      icon: '🟦',
      price: 0,
    },
    {
      id: 'redclassic',
      name: 'Red Classic',
      image: './images/shopAInventoryicons/redSkunIcone.png',
      desc: 'Red classic',
      icon: '🟦',
      price: 1,
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

const K_DAILY_OWNED = 'ownedDaily';

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

  const modal = document.getElementById('shopModal');
  if (modal) modal.addEventListener('click', () => shopCloseModal());

  const closeBtn = document.getElementById('shopModalClose');
  if (closeBtn) closeBtn.addEventListener('click', () => shopCloseModal());

  setCoins(getCoins());
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

function shopRenderSkins() {
  const grid = document.getElementById('skinsGrid');
  if (!grid) return;

  grid.innerHTML = '';

  shopData.skins.forEach((s) => {
    const owned = SHOP.ownedSkins.has(s.id);
    const equipped = SHOP.equippedSkin === s.id;

    const el = document.createElement('div');
    el.className = `shopItemCard ${owned ? 'owned' : ''}`.trim();

    const status = equipped ? 'EQUIPPED' : owned ? 'OWNED' : '';
    const priceText = owned ? '—' : `${s.price} 🪙`;
    const btnText = owned ? (equipped ? 'EQUIPPED' : 'EQUIP') : 'BUY';

    el.innerHTML = `
      <div class="itemTopLine">
        <div class="itemIcon">${s.icon}</div>
        <div style="font-size:11px;font-weight:1000;letter-spacing:2px;color:rgba(255,255,255,0.75);text-transform:uppercase;">
          ${status}
        </div>
      </div>

      <div class="itemName">${s.name}</div>
      <div class="itemDesc">${s.desc}</div>

      <div class="itemBottomLine">
        <div class="itemPrice">${priceText}</div>
        <button class="itemBtn" ${
          equipped ? 'disabled' : ''
        }>${btnText}</button>
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
  initShopBlueScroller();
  initShopDotsNav();

  startDailyRotation();
  startFeaturedRotation();
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
