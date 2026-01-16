const ALLOWED_SKINS = new Set(['default', 'redclassic']);

function normalizeSkinId(id) {
  return String(id || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[_-]+/g, '');
}

function isAllowedSkin(id) {
  return ALLOWED_SKINS.has(normalizeSkinId(id));
}

const DEFAULT_SKIN = 'default';

const STORAGE_KEY_EQUIPPED_SKIN = 'equippedSkin';

function getEquippedSkin() {
  const raw = localStorage.getItem(STORAGE_KEY_EQUIPPED_SKIN) || DEFAULT_SKIN;
  const n = normalizeSkinId(raw);
  return ALLOWED_SKINS.has(n) ? n : DEFAULT_SKIN;
}

function setEquippedSkin(id) {
  const n = normalizeSkinId(id);
  localStorage.setItem(
    STORAGE_KEY_EQUIPPED_SKIN,
    ALLOWED_SKINS.has(n) ? n : DEFAULT_SKIN
  );
}

function equipSkin(id) {
  const owned = getOwnedSkinsArr();
  if (!owned.includes(id)) return;

  setEquippedSkin(id);
  openInv('skins');
}

function getOwnedSkinsArr() {
  const arr = JSON.parse(localStorage.getItem('ownedSkins') || '[]')
    .map(normalizeSkinId)
    .filter((id) => ALLOWED_SKINS.has(id));

  if (!arr.includes(DEFAULT_SKIN)) arr.unshift(DEFAULT_SKIN);
  return arr;
}

function getOwnedWeaponsArr() {
  const arr = JSON.parse(localStorage.getItem('ownedWeapons') || '[]');
  if (!arr.includes(DEFAULT_WEAPON)) arr.unshift(DEFAULT_WEAPON);
  return arr;
}

function openInv(type) {
  const modal = document.getElementById('invModal');
  const title = document.getElementById('invModalTitle');
  const grid = document.getElementById('invModalGrid');

  if (!modal || !title || !grid) return;

  title.textContent = type === 'skins' ? 'SKINS' : 'WEAPONS';
  grid.innerHTML = '';

  if (type === 'skins') {
    const owned = getOwnedSkinsArr();

    if (!owned.length) {
      grid.innerHTML = `<div class="invEmpty">No skins yet</div>`;
    } else {
      owned.forEach((id) => {
        const data = (shopData.skins || []).find((x) => x.id === id);

        const img = data?.image || './images/shopAInventoryicons/skin1Icon.png';
        const name = data?.name || id;
        const equipped = getEquippedSkin() === id;

        const el = document.createElement('div');
        el.className = `invOwnedCard skinCard ${equipped ? 'equipped' : ''}`;

        el.innerHTML = `
          <div class="invOwnedBody">
            <div class="invOwnedIcon">
               <img src="${img}" draggable="false" />
            </div>
           <div class="invOwnedName">${name}</div>
          </div>

         <button class="EquipBtn" ${
           equipped ? 'disabled' : ''
         } onclick="event.stopPropagation(); equipSkin('${id}')">
         ${equipped ? 'EQUIPPED' : 'EQUIP'}
        </button>
        `;

        grid.appendChild(el);
      });
    }
  }

  if (type === 'weapons') {
    const owned = Object.keys(WEAPONS).filter((id) => isWeaponOwned(id));

    if (!owned.length) {
      grid.innerHTML = `<div class="invEmpty">No weapons yet</div>`;
    } else {
      owned.forEach((id) => {
        const w = WEAPONS[id];
        const name = w?.name || id;
        const img = w?.img || './images/skins/placeholder.png';
        const equipped = getEquippedWeapon() === id;

        const el = document.createElement('div');
        el.className = `invOwnedCard weaponCard ${equipped ? 'equipped' : ''}`;

        el.innerHTML = `
        <div class="invOwnedIcon">
          <img src="${img}" draggable="false" />
        </div>
        <div class="invOwnedName">${name}</div>
        <button class="EquipBtn" ${
          equipped ? 'disabled' : ''
        } onclick="event.stopPropagation(); equipWeaponFromInventory('${id}')">
          ${equipped ? 'EQUIPPED' : 'EQUIP'}
        </button>
      `;

        grid.appendChild(el);
      });
    }
  }

  modal.classList.remove('hidden');
}

function closeInv() {
  document.getElementById('invModal')?.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('invModal');
  const closeBtn = document.getElementById('invModalClose');

  modal?.addEventListener('click', closeInv);
  closeBtn?.addEventListener('click', closeInv);
  renderInventoryOverview();
});

function renderInventoryOverview() {
  // === SKINS ===
  const skins = getOwnedSkinsArr();
  document.getElementById('invSkinsCount').textContent = skins.length;

  const skinsGrid = document.getElementById('invSkinsGrid');
  skinsGrid.innerHTML = '';

  // === WEAPONS ===
  const weapons = getOwnedWeaponsArr();
  document.getElementById('invWeaponsCount').textContent = weapons.length;
}
