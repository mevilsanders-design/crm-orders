// Инициализация данных (если нет в localStorage)
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

// Клиенты
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
function renderClients() {
  const list = document.getElementById('clients-list');
  list.innerHTML = '';
  getClients().forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.name}</td><td>${c.address}</td>`;
    list.appendChild(tr);
  });
}

// Товары
function addProduct() {
  const name = document.getElementById('product-name').value.trim();
  const price = parseFloat(document.getElementById('product-price').value);
  if (!name || isNaN(price)) return alert('Заполните название и цену товара');
  const products = getProducts();
  products.push({ id: Date.now(), name, price });
  saveProducts(products);
  document.getElementById('product-name').value = '';
  document.getElementById('product-price').value = '';
  renderProducts();
}
function renderProducts() {
  const list = document.getElementById('products-list');
  list.innerHTML = '';
  getProducts().forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${p.name}</td><td>${p.price.toFixed(2)} ₽</td>`;
    list.appendChild(tr);
  });
}

// Заказы (список)
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
    `;
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
  addOrderItemRow(); // хотя бы одна строка
}

function addOrderItemRow() {
  const container = document.getElementById('order-items');
  const row = document.createElement('div');
  row.innerHTML = `
    <select class="order-product"></select>
    <input type="number" class="order-qty" placeholder="Кол-во" min="1" value="1" />
    <button onclick="this.parentElement.remove()" style="color:red">×</button>
  `;
  container.appendChild(row);

  // заполняем товары в селекте
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
    status: 'new' // new, sent, confirmed
  });
  saveOrders(orders);
  alert('Заказ сохранён!');
  showSection('orders');
}
