// Инициализация данных
if (!localStorage.getItem('crm-clients')) localStorage.setItem('crm-clients', JSON.stringify([]));
if (!localStorage.getItem('crm-products')) localStorage.setItem('crm-products', JSON.stringify([]));
if (!localStorage.getItem('crm-orders')) localStorage.setItem('crm-orders', JSON.stringify([]));

function getClients() { return JSON.parse(localStorage.getItem('crm-clients')); }
function getProducts() { return JSON.parse(localStorage.getItem('crm-products')); }
function getOrders() { return JSON.parse(localStorage.getItem('crm-orders')); }

function saveClients(arr) { localStorage.setItem('crm-clients', JSON.stringify(arr)); }
function saveProducts(arr) { localStorage.setItem('crm-products', JSON.stringify(arr)); }
function saveOrders(arr) { localStorage.setItem('crm-orders', JSON.stringify(arr)); }

// Переключение секций
function showSection(id) {
  document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'clients') renderClients();
  if (id === 'products') renderProducts();
  if (id === 'orders') renderOrders();
  if (id === 'create-order') renderCreateOrder();
  if (id === 'client-profile') renderClientProfile();
}

// --- КЛИЕНТЫ (с магазином и поиском) ---
function renderClients() {
  const list = document.getElementById('clients-list');
  list.innerHTML = '';

  const search = document.getElementById('client-search').value.trim().toLowerCase();
  const clients = getClients();

  clients.filter(c =>
    c.name.toLowerCase().includes(search) ||
    (c.storeName && c.storeName.toLowerCase().includes(search)) ||
    c.address.toLowerCase().includes(search)
  ).forEach(c => {
    const displayName = c.storeName ? `${c.storeName} (${c.name})` : c.name;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${displayName}</td>
      <td>${c.address}</td>
      <td>
        <button class="btn-edit" onclick="editClient(${c.id})">Изменить</button>
        <button class="btn-delete" onclick="deleteClient(${c.id})">Удалить</button>
        <button style="background:#007bff; color:white; padding:4px 8px; margin-left:4px; border-radius:3px;"
                onclick="openClientProfile(${c.id})">История и календарь</button>
      </td>`;
    list.appendChild(tr);
  });
}

function addClientWithCheck() {
  const name = document.getElementById('client-name').value.trim();
  const storeName = document.getElementById('client-store').value.trim();
  const address = document.getElementById('client-address').value.trim();
  if (!name) return alert('Укажите название точки/клиента');

  const clients = getClients();
  if (window.currentClientId !== undefined) {
    const idx = clients.findIndex(c => c.id === window.currentClientId);
    if (idx >= 0) {
      clients[idx] = { ...clients[idx], name, storeName, address };
      delete window.currentClientId;
    }
  } else {
    clients.push({ id: Date.now(), name, storeName, address });
  }
  saveClients(clients);
  document.getElementById('client-name').value = '';
  document.getElementById('client-store').value = '';
  document.getElementById('client-address').value = '';
  renderClients();
}

function deleteClient(id) {
  if (!confirm('Удалить клиента?')) return;
  const clients = getClients().filter(c => c.id !== id);
  saveClients(clients);
  renderClients();
}

function editClient(id) {
  const client = getClients().find(c => c.id === id);
  if (!client) return;
  document.getElementById('client-name').value = client.name;
  document.getElementById('client-store').value = client.storeName || '';
  document.getElementById('client-address').value = client.address;
  window.currentClientId = id;
  alert('Измените данные и нажмите «Добавить» — запись обновится');
}

function openClientProfile(clientId) {
  window.viewingClientId = clientId;
  showSection('client-profile');
}

// --- ТОВАРЫ (с поиском по названию) ---
function renderProducts() {
  const list = document.getElementById('products-list');
