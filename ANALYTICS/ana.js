function goBack() {
    window.location.href = "../Dashboard/dashboard.html";
}

window.addEventListener("DOMContentLoaded", () => {
    const currentUser = localStorage.getItem("loggedInUser");

    if (!currentUser) {
        window.location.href = "../User/login.html";
        return;
    }

    const userData = JSON.parse(localStorage.getItem(currentUser)) || { products: [] };
    const products = userData.products;

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

    document.getElementById("total").textContent = total;
    document.getElementById("expired").textContent = expired;
    document.getElementById("soon").textContent = soon;
    document.getElementById("active").textContent = active;

    renderCharts(expired, soon, active);
});

function renderCharts(expired, soon, active) {
    // --- DOUGHNUT CHART ---
    new Chart(document.getElementById("pieChart"), {
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
            // Changed from 80% to 50% or 60% to make the ring thicker
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

    // --- BAR CHART ---
    new Chart(document.getElementById("barChart"), {
        type: "bar",
        data: {
            labels: ["Expired", "Soon", "Active"],
            datasets: [{
                data: [expired, soon, active],
                backgroundColor: "#39FF14",
                borderRadius: 5,
                // These two properties make the bars very thick
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