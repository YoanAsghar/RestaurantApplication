https://restaurantapplication-production-8d6b.up.railway.app/index.html

# FoodMart - Restaurant Application

FoodMart is a comprehensive web application for managing a restaurant or food mart, featuring a robust .NET-based backend and an interactive web-based frontend.

## 🚀 Features

### **User Authentication**
- JWT-based secure authentication.
- User registration and login functionality.
- Role-based access control (Admin and User).
- Automatic Admin role assignment for the first registered user.

### **Product Management**
- Complete CRUD operations for products.
- Products categorization and image support.
- Admin-only endpoints for adding and modifying products.

### **Shopping Cart**
- Persistent shopping cart for authenticated users.
- Add, update, and remove items from the cart.

### **Order Processing**
- Secure checkout process.
- Order history tracking.
- Status updates for orders.
- Email notifications upon order placement (using MailKit).

### **Frontend**
- Modern, responsive UI built with HTML, CSS, and jQuery.
- Admin dashboard for product and user management.
- Dynamic product listing and cart integration.

---

## 🛠️ Tech Stack

- **Backend:** ASP.NET Core 10.0 (Minimal APIs)
- **Database:** MySQL (via Entity Framework Core & Pomelo provider)
- **Authentication:** JWT (JSON Web Tokens)
- **Email Service:** MailKit
- **Frontend:** HTML5, CSS3, JavaScript (jQuery, Bootstrap)
- **Containerization:** Docker & Docker Compose
- **Documentation:** Swagger/OpenAPI

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [.NET 10.0 SDK](https://dotnet.microsoft.com/download)
- [MySQL Server](https://www.mysql.com/downloads/)
- [Docker](https://www.docker.com/products/docker-desktop) (Optional, for containerized deployment)

---

## ⚙️ Setup and Installation

### **Local Setup**

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd Restaurant-Application
    ```

2.  **Configure the Database:**
    Update the `DefaultConnection` string in `appsettings.json` with your MySQL server details.
    ```json
    "ConnectionStrings": {
      "DefaultConnection": "Server=localhost;Port=3306;Database=FoodMart;Uid=root;Pwd=your_password;"
    }
    ```

3.  **Configure Email Settings:**
    Update the `EmailSettings` in `appsettings.json` with your SMTP credentials.

4.  **Apply Migrations:**
    ```bash
    dotnet ef database update
    ```

5.  **Run the application:**
    ```bash
    dotnet run
    ```
    The application will be available at `http://localhost:5000` (or the port configured in your environment).

### **Docker Setup**

To run the entire stack (App + MySQL) using Docker:

1.  **Run Docker Compose:**
    ```bash
    docker-compose up --build
    ```
    The application will be accessible at `http://localhost:5000`.

---

## 📂 Project Structure

- `Program.cs`: Application entry point and service configuration.
- `Models/`: Data entities (User, Product, Cart, Order, etc.).
- `Routes/`: API endpoint definitions organized by module.
- `Data/`: Database context and migrations.
- `Middleware/`: Custom error handling and utility middlewares.
- `Services/`: External service integrations (e.g., MailKit).
- `wwwroot/`: Frontend static assets (HTML, JS, CSS, images).

---

## 📡 API Endpoints (Brief)

- **Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/verify`
- **Products:** `GET /api/products`, `POST /api/products`, `PUT /api/products/{id}`, `DELETE /api/products/{id}`
- **Cart:** `GET /api/cart`, `POST /api/cart/add`, `PUT /api/cart/update`, `DELETE /api/cart/item/{id}`
- **Orders:** `POST /api/orders`, `GET /api/orders/user`, `GET /api/orders/all` (Admin)

---

## 📄 License

This project is licensed under the MIT License.

What would you like to work on next?
