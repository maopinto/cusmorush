const DEFAULT_SKIN = 'default';

function normalizeSkinId(id) {
  return String(id || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[_-]+/g, '');
}

let invOpenType = null;

function invT(key, params = null) {
  return t(getLang(), key, params);
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

const STORAGE_KEY_EQUIPPED_SUPER = 'equippedSuper';

function getOwnedSupersArr() {
  return JSON.parse(localStorage.getItem('ownedSupers') || '[]');
}

function isSuperOwned(id) {
  return (SUPERS[id]?.price ?? 0) === 0 || getOwnedSupersArr().includes(id);
}

function getEquippedSuper() {
  return localStorage.getItem(STORAGE_KEY_EQUIPPED_SUPER) || '';
}

function setEquippedSuper(id) {
  localStorage.setItem(STORAGE_KEY_EQUIPPED_SUPER, id);
}

function openInv(type) {
  closePetPreview?.();
  closeSuperPreview?.();
  closeWeaponPreview?.();
  invOpenType = type;

  const modal = document.getElementById('invModal');
  const title = document.getElementById('invModalTitle');
  const grid = document.getElementById('invModalGrid');

  if (!modal || !title || !grid) return;
  closeSkinPreview();

  title.textContent =
    type === 'skins'
      ? invT('inv.modal.skins')
      : type === 'weapons'
        ? invT('inv.modal.weapons')
        : type === 'pets'
          ? invT('inv.modal.pets')
          : type === 'supers'
            ? invT('inv.modal.supers')
            : invT('inventory.title');
  grid.innerHTML = '';

  if (type === 'skins') {
    const all = getAllSkinsArr();

    if (!all.length) {
      grid.innerHTML = `<div class="invEmpty">${invT('inv.empty.skins')}</div>`;
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

        const btnText = owned
          ? equipped
            ? invT('ui.equipped')
            : invT('ui.equip')
          : '';
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
    closeSkinPreview();
    closePetPreview?.();
    closeSuperPreview?.();
    closeWeaponPreview?.();

    const allWeaponIds = Object.keys(WEAPONS || {});
    const ownedList = allWeaponIds.filter((wid) => isWeaponOwned(wid));
    const lockedList = allWeaponIds.filter((wid) => !isWeaponOwned(wid));

    const renderWeaponCard = (wid, owned) => {
      const w = WEAPONS[wid] || {};
      const name = w.name || wid;
      const img = w.img || './images/skins/placeholder.png';
      const equipped = getEquippedWeapon() === wid;

      const el = document.createElement('div');
      el.className =
        `invOwnedCard weaponCard ${owned ? 'owned' : 'locked'} ${equipped ? 'equipped' : ''}`.trim();

      el.innerHTML = `
      <div class="invOwnedIcon">
        <img src="${img}" draggable="false" />
      </div>
      <div class="invOwnedName">${name}</div>
      ${
        owned
          ? `<button class="EquipBtn" ${equipped ? 'disabled' : ''}>
               ${equipped ? invT('ui.equipped') : invT('ui.equip')}
             </button>`
          : ``
      }
    `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        openWeaponPreview(wid);
      });

      if (owned) {
        el.querySelector('.EquipBtn')?.addEventListener('click', (e) => {
          e.stopPropagation();
          if (equipped) return;
          equipWeaponFromInventory(wid);
        });
      }

      grid.appendChild(el);
    };

    if (!allWeaponIds.length) {
      grid.innerHTML = `<div class="invEmpty">${invT('inv.empty.weapons')}</div>`;
    } else {
      ownedList.forEach((wid) => renderWeaponCard(wid, true));

      if (lockedList.length) {
        const divider = document.createElement('div');
        divider.className = 'invLockedDivider';
        divider.textContent = invT('inv.notOwned') || 'NOT OWNED';
        grid.appendChild(divider);

        lockedList.forEach((wid) => renderWeaponCard(wid, false));
      }
    }
  }

  if (type === 'pets') {
    closeSkinPreview();
    closePetPreview();
    const allPetIds = Object.keys(PETS || {});
    const ownedSet = getOwnedPetsSet();

    const ownedList = allPetIds.filter((pid) =>
      ownedSet.has(normalizeSkinId(pid))
    );
    const lockedList = allPetIds.filter(
      (pid) => !ownedSet.has(normalizeSkinId(pid))
    );

    const renderPetCard = (pid, owned) => {
      const p = PETS[pid] || {};
      const name = p.name || pid;
      const img = p.img || './images/skins/placeholder.png';
      const equipped = getEquippedPet() === normalizeSkinId(pid);

      const el = document.createElement('div');
      el.className =
        `invOwnedCard petCard ${owned ? 'owned' : 'locked'} ${equipped ? 'equipped' : ''}`.trim();

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
          if (equipped) return;
          setEquippedPet(pid);
          openInv('pets');
          renderInventoryOverview?.();
        });
      }

      grid.appendChild(el);

      el.onclick = (e) => {
        e.stopPropagation();
        openPetPreview({ ...p, id: pid });
      };
    };

    if (!allPetIds.length) {
      grid.innerHTML = `<div class="invEmpty">${invT('inv.empty.pets')}</div>`;
    } else {
      ownedList.forEach((pid) => renderPetCard(pid, true));

      if (lockedList.length) {
        const divider = document.createElement('div');
        divider.className = 'invLockedDivider';
        divider.textContent = invT('inv.notOwned');
        grid.appendChild(divider);

        lockedList.forEach((pid) => renderPetCard(pid, false));
      }
    }
  }

  if (type === 'supers') {
    const allSuperKeys = Object.keys(SUPERS || {});

    const ownedSet = new Set(
      JSON.parse(localStorage.getItem('ownedSupers') || '[]').map(
        normalizeSkinId
      )
    );

    const isOwned = (key) => {
      const n = normalizeSkinId(key);
      return ownedSet.has(n) || (SUPERS?.[key]?.price ?? 0) === 0;
    };

    const ownedList = allSuperKeys.filter(isOwned);
    const lockedList = allSuperKeys.filter((k) => !isOwned(k));

    const renderSuperCard = (key, owned) => {
      const sKey = key;
      const s = SUPERS[sKey] || {};

      const imgSrc = s.img || './images/logosImage/superIcone.png';
      const name = s.title || sKey;

      const equipped =
        normalizeSkinId(localStorage.getItem('equippedSuper')) ===
        normalizeSkinId(sKey);

      const el = document.createElement('div');
      el.className =
        `invOwnedCard superCard ${owned ? 'owned' : 'locked'} ${equipped ? 'equipped' : ''}`.trim();

      const btnText = owned
        ? equipped
          ? invT('ui.equipped')
          : invT('ui.equip')
        : '';

      const btnDisabled = owned && equipped;

      el.innerHTML = `
      <div class="invOwnedBody">
        <div class="invOwnedIcon">
          <img src="${imgSrc}" draggable="false" />
        </div>
        <div class="invOwnedName">${name}</div>
      </div>
      ${owned ? `<button class="EquipBtn" ${btnDisabled ? 'disabled' : ''}>${btnText}</button>` : ``}
    `;

      if (owned) {
        el.querySelector('.EquipBtn')?.addEventListener('click', (e) => {
          e.stopPropagation();
          if (btnDisabled) return;
          setEquippedSuper(sKey);
          updateSuperEquipUI?.();
          openInv('supers');
          renderInventoryOverview?.();
        });
      }

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        openSuperPreview({ ...s, id: sKey });
      });

      grid.appendChild(el);
    };

    if (!allSuperKeys.length) {
      grid.innerHTML = `<div class="invEmpty">${invT('inv.empty.supers')}</div>`;
    } else {
      ownedList.forEach((k) => renderSuperCard(k, true));

      if (lockedList.length) {
        const divider = document.createElement('div');
        divider.className = 'invLockedDivider';
        divider.textContent = invT('inv.notOwned');
        grid.appendChild(divider);

        lockedList.forEach((k) => renderSuperCard(k, false));
      }
    }
  }

  const box = modal.querySelector('.invModalBox');
  title.classList.toggle('supersTheme', type === 'supers');
  box?.classList.toggle('supersTheme', type === 'supers');
  modal.classList.toggle('isSupers', type === 'supers');
  modal.classList.toggle('isSkins', type === 'skins');

  modal.classList.remove('hidden');
}

