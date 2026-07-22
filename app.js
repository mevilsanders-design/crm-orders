// Инициализация данных (без console.log)
(function() {
  const keys = ['crm-clients', 'crm-products', 'crm-orders'];
  keys.forEach(key => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify([]));
  });
})();

function getClients() { return JSON.parse(localStorage.getItem('crm-clients') || '[]'); }
function getProducts() { return JSON.parse(localStorage.getItem('crm-products') || '[]'); }
function getOrders() { return JSON.parse(localStorage.getItem('crm-orders') || '[]'); }

function saveClients(arr) { localStorage.setItem('crm-clients', JSON.stringify(arr)); }
function saveProducts(arr) { localStorage.setItem('crm-products', JSON.stringify(arr)); }
function saveOrders(arr) { localStorage.setItem('crm-orders', JSON.stringify(arr)); }

// Переключение секций
function showSection(id) {
  document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('active');
  if (id === 'clients') renderClients();
  if (id === 'products') renderProducts();
  if (id === 'orders') renderOrders();
  if (id === 'create-order') renderCreateOrder();
  if (id === 'client-profile') renderClientProfile();
}

// --- КЛИЕНТЫ ---
function renderClients() {
  const list = document.getElementById('clients-list');
  list.innerHTML = '';
  const search = (document.getElementById('client-search')?.value || '').trim().toLowerCase();
  const clients = getClients();

  clients.filter(c =>
    c.name.toLowerCase().includes(search) ||
    c.address.toLowerCase().includes(search)
  ).forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.name}</td>
      <td>${c.address}</td>
      <td style="white-space:nowrap;">
        <button class="btn-edit" onclick="safeClick(event, () => editClient(${c.id}))">Изменить</button>
        <button class="btn-delete" onclick="safeClick(event, () => deleteClient(${c.id}))">Удалить</button>
        <button class="btn-profile" onclick="safeClick(event, () => openClientProfile(${c.id}))">История</button>
      </td>`;
    list.appendChild(tr);
  });
}

function addClientWithCheck() {
  const name = (document.getElementById('client-name')?.value || '').trim();
  const address = (document.getElementById('client-address')?.value || '').trim();
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
  (document.getElementById('client-name')?.value = '');
  (document.getElementById('client-address')?.value = '');
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
  (document.getElementById('client-name')?.value = client.name);
  (document.getElementById('client-address')?.value = client.address);
  window.currentClientId = id;
  alert('Измените данные и нажмите «Добавить» — запись обновится');
}

function openClientProfile(clientId) {
  window.viewingClientId = clientId;
  showSection('client-profile');
}

// --- ТОВАРЫ ---
function renderProducts() {
  const list = document.getElementById('products-list');
  list.innerHTML = '';
  const search = (document.getElementById('product-search')?.value || '').trim().toLowerCase();
  const products = getProducts();

  products.filter(p => p.name.toLowerCase().includes(search))
    .forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.name}</td>
        <td>${p.price.toFixed(2)} ₽</td>
        <td style="white-space:nowrap;">
          <button class="btn-edit" onclick="safeClick(event, () => editProduct(${p.id}))">Изменить</button>
          <button class="btn-delete" onclick="safeClick(event, () => deleteProduct(${p.id}))">Удалить</button>
        </td>`;
      list.appendChild(tr);
    });
}

function addProduct() {
  const name = (document.getElementById('product-name')?.value || '').trim();
  const price = parseFloat(document.getElementById('product-price')?.value);
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
  (document.getElementById('product-name')?.value = '');
  (document.getElementById('product-price')?.value = '');
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
  (document.getElementById('product-name')?.value = product.name);
  (document.getElementById('product-price')?.value = product.price);
  window.currentProductId = id;
  alert('Измените данные и нажмите «Добавить товар» — запись обновится');
}

// --- ЗАКАЗЫ ---
function formatOrderItems(items) {
  if (!items || items.length === 0) return 'Нет товаров';
  return items.map(i => `${i.qty} × ${i.productName} (${i.price.toFixed(2)} ₽)`).join('<br>');
}

function calculateTotalOrdersSum(orders) {
  return orders.reduce((sum, o) => sum + (o.total || 0), 0);
}

