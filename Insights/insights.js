const user = localStorage.getItem("loggedInUser");
let expiredItems = [];

if (!user) {
    window.location.href = "../User/login.html";
}

const userData = JSON.parse(localStorage.getItem(user)) || { products: [] };

const today = new Date();

let soonList = [];
let expiredList = [];
let sortedProducts = [...userData.products].sort(
    (a, b) => new Date(a.expiry) - new Date(b.expiry)
);

/* =========================
   PRODUCT ANALYSIS
========================= */
userData.products.forEach(product => {

    const expiry = new Date(product.expiry);
    const daysLeft = Math.ceil(
        (expiry - today) / (1000 * 60 * 60 * 24)
    );

    // Expiring Soon
    if (daysLeft >= 0 && daysLeft <= 3) {
        soonList.push(product.name);
    }

    // Expired
    if (daysLeft < 0) {
        expiredList.push(product.name);
        expiredItems.push(product.name);
    }
});

/* =========================
   GREETING MESSAGE
========================= */
document.addEventListener("DOMContentLoaded", () => {

    const greetingElement = document.getElementById("welcomeGreeting");

    if (!greetingElement) return;

    // Clean username
    const displayName =
        user.charAt(0).toUpperCase() + user.slice(1);

    // FIXED:
    // Using innerHTML instead of textContent
    // so old text never overlaps
    greetingElement.innerHTML = `
        <span class="hello-text">Hey</span>
        <span class="username">${displayName}</span>
        <span class="save-text">
            let's save the money,
            <span class="highlight">save the products</span>
        </span>
    `;
});

/* =========================
   WASTE MODAL
========================= */
function openWasteModal() {

    const modal = document.getElementById("wasteModal");
    const list = document.getElementById("wasteList");
    const message = document.getElementById("aiMessage");

    modal.classList.remove("hidden");

    list.innerHTML = "";

    if (expiredItems.length === 0) {

        message.textContent =
            "🎉 No waste! You're doing amazing!";

        return;
    }

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
    document
        .getElementById("wasteModal")
        .classList.add("hidden");
}

/* =========================
   UPDATE UI
========================= */

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
        ? `Use ${sortedProducts[0].name} first`
        : "No products available";

// Waste Report
document.getElementById("wasteText").textContent =
    expiredList.length > 0
        ? `${expiredList.length} items wasted`
        : "No waste detected";

/* =========================
   BACK BUTTON
========================= */
function goBack() {
    window.location.href =
        "../DashBoard/dashboard.html";
}