function closeWeaponPreview() {
  document.getElementById('weaponPreview')?.classList.add('hidden');
}

function openWeaponPreview(id) {
  const wrap = document.getElementById('weaponPreview');
  const img = document.getElementById('weaponPreviewImg');
  const nameEl = document.getElementById('weaponPreviewName');
  const descEl = document.getElementById('weaponPreviewDesc');
  const statsEl = document.getElementById('weaponPreviewStats');
  const equipBtn = document.getElementById('weaponPreviewEquip');
  const priceRow = document.getElementById('weaponPreviewPriceRow');
  const priceEl = document.getElementById('weaponPreviewPrice');
  const goLoadoutBtn = document.getElementById('weaponPreviewGoLoadout');

  if (
    !wrap ||
    !img ||
    !nameEl ||
    !descEl ||
    !statsEl ||
    !equipBtn ||
    !goLoadoutBtn
  )
    return;

  const w = WEAPONS?.[id] || {};
  const owned = isWeaponOwned(id);
  const equipped = getEquippedWeapon() === id;

  wrap.classList.remove('hidden');

  img.src = w.img || './images/skins/placeholder.png';
  nameEl.textContent = w.name || id;

  const desc = w.desc ?? w.description ?? w.info ?? w.text ?? w.lore ?? '';
  if (desc) {
    descEl.textContent = String(desc);
  } else {
    const nid = String(id).toLowerCase();
    descEl.textContent = nid.includes('missile')
      ? 'Heavy projectile with strong impact.'
      : nid.includes('laser')
        ? 'Fast shots with a high fire rate.'
        : nid.includes('triangle')
          ? 'Wide spread shots for crowd control.'
          : 'Weapon description coming soon.';
  }

  const statsObj = w.stats ?? w.attributes ?? w.upgrades ?? null;

  let statsText = '';
  if (
    statsObj &&
    typeof statsObj === 'object' &&
    Object.keys(statsObj).length
  ) {
    statsText = Object.entries(statsObj)
      .map(([k, v]) => `${k}: ${v}`)
      .join('  •  ');
  } else {
    const dmg = w.damage ?? w.dmg;
    const rate = w.fireRate ?? w.rate ?? w.cooldown;
    const speed = w.speed ?? w.projectileSpeed;
    const range = w.range ?? w.maxRange;

    const parts = [];
    if (dmg != null) parts.push(`DMG: ${dmg}`);
    if (rate != null) parts.push(`RATE: ${rate}`);
    if (speed != null) parts.push(`SPEED: ${speed}`);
    if (range != null) parts.push(`RANGE: ${range}`);

    statsText = parts.join('  •  ') || (w.statsText ? String(w.statsText) : '');
  }

  statsEl.textContent = statsText || 'Stats coming soon.';

  if (priceRow && priceEl) {
    if (!owned && w.price != null) {
      priceRow.classList.remove('hidden');
      priceEl.textContent = `${Number(w.price || 0)} 🪙`;
    } else {
      priceRow.classList.add('hidden');
    }
  }

  equipBtn.textContent = equipped ? invT('ui.equipped') : invT('ui.equip');
  equipBtn.disabled = equipped || !owned;
  equipBtn.classList.toggle('hidden', !owned);

  equipBtn.onclick = () => {
    if (!owned || equipped) return;
    equipWeaponFromInventory(id);
    closeWeaponPreview?.();
  };

  goLoadoutBtn.className = 'weaponGoLoadoutBtn';
  goLoadoutBtn.style.display = '';
  goLoadoutBtn.classList.toggle('hidden', !owned);

  goLoadoutBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    closeWeaponPreview?.();
    closeInv?.();

    document.querySelector('[data-target="loadoutScreen"]')?.click();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (typeof openWeaponDiv === 'function') {
          openWeaponDiv({ stopPropagation() {}, preventDefault() {} });
        }

        const screen = document.querySelector('.screen');
        const phone = document.querySelector('.phone-frame');
        screen?.scrollTo(0, 0);
        phone?.scrollTo(0, 0);
        document.documentElement.scrollLeft = 0;
        document.body.scrollLeft = 0;

        const list = document.getElementById('weaponDiv');
        const item = document.querySelector(`.weaponItem[data-weapon="${id}"]`);
        if (!list || !item) return;

        list.scrollLeft = 0;

        const top =
          item.offsetTop - list.clientHeight / 2 + item.clientHeight / 2;
        list.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      });
    });
  };
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
      shopText.textContent = invT('inv.available');
      goShopBtn.onclick = (e) => {
        e.stopPropagation();

        sessionStorage.setItem('shopJumpTo', 'skinOffers');
        sessionStorage.setItem('shopHighlightSkin', id);

        closeSkinPreview();
        closeInv(); // ← זה מה שחסר לך

        document.querySelector('[data-target="shopScreen"]')?.click();

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const scroller = document.getElementById('shopScroll');
            const section = scroller?.querySelector(
              '[data-shop-target="Skin Offers"]'
            );
            if (!scroller || !section) return;

            scroller.scrollTo({
              top: Math.max(0, section.offsetTop - 12),
              behavior: 'smooth',
            });

            const targetId = (sessionStorage.getItem('shopHighlightSkin') || '')
              .toLowerCase()
              .replace(/\s+/g, '')
              .replace(/[_-]+/g, '');

            setTimeout(() => {
              const card = scroller.querySelector(
                `[data-skin-id="${targetId}"]`
              );
              if (!card) return;

              scroller
                .querySelectorAll('.shopHighlight')
                .forEach((x) => x.classList.remove('shopHighlight'));
              card.classList.add('shopHighlight');
              setTimeout(() => card.classList.remove('shopHighlight'), 1800);
            }, 250);
          });
        });
      };
    } else {
      shopRow.classList.add('hidden');
    }
  }

  equipBtn.textContent = equipped ? invT('ui.equipped') : invT('ui.equip');

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
  closePetPreview?.();
  closeSuperPreview?.();
  closeWeaponPreview?.();

  const modal = document.getElementById('invModal');
  const title = document.getElementById('invModalTitle');
  const box = modal?.querySelector('.invModalBox');

  title?.classList.remove('supersTheme');
  box?.classList.remove('supersTheme');
  modal?.classList.remove('isSupers');

  modal?.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('invModal');
  const closeBtn = document.getElementById('invModalClose');
  const box = modal?.querySelector('.invModalBox');

  if (!modal) return;

  if (!localStorage.getItem(STORAGE_KEY_OWNED_PETS)) {
    localStorage.setItem(STORAGE_KEY_OWNED_PETS, JSON.stringify(['chimpo']));
  }
  if (!localStorage.getItem(STORAGE_KEY_EQUIPPED_PET)) {
    localStorage.setItem(STORAGE_KEY_EQUIPPED_PET, 'chimpo');
  }

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
  document.getElementById('petPreviewClose')?.addEventListener('click', (e) => {
    e.stopPropagation();
    closePetPreview();
  });

  document.getElementById('petPreview')?.addEventListener('click', (e) => {
    if (e.currentTarget === e.target) closePetPreview();
  });

  document
    .getElementById('superPreviewClose')
    ?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSuperPreview();
    });

  document.getElementById('superPreview')?.addEventListener('click', (e) => {
    if (e.currentTarget === e.target) closeSuperPreview();
  });
  ('');

  document
    .getElementById('weaponPreviewClose')
    ?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeWeaponPreview();
    });

  document.getElementById('weaponPreview')?.addEventListener('click', (e) => {
    if (e.currentTarget === e.target) closeWeaponPreview();
  });
});

