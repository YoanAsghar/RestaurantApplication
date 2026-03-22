async function verifyToken() {
    const token = localStorage.getItem("jwt_token");
    const adminLink = document.getElementById("admin-link");

    // Initially hide the admin link
    if (adminLink) {
        adminLink.style.display = 'none';
    }

    if (!token) {
        // No token, ensure admin link is hidden and exit
        return;
    }

    try {
        const response = await fetch("/api/auth/verify", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            localStorage.removeItem("jwt_token");
            if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
                window.location.href = "/";
            }
            return;
        }

        const data = await response.json();

        if (data.role === "Admin" && adminLink) {
            adminLink.style.display = 'block';
        }

    } catch (error) {
        localStorage.removeItem("jwt_token");
        if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
            window.location.href = "/";
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    verifyToken();
});
