const DEFAULT_SKIN = 'default';

function normalizeSkinId(id) {
  return String(id || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[_-]+/g, '');
}

const STORAGE_KEY_EQUIPPED_SKIN = 'equippedSkin';

function getEquippedSkin() {
  const raw = localStorage.getItem(STORAGE_KEY_EQUIPPED_SKIN) || DEFAULT_SKIN;
  const n = normalizeSkinId(raw);
  return n || DEFAULT_SKIN;
}

function setEquippedSkin(id) {
  const n = normalizeSkinId(id) || DEFAULT_SKIN;
  localStorage.setItem(STORAGE_KEY_EQUIPPED_SKIN, n);
}

function getOwnedWeaponsArr() {
  const arr = JSON.parse(localStorage.getItem('ownedWeapons') || '[]');
  if (!arr.includes(DEFAULT_WEAPON)) arr.unshift(DEFAULT_WEAPON);
  return arr;
}

function getAllSkinsArr() {
  return (shopData?.skins || []).map((s) => ({
    ...s,
    id: normalizeSkinId(s.id),
  }));
}

function getOwnedSkinsSet() {
  return new Set(
    JSON.parse(localStorage.getItem('ownedSkins') || '[]').map(normalizeSkinId)
  );
}

function isSkinOwnedInv(id) {
  const n = normalizeSkinId(id);
  return n === DEFAULT_SKIN || getOwnedSkinsSet().has(n);
}

function equipSkin(id) {
  const n = normalizeSkinId(id);
  if (!isSkinOwnedInv(n)) return;
  setEquippedSkin(n);
  openInv('skins');
  renderInventoryOverview?.();
}

function openInv(type) {
  const modal = document.getElementById('invModal');
  const title = document.getElementById('invModalTitle');
  const grid = document.getElementById('invModalGrid');

  if (!modal || !title || !grid) return;
  closeSkinPreview();

  title.textContent = type === 'skins' ? 'SKINS' : 'WEAPONS';
  grid.innerHTML = '';

  if (type === 'skins') {
    const all = getAllSkinsArr();

    if (!all.length) {
      grid.innerHTML = `<div class="invEmpty">No skins</div>`;
    } else {
      const ownedList = all.filter((s) => isSkinOwnedInv(s.id));
      const lockedList = all.filter((s) => !isSkinOwnedInv(s.id));

      const renderSkinCard = (s, owned) => {
        const equipped = getEquippedSkin() === s.id;
        const img = s.image || './images/shopAInventoryicons/skin1Icon.png';
        const name = s.name || s.id;

        const el = document.createElement('div');
        el.className = `invOwnedCard skinCard ${owned ? 'owned' : 'locked'} ${
          equipped ? 'equipped' : ''
        }`.trim();

        const btnText = owned ? (equipped ? 'EQUIPPED' : 'EQUIP') : '';
        const btnDisabled = owned && equipped;

        el.innerHTML = `
        <div class="invOwnedBody">
          <div class="invOwnedIcon">
            <img src="${img}" draggable="false" />
          </div>
          <div class="invOwnedName skinCardName">${name}</div>
        </div>

        ${
          owned
            ? `<button class="EquipBtn" ${btnDisabled ? 'disabled' : ''}>
                 ${btnText}
               </button>`
            : ``
        }
      `;

        const rarity = String(s.rarity || 'COMMON').toUpperCase();
        const nameNode = el.querySelector('.skinCardName');

        if (nameNode) {
          nameNode.classList.remove(
            'name-COMMON',
            'name-RARE',
            'name-EPIC',
            'name-LEGENDARY'
          );
          nameNode.classList.add(`name-${rarity}`);
        }

        el.onclick = (e) => {
          e.stopPropagation();
          openSkinPreview(s);
        };

        grid.appendChild(el);
      };

      ownedList.forEach((s) => renderSkinCard(s, true));

      if (lockedList.length) {
        const divider = document.createElement('div');
        divider.className = 'invLockedDivider';
        divider.textContent = 'NOT OWNED';
        grid.appendChild(divider);

        lockedList.forEach((s) => renderSkinCard(s, false));
      }
    }
  }

  if (type === 'weapons') {
    const allWeaponIds = Object.keys(WEAPONS || {});
    const ownedList = allWeaponIds.filter((id) => isWeaponOwned(id));
    const lockedList = allWeaponIds.filter((id) => !isWeaponOwned(id));

    const renderWeaponCard = (id, owned) => {
      const w = WEAPONS[id] || {};
      const name = w.name || id;
      const img = w.img || './images/skins/placeholder.png';
      const equipped = getEquippedWeapon() === id;

      const el = document.createElement('div');
      el.className = `invOwnedCard weaponCard ${owned ? 'owned' : 'locked'} ${
        equipped ? 'equipped' : ''
      }`.trim();

      el.innerHTML = `
      <div class="invOwnedIcon">
        <img src="${img}" draggable="false" />
      </div>
      <div class="invOwnedName">${name}</div>
      ${
        owned
          ? `<button class="EquipBtn" ${equipped ? 'disabled' : ''}>
               ${equipped ? 'EQUIPPED' : 'EQUIP'}
             </button>`
          : ``
      }
    `;

      if (owned) {
        el.querySelector('.EquipBtn')?.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!equipped) equipWeaponFromInventory(id);
        });
      }

      grid.appendChild(el);
    };

    if (!allWeaponIds.length) {
      grid.innerHTML = `<div class="invEmpty">No weapons yet</div>`;
    } else {
      ownedList.forEach((id) => renderWeaponCard(id, true));

      if (lockedList.length) {
        const divider = document.createElement('div');
        divider.className = 'invLockedDivider';
        divider.textContent = 'NOT OWNED';
        grid.appendChild(divider);

        lockedList.forEach((id) => renderWeaponCard(id, false));
      }
    }
  }

  modal.classList.remove('hidden');
}

