document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const error = document.getElementById("errorMsg");

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(u => u.username === username);

    if (!user) {
        error.textContent = "User not found!";
        return;
    }

    if (user.password !== password) {
        error.textContent = "Wrong password!";
        return;
    }

    localStorage.setItem("loggedInUser", username);

    window.location.href = "../DashBoard/dashboard.html";
});