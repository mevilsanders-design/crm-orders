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
}

// --- КЛИЕНТЫ: добавить, удалить, редактировать ---
function addClient() {
  const name = document.getElementById('client-name').value.trim();
  const address = document.getElementById('client-address').value.trim();
  if (!name) return alert('Укажите название клиента');
  const clients = getClients();
  clients.push({ id: Date.now(), name, address });
  saveClients(clients);
  document.getElementById('client-name').value = '';
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
  document.getElementById('client-address').value = client.address;
  // Удаляем старую запись и сразу добавляем обновлённую (простой способ без отдельного режима «редактирования»)
  const clients = getClients().filter(c => c.id !== id);
  // Помечаем, что мы в режиме обновления этого ID
  window.currentClientId = id;
  alert('Измените данные и нажмите «Добавить клиента» — запись обновится');
}

// При добавлении проверяем, не в режиме ли редактирования
function addClientWithCheck() {
  const name = document.getElementById('client-name').value.trim();
  const address = document.getElementById('client-address').value.trim();
  if (!name) return alert('Укажите название клиента');

  const clients = getClients();
  if (window.currentClientId !== undefined) {
    // Обновляем существующую
    const idx = clients.findIndex(c => c.id === window.currentClientId);
    if (idx >= 0) {
      clients[idx] = { ...clients[idx], name, address };
      delete window.currentClientId;
    }
  } else {
    clients.push({ id: Date.now(), name, address });
  }
  saveClients(clients);
  document.getElementById('client-name').value = '';
  document.getElementById('client-address').value = '';
  renderClients();
}

function renderClients() {
  const list = document.getElementById('clients-list');
  list.innerHTML = '';
  getClients().forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.name}</td>
      <td>${c.address}</td>
      <td>
        <button onclick="editClient(${c.id})" style="padding:4px 8px;margin-right:4px;">Изменить</button>
        <button onclick="deleteClient(${c.id})" style="padding:4px 8px;color:red;">Удалить</button>
      </td>`;
    list.appendChild(tr);
  });
}


// --- ТОВАРЫ: добавить, удалить, редактировать ---
function addProduct() {
  const name = document.getElementById('product-name').value.trim();
  const price = parseFloat(document.getElementById('product-price').value);
  if (!name || isNaN(price)) return alert('Заполните название и цену товара');
  const products = getProducts();

  if (window.currentProductId !== undefined) {
    const idx = products.findIndex(p => p.id === window.currentProductId);
    if (idx >= 0) {
      products[idx] = { ...products[idx], name, price };
      delete window.currentProductId;
    }
  } else {
    products.push({ id: Date.now(), name, price });
  }
  saveProducts(products);
  document.getElementById('product-name').value = '';
  document.getElementById('product-price').value = '';
  renderProducts();
}

function deleteProduct(id) {
  if (!confirm('Удалить товар?')) return;
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
  renderProducts();
}

function editProduct(id) {
  const product = getProducts().find(p => p.id === id);
  if (!product) return;
  document.getElementById('product-name').value = product.name;
  document.getElementById('product-price').value = product.price;
  window.currentProductId = id;
  alert('Измените данные и нажмите «Добавить товар» — запись обновится');
}

function renderProducts() {
  const list = document.getElementById('products-list');
  list.innerHTML = '';
  getProducts().forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>${p.price.toFixed(2)} ₽</td>
      <td>
        <button onclick="editProduct(${p.id})" style="padding:4px 8px;margin-right:4px;">Изменить</button>
        <button onclick="deleteProduct(${p.id})" style="padding:4px 8px;color:red;">Удалить</button>
      </td>`;
    list.appendChild(tr);
  });
}


// --- ЗАКАЗЫ: удалить (редактирование заказов лучше делать через создание нового или отдельный экран) ---
function deleteOrder(id) {
  if (!confirm('Удалить заказ?')) return;
  const orders = getOrders().filter(o => o.id !== id);
  saveOrders(orders);
  renderOrders();
}

function renderOrders() {
  const list = document.getElementById('orders-list');
  list.innerHTML = '';
  getOrders().forEach((o, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${o.clientName}</td>
      <td>${o.date}</td>
      <td>${o.total.toFixed(2)} ₽</td>
      <td class="status-${o.status}">${o.status}</td>
      <td><button onclick="deleteOrder(${o.id})" style="color:red;padding:4px 8px;">Удалить</button></td>`;
    list.appendChild(tr);
  });
}

// Новый заказ (интерфейс)
function renderCreateOrder() {
  const select = document.getElementById('order-client');
  select.innerHTML = '';
  getClients().forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    select.appendChild(opt);
  });
  addOrderItemRow();
}

function addOrderItemRow() {
  const container = document.getElementById('order-items');
  const row = document.createElement('div');
  row.innerHTML = `
    <select class="order-product"></select>
    <input type="number" class="order-qty" placeholder="Кол-во" min="1" value="1" />
    <button onclick="this.parentElement.remove()" style="color:red">×</button>`;
  container.appendChild(row);

  const products = getProducts();
  const sel = row.querySelector('select');
  sel.innerHTML = '<option value="">-- выберите товар --</option>';
  products.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.name} (${p.price.toFixed(2)} ₽)`;
    sel.appendChild(opt);
  });
}

function saveOrder() {
  const clientId = document.getElementById('order-client').value;
  if (!clientId) return alert('Выберите клиента');

  const client = getClients().find(c => c.id == clientId);
  const rows = document.querySelectorAll('#order-items > div');
  let total = 0;
  const items = [];

  rows.forEach(row => {
    const prodSel = row.querySelector('select');
    const qtyInput = row.querySelector('.order-qty');
    if (!prodSel.value || !qtyInput.value) return;

    const product = getProducts().find(p => p.id == prodSel.value);
    const qty = parseInt(qtyInput.value, 10);
    const lineTotal = product.price * qty;
    total += lineTotal;
    items.push({ productId: product.id, productName: product.name, qty, price: product.price, total: lineTotal });
  });

  if (items.length === 0) return alert('Добавьте хотя бы одну позицию');

  const orders = getOrders();
  orders.push({
    id: Date.now(),
    clientId,
    clientName: client.name,
    date: new Date().toLocaleDateString('ru-RU'),
    items,
    total,
    status: 'new'
  });
  saveOrders(orders);
  alert('Заказ сохранён!');
  showSection('orders');
}
