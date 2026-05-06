const user = localStorage.getItem("loggedInUser");
let expiredItems = [];


if (!user) {
    window.location.href = "../User/login.html";
}

const userData = JSON.parse(localStorage.getItem(user)) || { products: [] };

let soonList = [];
let expiredList = [];
let sortedProducts = [...userData.products];

const today = new Date();

// Sort for suggestion
sortedProducts.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

userData.products.forEach(p => {
    const expiry = new Date(p.expiry);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysLeft >= 0 && daysLeft <= 3) {
        soonList.push(p.name);
    }

   if (daysLeft < 0) {
    expiredList.push(p.name);
    expiredItems.push(p.name);
}
});

// GREETING MESSAGE LOGIC 
document.addEventListener("DOMContentLoaded", () => {
    // 1. Get the current logged-in user key
    const userKey = localStorage.getItem("loggedInUser");
    
    // 2. Default name if something goes wrong
    let displayName = "User";

    if (userKey) {
        // 3. Find the user object in localStorage (like you do in dashboard.js)
        const userData = JSON.parse(localStorage.getItem(userKey));
        
        // Use the key itself as the name, or a 'name' property if you have one
        displayName = userKey; 
    }

    // 4. Inject the greeting with your custom catchphrase
    const greetingElement = document.getElementById("welcomeGreeting");
    if (greetingElement) {
        greetingElement.textContent = `Hey ${displayName}, let's save the money, save the products`;
    }
});

function openWasteModal() {
    const modal = document.getElementById("wasteModal");
    const list = document.getElementById("wasteList");
    const message = document.getElementById("aiMessage");

    modal.classList.remove("hidden");

    list.innerHTML = "";

    if (expiredItems.length === 0) {
        message.textContent = "🎉 No waste! You're doing great!";
        return;
    }

    // Sad AI Messages 😔
    const messages = [
        "Oops… these items didn’t make it 😔",
        "You forgot these items... let's improve next time 💔",
        "These deserved better 🥲",
        "Try using them earlier next time!"
    ];

    message.textContent =
        messages[Math.floor(Math.random() * messages.length)];

    expiredItems.forEach(item => {
        const li = document.createElement("li");
        li.textContent = "❌ " + item;
        list.appendChild(li);
    });
}

function closeWasteModal() {
    document.getElementById("wasteModal").classList.add("hidden");
}

// Update UI

// Expiring Soon
document.getElementById("soonText").textContent =
    soonList.length > 0
        ? soonList.join(", ")
        : "No products expiring soon";

// Expired
document.getElementById("expiredText").textContent =
    expiredList.length > 0
        ? expiredList.join(", ")
        : "No expired products";

// Suggestion
document.getElementById("suggestText").textContent =
    sortedProducts.length > 0
        ? "Use " + sortedProducts[0].name + " first"
        : "No products available";

// Waste Report
document.getElementById("wasteText").textContent =
    expiredList.length > 0
        ? expiredList.length + " items wasted"
        : "No waste detected";

// Back
function goBack() {
    window.location.href = "../DashBoard/dashboard.html";
}

