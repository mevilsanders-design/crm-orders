// Инициализация
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
  getClients().filter(c =>
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
        <button style="background:#007bff;color:white;padding:6px 10px;border-radius:4px;cursor:pointer;margin-left:4px;"
                onclick="openClientProfile(${c.id})">История</button>`;
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
  clearClientForm();
  renderClients();
}

function clearClientForm() {
  document.getElementById('client-name').value = '';
  document.getElementById('client-store').value = '';
  document.getElementById('client-address').value = '';
}

function deleteClient(id) { if (!confirm('Удалить?')) return; saveClients(getClients().filter(c => c.id !== id)); renderClients(); }
function editClient(id) {
  const c = getClients
  const c = getClients().find(cl => cl.id === id);
  if (!c) return;
  document.getElementById('client-name').value = c.name;
  document.getElementById('client-store').value = c.storeName || '';
  document.getElementById('client-address').value = c.address;
  window.currentClientId = id;
  alert('Отредактируйте данные и нажмите «Добавить» — запись обновится');
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
  getProducts().filter(p =>
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

// --- БЫСТРЫЙ ПОДБОР ТОВАРОВ В ФОРМЕ ЗАКАЗА ---
function renderQuickProductList() {
  const container = document.getElementById('quick-products-list');
  const search = document.getElementById('quick-product-search')?.value.trim().toLowerCase() || '';
  const products = getProducts();

  container.innerHTML = '';
  const filtered = products.filter(p => p.name.toLowerCase().includes(search));

  if (filtered.length === 0) {
    container.textContent = 'Товары не найдены';
    return;
  }

  filtered.forEach(p => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = `${p.name} (${p.price.toFixed(2)} ₽)`;
    btn.className = 'btn-primary';
    btn.style.width = '100%';
    btn.style.margin = '4px 0';
    btn.style.padding = '8px';
    btn.onclick = () => addProductToOrderRow(p);
    container.appendChild(btn);
  });
}

document.getElementById('quick-product-search')?.addEventListener('input', renderQuickProductList);

function addProductToOrderRow(product) {
  const itemsContainer = document.getElementById('order-items');
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.gap = '8px';
  row.style.alignItems = 'center';
  row.style.marginBottom = '8px';

  row.innerHTML = `
    <input type="text" class="product-search-input" placeholder="Поиск…" style="flex:1; min-width:160px; padding:6px;" />
    <select class="order-product" style="flex:1; min-width:180px; padding:6px;"></select>
    <input type="number" class="order-qty" placeholder="Кол-во" min="1" value="1" style="width:70px; text-align:right; padding:6px;" />
    <button type="button" onclick="this.parentElement.remove()" style="color:#d9534f; cursor:pointer; padding:4px 8px;">×</button>`;

  itemsContainer.appendChild(row);

  const sel = row.querySelector('select');
  sel.innerHTML = `<option value="${product.id}" selected>${product.name} (${product.price.toFixed(2)} ₽)</option>`;

  const allProducts = getProducts();
  allProducts.forEach(p => {
    if (p.id !== product.id) {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} (${p.price.toFixed(2)} ₽)`;
      sel.appendChild(opt);
    }
  });

  const searchInput = row.querySelector('.product-search-input');
  searchInput.addEventListener('input', () => filterProductSelect(searchInput, sel), { once: false });

  const qtyInput = row.querySelector('.order-qty');
  qtyInput.focus(); // автофокус на количестве — можно сразу править
}

function filterProductSelect(input, select) {
  const text = input.value.trim().toLowerCase();
  const options = Array.from(select.options);
  const firstOption = options.shift(); // "-- выберите товар --"

  options.forEach(opt => {
    opt.style.display = opt.text.toLowerCase().includes(text) ? '' : 'none';
  });

  select.insertBefore(firstOption, select.firstChild);
}

// --- ЗАКАЗЫ ---
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

function closeOrderDetails() {
  document.getElementById('order-details-modal').style.display = 'none';
}

// --- ФОРМА СОЗДАНИЯ/РЕДАКТИРОВАНИЯ ЗАКАЗА ---
function renderCreateOrder() {
  // Заполняем список клиентов
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

  // Заголовок формы
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

  // Очистка и отрисовка строк состава заказа
  const itemsContainer = document.getElementById('order-items');
  itemsContainer.innerHTML = '';

  if (window.editingOrderId !== undefined) {
    const order = getOrders().find(o => o.id === window.editingOrderId);
    if (order && order.items && order.items.length > 0) {
      order.items.forEach(item => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '8px';
        row.style.alignItems = 'center';
        row.style.marginBottom = '8px';
        row.innerHTML = `
          <input type="text" class="product-search-input" placeholder="Поиск…" style="flex:1; min-width:160px; padding:6px;" />
          <select class="order-product" style="flex:1; min-width:180px; padding:6px;"></select>
          <input type="number" class="order-qty" placeholder="Кол-во" min="1" value="${item.qty}" style="width:70px; text-align:right; padding:6px;" />
          <button type="button" onclick="this.parentElement.remove()" style="color:#d9534f; cursor:pointer; padding:4px 8px;">×</button>`;
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

        const searchInput = row.querySelector('.product-search-input');
        searchInput.addEventListener('input', () => {
          filterProductSelect(searchInput, sel);
        }, { once: false });
      });
    } else {
      addOrderItemRow();
    }
  } else {
    addOrderItemRow();
  }

  // Отрисовка быстрого подбора товаров (кнопки слева)
  renderQuickProductList();
}

