function goBack() {
    window.location.href = "../Dashboard/dashboard.html";
}

window.addEventListener("DOMContentLoaded", () => {
    const currentUser = localStorage.getItem("loggedInUser");

    if (!currentUser) {
        window.location.href = "../User/login.html";
        return;
    }

    // 1. Get Data
    const userData = JSON.parse(localStorage.getItem(currentUser)) || { products: [] };
    const products = userData.products;

    // 2. Identify Elements
    const chartsDiv = document.getElementById("chartsContainer");
    const emptyStateDiv = document.getElementById("emptyState");
    const totalEl = document.getElementById("total");
    const expiredEl = document.getElementById("expired");
    const soonEl = document.getElementById("soon");
    const activeEl = document.getElementById("active");

    // 3. Handle Empty State Logic
  // 3. Handle Empty State Logic
    if (products.length === 0) {
        console.log("No products found - forcing empty state UI");

        if (chartsDiv) {
            chartsDiv.classList.add("force-hide");
        }
        
        if (emptyStateDiv) {
            emptyStateDiv.classList.add("show-me");
        }
        
        // Reset counts to 0
        const ids = ["total", "expired", "soon", "active"];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = "0";
        });
        return; // Stop the script here
    }

    // 4. If products exist, undo the hidden states
    if (chartsDiv) chartsDiv.classList.remove("force-hide");
    if (emptyStateDiv) emptyStateDiv.classList.remove("show-me");

    // 4. If products exist, show charts and hide empty message
    if (chartsDiv) chartsDiv.style.display = "flex";
    if (emptyStateDiv) emptyStateDiv.style.display = "none";

    // 5. Calculate Stats
    let total = 0, expired = 0, soon = 0, active = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    products.forEach(p => {
        const expiry = new Date(p.expiry);
        const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        total++;
        if (daysLeft < 0) expired++;
        else if (daysLeft <= 5) soon++;
        else active++;
    });

    // 6. Update Stats UI
    if (totalEl) totalEl.textContent = total;
    if (expiredEl) expiredEl.textContent = expired;
    if (soonEl) soonEl.textContent = soon;
    if (activeEl) activeEl.textContent = active;

    // 7. Render Charts
    renderCharts(expired, soon, active);
});

function renderCharts(expired, soon, active) {
    const pieCtx = document.getElementById("pieChart");
    const barCtx = document.getElementById("barChart");

    if (!pieCtx || !barCtx) return; // Safety check

    new Chart(pieCtx, {
        type: "doughnut",
        data: {
            labels: ["Expired", "Active", "Soon"],
            datasets: [{
                data: [expired, active, soon],
                backgroundColor: ["#1a2e1a", "#39FF14", "#22c55e"],
                borderColor: "#020617",
                borderWidth: 2,
            }]
        },
        options: {
            cutout: '60%', 
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: "#39FF14", usePointStyle: true, padding: 25 }
                }
            }
        }
    });

    new Chart(barCtx, {
        type: "bar",
        data: {
            labels: ["Expired", "Soon", "Active"],
            datasets: [{
                data: [expired, soon, active],
                backgroundColor: "#39FF14",
                borderRadius: 5,
                barPercentage: 0.9, 
                categoryPercentage: 0.8 
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: true,
                    grid: { color: "rgba(57, 255, 20, 0.1)" },
                    ticks: { color: "#39FF14" } 
                },
                x: { 
                    grid: { display: false },
                    ticks: { color: "#39FF14", font: { weight: 'bold' } } 
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}