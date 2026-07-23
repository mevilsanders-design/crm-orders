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

// --- КЛИЕНТЫ ---
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
  if (!confirm
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
  document.getElementById('client-address').value = client.address || '';
  window.currentClientId = id;
  alert('Измените данные и нажмите «Добавить» — запись обновится');
}

function openClientProfile(id) {
  window.viewingClientId = id;
  showSection('client-profile');
}

// --- ТОВАРЫ ---
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

// --- ЗАКАЗЫ (с фильтром по направлению и итогом) ---
function renderOrders() {
  const list = document.getElementById('orders-list');
  list.innerHTML = '';

  const directionFilter = document.getElementById('filter-direction').value;
  const orders = getOrders();

  let totalSum = 0;

  orders.filter(o => !directionFilter || o.direction === directionFilter).forEach(o => {
    totalSum += o.total;
    const displayName = o.storeName ? `${o.storeName} (${o.clientName})` : o.clientName;

    const itemsPreview = o.items.slice(0, 3).map(i => `${i.qty}×${i.productName}`).join(', ') +
      (o.items.length > 3 ? '…' : '');

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${o.id}</td>
      <td>${o.direction || '-'}</td>
      <td>${displayName}</td>
      <td>${o.date}</td>
      <td>${o.total.toFixed(2)} ₽</td>
      <td class="status-${o.status}">${o.status}</td>
      <td style="font-size:12px;">${itemsPreview}</td>
      <td>
        <button class="btn-edit" style="margin-right:4px;" onclick="editOrder(${o.id})">Изменить</button>
        <button class="btn-delete" onclick="deleteOrder(${o.id})">Удалить</button>
        <button class="btn-secondary" style="padding:4px 8px; margin-left:4px;"
                onclick="showOrderDetails(${o.id})">Детали</button>
      </td>`;
    list.appendChild(tr);
  });

  document.getElementById('total-orders-sum').textContent = totalSum.toFixed(2);
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

function showOrderDetails(id) {
  const order = getOrders().find(o => o.id === id);
  if (!order) return;

  const container = document.getElementById('order-items-detail');
  container.innerHTML = '<ul style="padding-left:20px;">' +
    order.items.map(i => `<li>${i.qty} × ${i.productName} — ${(i.price * i.qty).toFixed(2)} ₽ (${i.price.toFixed(2)} ₽/шт)</li>`)
      .join('') +
    '</ul>' +
    `<p><strong>Итого: ${order.total.toFixed(2)} ₽</strong></p>` +
    (order.direction ? `<p><strong>Направление:</strong> ${order.direction}</p>` : '') +
    (order.storeName ? `<p><strong>Магазин:</strong> ${order.storeName}</p>` : '') +
    (order.clientName ? `<p><strong>Точка/Клиент:</strong> ${order.clientName}</p>` : '');

  document.getElementById('order-details-modal').style.display = 'flex';
}

// --- СОЗДАНИЕ/РЕДАКТИРОВАНИЕ ЗАКАЗА (таблица + общий поиск) ---
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
      const displayName = c.storeName ? `${c.storeName} (${c.name})` : c.name;
      opt.textContent = displayName;
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

  // Очищаем таблицу позиций
  const itemsContainer = document.getElementById('order-items');
  itemsContainer.innerHTML = '';

  const searchInput = document.getElementById('order-product-search');
  searchInput.value = ''; // сброс поиска при открытии формы
  searchInput.addEventListener('input', () => filterOrderItemsTable(), { once: false });

  if (window.editingOrderId !== undefined) {
    const order = getOrders().find(o => o.id === window.editingOrderId);
    if (order && order.items && order.items.length > 0) {
      order.items.forEach(item => {
        addOrderItemRow(item.productId, item.qty);
        // после добавления строки нужно выбрать товар и обновить значения
        const lastRow = itemsContainer.lastElementChild;
        const prodSel = lastRow.querySelector('select');
        const qtyInput = lastRow.querySelector('.order-qty');
        const priceSpan = lastRow.querySelector('.order-price');
        const totalSpan = lastRow.querySelector('.order-total');

        if (prodSel && prodSel.value === '' && item.productId) {
          const opt = prodSel.querySelector(`option[value="${item.productId}"]`);
          if (opt) opt.selected = true;
          updateOrderItemRow(lastRow);
        }
        if (qtyInput) qtyInput.value = item.qty;
      });
    } else {
      addOrderItemRow();
    }
  } else {
    addOrderItemRow(); // одна пустая строка по умолчанию
  }
}

// Добавить строку в таблицу позиций
function addOrderItemRow(preSelectedProductId = null, preQty = 1) {
  const container = document.getElementById('order-items');
  const row = document.createElement('tr');
  row.style.borderBottom = '1px solid #eee';

  const products = getProducts();

  let optionsHtml = '<option value="" selected>-- выберите товар --</option>';
  products.forEach(p => {
    optionsHtml += `<option value="${p.id}">${p.name} (${p.price.toFixed(2)} ₽)</option>`;
  });

  row.innerHTML = `
    <td style="padding:6px; border:1px solid #ddd;">
      <select class="order-product" style="width:100%;">
        ${optionsHtml}
      </select>
    </td>
    <td style="padding:6px; text-align:right; border:1px solid #ddd;">
      <input type="number" class="order-qty" value="${preQty}" min="1" style="width:60px; text-align:right;" />
    </td>
    <td style="padding:6px; text-align:right; border:1px solid #ddd;">
      <span class="order-price" style="font-weight:bold;">0.00 ₽</span>
    </td>
    <td style="padding:6px; text-align:right; border:1px solid #ddd; font-weight:bold; color:#2c3e50;">
      <span class="order-total">0.00 ₽</span>
    </td>
    <td style="padding:6px; border:1px solid #ddd;">
      <button class="btn-delete" style="padding:2px 8px; font-size:12px;" onclick="this.parentElement.parentElement.remove()">×</button>
    </td>`;

  container.appendChild(row);

  // Вешаем обработчики на новую строку
  const prodSel = row.querySelector('select.order-product');
  const qtyInput = row.querySelector('.order-qty');

  prodSel.addEventListener('change', () => updateOrderItemRow(row));
  qtyInput.addEventListener('input', () => updateOrderItemRow(row));

  // Если был предварительно выбран товар — ставим его
  if (preSelectedProductId) {
    prodSel.value = preSelectedProductId;
    updateOrderItemRow(row);
  } else if (prodSel.value) {
    updateOrderItemRow(row);
  }
}

// Обновить цену и итог в одной строке
function updateOrderItemRow(row) {
  const prodSel = row.querySelector('select.order-product');
  const qtyInput = row.querySelector('.order-qty');
  const priceSpan = row.querySelector('.order-price');
  const totalSpan = row.querySelector('.order-total');

  if (!prodSel.value || !qtyInput.value) {
    priceSpan.textContent = '0.00 ₽';
    totalSpan.textContent = '0.00 ₽';
    return;
  }

  const product = getProducts().find(p => p.id == prodSel.value);
  const qty = parseInt(qtyInput.value, 10);
  if (!product) return;

  const lineTotal = product.price * qty;
  priceSpan.textContent = `${product.price.toFixed(2)} ₽/шт`;
  totalSpan.textContent = `${lineTotal.toFixed(2)} ₽`;
}

// Фильтр строк таблицы по общему поиску
function filterOrderItemsTable() {
  const searchText = document.getElementById('order-product-search').value.trim().toLowerCase();
  const rows = Array.from(document.querySelectorAll('#order-items tr'));

  rows.forEach(row => {
    const sel = row.querySelector('select.order-product');
    const text = sel ? sel.options[sel.selectedIndex]?.text.toLowerCase() : '';
    if (!searchText) {
      row.style.display = '';
      return;
    }
    row.style.display = text.includes(searchText) ? '' : 'none';
  });
}

// Сохранение заказа
function saveOrder() {
  const clientId = document.getElementById('order-client').value;
  const direction = document.getElementById('order-direction').value;
  if (!clientId) return alert('Выберите клиента');
  if (!direction) return alert('Выберите направление');

  const client = getClients().find(c => c.id == clientId);
  const rows = document.querySelectorAll('#order-items tr');
  let total = 0;
  const items = [];

  rows.forEach(row => {
    const prodSel = row.querySelector('select.order-product');
    const qtyInput = row.querySelector('.order-qty');
    if (!prodSel.value || !qtyInput.value) return; // пропускаем пустые строки

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

  const orders = getOrders();

  if (window.editingOrderId !== undefined) {
    const idx = orders.findIndex(o => o.id === window.editingOrderId);
    if (idx >= 0) {
      orders[idx] = {
        ...orders[idx],
        clientId,
        clientName: client.name,
        storeName: client.storeName,
        direction,
        items,
        total,
        date: new Date().toLocaleDateString('ru-RU')
      };
      delete window.editingOrderId;
    }
  } else {
    orders.push({
      id: Date.now(),
      clientId,
      clientName: client.name,
      storeName: client.storeName,
      direction,
      date: new Date().toLocaleDateString('ru-RU'),
      items,
      total,
      status: 'new'
    });
  }

  saveOrders(orders);
  alert('Заказ сохранён!');
  showSection('orders');
}

// --- ПРОФИЛЬ КЛИЕНТА: ИСТОРИЯ И КАЛЕНДАРЬ ---
function renderClientProfile() {
  const clientId = window.viewingClientId;
  const client = getClients().find(c => c.id === clientId);
  if (!client) {
    alert('Клиент не найден');
    showSection('clients');
    return;
  }

  document.getElementById('client-profile-name').textContent = client.name;
  document.getElementById('client-profile-store').textContent = client.storeName || '-';
  document.getElementById('client-profile-address').textContent = client.address;
  document.getElementById('client-profile-id').textContent = client.id;

  const orders = getOrders()
    .filter(o => o.clientId == clientId)
    .sort((a, b) => new Date
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // История заказов клиента
  const historyList = document.getElementById('client-orders-history');
  historyList.innerHTML = '';
  orders.forEach(o => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.date}</td>
      <td>${o.direction || '-'}</td>
      <td>${o.storeName ? `${o.storeName} (${o.clientName})` : o.clientName}</td>
      <td>${o.total.toFixed(2)} ₽</td>
      <td class="status-${o.status}">${o.status}</td>
      <td>
        <button class="btn-edit" style="margin-right:4px;" onclick="editOrder(${o.id})">Изменить</button>
        <button class="btn-secondary" style="padding:4px 8px;" onclick="showOrderDetails(${o.id})">Детали</button>
      </td>`;
    historyList.appendChild(tr);
  });

  // Календарь по дням (агрегация заказов и товаров)
  const calendarBody = document.getElementById('client-calendar-body');
  calendarBody.innerHTML = '';

  const days = {};
  orders.forEach(o => {
    if (!days[o.date]) {
      days[o.date] = { orders: [], items: [], total: 0 };
    }
    days[o.date].orders.push(o);
    days[o.date].total += o.total;
    o.items.forEach(i => days[o.date].items.push(i));
  });

  Object.keys(days).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).forEach(date => {
    const day = days[date];

    // Таблица заказов за день
    const ordersTable = document.createElement('table');
    ordersTable.style.width = '100%';
    ordersTable.style.borderCollapse = 'collapse';
    ordersTable.innerHTML = `
      <thead>
        <tr style="background:#f8f9fa;">
          <th>Заказ #</th>
          <th>Направление</th>
          <th>Сумма</th>
          <th>Статус</th>
        </tr>
      </thead>
      <tbody>`;

    day.orders.forEach(o => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${o.id}</td>
        <td>${o.direction || '-'}</td>
        <td>${o.total.toFixed(2)} ₽</td>
        <td class="status-${o.status}">${o.status}</td>`;
      ordersTable.querySelector('tbody').appendChild(tr);
    });

    // Таблица товаров за день (все позиции из всех заказов этого дня)
    const itemsTable = document.createElement('table');
    itemsTable.style.width = '100%';
    itemsTable.style.borderCollapse = 'collapse';
    itemsTable.innerHTML = `
      <thead>
        <tr style="background:#f8f9fa;">
          <th>Товар</th>
          <th>Кол-во</th>
          <th>Цена</th>
          <th>Итого</th>
        </tr>
      </thead>
      <tbody>`;

    day.items.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.productName}</td>
        <td>${item.qty}</td>
        <td>${item.price.toFixed(2)} ₽/шт</td>
        <td>${item.total.toFixed(2)} ₽</td>`;
      itemsTable.querySelector('tbody').appendChild(tr);
    });

    const calendarRow = document.createElement('tr');
    calendarRow.innerHTML = `
      <td><strong>${date}</strong></td>
      <td style="vertical-align:top;">${ordersTable.outerHTML}</td>
      <td style="vertical-align:top;">${itemsTable.outerHTML}</td>
      <td><strong>${day.total.toFixed(2)} ₽</strong></td>`;
    calendarBody.appendChild(calendarRow);
  });
}

// --- МОДАЛЬНОЕ ОКНО: ЗАКРЫТИЕ ---
function closeOrderDetails() {
  document.getElementById('order-details-modal').style.display = 'none';
}
