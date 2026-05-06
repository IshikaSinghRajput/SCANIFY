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
// function displayProducts() {
//     const table = document.getElementById("productTable");
//     const searchInput = document.getElementById("search");
//     const search = searchInput ? searchInput.value.toLowerCase() : "";

//     table.innerHTML = "";
//     let total = 0, soon = 0, expired = 0;

//     // --- NEW EMPTY STATE CHECK ---
//     if (userData.products.length === 0) {
//         table.innerHTML = `
//             <tr>
//                 <td colspan="5" style="text-align: center; color: #9ca3af; padding: 40px; font-style: italic;">
//                     You have not added any products.
//                 </div>
//                 </td>
//             </tr>`;
        
//         // Reset counts to 0
//         document.getElementById("totalCount").textContent = 0;
//         document.getElementById("soonCount").textContent = 0;
//         document.getElementById("expiredCount").textContent = 0;
//         return; 
//     }
//     // ------------------------------

//     userData.products.forEach((p, index) => {
//         const today = new Date();
//         const expiry = new Date(p.expiry);
//         const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

//         total++;

//         let status = "Active";
//         if (daysLeft < 0) {
//             status = "Expired";
//             expired++;
//         } else if (daysLeft <= 5) {
//             status = "Expiring Soon";
//             soon++;
//         }

//         if (
//             (currentFilter === "active" && daysLeft < 0) ||
//             (currentFilter === "expired" && daysLeft >= 0) ||
//             (currentFilter === "soon" && !(daysLeft <= 5 && daysLeft >= 0))
//         ) return;

//         if (!p.name.toLowerCase().includes(search)) return;

//         table.innerHTML += `
//         <tr>
//             <td>${status}</td>
//             <td>${p.name}</td>
//             <td>${p.expiry}</td>
//             <td>${daysLeft}</td>
//             <td>
//                 <div class="action-buttons">
//                     <button class="edit-btn" onclick="editProduct(${index})">✏️</button>
//                     <button class="delete-btn" onclick="deleteProduct(${index})">🗑</button>
//                 </div>
//             </td>
//         </tr>`;

//         handleAlerts(p, daysLeft);
//     });

//     document.getElementById("totalCount").textContent = total;
//     document.getElementById("soonCount").textContent = soon;
//     document.getElementById("expiredCount").textContent = expired;
// }

// Add an event listener to the search input so it filters as you type
document.getElementById("search").addEventListener("input", displayProducts);

