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

// --- КЛИЕНТЫ ---
function addClientWithCheck() {
  const name = document.getElementById('client-name').value.trim();
  const address = document.getElementById('client-address').value.trim();
  if (!name) return alert('Укажите название клиента');

  const clients = getClients();
  if (window.currentClientId !== undefined) {
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
  window.currentClientId = id;
  alert('Измените данные и нажмите «Добавить клиента» — запись обновится');
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
        <button class="btn-edit" onclick="editClient(${c.id})">Изменить</button>
        <button class="btn-delete" onclick="deleteClient(${c.id})">Удалить</button>
      </td>`;
    list.appendChild(tr);
  });
}

// --- ТОВАРЫ ---
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
        <button class="btn-edit" onclick="editProduct(${p.id})">Изменить</button>
        <button class="btn-delete" onclick="deleteProduct(${p.id})">Удалить</button>
      </td>`;
    list.appendChild(tr);
  });
}

// --- ЗАКАЗЫ ---
function formatOrderItems(items) {
  if (!items || items.length === 0) return 'Нет товаров';
  return items.map(i => `${i.qty} × ${i.productName} (${i.price.toFixed(2)} ₽)`).join('<br>');
}

// Функция: посчитать общую сумму всех заказов
function calculateTotalOrdersSum() {
  const orders = getOrders();
  return orders.reduce((sum, o) => sum + o.total, 0);
}

// Обновлённая renderOrders — теперь она ставит общую сумму в поле
function renderOrders() {
  const list = document.getElementById('orders-list');
  list.innerHTML = '';

  // Считаем и показываем общую сумму
  const totalSum = calculateTotalOrdersSum();
  document.getElementById('total-orders-sum').textContent = totalSum.toFixed(2) + ' ₽';

  getOrders().forEach((o, idx) => {
    const shortText = o.items.map(i => `${i.qty}×${i.productName}`).join(', ');
    const fullText = formatOrderItems(o.items).replace(/<br>/g, '\n');

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${o.clientName}</td>
      <td>${o.date}</td>
      <td>${o.total.toFixed(2)} ₽</td>
      <td class="status-${o.status}">${o.status}</td>
      <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis;">
        <span title="${fullText}"
              style="cursor:pointer; color:#007bff; text-decoration:underline;"
              onclick="showOrderDetails(${o.id})">
          ${shortText}
        </span>
      </td>
      <td>
        <button class="btn-delete" onclick="deleteOrder(${o.id})">Удалить</button>
      </td>`;
    list.appendChild(tr);
  });
}

function showOrderDetails(id) {
  const order = getOrders().find(o => o.id === id);
  if (!order) return;

  const container = document.getElementById('order-items-detail');
  container.innerHTML = '<ul style="padding-left:20px;">' +
    order.items.map(i => `<li>${i.qty} × ${i.productName} — ${(i.price * i.qty).toFixed(2)} ₽</li>`)
      .join('') +
    '</ul>' +
    `<p><strong>Итого: ${order.total.toFixed(2)} ₽</strong></p>`;

  document.getElementById('order-details-modal').style.display = 'block';
}

function deleteOrder(id) {
  if (!confirm('Удалить заказ?')) return;
  const orders = getOrders().filter(o => o.id !== id);
  saveOrders(orders);
  renderOrders(); // перерисовываем и обновляем общую сумму
}

// Новый заказ (интерфейс)
function renderCreateOrder() {
  const select = document.getElementById('order-client');
