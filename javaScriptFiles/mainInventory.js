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

  title.textContent =
    type === 'skins'
      ? 'SKINS'
      : type === 'weapons'
        ? 'WEAPONS'
        : type === 'pets'
          ? 'PETS'
          : 'INVENTORY';
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
          if (equipped) return;
          equipWeaponFromInventory(id);
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
      grid.innerHTML = `<div class="invEmpty">No pets yet</div>`;
    } else {
      ownedList.forEach((pid) => renderPetCard(pid, true));

      if (lockedList.length) {
        const divider = document.createElement('div');
        divider.className = 'invLockedDivider';
        divider.textContent = 'NOT OWNED';
        grid.appendChild(divider);

        lockedList.forEach((pid) => renderPetCard(pid, false));
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
        sessionStorage.setItem('shopJumpTo', 'skinOffers');
        sessionStorage.setItem('shopHighlightSkin', id);

        closeSkinPreview();
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
});

function getOwnedSkinsCount() {
  return getOwnedSkinsSet().size;
}

function getOwnedWeaponsCount() {
  return getOwnedWeaponsArr().length;
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
      shopText.textContent = 'AVAILABLE';
      goShopBtn.onclick = () => {
        sessionStorage.setItem('shopJumpTo', 'pets');
        closePetPreview();
        document.querySelector('[data-target="shopScreen"]')?.click();
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
    setEquippedPet(id);
    openInv('pets');
    renderInventoryOverview?.();
    closePetPreview();
  };
}
