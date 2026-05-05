// SAFE INIT (wait for DOM)
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("authForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username")?.value.trim();
        const password = document.getElementById("password")?.value.trim();
        const emailField = document.getElementById("email"); // only exists in signup
        const error = document.getElementById("errorMsg");

        if (!username || !password) {
            error.textContent = "Please fill all fields!";
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];

        // 🧠 DETECT MODE
        const isSignup = emailField !== null;

        if (isSignup) {
            // 🔥 SIGNUP

            const email = emailField.value.trim();

            if (!email) {
                error.textContent = "Email is required!";
                return;
            }

            const exists = users.find(u => u.username === username);

            if (exists) {
                error.textContent = "Username already exists!";
                return;
            }

            users.push({ username, email, password });
            localStorage.setItem("users", JSON.stringify(users));

            // auto login
            localStorage.setItem("loggedInUser", username);

            window.location.href = "../DashBoard/dashboard.html";

        } else {
            // 🔐 LOGIN

            const user = users.find(u => u.username === username);

            if (!user) {
                error.textContent = "User not found!";
                return;
            }

            if (user.password !== password) {
                error.textContent = "Wrong password!";
                return;
            }

            // ✅ IMPORTANT (your dashboard depends on this)
            localStorage.setItem("loggedInUser", username);

            window.location.href = "../DashBoard/dashboard.html";
        }
    });

});