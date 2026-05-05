document.getElementById("signupForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    let users = JSON.parse(localStorage.getItem("users")) || [];

    // 1. Check if user exists in the main list
    if (users.find(u => u.username === username)) {
        alert("User already exists!");
        return;
    }

    // 2. Add to the main users list (for login validation)
    users.push({ username, email, password });
    localStorage.setItem("users", JSON.stringify(users));

    // 3. CRITICAL: Create the individual record the Dashboard expects
    // This is what prevents the "Empty Page" error
    const userProfile = {
        username: username,
        email: email,
        password: password,
        products: [] // Initialize with empty products array
    };
    
    // Save it under the username itself so dashboard.js can find it
    localStorage.setItem(username, JSON.stringify(userProfile));

    alert("Account created!");
    window.location.href = "login.html";
});