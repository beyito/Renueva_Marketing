// 1. Función para añadir al carrito
function addToCart(nombre, precio, imagen) {
    // Obtenemos el carrito actual o creamos uno vacío
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    
    // Creamos el producto
    let product = {
        name: nombre,
        price: precio,
        image: imagen
    };

    // Lo guardamos
    cart.push(product);
    localStorage.setItem('myCart', JSON.stringify(cart));

    // Feedback visual
    alert(`¡${nombre} añadido al carrito!`);
    updateCartCount();
}

// 2. Función para cargar el carrito en cart.html
function loadCartItems() {
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    let container = document.getElementById('cart-items-container');
    let totalElement = document.getElementById('cart-total');
    let total = 0;

    container.innerHTML = ''; // Limpiar

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px;">Tu carrito está vacío 😢</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.price;
            
            // Crear HTML del producto
            let itemHTML = `
                <div class="cart-item">
                    <div class="cart-img" style="background-image: url('${item.image}');"></div>
                    <div class="cart-info">
                        <h4>${item.name}</h4>
                        <p class="price">${item.price} Bs.</p>
                    </div>
                    <button class="btn-remove" onclick="removeItem(${index})">🗑️</button>
                </div>
            `;
            container.innerHTML += itemHTML;
        });
    }

    // Actualizar Total
    if(totalElement) {
        totalElement.innerText = total + ' Bs.';
    }
}

// 3. Eliminar un item
function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    cart.splice(index, 1); // Borrar el item
    localStorage.setItem('myCart', JSON.stringify(cart));
    loadCartItems(); // Recargar la lista
    updateCartCount();
}

// 4. Actualizar contador del header
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    let badge = document.getElementById('cart-count');
    if(badge) {
        badge.innerText = cart.length;
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    // Solo cargar items si estamos en la página del carrito
    if(document.getElementById('cart-items-container')) {
        loadCartItems();
    }
});

/* --- FUNCIONES PARA DETALLE DE PRODUCTO --- */

// 1. Guardar producto y redirigir
function viewProduct(name, price, image, category, condition, repairs) {
    const product = {
        name: name,
        price: price,
        image: image,
        category: category,
        condition: condition, // Ej: "Como Nuevo"
        repairs: repairs      // Ej: "Botón cosido, Lavado industrial"
    };
    
    localStorage.setItem('currentProduct', JSON.stringify(product));
    window.location.href = 'product.html'; // Nos vamos a la nueva página
}

// 2. Cargar datos en product.html
function loadProductDetails() {
    const product = JSON.parse(localStorage.getItem('currentProduct'));
    
    if (!product) return; // Si no hay datos, no hacemos nada

    // Llenar los campos del HTML
    document.getElementById('detail-img').style.backgroundImage = `url('${product.image}')`;
    document.getElementById('detail-category').innerText = product.category;
    document.getElementById('detail-name').innerText = product.name;
    document.getElementById('detail-price').innerText = product.price + ' Bs.';
    document.getElementById('detail-condition').innerText = product.condition;
    document.getElementById('detail-repairs').innerText = product.repairs;

    // Configurar el botón de añadir al carrito de esta página
    const addBtn = document.getElementById('detail-add-btn');
    addBtn.onclick = function() {
        addToCart(product.name, product.price, product.image);
    };
}

// Agregar esto al listener existente
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    if(document.getElementById('cart-items-container')) loadCartItems();
    
    // NUEVO: Si estamos en la página de producto, cargar detalles
    if(document.getElementById('detail-name')) loadProductDetails(); 
});