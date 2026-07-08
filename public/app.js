const API_BASE = '/api/items';

// State
let items = [];

// DOM refs
const grid = document.getElementById('items-grid');
const claimModal = document.getElementById('claim-modal');
const unclaimModal = document.getElementById('unclaim-modal');
const claimForm = document.getElementById('claim-form');
const unclaimForm = document.getElementById('unclaim-form');
const modalItemName = document.getElementById('modal-item-name');
const claimItemId = document.getElementById('claim-item-id');
const claimerName = document.getElementById('claimer-name');
const claimerMessage = document.getElementById('claimer-message');
const unclaimItemId = document.getElementById('unclaim-item-id');
const unclaimerName = document.getElementById('unclaimer-name');

// ==============================
// Toast
// ==============================
function createToast() {
  const el = document.createElement('div');
  el.className = 'toast';
  document.body.appendChild(el);
  return el;
}
const toast = createToast();

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ==============================
// Item Card
// ==============================
function createItemCard(item) {
  const card = document.createElement('div');
  card.className = 'item-card' + (item.claimed ? ' claimed' : '');
  card.dataset.id = item.id;

  const icon = getCategoryIcon(item.category);
  const imageHtml = item.image_url
    ? `<img src="${item.image_url}" alt="${escapeHtml(item.name)}" class="item-photo" loading="lazy" onerror="this.style.display='none'">`
    : `<span class="item-icon">${icon}</span>`;
  const hasImageClass = item.image_url ? ' has-photo' : '';

  card.innerHTML = `
    <div class="item-image${hasImageClass}">${imageHtml}</div>
    <div class="item-category">${escapeHtml(item.category)}</div>
    <div class="item-name">${escapeHtml(item.name)}</div>
    <div class="item-description">${escapeHtml(item.description)}</div>
    <div class="item-price">${escapeHtml(item.price_range)}</div>
    ${item.claimed ? `
      <div class="claimed-badge">
        <span class="claimed-badge-icon">🎁</span>
        <span>
          <span class="claimed-badge-name">${escapeHtml(item.claimed_by)}</span> claimed this
          ${item.claim_message ? `<div class="claimed-badge-message">"${escapeHtml(item.claim_message)}"</div>` : ''}
        </span>
      </div>
      <button class="btn btn-primary" disabled>Claimed</button>
      <span class="remove-claim-link" data-id="${item.id}">Remove my claim</span>
    ` : `
      <button class="btn btn-primary claim-btn" data-id="${item.id}">🎁 Claim This Gift</button>
    `}
  `;

  return card;
}

function getCategoryIcon(category) {
  const icons = {
    'Kitchen & Dining': '🍳',
    'Bed & Bath': '🛁',
    'Home & Decor': '🏠',
    'Experiences': '✈️',
  };
  return icons[category] || '🎁';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ==============================
// Render
// ==============================
function renderItems() {
  grid.innerHTML = '';

  if (items.length === 0) {
    grid.innerHTML = '<p class="error-state">No registry items found.</p>';
    return;
  }

  items.forEach(item => {
    const card = createItemCard(item);
    grid.appendChild(card);
  });

  // Attach event listeners after render
  document.querySelectorAll('.claim-btn').forEach(btn => {
    btn.addEventListener('click', () => openClaimModal(parseInt(btn.dataset.id)));
  });

  document.querySelectorAll('.remove-claim-link').forEach(link => {
    link.addEventListener('click', () => openUnclaimModal(parseInt(link.dataset.id)));
  });
}

// ==============================
// Fetch Items
// ==============================
async function fetchItems() {
  grid.innerHTML = '<div class="loading">Loading registry</div>';
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch');
    items = await res.json();
    renderItems();
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<div class="error-state">Could not load registry. Please try again later.</div>';
  }
}

// ==============================
// Claim Flow
// ==============================
function openClaimModal(itemId) {
  const item = items.find(i => i.id === itemId);
  if (!item || item.claimed) return;
  modalItemName.textContent = item.name;
  claimItemId.value = itemId;
  claimerName.value = '';
  claimerMessage.value = '';
  claimModal.classList.remove('hidden');
  claimerName.focus();
}

async function handleClaimSubmit(e) {
  e.preventDefault();
  const id = claimItemId.value;
  const name = claimerName.value.trim();
  const message = claimerMessage.value.trim();

  if (!name) return;

  const btn = claimForm.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Claiming...';

  try {
    const res = await fetch(`${API_BASE}/${id}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message }),
    });

    if (!res.ok) {
      const data = await res.json();
      showToast(data.error || 'Could not claim gift');
      return;
    }

    const data = await res.json();
    const idx = items.findIndex(i => i.id === parseInt(id));
    if (idx !== -1) items[idx] = data.item;

    renderItems();
    closeModals();
    showToast(`🎉 You claimed "${data.item.name}"!`);
  } catch (err) {
    showToast('Something went wrong. Please try again.');
  } finally {
    btn.disabled = false;
    btn.textContent = '🎁 Claim Gift';
  }
}

// ==============================
// Unclaim Flow
// ==============================
function openUnclaimModal(itemId) {
  const item = items.find(i => i.id === itemId);
  if (!item || !item.claimed) return;
  unclaimItemId.value = itemId;
  unclaimerName.value = '';
  unclaimModal.classList.remove('hidden');
  unclaimerName.focus();
}

async function handleUnclaimSubmit(e) {
  e.preventDefault();
  const id = unclaimItemId.value;
  const name = unclaimerName.value.trim();

  if (!name) return;

  const btn = unclaimForm.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Removing...';

  try {
    const res = await fetch(`${API_BASE}/${id}/unclaim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const data = await res.json();
      showToast(data.error || 'Could not remove claim');
      return;
    }

    const data = await res.json();
    const idx = items.findIndex(i => i.id === parseInt(id));
    if (idx !== -1) items[idx] = data.item;

    renderItems();
    closeModals();
    showToast('Claim removed.');
  } catch (err) {
    showToast('Something went wrong. Please try again.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Remove Claim';
  }
}

// ==============================
// Modal helpers
// ==============================
function closeModals() {
  claimModal.classList.add('hidden');
  unclaimModal.classList.add('hidden');
}

// Close modals on backdrop click
document.querySelectorAll('.modal-backdrop').forEach(bd => {
  bd.addEventListener('click', closeModals);
});

document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', closeModals);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModals();
});

// ==============================
// Init
// ==============================
claimForm.addEventListener('submit', handleClaimSubmit);
unclaimForm.addEventListener('submit', handleUnclaimSubmit);
fetchItems();