function getOwnedSkinsCount() {
  return getOwnedSkinsSet().size;
}

function getOwnedWeaponsCount() {
  return getOwnedWeaponsArr().length;
}

function getOwnedSupersSet() {
  return new Set(JSON.parse(localStorage.getItem('ownedSupers') || '[]'));
}

function renderInventoryOverview() {
  // ===== SKINS =====
  const allSkins = getAllSkinsArr().length;

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

  // ===== pets =====
  const allPets = Object.keys(PETS || {}).length;
  const ownedPets = getOwnedPetsArr().length;

  const petsCount = document.getElementById('invPetsCount');
  if (petsCount) petsCount.textContent = `${ownedPets}/${allPets}`;

  // ===== SUPERS =====
  const allSupers = Object.keys(SUPERS || {}).length;
  const ownedSupers = getOwnedSupersSet().size;

  const supersCount = document.getElementById('invSupersCount');
  if (supersCount) supersCount.textContent = `${ownedSupers}/${allSupers}`;
}

const STORAGE_KEY_OWNED_PETS = 'ownedPets';
const STORAGE_KEY_EQUIPPED_PET = 'equippedPet';

function getOwnedPetsArr() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY_OWNED_PETS) || '[]');
}

function getOwnedPetsSet() {
  return new Set(getOwnedPetsArr().map(normalizeSkinId));
}

