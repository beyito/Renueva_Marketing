/* --- SISTEMA DE SESIÓN, MENÚ Y LÓGICA DE NEGOCIO --- */

document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();   // Verificar usuario
    updateCartCount();  // Actualizar contador
    setupMobileMenu();  // Menú móvil
    
    // Cargas condicionales según la página
    if(document.getElementById('cart-items-container')) loadCartItems();
    if(document.getElementById('searchInput')) setupSearch(); 
    if(document.getElementById('detail-name')) loadProductDetails();
});

// --- 1. VALIDACIÓN DE SESIÓN ---
function checkAuthState() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const loginBtn = document.getElementById('nav-login');
    const userMenu = document.getElementById('nav-user-menu');
    const usernameSpan = document.getElementById('nav-username');

    if (user) {
        if(loginBtn) loginBtn.style.display = 'none';
        if(userMenu) {
            userMenu.style.display = 'flex';
            if(usernameSpan) usernameSpan.innerText = user.name.split(' ')[0];
        }
    } else {
        if(loginBtn) loginBtn.style.display = 'inline-block';
        if(userMenu) userMenu.style.display = 'none';
    }
}

function loginUser(name, email) {
    const user = { name: name, email: email };
    localStorage.setItem('currentUser', JSON.stringify(user));
    showToast(`Bienvenido, ${name}`);
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function logout() {
    localStorage.removeItem('currentUser');
    showToast('Sesión cerrada');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function setupMobileMenu() {
    const nav = document.querySelector('nav');
    if (nav && !document.querySelector('.mobile-menu-btn')) {
        const btn = document.createElement('button');
        btn.className = 'mobile-menu-btn';
        btn.innerHTML = '☰';
        btn.onclick = () => document.querySelector('.nav-links').classList.toggle('active');
        nav.insertBefore(btn, document.querySelector('.nav-links')); 
    }
}

// --- 2. SISTEMA DE NOTIFICACIONES (TOAST) ---
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    // Si es error, añadimos la clase 'error' para que salga rojo (definido en css)
    toast.className = `toast ${type}`;
    
    // Elegimos el icono según el tipo
    let icon = '✅';
    if (type === 'error') icon = '⛔';
    if (type === 'info') icon = 'ℹ️';

    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.5s ease-out forwards';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// --- 3. LÓGICA DEL CARRITO (CON VALIDACIÓN DE STOCK ÚNICO) ---
function addToCart(nombre, precio, imagen) {
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    
    // --- NUEVA VALIDACIÓN ---
    // Buscamos si ya existe algún producto con el mismo nombre
    const existe = cart.some(item => item.name === nombre);

    if (existe) {
        // Si existe, mostramos error y NO agregamos nada
        showToast('Esta prenda única ya está en tu carrito', 'error');
        return; 
    }
    // ------------------------

    cart.push({ name: nombre, price: precio, image: imagen });
    localStorage.setItem('myCart', JSON.stringify(cart));
    showToast(`${nombre} agregado al carrito`);
    updateCartCount();
}

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    let badge = document.getElementById('cart-count');
    if(badge) badge.innerText = cart.length;
}

function loadCartItems() {
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    let container = document.getElementById('cart-items-container');
    let totalElement = document.getElementById('cart-total');
    let subtotalElement = document.getElementById('subtotal');
    
    if(!container) return;
    
    container.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px; color:#888;">Tu carrito está vacío 😢<br><a href="index.html" style="color:var(--accent); text-decoration:underline;">Ir a ver ropa</a></p>';
        if(totalElement) totalElement.innerText = '0 Bs.';
        if(subtotalElement) subtotalElement.innerText = '0 Bs.';
    } else {
        cart.forEach((item, index) => {
            total += item.price;
            container.innerHTML += `
                <div class="cart-item">
                    <div class="cart-img" style="background-image: url('${item.image}');"></div>
                    <div class="cart-info">
                        <h4>${item.name}</h4>
                        <p class="price">${item.price} Bs.</p>
                        <span style="font-size:0.75rem; color:#d35400; background:#fdebd0; padding:2px 6px; border-radius:4px;">Última unidad</span>
                    </div>
                    <button class="btn-remove" onclick="removeItem(${index})">🗑️</button>
                </div>`;
        });
        
        // Actualizar totales
        if(subtotalElement) subtotalElement.innerText = total + ' Bs.';
        if(totalElement) totalElement.innerText = (total + 15) + ' Bs.';
    }
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('myCart', JSON.stringify(cart));
    loadCartItems();
    updateCartCount();
    showToast('Producto eliminado');
}

