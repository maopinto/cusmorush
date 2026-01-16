const DEFAULT_SKIN = 'default';

function getOwnedSkinsArr() {
  const arr = JSON.parse(localStorage.getItem('ownedSkins') || '[]');
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

        const img = data?.image || './images/skins/placeholder.png';
        const name = data?.name || id;

        const el = document.createElement('div');
        el.className = 'invOwnedCard';

        el.innerHTML = `
      <div class="invOwnedIcon">
        <img src="${img}" draggable="false" />
      </div>
      <div class="invOwnedName">${name}</div>
    `;

        grid.appendChild(el);
      });
    }
  }

  if (type === 'weapons') {
    const owned = getOwnedWeaponsArr();

    if (!owned.length) {
      grid.innerHTML = `<div class="invEmpty">No weapons yet</div>`;
    } else {
      owned.forEach((id) => {
        const w = WEAPONS?.[id];
        const name = w?.name || id;
        const img = w?.img || './images/skins/placeholder.png';

        const el = document.createElement('div');
        el.className = 'invOwnedCard';
        el.innerHTML = `
        <div class="invOwnedIcon">
          <img src="${img}" draggable="false" />
        </div>
        <div class="invOwnedName">${name}</div>
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