function displayProducts() {
    const table = document.getElementById("productTable");
    const searchInput = document.getElementById("search");
    
    // 1. Get the search term
    const search = searchInput ? searchInput.value.toLowerCase() : "";

    table.innerHTML = "";
    let total = 0, soon = 0, expired = 0;

    if (userData.products.length === 0) {
        table.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #9ca3af; padding: 40px;">No products found.</td></tr>`;
        return; 
    }

    userData.products.forEach((p, index) => {
        // 2. Filter by Search Term First
        if (!p.name.toLowerCase().includes(search)) return;

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

        // 3. Filter by Sidebar Category (All/Active/Soon/Expired)
        if (
            (currentFilter === "active" && daysLeft < 0) ||
            (currentFilter === "expired" && daysLeft >= 0) ||
            (currentFilter === "soon" && !(daysLeft <= 5 && daysLeft >= 0))
        ) return;

        // 4. Render the row (which CSS turns into a card on mobile)
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
// function showNotification(message) {
//     const container = document.getElementById("notificationContainer");
    
//     // Always save to the history list
//     saveNotification(message);

//     // Only show visual popups and red dot AFTER initial load is stable
//     if (initialLoadComplete) {
//         if (container) {
//             const notif = document.createElement("div");
//             notif.className = "notification";
//             notif.textContent = message;
//             container.appendChild(notif);
//             setTimeout(() => notif.remove(), 3000);
//         }

//         const dot = document.getElementById("notif-dot");
//         if (dot) dot.style.display = "block";
//     }
// }

function showNotification(message) {
    saveNotification(message);

    if (initialLoadComplete) {
        // Desktop dot
        const dot = document.getElementById("notif-dot");
        if (dot) dot.style.display = "block";

        // Mobile dot (Add this line)
        const mobileDot = document.getElementById("notif-dot-mobile");
        if (mobileDot) mobileDot.style.display = "block";
    }
}

// function toggleNotifications() {
//     const panel = document.getElementById("notificationPanel");
//     const dot = document.getElementById("notif-dot");
    
//     panel.classList.toggle("hidden");

//     if (!panel.classList.contains("hidden")) {
//         if (dot) dot.style.display = "none";
//         displayNotificationHistory();
//     }
// }

// function toggleNotifications() {
//     const panel = document.getElementById("notificationPanel");
//     panel.classList.toggle("hidden");

//     if (!panel.classList.contains("hidden")) {
//         displayNotificationHistory();
        
//         // Mobile Specific: Prevent background body from scrolling when panel is open
//         if (window.innerWidth <= 768) {
//             document.body.style.overflow = "hidden";
//         }
//     } else {
//         document.body.style.overflow = "auto";
//     }
// }

// Update toggle to hide the dot when opened
function toggleNotifications() {
    const panel = document.getElementById("notificationPanel");
    const mobileDot = document.getElementById("notif-dot-mobile");
    const desktopDot = document.getElementById("notif-dot");
    
    panel.classList.toggle("hidden");

    if (!panel.classList.contains("hidden")) {
        if (mobileDot) mobileDot.style.display = "none";
        if (desktopDot) desktopDot.style.display = "none";
        displayNotificationHistory();
    }
}

// Update your close function too
function closeNotifications() {
    document.getElementById("notificationPanel").classList.add("hidden");
    document.body.style.overflow = "auto";
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

// function addProduct() {
//     const name = document.getElementById("productName").value;
//     const date = document.getElementById("expiryDate").value;
//     if (!name || !date) { alert("Fill all fields"); return; }
//     userData.products.push({ name, expiry: date });
//     saveData();
//     closeModal();
//     document.getElementById("productName").value = "";
//     document.getElementById("expiryDate").value = "";
// }

function deleteProduct(index) {
    userData.products.splice(index, 1);
    saveData();
}

// function editProduct(index) {
//     const newName = prompt("Enter new name:", userData.products[index].name);
//     const newDate = prompt("Enter new date:", userData.products[index].expiry);
//     if (newName && newDate) {
//         userData.products[index] = { name: newName, expiry: newDate };
//         saveData();
//     }
// }

// Open Edit Modal and fill data
function editProduct(index) {
    const product = userData.products[index];
    document.getElementById("editIndex").value = index;
    document.getElementById("editName").value = product.name;
    document.getElementById("editDate").value = product.expiry;
    
    document.getElementById("editProductModal").classList.remove("hidden");
}

function closeEditModal() {
    document.getElementById("editProductModal").classList.add("hidden");
}

// Handle the update logic
function updateProduct() {
    const index = document.getElementById("editIndex").value;
    const newName = document.getElementById("editName").value;
    const newDate = document.getElementById("editDate").value;

    if (!newName || !newDate) {
        // Instead of alert(), use a subtle text warning inside modal or console
        alert("Please fill all fields"); 
        return;
    }

    userData.products[index] = { name: newName, expiry: newDate };
    saveData();
    closeEditModal();
}

// Update your addProduct check too
function addProduct() {
    const name = document.getElementById("productName").value;
    const date = document.getElementById("expiryDate").value;
    const errorEl = document.getElementById("addError");

    // Check for empty fields
    if (!name || !date) {
        errorEl.textContent = "⚠ Please fill all fields!";
        errorEl.style.display = "block"; // Show the error
        
        // Optional: Shake the modal slightly for effect
        const modal = document.querySelector(".modal-content.glass");
        modal.style.animation = "shake 0.2s ease-in-out 0s 2";
        setTimeout(() => modal.style.animation = "", 400);
        
        return; 
    }

    // If valid, hide error and proceed
    errorEl.style.display = "none";
    userData.products.push({ name, expiry: date });
    saveData();
    closeModal();
    
    // Reset fields
    document.getElementById("productName").value = "";
    document.getElementById("expiryDate").value = "";
}

// Update your openModal function to clear previous errors
function openModal() {
    document.getElementById("addError").style.display = "none";
    document.getElementById("addProductModal").classList.remove("hidden");
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

//Responsive Design

function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('mobile-open');
}

function syncSearch(mobileInput) {
    // 1. Find the desktop search input
    const desktopSearch = document.getElementById("search");
    
    // 2. Sync the value to the desktop input (which the main logic uses)
    if (desktopSearch) {
        desktopSearch.value = mobileInput.value;
    }
    
    // 3. Trigger the display refresh
    displayProducts();
}