// --- 4. DETALLE DE PRODUCTO ---
function viewProduct(name, price, image, category, condition, repairs) {
    const product = { name, price, image, category, condition, repairs };
    localStorage.setItem('currentProduct', JSON.stringify(product));
    window.location.href = 'product.html';
}

function loadProductDetails() {
    const product = JSON.parse(localStorage.getItem('currentProduct'));
    if (!product || !document.getElementById('detail-name')) return;

    document.getElementById('detail-img').style.backgroundImage = `url('${product.image}')`;
    document.getElementById('detail-category').innerText = product.category;
    document.getElementById('detail-name').innerText = product.name;
    document.getElementById('detail-price').innerText = product.price + ' Bs.';
    document.getElementById('detail-condition').innerText = product.condition;
    document.getElementById('detail-repairs').innerText = product.repairs;
    
    document.getElementById('detail-add-btn').onclick = () => addToCart(product.name, product.price, product.image);
}

// --- 5. BUSCADOR Y FILTROS ---
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const productContainer = document.querySelector('.product-grid');
    const products = Array.from(document.querySelectorAll('.product-card'));

    function filterProducts() {
        const searchText = searchInput.value.toLowerCase();
        const categoryValue = categoryFilter.value;
        const sortValue = sortFilter.value;

        let visibleProducts = products.filter(card => {
            const name = card.getAttribute('data-name').toLowerCase();
            const category = card.getAttribute('data-category');
            
            const matchesSearch = name.includes(searchText);
            const matchesCategory = categoryValue === 'all' || category === categoryValue;

            if (matchesSearch && matchesCategory) {
                card.style.display = 'block';
                return true;
            } else {
                card.style.display = 'none';
                return false;
            }
        });

        if (sortValue === 'price-asc') {
            visibleProducts.sort((a, b) => parseFloat(a.getAttribute('data-price')) - parseFloat(b.getAttribute('data-price')));
        } else if (sortValue === 'price-desc') {
            visibleProducts.sort((a, b) => parseFloat(b.getAttribute('data-price')) - parseFloat(a.getAttribute('data-price')));
        } else if (sortValue === 'newest') {
            visibleProducts.reverse(); 
        }

        visibleProducts.forEach(card => productContainer.appendChild(card));
        
        const countLabel = document.getElementById('resultsCount');
        if(countLabel) {
            countLabel.innerText = visibleProducts.length === 0 
                ? 'No encontramos prendas con esos filtros 🧐' 
                : `${visibleProducts.length} prendas encontradas`;
        }
    }

    searchInput.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);
    sortFilter.addEventListener('change', filterProducts);
}

/* --- FUNCIONALIDAD DE REPORTE --- */
function openReportModal() {
    const modal = document.getElementById('report-modal');
    if(modal) {
        modal.style.display = 'flex';
        generateReportData(); // Llenar tabla con datos falsos (simulación)
    }
}

function closeReportModal() {
    const modal = document.getElementById('report-modal');
    if(modal) modal.style.display = 'none';
}

function generateReportData() {
    const tbody = document.getElementById('report-body');
    // Simulamos datos de ventas históricas
    const sales = [
        { date: '15/01/2026', item: 'Camisa Lino Zara', price: 120, fee: 20, net: 100 },
        { date: '10/01/2026', item: 'Jeans Levis 501', price: 210, fee: 35, net: 175 },
        { date: '05/01/2026', item: 'Vestido Floral', price: 140, fee: 25, net: 115 }
    ];

    let html = '';
    let totalNet = 0;

    sales.forEach(sale => {
        totalNet += sale.net;
        html += `
            <tr>
                <td>${sale.date}</td>
                <td>${sale.item}</td>
                <td>${sale.price} Bs.</td>
                <td style="color:#e74c3c;">-${sale.fee} Bs.</td>
                <td style="font-weight:bold; color:#27ae60;">+${sale.net} Bs.</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    document.getElementById('report-total').innerText = totalNet + ' Bs.';
}

function printReport() {
    // Ocultar el resto de la página para imprimir solo el modal (truco CSS rápido o impresión directa)
    // Para este prototipo, imprimimos la ventana completa
    window.print();
}

// Cerrar modal si hacen clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('report-modal');
    if (event.target == modal) {
        closeReportModal();
    }
}