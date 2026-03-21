//
//Add function to the subscribe button
//


async function AddFunctionToSuscriptionForm() {
  const SUSCRIPTION_FORM = document.getElementById("suscription-form");

  SUSCRIPTION_FORM.addEventListener("submit", async (e) => {
    e.preventDefault();
    try{
    const response = await fetch("http://localhost:5183/api/users/subscribe", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("jwt_token")}`
      },
      body: JSON.stringify({
        Username: document.getElementById("name").value,
        Email: document.getElementById("email").value
      })
    })
      console.log(response);

    }catch(err){
      console.log(err);
      return;
    }
  })
}


//
//Get and render products created
//

async function GetProducts(){
  try{
    const response = await fetch("http://localhost:5183/api/products", {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("jwt_token")}`
      }
    })
    return response.json();
  }catch(err){
    console.log(err)
    throw err
 }
}

async function renderProducts() {
    const Response = await GetProducts();
    if (!Response || !Response.data) {
        console.error("Failed to fetch products or data is missing.");
        return;
    }
    const products = Response.data;
    const productGrid = document.querySelector("#nav-all .product-grid");

    if (!productGrid) {
        console.error("Product grid not found");
        return;
    }

    productGrid.innerHTML = ""; // Clear existing products

    products.forEach(product => {
        const productCol = document.createElement("div");
        productCol.className = "col";

        productCol.innerHTML = `
            <div class="product-item" data-product-id="${product.id}">
                <figure>
                    <a href="#" title="${product.name}">
                        <img src="${product.imageUrl}" class="tab-image">
                    </a>
                </figure>
                <h3>${product.name}</h3>
                <span class="price">$${product.price.toFixed(2)}</span>
                <div class="d-flex align-items-center justify-content-between">
                    <div class="input-group product-qty">
                        <span class="input-group-btn">
                            <button type="button" class="quantity-left-minus btn btn-danger btn-number" data-type="minus">
                                <svg width="16" height="16"><use xlink:href="#minus"></use></svg>
                            </button>
                        </span>
                        <input type="text" name="quantity" class="form-control input-number" value="1" readonly>
                        <span class="input-group-btn">
                            <button type="button" class="quantity-right-plus btn btn-success btn-number" data-type="plus">
                                <svg width="16" height="16"><use xlink:href="#plus"></use></svg>
                            </button>
                        </span>
                    </div>
                    <a href="#" class="nav-link add-to-cart-btn" data-product-id="${product.id}">Add to Cart <iconify-icon icon="uil:shopping-cart"></iconify-icon></a>
                </div>
            </div>
        `;
        productGrid.appendChild(productCol);
    });
  setupProductEventListeners(products);
}

