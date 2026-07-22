if (!localStorage.getItem('crm-clients')) localStorage.setItem('crm-clients', JSON.stringify([]));
if (!localStorage.getItem('crm-products')) localStorage.setItem('crm-products', JSON.stringify([]));
if (!localStorage.getItem('crm-orders')) localStorage.setItem('crm-orders', JSON.stringify([]));

function getClients() { return JSON.parse(localStorage.getItem('crm-clients')); }
function getProducts() { return JSON.parse(localStorage.getItem('crm-products')); }
function getOrders() { return JSON.parse(localStorage.getItem('crm-orders')); }

function saveClients(arr) { localStorage.setItem('crm-clients', JSON.stringify(arr)); }
function saveProducts(arr) { localStorage.setItem('crm-products', JSON.stringify(arr)); }
function saveOrders(arr) { localStorage.setItem('crm-orders', JSON.stringify(arr)); }

let editingOrderId = null;
let editingProductId = null;

function showSection(id) {
  document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('active');
  if (id === 'clients') renderClients();
  if (id === 'products') renderProducts();
  if (id === 'orders') renderOrders();
  if (id === 'create-order') {
    renderCreateOrder();
    document.getElementById('order-form-title').textContent = editingOrderId ? 'Редактирование заказа' : 'Новый заказ';
  }
}

// --- Клиенты ---
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
  const clients = getClients().filter(c => c.id != id);
  saveClients(clients);
  renderClients();
}
function renderClients() {
  const list = document.getElementById('clients-list');
  list.innerHTML = '';
  getClients().forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.name}</td><td>${c.address}</td><td><button class="del" onclick="deleteClient(${c.id})">Удалить</button></td>`;
    list.appendChild(tr);
  });
}

// --- Товары ---
function addProduct() {
  const name = document.getElementById('product-name').value.trim();
  const priceStr = document.getElementById('product-price').value;
  const price = parseFloat(priceStr);
  if (!name || isNaN(price)) return alert('Заполните название и цену товара');
  const products = getProducts();
  products.push({ id: Date.now(), name, price });
  saveProducts(products);
  document.getElementById('product-name').value = '';
  document.getElementById('product-price').value = '';
  renderProducts();
}
function deleteProduct(id) {
  if (!confirm('Удалить товар? Позиции в старых заказах останутся.')) return;
  const products = getProducts().filter(p => p.id != id);
  saveProducts(products);
  renderProducts();
}
function editProduct(id) {
  editingProductId = id;
  const product = getProducts().find(p => p.id == id);
  if (!product) { alert('Товар не найден'); return; }
  document.getElementById('edit-product-name').value = product.name;
  document.getElementById('edit-product-price').value = product.price;
  document.getElementById('edit-product-modal').style.display = 'flex';
}
function closeEditProductModal() {
  editingProductId = null;
  document.getElementById('edit-product-modal').style.display = 'none';
}
function saveEditedProduct() {
  const name = document.getElementById('edit-product-name').value.trim();
  const priceStr = document.getElementById('edit-product-price').value;
  const price = parseFloat(priceStr);
  if (!name || isNaN(price)) {
    return alert('Заполните название и корректную цену товара');
  }
  const products = getProducts();
  const idx = products.findIndex(p => p.id == editingProductId);
  if (idx >= 0) {
    products[idx] = { ...products[idx], name, price };
    saveProducts(products);
    closeEditProductModal();
    renderProducts();
    alert('Товар обновлён!');
  } else {
    alert('Не удалось сохранить: товар не найден');
  }
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
        <button class="edit" onclick="editProduct(${p.id})">Редактировать</button>
        <button class="del" onclick="deleteProduct(${p.id})">Удалить</button>
      </td>`;
    list.appendChild(tr);
  });
}

// --- Заказы ---
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
      <td>
        <button class="edit" onclick="editOrder(${o.id})">Редактировать</button>
        <button class="del" onclick="deleteOrder(${o.id})">Удалить</button>
      </td>`;
    list.appendChild(tr);
  });
}
function deleteOrder(id) {
  if (!confirm('Удалить заказ?')) return;
  const orders = getOrders().filter(o => o.id != id);
  saveOrders(orders);
  renderOrders();
}
function editOrder(id) {
  editingOrderId = id;
  showSection('create-order');
}
function renderCreateOrder() {
  const select = document.getElementById('order-client');
  select.innerHTML = '';
  const clients = getClients();
  clients.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    select.appendChild(opt);
  });
  const container = document.getElementById('order-items');
  container.innerHTML = '';
  if (editingOrderId !== null) {
    const order = getOrders().find(o => o.id == editingOrderId);
    if (!order) { alert('Заказ не найден'); showSection('orders'); return; }
    document.getElementById('order-client').value = order.clientId;
    document.getElementById('order-status').value = order.status;
    order.items.forEach(item => {
      const row = createOrderItemRow(item.productId, item.qty);
      container.appendChild(row);
    });
  } else {
    addOrderItemRow();
  }
}
function createOrderItemRow(productId = '', qty = 1) {
  const row = document.createElement('div');
  row.innerHTML = `
    <select class="order-product"></select>
    <input type="number" class="order-qty" placeholder="Кол-во" min="1" value="${qty}" />
    <button onclick="this.parentElement.remove()" style="color:red">×</button>`;
  const products = getProducts();
  const sel = row.querySelector('select');
  sel.innerHTML = '<option value="">-- выберите товар --</option>';
  products.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.name} (${p.price.toFixed(2)} ₽)`;
    sel.appendChild(opt);
  });
  if (productId) sel.value = productId;
  sel.addEventListener('change', recalcTotal);
  row.querySelector('.order-qty').addEventListener('input', recalcTotal);
  return row;
}
function addOrderItemRow() {
  const container = document.getElementById('order-items');
  container.appendChild(createOrderItemRow());
}
function recalcTotal() {
  console.log('Пересчёт суммы...');
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
    const qty = parseInt(qtyInput.value,