function closeSkinPreview() {
  document.getElementById('skinPreview')?.classList.add('hidden');
}

function openSkinPreview(s) {
  const wrap = document.getElementById('skinPreview');
  const img = document.getElementById('skinPreviewImg');
  const nameEl = document.getElementById('skinPreviewName');
  const equipBtn = document.getElementById('skinPreviewEquip');

  const rarityEl = document.getElementById('skinPreviewRarity');

  const priceRow = document.getElementById('skinPreviewPriceRow');
  const priceEl = document.getElementById('skinPreviewPrice');

  const shopRow = document.getElementById('skinPreviewShopRow');
  const shopText = document.getElementById('skinPreviewShopText');
  const goShopBtn = document.getElementById('skinPreviewGoShop');

  if (!wrap || !img || !nameEl || !equipBtn || !rarityEl) return;

  const id = normalizeSkinId(s.id);
  const owned = isSkinOwnedInv(id);
  const equipped = getEquippedSkin() === id;

  wrap.classList.remove('hidden');

  img.src = s.image || './images/shopAInventoryicons/skin1Icon.png';
  nameEl.textContent = s.name || id;

  const rarity = String(s.rarity || 'COMMON').toUpperCase();
  rarityEl.textContent = rarity;

  rarityEl.classList.remove('is-COMMON', 'is-RARE', 'is-EPIC', 'is-LEGENDARY');
  rarityEl.classList.add(`is-${rarity}`);

  nameEl.classList.remove(
    'name-COMMON',
    'name-RARE',
    'name-EPIC',
    'name-LEGENDARY'
  );
  nameEl.classList.add(`name-${rarity}`);

  if (priceRow && priceEl) {
    if (!owned) {
      priceRow.classList.remove('hidden');
      priceEl.textContent = `${Number(s.price || 0)} 🪙`;
    } else {
      priceRow.classList.add('hidden');
    }
  }

  if (shopRow && shopText && goShopBtn) {
    const inShop = (shopData?.skins || []).some(
      (x) => normalizeSkinId(x.id) === id
    );

    if (!owned && inShop) {
      shopRow.classList.remove('hidden');
      shopText.textContent = 'AVAILABLE';
      goShopBtn.onclick = () => {
        closeSkinPreview();
        document.querySelector('[data-target="shopScreen"]')?.click();
        setTimeout(() => {
          const el =
            document.getElementById('skinOffersGrid') ||
            document.getElementById('skinsGrid');
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      };
    } else {
      shopRow.classList.add('hidden');
    }
  }

  equipBtn.textContent = equipped ? 'EQUIPPED' : 'EQUIP';
  equipBtn.disabled = equipped || !owned;

  equipBtn.classList.toggle('hidden', !owned);

  equipBtn.onclick = () => {
    if (!owned || equipped) return;
    equipSkin(id);
    closeSkinPreview();
  };
}

function closeInv() {
  closeSkinPreview();
  document.getElementById('invModal')?.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('invModal');
  const closeBtn = document.getElementById('invModalClose');
  const box = modal?.querySelector('.invModalBox');

  if (!modal) return;

  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeInv();
  });

  box?.addEventListener('click', (e) => e.stopPropagation());

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeInv();
  });

  document
    .getElementById('skinPreviewClose')
    ?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSkinPreview();
    });

  document.getElementById('skinPreview')?.addEventListener('click', (e) => {
    if (e.currentTarget === e.target) closeSkinPreview();
  });

  renderInventoryOverview();

  document
    .querySelector('[data-target="inventoryScreen"]')
    ?.addEventListener('click', () => {
      renderInventoryOverview();
    });
});

function getOwnedSkinsCount() {
  return getOwnedSkinsSet().size;
}

function getOwnedWeaponsCount() {
  return getOwnedWeaponsArr().length;
}

function renderInventoryOverview() {
  // ===== SKINS =====
  const allSkins = getAllSkinsArr().length + 1;

  const skinsCount = document.getElementById('invSkinsCount');
  if (skinsCount) {
    skinsCount.textContent = `${getOwnedSkinsCount()}/${allSkins}`;
  }

  // ===== WEAPONS =====
  const allWeapons = Object.keys(WEAPONS || {}).length;
  const ownedWeapons = getOwnedWeaponsCount();

  const weaponsCount = document.getElementById('invWeaponsCount');
  if (weaponsCount) {
    weaponsCount.textContent = `${ownedWeapons}/${allWeapons}`;
  }
}