function setupProductEventListeners(products) {
    const productGrid = document.querySelector("#nav-all .product-grid");
    if (!productGrid) return;

    productGrid.addEventListener("click", async (e) => {
        const plusBtn = e.target.closest(".quantity-right-plus");
        const minusBtn = e.target.closest(".quantity-left-minus");
        const addToCartBtn = e.target.closest(".add-to-cart-btn");

        if (plusBtn) {
            const quantityInput = plusBtn.closest('.product-qty').querySelector('.input-number');
            let currentValue = parseInt(quantityInput.value);
            quantityInput.value = currentValue + 1;
        }

        if (minusBtn) {
            const quantityInput = minusBtn.closest('.product-qty').querySelector('.input-number');
            let currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        }

        if (addToCartBtn) {
            e.preventDefault(); // Prevent link from navigating
            
            const productItem = addToCartBtn.closest('.product-item');
            const quantityInput = productItem.querySelector('.input-number');
            
            const productId = parseInt(addToCartBtn.dataset.productId, 10);
            const quantity = parseInt(quantityInput.value, 10);

            try {
                const response = await fetch('http://localhost:5183/api/cart', {
                    method: "POST",
                    headers: {
                        'Content-Type': "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`
                    },
                    body: JSON.stringify({
                        ProductId: productId,
                        Quantity: quantity
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, text: ${errorText}`);
                }

                const result = await response.json();
                console.log('Item added to cart:', result);
                await renderCartItems(); // Re-render cart after adding an item
            } catch (error) {
                console.error('Failed to add item to cart:', error);
            }
        }
    });
}

async function getCart() {
    try {
        const response = await fetch('http://localhost:5183/api/cart', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("jwt_token")}`
            }
        });
        if (response.status === 404 || response.status === 204) { // 204 No Content
            return null; // No cart found for user or cart is empty
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        if(!text){
          return null;
        }
        return JSON.parse(text);
    } catch (error) {
        console.error('Failed to fetch cart:', error);
        return null;
    }
}

async function removeCartItem(cartItemId) {
    try {
        const response = await fetch(`http://localhost:5183/api/cart/${cartItemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("jwt_token")}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log(`Item ${cartItemId} removed.`);
        await renderCartItems(); // Refresh cart view
    } catch (error) {
        console.error('Failed to remove item:', error);
    }
}

async function renderCartItems() {
    const cartResponse = await getCart();
    const cart = cartResponse?.cart;
    const isFirstPurchase = cartResponse?.isFirstPurchase || false;

    const cartContainer = document.querySelector('#offcanvasCart .list-group');
    const cartBadge = document.querySelector('#offcanvasCart .badge');
    const cartTotalElement = document.querySelector('.cart-total');


    if (!cartContainer) {
        console.error("Cart container not found");
        return;
    }

    cartContainer.innerHTML = ''; // Clear existing items

    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
        cartContainer.innerHTML = '<li class="list-group-item">Your cart is empty.</li>';
        if(cartBadge) cartBadge.textContent = '0';
        if(cartTotalElement) cartTotalElement.textContent = '$0.00';
        
        const totalLi = document.createElement('li');
        totalLi.className = 'list-group-item d-flex justify-content-between';
        totalLi.innerHTML = `<span>Total (USD)</span><strong>$0.00</strong>`;
        cartContainer.appendChild(totalLi);
        return;
    }

    let total = 0;
    cart.cartItems.forEach(item => {
        const itemTotal = item.product.price * item.quantity;
        total += itemTotal;

        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between lh-sm';
        li.innerHTML = `
            <div>
                <h6 class="my-0">${item.product.name}</h6>
                <small class="text-body-secondary">Quantity: ${item.quantity}</small>
            </div>
            <div class="d-flex align-items-center">
                <span class="text-body-secondary me-3">$${itemTotal.toFixed(2)}</span>
                <button type="button" class="btn-close remove-from-cart-btn" data-cart-item-id="${item.id}" aria-label="Remove"></button>
            </div>
        `;
        cartContainer.appendChild(li);
    });

    // Add the total list item
    const totalLi = document.createElement('li');
    totalLi.className = 'list-group-item d-flex flex-column';
    
    let discountInfo = '';
    if (isFirstPurchase) {
        discountInfo = `
            <div class="text-success text-end mt-1">
                <small><i class="bi bi-patch-check-fill"></i> ¡Descuento del 25% incluido!</small>
            </div>
        `;
    }

    totalLi.innerHTML = `
        <div class="d-flex justify-content-between">
            <span>Total (USD)</span>
            <strong>$${total.toFixed(2)}</strong>
        </div>
        ${discountInfo}
    `;
    cartContainer.appendChild(totalLi);

    // Update badge and cart total in header
    if (cartBadge) {
        cartBadge.textContent = cart.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }
    if (cartTotalElement) {
        cartTotalElement.textContent = `$${total.toFixed(2)}`;
    }
}


document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  AddFunctionToSuscriptionForm();
  renderCartItems();

  // Add a single event listener to the cart for remove buttons
  const cartContainer = document.querySelector('#offcanvasCart');
  if (cartContainer) {
      cartContainer.addEventListener('click', (e) => {
          if (e.target.classList.contains('remove-from-cart-btn')) {
              const cartItemId = e.target.dataset.cartItemId;
              removeCartItem(cartItemId);
          }
      });
  }
})