function isPetOwned(id) {
  const n = normalizeSkinId(id);
  return n === DEFAULT_PET || getOwnedPetsSet().has(n);
}

function getEquippedPet() {
  const raw = localStorage.getItem(STORAGE_KEY_EQUIPPED_PET) || DEFAULT_PET;
  return normalizeSkinId(raw) || DEFAULT_PET;
}

function setEquippedPet(id) {
  localStorage.setItem(
    STORAGE_KEY_EQUIPPED_PET,
    normalizeSkinId(id) || DEFAULT_PET
  );
}

function closePetPreview() {
  document.getElementById('petPreview')?.classList.add('hidden');
}

function openPetPreview(p) {
  const wrap = document.getElementById('petPreview');
  const img = document.getElementById('petPreviewImg');
  const nameEl = document.getElementById('petPreviewName');
  const typeEl = document.getElementById('petPreviewType');
  const equipBtn = document.getElementById('petPreviewEquip');

  const priceRow = document.getElementById('petPreviewPriceRow');
  const priceEl = document.getElementById('petPreviewPrice');

  const shopRow = document.getElementById('petPreviewShopRow');
  const shopText = document.getElementById('petPreviewShopText');
  const goShopBtn = document.getElementById('petPreviewGoShop');

  const goBuyBtn = document.getElementById('petPreviewGoBuy');
  if (!wrap || !img || !nameEl || !equipBtn || !typeEl || !goBuyBtn) return;

  const id = normalizeSkinId(p.id || p.petId || p.key || p.name);
  const owned = isPetOwned(id);
  const equipped = getEquippedPet() === id;

  wrap.classList.remove('hidden');

  img.src = p.img || './images/skins/placeholder.png';
  nameEl.textContent = p.name || id;

  typeEl.textContent = (p.type || 'PET').toString().toUpperCase();
  goBuyBtn.onclick = (e) => {
    e.stopPropagation();

    sessionStorage.setItem('petShopHighlight', id);

    closePetPreview();
    closeInv();

    document.querySelector('[data-target="loadoutScreen"]')?.click();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (typeof openPetShop === 'function') openPetShop();
        else document.getElementById('petShoopDiv')?.classList.remove('hidden');

        requestAnimationFrame(() => highlightPetInShop());
      });
    });
  };

  const statsText = p.stats
    ? Object.entries(p.stats)
        .map(([k, v]) => `${k}:${v}`)
        .join('  ')
    : p.desc || '—';

  if (priceRow && priceEl) {
    if (!owned && p.price != null) {
      priceRow.classList.remove('hidden');
      priceEl.textContent = `${Number(p.price || 0)} 🪙`;
    } else {
      priceRow.classList.add('hidden');
    }
  }

  if (shopRow && shopText && goShopBtn) {
    const inShop = !!(shopData?.pets || []).some(
      (x) => normalizeSkinId(x.id) === id
    );

    if (!owned && inShop) {
      shopRow.classList.remove('hidden');
      shopText.textContent = invT('inv.available');
      goShopBtn.onclick = () => {
        sessionStorage.setItem('shopJumpTo', 'pets');
        closePetPreview();
        document.querySelector('[data-target="shopScreen"]')?.click();
      };
    } else {
      shopRow.classList.add('hidden');
    }
  }

  equipBtn.textContent = equipped ? invT('ui.equipped') : invT('ui.equip');
  equipBtn.disabled = equipped || !owned;
  equipBtn.classList.toggle('hidden', !owned);

  equipBtn.onclick = () => {
    if (!owned || equipped) return;
    setEquippedPet(id);
    openInv('pets');
    renderInventoryOverview?.();
    closePetPreview();
  };
}

