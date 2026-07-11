const API_BASE = '/api/items';

// State
let items = [];

// Account details (shown after user initiates a contribution)
const ACCOUNT = {
  name: 'Janada Oluwafunmilayo Anjorin',
  number: '7036288231',
  bank: 'Opay'
};

// DOM refs
const grid = document.getElementById('items-grid');
const contribModal = document.getElementById('contrib-modal');
const confirmModal = document.getElementById('confirm-modal');
const contribForm = document.getElementById('contrib-form');
const confirmForm = document.getElementById('confirm-form');
const modalItemName = document.getElementById('contrib-item-name');
const contribItemId = document.getElementById('contrib-item-id');
const contribName = document.getElementById('contrib-name');
const percentageOptions = document.querySelectorAll('.percentage-option');

const confirmItemName = document.getElementById('confirm-item-name');
const confirmAmount = document.getElementById('confirm-amount');
const confirmAccountName = document.getElementById('confirm-account-name');
const confirmAccountNumber = document.getElementById('confirm-account-number');
const confirmBank = document.getElementById('confirm-bank');
const confirmContribId = document.getElementById('confirm-contrib-id');
const confirmName = document.getElementById('confirm-name');

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
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ==============================
// Helpers
// ==============================
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatCurrency(amount) {
  return '$' + parseFloat(amount).toFixed(2);
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

// ==============================
// Item Card
// ==============================
function createItemCard(item) {
  const card = document.createElement('div');
  card.className = 'item-card';
  card.dataset.id = item.id;

  const icon = getCategoryIcon(item.category);
  const imageHtml = item.image_url
    ? `<img src="${item.image_url}" alt="${escapeHtml(item.name)}" class="item-photo" loading="lazy" onerror="this.style.display='none'">`
    : `<span class="item-icon">${icon}</span>`;
  const hasImageClass = item.image_url ? ' has-photo' : '';

  // Calculate progress info
  const fundedPct = parseInt(item.funded_percentage) || 0;
  const fundedAmt = parseFloat(item.funded_amount) || 0;
  const price = parseFloat(item.price) || 0;
  const fullyFunded = fundedPct >= 100;

  // Build contributors detail
  let contributorsHtml = '';
  if (item.contributor_count > 0) {
    const count = parseInt(item.contributor_count);
    contributorsHtml = `<div class="contributor-summary">${count} ${count === 1 ? 'person has' : 'people have'} contributed to this item</div>`;
  }

  card.innerHTML = `
    <div class="item-image${hasImageClass}">${imageHtml}</div>
    <div class="item-category">${escapeHtml(item.category)}</div>
    <div class="item-name">${escapeHtml(item.name)}</div>
    <div class="item-description">${escapeHtml(item.description)}</div>
    <div class="item-price">${escapeHtml(item.price_range)}</div>

    <div class="funding-bar">
      <div class="funding-bar-fill" style="width: ${Math.min(fundedPct, 100)}%"></div>
    </div>
    <div class="funding-text">
      <span>${fullyFunded ? 'Fully funded! 🎉' : fundedPct + '% funded'}</span>
      <span>${formatCurrency(fundedAmt)} / ${formatCurrency(price)}</span>
    </div>
    ${contributorsHtml}

    ${!fullyFunded
      ? `<button class="btn btn-primary contribute-btn" data-id="${item.id}">🎁 Contribute</button>`
      : `<button class="btn btn-primary" disabled>Fully Funded ✓</button>`
    }
  `;

  return card;
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

  // Attach contribute button listeners
  document.querySelectorAll('.contribute-btn').forEach(btn => {
    btn.addEventListener('click', () => openContribModal(parseInt(btn.dataset.id)));
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
// Contribution Flow — Step 1: Select Percentage & Enter Name
// ==============================
let selectedPercentage = 25;

function openContribModal(itemId) {
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  modalItemName.textContent = item.name;
  contribItemId.value = itemId;
  contribName.value = '';
  selectedPercentage = 25;
  updateCalculatedAmount(item);

  // Highlight 25% by default
  percentageOptions.forEach(opt => {
    const pct = parseInt(opt.dataset.pct);
    opt.classList.toggle('selected', pct === 25);
  });

  contribModal.classList.remove('hidden');
  contribName.focus();
}

function updateCalculatedAmount(item) {
  const amount = (parseFloat(item.price) * selectedPercentage) / 100;
  document.getElementById('contrib-calc-amount').textContent = formatCurrency(amount);
  document.getElementById('contrib-calc-pct').textContent = selectedPercentage + '%';
}

percentageOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    percentageOptions.forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    selectedPercentage = parseInt(opt.dataset.pct);

    const itemId = parseInt(contribItemId.value);
    const item = items.find(i => i.id === itemId);
    if (item) updateCalculatedAmount(item);
  });
});

async function handleContribSubmit(e) {
  e.preventDefault();
  const id = contribItemId.value;
  const name = contribName.value.trim();
  if (!name) return;

  const btn = contribForm.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Processing...';

  try {
    const res = await fetch(`${API_BASE}/${id}/contribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, percentage: selectedPercentage }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || 'Could not create contribution');
      return;
    }

    // Switch to confirmation modal with account details
    closeModals();
    showConfirmModal(data.contribution, name);
  } catch (err) {
    showToast('Something went wrong. Please try again.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Continue to Payment';
  }
}

// ==============================
// Contribution Flow — Step 2: Show Account & Confirm Payment
// ==============================
function showConfirmModal(contribution, name) {
  const item = items.find(i => i.id === contribution.item_id);
  confirmItemName.textContent = item ? item.name : 'Item';
  confirmAmount.textContent = formatCurrency(contribution.amount) + ' (' + contribution.percentage + '%)';
  confirmAccountName.textContent = ACCOUNT.name;
  confirmAccountNumber.textContent = ACCOUNT.number;
  confirmBank.textContent = ACCOUNT.bank;
  confirmContribId.value = contribution.id;
  confirmName.value = name;

  confirmModal.classList.remove('hidden');
}

async function handleConfirmSubmit(e) {
  e.preventDefault();
  const id = contribItemId.value;
  const contribId = confirmContribId.value;
  const name = confirmName.value.trim();
  if (!name) return;

  const btn = confirmForm.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Confirming...';

  try {
    const res = await fetch(`${API_BASE}/${id}/confirm/${contribId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || 'Could not confirm payment');
      return;
    }

    // Update local state
    const idx = items.findIndex(i => i.id === parseInt(id));
    if (idx !== -1) {
      items[idx].funded_percentage = parseInt(data.item.funded_percentage);
      items[idx].funded_amount = parseFloat(data.item.funded_amount);
      items[idx].contributor_count = parseInt(data.item.contributor_count);
    }

    renderItems();
    closeModals();
    showToast('🎉 Thank you for your contribution!');
  } catch (err) {
    showToast('Something went wrong. Please try again.');
  } finally {
    btn.disabled = false;
    btn.textContent = '✓ Yes, I Have Paid';
  }
}

// ==============================
// Modal helpers
// ==============================
function closeModals() {
  contribModal.classList.add('hidden');
  confirmModal.classList.add('hidden');
}

// Close modals on backdrop click
document.querySelectorAll('.modal-backdrop').forEach(bd => {
  bd.addEventListener('click', closeModals);
});

document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', closeModals);
});

document.querySelectorAll('.modal-back-button').forEach(btn => {
  btn.addEventListener('click', closeModals);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModals();
});

// ==============================
// Init
// ==============================
contribForm.addEventListener('submit', handleContribSubmit);
confirmForm.addEventListener('submit', handleConfirmSubmit);
fetchItems();
