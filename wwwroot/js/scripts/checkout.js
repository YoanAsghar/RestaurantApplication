const checkout_form = document.getElementById("checkout_form");
const TABLE_BODY_USER_PRODUCTS = document.getElementById("user_products");
const checkout_button = document.getElementById("checkout-button");


async function GetUserCart(){
  const response = await fetch("api/cart", {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem("jwt_token")}`
    }
  });


  //If user has nothing in the cart take him to the home page
  if(response.status == 204){
    document.location.href = "../../index.html"
  }
   
  const data = await response.json();
  const cartItems = data.cartItems;

  cartItems.forEach(element => {
    TABLE_BODY_USER_PRODUCTS.innerHTML += `<tr id="table_element">
                        <td>${element.product.name}</td>
                        <td>${element.product.description}</td>
                        <td>${element.quantity}</td>
                        <td>$${element.product.price}</td>
                      </tr>`
  });
  
}

async function handleCheckout() {
    try {
        const response = await fetch('/api/orders/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("jwt_token")}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Checkout failed.');
        }

        alert('Order placed successfully!');

        // Re-render cart, which should now be empty
        document.location.href = "../../index.html"

    } catch (error) {
        console.error('Checkout error:', error);
        alert(`Error during checkout: ${error.message}`);
    }
}

checkout_form.addEventListener("submit", (e) => {
  e.preventDefault();
  handleCheckout();
})  

document.addEventListener("DOMContentLoaded", () => {
  GetUserCart();
})