function closeSuperPreview() {
  document.getElementById('superPreview')?.classList.add('hidden');
}

function openSuperPreview(s) {
  const wrap = document.getElementById('superPreview');
  const img = document.getElementById('superPreviewImg');
  const nameEl = document.getElementById('superPreviewName');
  nameEl.textContent = prettySuperName(s.id);
  const descEl = document.getElementById('superPreviewDesc');
  const statsEl = document.getElementById('superPreviewStatsText');
  const equipBtn = document.getElementById('superPreviewEquip');
  const priceRow = document.getElementById('superPreviewPriceRow');
  const priceEl = document.getElementById('superPreviewPrice');

  if (!wrap || !img || !nameEl || !descEl || !statsEl || !equipBtn) return;

  const id = s.id;
  const ownedSet = new Set(
    JSON.parse(localStorage.getItem('ownedSupers') || '[]').map(normalizeSkinId)
  );
  const owned = ownedSet.has(normalizeSkinId(id)) || (s.price ?? 0) === 0;

  const equipped =
    normalizeSkinId(localStorage.getItem('equippedSuper')) ===
    normalizeSkinId(id);

  wrap.classList.remove('hidden');

  img.src = s.img || './images/logosImage/superIcone.png';
  nameEl.textContent = s.title || id;
  descEl.textContent = s.description || '';

  const statsText = s.stats
    ? Object.entries(s.stats)
        .map(([k, v]) => `${k}: ${v}`)
        .join('  •  ')
    : '';
  statsEl.textContent = statsText;

  if (priceRow && priceEl) {
    if (!owned) {
      priceRow.classList.remove('hidden');
      priceEl.textContent = `${Number(s.price || 0)} 🪙`;
    } else {
      priceRow.classList.add('hidden');
    }
  }

  equipBtn.textContent = equipped ? invT('ui.equipped') : invT('ui.equip');
  equipBtn.disabled = equipped || !owned;
  equipBtn.classList.toggle('hidden', !owned);

  equipBtn.onclick = () => {
    if (!owned || equipped) return;
    setEquippedSuper(id);
    updateSuperEquipUI?.();
    openInv('supers');
    renderInventoryOverview?.();
    closeSuperPreview();
  };
  let goShopBtn = document.getElementById('superPreviewGoShop');
  if (!goShopBtn) {
    goShopBtn = document.createElement('button');
    goShopBtn.id = 'superPreviewGoShop';
    goShopBtn.className = 'superGoShopBtn';
    goShopBtn.type = 'button';
    goShopBtn.textContent = invT('ui.goToShop') || 'GO TO SHOP';

    const anchor =
      document.getElementById('superPreviewPriceRow') ||
      document.getElementById('superPreviewStatsText') ||
      document.getElementById('superPreviewStats') ||
      descEl;

    (anchor?.parentNode || wrap).insertBefore(
      goShopBtn,
      anchor?.nextSibling || null
    );
  }
}

function prettySuperName(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
}

function invRerenderIfOpen() {
  const modal = document.getElementById('invModal');
  if (!modal || modal.classList.contains('hidden')) return;
  if (!invOpenType) return;
  openInv(invOpenType);
}
window.invRerenderIfOpen = invRerenderIfOpen;
window.renderInventoryOverview = renderInventoryOverview;
