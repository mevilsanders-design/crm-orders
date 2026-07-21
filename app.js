// --- Инициализация данных ---
function initStorage() {
  if (!localStorage.getItem('clients')) localStorage.setItem('clients', JSON.stringify([]));
  if (!localStorage.getItem('orders')) localStorage.setItem('orders', JSON.stringify([]));
  if (!localStorage.getItem('collections')) localStorage.setItem('collections', JSON.stringify([]));
  if (!localStorage.getItem('history')) localStorage.setItem('history', JSON.stringify([]));
}

function getClients() { return JSON.parse(localStorage.getItem('clients')); }
function getOrders() { return JSON.parse(localStorage.getItem('orders')); }
function getCollections() { return JSON.parse(localStorage.getItem('collections')); }
function getHistory() { return JSON.parse(localStorage.getItem('history')); }

function saveClients(arr) { localStorage.setItem('clients', JSON.stringify(arr)); }
function saveOrders(arr) { localStorage.setItem('orders', JSON.stringify(arr)); }
function saveCollections(arr) { localStorage.setItem('collections', JSON.stringify(arr)); }
function saveHistory(arr) { localStorage.setItem('history', JSON.stringify(arr)); }

initStorage();

// --- Навигация ---
function nav(sectionId) {
  document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');

  if (sectionId === 'home') renderHome();
  if (sectionId === 'orders') renderOrders();
  if (sectionId === 'collections') renderCollections();
  if (sectionId === 'history') renderHistorySelect();
}

// --- Полнотекстовый поиск (по словам) ---
function globalSearch() {
  const query = document.getElementById('global-search').value.trim().toLowerCase();
  const words = query.split(/\s+/).filter(w => w.length > 0);
  const clients = getClients();

  const tbody = document.getElementById('clients-list');
  tbody.innerHTML = '';

  clients.forEach(client => {
    const nameLower = client.name.toLowerCase();
    const addressLower = client.address.toLowerCase();

    let match = true;
    for (const word of words) {
      if (!nameLower.includes(word) && !addressLower.includes(word)) {
        match = false;
        break;
      }
    }

    if (match) {
      const tr = document.createElement('tr');
      const isClosed = client.isClosed || false;
      const isToday = client.visitDate === new Date().toISOString().split('T')[0];
      const nameClass = isClosed ? 'client-closed' : '';
      const marker = isToday ? '<span class="marker-today">●</span>' : '';

      tr.innerHTML = `
        <td class="${nameClass}">${marker} ${client.name} ${isClosed ? '[Х]' : ''}</td>
        <td>${client.address}</td>
        <td>${isClosed ? 'Закрыт' : 'Активен'}</td>
        <td><button class="btn-sm btn-primary" onclick="selectClientForDocument('${client.id}')">Выбрать</button></td>
      `;
      tbody.appendChild(tr);
    }
  });
}

// --- Главная страница: Маршрутный лист ---
function renderHome() {
  globalSearch();
}

function showAddClientForm() {
  nav('add-client');
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('new-client-date').value = today;
}

function saveNewClient() {
  const name = document.getElementById('new-client-name').value.trim();
  const address = document.getElementById('new-client-address').value.trim();
  const visitDate = document.getElementById('new-client-date').value;

  if (!name) return alert('Укажите название клиента');

  const clients = getClients();
  if (clients.some(c => c.name.toLowerCase() === name.toLowerCase())) {
    return alert('Клиент с таким названием уже есть');
  }

  const newClient = {
    id: Date.now(),
    name,
    address,
    visitDate,
    isClosed: false
  };

  clients.push(newClient);