function renderOrders() {
  const list = document.getElementById('orders-list');
  list.innerHTML = '';
  const filter = (document.getElementById('filter-direction')?.value || '');
  const allOrders = getOrders();

  const filteredOrders = filter
    ? allOrders.filter(o => o.direction === filter)
    : allOrders;

  const totalSum = calculateTotalOrdersSum(filteredOrders);
  const sumEl = document.getElementById('total-orders-sum');
  if (sumEl) sumEl.textContent = totalSum.toFixed(2) + ' ₽';

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
              onclick="safeClick(event, () => showOrderDetails(${o.id}))">
          ${shortText}
        </span>
      </td>
      <td style="white-space:nowrap;">
        <button class="btn-edit" style="margin-right:4px;" onclick="safeClick(event, () => editOrder(${o.id}))">Изменить</button>
        <button class="btn-delete" onclick="safeClick(event, () => deleteOrder(${o.id}))">Удалить</button>
      </td>`;
    list.appendChild(tr);
  });
}

function showOrderDetails(id) {
  const order = getOrders().find(o => o.id === id);
  if (!order) return;

  const container = document.getElementById('order-items-detail');
  if (!container) return;
  container.innerHTML = '<ul style="padding-left:20px;">' +
    order.items.map(i => `<li>${i.qty} × ${i.productName} — ${(i.price * i.qty).toFixed(2)} ₽ (${i.price.toFixed(2)} ₽/шт)</li>`)
      .join('') +
    '</ul>' +
    `<p><strong>Итого: ${order.total.toFixed(2)} ₽</strong></p>` +
    (order.direction ? `<p><strong>Направление:</strong> ${order.direction}</p>` : '');

  const modal = document.getElementById('order-details-modal');
  if (modal) modal.style.display = 'flex';
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

// --- БЫСТРЫЙ ПОИСК ТОВАРА В ЗАКАЗЕ ---
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
      suggestions.innerHTML = '<div style="padding:12px; color:#999;">Ничего не найдено</div>';
      return;
    }

    filtered.forEach(p => {
      const div = document.createElement('div');
      div.textContent = `${p.name} (${p.price.toFixed(2)} ₽)`;
      div.style.padding = '12px 16px'; // крупнее для пальца
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
    <select class="order-product" style="width:auto; min-width:180px;"></select>
    <input type="number" class="order-qty" placeholder="Кол-во" min="1" value="1" style="width:70px; font-size:16px;" />
    <span class="row-total-display" style="font-weight:bold; margin:0 12px;"></span>
    <button onclick="this.parentElement.remove()" style="color:red; background:none; border:none; cursor:pointer; font-size:20px; line-height:1;">×</button>`;
  
  document.getElementById('order-items').appendChild(row);

  const sel = row.querySelector('select');
  sel.innerHTML = `<option value="${product.id}" selected>${product.name} (${product.price.toFixed(2)} ₽)</option>`;

  const qtyInput = row.querySelector('.order-qty');
  qtyInput.addEventListener('input', () => updateRowTotal(row));
  updateRowTotal(row);
}

