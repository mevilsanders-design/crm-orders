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

// --- КЛИЕНТЫ (с поиском) ---
function renderClients() {
  const list = document.getElementById('clients-list');
  list.innerHTML = '';

  const search = document.getElementById('client-search').value.trim().toLowerCase();
  const clients = getClients();

  clients.filter(c =>
    c.name.toLowerCase().includes(search) ||
    c.address.toLowerCase().includes(search)
  ).forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.name}</td>
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
  const address = document.getElementById('client-address').value.trim();
  if (!name) return alert('Укажите название клиента');

  const clients = getClients();
  if (window.currentClientId !== undefined) {
    const idx = clients.findIndex(c => c.id === window.currentClientId);
    if (idx >= 0) {
      clients[idx] = { ...clients[idx], name, address };
      delete window.currentClient
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
  alert('Измените данные и нажмите «Добавить» — запись обновится');
}

function openClientProfile(clientId) {
  window.viewingClientId = clientId;
  showSection('client-profile');
}

// --- ТОВАРЫ (с поиском) ---
function renderProducts() {
  const list = document.getElementById('products-list');
  list.innerHTML = '';

  const search = document.getElementById('product-search').value.trim().toLowerCase();
  const products = getProducts();

  products.filter(p =>
    p.name.toLowerCase().includes(search)
  ).forEach(p => {
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

// --- ЗАКАЗЫ ---
function formatOrderItems(items) {
  if (!items || items.length === 0) return 'Нет товаров';
  return items.map(i => `${i.qty} × ${i.productName} (${i.price.toFixed(2)} ₽)`).join('<br>');
}

function calculateTotalOrdersSum(orders) {
  return orders.reduce((sum, o) => sum + o.total, 0);
}

function renderOrders() {
  const list = document.getElementById('orders-list');
  list.innerHTML = '';

  const filter = document.getElementById('filter-direction').value;
  const allOrders = getOrders();

  const filteredOrders = filter
    ? allOrders.filter(o => o.direction === filter)
    : allOrders;

  const totalSum = calculateTotalOrdersSum(filteredOrders);
  document.getElementById('total-orders-sum').textContent = totalSum.toFixed(2) + ' ₽';

  filteredOrders.forEach((o, idx) => {
    const shortText = o.items.map(i => `${i.qty}×${i.productName}`).join(', ');
    const fullText = formatOrderItems(o.items).replace(/<br>/g, '\n');

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${o.direction || '-'}</td>
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
        <button class="btn-edit" style="margin-right:4px;" onclick="editOrder(${o.id})">Изменить</button>
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
    order.items.map(i => `<li>${i.qty} × ${i.productName} — ${(i.price * i.qty).toFixed(2)} ₽ (${i.price.toFixed(2)} ₽/шт)</li>`)
      .join('') +
    '</ul>' +
    `<p><strong>Итого: ${order.total.toFixed(2)} ₽</strong></p>` +
    (order.direction ? `<p><strong>Направление:</strong> ${order.direction}</p>` : '');

  document.getElementById('order-details-modal').style.display = 'flex';
}

function deleteOrder(id) {
  if (!confirm('Удалить заказ?')) return;
  const orders = getOrders().filter(o => o.id !== id);
  saveOrders(orders);
  renderOrders();
}

function editOrder(id) {
  const order = getOrders().find(o => o.id === id);
  if (!order) return;
  window.editingOrderId = order.id;
  showSection('create-order');
}

// --- БЫСТРЫЙ ПОИСК И ДОБАВЛЕНИЕ ТОВАРА В ЗАКАЗ ---
function initQuickProductSearch() {
  const input = document.getElementById('quick-product-search');
  if (!input) return;

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    const products = getProducts();
    
    const parent = input.parentElement;
    let suggestions = parent.querySelector('.quick-suggestions');
    if (!suggestions) {
      suggestions = document.createElement('div');
      suggestions.className = 'quick-suggestions';
      parent.appendChild(suggestions);
    }

    suggestions.innerHTML = '';
    if (!query) {
      suggestions.style.display = 'none';
      return;
    }
    suggestions.style.display = 'block';

    const filtered = products.filter(p => p.name.toLowerCase().includes(query));
    if (filtered.length === 0) {
      suggestions.innerHTML = '<div style="padding:8px; color:#999;">Ничего не найдено</div>';
      return;
    }

    filtered.forEach(p => {
      const div = document.createElement('div');
      div.textContent = `${p.name} (${p.price.toFixed(2)} ₽)`;
      div.style.padding = '8px 12px';
      div.style.cursor = 'pointer';
      div.style.borderBottom = '1px solid #eee';
      div.onclick = () => {
        selectQuickProduct(p);
        suggestions.style.display = 'none';
        input.value = '';
      };
      suggestions.appendChild(div);
    });
  });
}

function selectQuickProduct(product) {
  const row = document.createElement('div');
  row.innerHTML = `
    <select class="order-product" style="width:auto; min-width:200px;"></select>
    <input type="number" class="order-qty" placeholder="Кол-во" min="1" value="1" style="width:80px;" />
    <span class="row-total-display" style="font-weight:bold; margin:0 12px;"></span>
    <button onclick="this.parentElement.remove()" style="color:red; background:none; border:none; cursor:pointer;">×</button>`;
  
  document.getElementById('order-items').appendChild(row);

  const sel = row.querySelector('select');
  sel.innerHTML = `<option value="${product.id}" selected>${product.name} (${product.price.toFixed(2)} ₽)</option>`;

  const qtyInput = row.querySelector('.order-qty');
  qtyInput.addEventListener('input', () => updateRowTotal(row));
  updateRowTotal(row);
}

function addQuickProduct() {
  const query = document.getElementById('quick-product-search').value.trim();
  if (!query) return alert('Введите название товара для поиска');

  const products = getProducts();
  const match = products.find(p => p.name.toLowerCase() === query.toLowerCase());
  if (match) {
    selectQuickProduct(match);
  } else {
    alert('Товар не найден. Используйте подсказки при вводе или добавьте товар в разделе «Товары».');
  }
}

function updateRowTotal(row) {
  const sel = row.querySelector('select');
  const qtyInput = row.querySelector('.order-qty');
  const totalSpan = row.querySelector('.row-total-display');

  if (!sel.value || !qtyInput.value) {
    totalSpan.textContent = '';
    return;
  }

  const product = getProducts().find(p => p.id == sel.value);
  const qty = parseInt(qtyInput.value, 10) || 0;
  const lineTotal = product.price * qty;
  totalSpan.textContent = lineTotal.toFixed(2) + ' ₽';
}

// --- СОЗДАНИЕ/РЕДАКТИРОВАНИЕ ЗАКАЗА ---
function renderCreateOrder() {
  const select = document.getElementById('order-client');
  select.innerHTML = '';
  const clients = getClients();
  if (clients.length === 0) {
    select.innerHTML = '<option value="">Нет клиентов — добавьте сначала</option>';
  } else {
    clients.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      select.appendChild(opt);
    });
  }

  if (window.editingOrderId !== undefined) {
    document.getElementById('create-order-title').textContent = 'Редактирование заказа';
    const order = getOrders().find(o => o.id === window.editingOrderId);
    if (order) {
      const clientOption = document.querySelector(`#order-client option[value="${order.clientId}"]`);
      if (clientOption) clientOption.selected = true;

      const directionSelect = document.getElementById('order-direction');
      const directionOption = directionSelect.querySelector(`option[value="${order.direction}"]`);
      if (directionOption) directionOption.selected = true;
    }
  } else {
    document.getElementById('create-order-title').textContent = 'Новый заказ';
  }

  const itemsContainer = document.getElementById('order-items');
  itemsContainer.innerHTML = '';

  if (window.editingOrderId !== undefined) {
    const order = getOrders().find(o => o.id === window.editingOrderId);
    if (order && order.items && order.items.length > 0) {
      order.items.forEach(item => {
        const row = document.createElement('div');
        row.innerHTML = `
          <select class="order-product" style="width:auto; min-width:200px;"></select>
          <input type="number" class="order-qty" placeholder="Кол-во" min="1" value="${item.qty}" style="width:80px;" />
          <span class="row-total-display" style="font-weight:bold; margin:0 12px;"></span>
          <button onclick="this.parentElement.remove()" style="color:red; background:none; border:none; cursor:pointer;">×</button>`;
        itemsContainer.appendChild(row);

        const products = getProducts();
        const sel = row.querySelector('select');
        sel.innerHTML = '<option value="">-- выберите товар --</option>';
        products.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.id;
          opt.textContent = `${p.name} (${p.price.toFixed(2)} ₽)`;
          if (p.id == item.productId) opt.selected = true;
          sel.appendChild(opt);
        });

        const qtyInput = row.querySelector('.order-qty');
        qtyInput.addEventListener('input', () => updateRowTotal(row));
        updateRowTotal(row);
      });
    } else {
      addOrderItemRow();
    }
  } else {
    addOrderItemRow();
  }
}

function addOrderItemRow() {
  const container = document.getElementById('order-items');
  const row = document.createElement('div');
  row.innerHTML = `
    <select class="order-product" style="width:auto; min-width:200px;"></select>
    <input type="number" class="order-qty" placeholder="Кол-во" min="1" value="1" style="width:80px;" />
    <span class="row-total-display" style="font-weight:bold; margin:0 12px;"></span>
    <button onclick="this.parentElement.remove()" style="color:red; background:none; border:none; cursor:pointer;">×</button>`;
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

  sel.addEventListener('change', () => updateRowTotal(row));
  const qtyInput = row.querySelector('.order-qty');
  qtyInput.addEventListener('input', () => updateRowTotal(row));

  updateRowTotal(row);
}

function saveOrder() {
  const clientId = document.getElementById('order-client').value;
  const direction = document.getElementById('order-direction').value;
  if (!clientId) return alert('Выберите клиента');
  if (!direction) return alert('Выберите направление');

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
    items.push({
      productId: product.id,
      productName: product.name,
      qty,
      price: product.price,
      total: lineTotal
    });
  });

  if (items.length === 0) return alert('Добавьте хотя бы одну позицию в заказ');

  const
