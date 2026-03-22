//
//brings and shows all the products
//
const PRODUCTS_TABLE = document.getElementById("products-table");

async function getAllProductsFromDB(){
  try{
    const response = await fetch("/api/products?PageSize=20&Page=1")
    if(!response.ok) throw new Error("Error getting products");
    const responseData = await response.json();
    return responseData.data;
  }catch(err){
    console.log(err);
    return null;
  }
}

let editingProductId = null;

async function renderProducts() {
    const products = await getAllProductsFromDB();
    const PRODUCTS_TABLE_BODY = document.querySelector("#products-table tbody");

    if (!products || !Array.isArray(products) || products.length === 0) {
        PRODUCTS_TABLE_BODY.innerHTML = '<tr><td colspan="5">No products found.</td></tr>';
        return;
    }

    PRODUCTS_TABLE_BODY.innerHTML = "";
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const row = `
            <tr id="product${product.id}">
                <td>${i + 1}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary edit-button" data-product-id="${product.id}">Edit</button>
                    <button class="btn btn-sm btn-outline-danger delete-button" data-product-id="${product.id}">Delete</button>
                </td>
            </tr>
        `;
        PRODUCTS_TABLE_BODY.innerHTML += row;
    }
    
    AddEditFunctionToTheButtons(products);
    AddDeleteFunctionToTheButtons();
}

function AddEditFunctionToTheButtons(products) {
    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    const modalTitle = document.getElementById('productModalLabel');
    const productNameInput = document.getElementById("product-name");
    const productCategoryInput = document.getElementById("product-category");
    const productPriceInput = document.getElementById("product-price");
    const productDescriptionInput = document.getElementById("product-description");
    const productImageInput = document.getElementById("product-image");

    document.querySelectorAll(".edit-button").forEach(button => {
        button.addEventListener("click", (e) => {
            const productId = e.currentTarget.getAttribute('data-product-id');
            const product = products.find(p => p.id == productId);

            if (product) {
                editingProductId = product.id;
                
                modalTitle.textContent = `Edit Product: ${product.name}`;
                productNameInput.value = product.name;
                productCategoryInput.value = product.category;
                productPriceInput.value = product.price;
                productDescriptionInput.value = product.description;
                productImageInput.value = product.imageUrl;

                productModal.show();
            }
        });
    });
}

function AddDeleteFunctionToTheButtons(){
  document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener("click", async (e) => {
      if(!confirm("Are you sure you want to delete this product?")) return;
      
      const productId = e.currentTarget.getAttribute('data-product-id');

      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
          headers: { 'Authorization': `Bearer ${localStorage.getItem("jwt_token")}` }
        });

        if(!response.ok) {
          throw new Error('Failed to delete product.');
        }
        
        document.getElementById(`product${productId}`)?.remove();

      } catch(err) {
        console.error(err);
        alert('Error deleting product.');
      }
    });
  });
}

async function setupProductForm() {
    const productForm = document.getElementById("product-form");
    const productModal = document.getElementById('productModal');
    const modal = bootstrap.Modal.getInstance(productModal) || new bootstrap.Modal(productModal);

    productForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const productData = {
            name: document.getElementById("product-name").value,
            description: document.getElementById("product-description").value,
            price: parseFloat(document.getElementById("product-price").value),
            imageUrl: document.getElementById("product-image").value,
            category: document.getElementById("product-category").value
        };

        if (editingProductId) {
            productData.id = editingProductId;
        }

        const method = editingProductId ? "PUT" : "POST";
        const url = editingProductId 
            ? `/api/products/${editingProductId}`
            : "/api/products";

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save product.');
            }

            modal.hide();
            location.reload();

        } catch (err) {
            console.error("Error saving product:", err);
            alert(`Error saving product: ${err.message}`);
        }
    });

    productModal.addEventListener('hidden.bs.modal', () => {
        editingProductId = null;
        productForm.reset();
        document.getElementById('productModalLabel').textContent = "Add/Edit Product";
    });
}

//
//Orders
//

async function getAllOrdersFromDB(){
  try{
    const response = await fetch("/api/orders?PageSize=20&Page=1", {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("jwt_token")}`
      }
    })
    if(!response.ok) throw new Error("Error getting orders");
    // Return the full paginated response object
    return await response.json();
  }catch(err){
    console.error("Error fetching orders: " + err);
    return null;
  }
}

async function renderOrders() {
    const response = await getAllOrdersFromDB();
    const ORDERS_TABLE_BODY = document.querySelector("#orders-table tbody");

    // The actual list of orders is in the 'data' property of the response
    const orders = response?.data;

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
        ORDERS_TABLE_BODY.innerHTML = '<tr><td colspan="6" class="text-center">No orders found.</td></tr>';
        return;
    }

    ORDERS_TABLE_BODY.innerHTML = ""; // Clear existing content, including the example row

    for (const order of orders) {
        const row = `
            <tr>
                <td>${order.orderId}</td>
                <td>${order.customerName}</td>
                <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                <td>$${order.orderTotal.toFixed(2)}</td>
                <td><span class="badge bg-info text-dark">${order.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary">Details</button>
                </td>
            </tr>
        `;
        ORDERS_TABLE_BODY.innerHTML += row;
    }
}

//
//Customers
//

async function getAllCustomersFromDB(){
  try{
    const response = await fetch("/api/users", {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("jwt_token")}`
      }
    })
    if(!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        try {
            const errorBody = await response.text();
            console.error(`Error body: ${errorBody}`);
        } catch(e) {}
        throw new Error(`Error getting customers: ${response.status}`);
    }
    return await response.json();
  }catch(err){
    console.error("Error fetching customers:", err);
    return null;
  }
}

async function renderCustomers() {
    const customers = await getAllCustomersFromDB();
    const CUSTOMERS_TABLE_BODY = document.querySelector("#customers-table tbody");

    if (!CUSTOMERS_TABLE_BODY) return;

    if (!customers || !Array.isArray(customers) || customers.length === 0) {
        CUSTOMERS_TABLE_BODY.innerHTML = '<tr><td colspan="5" class="text-center">No customers found.</td></tr>';
        return;
    }

    CUSTOMERS_TABLE_BODY.innerHTML = "";

    customers.forEach(customer => {
        const row = `
            <tr>
                <td>${customer.id.substring(0, 8)}...</td>
                <td>${customer.userName || 'N/A'}</td>
                <td>${customer.email}</td>
                <td>${new Date(customer.registerDate).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary">View Orders</button>
                </td>
            </tr>
        `;
        CUSTOMERS_TABLE_BODY.innerHTML += row;
    });
}

//
// Tab switching logic for Admin Dashboard
//
function setupTabSwitching() {
    const links = {
        products: document.getElementById('products-link'),
        orders: document.getElementById('orders-link'),
        customers: document.getElementById('customers-link'),
    };

    const sections = {
        products: document.getElementById('products-section'),
        orders: document.getElementById('orders-section'),
        customers: document.getElementById('customers-section'),
    };

    function switchTab(tab) {
        // Deactivate all links and sections
        for (const key in links) {
            links[key].classList.remove('active');
            sections[key].classList.remove('active');
        }

        // Activate the selected tab
        links[tab].classList.add('active');
        sections[tab].classList.add('active');
    }

    links.products.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('products');
    });

    links.orders.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('orders');
    });

    links.customers.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('customers');
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
    renderOrders();
    renderCustomers();
    setupProductForm();
    setupTabSwitching();
});
