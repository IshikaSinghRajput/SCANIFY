// =============================
// 🔐 Auth Check & User Context
// =============================
const user = localStorage.getItem("loggedInUser");

if (!user) {
    window.location.href = "../User/login.html";
}

// Namespaced key to prevent data leaking between accounts
const notifKey = `notifications_${user}`;
let userData = JSON.parse(localStorage.getItem(user)) || { products: [] };
let notificationHistory = JSON.parse(localStorage.getItem(notifKey)) || [];

// =============================
// 🚀 Initial Load & Welcome Logic
// =============================
let initialLoadComplete = false;
let currentFilter = "all";
let notifiedProducts = new Set();

window.addEventListener("DOMContentLoaded", () => {
    // 1. Check for New User Welcome
    if (notificationHistory.length === 0) {
        const welcomeMsg = `Welcome to Scanify, ${user}! Let's start saving products.`;
        saveNotification(welcomeMsg);
        
        // Show red dot for the first time
        const dot = document.getElementById("notif-dot");
        if (dot) dot.style.display = "block";
    }

    // 2. Initial data load
    displayProducts();

    // 3. Silence "ghost" notifications for 2 seconds during refresh
    setTimeout(() => {
        initialLoadComplete = true;
    }, 2000);
});

// =============================
// 🔔 Notification Storage
// =============================
function saveNotification(message) {
    notificationHistory.unshift(message);
    localStorage.setItem(notifKey, JSON.stringify(notificationHistory));
}

// =============================
// 📊 Display Products
// =============================
function displayProducts() {
    const table = document.getElementById("productTable");
    const searchInput = document.getElementById("search");
    const search = searchInput ? searchInput.value.toLowerCase() : "";

    table.innerHTML = "";
    let total = 0, soon = 0, expired = 0;

    // --- NEW EMPTY STATE CHECK ---
    if (userData.products.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #9ca3af; padding: 40px; font-style: italic;">
                    You have not added any products.
                </div>
                </td>
            </tr>`;
        
        // Reset counts to 0
        document.getElementById("totalCount").textContent = 0;
        document.getElementById("soonCount").textContent = 0;
        document.getElementById("expiredCount").textContent = 0;
        return; 
    }
    // ------------------------------

    userData.products.forEach((p, index) => {
        const today = new Date();
        const expiry = new Date(p.expiry);
        const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        total++;

        let status = "Active";
        if (daysLeft < 0) {
            status = "Expired";
            expired++;
        } else if (daysLeft <= 5) {
            status = "Expiring Soon";
            soon++;
        }

        if (
            (currentFilter === "active" && daysLeft < 0) ||
            (currentFilter === "expired" && daysLeft >= 0) ||
            (currentFilter === "soon" && !(daysLeft <= 5 && daysLeft >= 0))
        ) return;

        if (!p.name.toLowerCase().includes(search)) return;

        table.innerHTML += `
        <tr>
            <td>${status}</td>
            <td>${p.name}</td>
            <td>${p.expiry}</td>
            <td>${daysLeft}</td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="editProduct(${index})">✏️</button>
                    <button class="delete-btn" onclick="deleteProduct(${index})">🗑</button>
                </div>
            </td>
        </tr>`;

        handleAlerts(p, daysLeft);
    });

    document.getElementById("totalCount").textContent = total;
    document.getElementById("soonCount").textContent = soon;
    document.getElementById("expiredCount").textContent = expired;
}
function handleAlerts(p, daysLeft) {
    let msg = "";
    let id = "";

    if (daysLeft === 1) { msg = `⚠️ ${p.name} expires tomorrow!`; id = `${p.name}_1`; }
    else if (daysLeft === 0) { msg = `🚨 ${p.name} expires today!`; id = `${p.name}_0`; }
    else if (daysLeft < 0) { msg = `❌ ${p.name} expired!`; id = `${p.name}_-1`; }

    if (msg && !notifiedProducts.has(id)) {
        showNotification(msg);
        showBrowserNotification("Scanify Alert", msg);
        notifiedProducts.add(id);
    }
}

// =============================
// 🔔 In-App Notification Logic
// =============================
function showNotification(message) {
    const container = document.getElementById("notificationContainer");
    
    // Always save to the history list
    saveNotification(message);

    // Only show visual popups and red dot AFTER initial load is stable
    if (initialLoadComplete) {
        if (container) {
            const notif = document.createElement("div");
            notif.className = "notification";
            notif.textContent = message;
            container.appendChild(notif);
            setTimeout(() => notif.remove(), 3000);
        }

        const dot = document.getElementById("notif-dot");
        if (dot) dot.style.display = "block";
    }
}

function toggleNotifications() {
    const panel = document.getElementById("notificationPanel");
    const dot = document.getElementById("notif-dot");
    
    panel.classList.toggle("hidden");

    if (!panel.classList.contains("hidden")) {
        if (dot) dot.style.display = "none";
        displayNotificationHistory();
    }
}

function displayNotificationHistory() {
    const list = document.getElementById("notificationList");
    const count = document.getElementById("notifCount");

    list.innerHTML = "";
    count.textContent = notificationHistory.length;

    notificationHistory.forEach(msg => {
        let color = "green";
        if (msg.includes("expired")) color = "red";
        else if (msg.includes("tomorrow")) color = "yellow";

        list.innerHTML += `
            <div class="notif-item">
                <div class="notif-dot ${color}"></div>
                <div>${msg}</div>
            </div>`;
    });
}

function clearNotifications() {
    notificationHistory = [];
    localStorage.setItem(notifKey, JSON.stringify(notificationHistory));
    displayNotificationHistory();
    const dot = document.getElementById("notif-dot");
    if (dot) dot.style.display = "none";
}

// =============================
// 📦 Data Management
// =============================
function saveData() {
    localStorage.setItem(user, JSON.stringify(userData));
    displayProducts();
}

function addProduct() {
    const name = document.getElementById("productName").value;
    const date = document.getElementById("expiryDate").value;
    if (!name || !date) { alert("Fill all fields"); return; }
    userData.products.push({ name, expiry: date });
    saveData();
    closeModal();
    document.getElementById("productName").value = "";
    document.getElementById("expiryDate").value = "";
}

function deleteProduct(index) {
    userData.products.splice(index, 1);
    saveData();
}

function editProduct(index) {
    const newName = prompt("Enter new name:", userData.products[index].name);
    const newDate = prompt("Enter new date:", userData.products[index].expiry);
    if (newName && newDate) {
        userData.products[index] = { name: newName, expiry: newDate };
        saveData();
    }
}

// =============================
// 🌐 Utilities & Nav
// =============================
function filterProducts(type) { currentFilter = type; displayProducts(); }

function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "../User/login.html";
}

function goToAnalytics() { window.location.href = "../ANALYTICS/ana.html"; }
function goToInsights() { window.location.href = "../Insights/insights.html"; }
function closeNotifications() { document.getElementById("notificationPanel").classList.add("hidden"); }

function showBrowserNotification(title, message) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body: message });
    }
}

function openModal() { document.getElementById("addProductModal").classList.remove("hidden"); }
function closeModal() { document.getElementById("addProductModal").classList.add("hidden"); }