function addOrderItemRow() {
  const container = document.getElementById('order-items');
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.gap = '8px';
  row.style.alignItems = 'center';
  row.style.marginBottom = '8px';
  row.innerHTML = `
    <input type="text" class="product-search-input" placeholder="Поиск…" style="flex:1; min-width:160px; padding:6px;" />
    <select class="order-product" style="flex:1; min-width:180px; padding:6px;"></select>
    <input type="number" class="order-qty" placeholder="Кол-во" min="1" value="1" style="width:70px; text-align:right; padding:6px;" />
    <button type="button" onclick="this.parentElement.remove()" style="color:#d9534f; cursor:pointer; padding:4px 8px;">×</button>`;
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

  const searchInput = row.querySelector('.product-search-input');
  searchInput.addEventListener('input', () => {
    filterProductSelect(searchInput, sel);
  }, { once: false });
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
  const orders = getOrders();
  const now = new Date();
  const dateStr = now.toLocaleDateString('ru-RU');

  if (window.editingOrderId !== undefined) {
    // Редактирование существующего заказа
    const idx = orders.findIndex(o => o.id === window.editingOrderId);
    if (idx >= 0) {
      orders[idx] = {
        ...orders[idx],
        clientId,
        clientName: client.name,
        storeName: client.storeName || '',
        direction,
        items,
        total,
        date: dateStr,
        status: 'Новый' // при сохранении ставим статус «Новый» или можно оставить как был
      };
      delete window.editingOrderId;
    }
  } else {
    // Создание нового заказа
    orders.push({
      id: Date.now(),
      clientId,
      clientName: client.name,
      storeName: client.storeName || '',
      direction,
      items,
      total,
      date: dateStr,
      status: 'Новый'
    });
  }

  saveOrders(orders);
  alert('Заказ сохранён!');
  showSection('orders');
  renderOrders();
}

// --- ПРОФИЛЬ КЛИЕНТА (ИСТОРИЯ И КАЛЕНДАРЬ) ---
function renderClientProfile() {
  const id = window.viewingClientId;
  const client = getClients().find(c => c.id === id);
  if (!client) return;

  document.getElementById('client-profile-name').textContent = client.name;
  document.getElementById('client-profile-store').textContent = client.storeName || '-';
  document.getElementById('client-profile-address').textContent = client.address;
  document.getElementById('client-profile-id').textContent = client.id;

  // История заказов клиента
  const historyContainer = document.getElementById('client-orders-history');
  historyContainer.innerHTML = '';
  const allOrders = getOrders().filter(o => o.clientId === id);

  allOrders.forEach(o => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.date}</td>
      <td>${o.direction || '-'}</td>
      <td>${o.storeName ? `${o.storeName} (${o.clientName})` : o.clientName}</td>
      <td>${o.total.toFixed(2)} ₽</td>
      <td class="status-${o.status}">${o.status}</td>
      <td>
        <button class="btn-secondary" style="padding:4px 8px;"
                onclick="window.editingOrderId=${o.id}; showSection('create-order')">Изменить</button>
        <button class="btn-delete" style="padding:4px 8px; margin-left:4px;"
                onclick="deleteOrder(${o.id})">Удалить</button>
      </td>`;
    historyContainer.appendChild(tr);
  });

  // Календарь посещений по дням (агрегация по дате)
  const calendarBody = document.getElementById('client-calendar-body');
  calendarBody.innerHTML = '';

  const daysMap = {}; // ключ: дата, значение: { orders: [], items: [], total: 0 }

  allOrders.forEach(o => {
    if (!daysMap[o.date]) {
      daysMap[o.date] = { orders: [], items: [], total: 0 };
    }
    daysMap[o.date].orders.push(o);
    daysMap[o.date].total += o.total;
    o.items.forEach(item => {
      daysMap[o.date].items.push(item);
    });
  });

  Object.keys(daysMap).sort().forEach(date => {
    const day = daysMap[date];
    const ordersTable = document.createElement('table');
    ordersTable.style.width = '100%';
    ordersTable.style.borderCollapse = 'collapse';
    ordersTable.innerHTML = `
      <thead><tr style="background:#f8f9fa;">
        <th>№ заказа</th>
        <th>Направление</th>
        <th>Магазин (Точка)</th>
        <th>Сумма</th>
        <th>Статус</th>
      </tr></thead>
      <tbody>`;

    day.orders.forEach(o => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${o.id}</td>
        <td>${o.direction || '-'}</td>
        <td>${o.storeName ? `${o.storeName} (${o.clientName})` : o.clientName}</td>
        <td>${o.total.toFixed(2)} ₽</td>
        <td class="status-${o.status}">${o.status}</td>`;
      ordersTable.querySelector('tbody').appendChild(tr);
    });

    const itemsTable = document.createElement('table');
    itemsTable.style.width = '100%';
    itemsTable.style.borderCollapse = 'collapse';
    itemsTable.innerHTML = `
      <thead><tr style="background:#f8f9fa;">
        <th>Товар</th>
        <th>Кол-во</th>
        <th>Цена</th>
        <th>Итого</th>
      </tr></thead>
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

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${date}</strong></td>
      <td style="vertical-align:top;">${ordersTable.outerHTML}</td>
      <td style="vertical-align:top;">${itemsTable.outerHTML}</td>
      <td><strong>${day.total.toFixed(2)} ₽</strong></td>`;
    calendarBody.appendChild(row);
  });
}
