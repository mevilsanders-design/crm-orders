// --- Инициализация хранилища ---
function initStorage() {
  if (!localStorage.getItem('crm-clients')) localStorage.setItem('crm-clients', JSON.stringify([]));
  if (!localStorage.getItem('crm-products')) localStorage.setItem('crm-products', JSON.stringify([]));
  if (!localStorage.getItem('crm-orders')) localStorage.setItem('crm-orders', JSON.stringify([]));
}
initStorage();

function getClients() { return JSON.parse(localStorage.getItem('crm-clients')); }
function getProducts() { return JSON.parse(localStorage.getItem('crm-products')); }
function getOrders() { return JSON.parse(localStorage.getItem('crm-orders')); }

function saveClients(arr) { localStorage.setItem('crm-clients', JSON.stringify(arr)); }
function saveProducts(arr) { localStorage.setItem('crm-products', JSON.stringify(arr)); }
function saveOrders(arr) { localStorage.setItem('crm-orders', JSON.stringify(arr)); }

let editingOrderId = null;

// --- Переключение вкладок ---
function showSection(id) {
  document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('active');

  if (id === 'folders') renderFolders();
  if (id === 'products') renderProducts();
  if (id === 'orders') renderOrders();
  if (id === 'create-order') {
    renderCreateOrder();
    document.getElementById('order-form-title').textContent = editingOrderId ? 'Редактирование заказа' : 'Новый заказ';
  }
}

// --- ЛОГИКА ПАПОК (НАПРАВЛЕНИЙ) ---
const folders = ['Сергач', 'Кстово', 'Арз', 'ЛСК-КНГ'];

function renderFolders() {
  const container = document.getElementById('folders-container');
  container.innerHTML = '';
  
  folders.forEach(folderName => {
    const clients = getClients().filter(c => c.folder === folderName);
    
    const li = document.createElement('li');
    li.className = 'folder-item';
    
    // Заголовок папки (с количеством клиентов)
    li.innerHTML = `
      <div class="folder-header" onclick="toggleFolder('${folderName}')">
        📁 ${folderName} <span style="font-size:0.8em; color:#666">(клиентов: ${clients.length})</span>
        <span id="arrow-${folderName}" style="font-weight:normal">▼</span>
      </div>
      <div id="content-${folderName}" class="folder-content">
        <table style="width:100%">
          <thead><tr><th>Клиент</th><th>Адрес</th><th>Действия</th></tr></thead>
          <tbody id="clients-${folderName}-list"></tbody>
        </table>
      </div>
    `;
    container.appendChild(li);

    // Рендерим клиентов внутри папки
    const tbody = document.getElementById(`clients-${folderName}-list`);
    tbody.innerHTML = '';
    clients.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.name}</td>
        <td>${c.address}</td>
        <td><button class="del" onclick="deleteClient(${c.id})">Удалить</button></td>
      `;
      tbody.appendChild(tr);
    });
  });
}

function toggleFolder(name) {
  const content = document.getElementById(`content-${name}`);
  const arrow = document.getElementById(`arrow-${name}`);
  if (content.classList.contains('open')) {
    content.classList.remove('open');
    arrow.textContent = '▼';
  } else {
    content.classList.add('open');
    arrow.textContent = '▲';
  }
}

// Добавление клиента с привязкой к папке
function addClient() {
  const folder = document.getElementById('new-client-folder').value;
  const name = document.getElementById('new-client-name').value.trim();
  const address = document.getElementById('new-client-address').value.trim();
  
  if (!name) return alert('Введите название клиента');
  
  const clients = getClients();
  clients.push({ id: Date.now(), name, address, folder });
  saveClients(clients);
  
  // Очистка полей
  document.getElementById('new-client-name').value = '';
  document.getElementById('new-client-address').value = '';
  renderFolders(); // Перерисовать папки
}

function deleteClient(id) {
  if(!confirm('Удалить клиента?')) return;
  const clients = getClients().filter(c => c.id != id);
  saveClients(clients);
  renderFolders();
}

// --- ТОВАРЫ ---
function addProduct() {
  const name = document.getElementById('product-name').value.trim();
  const price = parseFloat(document.getElementById('product-price').value);
  if (!name || isNaN(price)) return alert('Заполните название и цену');
  
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
    tr.innerHTML = `<td>${p.name}</td><td>${p.price.toFixed(2)} ₽</td><td><button class="del" onclick="deleteProduct(${p.id})">Удалить</button></td>`;
    list.appendChild(tr);
  });
}

function deleteProduct(id) {
  if(!confirm('Удалить товар?')) return;
  const products = getProducts().filter(p => p.id != id);
  saveProducts(products);
  renderProducts();
}

// --- ЗАКАЗЫ ---
function updateClientSelect() {
  const select = document.getElementById('order-client');
  const folderFilter = document.getElementById('order-folder').value;
  
  select.innerHTML = '<option value="">-- выберите клиента --</option>';
  const allClients = getClients();
  
  allClients.forEach(client => {
    // Если выбран фильтр папки, показываем только тех, кто в ней
    if (folderFilter && client.folder !== folderFilter) return;
    
    const opt = document.createElement('option');
    opt.value = client.id;
    opt.textContent = `${client.name} (${client.folder})`;
    select.appendChild(opt);
  });
}

function filterClientByFolder() {
  updateClientSelect();
}

function renderCreateOrder() {
  editingOrderId = null;
  document.getElementById('order-form-title').textContent = 'Новый заказ';
  document.getElementById('order-items').innerHTML = '';
  addOrderItemRow(); // Добавляем одну пустую строку
  updateClientSelect(); // Заполняем список клиентов
}

function createOrderItemRow(productId = '', qty = 1) {
  const row = document.createElement('div');
  row.style.marginBottom = '8px';
  row.innerHTML = `
    <select class="order-product"></select>
    <input type="number" class="order-qty" placeholder="Кол-во" min="1" value="${qty}" style="width:80px" />
    <button class="del" onclick="this.parentElement.remove()" style="padding:5px">×</button>
  `;
  
  const products = getProducts();
  const sel = row.querySelector('select');
  sel.innerHTML = '<option value="">-- товар --</option>';
  products.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.name} (${p.price.toFixed(2)} ₽)`;
    sel.appendChild(opt);
  });
  
  if (productId) sel.value = productId;
  return row;
}

function addOrderItemRow() {
  const container = document.getElementById('order-items');
  container.appendChild(createOrderItemRow());
}

function saveOrder() {