function addQuickProduct() {
  const query = (document.getElementById('quick-product-search')?.value || '').trim();
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
      const directionOption = directionSelect?.querySelector(`option[value="${order.direction}"]`);
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
          <select class="order-product" style="width:auto; min-width:180px;"></select>
          <input type="number" class="order-qty" placeholder="Кол-во" min="1" value="${item.qty}" style="width:70px; font-size:16px;" />
          <span class="row-total-display" style="font-weight:bold; margin:0 12px;"></span>
          <button onclick="this.parentElement.remove()" style="color:red; background:none; border:none; cursor:pointer; font-size:20px; line-height:1;">×</button>`;
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

        sel.addEventListener('change', () => updateRowTotal(row));
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
    <select class="order-product" style="width:auto; min-width:180px;"></select>
    <input type="number" class="order-qty" placeholder="Кол-во" min="1" value="1" style="width:70px; font-size:16px;" />
    <span class="row-total-display" style="font-weight:bold; margin:0 12px;"></span>
    <button onclick="this.parentElement.remove()" style="color:red; background:none; border:none; cursor:pointer; font-size:20px; line-height:1;">×</button>`;
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

// Защита от двойного клика (частая проблема на тач‑экранах)
let clickLock = false;
function safeClick(event, callback) {
  event.stopPropagation();
  if (clickLock) return;
  clickLock = true;
  try {
    callback();
  } finally {
    setTimeout(() => clickLock = false, 300);
  }
}

function saveOrder() {
  const clientId = document.getElementById('order-client')?.value;
  const direction = document.getElementById('order-direction')?.value;
  if (!clientId) return alert('Выберите клиента');
  if (!direction) return alert('Выберите направление');

  const client = getClients().find(c => c.id == clientId);
  if (!client) {
    alert('Клиент не найден — обновите страницу и выберите клиента заново.');
    return;
  }

  const rows = document.querySelectorAll('#order-items > div');
  let total = 0;
  const items = [];

  rows.forEach(row => {
    const prodSel = row.querySelector('select');
    const qtyInput = row.querySelector('.order-qty');
    if (!prodSel.value || !qtyInput.value) return;

    const product = getProducts().find(p => p.id == prodSel.value);
    if (!product) return;

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

  const orders = getOrders();
  const date = new Date().toISOString().split('T')[0];

  if (window.editingOrderId !== undefined) {
    const idx = orders.findIndex(o => o.id === window.editingOrderId);
    if (idx >= 0) {
      orders[idx] = {
        ...orders[idx],
        clientId,
        clientName: client.name,
        direction,
        items,
        total,
        date
      };
      delete window.editingOrderId;
    }
  } else {
    orders.push({
      id: Date.now(),
      clientId,
      clientName: client.name,
      direction,
      date,
      items,
      total,
      status: 'new'
    });
  }

  saveOrders(orders);
  alert('Заказ сохранён!');
  showSection('orders');
}

// --- ПРОФИЛЬ КЛИЕНТА И КАЛЕНДАРЬ ---
function renderClientProfile() {
  const clientId = window.viewingClientId;
  const client = getClients().find(c => c.id === clientId);
  if (!client) {
    alert('Клиент не найден');
    showSection('clients');
    return;
  }

  const nameEl = document.getElementById('client-profile-name');
  const addressEl = document.getElementById('client-profile-address');
  const idEl = document.getElementById('client-profile-id');
  if (nameEl) nameEl.textContent = client.name;
  if (addressEl) addressEl.textContent = client.address;
  if (idEl) idEl.textContent = client.id;

  const orders = getOrders()
    .filter(o => o.clientId == clientId)
    .sort((a, b) => b.date.localeCompare(a.date));

  // История заказов
  const historyBody = document.getElementById('client-orders-history');
  if (historyBody) {
    historyBody.innerHTML = '';
    orders.forEach(o => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${o.date}</td>
        <td>${o.direction || '-'}</td>
        <td>${o.total.toFixed(2)} ₽</td>
        <td class="status-${o.status}">${o.status}</td>
        <td style="white-space:nowrap;">
          <button class="btn-edit" style="margin-right:4px;" onclick="safeClick(event, () => editOrder(${o.id}))">Изменить</button>
          <button class="btn-delete" onclick="safeClick(event, () => deleteOrder(${o.id}))">Удалить</button>
        </td>`;
      historyBody.appendChild(tr);
    });
  }

  // Календарь по дням
  const calendarBody = document.getElementById('client-calendar-body');
  if (calendarBody) {
    calendarBody.innerHTML = '';

    const byDate = {};
    orders.forEach(o => {
      if (!byDate[o.date]) byDate[o.date] = [];
      byDate[o.date].push(o);
    });

    const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

    dates.forEach(date => {
      const dayOrders = byDate[date];
      let dayTotal = 0;
      const itemsList = [];

      dayOrders.forEach(order => {
        dayTotal += order.total;
        order.items.forEach(item => {
          itemsList.push({
            date: order.date,
            orderId: order.id,
            productName: item.productName,
            qty: item.qty,
            price: item.price,
            lineTotal: item.total
          });
        });
      });

      // Таблица заказов за день
      const ordersTable = document.createElement('table');
      ordersTable.style.width = '100%';
      ordersTable.style.borderCollapse = 'collapse';
      ordersTable.innerHTML = `
        <thead><tr style="background:#f8f9fa;"><th>Заказ ID</th><th>Направление</th><th>Сумма</th><th>Статус</th></tr></thead>
        <tbody>`;

      dayOrders.forEach(o => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>#${o.id}</td>
          <td>${o.direction || '-'}</td>
          <td>${o.total.toFixed(2)} ₽</td>
          <td class="status-${o.status}">${o.status}</td>`;
        ordersTable.querySelector('tbody').appendChild(tr);
      });
      ordersTable.innerHTML += '</tbody></table>';

      // Таблица товаров за день
      const itemsTable = document.createElement('table');
      itemsTable.style.width = '100%';
      itemsTable.style.borderCollapse = 'collapse';
      itemsTable.innerHTML = `
        <thead><tr style="background:#f8f9fa;"><th>Товар</th><th>Кол-во</th><th>Цена/шт</th><th>Сумма строки</th></tr></thead>
        <tbody>`;

      itemsList.forEach(i => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${i.productName}</td>
          <td>${i.qty}</td>
          <td>${i.price.toFixed(2)} ₽</td>
          <td>${i.lineTotal.toFixed(2)} ₽</td>`;
        itemsTable.querySelector('tbody').appendChild(tr);
      });
      itemsTable.innerHTML += '</tbody></table>';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${date}</td>
        <td style="padding:8px; background:#fafafa;">${ordersTable.outerHTML}</td>
        <td style="padding:8px; background:#fafafa;">${itemsTable.outerHTML}</td>
        <td><strong>${dayTotal.toFixed(2)} ₽</strong></td>`;
      calendarBody.appendChild(tr);
    });
  }
}

function closeOrderDetails() {
  const modal = document.getElementById('order-details-modal');
  if (modal) modal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  showSection('clients');
  initQuickProductSearch();

  window.onclick = function(event) {
    const modal = document.getElementById('order-details-modal');
    if (modal && event.target === modal) {
      modal.style.display = 'none';
    }
  };
});
